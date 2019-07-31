"use strict";

/* eslint-disable no-magic-numbers */

const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const ck = require("chalker");
const common = require("./common");
const needle = require("needle");

module.exports = {
  sort(versions) {
    const _sort = (left, right, index) => {
      if (Number(left[index]) === Number(right[index])) {
        return index === 2 ? 0 : _sort(left, right, index + 1);
      }
      return Number(left[index]) > Number(right[index]) ? 1 : -1;
    };

    if (_.size(versions) <= 0 || _.isArray(versions) === false) {
      return versions;
    }

    return versions.sort((left, right) => {
      return _sort(left.substr(1).split("."), right.substr(1).split("."), 0);
    });
  },

  local() {
    const nvmDir = common.getNvmDir();
    let versions = [];

    if (fs.existsSync(nvmDir) && fs.lstatSync(nvmDir).isDirectory()) {
      versions = this.sort(fs.readdirSync(nvmDir));
    }

    let linkVersion;
    const link = common.getNvmLinkDir();
    if (link && fs.existsSync(link)) {
      linkVersion = fs.readlinkSync(link).match(/(v[0-9]+\.[0-9]+\.[0-9]+)/)[0];
    }

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
    const options = {
      proxy,
      rejectUnauthorized: verifyssl
    };
    try {
      const resp = await needle("get", "http://nodejs.org/dist/", options);
      const versions = this.sort(
        _.uniq(
          _.filter(resp.body.match(/v[0-9]+.[0-9]+.[0-9]+/gi), version => {
            return /^(v0.[0-4].[0-9]+)|(v0.5.0)$/i.test(version) === false;
          })
        )
      );
      _.each(versions, version => {
        common.log(version);
      });
    } catch (err) {
      //
    }
  }
};
