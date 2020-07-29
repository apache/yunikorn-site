---
id: k8shim
title: Kubernetes Shim Design
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

Github repo: https://github.com/apache/incubator-yunikorn-k8shim

Please read the [architecture](architecture.md) doc before reading this one, you will need to understand
the 3 layer design of YuniKorn before getting to understand what is the Kubernetes shim.

## The Kubernetes shim

The YuniKorn Kubernetes shim is responsible for talking to Kubernetes, it is responsible for translating the Kubernetes
cluster resources, and resource requests via scheduler interface and send them to the scheduler core.
And when a scheduler decision is made, it is responsible for binding the pod to the specific node. All the communication
between the shim and the scheduler core is through the scheduler-interface.

## The admission controller

The admission controller runs in a separate pod, it runs a
[mutation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook)
and a [validation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook), where:

1. The `mutation webhook` mutates pod spec by:
   - adding `schedulerName: yunikorn`
     - by explicitly specifying the scheduler name, the pod will be scheduled by YuniKorn scheduler
   - adding `applicationId` label
     - when a label `applicationId` exists, reuse the given applicationId
     - when a label `spark-app-selector` exists, reuse the given spark app ID
     - otherwise, assign a generated application ID for this pod, using convention: `yunikorn-<namespace>-autogen`. this is unique per namespace. 
   - adding `queue` label
     - when a label `queue` exists, reuse the given queue name. Note, if placement rule is enabled, values set in the label is ignored
     - otherwise, adds `queue: root.default`
2. The `validation webhook` validates the configuration set in the configmap
   - this is used to prevent writing malformed configuration into the configmap
   - the validation webhook calls scheduler [validation REST API](api/scheduler.md#configuration-validation) to validate configmap updates

### Admission controller deployment

Currently, the deployment of the admission-controller is done as a `post-start` hook in the scheduler deployment, similarly, the
uninstall is done as a `pre-stop` hook. See the related code [here](https://github.com/apache/incubator-yunikorn-release/blob/56e580af24ed3433e7d73d9ea556b19ad7b74337/helm-charts/yunikorn/templates/deployment.yaml#L80-L85).
During the installation, it is expected to always co-locate the admission controller with the scheduler pod, this is done
by adding the pod-affinity in the admission-controller pod, like:

```yaml
podAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
      matchExpressions:
      - key: component
        operator: In
        values:
        - yunikorn-scheduler
      topologyKey: "kubernetes.io/hostname"
```

it also tolerates all the taints in case the scheduler pod has some toleration set.

```yaml
tolerations:
- operator: "Exists"
```


