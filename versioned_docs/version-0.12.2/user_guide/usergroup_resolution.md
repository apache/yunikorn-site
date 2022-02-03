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

User information is an important aspect of the scheduling cycle. It is one of the key identifier that can be used to determine the queue to which a job should be submitted. The Yunikorn Scheduler relies on the K8s Shim to provide user information. In the world of Kubernetes, there is no object defined that identfies the actual user. This is by design and more information can be found [here](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#users-in-kubernetes)

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

The `yunikorn.apache.org/username` key can be customized by overriding the default value using the `USER_LABEL_KEY`env variable to the [K8s](https://github.com/apache/incubator-yunikorn-release/blob/master/helm-charts/yunikorn/templates/deployment.yaml). This is particularly useful in scenarios where the user label is already being added or if the label has to be modified for some secuirty reasons. 

```yaml          
            env:
            - name: USER_LABEL_KEY
              value: "custom_user_label"
```

## Group resolution

Group membership resolution is pluggables and is defined here. Groups do not have to be part of provided user and group object. When the object is added to the cache the groups are automatically resolved based on the resolution that is configured.
The resolver which is linked to the cache can be set per partition.

The default group resolver is "no resolver".
This resolver just echos the user name and a primary group with the same name as the user.

Other resolvers are:
* OS resolver
* test resolver
