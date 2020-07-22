# this script must be running from this dir


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
    -v $PWD/yunikorn-site:/incubator-yunikorn-site/build \
    yunikorn/yunikorn-website:latest
  [ "$?" -ne 0 ] && echo "run local docker image failed" && exit 1

  # install dependency in docker container, run build locally
  docker exec -it yunikorn-site-local /bin/bash -c "yarn install"
  [ "$?" -ne 0 ] && echo "yarn install failed" && exit 1

  docker exec -it yunikorn-site-local /bin/bash -c "yarn build"
  [ "$?" -ne 0 ] && echo "yarn build failed" && exit 1

  docker exec -it yunikorn-site-local /bin/bash -c "yarn start --host 0.0.0.0"
  [ "$?" -ne 0 ] && echo "start web-server failed" && exit 1
}

function print_usage() {
    cat <<EOF
Usage: $(basename "$0") run | logs | help
    run        build the website, and launch the server locally in dev mode.
    logs       dump server logs.

Description:
  This command builds and luanches the website server locally, the server is built with the latest content within
  this repo. When changes are made in this directory, it can be automatically refreshed to the local server. Be aware
  that some of the changes require the restart of the server, just run the command again.

Have fun!!!
EOF
}

if [ $# -ne 1 ]; then
  print_usage
  exit 1
fi

opt=$1
if [ "$opt" == "run" ]; then
  docker stop yunikorn-site-local &>/dev/null
  docker rm -f yunikorn-site-local &>/dev/null
  docker rmi yunikorn/yunikorn-website:latest &>/dev/null

  build
  run
elif [ "$opt" == "logs" ]; then
  docker logs yunikorn-site-local
elif [ "$opt" == "help" ]; then
  print_usage
  exit 0
else
  print_usage
  exit 0
fi
