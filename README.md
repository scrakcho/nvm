# nvm

This is a simple universal Node Version Manager for Windows and Unix.

# Table Of Contents

- [Installation](#installation)
  - [Windows](#windows)
    - [Troubleshooting](#troubleshooting)
    - [Windows 7 Updates](#windows-7-updates)
  - [Unix](#unix)
- [Usage](#usage)
- [License](#license)

## Installation

### Windows

***This install node.js in your user local only so you don't need admin rights, except being able to execute PowerShell scripts.***

Tested on Windows 10, 8.1, and 7. Windows 7 requires PowerShell updates, see [update instructions](#windows-7-updates).

Start a Windows PowerShell terminal and run the following: (copy and paste into shell and press enter)

**From [github.com](https://www.github.com/jchip/nvm):**

```ps
cd $Env:USERPROFILE;
Invoke-WebRequest https://raw.githubusercontent.com/jchip/nvm/v1.1.6/install.ps1 -OutFile install.ps1;
.\install.ps1 -nvmhome $Env:USERPROFILE\nvm;
del install.ps1
```

**From [unpkg.com](https://unpkg.com):**

```ps
cd $Env:USERPROFILE;
Invoke-WebRequest https://unpkg.com/@jchip/nvm@1.1.6/install.ps1 -OutFile install.ps1;
.\install.ps1 -nvmhome $Env:USERPROFILE\nvm;
del install.ps1
```

- This will install nvm and current LTS Node.js (v10.16.0) to directory `nvm` under your home specified by `$Env:USERPROFILE`.

- If you want to install this under another directory, then set it different for the param `-nvmhome`.

- If you don't set it, then it will check `$Env:NVM_HOME`, and if non-existent, then a Directory Browser dialog will be opened for you to create and choose a directory.

[Video Demo of upgrading Windows 7 to PowerShell 5.1 and then installing this](https://youtu.be/BFYcXLS5R_4)

#### Troubleshooting

- **_install.ps1 cannot be loaded because running scripts is disabled on this system._**

> You need to run PowerShell as administrator and `Set-ExecutionPolicy` to `RemoteSigned` first, and then start a normal PowerShell to run the install script.
>
> ie: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`
>
> See this [StackOverflow question](https://stackoverflow.com/questions/4037939/powershell-says-execution-of-scripts-is-disabled-on-this-system) for details.
>
> You need to keep this policy if you want to use `nvm` in PowerShell to switch node.js versions.

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
NVM_HOME=~/nvm curl -o- https://raw.githubusercontent.com/jchip/nvm/v1.1.6/install.sh | bash
```

or wget:

```bash
NVM_HOME=~/nvm wget -qO- https://raw.githubusercontent.com/jchip/nvm/v1.1.6/install.sh | bash
```

**From [unpkg.com](https://unpkg.com):**

Using cURL and the install script:

```bash
NVM_HOME=~/nvm curl -o- https://unpkg.com/@jchip/nvm@1.1.6/install.sh | bash
```

or wget:

```bash
NVM_HOME=~/nvm wget -qO- https://unpkg.com/@jchip/nvm@1.1.6/install.sh | bash
```


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
