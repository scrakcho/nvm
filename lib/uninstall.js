"use strict";

const rmdir = require("rmdir");
const common = require("./common");

module.exports = function(ver) {
  const { version, nodeDir } = common.findNodeVersion(ver);

  if (!common.dirHasNodeBin(nodeDir)) {
    common.log("%s version is not installed yet", version);
    common.exit(1);
  }

  if (process.env.NVM_USE === version) {
    common.log("Cannot uninstall currently-active Node version %s", version);
    common.exit(1);
  }

  rmdir(nodeDir, err => {
    common.log("Node %s removed %s", version, err ? "failed" : "successfully");
  });
};
