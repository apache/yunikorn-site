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

function image_build() {
  # build local docker image
  cat <<EOF >.dockerfile.tmp
FROM node:16.14
ADD . /yunikorn-site
WORKDIR /yunikorn-site
EOF

  docker build -t yunikorn/yunikorn-website:latest -f .dockerfile.tmp .
  [ $? -ne 0 ] && echo "docker image build failed" && rm -rf .dockerfile.tmp && exit 1
  rm -rf .dockerfile.tmp
}

function web() {
  # start the web server
  echo " Starting development server with locale $LOCALE"
  docker exec -it yunikorn-site-local /bin/bash -c "yarn start --locale=$LOCALE --host 0.0.0.0"
  RET=$?
  [ ${RET} -eq 131 ] && echo "  ctrl-\ caught, restarting" && return 2
  [ ${RET} -eq 130 ] && echo "  ctrl-c caught, exiting build" && return 0
  [ ${RET} -ne 0 ] && echo "start web-server failed" && return 1
}

function run_base() {
  # run docker container
  # mount the repo root to the container working dir,
  # so that changes made in the repo can trigger the web-server auto-update
  docker run -it --name yunikorn-site-local -d \
    -p 3000:3000 \
    -v $PWD:/yunikorn-site \
    yunikorn/yunikorn-website:latest
  [ $? -ne 0 ] && echo "run local docker image failed" && return 1

  # install dependency in docker container
  docker exec -it yunikorn-site-local /bin/bash -c "yarn install"
  [ $? -ne 0 ] && echo "yarn install failed" && return 1

  # install dependency in docker container
  docker exec -it yunikorn-site-local /bin/bash -c "yarn add @docusaurus/theme-search-algolia"
  [ $? -ne 0 ] && echo "yarn add failed" && return 1
  return 0
}

function run_web() {
	while true; do
		web
		RET=$?
		[ ${RET} -ne 2 ] && return ${RET}
		read -r -p "locale for website: " LOCALE
		LOCALE="${LOCALE:-en}"
	done
}

function run_build() {
	  # run build inside the container
    docker exec -it yunikorn-site-local /bin/bash -c "yarn build"
    [ $? -ne 0 ] && echo "yarn build failed" && return 1
    return 0
}

function print_usage() {
  cat <<EOF
Usage: $(basename "$0") run [locale] | build | clean | help
    run     build the website, and launch the server in a docker image.
            a locale can be specified, currently supported: "en", "zh-cn"
    build   create a production build, input for manual update of the website.
    clean   remove old build and cached files.
    help    print this message.

Description:
  This command builds and launches the website server inside a docker image,
  the server is built with the latest content from this repo. When changes are
  made in this directory, the site will be automatically rebuild. The server
  will be automatically refreshed. Be aware that some of the changes require
  the server to be restarted.
  Use ctrl-\ to restart, allowing a locale change (SIGQUIT).
  Use ctrl-c to exit (SIGINT).

  This script must be run from the top directory of the repository.
EOF
}

if [ $# -eq 0 -o $# -gt 2 -o ! -f ./docusaurus.config.js ]; then
  print_usage
  exit 1
fi
RUNOPT=$1
if [ "${RUNOPT}" == "run" ]; then
	LOCALE=en
  if [ $# -eq 2 ]; then
    LOCALE=$2
  fi
  stop
  image_build
  [ $? -eq 1 ] && echo "image build failed" && exit 1
  run_base
  [ $? -eq 1 ] && echo "base run failed, leaving docker image" && exit 1
  run_web
  [ $? -eq 1 ] && echo "web run failed, leaving docker image" && exit 1
  stop
elif [ "${RUNOPT}" == "build" ]; then
  stop
  image_build
  [ $? -eq 1 ] && echo "image build failed" && exit 1
  run_base
  [ $? -eq 1 ] && echo "base run failed, leaving docker image" && exit 1
  run_build
  [ $? -eq 1 ] && echo "build failed, leaving docker image" && exit 1
  stop
elif [ "${RUNOPT}" == "clean" ]; then
  clean
else
  print_usage
fi
