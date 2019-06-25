"use strict";

const util = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
// const async = require("async");
const _ = require("lodash");
const mkdirp = require("mkdirp");
const colors = require("colors");
const rmdir = util.promisify(require("rmdir"));
const extract = util.promisify(require("extract-zip"));
// const request = require("request");
const needle = require("needle");
const common = require("./common");
const tar = require("tar");

function getNodeCachePath(version) {
  return path.join(common.getNvmCacheDir(), version, common.cacheFileName());
}

async function downloadNode(version) {
  var nodeCachePath = getNodeCachePath(version);
  if (fs.existsSync(nodeCachePath)) {
    return true;
  }

  console.log("Downloading Node %s... ".green, version);

  var nodeMirrorUrl = process.env.NVM_NODEJS_ORG_MIRROR || "http://nodejs.org/dist/";
  nodeMirrorUrl = nodeMirrorUrl.endsWith("/") ? nodeMirrorUrl : nodeMirrorUrl + "/";
  var url = nodeMirrorUrl + version + "/" + common.makeNodeDistFileName(version);

  try {
    await needle("get", url, { output: nodeCachePath, follow: 5 });
    console.log("downloaded successful");
    return true;
  } catch (err) {
    console.log(`download ${url} failed`, err);
  }

  return false;
  // await new Promise((resolve, reject) => {
  //   request
  //     .get(url, function(error, response, data) {
  //       var status = true;
  //       if (error !== null || response.statusCode !== 200) {
  //         status = false;
  //         fs.unlinkSync(nodeCachePath);
  //         if (response.statusCode === 404) {
  //           console.log(`Error: node.js version ${version} not found.`);
  //         } else {
  // console.log("response body", response.body);
  // console.log("error", error);
  // console.log("response statusCode", response.statusCode);
  // console.log("response statusMessage", response.statusMessage);
  // console.log(
  //   "Node %s downloaded failed, check above for error, status, and body",
  //   version
  // );
  //         }
  //       }
  //     })
  //     .pipe(fs.createWriteStream(nodeCachePath))
  //     .on("done", resolve)
  //     .on("error", reject);
  // });
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

  console.log("Installing Node %s...".green, version);
  if (!fs.existsSync(nodeCachePath)) {
    return false;
  }

  try {
    await doExtract(nodeCachePath, targetPath);
    const srcDir = path.join(targetPath, nodeFileName);
    const destDir = path.join(targetPath, version);
    fs.renameSync(srcDir, destDir);
  } catch (err) {
    await rmdir(path.join(targetPath, nodeFileName));

    console.log("Node %s installed failed", version);
  }
}

module.exports = async function(version) {
  var nodeDir, versionParts;
  version = common.replaceVersion(version);
  versionParts = _.map(version.split("."), function(index) {
    return parseInt(index.replace("v", ""));
  });
  if (versionParts[0] < 4 || (versionParts[0] === 4 && versionParts[1] < 5)) {
    console.log("Sorry but nvm can not install the Node which version below v4.5.0");
    process.exit(1);
  }

  nodeDir = common.getNodeDir(version);

  if (common.dirHasNodeBin(nodeDir)) {
    console.log("Node.js version %s is already installed", version);
    process.exit(1);
  }

  mkdirp.sync(path.join(common.getNvmCacheDir(), version));

  const status = await downloadNode(version);

  if (status === true) {
    if (fs.existsSync(nodeDir)) {
      try {
        await rmdir(nodeDir);
      } catch (err) {
        console.log("Node %s installed failed", version, err);
        process.exit(1);
      }
    }

    await install(path.join(nodeDir, ".."), version);
    console.log(`Node.js ${version} installed.`);
  }
};
