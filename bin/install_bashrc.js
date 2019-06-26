"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const homeDir = os.homedir();

const nvmHome = process.env.NVM_HOME || `${homeDir}/nvm`;
const nvmLink = process.env.NVM_LINK || `${nvmHome}/nodejs/bin`;

const homeAlias = process.env.HOME ? "${HOME}" : "~";

const varNvmHome = nvmHome.replace(homeDir, homeAlias);
const varNvmLink = nvmLink.replace(homeDir, homeAlias);

const begin = `# NVM bash initialize BEGIN - do not modify #`;
const end = `# NVM bash initialize END - do not modify #`;

const commands = [
  begin,
  `export NVM_HOME="${varNvmHome}"`,
  `export NVM_LINK="${varNvmLink}"`,
  process.env.NVM_NODEJS_ORG_MIRROR &&
    `export NVM_NODEJS_ORG_MIRROR="${process.env.NVM_NODEJS_ORG_MIRROR}"`,
  `source "\$\{NVM_HOME}/bin/nvm.sh"`,
  end
].filter(x => x);

const profileFile = process.argv[2] || path.join(homeDir, ".bash_profile");
let profile = fs.existsSync(profileFile) ? fs.readFileSync(profileFile, "utf8").split("\n") : [];

const beginIx = profile.indexOf(begin);
const endIx = profile.indexOf(end);

if (beginIx >= 0) {
  profile = profile.slice(0, beginIx).concat(profile.slice(endIx + 1));
}

const lastIx = profile.length - 1;
if (profile[lastIx].length === 0) {
  profile = profile.slice(0, lastIx);
}

fs.writeFileSync(
  profileFile,
  profile
    .concat(commands)
    .concat("")
    .join("\n")
);
