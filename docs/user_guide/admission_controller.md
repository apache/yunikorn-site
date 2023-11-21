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
and a [validation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook), where:

1. The `mutation webhook` mutates pod spec by:
    - Adding `schedulerName: yunikorn`
        - By explicitly specifying the scheduler name, the pod will be scheduled by YuniKorn scheduler.
    - Adding `applicationId` label
        - When a label `applicationId` exists, reuse the given applicationId.
        - When a label `spark-app-selector` exists, reuse the given spark app ID.
        - Otherwise, assign a generated application ID for this pod, using convention: `yunikorn-<namespace>-autogen`. This is unique per namespace.
    - Adding `queue` label
        - When a label `queue` exists, reuse the given queue name. Note, if placement rule is enabled, values set in the label is ignored.
        - Otherwise, adds `queue: root.default`
    - Adding `disableStateAware` label
        - If pod was assigned a generated applicationId by the admission controller, also set `disableStateAware: true`. This causes the generated application to immediately transition from the `Starting` to `Running` state so that it will not block other applications.
2. The `validation webhook` validates the configuration set in the configmap
    - This is used to prevent writing malformed configuration into the configmap.
    - The validation webhook calls scheduler [validation REST API](https://yunikorn.apache.org/docs/api/scheduler#configuration-validation) to validate configmap updates.

## Admission controller deployment
By default, the admission controller is deployed as part of the YuniKorn Helm chart installation. This can be disabled if necessary (though not recommended) by setting the Helm parameter `embedAdmissionController` to `false`.

On startup, the admission controller performs a series of tasks to ensure that it is properly registered with Kubernetes:

1. Loads a Kubernetes secret called `admission-controller-secrets`. This secret stores a pair of CA certificates which are used to sign the TLS server certificate used by the admission controller.
2. If the secret cannot be found or either CA certificate is within 90 days of expiration, generates new certificate(s). If a certificate is expiring, a new one is generated with an expiration of 12 months in the future. If both certificates are missing or expiring, the second certificate is generated with an expiration of 6 months in the future. This ensures that both certificates do not expire at the same time, and that there is an overlap of trusted certificates.
3. If the CA certificates were created or updated, writes the secrets back to Kubernetes.
4. Generates an ephemeral TLS server certificate signed by the CA certificate with the latest expiration date.
5. Validates, and if necessary, creates or updates the Kubernetes webhook configurations named `yunikorn-admission-controller-validations` and `yunikorn-admission-controller-mutations`. If the CA certificates have changed, the webhooks will also be updated. These webhooks allow the Kubernetes API server to connect to the admission controller service to perform configmap validations and pod mutations.
6. Starts up the admission controller HTTPS server.

Additionally, the admission controller also starts a background task to wait for CA certificates to expire. Once either certificate is expiring within the next 30 days, new CA and server certificates are generated, the webhook configurations are updated, and the HTTPS server is quickly restarted. This ensures that certificates rotate properly without downtime.

In production clusters, it is recommended to deploy the admission controller with two replicas by setting the Helm parameter `admissionController.replicaCount` to `2`. This will ensure that at least one admission controller webhook is reachable by the Kubernetes API server at all times. In this configuration, the CA certificates and webhook configurations are shared between the instances.

## Configure the admission controller
The admission controller can be configured with the `yunikorn-configs` configmap.

Webhook configuration, all entries start with the prefix `admissionController.webHook.`.

| Variable                  | Default value                           | Description                                                                |
|---------------------------|-----------------------------------------|----------------------------------------------------------------------------|
| `amServiceName`           | “yunikorn-addmission-controller-service”| name of the service that the YuniKorn admission controller is registered   |
| `schedulerServiceAddress` | “yunikorn-service:9080”                 | address of the YuniKorn scheduler service								   |

`amServiceName` is required for the admission controller to register itself properly with Kubernetes, and should normally not be changed.

`schedulerServiceAddress` must be reachable by the admission controller, and is used by the admission controller when validating ConfigMap changes. The admission controller will contact the REST API on the scheduler to validate any proposed ConfigMap changes. This setting should not normally be changed.

:::note NOTE
A change to `amServiceName` and `amServiceName` requires a restart of the YuniKorn admission controller to take effect.
:::
Filtering configuration, all entries start with the prefix `admissionController.filtering.`.


| Variable             | Default value                         | Description                                                                							   |
|----------------------|---------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `processNamespaces`  | ""                                    | which namespaces will have pods forwarded to YuniKorn for scheduling       							   |
| `bypassNamespaces`   | “^kube-system$”                       | which namespaces will not have pods forwarded to YuniKorn for scheduling   							   |
| `labelNamespaces`    | "" 								   | which namespaces will have pods labeled with an applicationId              							   |
| `noLabelNamespaces`  | ""                                    | which namespaces will not have pods labeled with an applicationId          							   |
| `generateUniqueAppId`| "false"                               | Whether to generate unique applicationId for all the apps that do not have an applicationId to start with |
| `defaultQueue`       | "root.default"                        | Default queue name      																				   |
If `processNamespaces` is setting is an empty string, pods created in all namespaces will be scheduled by YuniKorn, similarly, if `labelNamespaces` is setting is an empty string, all pods forwarded to YuniKorn will have an `applicationId` label applied.

`bypassNamespaces` and `noLabelNamespaces` act as exception lists for processNamespaces and labelNamespaces respectively.

If `generateUniqueAppId` is set to false, all the apps in a namespace should be bundled under a single applicationId, otherwise, the namespace and pod's uid will be used to generate a unique applicationId for it.

Access control configuration, all entries start with the prefix `admissionController.accessControl.`.

| Variable           | Default value                         | Description                                                                |
|--------------------|---------------------------------------|----------------------------------------------------------------------------|
| `bypassAuth`       | false                                 | Allow any external user to create pods with user information set           |
| `trustControllers` | true                                  | Allow Kubernetes controller users to create pods with user information set |
| `systemUsers`      | "^system:serviceaccount:kube-system:" | Regular expression for the allowed controller service account list         |
| `externalUsers`    | ""                                    | Regular expression for the allowed external user list                      |
| `externalGroups`   | ""                                    | Regular expression for the allowed external group list                     |
For more information about Access control configuration, please view [User & Group Resolution](user_guide/usergroup_resolution.md).

## Example
The following YAML does not set any information related to yunikorn
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
