$Env:NVM_POWERSHELL = "true"
$Env:NVM_PSPROFILE = "$PROFILE"

Try {
  $NODE_EXE = "$PSScriptRoot\..\node.exe"
  if ( -not (Test-Path $NODE_EXE)) {
    $NODE_EXE = node
  }

  $NVM_JS = "$PSScriptRoot\..\dist\nvm.js"

  & $NODE_EXE $NVM_JS $args[0] $args[1] $args[2] $args[3]
}
Finally {
  Remove-Item Env:\NVM_POWERSHELL
}

$nvmEnv = "$Env:TMP\nvm_env.ps1"

if ( Test-Path $nvmEnv ) {
  & $nvmEnv
  Remove-Item -Path $nvmEnv
}

if ( Test-Path Env:NVM_INSTALL ) {
  $version = "$Env:NVM_INSTALL"
  Remove-Item Env:NVM_INSTALL
  $postInstall = "$Env:NVM_HOME\post-install.ps1"
  if ( Test-Path $postInstall ) {
    powershell.exe $postInstall $version
  }
}
