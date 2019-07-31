"use strict";

const Fs = require("fs");
const use = require("./use");
const common = require("./common");
const ck = require("chalker");

module.exports = function() {
  if (!process.env.NVM_LINK) {
    common.log(ck`<red>can't switch-deactivate because NVM_LINK is not defined</>`);
    common.exit(1);
  }

  const link = common.getNvmLinkDir();

  try {
    if (Fs.existsSync(link)) {
      Fs.unlinkSync(link);
    }

    process.env.NVM_AUTO_REMOVE = "true";

    if (process.env.NVM_USE) {
      use(process.env.NVM_USE);
    } else {
      common.resetNvmPaths();
      common.createEnvironmentTmp();
    }
  } catch (err) {
    common.log(ck`<red>switch-deactivate failed</>`, err);
    common.exit(1);
  }
};
