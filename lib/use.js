var fs = require("fs"),
  path = require("path"),
  common = require("./common");

module.exports = function(ver, ignoreTmp) {
  const { version, nodeDir } = common.findNodeVersion(ver);

  if (ignoreTmp !== true) {
    common.resetNvmPaths();
    common.setNvmUsePath(nodeDir);
    process.env.NVM_USE = version;
    common.createEnvironmentTmp();
  }

  return { version, nodeDir };
};
