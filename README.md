nvmw
====

This is a simple Node Version Manager for Windows

## Installation

Start a Windows PowerShell terminal and run the following:

```ps
cd $Env:USERPROFILE
$Env:NVM_HOME="$Env:USERPROFILE\nvmw"
Invoke-WebRequest https://raw.githubusercontent.com/jchip/nvmw/master/install.ps1 -o install.ps1
install.ps1
```

This will install nvmw and Node.js v10.16.0 to directory `nvmw` under your home directory.  

If you want to install this under another directory, then set it different for `$Env:NVM_HOME`.

If you don't set it, then a Directory Browser dialog will be opened for you to choose a directory.

Remember to run `del install.ps1` after it's done.

## Usage

```
nvmw -h

  Usage: nvmw [options] [command]

  Commands:

    install <version>      install the given version of Node
    uninstall <version>    uninstall the given version of Node
    use <version>          use the given version of Node in current shell
    deactivate             undo effects of nvmw in current shell
    switch <version>       permanently use the given version of Node as default
    switch-deactivate      permanently undo effects of nvmw
    ls                     list the installed all Nodes
    ls-remote              list remote versions available for install
    cleanup                remove stale local caches

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Examples:

    nvmw install v10.16.0
    nvmw uninstall v12.4.0
    nvmw use v10.16.0
```

## Notes

* It only works in Windows CMD.

## License
[MIT](http://www.opensource.org/licenses/MIT)
