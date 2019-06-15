"use strict"

const Fs = require('fs');
const use = require("./use")

module.exports = function () {
    if (!process.env.NVM_LINK) {
        console.error("can't switch-deactivate because NVM_LINK is not defined");
        process.exit(1);
    }

    const link = process.env.NVM_LINK;

    try {
        if (Fs.existsSync(link)) {
            Fs.unlinkSync(link);
        }
        if (process.env.NVM_USE) {
            use(process.env.NVM_USE)
        }
    } catch (err) {
        console.error(`switch-deactivate failed`, err)
        process.exit(1);
    }
};
