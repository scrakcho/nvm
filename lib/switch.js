"use strict";

const os = require("os");
const Fs = require("fs");
const path = require("path");
const common = require("./common");
const mkdirp = require("mkdirp");

module.exports = function(ver) {
  if (!process.env.NVM_LINK) {
    console.error("can't switch because NVM_LINK is not defined");
    process.exit(1);
  }

  const { version, nodeDir } = common.findNodeVersion(ver);

  const link = common.getNvmLinkDir();

  try {
    if (Fs.existsSync(link)) {
      Fs.unlinkSync(link);
    } else {
      const baseDir = path.dirname(link);
      if (!Fs.existsSync(baseDir)) {
        mkdirp.sync(baseDir);
      }
    }
    Fs.symlinkSync(nodeDir, link, "junction");

    // set autoexec.cmd for cmd.exe for linked version

    Fs.writeFileSync(
      path.join(os.homedir(), "autoexec.cmd"),
      `@echo off
SET "PATH=${link}${path.delimiter}%PATH%"
`
    );

    // set powershell autoexec for linked version
    const powerShellUserProfile = path.join(
      os.homedir(),
      "Documents",
      "WindowsPowerShell",
      "profile.ps1"
    );

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

    process.env.NVM_AUTO_USE = version;

    if (!process.env.NVM_USE) {
      common.setNvmLinkPath();
    }
    common.createEnvironmentTmp();
  } catch (err) {
    console.error(`switch to version ${version} failed`, err);
    process.exit(1);
  }
};
