NVM_VERSION="v1.0.7"

if [ -z "${NVM_HOME}" ]; then
  export NVM_HOME="$HOME/nvm"
fi

function fetch() {
  curl=$(which curl)
  if [ "$?" == "0" ]; then
    curl -L $1 -o $2
    return $?
  fi

  wget=$(which wget)
  if [ "$?" == "0" ]; then
    echo "fetch with wget"
    return $?
  fi
}

function tmpdir() {
  if [ -n $TMPDIR ]; then
    echo "$TMPDIR"
  else
    echo "/tmp"
  fi
}

function getLtsVersion() {
    NODE_JS_ORG="https://nodejs.org"
    NODE_JS_HTML="$(tmpdir)/nodejs.html"
    FOUND_VERSION="v10.16.0"

# TODO
#    fetch $NODE_JS_ORG $NODE_JS_HTML

    echo "$FOUND_VERSION"
}

DEFAULT_NODE_VERSION=$(getLtsVersion)

function getOs() {
  uname -s | tr "[:upper:]" "[:lower:]"
}

function getArch() {
  case $(uname -m) in
    x86_64)
      echo "x64"
      ;;
    i686 | i386)
      echo "x86"
      ;;
    *)
      uname -m | tr "[:upper:]" "[:lower:]"
      ;;
  esac
}

function fetchNodeJS() {
  local version
  version="$1"

  local nodejsMirror
  if [ -n "${NVM_NODEJS_ORG_MIRROR}" ]; then
    nodejsMirror="${NVM_NODEJS_ORG_MIRROR}"
  else
    nodejsMirror="https://nodejs.org/dist"
  fi

  local tgzFile
  tgzFile="node-${version}-$(getOs)-$(getArch).tar.gz"
  nodejsBinUrl="${nodejsMirror}/${version}/${tgzFile}"

  local cacheDir
  cacheDir="${NVM_CACHE}/${version}"
  mkdir -p "${cacheDir}"
  local destTgzFile
  destTgzFile="${cacheDir}/node.tgz"

  if [ ! -f "${destTgzFile}" ]; then
    echo "Fetching ${nodejsBinUrl}"

    curl "${nodejsBinUrl}" -o "${destTgzFile}"
  fi

  tar xzf "${destTgzFile}" --strip=2 --directory "${NVM_HOME}" "*/bin/node"
}

NVM_CACHE="${NVM_HOME}/cache"
NVM_NODE="${NVM_HOME}/nodejs"
NVM_NODE_BIN="${NVM_HOME}/node"

function installNvm() {
  local nvmTgzUrl
  nvmTgzUrl="https://github.com/jchip/nvm/archive/${NVM_VERSION}.tar.gz"
  if [ ! -d "${NVM_CACHE}" ]; then
    mkdir -p "${NVM_CACHE}"
  fi

  local nvmDestTgzFile
  nvmDestTgzFile="${NVM_CACHE}/nvm-${NVM_VERSION}.tgz"

  echo "Fetching ${nvmTgzUrl}"
  fetch "${nvmTgzUrl}" "${nvmDestTgzFile}"

  tar xzf "${nvmDestTgzFile}" --strip=1 --include "*/bin" --include "*/dist" --include "*/package.json" --directory "${NVM_HOME}"
}

fetchNodeJS "${DEFAULT_NODE_VERSION}"
installNvm

source "${NVM_HOME}/bin/nvm.sh"

function setBashRc() {
  BASHRC=~/.bash_profile

  if [ ! -f "${BASHRC}" ]; then
    touch "${BASHRC}"
  fi

  ${NVM_NODE_BIN} ${NVM_HOME}/bin/install_bashrc.js "${BASHRC}"
}

setBashRc
