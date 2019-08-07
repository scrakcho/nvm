"use strict";

/* eslint-disable max-statements, no-var, no-magic-numbers */

const util = require("util");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const mkdirp = require("mkdirp");
const ck = require("chalker");
const rmdir = util.promisify(require("rmdir"));
const extract = util.promisify(require("extract-zip"));
const needle = require("needle");
const common = require("./common");
const tar = require("tar");
const ls = require("./ls");

function getNodeCachePath(version) {
  return path.join(common.getNvmCacheDir(), version, common.cacheFileName());
}

async function matchNodeVersion({ version, proxy, verifyssl, lts }) {
  const parts = version.split(".");
  if (parts.length === 3) {
    return version;
  }

  let remoteVersions = await ls.getRemote(proxy, verifyssl);

  remoteVersions = remoteVersions.map(v => v.split("."));

  for (let i = 0; i < parts.length; i++) {
    remoteVersions = remoteVersions.filter(v => v[i] === parts[i]);
  }

  return remoteVersions[remoteVersions.length - 1].join(".");
}

async function downloadNode(version, proxy, verifyssl) {
  const nodeCachePath = getNodeCachePath(version);
  if (fs.existsSync(nodeCachePath)) {
    return true;
  }

  common.log(ck`<green>Downloading Node ${version}...</>`);

  let nodeMirrorUrl = process.env.NVM_NODEJS_ORG_MIRROR || "http://nodejs.org/dist/";
  nodeMirrorUrl = nodeMirrorUrl.endsWith("/") ? nodeMirrorUrl : `${nodeMirrorUrl}/`;
  const url = `${nodeMirrorUrl}${version}/${common.makeNodeDistFileName(version)}`;

  const options = {
    proxy,
    output: nodeCachePath,
    follow: 5,
    rejectUnauthorized: verifyssl
  };

  try {
    const resp = await needle("get", url, options);
    if (resp.statusCode !== 200) {
      if (resp.statusCode === 404) {
        common.log(`Error: node.js version ${version} not found.`);
      } else {
        common.log("response body", resp.body);
        common.log("response statusCode", resp.statusCode);
        common.log("response statusMessage", resp.statusMessage);
        common.log("Node %s downloaded failed, check above for error, status, and body", version);
      }
    } else {
      common.log("downloaded successful");
      return true;
    }
  } catch (err) {
    common.log(`download ${url} failed`, err);
  }

  return false;
}

async function doExtract(file, targetPath) {
  if (file.endsWith(".tgz")) {
    return tar.x({ cwd: targetPath, file });
  } else {
    return extract(file, { dir: targetPath });
  }
}

async function install(targetPath, version) {
  const nodeCachePath = getNodeCachePath(version);
  mkdirp.sync(targetPath);
  const nodeFileName = common.makeNodeDistName(version);

  common.log(ck`<magenta>Installing Node ${version}...</>`);
  if (!fs.existsSync(nodeCachePath)) {
    return false;
  }

  try {
    await doExtract(nodeCachePath, targetPath);
    const srcDir = path.join(targetPath, nodeFileName);
    const destDir = path.join(targetPath, version);
    fs.renameSync(srcDir, destDir);
    common.log(ck`<green>Node.js ${version} installed.</>`);
  } catch (err) {
    try {
      await rmdir(path.join(targetPath, nodeFileName));
    } catch (e) {
      //
    }

    common.log(ck`<red>Node ${version} installed failed</>`, err);
    common.log(ck`<green>Try to clean cache with 'nvm cleanup' and try again.</>`);
  }

  return undefined;
}

module.exports = async function(version, proxy, verifyssl) {
  version = common.replaceVersion(version);

  version = await matchNodeVersion({ version, proxy, verifyssl, lts: false });

  const versionParts = _.map(version.split("."), index => parseInt(index.replace("v", "")));

  if (versionParts[0] < 4 || (versionParts[0] === 4 && versionParts[1] < 5)) {
    common.log("Sorry but nvm can not install the Node version below v4.5.0");
    common.exit(1);
  }

  const nodeDir = common.getNodeDir(version);

  if (common.dirHasNodeBin(nodeDir)) {
    common.log(ck`<red>Node.js version ${version} is already installed</>`);
    common.exit(1);
  }

  mkdirp.sync(path.join(common.getNvmCacheDir(), version));

  const status = await downloadNode(version, proxy, verifyssl);

  if (status === true) {
    if (fs.existsSync(nodeDir)) {
      try {
        await rmdir(nodeDir);
      } catch (err) {
        common.log(ck`<red>Node ${version} installed failed</>`, err);
        common.exit(1);
      }
    }

    await install(path.join(nodeDir, ".."), version);
  }
};
