---
id: user_guide
title: Get Started
slug: /
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

Before reading this guide, we assume you either have a Kubernetes cluster, or a local Kubernetes dev environment, e.g MiniKube.
It is also assumed that `kubectl` is on your path and properly configured.
Follow this [guide](developer_guide/env_setup.md) on how to setup a local Kubernetes cluster using docker-desktop.

## Install

The easiest way to get started is to use our Helm Charts to deploy YuniKorn on an existing Kubernetes cluster.
It is recommended to use [Helm 3](https://helm.sh/)  or later versions. (Follow this [guide](https://helm.sh/docs/intro/install/) to install Helm on your computer)

```shell script
helm repo add yunikorn https://apache.github.io/yunikorn-release
helm repo update
kubectl create namespace yunikorn
helm install yunikorn yunikorn/yunikorn --namespace yunikorn
```

By default, the helm chart will install the scheduler, web-server and the admission-controller in the cluster.
When `admission-controller` is installed, it simply routes all traffic to YuniKorn. That means the resource scheduling
is delegated to YuniKorn. You can disable it by setting `embedAdmissionController` flag to `false` during the helm install.

If you want to use a specific version of YuniKorn, you can add the `--version` flag to the `helm install` command as follows:
```shell script
helm install yunikorn yunikorn/yunikorn --namespace yunikorn --version {version}
```

You can check [YuniKorn Helm hub page](https://artifacthub.io/packages/helm/yunikorn/yunikorn) to see the available versions and further configuration options for YuniKorn Helm chart.

If you don't want to use helm charts, you can find our step-by-step
tutorial [here](developer_guide/deployment.md).

## Uninstall

Run the following command to uninstall YuniKorn:
```shell script
helm uninstall yunikorn --namespace yunikorn
```

## Access the Web UI

When the scheduler is deployed, the web UI is also deployed in a container.
Port forwarding for the web interface on the standard port can be turned on via:

```
kubectl port-forward svc/yunikorn-service 9889:9889 -n yunikorn
```

`9889` is the default port for web UI.
Once this is done, web UI will be available at: `http://localhost:9889`.

![UI Screenshots](./../assets/yk-ui-screenshots.gif)

YuniKorn UI provides a centralised view for cluster resource capacity, utilization, and all application info.

Besides, YuniKorn also exposes its scheduling metrics via Prometheus.

If you want to monitor the YuniKorn core services by using Prometheus and Grafana, you can find our step-by-step tutorial [here](../user_guide/observability/prometheus.md).
