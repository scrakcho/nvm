"use strict";

const common = require("./common");
const ck = require("chalker");
const opfs = require("opfs");

module.exports = async function(ver, opts) {
  const { version, nodeDir } = await common.findNodeVersion(ver, !opts.hasOwnProperty("latest"));

  if (process.env.NVM_USE === version) {
    common.log(ck`<red>Cannot uninstall currently active node version ${version}</>`);
    common.exit(1);
  }

  const linkVersion = await common.findLinkVersion();

  if (linkVersion === version) {
    common.log(ck`<red>Cannot uninstall currently linked node version ${version}</>`);
    common.exit(1);
  }

  try {
    common.log(ck`<yellow>Removing node.js version ${version}</>`);
    await opfs.$.rimraf(nodeDir);
    common.log(`Removed node.js version ${version}`);
  } catch (err) {
    common.log(ck`<red>Removed node.js version ${version} failed</>\n`, err);
  }
};
