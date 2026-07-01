---
id: usergroup_resolution
title: User & Group Resolution
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

## User resolution

User information is an important aspect of the scheduling cycle. It is one of the key identifier that can be used to determine the queue to which a job should be submitted.
The YuniKorn Scheduler relies on the K8s Shim to provide user information. In the world of Kubernetes, there is no object defined that identifies the actual user.
This is by design and more information can be found [here](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#users-in-kubernetes).

A more reliable and robust mechanism is using the `yunikorn.apache.org/user.info` annotation.
The user information can be set externally by an allowed list of users or groups or the admission controller can attach this automatically to every workload.

## Group resolution

Groups do not have to be part of provided user and group object. If the user information contains one or more groups no group resolution is triggered.
The groups in the `user.info` annotation will be used regardless of the group resolution configured.

If groups are not provided the groups are resolved inside the `yunikorn-core` code. Group membership resolution is pluggable.
When the object is added to the cache the groups are automatically resolved based on the resolution that is configured.
The resolver which is linked to the cache can be set per partition.

The default group resolver is "no resolver". This resolver just echos the username and a primary group with the same name as the user.

To specify a group resolver the following partition level configuration setting in the queue config is available:
```yaml
partitions:
  - name: <name of the partition>
    usergroupresolver:
      type: <resolver type>
```

The currently supported resolvers are:
* Default resolver: ""
* LDAP resolver: "ldap" 
* OS resolver: "os"
* test resolver: "test"

The LDAP resolver is in technical preview. See [YUNIKORN-656](https://issues.apache.org/jira/browse/YUNIKORN-656) for implementation details.
[YUNIKORN-3158](https://issues.apache.org/jira/browse/YUNIKORN-3158) is required for the graduation of the LDAP resolver to become generally available.

The OS resolver depends on the OS of the node to provide the group details. There is no configuration options for the resolver in YuniKorn.

The test resolver is not for production use cases and is only used during unit testing to provide an implementation that is independent of the test environment.

## User handling

User details can be specified via an annotation on a workload. The annotation `yunikorn.apache.org/user.info` is attached to the workload.
The value is simple JSON, which defines the username and groups:

```yaml
metadata:
  annotations:
    yunikorn.apache.org/user.info: "
    {
      \"user\": \"yunikorn\",
      \"groups\": [
        \"developers\",
        \"devops\"
      ]
    }"
```

However, to enhance security, the following is enforced in the admission controller:
* not every user in the cluster is allowed to attach this annotation, only those which are configured
* if the annotation is missing, the admission controller will add this information automatically
* attempts to change this annotation will be rejected

The workload considered is not just a pod, but also on Deployments, ReplicaSets, DaemonSets, StatefulSets, Jobs and CronJobs.

Group resolution is no longer required inside the shim.

### Configuring the admission controller

The admission controller can be configured with the `yunikorn-configs` configmap. All entries start with the prefix `admissionController.accessControl.`.

| Variable           | Default value                         | Description                                                                |
|--------------------|---------------------------------------|----------------------------------------------------------------------------|
| `bypassAuth`       | false                                 | Allow any external user to create pods with user information set           |
| `trustControllers` | true                                  | Allow Kubernetes controller users to create pods with user information set |
| `systemUsers`      | "^system:serviceaccount:kube-system:" | Regular expression for the allowed controller service account list         |
| `externalUsers`    | ""                                    | Regular expression for the allowed external user list                      |
| `externalGroups`   | ""                                    | Regular expression for the allowed external group list                     |

If `bypassAuth` is set to true the admission controller will not add the annotation to a pod if the annotation is not present and the deprecated user label is set.
If the annotation is not set and the user label is not set the new annotation will be added.
In the case that `bypassAuth` is false, the default, the admission controller will always add the new annotation, regardless of the existence of the deprecated label.

In certain scenarios, users and groups must be provided to YuniKorn upon submission because the user and group management is provided by external systems and the lookup mechanism is not trivial. 
In these cases, the `externalUsers` and `externalGroups` can be configured which are treated as regular expressions.
Matching users and groups are allowed to set the `yunikorn.apache.org/user.info` annotation to any arbitrary value.
Since this has implications which affects scheduling inside YuniKorn, these properties must be set carefully.

:::note Assumption 
YuniKorn assumes that all pods belonging to an application are owned by the same user.
We recommend that the annotation is added to every pod of an application.
This is to ensure that there is no discrepancy between the users if pods get processed in an unexpected order. 
:::

## Deprecated user handling

### Username specification via label 

Using the `yunikorn.apache.org/username` label has been deprecated and is no longer supported.
In YuniKorn 1.9.0 the usage of the label will only be possible if the annotation is not found.
Usage will trigger a deprecation log message. The code to support the fallback to the label will be removed in YuniKorn 1.10.
