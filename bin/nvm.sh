function nvm() {
  if [ -z "$NVM_HOME" ]; then
    NVM_HOME=~/nvm
  fi

  NVM_NODE="$NVM_HOME/node"
  if [ ! -x "$NVM_NODE" ]; then
    NVM_NODE=$(which node)
  fi

  if [ ! -x "$NVM_NODE" ]; then
    echo "Can't locate default node executable";
    return 1
  fi

  $NVM_NODE "$NVM_HOME/dist/nvm.js" $*

  if [ -z "$TMPDIR" ]; then
    TMPDIR=/tmp
  fi

  if [ -f "$TMPDIR/nvm_env.sh" ]; then
    rm -rf "$TMPDIR/nvm_envx.sh"
    mv "$TMPDIR/nvm_env.sh" "$TMPDIR/nvm_envx.sh"
    source "$TMPDIR/nvm_envx.sh"
    rm -rf "$TMPDIR/nvm_envx.sh"
  fi

  local nvmInstall="$NVM_INSTALL"
  unset NVM_INSTALL

  if [ -n "$nvmInstall" ] && [ -f "$NVM_HOME/post-install.sh" ]; then
    if [ -n "$SHELL" ]; then
      $SHELL "$NVM_HOME/post-install.sh" "$nvmInstall"
    else
      bash "$NVM_HOME/post-install.sh" "$nvmInstall"
    fi
  fi

  return 0
}

# If a version is linked, then automatically add it to PATH

if [ -d "$NVM_LINK" ] && [ -x "$NVM_LINK/node" ]; then
  export PATH="$NVM_LINK:$PATH"
fi
