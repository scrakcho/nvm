"use strict";

const rmdir = require("rmdir");
const common = require("./common");

module.exports = function() {
  rmdir(common.getNvmCacheDir(), err => {
    common.log("stale local caches removed %s", err ? "failed" : "successfully");
  });
};
