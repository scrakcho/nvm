var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    common = require('./common');

module.exports = function(version) {
    var nodeDir;

    version = (/^v/i.test(version) ? version : 'v' + version);
    nodeDir = path.join(common.getNvmDir(), version.toLowerCase());
    if (fs.existsSync(nodeDir) === false) {
        console.log('%s version is not installed yet', version);
        process.exit(1);
    }
    common.resetEnv();
    process.env.NVMW = version;
    process.env.PATH = nodeDir + ";" + process.env.PATH;
    common.createEnvTmp();
};