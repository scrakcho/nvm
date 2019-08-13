"use strict";

const common = require("./common");

module.exports = async function() {
  await common.resetNvmPaths();

  delete process.env.NVM_USE;

  await common.setNvmLinkPath();

  await common.createEnvironmentTmp();
};
