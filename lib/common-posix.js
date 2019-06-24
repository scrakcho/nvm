"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
  makeNodeDistName(version) {
    const platform = os.platform().toLowerCase();
    const arch = os.arch().toLowerCase();
    return `node-${version}-${platform}-${arch}`;
  },

  cacheFileName() {
    return "node.tgz";
  },

  makeNodeDistFileName(version) {
    const distName = this.makeNodeDistName(version);
    return `${distName}.tar.gz`;
  },

  dirHasNodeBin(dir) {
    const nodeExe = path.join(dir, "node");
    return fs.existsSync(nodeExe);
  },

  createEnvironmentTmp(filePath) {
    filePath = filePath || path.join(os.tmpdir(), "nvm_env.sh");
    fs.writeFileSync(
      filePath,
      `
export NVM_USE=${process.env.NVM_USE || ""}
export PATH=${process.env.PATH}
`
    );
  }
};
