"use strict";

const fs = require("fs");
const path = require("path");
const rmdir = require("rmdir");
const common = require("./common");

module.exports = function(version) {
  var nodeDir = common.getNodeDir(version);
  version = common.replaceVersion(version);
  if (fs.existsSync(path.join(nodeDir, "node.exe")) === false) {
    console.log("%s version is not installed yet", version);
    process.exit(1);
  }
  if (process.env.NVM_USE === version) {
    console.log("Cannot uninstall currently-active Node version %s", version);
    process.exit(1);
  }

  rmdir(nodeDir, function(err, dirs, files) {
    console.log("Node %s removed %s", version, err ? "failed" : "successfully");
  });
};
