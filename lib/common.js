var fs = require('fs'),
    os = require('os'),
    path = require('path');

module.exports = {
    replaceVersion: function(version) {
        return (/^v/i.test(version) ? version.toLowerCase() : 'v' + version);
    },

    getHomeDir: function() {
        return process.env.USERPROFILE || path.join(process.env.HOMEDRIVE,  process.env.HOMEPATH);
    },

    getBaseDir: function() {
        return path.join(this.getHomeDir(), 'nvm');
    },

    getNvmCacheDir: function() {
        return path.join(this.getBaseDir(), 'cache');
    },

    getNvmDir: function() {
        return path.join(this.getBaseDir(), 'nodejs');
    },

    getNodeDir: function(version) {
        return path.join(this.getNvmDir(), this.replaceVersion(version));
    },

    replacePathEnvironment: function(version) {
        var nvmDir = this.getNvmDir();
        function replace(nvmDir, version) {
            var reg;

            if (version) {
                reg = new RegExp(path.join(nvmDir, version).replace(/\\/g, '\\\\') + ';', 'gi');
                process.env.PATH = process.env.PATH.replace(reg, '');
            }
        }

        replace(nvmDir, process.env.NVM_USE);
        if (version) {
            replace(nvmDir, version);
        }

        return process.env.PATH
    },

    createEnvironmentTmp: function(filePath) {
        if (process.env.NVM_POWERSHELL) {
            return this.createEnvironmentTmpPS(filePath);
        }

        filePath = (filePath || path.join(os.tmpdir(), 'nvm_env.cmd'));
        fs.writeFileSync(
            filePath,
            '@ECHO OFF \nSET "NVM_USE=' + (process.env.NVM_USE ? process.env.NVM_USE : '') +
            '"\nSET "PATH=' + process.env.PATH + '"'
        );
    },

    createEnvironmentTmpPS(filePath) {
        filePath = (filePath || path.join(os.tmpdir(), 'nvm_env.ps1'));
        fs.writeFileSync(
            filePath,
`
$Env:NVM_USE="${(process.env.NVM_USE ? process.env.NVM_USE : '')}"
$Env:Path="${process.env.PATH}"
`            
        );

    }
};