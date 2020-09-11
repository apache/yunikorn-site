#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

function stop() {
  echo "cleaning up docker image"
	docker stop yunikorn-site-local &>/dev/null
  docker rm -f yunikorn-site-local &>/dev/null
  docker rmi yunikorn/yunikorn-website:latest &>/dev/null
}

function clean() {
	echo "removing build artifacts:"
  echo "  docusaurus install" && rm -rf .docusaurus
  echo "  node modules" && rm -rf node_modules
  echo "  yarn lock file" && rm -f yarn.lock
  echo "  build output" && rm -rf build
}

function build() {
  # build local docker image
  cat <<EOF >.dockerfile.tmp
FROM node:12.18.0
ADD . /incubator-yunikorn-site
WORKDIR /incubator-yunikorn-site
EOF

  docker build -t yunikorn/yunikorn-website:latest -f .dockerfile.tmp .
  [ "$?" -ne 0 ] && echo "docker image build failed" && rm -rf .dockerfile.tmp && exit 1
  rm -rf .dockerfile.tmp
}

function run() {
  # run docker container
  # mount the repo root to the container working dir,
  # so that changes made in the repo can trigger the web-server auto-update
  docker run -it --name yunikorn-site-local -d \
    -p 3000:3000 \
    -v $PWD:/incubator-yunikorn-site \
    yunikorn/yunikorn-website:latest
  [ "$?" -ne 0 ] && echo "run local docker image failed" && return 1

  # install dependency in docker container
  docker exec -it yunikorn-site-local /bin/bash -c "yarn install"
  [ "$?" -ne 0 ] && echo "yarn install failed" && return 1

  # run build inside the container
  docker exec -it yunikorn-site-local /bin/bash -c "yarn build"
  [ "$?" -ne 0 ] && echo "yarn build failed" && return 1

  # start the web server
  docker exec -it yunikorn-site-local /bin/bash -c "yarn start --host 0.0.0.0"
  RET=$?
  [ "$RET" -eq 130 ] && echo "  ctrl-c caught, exiting build" && return 0
  [ "$RET" -ne 0 ] && echo "start web-server failed" && return 1
}

function print_usage() {
    cat <<EOF
Usage: $(basename "$0") run | clean | help
    run        build the website, and launch the server in a docker image.
    clean      remove old build and cached files.
    help       print this message.

Description:
  This command builds and launches the website server inside a docker image,
  the server is built with the latest content from this repo. When changes are
  made in this directory, the site will be automatically rebuild. The server
  will be automatically refreshed. Be aware that some of the changes require
  the server to be restarted, use ctrl-c to exit and run the command again.

  This script must be run from the top directory of the repository.
EOF
}

if [ $# -ne 1 -o ! -f ./docusaurus.config.js ]; then
  print_usage
  exit 1
fi
opt=$1
if [ "$opt" == "run" ]; then
  stop
  build
  run
  [ "$?" -eq 1 ] && echo "build failed, leaving docker image" && exit 1
  stop
elif [ "$opt" == "clean" ]; then
  clean
else
  print_usage
fi
