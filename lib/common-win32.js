"use strict";

/* eslint-disable no-magic-numbers */

const Fs = require("fs");
const os = require("os");
const path = require("path");
const mkdirp = require("mkdirp");

module.exports = {
  // Workaround for pesky little issue with Windows and Node.js
  // It seems trying to rename a dir/file immediately after it's generated
  // could fail with EPERM and retrying again goes through.
  async rename(fromFile, toFile, retryCount = 0) {
    try {
      await this._rename(fromFile, toFile);
    } catch (err) {
      if (err.code !== "EPERM" || retryCount >= 5) {
        throw err;
      }
      await this.delay(50);
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

  dirHasNodeBin(dir) {
    const nodeExe = path.join(dir, "node.exe");
    return Fs.existsSync(nodeExe);
  },

  setAutoexec() {
    const regPath = "HKCU\\Software\\Microsoft\\Command Processor";
    const autoExec = "%USERPROFILE%\\autoexec.cmd";

    if (process.env.NVM_AUTO_USE) {
      return `reg.exe add "${regPath}" /t REG_SZ /v AutoRun /d "${autoExec}" /f`;
    } else if (process.env.NVM_AUTO_REMOVE) {
      return `reg.exe DELETE "${regPath}" /v AutoRun /f`;
    }

    return "";
  },

  createEnvironmentTmp(filePath) {
    if (process.env.NVM_POWERSHELL) {
      return this.createEnvironmentTmpPS(filePath);
    }

    filePath = filePath || path.join(os.tmpdir(), "nvm_env.cmd");
    return Fs.writeFileSync(
      filePath,
      `@ECHO OFF
SET "NVM_USE=${process.env.NVM_USE || ""}"
SET "PATH=${process.env.PATH}"
${this.setAutoexec()}
`
    );
  },

  createEnvironmentTmpPS(filePath) {
    filePath = filePath || path.join(os.tmpdir(), "nvm_env.ps1");
    Fs.writeFileSync(
      filePath,
      `$Env:NVM_USE="${process.env.NVM_USE || ""}"
$Env:Path="${process.env.PATH}"
${this.setAutoexec()}
`
    );
  },

  setNvmUsePath(nodeDir) {
    process.env.PATH = [nodeDir]
      .concat(process.env.PATH.split(path.delimiter))
      .filter(x => x)
      .join(path.delimiter);
  },

  setNvmLinkAutoExec(link) {
    // set autoexec.cmd for cmd.exe for linked version

    Fs.writeFileSync(
      path.join(os.homedir(), "autoexec.cmd"),
      `@echo off
SET "PATH=${link}${path.delimiter}%PATH%"
    `
    );

    // set powershell autoexec for linked version
    const powerShellDir = path.join(os.homedir(), "Documents", "WindowsPowerShell");
    const powerShellUserProfile = path.join(powerShellDir, "profile.ps1");

    mkdirp.sync(powerShellDir);
    const psPath = `$Env:Path="${link}${path.delimiter}$Env:Path"`;
    let psData = "";

    if (Fs.existsSync(powerShellUserProfile)) {
      psData = Fs.readFileSync(powerShellUserProfile, "utf8");
    }

    const updatePsData = psData
      .split("\n")
      .filter(x => x !== psPath)
      .concat(psPath);

    Fs.writeFileSync(powerShellUserProfile, updatePsData.join("\n"));
  }
};
