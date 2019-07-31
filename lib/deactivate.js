"use strict";

const common = require("./common");

module.exports = function() {
  common.resetNvmPaths();

  delete process.env.NVM_USE;

  common.setNvmLinkPath();

  common.createEnvironmentTmp();
};
