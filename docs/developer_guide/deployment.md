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
scheduler and it is majorly for developers.

## Build docker image

Under project root of the `yunikorn-k8shim`, run the command to build an image using the map for the configuration:
```
make image
```

This command will build an image. The image will be tagged with a default version and image tag.

**Note** the default build uses a hardcoded user and tag. You *must* update the `IMAGE_TAG` variable in the `Makefile` to push to an appropriate repository. 

**Note** the latest yunikorn images in docker hub are not updated anymore due to ASF policy. Hence, you should build both scheduler image and web image locally before deploying them.

## Setup RBAC

The first step is to create the RBAC role for the scheduler, see [yunikorn-rbac.yaml](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/deployments/scheduler/yunikorn-rbac.yaml)
```
kubectl create -f scheduler/yunikorn-rbac.yaml
```
The role is a requirement on the current versions of kubernetes.

## Create the ConfigMap

This must be done before deploying the scheduler. It requires a correctly setup kubernetes environment.
This kubernetes environment can be either local or remote. 

- download configuration file if not available on the node to add to kubernetes:
```
curl -o queues.yaml https://raw.githubusercontent.com/apache/incubator-yunikorn-k8shim/master/conf/queues.yaml
```
- create ConfigMap in kubernetes:
```
kubectl create configmap yunikorn-configs --from-file=queues.yaml
```
- check if the ConfigMap was created correctly:
```
kubectl describe configmaps yunikorn-configs
```

**Note** if name of the ConfigMap is changed the volume in the scheduler yaml file must be updated to reference the new name otherwise the changes to the configuration will not be picked up. 

## Attach ConfigMap to the Scheduler Pod

The ConfigMap is attached to the scheduler as a special volume. First step is to specify where to mount it in the pod:
```yaml
  volumeMounts:
    - name: config-volume
      mountPath: /etc/yunikorn/
```
Second step is to link the mount point back to the configuration map created in kubernetes:
```yaml
  volumes:
    - name: config-volume
      configMap:
        name: yunikorn-configs
``` 

Both steps are part of the scheduler yaml file, an example can be seen at [scheduler.yaml](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/deployments/scheduler/scheduler.yaml)
for reference.

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

Note: Admission controller abstracts the addition of `schedulerName` and `applicationId` from the user and hence, routes all traffic to YuniKorn. If you use helm chart to deploy, it will install admission controller along with the scheduler.

## Access to the web UI

When the scheduler is deployed, the web UI is also deployed in a container.
Port forwarding for the web interface on the standard ports can be turned on via:

```
POD=`kubectl get pod -l app=yunikorn -o jsonpath="{.items[0].metadata.name}"` && \
kubectl port-forward ${POD} 9889 9080
```

`9889` is the default port for Web UI, `9080` is the default port of scheduler's Restful service where web UI retrieves info from.
Once this is done, web UI will be available at: http://localhost:9889.

## Configuration Hot Refresh

YuniKorn supports to load configuration changes automatically from attached configmap. Simply update the content in the configmap,
that can be done either via Kubernetes dashboard UI or commandline. _Note_, changes made to the configmap might have some
delay to be picked up by the scheduler.



