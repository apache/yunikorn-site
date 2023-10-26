---
id: build
title: Build and Run
---

<!--
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

YuniKorn always works with a container orchestrator system. Currently, a
Kubernetes shim ([yunikorn-k8shim](https://github.com/apache/yunikorn-k8shim))
is provided which provides a drop-in scheduler for the Kubernetes platform.
This document describes how to setup and use a local development environment.

## Dev Environment setup

Read the [Dev Environment Setup](developer_guide/env_setup.md) guide first to
setup Docker and Kubernetes development environment.

## Build YuniKorn

Prerequisites:
- Golang: check the `.go_version` file in the root of the repositories for the
version Yunikorn requires. The minimum version can change per release branch.
Using earlier Go versions will cause compilation issues. 

You can build the scheduler for Kubernetes from the [yunikorn-k8shim](https://github.com/apache/yunikorn-k8shim)
project. The build procedure will build all components into a single executable
that can be deployed and running on Kubernetes.

Start the integrated build process by pulling the `yunikorn-k8shim` repository:
```bash
mkdir $HOME/yunikorn/
cd $HOME/yunikorn/
git clone https://github.com/apache/yunikorn-k8shim.git
```

At this point you have an environment that will allow you to build an
integrated image for the YuniKorn scheduler.

### Build Docker images

Building the Docker images can be triggered by following command:
```shell script
make image
```

This will generate images for the scheduler, scheduler plugin, and admission
controller.

The images created can be deployed directly on Kubernetes.
Some sample deployments that can be used are found under the
[deployments/scheduler](https://github.com/apache/yunikorn-k8shim/tree/master/deployments/scheduler)
directory of the `yunikorn-k8shim` repository. Alternatively, the Helm charts
located within the [helm-charts](https://github.com/apache/yunikorn-release/tree/master/helm-charts)
directory of the `yunikorn-release` repository may be used. These match what is used
for release builds.

The configuration of YuniKorn can be customized via a ConfigMap as explained  in the
[scheduler configuration deployment](developer_guide/deployment.md) document.

The `make image` build command will first build the integrated executables and
then create the docker images. If you want to use pre-built images based on an
offical release, please check the [Docker Hub repo](https://hub.docker.com/r/apache/yunikorn).

The default image tags are not suitable for deployments to a private
repository as these would attempt to push to Docker Hub without proper
credentials. You *must* update the `REGISTRY` variable in the `Makefile` to
push to an accessible repository. When you update the image tag be aware that
the deployment examples given will also need to be updated to reflect the same
change.

### Inspect Docker images

The Docker images built from previous step have embedded some important build
info in the image metadata. You can retrieve this information with docker
`inspect` command:

```shell script
docker inspect apache/yunikorn:scheduler-amd64-latest
docker inspect apache/yunikorn:scheduler-plugin-amd64-latest
docker inspect apache/yunikorn:admission-controller-amd64-latest
```

The `amd64` tag is dependent on your host architecture (i.e. for Intel it would
be `amd64` and for Mac M1, it would be `arm64`).

This info includes git revisions (last commit SHA) for each component, to help
you understand which version of the source code was shipped by this image. They
are listed as docker image `labels`, such as

```json
"Labels": {
    "BuildTimeStamp": "2019-07-16T23:08:06+0800",
    "Version": "0.1",
    "yunikorn-core-revision": "dca66c7e5a9e",
    "yunikorn-k8shim-revision": "bed60f720b28",
    "yunikorn-scheduler-interface-revision": "3df392eded1f"
}
```

### Dependencies

The dependencies in the projects are managed using
[go modules](https://blog.golang.org/using-go-modules).

If you want to modify one of the projects locally and build with your local
dependencies you will need to change the module file.  Changing dependencies
requires using `go.mod` `replace` directives as explained in the
[Update dependencies](#updating-dependencies) section.

The YuniKorn project has four code repositories:
  - [yunikorn-scheduler-interface](https://github.com/apache/yunikorn-scheduler-interface)
    (protobuf interface between core and shim)
  - [yunikorn-core](https://github.com/apache/yunikorn-core)
    (core scheduler logic)
  - [yunikorn-k8shim](https://github.com/apache/yunikorn-k8shim)
    (Kubernetes-specific shim)
  - [yunikorn-web](https://github.com/apache/yunikorn-web)
    (YuniKorn Web UI)

Each of these dependencies is a Go module and there are dependencies between
them. During the development cycle it can be required to break the dependency
on the committed version from github. This requires making changes in the module
file to allow loading a local copy or a forked copy from a different repository.  

Additionally, there are two additional auxiliary repositories:
  - [yunikorn-release](https://github.com/apache/yunikorn-release)
    (release management scripts and official Helm charts)
  - [yunikorn-site](https://github.com/apache/yunikorn-site)
    (source of the yunikorn.apache.org web site)

#### Affected repositories
The following dependencies exist between the repositories:

| Repository| Depends on |
| --- | --- |
| yunikorn-core | yunikorn-scheduler-interface | 
| yunikorn-k8shim | yunikorn-scheduler-interface, yunikorn-core |
| yunikorn-scheduler-interface | none |
| yunikorn-web | none |

The `yunikorn-web` repository has no direct go dependency on the other
repositories. However any change to the `yunikorn-core` web services can affect
the web interface. 

#### Making local changes

To make sure that the local changes will not break other parts of the
build you should run:
- A full build `make` (build target depends on the repository)
- A full unit test run `make test`

Any test failures should be fixed before proceeding.

#### Updating dependencies

The simplest way is to use the `replace` directive in the module file.
The `replace` directive allows you to override the import path with a new
(local) path. There is no need to change any of the imports in the source code.
The change must be made in the `go.mod` file of the repository that has the
dependency. 

Using `replace` to use of a forked dependency, such as:
```
replace github.com/apache/yunikorn-core => example.com/some/forked-yunikorn
```

There is no requirement to fork and create a new repository. If you do not have
a repository you can use a local checked out copy too. 

Using `replace` to use of a local directory as a dependency:
```
replace github.com/apache/yunikorn-core => /User/example/local/checked-out-yunikorn
```

For the same dependency using a relative path:
```
replace github.com/apache/yunikorn-core => ../checked-out-yunikorn
```
Note: if the `replace` directive is using a local filesystem path, then the target
must have a `go.mod` file at that location.

Further details can be found on the Go Wiki:
[When should I use the 'replace' directive?](https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive)

## Build the Web UI

Example deployments reference the
[YuniKorn Web UI](https://github.com/apache/yunikorn-web). The `yunikorn-web`
project has specific requirements for the build. Follow the steps in the
[README](https://github.com/apache/yunikorn-web/blob/master/README.md) to prepare
a development environment and build the Web UI. However, the scheduler is fully
functional without the Web UI.

## Run YuniKorn locally

When you have a local development environment setup you can run the scheduler
in your local Kubernetes environment. This has been tested in a desktop
enviornment with Docker Desktop, Minikube, and Kind. See the
[Dev Environment Setup](developer_guide/env_setup.md) guide for further details.

To run a local instance of the scheduler:

```shell script
make run
```

This will launch a local scheduler and connect to the Kubernetes cluster
referenced in your `KUBECONFIG` or `$HOME/.kube/config`.

To run YuniKorn in Kubernetes scheduler plugin mode instead, execute:

```
make run_plugin
```

You can also use the same approach to run the scheduler locally but connecting
to a remote kubernetes cluster, as long as the `$HOME/.kube/config` file
is pointing to that remote cluster.

## Run end-to-end tests

In addition to the unit tests for each project, YuniKorn contains many e2e
(end-to-end) tests in the `yunikorn-k8shim` repository which validate
functionaliy of the scheduler on a functioning Kubernetes cluster.

How to run the tests locally is described
[here](https://github.com/apache/yunikorn-k8shim/blob/master/test/e2e/README.md).
