var fs = require('fs'),
    path = require('path'),
    common = require('./common');

module.exports = function(version, ignoreTmp) {
    var version = common.replaceVersion(version),
        nodeDir = common.getNodeDir(version);

    if (fs.existsSync(nodeDir) === false) {
        console.log('nvm use: %s version is not installed yet', version);
        process.exit(1);
    }

    common.resetNvmPaths();
    common.setNvmUsePath(nodeDir);
    process.env.NVM_USE = version;
    if (ignoreTmp !== true) {
        common.createEnvironmentTmp();
    }

    return {version, nodeDir}
};