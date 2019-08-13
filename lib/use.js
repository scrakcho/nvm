"use strict";

const common = require("./common");

module.exports = async function(ver, ignoreTmp) {
  const { version, nodeDir } = await common.findNodeVersion(ver);

  if (ignoreTmp !== true) {
    await common.resetNvmPaths();
    common.setNvmUsePath(nodeDir);
    process.env.NVM_USE = version;
    await common.createEnvironmentTmp();
  }

  return { version, nodeDir };
};
