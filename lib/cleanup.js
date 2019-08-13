"use strict";

const opfs = require("opfs");
const common = require("./common");

module.exports = async function() {
  try {
    await opfs.$.rimraf(common.getNvmCacheDir());
    common.log("stale local caches removed");
  } catch (err) {
    common.log("cleanup failed", err);
  }
};
