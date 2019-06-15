"use strict";

const Fs = require("fs")
const path = require('path');
const use = require('./use')
const common = require('./common');
const mkdirp = require("mkdirp")

module.exports = function (version) {
    const info = use(version, true);

    process.env.NVMW_DEFAULT = process.env.NVMW;

    if (!process.env.NVM_LINK) {
        console.error("can't switch because NVM_LINK is not defined");
        process.exit(1);
    }

    const link = process.env.NVM_LINK;

    try {
        if (Fs.existsSync(link)) {
            Fs.unlinkSync(link);
        } else {
            const baseDir = path.basename(link);
            if (!Fs.existsSync(baseDir)) {
                mkdirp.sync(baseDir);
            }
        }
        Fs.symlinkSync(info.nodeDir, link, "junction")
    } catch (err) {
        console.error(`switch to version ${version} failed`, err)
        process.exit(1);
    }

};