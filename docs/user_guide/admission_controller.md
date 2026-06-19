---
id: admission_controller
title: Admission Controller
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

## What is the admission controller

The pod's yaml file can be easily configured through the admission controller. The admission controller automatically mutates the pod spec so that it can be scheduled by the Yunikorn Scheduler. The admission controller is also responsible for validating configuration additions and updates in the configmap.

The admission controller runs in a separate pod, it runs a [mutation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook)
and a [validation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook).

### Mutation webhook
The `mutation webhook` will add `schedulerName:yunikorn` to the pod spec so that the pod can be scheduled by the Yunikorn scheduler.

In addition, The `mutation webhook` will also add the following labels:
- `applicationId` label. If applicationId or spark-app-selector already exists, it will be used. Otherwise, an applicationId will be generated for the pod. The default is `yunikorn-<namespace>-autogen`. Pods in the same namespace will generate the same applicationId. For other generation methods, please refer to [Service configuration](service_config.md). 
- `queue` label. If there is a queue label, it will be used. Note that if placement rule is enabled, the value set in label will be ignored. Otherwise, `root.default` will be assigned by default. If you want to change the default queue name, please refer to [Service configuration](service_config.md).
- `disableStateAware` label, if the admission controller generates an applicationId for the pod, `disableStateAware: true` must also be set. This will cause the application to immediately transition from "Starting" to "Running" state so that it will not block other applications

When updating a created pod, the admission controller will check whether the userinfo annotation before and after the update is the same. If it is different, the change will not be allowed.
### Validation webhook
The `validation webhook` validates the configuration set in the configmap.This is used to prevent writing malformed configuration into the configmap.
The `validation webhook` calls scheduler [validation REST API](https://yunikorn.apache.org/docs/api/scheduler#configuration-validation) to validate configmap updates.

## Admission controller deployment
By default, the admission controller is deployed as part of the YuniKorn Helm chart installation. This can be disabled if necessary (though not recommended) by setting the Helm parameter `embedAdmissionController` to `false`.

On startup, the admission controller performs a series of tasks to ensure that it is properly registered with Kubernetes:

Loads a Kubernetes secret called `admission-controller-secrets`. This secret stores a pair of CA certificates which are used to sign the TLS server certificate used by the admission controller.
If the secret cannot be found or either CA certificate is within 90 days of expiration, generates new certificate(s). If a certificate is expiring, a new one is generated with an expiration of 12 months in the future. If both certificates are missing or expiring, the second certificate is generated with an expiration of 6 months in the future. This ensures that both certificates do not expire at the same time, and that there is an overlap of trusted certificates.
If the CA certificates were created or updated, writes the secrets back to Kubernetes.
Generates an ephemeral TLS server certificate signed by the CA certificate with the latest expiration date.
Validates, and if necessary, creates or updates the Kubernetes webhook configurations named `yunikorn-admission-controller-validations` and `yunikorn-admission-controller-mutations`. If the CA certificates have changed, the webhooks will also be updated. These webhooks allow the Kubernetes API server to connect to the admission controller service to perform configmap validations and pod mutations.
Starts up the admission controller HTTPS server.

Additionally, the admission controller also starts a background task to wait for CA certificates to expire. Once either certificate is expiring within the next 30 days, new CA and server certificates are generated, the webhook configurations are updated, and the HTTPS server is quickly restarted. This ensures that certificates rotate properly without downtime.

In production clusters, it is recommended to deploy the admission controller with two replicas by setting the Helm parameter `admissionController.replicaCount` to `2`. This will ensure that at least one admission controller webhook is reachable by the Kubernetes API server at all times. In this configuration, the CA certificates and webhook configurations are shared between the instances.

## Configure the admission controller
The admission controller can be configured with the `yunikorn-configs` configmap.

Through the configuration of the admission controller, you can control multiple settings, including specifying the namespace you want or not want Yunikorn to schedule, whether to generate a unique applicationId and default queue name for each application, etc. In addition, the admission controller can be used to control the access of users and groups.

For more details on admission controller configuration, please refer to [Service configuration](service_config.md).

For more information on user and group access management, please view [User&Group Resolutiona](usergroup_resolution.md).

## Example
The following YAML does not set any information related to YuniKorn
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
	labels:
		app: nginx
	name: nginx
spec:
	replicas: 1
	selector:
		matchLabels:
			app: nginx
	template:
		metadata:
			labels:
				app: nginx
			name: nginx
		spec:
			container:
				- name: nginx
					image: "nginx:stable-alpine
					resources:
						requests:
							cpu: "500m"
							memory: "1024M"
```
After deploying it to the cluster, use the following command to view the YAML of the deployed pod.
```shell
kubectl get pod <pod-name> -o yaml -n <namespace>
```
It was found that `schedulerName: yunikorn` and labels such as `queue: root.default` and `applicationId: yunikorn-default-autogen` were added.
```yaml
apiVersion: v1
kind: Pod
metadata:
	annotations:
		yunikorn.apache.org/allow-preemption: "true"
		yunikorn.apache.org/user.info: {...}
	labels:
		app: nginx
		applicationId: yunikorn-default-autogen
		disablesStateAware: "true"
		queuq: root.default
spec:
	schedulerName: yunikorn
```
### Configure admission controller via yunikorn-configs
An example configuration of yunikorn-configs.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yunikorn-configs
data:
  admissionController.webHook.amServiceName: "yunikorn-admission-controller-service"
  admissionController.webHook.schedulerServiceAddress: "yunikorn-service:9080"
  # Schedule only pods in spark-* and mpi-* namespaces with YuniKorn
  admissionController.filtering.processNamespaces: "^spark-,^mpi-"
  # Don't schedule pods in kube-system or fluentd-* namespaces
  admissionController.filtering.bypassNamespaces: "^kube-system$,^fluentd-"
  # Add applicationId labels to pods spark-* namespaces
  admissionController.filtering.labelNamespaces: "^spark-"
  # Don't add applicationId labels to pods noqueue namespaces
  admissionController.filtering.noLabelNamespaces: "^noqueue$"
  admissionController.filtering.generateUniqueAppId: "false"
  # Change default queue to root.mydefault
  admissionController.filtering.defaultQueue: "root.mydefault"
  admissionController.accessControl.bypassAuth: "false"
  admissionController.accessControl.trustControllers: "true"
  admissionController.accessControl.systemUsers: "^system:serviceaccount:kube-system:"
  admissionController.accessControl.externalUsers: ""
  admissionController.accessControl.externalGroups: ""
  queues.yaml: |
    partitions:
      - name: default
        placementrules:
          - name: tag
            value: namespace
            create: true
        queues:
          - name: root
            submitacl: '*'
  
```
Use the following command to create ConfigMap to change settings.
```shell script
kubectl apply -f yunikorn-configs.yaml -n yunikorn
```
Use the following command to check whether the ConfigMap is created successfully.
```shell script
kubectl get ConfigMap -n yunikorn
```
Seeing that yunikorn-configs represents successful creation
```shell script
NAME				DATA	AGE
yunikorn-configs	14		10s
yunikorn-defaults   0		1d
```

### Use case
The following are the usage scenarios of using admission controller to set up in different deployment modes of Yunikorn.

For more information on Yunikorn's deployment modes, please refer to [Deployment modes](deployment_modes.md).
#### Standard deployment, everything scheduled by Yunikorn
In standard deployment mode, can set which namespaces will be scheduled by YuniKorn through the `admissionController.filtering.processNamespaces` tag in `yunikorn-config`.

If want all namespaces to be scheduled by YuniKorn, just set `admissionController.filtering.processNamespaces` to the empty string (default).

```yaml
#All namespaces will be schduler by YuniKorn
admissionController.filtering.processNamespaces: ""
```

#### Plugin deployment, everything scheduled by YuniKorn
Same as the standard mode, can set which namespaces will be scheduled by YuniKorn through the `admissionController.filtering.processNamespaces` tag in `yunikorn-config`.

If want all namespaces to be scheduled by YuniKorn, just set `admissionController.filtering.processNamespaces` to the empty string (default).

```yaml
#All namespaces will be schduler by YuniKorn
admissionController.filtering.processNamespaces: ""
```
#### Plugin deployment, only workloads in some namespaces scheduled byYuniKorn
If only want a specific namespace to be scheduled by YuniKorn.
```yaml
#Only spark-* namespaces will be scheduled by YuniKorn
admissionController.filtering.processNamespaces: "^spark-"
```

