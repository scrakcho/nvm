"use strict";

const xrequire = require;
const fs = require("fs");
const NixClap = require("nix-clap");
const Path = require("path");
const ck = require("chalker");

const packageConfig = JSON.parse(
  fs.readFileSync(Path.join(__dirname, "../package.json")).toString()
);

const options = {
  proxy: {
    desc: "Set network proxy URL",
    alias: "p",
    type: "string"
  },
  verifyssl: {
    desc: "Turn on/off verify SSL certificate",
    alias: ["ssl", "no-ssl"],
    type: "boolean",
    default: true
  }
};

const checkOpts = parsed => {
  const proxy = parsed.source.proxy === "cli" ? parsed.opts.proxy : process.env.NVM_PROXY;
  const verifyssl =
    process.env.NVM_VERIFY_SSL === undefined || parsed.source.verifyssl === "cli"
      ? parsed.opts.verifyssl
      : process.env.NVM_VERIFY_SSL !== "false";

  return { proxy, verifyssl };
};

const commands = {
  install: {
    desc: "install the given version of Node",
    args: "<version>",
    exec: async parsed => {
      const { proxy, verifyssl } = checkOpts(parsed);
      await xrequire("./install")(parsed.args.version, proxy, verifyssl);
    }
  },
  uninstall: {
    desc: "uninstall the given version of Node",
    args: "<version>",
    exec: parsed => {
      xrequire("./uninstall")(parsed.args.version);
    }
  },
  use: {
    desc: "use the given version of Node in current shell",
    args: "<version>",
    exec: parsed => {
      xrequire("./use")(parsed.args.version);
    }
  },
  stop: {
    desc: "undo effects of nvm in current shell",
    exec: () => {
      xrequire("./deactivate")();
    }
  },
  link: {
    desc: "permanently link the version of Node as default",
    args: "<version>",
    exec: parsed => {
      xrequire("./switch")(parsed.args.version);
    }
  },
  unlink: {
    desc: "permanently unlink the default version",
    exec: () => {
      xrequire("./switch-deactivate")();
    }
  },
  ls: {
    desc: "list the installed all Nodes",
    exec: () => {
      xrequire("./ls").local();
    }
  },
  "ls-remote": {
    desc: "list remote versions available for install",
    exec: parsed => {
      const { proxy, verifyssl } = checkOpts(parsed);
      xrequire("./ls").remote(proxy, verifyssl);
    }
  },
  cleanup: {
    desc: "remove stale local caches",
    exec: () => {
      xrequire("../lib/cleanup")();
    }
  }
};

new NixClap({
  name: "nvm",
  handlers: {
    "post-help": evt => {
      evt.self.output(ck`envs:

  <green>NVM_PROXY</> - set proxy URL
  <green>NVM_VERIFY_SSL</> - true/false

Examples:

    nvm install v10.16.0
    nvm uninstall v12.4.0
    nvm use v10.16.0

`);
    }
  }
})
  .version(packageConfig.version)
  .usage("$0 <command> [options]")
  .init(options, commands)
  .parse();
