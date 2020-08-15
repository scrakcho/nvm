function postInstall() {
  if [ -n "$1" ] && [ -f "$NVM_HOME/post-install.sh" ]; then
    if [ -n "$SHELL" ]; then
      $SHELL "$NVM_HOME/post-install.sh" "$1"
    else
      bash "$NVM_HOME/post-install.sh" "$1"
    fi
  fi
}

function nvm() {
  if [ -z "$NVM_HOME" ]; then
    NVM_HOME=~/nvm
  fi

  NVM_NODE="$NVM_HOME/node"
  if [ ! -x "$NVM_NODE" ]; then
    echo "Can't find default node.js binary at ${NVM_NODE}, trying 'which node'"
    NVM_NODE=$(which node)
  fi

  if [ ! -x "$NVM_NODE" ]; then
    echo "Can't locate a default node.js executable to run nvm";
    return 1
  fi

  $NVM_NODE "$NVM_HOME/dist/nvm.js" $*

  if [ -z "$TMPDIR" ]; then
    TMPDIR=/tmp
  fi

  if [ -f "$TMPDIR/nvm_env.sh" ]; then
    MY_ENV_COPY="$TMPDIR/nvm_envx_$$.sh"
    rm -f "$MY_ENV_COPY"
    mv "$TMPDIR/nvm_env.sh" "$MY_ENV_COPY"
    source "$MY_ENV_COPY"
    rm -f "$MY_ENV_COPY"
  fi

  local nvmInstall="$NVM_INSTALL"
  unset NVM_INSTALL

  postInstall "${nvmInstall}"

  return 0
}

# If a version is linked, then automatically add it to PATH

if [ -d "$NVM_LINK" ] && [ -x "$NVM_LINK/node" ]; then
  export PATH="$NVM_LINK:$PATH"
fi
