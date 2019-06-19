"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const posix = require("./common-posix");
const win32 = require("./common-win32");

const platformCommon = os.platform() === "win32" ? win32 : posix;

const common = {
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
    const paths = process.env.PATH.split(path.delimiter).filter(x => {
      if (x.startsWith(process.env.NVM_HOME) || x === process.env.NVM_LINK) {
        return false;
      }
      // remove any path that contains node executable
      return !this.dirHasNodeBin(x);
    });
    // update path with nvm's bin
    process.env.PATH = paths.concat(path.join(process.env.NVM_HOME, "bin")).join(path.delimiter);
  },

  setNvmUsePath(nodeDir) {
    process.env.PATH = [nodeDir]
      .concat(process.env.PATH.split(path.delimiter))
      .filter(x => x)
      .join(path.delimiter);
  },

  setNvmLinkPath() {
    const link = process.env.NVM_LINK;
    if (link && fs.existsSync(link)) {
      process.env.PATH = [link]
        .concat(process.env.PATH.split(path.delimiter))
        .filter(x => x)
        .join(path.delimiter);
    }
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

module.exports = Object.assign(common, platformCommon);
