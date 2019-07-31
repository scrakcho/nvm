"use strict";

/* eslint-disable max-statements */

const Fs = require("fs");
const path = require("path");
const common = require("./common");
const mkdirp = require("mkdirp");
const ck = require("chalker");

module.exports = function(ver) {
  if (!process.env.NVM_LINK) {
    common.log(ck`<red>can't switch because NVM_LINK is not defined</>`);
    common.exit(1);
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

    const nodeBinDir = common.getNodeBinDir(nodeDir);
    Fs.symlinkSync(nodeBinDir, link, "junction");

    common.setNvmLinkAutoExec(link);

    process.env.NVM_AUTO_USE = version;

    if (!process.env.NVM_USE) {
      common.setNvmLinkPath();
    }
    common.createEnvironmentTmp();
  } catch (err) {
    common.log(ck`<red>switch to version ${version} failed</>`, err);
    common.exit(1);
  }
};
