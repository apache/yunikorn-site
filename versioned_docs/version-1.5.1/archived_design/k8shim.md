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

Github repo: https://github.com/apache/yunikorn-k8shim

Please read the [architecture](../design/architecture.md) doc before reading this one, you will need to understand
the 3 layer design of YuniKorn before getting to understand what is the Kubernetes shim.

## The Kubernetes shim

The YuniKorn Kubernetes shim is responsible for talking to Kubernetes, it is responsible for translating the Kubernetes
cluster resources, and resource requests via scheduler interface and send them to the scheduler core.
And when a scheduler decision is made, it is responsible for binding the pod to the specific node. All the communication
between the shim and the scheduler core is through the scheduler-interface.

## The admission controller

The admission controller runs in a separate pod, it runs a
[mutation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook)
and a [validation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook), where:

1. The `mutation webhook` mutates pod spec by:
   - Adding `schedulerName: yunikorn`
     - By explicitly specifying the scheduler name, the pod will be scheduled by YuniKorn scheduler.
   - Adding `applicationId` label
     - When a label `applicationId` exists, reuse the given applicationId.
     - When a label `spark-app-selector` exists, reuse the given spark app ID.
     - Otherwise, assign a generated application ID for this pod, using convention: `yunikorn-<namespace>-autogen`. This is unique per namespace.
   - Adding `queue` label
     - When a label `queue` exists, reuse the given queue name. Note, if placement rule is enabled, values set in the label is ignored.
     - Otherwise, adds `queue: root.default`
   - Adding `disableStateAware` label
     - If pod was assigned a generated applicationId by the admission controller, also set `disableStateAware: true`. This causes the generated application
       to immediately transition from the `Starting` to `Running` state so that it will not block other applications.
2. The `validation webhook` validates the configuration set in the configmap
   - This is used to prevent writing malformed configuration into the configmap.
   - The validation webhook calls scheduler [validation REST API](api/scheduler.md#configuration-validation) to validate configmap updates.

### Admission controller deployment

By default, the admission controller is deployed as part of the YuniKorn Helm chart installation. This can be disabled if necessary (though not recommended) by setting the Helm parameter `embedAdmissionController` to `false`.

On startup, the admission controller performs a series of tasks to ensure that it is properly registered with Kubernetes:
1. Loads a Kubernetes secret called `admission-controller-secrets`. This secret stores a pair of CA certificates which are used to sign the TLS server certificate used by the admission controller.
2. If the secret cannot be found or either CA certificate is within 90 days of expiration, generates new certificate(s). If a certificate is expiring, a new one is generated with an expiration of 12 months in the future. If both certificates are missing or expiring, the second certificate is generated with an expiration of 6 months in the future. This ensures that both certificates do not expire at the same time, and that there is an overlap of trusted certificates.
3. If the CA certificates were created or updated, writes the secrets back to Kubernetes.
4. Generates an ephemeral TLS server certificate signed by the CA certificate with the latest expiration date.
5. Validates, and if necessary, creates or updates the Kubernetes webhook configurations named `yunikorn-admission-controller-validations` and `yunikorn-admission-controller-mutations`. If the CA certificates have changed, the webhooks will also be updated. These webhooks allow the Kubernetes API server to connect to the admission controller service to perform configmap validations and pod mutations. 
6. Starts up the admission controller HTTPS server.

Additionally, the admission controller also starts a background task to wait for CA certificates to expire. Once either certificate is expiring within the next 30 days, new CA and server certificates are generated, the webhook configurations are updated, and the HTTPS server is quickly restarted. This ensures that certificates rotate properly without downtime.

In production clusters, it is recommended to deploy the admission controller with two replicas by setting the Helm parameter `admissionController.replicaCount` to `2`. This will ensure that at least one admission controller webhook is reachable by the Kubernetes API server at all times. In this configuration, the CA certificates and webhook configurations are shared between the instances.
