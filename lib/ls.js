"use strict";

/* eslint-disable no-magic-numbers */

const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const ck = require("chalker");
const common = require("./common");
const needle = require("needle");

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

  async remote(proxy, verifyssl) {
    try {
      const versions = await this.getRemote(proxy, verifyssl);
      _.each(versions, version => {
        common.log(version);
      });
    } catch (err) {
      common.log("error listing remote versions", err);
    }
  },

  async getRemote(proxy, verifyssl) {
    const options = {
      proxy,
      rejectUnauthorized: verifyssl
    };

    const resp = await needle("get", "http://nodejs.org/dist/", options);
    const versions = common.sortVersions(
      _.uniq(
        _.filter(resp.body.match(/v[0-9]+.[0-9]+.[0-9]+/gi), version => {
          return /^(v0.[0-4].[0-9]+)|(v0.5.0)$/i.test(version) === false;
        })
      )
    );

    return versions;
  }
};
