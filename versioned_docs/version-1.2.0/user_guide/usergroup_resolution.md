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

User information is an important aspect of the scheduling cycle. It is one of the key identifier that can be used to determine the queue to which a job should be submitted. The Yunikorn Scheduler relies on the K8s Shim to provide user information. In the world of Kubernetes, there is no object defined that identfies the actual user. This is by design and more information can be found [here](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#users-in-kubernetes).

In Yunikorn, there are two ways of handling users and groups. The first is the legacy way, which uses the label `yunikorn.apache.org/username`. If this label is set on a pod, then the value is automatically extracted in the shim and will be used accordingly. Group resolution is also done in the shim and is disabled by default. The problem with this approach is twofold: user restrictions can be easily bypassed because the submitter is free to set this label to any value, therefore this only be used in a trusted environment. The second is that identifying the groups in the shim is too late: users can be assigned to multiple groups, but depending on the authentication mechanism (X509, tokens, LDAP, etc) it might be very difficult to look up which group a user belongs to. Since these limitations are significant, this method is kept for backward compatibility reasons and will likely be removed in the future.

A more reliable and robust mechanism is using the `yunikorn.apache.org/user.info` annotation, where the user information can be set externally by an allowed list of users or groups or the admission controller can attach this automatically to every workload.

## Legacy user handling

### Using the `yunikorn.apache.org/username` label

Since, Kubernetes has no pre-defined field or resource for user information and individual cluster deployments with unique user identification tools can vary, we have defined a standard way of identifying the user. Yunikorn requires a Kubernetes [Label](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) added. Using the [recommendation](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/) provided here, the default label is defined as below:

| Label                                          | Value |
|----------------------------------------------- |---------------------	|
| yunikorn.apache.org/username 	                 | User name. It can have duplicate entries but only the first value will be used. The default user is `nobody` |

Example:
```yaml
metadata:
  labels:
    yunikorn.apache.org/username: "john"
```
:::tip 
In order to make this field uniquiely identifiable to the authorized user, the suggestion is to add this label as an immutable field by the user identification tool used by the cluster administrators. The cluster administrators or users are free to use any method or tool to add this field and value. This includes adding it manually at the time of submission. 
:::

:::note Assumption 
Assumption:
  Yunikorn assumes that all pods belonging to an application are owned by the same user. We recommend that the user label is added to every pod of an app. This is to ensure that there is no discrepency. 
:::

The `yunikorn.apache.org/username` key can be customized by overriding the default value using the `USER_LABEL_KEY`env variable in the [K8s Deployment](https://github.com/apache/yunikorn-release/blob/master/helm-charts/yunikorn/templates/deployment.yaml). This is particularly useful in scenarios where the user label is already being added or if the label has to be modified for some secuirty reasons. 

```yaml          
            env:
            - name: USER_LABEL_KEY
              value: "custom_user_label"
```

### Group resolution

Group membership resolution is pluggables and is defined here. Groups do not have to be part of provided user and group object. When the object is added to the cache the groups are automatically resolved based on the resolution that is configured.
The resolver which is linked to the cache can be set per partition.

The default group resolver is "no resolver".
This resolver just echos the user name and a primary group with the same name as the user.

Other resolvers are:
* OS resolver
* test resolver

## The new, recommended way of handling users

Since Yunikorn 1.2 a more sophisticated way of user/group resolution is available.

In this mode, Yunikorn no longer relies on the `yunikorn.apache.org/username` label, instead, the annotation `yunikorn.apache.org/user.info` is attached to the workload. The value is simple JSON, which defines the user name and groups:

```yaml
metadata:
  annotations:
    yunikorn.apache.org/user.info: "
    {
      username: \"yunikorn\",
      groups: [
        \"developers\",
        \"devops\"
      ]
    }"
```

However, to enhance security, the following is enforced in the admission controller:
* not every user in the cluster is allowed to attach this annotation, only those which are configured
* if the annotation is missing, the admission controller will add this information automatically
* attempts to change this annotation will be rejected

We also no longer do this on pods only, but also on Deployments, ReplicaSets, DeamonSets, StatefulSets, Jobs and CronJobs.

Group resolution is no longer necessary inside the shim.

### Configuring the admission controller

The admission controller can be configured with the `yunikorn-configs` configmap. All entries start with the prefix `admissionController.accessControl.`.

|Variable|Default value|Description|
|--|--|--|
|`bypassAuth`|false|Allow any external user to create pods with user information set|
|`trustControllers`|true|Allow Kubernetes controller users to create pods with user information set|
|`systemUsers`|"^system:serviceaccount:kube-system:"|Regular expression for the allowed controller service account list|
|`externalUsers`|""|Regular expression for the allowed external user list|
|`externalGroups`|""|Regular expression for the allowed external group list|

If `bypassAuth` is set to true the admission controller will not add the annotation to a pod if the annotation is not present and the deprecated user labell is set. If the annotation is not set and the user label is not set the new annotation will be added. In the case that `bypassAuth` is false, the default, the admission controller will always add the new annotation, regardless of the existence of the deprecated label.

In certain scenarios, users and groups must be provided to Yunikorn upon submission because the user and group management is provided by external systems and the lookup mechanism is not trivial. In these cases, the `externalUsers` and `externalGroups` can be configured which are treated as regular expressions. Matching users and groups are allowed to set the `yunikorn.apache.org/user.info` annotation to any arbitrary value. Since this has implications which affects scheduling inside Yunikorn, these properties must be set carefully.
