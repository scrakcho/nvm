"use strict";

const rmdir = require("rmdir");
const common = require("./common");

module.exports = function() {
  rmdir(common.getNvmCacheDir(), function(err, dirs, files) {
    console.log("stale local caches removed %s", err ? "failed" : "successfully");
  });
};
