var common = require('./common');

module.exports = function () {
    common.resetNvmPaths();

    delete process.env.NVM_USE;

    if (process.env.NVM_LINK) {
        process.env.PATH = process.env.PATH.split(";").concat(process.env.NVM_LINK).join(";")
    }

    common.createEnvironmentTmp();
};