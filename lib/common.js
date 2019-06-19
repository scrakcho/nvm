"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
  replaceVersion: function(version) {
    return /^v/i.test(version) ? version.toLowerCase() : "v" + version;
  },

  getHomeDir() {
    return os.homedir();
  },

  getBaseDir: function() {
    return process.env.NVM_HOME || path.join(this.getHomeDir(), "nvm");
  },

  getNvmCacheDir: function() {
    return path.join(this.getBaseDir(), "cache");
  },

  getNvmDir: function() {
    return path.join(this.getBaseDir(), "nodejs");
  },

  getNodeDir: function(version) {
    return path.join(this.getNvmDir(), this.replaceVersion(version));
  },

  resetNvmPaths() {
    const paths = process.env.PATH.split(";").filter(x => {
      if (x.startsWith(process.env.NVM_HOME) || x === process.env.NVM_LINK) {
        return false;
      }
      // remove any path that contains node.exe (Windows)
      const nodeExe = path.join(x, "node.exe");
      return !fs.existsSync(nodeExe);
    });
    // update path with nvm's bin
    process.env.PATH = paths.concat(path.join(process.env.NVM_HOME, "bin")).join(";");
  },

  setNvmUsePath(nodeDir) {
    process.env.PATH = [nodeDir]
      .concat(process.env.PATH.split(";"))
      .filter(x => x)
      .join(";");
  },

  setNvmLinkPath() {
    const link = process.env.NVM_LINK;
    if (link && fs.existsSync(link)) {
      process.env.PATH = [link]
        .concat(process.env.PATH.split(";"))
        .filter(x => x)
        .join(";");
    }
  },

  createEnvironmentTmp: function(filePath) {
    if (process.env.NVM_POWERSHELL) {
      return this.createEnvironmentTmpPS(filePath);
    }

    filePath = filePath || path.join(os.tmpdir(), "nvm_env.cmd");
    fs.writeFileSync(
      filePath,
      `@ECHO OFF
SET "NVM_USE=${process.env.NVM_USE || ""}"
SET "PATH=${process.env.PATH}"
`
    );
  },

  createEnvironmentTmpPS(filePath) {
    filePath = filePath || path.join(os.tmpdir(), "nvm_env.ps1");
    fs.writeFileSync(
      filePath,
      `$Env:NVM_USE="${process.env.NVM_USE || ""}"
$Env:Path="${process.env.PATH}"
`
    );
  },

  findNodeVersion(ver) {
    const version = this.replaceVersion(ver);
    const nodeDir = this.getNodeDir(version);

    if (fs.existsSync(nodeDir) === false) {
      console.log("node.js %s version is not installed yet", version);
      process.exit(1);
    }

    return { version, nodeDir };
  }
};
