---
id: openshift_development
title: Development in CodeReady Containers
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

YuniKorn is tested against OpenShift and developers can set up their local environment to test patches against OpenShift.
Our recommended local environment uses CodeReady containers.

## Set up a running CRC cluster

1. Download CodeReady Container binaries

   Select your OS from the dropdown list then click on "Download" (On a Mac, you'll download crc-macos-amd64.tar.xz; on Linux, crc-linux-amd64.tar.xz).
   You'll be asked to connect using your Red Hat login. If you don't have one, just click on "Create one now". You do *not* need a Red Hat subscription for this.
   
   Once logged in, download CodeReady Containers binary and the pull secret.
   
1. Unzip the tar file.

   ```bash
   tar -xvzf crc-macos-amd64.tar.xz
   ```
   
1. Move the crc binary under your path. Like

   ```bash
   sudo cp `pwd`/crc-macos-$CRCVERSION-amd64/crc /usr/local/bin
   ```

1. Configure CRC in accordance with your hardware capabilities.

   ```bash
   crc config set memory 16000
   crc config set cpus 12
   crc setup
   ```
1. Start the CRC and open the console.

   ```bash
   crc start --pull-secret-file pull-secret.txt
   crc console
   ```

## Testing a patch

The following steps assume you have a running CRC cluster in your laptop. Note that these steps are not tested against a remote CRC cluster. 

1. Access your environment through the `oc` command.

   Type in the `crc oc-env` command to a shell.
   ```bash
   $ crc oc-env
   export PATH="/Users/<user>/.crc/bin/oc:$PATH"
   # Run this command to configure your shell:
   # eval $(crc oc-env)
   ```
   So you need to type in this to access the `oc` comamnd:
   ```
   eval $(crc oc-env)
   ```

1. Log in to `oc`. After the CRC has started it will display a similar message:

   ```
   To access the cluster, first set up your environment by following 'crc oc-env' instructions.
   Then you can access it by running 'oc login -u developer -p developer https://api.crc.testing:6443'.
   To login as an admin, run 'oc login -u kubeadmin -p duduw-yPT9Z-hsUpq-f3pre https://api.crc.testing:6443'.
   To access the cluster, first set up your environment by following 'crc oc-env' instructions.
   ```

   Use the `oc login -u kubeadmin ...` command. 

1. Get the URL of the local OpenShift cluster's internal private Docker repository by typing the command below.

   ```bash
   $ oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'
   default-route-openshift-image-registry.apps-crc.testing
   ```

   By default it should be `default-route-openshift-image-registry.apps-crc.testing`. Change the steps above, if the displayed URL is different.

1. Prepare the Docker images.

   You can read more about this at the bottom, in the *Using custom images* section.

1. Prepare the helm chart.

   If you want to use custom Docker images, replace the images in the chart's `values.yaml` config file.

   Note that if you manually pushed the Docker image to the `default-route-openshift-image-registry.apps-crc.testing` docker registry directly you need to have valid certs to access it. 
   On OpenShift there's service for this: `image-registry.openshift-image-registry.svc`, which is easier to use.

   For example, if you want to override all of the three Docker images you should use the following configs:
   ```yaml
   image:
     repository: image-registry.openshift-image-registry.svc:5000/yunikorn/yunikorn
     tag: scheduler-latest
     pullPolicy: Always
   
   admission_controller_image:
     repository: image-registry.openshift-image-registry.svc:5000/yunikorn/yunikorn
     tag: admission-latest
     pullPolicy: Always
   
   web_image:
     repository: image-registry.openshift-image-registry.svc:5000/yunikorn/yunikorn-web
     tag: latest
     pullPolicy: Always
   ``` 

   You can find it in the yunikorn-release repo's helm chart directory.

1. Install the helm charts.

   ```bash
   helm install yunikorn . -n yunikorn
   ```

## Using custom images

### Podman

1. Log in into Podman using the following command.

   ```bash
   podman login --tls-verify=false -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
   ```

1. Build the image in the repository e.g. in shim using the generic `make image` command.

1. Verify that the image is present in the repository.

   ```bash
   podman images
   REPOSITORY                TAG              IMAGE ID     CREATED            SIZE
   localhost/apache/yunikorn admission-latest 19eb41241d64 About a minute ago 53.5 MB
   localhost/apache/yunikorn scheduler-latest e60e09b424d9 About a minute ago 543 MB
   ```

## Directly pushing OS Image Registry

1. Create the images that you wish to replace.

   You can either build new images locally or use official (maybe mix both).
      * For the -shim and -web images checkout the repository (optionally make your changes) and type the following command:
      ```bash
      make clean image REGISTRY=default-route-openshift-image-registry.apps-crc.testing/<project>/<name>:<tag>
      ```
      Note that in OpenShift a project is equivalent a Kubernetes namespace. The `yunikorn` project/namespace is recommended.
      * Using an official image is possible by, retagging it with by the `docker tag` command. 
      ```bash
      docker tag apache/yunikorn:scheduler-latest default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
      ```

1. Login to the Docker repository.
   ```bash
   docker login -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
   ```

1. Push the Docker images to the internal Docker repository
   ```
   docker push default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
   ```
