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

TODO: there should go Marc's steps

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

2. Log in to `oc`. After the CRC has started it will display a similar message:

```
To access the cluster, first set up your environment by following 'crc oc-env' instructions.
Then you can access it by running 'oc login -u developer -p developer https://api.crc.testing:6443'.
To login as an admin, run 'oc login -u kubeadmin -p duduw-yPT9Z-hsUpq-f3pre https://api.crc.testing:6443'.
To access the cluster, first set up your environment by following 'crc oc-env' instructions.
```

Use the `oc login -u kubeadmin ...` command. 

3. Get the URL of the local OpenShift cluster's internal private Docker repository by typing the command below.

```bash
$ oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'
default-route-openshift-image-registry.apps-crc.testing
```

By default it should be `default-route-openshift-image-registry.apps-crc.testing`. Change the steps above, if the displayed URL is different.

4. Create the images that you wish to replace.

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

5. Login to the Docker repository.
```
docker login -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
```

6. Push the Docker images to the internal Docker repository
```
docker push default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
```

7. Prepare the helm chart.

If you want to use custom Docker images, replace the images in the chart's `values.yaml` config file.

Note that you need to have valid certs to use the `default-route-openshift-image-registry.apps-crc.testing` docker registry directly. On OpenShift there's service for this: `image-registry.openshift-image-registry.svc`, which is easier to use.

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

8. Install the helm charts.

```bash
helm install yunikorn . -n yunikorn
```



