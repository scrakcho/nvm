"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const async = require("async");
const _ = require("lodash");
const mkdirp = require("mkdirp");
const colors = require("colors");
const rmdir = require("rmdir");
const extract = require("extract-zip");
const request = require("request");
const common = require("./common");
const tar = require("tar");

function getNodeCachePath(version) {
  return path.join(common.getNvmCacheDir(), version, common.cacheFileName());
}

function downloadNode(version, callback) {
  var nodeCachePath = getNodeCachePath(version);
  if (fs.existsSync(nodeCachePath)) {
    return callback(true);
  }
  console.log("Downloading Node %s... ".green, version);
  async.waterfall(
    [
      function(nodeCallback) {
        var nodeMirrorUrl = process.env.NVM_NODEJS_ORG_MIRROR || "http://nodejs.org/dist/";
        nodeMirrorUrl = nodeMirrorUrl.endsWith("/") ? nodeMirrorUrl : nodeMirrorUrl + "/";
        var url = nodeMirrorUrl + version + "/" + common.makeNodeDistFileName(version);
        return nodeCallback(true, url);
      }
    ],
    function(status, url) {
      if (status === false) {
        console.log("Node %s downloaded failed, status false", version);
        return callback(false);
      }
      request
        .get(url, function(error, response, data) {
          var status = true;
          if (error !== null || response.statusCode !== 200) {
            status = false;
            fs.unlinkSync(nodeCachePath);
            if (response.statusCode === 404) {
              console.log(`Error: node.js version ${version} not found.`);
            } else {
              console.log("response body", response.body);
              console.log("error", error);
              console.log("response statusCode", response.statusCode);
              console.log("response statusMessage", response.statusMessage);
              console.log(
                "Node %s downloaded failed, check above for error, status, and body",
                version
              );
            }
          }
          callback(status);
        })
        .pipe(fs.createWriteStream(nodeCachePath));
    }
  );
}

function doExtract(file, targetPath, cb) {
  if (file.endsWith(".tgz")) {
    return tar.x({ cwd: targetPath, file }, cb);
  } else {
    return extract(file, { dir: targetPath }, cb);
  }
}

function install(targetPath, version) {
  const nodeCachePath = getNodeCachePath(version);
  mkdirp.sync(targetPath);
  const nodeFileName = common.makeNodeDistName(version);

  console.log("Installing Node %s...".green, version);
  if (fs.existsSync(nodeCachePath)) {
    doExtract(nodeCachePath, targetPath, function(error) {
      if (error) {
        rmdir(path.join(targetPath, nodeFileName), function(err, dirs, files) {
          console.log("Node %s installed failed", version);
        });
      } else {
        let count = 0;
        const srcDir = path.join(targetPath, nodeFileName);
        const destDir = path.join(targetPath, version);
        const rename = () => {
          try {
            fs.renameSync(srcDir, destDir);
            console.log(
              "\nNode %s installed successfully, run `nvm use %s` to use this version",
              version,
              version
            );
          } catch (err) {
            if (count > 5) {
              console.error(`rename ${srcDir} => ${destDir} failed`, err);
            } else {
              count++;
              setTimeout(rename, 500);
            }
          }
        };
        rename();
      }
    });
  }
}

module.exports = function(version) {
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
  async.waterfall(
    [
      function(callback) {
        downloadNode(version, callback);
      }
    ],
    function(status) {
      if (status === true) {
        if (fs.existsSync(nodeDir)) {
          rmdir(nodeDir, function(err, dirs, files) {
            if (err) {
              console.log("Node %s installed failed", version);
            } else {
              install(path.join(nodeDir, ".."), version);
            }
          });
        } else {
          install(path.join(nodeDir, ".."), version);
        }
      }
    }
  );
};
