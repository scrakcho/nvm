"use strict";

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

  const link = process.env.NVM_LINK;

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
    if (!process.env.NVM_USE) {
      common.setNvmLinkPath();
      common.createEnvironmentTmp();
    }
  } catch (err) {
    console.error(`switch to version ${version} failed`, err);
    process.exit(1);
  }
};
