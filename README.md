# nvm

This is a simple Node Version Manager for Windows.

Tested on Windows 10.

## Installation

Start a Windows PowerShell terminal and run the following: (copy and paste into shell and press enter)

```ps
cd $Env:USERPROFILE;
Invoke-WebRequest https://raw.githubusercontent.com/jchip/nvm/master/install.ps1 -o install.ps1;
.\install.ps1 -nvmhome $Env:USERPROFILE\nvm;
del install.ps1
```

This will install nvm and current LTS Node.js (v10.16.0) to directory `nvm` under your home specified by `$Env:USERPROFILE`.

If you want to install this under another directory, then set it different for the param `-nvmhome`.

If you don't set it, then it will check `$Env:NVM_HOME`, and if non-existent, then a Directory Browser dialog will be opened for you to create and choose a directory.

## Usage

```
Usage: nvm <command> [options]

Commands:
  nvm install <version>    install the given version of Node
  nvm uninstall <version>  uninstall the given version of Node
  nvm use <version>        use the given version of Node in current shell
  nvm stop                 undo effects of nvm in current shell
  nvm link <version>       permanently link the version of Node as default
  nvm unlink               permanently unlink the default version
  nvm ls                   list the installed all Nodes
  nvm ls-remote            list remote versions available for install
  nvm cleanup              remove stale local caches

Options:
  --version, -V, -v  Show version number
  --help, -?, -h     Show help. Add a command to show its help          [string]


Examples:

    nvm install v10.16.0
    nvm uninstall v12.4.0
    nvm use v10.16.0
```

## License

[MIT](http://www.opensource.org/licenses/MIT)
