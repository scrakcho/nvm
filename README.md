# nvm

This is a simple universal Node Version Manager for Windows and Unix.

# Table Of Contents

- [Installation](#installation)
  - [Windows](#windows)
    - [Troubleshooting](#troubleshooting)
    - [Windows 7 Updates](#windows-7-updates)
  - [Unix](#unix)
- [Usage](#usage)
  - [Environments](#environments)
- [License](#license)

## Installation

### Windows

**_You don't need admin rights to install or use_**, only the permission to execute PowerShell scripts.

Tested on Windows 10, 8.1, and 7. Windows 7 requires PowerShell updates, see [update instructions](#windows-7-updates).

To install, start a Windows PowerShell terminal and run the following: (copy and paste into shell and press enter)

**From [github.com](https://www.github.com/jchip/nvm):**

```ps
cd $Env:USERPROFILE;
Invoke-WebRequest https://raw.githubusercontent.com/jchip/nvm/v1.2.2/install.ps1 -OutFile install.ps1;
.\install.ps1 -nvmhome $Env:USERPROFILE\nvm;
del install.ps1
```

**or from [unpkg.com](https://unpkg.com):**

```ps
cd $Env:USERPROFILE;
Invoke-WebRequest https://unpkg.com/@jchip/nvm@1.2.2/install.ps1 -OutFile install.ps1;
.\install.ps1 -nvmhome $Env:USERPROFILE\nvm;
del install.ps1
```

- This will install nvm and current LTS Node.js (v10.16.2) to directory `nvm` under your home specified by `$Env:USERPROFILE`.

- If you want to install this under another directory, then set it with the param `-nvmhome`.

- If you don't set it, then `$Env:NVM_HOME` will be checked, and if non-existent, then a Directory Browser dialog will be opened for you to create and choose a directory.

[Video Demo of upgrading Windows 7 to PowerShell 5.1 and then installing this](https://youtu.be/BFYcXLS5R_4)

#### Troubleshooting

- If you get the error:

> install.ps1 cannot be loaded because running scripts is disabled on this system.

Then you need to run PowerShell as administrator and `Set-ExecutionPolicy` to `RemoteSigned` first, and then start a normal PowerShell to run the install script.

ie: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`

See this [StackOverflow question](https://stackoverflow.com/questions/4037939/powershell-says-execution-of-scripts-is-disabled-on-this-system) for details.

You need to keep this policy if you want to use `nvm` in PowerShell to switch node.js versions.

#### Windows 7 Updates

PowerShell version 4+ is required.

For Windows 7, you can update it to version 5.1 with the following instructions:

1. Go to <https://www.microsoft.com/en-us/download/details.aspx?id=54616>
2. Click Red Download button
3. Download `Win7AndW2K8R2-KB3191566-x64.zip` or `Win7-KB3191566-x86.zip` for 32-bit
4. Unzip the file
5. Run the package `Win7AndW2K8R2-KB3191566-x64.msu` or `Win7-KB3191566-x86.msu` for 32-bit

After it's completed and rebooted, launch PowerShell and type `$PSVersionTable` to check.

> PSVersion should be something like `5.1.#####.####`

[Video Demo of upgrading Windows 7 to PowerShell 5.1 and then installing this](https://youtu.be/BFYcXLS5R_4)

### Unix

**From [github.com](https://www.github.com/jchip/nvm):**

Using cURL and the install script:

```bash
NVM_HOME=~/nvm curl -o- https://raw.githubusercontent.com/jchip/nvm/v1.2.2/install.sh | bash
```

or wget:

```bash
NVM_HOME=~/nvm wget -qO- https://raw.githubusercontent.com/jchip/nvm/v1.2.2/install.sh | bash
```

**or from [unpkg.com](https://unpkg.com):**

Using cURL and the install script:

```bash
NVM_HOME=~/nvm curl -o- https://unpkg.com/@jchip/nvm@1.2.2/install.sh | bash
```

or wget:

```bash
NVM_HOME=~/nvm wget -qO- https://unpkg.com/@jchip/nvm@1.2.2/install.sh | bash
```

## Usage

```
Usage: nvm <command> [options]

Commands:
  nvm install <version>    install the given version of Node.js
  nvm uninstall <version>  uninstall the given version of Node.js
  nvm use <version>        use the given version of Node.js in current shell
  nvm stop                 undo effects of nvm in current shell [aliases: unuse]
  nvm link <version>       permanently link the version of Node.js as default
  nvm unlink               permanently unlink the default version
  nvm ls                   list all the installed Node.js versions
  nvm ls-remote            list remote versions available for install
  nvm cleanup              remove stale local caches

Options:
  --proxy, -p                   Set network proxy URL                   [string]
  --verifyssl, --ssl, --no-ssl  Turn on/off verify SSL certificate
                                                       [boolean] [default: true]
  --latest                      Match latest version to uninstall
  --version, -V, -v             Show version number
  --help, -?, -h                Show help. Add a command to show its help
                                                                        [string]

envs:

  NVM_PROXY - set proxy URL
  NVM_VERIFY_SSL - (true/false) turn on/off verify SSL certs

Examples:

    nvm install 12.8
    nvm use 12
    nvm uninstall 12.4

doc: https://www.npmjs.com/package/@jchip/nvm

```

### Environments

These env flags can be set:

| name             | values         | description                                 |
| ---------------- | -------------- | ------------------------------------------- |
| `NVM_PROXY`      | string         | An URL to a network proxy                   |
| `NVM_VERIFY_SSL` | `true`/`false` | turn on/off node.js verify SSL certificates |

## License

[MIT](http://www.opensource.org/licenses/MIT)
