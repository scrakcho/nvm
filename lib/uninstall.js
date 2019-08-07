"use strict";

const rmdir = require("rmdir");
const common = require("./common");
const ck = require("chalker");

module.exports = function(ver) {
  const { version, nodeDir } = common.findNodeVersion(ver);

  if (!common.dirHasNodeBin(nodeDir)) {
    common.log("%s version is not installed yet", version);
    common.exit(1);
  }

  if (process.env.NVM_USE === version) {
    common.log(ck`<red>Cannot uninstall currently active node version ${version}</>`);
    common.exit(1);
  }

  const linkVersion = common.findLinkVersion();

  if (linkVersion === version) {
    common.log(ck`<red>Cannot uninstall currently linked node version ${version}</>`);
    common.exit(1);
  }

  rmdir(nodeDir, err => {
    common.log("Node %s removed %s", version, err ? "failed" : "successfully");
  });
};
