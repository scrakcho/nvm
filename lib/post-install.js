"use strict";

const common = require("./common");
const ck = require("chalker");

module.exports = async function(ver) {
  const inVer = ver || (await common.getActiveVersion());

  if (!inVer) {
    common.log(
      ck`<red>
No node.js version given and unable to determine a linked or default node.js version.
You must provide a version to run post-install.
</>`
    );
    common.exit(1);
  }

  const { version } = await common.findNodeVersion(inVer);

  try {
    common.log(ck`<green>Invoking post-install script for node.js version ${version}</>`);
    await common.createEnvironmentTmp(null, common.getSetInstallEnvScript(version));
  } catch (err) {
    common.log(ck`<red>Invoking post-install script failed</>`, err);
    common.exit(1);
  }
};
