"use strict";

const Fs = require("fs");
const Zipit = require("zipit");
const pkg = require("./package.json");

Zipit(
  {
    input: ["./package.json", "./bin", "./dist"],
    cwd: process.cwd()
  },
  (err, buffer) => {
    if (err) {
      console.error(err);
      return;
    }

    // Handle buffer, which is an instance of Buffer
    Fs.writeFileSync(`nvm-v${pkg.version}.zip`, buffer);
  }
);
