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

YuniKorn always works with a container orchestrator system. Currently, a Kubernetes shim [yunikorn-k8shim](https://github.com/apache/incubator-yunikorn-k8shim)
is provided in our repositories, you can leverage it to develop YuniKorn scheduling features and integrate with Kubernetes.
This document describes resources how to setup dev environment and how to do the development.

## Development Environment setup

Read the [environment setup guide](developer_guide/env_setup.md) first to setup Docker and Kubernetes development environment.

## Build YuniKorn for Kubernetes

Prerequisite:
- Go 1.16+

You can build the scheduler for Kubernetes from [yunikorn-k8shim](https://github.com/apache/incubator-yunikorn-k8shim) project.
The build procedure will build all components into a single executable that can be deployed and running on Kubernetes.

Start the integrated build process by pulling the `yunikorn-k8shim` repository:
```bash
mkdir $HOME/yunikorn/
cd $HOME/yunikorn/
git clone https://github.com/apache/incubator-yunikorn-k8shim.git
```
At this point you have an environment that will allow you to build an integrated image for the YuniKorn scheduler.

### A note on Go modules and git version
Go use git to fetch module information.
Certain modules cannot be retrieved if the git version installed on the machine used to build is old.
A message similar to the one below will be logged when trying to build for the first time.
```text
go: finding modernc.org/mathutil@v1.0.0
go: modernc.org/golex@v1.0.0: git fetch -f origin refs/heads/*:refs/heads/* refs/tags/*:refs/tags/* in <location>: exit status 128:
	error: RPC failed; result=22, HTTP code = 404
	fatal: The remote end hung up unexpectedly
```
Update git to a recent version to fix this issue.
Git releases later than 1.22 are known to work.

### Build Docker image

Building a docker image can be triggered by following command.

```
make image
```

The image with the build in configuration can be deployed directly on kubernetes.
Some sample deployments that can be used are found under [deployments](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/scheduler) directory.
For the deployment that uses a config map you need to set up the ConfigMap in kubernetes.
How to deploy the scheduler with a ConfigMap is explained in the [scheduler configuration deployment](developer_guide/deployment.md) document.

The image build command will first build the integrated executable and then create the docker image.
Currently, there are some published docker images under [this docker hub repo](https://hub.docker.com/r/apache/yunikorn), you are free to fetch and use.
The default image tags are not suitable for deployments to an accessible repository as it uses a hardcoded user and would push to Docker Hub with proper credentials.
You *must* update the `TAG` variable in the `Makefile` to push to an accessible repository.
When you update the image tag be aware that the deployment examples given will also need to be updated to reflect the same change.

### Inspect the docker image

The docker image built from previous step has embedded some important build info in image's metadata. You can retrieve
these info with docker `inspect` command.

```
docker inspect apache/yunikorn:scheduler-latest
```

This info includes git revisions (last commit SHA) for each component, to help you understand which version of the source code
was shipped by this image. They are listed as docker image `labels`, such as

```
"Labels": {
    "BuildTimeStamp": "2019-07-16T23:08:06+0800",
    "Version": "0.1",
    "yunikorn-core-revision": "dca66c7e5a9e",
    "yunikorn-k8shim-revision": "bed60f720b28",
    "yunikorn-scheduler-interface-revision": "3df392eded1f"
}
```

### Dependencies

The dependencies in the projects are managed using [go modules](https://blog.golang.org/using-go-modules).
Go Modules require at least Go version 1.11 to be installed on the development system.

If you want to modify one of the projects locally and build with your local dependencies you will need to change the module file. 
Changing dependencies uses mod `replace` directives as explained in the [Update dependencies](#Updating dependencies).

The YuniKorn project has four repositories three of those repositories have a dependency at the go level.
These dependencies are part of the go modules and point to the github repositories.
During the development cycle it can be required to break the dependency on the committed version from github.
This requires making changes in the module file to allow loading a local copy or a forked copy from a different repository.  

#### Affected repositories
The following dependencies exist between the repositories:

| repository| depends on |
| --- | --- |
| yunikorn-core | yunikorn-scheduler-interface | 
| yunikorn-k8shim | yunikorn-scheduler-interface, yunikorn-core |
| yunikorn-scheduler-interface | none |
| yunikorn-web | yunikorn-core |

The `yunikorn-web` repository has no direct go dependency on the other repositories. However any change to the `yunikorn-core` webservices can affect the web interface. 

#### Making local changes

To make sure that the local changes will not break other parts of the build you should run:
- A full build `make` (build target depends on the repository)
- A full unit test run `make test`

Any test failures should be fixed before proceeding.

#### Updating dependencies

The simplest way is to use the `replace` directive in the module file. The `replace` directive allows you to override the import path with a new (local) path.
There is no need to change any of the imports in the source code. The change must be made in the `go.mod` file of the repository that has the dependency. 

Using `replace` to use of a forked dependency, such as:
```
replace github.com/apache/incubator-yunikorn-core => example.com/some/forked-yunikorn
```

There is no requirement to fork and create a new repository. If you do not have a repository you can use a local checked out copy too. 
Using `replace` to use of a local directory as a dependency:
```
replace github.com/apache/incubator-yunikorn-core => /User/example/local/checked-out-yunikorn
```
and for the same dependency using a relative path:
```
replace github.com/apache/incubator-yunikorn-core => ../checked-out-yunikorn
```
Note: if the `replace` directive is using a local filesystem path, then the target must have the `go.mod` file at that location.

Further details on the modules' wiki: [When should I use the 'replace' directive?](https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive).

## Build the web UI

Example deployments reference the [YuniKorn web UI](https://github.com/apache/incubator-yunikorn-web). 
The YuniKorn web UI has its own specific requirements for the build. The project has specific requirements for the build follow the steps in the README to prepare a development environment and build how to build the projects.
The scheduler is fully functional without the web UI. 

## Locally run the integrated scheduler

When you have a local development environment setup you can run the scheduler in your local kubernetes environment.
This has been tested in a Docker desktop with 'Docker for desktop' and Minikube. See the [environment setup guide](developer_guide/env_setup.md) for further details.

```
make run
```
It will connect with the kubernetes cluster using the users configured configuration located in `$HOME/.kube/config`.

To run YuniKorn in Kubernetes scheduler plugin mode instead, execute:

```
make run_plugin
```

You can also use the same approach to run the scheduler locally but connecting to a remote kubernetes cluster,
as long as the `$HOME/.kube/config` file is pointing to that remote cluster.


## Verify external interface changes with e2e tests

Yunikorn has an external REST interface which is validated by end-to-end tests. However, the tests exist in the k8shim repository.
Whenever a change is made to the external interface, make sure that it is validated by running e2e tests or adjust the test cases accordingly.

How to run the tests locally is described [here](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/test/e2e/README.md).
