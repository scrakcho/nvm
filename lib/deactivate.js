var common = require('./common');

module.exports = function() {
    common.replacePathEnvironment();

    delete process.env.NVM_USE;

    common.createEnvironmentTmp();
};