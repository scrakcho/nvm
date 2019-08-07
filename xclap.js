"use strict";

const Fs = require("fs");
const Path = require("path");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const xclap = require("xclap");

const pkgFile = Path.resolve("package.json");
let pkgData;

require("electrode-archetype-njs-module-dev")(xclap);

function readPkg() {
  if (!pkgData) {
    pkgData = Fs.readFileSync(pkgFile);
  }

  return pkgData;
}

function replaceLine(file, oldLine, newLine) {
  const data = Fs.readFileSync(file, "utf8").split("\n");
  let found = 0;
  const newData = data.map(x => {
    if (x === oldLine) {
      found++;
      return newLine;
    }
    return x;
  });
  if (found !== 1) {
    throw new Error(`Replace file ${file} found ${found} old lines [${oldLine}]`);
  }
  Fs.writeFileSync(file, newData.join("\n"));
}

xclap.load("nvm", {
  prepack: {
    task: () => {
      const dist = Path.resolve("dist");
      const data = readPkg();
      const pkg = JSON.parse(data);
      pkg.scripts = { preinstall: pkg.scripts.preinstall };
      delete pkg.dependencies;
      delete pkg.nyc;
      delete pkg.devDependencies;
      rimraf.sync(dist);
      mkdirp.sync(dist);

      mkdirp.sync(Path.resolve(".tmp"));
      Fs.writeFileSync(Path.resolve(".tmp/package.json"), data);
      Fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  },

  postpack: {
    task: () => {
      Fs.writeFileSync(pkgFile, readPkg());
    }
  },

  ".prepare": ["nvm/prepack", "nvm/bundle"],

  release: {
    desc: "Release a new version to npm.  package.json must be updated.",
    task: ["nvm/.prepare", "nvm/publish"],
    finally: ["nvm/postpack"]
  },

  bundle: "webpack",

  publish: "npm publish",

  version: {
    desc: "Bump version for release",
    task() {
      const data = readPkg();
      const pkg = JSON.parse(data);
      const oldVer = `${pkg.version}`;
      const ver = oldVer.split(".").map(x => parseInt(x, 10));
      const bump = this.argv[1];
      switch (bump) {
        case "--major":
          ver[0]++;
          ver[1] = ver[2] = 0;
          break;
        case "--minor":
          ver[1]++;
          ver[2] = 0;
          break;
        case "--patch":
          ver[2]++;
          break;
        default:
          throw new Error(`unknown version bump ${bump}`);
      }
      const newVer = ver.join(".");
      replaceLine("install.ps1", `\$nvmVersion = "${oldVer}"`, `\$nvmVersion = "${newVer}"`);
      replaceLine("install.sh", `NVM_VERSION="${oldVer}"`, `NVM_VERSION="${newVer}"`);
      pkg.version = newVer;
      Fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
      const regex1 = new RegExp(`\\/v${oldVer.replace(/\./g, "\\.")}\\/`, "g");
      const regex2 = new RegExp(`@${oldVer.replace(/\./g, "\\.")}\\/`, "g");
      const readme = Fs.readFileSync("README.md", "utf8")
        .replace(regex1, `/v${newVer}/`)
        .replace(regex2, `@${newVer}/`);
      Fs.writeFileSync("README.md", readme);

      return xclap.serial([
        `~$git add install.ps1 install.sh package.json README.md`,
        `~$git commit -m "${newVer}"`,
        `~$git tag "v${newVer}"`
      ]);
    }
  }
});
