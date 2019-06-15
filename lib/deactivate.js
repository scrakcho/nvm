var common = require('./common');

module.exports = function() {
    common.replacePathEnvironment();

    delete process.env.NVMW;

    common.createEnvironmentTmp();
};