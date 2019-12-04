"use strict";

const opfs = require("opfs");
const os = require("os");
const path = require("path");

module.exports = {
  getNodeBinDir(nodeDir) {
    return path.join(nodeDir, "bin");
  },

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

  async dirHasNodeBin(dir) {
    const nodeExe = path.join(dir, "bin", "node");
    return await this._exists(nodeExe);
  },

  getSetInstallEnvScript(version) {
    return `
export PATH=${process.env.PATH}
export NVM_INSTALL=${version}
`;
  },

  async createEnvironmentTmp(filePath, content) {
    filePath = filePath || path.join(os.tmpdir(), "nvm_env.sh");
    await opfs.writeFile(
      filePath,
      content ||
        `
export NVM_USE=${process.env.NVM_USE || ""}
export PATH=${process.env.PATH}
`
    );
  },

  setNvmLinkAutoExec() {}
};
