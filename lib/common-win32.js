"use strict";

/* eslint-disable no-magic-numbers */

const os = require("os");
const path = require("path");
const xaa = require("xaa");
const opfs = require("opfs");

const CMD_NVM_AUTO_RUN = "nvm-auto-run.cmd";

module.exports = {
  // Workaround for pesky little issue with Windows and Node.js
  // It seems trying to rename a dir/file immediately after it's generated
  // could fail with EPERM and retrying again goes through.
  async rename(fromFile, toFile, retryCount = 0) {
    try {
      await opfs.rename(fromFile, toFile);
    } catch (err) {
      if (err.code !== "EPERM" || retryCount >= 5) {
        throw err;
      }
      await xaa.delay(50);
      await this.rename(fromFile, toFile, retryCount + 1);
    }
  },

  getNodeBinDir(nodeDir) {
    return nodeDir;
  },

  makeNodeDistName(version) {
    if (os.arch().toLowerCase() === "x64") {
      return `node-${version}-win-x64`;
    } else {
      return `node-${version}-win-x86`;
    }
  },

  cacheFileName() {
    return "node.zip";
  },

  makeNodeDistFileName(version) {
    return `${this.makeNodeDistName(version)}.zip`;
  },

  async dirHasNodeBin(dir) {
    const nodeExe = path.join(dir, "node.exe");
    return await this._exists(nodeExe);
  },

  setAutoexec() {
    const regPath = "HKCU\\Software\\Microsoft\\Command Processor";
    const autoExec = `%NVM_HOME%\\${CMD_NVM_AUTO_RUN}`;

    let cmd = "";
    if (process.env.NVM_LINK_VERSION) {
      cmd = `reg.exe add "${regPath}" /t REG_SZ /v AutoRun /d "${autoExec}" /f`;
    } else if (process.env.NVM_UNLINK_VERSION) {
      cmd = `reg.exe DELETE "${regPath}" /v AutoRun /f`;
    }

    return cmd;
  },

  getSetInstallEnvScript(version) {
    if (process.env.NVM_POWERSHELL) {
      return `$Env:NVM_INSTALL="${version}"\r
$Env:Path="${process.env.PATH}"\r
`;
    } else {
      return `@ECHO OFF\r
SET "NVM_INSTALL=${version}"\r
SET "PATH=${process.env.PATH}"\r
`;
    }
  },

  getDefaultEnvScript() {
    if (process.env.NVM_POWERSHELL) {
      return `$Env:NVM_USE="${process.env.NVM_USE || ""}"\r
$Env:Path="${process.env.PATH}"\r
${this.setAutoexec()}\r
`;
    } else {
      return `@ECHO OFF\r
SET "NVM_USE=${process.env.NVM_USE || ""}"\r
SET "PATH=${process.env.PATH}"\r
${this.setAutoexec()}\r
`;
    }
  },

  async createEnvironmentTmp(filePath, content) {
    content = content || this.getDefaultEnvScript();
    // nvm.ps1 should set this env
    const filename = this.getEnvFile(process.env.NVM_POWERSHELL ? ".ps1" : ".cmd");

    filePath = filePath || path.join(this.getTmpdir(), filename);
    return await opfs.writeFile(filePath, content);
  },

  setNvmUsePath(nodeDir) {
    process.env.PATH = [nodeDir]
      .concat(process.env.PATH.split(path.delimiter))
      .filter(x => x)
      .join(path.delimiter);
  },

  nvmPsProfile() {
    return path.join(this.getBaseDir(), "nvm-powershell-profile");
  },

  async savePsProfile(file) {
    await opfs.writeFile(this.nvmPsProfile(), file);
  },

  async getPsProfile() {
    if (process.env.NVM_PSPROFILE) {
      await this.savePsProfile(process.env.NVM_PSPROFILE);
      return process.env.NVM_PSPROFILE;
    }

    const profile = await xaa.try(
      async () => {
        return (await opfs.readFile(this.nvmPsProfile(), "utf8")).trim();
      },
      // doesn't work if user's running nvm link in cmd.exe, so fallback to homedir
      // doc here: https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-5.1
      path.join(os.homedir(), "Documents", "WindowsPowerShell", "Profile.ps1")
    );

    return profile;
  },

  async setNvmLinkAutoExec(linkPath) {
    // set powershell autoexec for linked version
    // nvm.ps1 should've set NVM_PSPROFILE
    const profileFile = await this.getPsProfile();
    const powerShellDir = path.dirname(profileFile);

    await opfs.$.mkdirp(powerShellDir);
    const comment = "# Setup path for nvm linked version at the front to make sure it's used";
    const psPath = `$Env:Path="${linkPath}${path.delimiter}$Env:Path"`
    const psSetPath = `if (-not (Test-Path Env:NVM_USE)) {${psPath}}`
    const psExist = await this._exists(profileFile);
    let psData = [];

    if (psExist) {
      psData = (await opfs.readFile(profileFile, "utf8"))
        .replace(/\r/g, "")
        .split("\n")
        .filter(x => !x.includes(psPath) && x !== comment);
    }

    if (process.env.NVM_LINK_VERSION) {
      // set autoexec.cmd for cmd.exe for linked version
      await opfs.writeFile(
        path.join(this.getBaseDir(), CMD_NVM_AUTO_RUN),
        `@echo off\r
IF NOT "%NVM_USE%"=="" GOTO END\r
REM Setup path for nvm linked version at the front to make sure it's used\r
SET "PATH=${linkPath}${path.delimiter}%PATH%"\r
:END\r

`
      );

      psData = psData.concat(comment, psSetPath);
    }

    if (psData.length > 0) {
      await opfs.writeFile(profileFile, psData.join("\r\n"));
    } else if (psExist) {
      xaa.try(() => opfs.unlink(profileFile));
    }
  }
};
