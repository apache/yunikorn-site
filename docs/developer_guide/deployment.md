---
id: deployment
title: Deploy to Kubernetes
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

The easiest way to deploy YuniKorn is to leverage our [helm charts](https://hub.helm.sh/charts/yunikorn/yunikorn),
you can find the guide [here](get_started/get_started.md). This document describes the manual process to deploy YuniKorn
scheduler and admission controller. It is primarily intended for developers.

**Note** The primary source of deployment information is the Helm chart, which can be found at [yunikorn-release](https://github.com/apache/yunikorn-release/). Manual deployment may lead to out-of-sync configurations, see [deployments/scheduler](https://github.com/apache/yunikorn-k8shim/tree/master/deployments/scheduler)

## Build docker image

Under project root of the `yunikorn-k8shim`, run the command to build an image using the map for the configuration:
```
make image
```

This command will build an image. The image will be tagged with a default version, image tag and your build architecture. 

**Note** the default build uses a hardcoded user and tag. You *must* update the `IMAGE_TAG` variable in the `Makefile` to push to an appropriate repository. 

**Note** the latest yunikorn images in docker hub are not updated anymore due to ASF policy. Hence, you should build both scheduler image and web image locally before deploying them.

**Note** the imaging tagging includes your build architecture. For Intel, it would be `amd64` and for Mac M1, it would be `arm64`.

## Setup RBAC for Scheduler
In the example, RBAC are configured for the yuniKorn namespace.
The first step is to create the RBAC role for the scheduler, see [yunikorn-rbac.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/yunikorn-rbac.yaml)
```
kubectl create -f deployments/scheduler/yunikorn-rbac.yaml
```
The role is a requirement on the current versions of kubernetes.

## Create/Update the ConfigMap

This must be done before deploying the scheduler. It requires a correctly setup kubernetes environment.
This kubernetes environment can be either local or remote. 

- download configuration file if not available on the node to add to kubernetes:
```
curl -o yunikorn-configs.yaml https://raw.githubusercontent.com/apache/yunikorn-k8shim/master/deployments/scheduler/yunikorn-configs.yaml
```
- modify the content of yunikorn-configs.yaml file as needed, and create ConfigMap in kubernetes:
```
kubectl create configmap yunikorn-configs --from-file=yunikorn-configs.yaml
```
- Or update ConfigMap in kubernetes:
```
kubectl create configmap yunikorn-configs --from-file=yunikorn-configs.yaml -o yaml --dry-run=client | kubectl apply -f -
```
- check if the ConfigMap was created/updated correctly:
```
kubectl describe configmaps yunikorn-configs
```

## Deploy the Scheduler

The scheduler can be deployed with following command.
```
kubectl create -f deployments/scheduler/scheduler.yaml
```

The deployment will run 2 containers from your pre-built docker images in 1 pod,

* yunikorn-scheduler-core (yunikorn scheduler core and shim for K8s)
* yunikorn-scheduler-web (web UI)

Alternatively, the scheduler can be deployed as a K8S scheduler plugin:
```
kubectl create -f deployments/scheduler/plugin.yaml
```

The pod is deployed as a customized scheduler, it will take the responsibility to schedule pods which explicitly specifies `schedulerName: yunikorn` in pod's spec. In addition to the `schedulerName`, you will also have to add a label `applicationId` to the pod.
```yaml
  metadata:
    name: pod_example
    labels:
      applicationId: appID
  spec:
    schedulerName: yunikorn
```

Note: Admission controller abstracts the addition of `schedulerName` and `applicationId` from the user and hence, routes all traffic to YuniKorn. If you use helm chart to deploy, it will install admission controller along with the scheduler. Otherwise, proceed to the steps below to manually deploy the admission controller if running non-example workloads where `schedulerName` and `applicationId` are not present in the pod spec and metadata, respectively.


## Setup RBAC for Admission Controller

Before the admission controller is deployed, we must create its RBAC role, see [admission-controller-rbac.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/admission-controller-rbac.yaml).

```
kubectl create -f deployments/scheduler/admission-controller-rbac.yaml
```

## Create the Secret

Since the admission controller intercepts calls to the API server to validate/mutate incoming requests, we must deploy an empty secret
used by the webhook server to store TLS certificates and keys. See [admission-controller-secrets.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/admission-controller-secrets.yaml).

```
kubectl create -f deployments/scheduler/admission-controller-secrets.yaml
```

## Deploy the Admission Controller

Now we can deploy the admission controller as a service. This will automatically validate/modify incoming requests and objects, respectively, in accordance with the [example in Deploy the Scheduler](#Deploy-the-Scheduler). See the contents of the admission controller deployment and service in [admission-controller.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/admission-controller.yaml).

```
kubectl create -f deployments/scheduler/admission-controller.yaml
```

## Access to the web UI

When the scheduler is deployed, the web UI is also deployed in a container.
Port forwarding for the web interface on the standard ports can be turned on via:

```
kubectl port-forward svc/yunikorn-service 9889 9080
```

`9889` is the default port for Web UI, `9080` is the default port of scheduler's Restful service where web UI retrieves info from.
Once this is done, web UI will be available at: http://localhost:9889.

## Configuration Hot Refresh

YuniKorn uses config maps for configurations, and it supports loading configuration changes automatically by watching config map changes using shared informers.

To make configuration changes, simply update the content in the configmap, which can be done either via Kubernetes dashboard UI or command line. Note, changes made to the configmap might have some delay to be picked up by the scheduler.

