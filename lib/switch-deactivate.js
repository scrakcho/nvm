"use strict";

const opfs = require("opfs");
const use = require("./use");
const common = require("./common");
const ck = require("chalker");

module.exports = async function() {
  if (!process.env.NVM_LINK) {
    common.log(ck`<red>can't switch-deactivate because NVM_LINK is not defined</>`);
    common.exit(1);
  }

  const link = common.getNvmLinkDir();

  try {
    if (await common._exists(link)) {
      await opfs.unlink(link);
    }

    process.env.NVM_AUTO_REMOVE = "true";

    if (process.env.NVM_USE) {
      await use(process.env.NVM_USE);
    } else {
      await common.resetNvmPaths();
      await common.createEnvironmentTmp();
    }
  } catch (err) {
    common.log(ck`<red>switch-deactivate failed</>`, err);
    common.exit(1);
  }
};
