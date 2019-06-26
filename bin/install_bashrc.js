"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const homeDir = os.homedir();

const profileFile = process.argv[2] || path.join(homeDir, ".bash_profile");

const profile = fs.existsSync(profileFile) ? fs.readFileSync(profileFile, "utf8").split("\n") : [];

const nvmHome = process.env.NVM_HOME || `${homeDir}/nvm`;
const nvmLink = process.env.NVM_LINK || `${nvmHome}/nodejs/bin`;

const homeAlias = process.env.HOME ? "${HOME}" : "~";

const varNvmHome = nvmHome.replace(homeDir, homeAlias);
const varNvmLink = nvmLink.replace(homeDir, homeAlias);

const setNvmHomeCmd = `export NVM_HOME="${varNvmHome}"`;
const setNvmLinkCmd = `export NVM_LINK="${varNvmLink}"`;

if (profile.indexOf(setNvmHomeCmd) < 0) {
  profile.push(setNvmHomeCmd);
  profile.push(setNvmLinkCmd);
  if (process.env.NVM_NODEJS_ORG_MIRROR) {
    profile.push(`export NVM_NODEJS_ORG_MIRROR="${process.env.NVM_NODEJS_ORG_MIRROR}"`);
  }
  profile.push(`source "\$\{NVM_HOME}/bin/nvm.sh"\n`);

  fs.writeFileSync(profileFile, profile.join("\n"));
}
