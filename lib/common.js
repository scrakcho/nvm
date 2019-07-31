"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const posix = require("./common-posix");
const win32 = require("./common-win32");

const platformCommon = os.platform() === "win32" ? win32 : posix;

const common = {
  exit(code) {
    process.exit(code); // eslint-disable-line
  },

  log(...args) {
    console.log(...args); // eslint-disable-line
  },

  replaceVersion(version) {
    version = version.toLowerCase();
    return /^v/i.test(version) ? version : `v${version}`;
  },

  getHomeDir() {
    return os.homedir();
  },

  getBaseDir() {
    return process.env.NVM_HOME || path.join(this.getHomeDir(), "nvm");
  },

  getNvmLinkDir() {
    return process.env.NVM_LINK || path.join(this.getBaseDir(), "nodejs", "bin");
  },

  getNvmCacheDir() {
    return path.join(this.getBaseDir(), "cache");
  },

  getNvmDir() {
    return path.join(this.getBaseDir(), "nodejs");
  },

  getNodeDir(version) {
    return path.join(this.getNvmDir(), this.replaceVersion(version));
  },

  resetNvmPaths() {
    const baseDir = this.getBaseDir();
    const linkDir = this.getNvmLinkDir();
    const paths = process.env.PATH.split(path.delimiter).filter(x => {
      if (x.startsWith(baseDir) || x === linkDir) {
        return false;
      }
      // remove any path that contains node executable
      return !this.dirHasNodeBin(x);
    });
    // update path with nvm's bin
    process.env.PATH = paths.concat(path.join(baseDir, "bin")).join(path.delimiter);
  },

  setNvmUsePath(nodeDir) {
    process.env.PATH = [path.join(nodeDir, "bin")]
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
      this.log("node.js %s version is not installed yet", version);
      common.exit(1); // eslint-disable-line
    }

    return { version, nodeDir };
  }
};

module.exports = Object.assign(common, platformCommon);
