"use strict";

/* eslint-disable no-magic-numbers */

const _ = require("lodash");
const path = require("path");
const ck = require("chalker");
const common = require("./common");

module.exports = {
  local() {
    const versions = common.findLocalVersions();
    const linkVersion = common.findLinkVersion();
    const link = common.getNvmLinkDir();

    _.each(versions, version => {
      if (version === path.basename(link)) {
        return;
      }
      let linked = "";
      if (linkVersion === version) {
        linked = ck`(<magenta>linked</>)`;
      }
      if (process.env.NVM_USE === version) {
        common.log(ck`<green>* ${version}</> ${linked}`);
      } else {
        common.log(version, linked);
      }
    });
  },

  async remote(proxy, verifyssl, lts) {
    try {
      const versions = await common.getRemoteFromJson(proxy, verifyssl, lts);
      _.each(versions, version => {
        common.log(version);
      });
    } catch (err) {
      common.log("error listing remote versions", err);
    }
  }
};
