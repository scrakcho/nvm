"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
  makeNodeDistName(version) {
    if (os.arch().toLowerCase() === "x64") {
      return "node-" + version + "-win-x64";
    } else {
      return "node-" + version + "-win-x86";
    }
  },

  makeNodeDistFileName(version) {
    return this.makeNodeDistName(version) + ".zip";
  },

  dirHasNodeBin(dir) {
    const nodeExe = path.join(dir, "node.exe");
    return fs.existsSync(nodeExe);
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
    fs.writeFileSync(
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
    fs.writeFileSync(
      filePath,
      `$Env:NVM_USE="${process.env.NVM_USE || ""}"
$Env:Path="${process.env.PATH}"
${this.setAutoexec()}
`
    );
  }
};
