"use strict";

/* eslint-disable no-magic-numbers */

const os = require("os");
const path = require("path");
const posix = require("./common-posix");
const win32 = require("./common-win32");
const _ = require("lodash");
const needle = require("needle");
const Url = require("url");
const xaa = require("xaa");
const ck = require("chalker");
const opfs = require("opfs");

const platformCommon = os.platform() === "win32" ? win32 : posix;

const common = {
  async _exists(pathName) {
    try {
      await opfs.access(pathName, opfs.constants.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  },

  rename: opfs.rename,

  exit(code) {
    process.exit(code); // eslint-disable-line
  },

  log(...args) {
    console.log(...args); // eslint-disable-line
  },

  replaceVersion(version) {
    version = version.toLowerCase();
    return /^v/i.test(version) ? version : `v${version}`;
  },

  getHomeDir() {
    return os.homedir();
  },

  getBaseDir() {
    return process.env.NVM_HOME || path.join(this.getHomeDir(), "nvm");
  },

  getNvmLinkDir() {
    return process.env.NVM_LINK || path.join(this.getBaseDir(), "nodejs", "bin");
  },

  getNvmCacheDir() {
    return path.join(this.getBaseDir(), "cache");
  },

  getNvmDir() {
    return path.join(this.getBaseDir(), "nodejs");
  },

  getNodeDir(version) {
    return path.join(this.getNvmDir(), this.replaceVersion(version));
  },

  async resetNvmPaths() {
    const baseDir = this.getBaseDir();
    const linkDir = this.getNvmLinkDir();
    const paths = await xaa.filter(process.env.PATH.split(path.delimiter), async x => {
      if (x.startsWith(baseDir) || x === linkDir) {
        return false;
      }
      // remove any path that contains node executable
      return !(await this.dirHasNodeBin(x));
    });
    // update path with nvm's bin
    process.env.PATH = paths.concat(path.join(baseDir, "bin")).join(path.delimiter);
  },

  setNvmUsePath(nodeDir) {
    process.env.PATH = [path.join(nodeDir, "bin")]
      .concat(process.env.PATH.split(path.delimiter))
      .filter(x => x)
      .join(path.delimiter);
  },

  async setNvmLinkPath() {
    const link = process.env.NVM_LINK;
    if (link && (await this._exists(link))) {
      process.env.PATH = [link]
        .concat(process.env.PATH.split(path.delimiter))
        .filter(x => x)
        .join(path.delimiter);
    }
  },

  async findNodeVersion(ver) {
    let version = this.replaceVersion(ver);

    if (!this.isFullVersion(version)) {
      version = this.matchLatestVersion(version, await this.findLocalVersions());
    }

    const nodeDir = this.getNodeDir(version);

    if ((await this._exists(nodeDir)) === false) {
      this.log(ck`<red>node.js version ${version} is not installed yet</>`);
      this.exit(1); // eslint-disable-line
    }

    return { version, nodeDir };
  },

  sortVersions(versions) {
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

  async findLinkVersion() {
    let linkVersion;
    const link = this.getNvmLinkDir();
    if (link && (await this._exists(link))) {
      linkVersion = (await opfs.readlink(link)).match(/(v[0-9]+\.[0-9]+\.[0-9]+)/)[0];
    }

    return linkVersion;
  },

  async findLocalVersions() {
    const nvmDir = this.getNvmDir();
    let versions = [];

    if ((await this._exists(nvmDir)) && (await opfs.lstat(nvmDir)).isDirectory()) {
      versions = this.sortVersions(await opfs.readdir(nvmDir));
    }

    return versions;
  },

  isFullVersion(version) {
    return version.split(".").length === 3;
  },

  matchLatestVersion(version, all) {
    const parts = version.split(".");
    if (parts.length === 3) {
      return version;
    }

    let versions = all.map(v => v.split("."));

    for (let i = 0; i < parts.length; i++) {
      versions = versions.filter(v => v[i] === parts[i]);
    }

    if (versions.length > 0) {
      return versions[versions.length - 1].join(".");
    } else {
      return version;
    }
  },

  nodejsDistUrl(pathname) {
    const distUrl = process.env.NVM_NODEJS_ORG_MIRROR || "http://nodejs.org/dist/";

    if (pathname) {
      const urlObj = Url.parse(distUrl);
      urlObj.pathname = path.posix.join(urlObj.pathname, pathname);
      return Url.format(urlObj);
    }

    return distUrl;
  },

  async getRemoteFromJson(proxy, verifyssl, lts) {
    const options = {
      proxy,
      rejectUnauthorized: verifyssl
    };

    const indexUrl = this.nodejsDistUrl("index.json");

    try {
      const resp = await needle("get", indexUrl, options);

      let versions = lts ? resp.body.filter(x => x.lts) : resp.body;

      versions = versions.map(x => x.version);
      versions = this.sortVersions(versions);

      return versions;
    } catch (err) {
      common.log(ck`<red>fetching remote versions from <magenta>${indexUrl}</> failed</>`);
      throw err;
    }
  },

  async getRemoteFromHtml(proxy, verifyssl) {
    const options = {
      proxy,
      rejectUnauthorized: verifyssl
    };

    const resp = await needle("get", this.nodejsDistUrl(), options);
    const versions = this.sortVersions(
      _.uniq(
        _.filter(resp.body.match(/v[0-9]+.[0-9]+.[0-9]+/gi), version => {
          return /^(v0.[0-4].[0-9]+)|(v0.5.0)$/i.test(version) === false;
        })
      )
    );

    return versions;
  }
};

module.exports = Object.assign(common, platformCommon);
