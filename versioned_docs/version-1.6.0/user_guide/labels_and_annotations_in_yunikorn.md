---
id: labels_and_annotations_in_yunikorn
title: Labels and Annotations in YuniKorn
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

## Labels and Annotations in YuniKorn

YuniKorn utilizes several Kubernetes labels and annotations to support various features.

Since YuniKorn 1.6.0, we have provided canonical representations for defining application ID and queue in labels under the namespace `yunikorn.apache.org`. Using these labels can benefit from the Kubernetes filtering and grouping capabilities.
The non-canonical (legacy) representations will not be deprecated and will continue to be supported in future releases.

### Labels in YuniKorn

Label values should comply with [Kubernetes Syntax and character set](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set).

| Name                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yunikorn.apache.org/app-id` | Associates this pod with an application. This is the canonical representation and it is recommended to use it.<br/><br/>The priority of application ID is determined in the following order: <ol><li>Label `yunikorn.apache.org/app-id`</li><li>Annotation `yunikorn.apache.org/app-id`</li><li>Label `applicationId`</li><li>Label `spark-app-selector`</li></ol>**Note**: Pods with inconsistent application metadata will be rejected in 1.7.0.                                                                                                                                                                                                                                                                                      |
| `yunikorn.apache.org/queue`  | Selects the YuniKorn queue this application should be scheduled in. This is the canonical representation and it is recommended to use it.<br/><br/>Queue name should comply with [Kubernetes Syntax and character set](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set) and also with [Partition and Queue Configuration](queue_config#queues). This may be ignored if a placement policy is in effect.<br/><br/>The priority of queue name is determined in the following order: <ol><li>Label `yunikorn.apache.org/queue`</li><li>Annotation `yunikorn.apache.org/queue`</li><li>Label `queue`</li></ol>**Note**: Pods with inconsistent queue metadata will be rejected in 1.7.0. |
| [LEGACY]<br/>`applicationId` | Equivalent to the preferred label `yunikorn.apache.org/app-id`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [LEGACY]<br/>`queue`         | Equivalent to the preferred label `yunikorn.apache.org/queue`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `spark-app-selector`         | Equivalent to the preferred label `yunikorn.apache.org/app-id`.<br/><br/>It is automatically attached by third-party Spark jobs triggered by the [Spark Operator](https://github.com/kubeflow/spark-operator). YuniKorn uses this label to define application ID if no other metadata exists.                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### Annotations in YuniKorn

| Name                                                        | Description                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [LEGACY]<br/>`yunikorn.apache.org/app-id`                   | Equivalent to the preferred label `yunikorn.apache.org/app-id`.                                                                                                                                                                                                                                        |
| [LEGACY]<br/>`yunikorn.apache.org/queue`                    | Equivalent to the preferred label `yunikorn.apache.org/queue`.                                                                                                                                                                                                                                         |
| `yunikorn.apache.org/task-group-name`                       | Sets the task group name this pod belongs to for the purposes of gang scheduling. It must be listed within `yunikorn.apache.org/task-groups`.                                                                                                                                                          |
| `yunikorn.apache.org/task-groups`                           | Defines the set of task groups for this application for gang scheduling. Each pod within an application must define all task groups.                                                                                                                                                                   |
| `yunikorn.apache.org/schedulingPolicyParameters`            | Arbitrary key-value pairs used to customize scheduling policies such as gang scheduling.                                                                                                                                                                                                               |
| `yunikorn.apache.org/allow-preemption`                      | This annotation can be set on the Pod or PriorityClass object. The annotation in Pod takes priority over PriorityClass. It will trigger opt out of preemption for pods. Further details can be found in the [DaemonSet Scheduling using Simple Preemptor](./../design/simple_preemptor) documentation. |
| `yunikorn.apache.org/parentqueue`                           | Define a parent queue for a set of K8s namespaces. Further details can be found in the [ Resource Quota Management](resource_quota_management#parent-queue-mapping-for-namespaces) documentation.                                                                                                      |
| `yunikorn.apache.org/namespace.quota`                       | Set the maximum capacity of the queue mapped to this namespace. Further details can be found in the [ Resource Quota Management](resource_quota_management#namespace-quota) documentation.                                                                                                             |
| [DEPRECATED]<br/>`yunikorn.apache.org/namespace.max.cpu`    | Replaced with `yunikorn.apache.org/namespace.quota` since version 1.2.0                                                                                                                                                                                                                                |
| [DEPRECATED]<br/>`yunikorn.apache.org/namespace.max.memory` | Replaced with `yunikorn.apache.org/namespace.quota` since version 1.2.0                                                                                                                                                                                                                                |
| `yunikorn.apache.org/namespace.enableYuniKorn`              | Controls which namespaces will have pods forwarded to Yunikorn for scheduling. Further details can be found in the [Service Configuration #admission-controller-filtering-settings](service_config#admission-controller-filtering-settings)documentation.                                              |
| `yunikorn.apache.org/namespace.generateAppId`               | Controls which namespaces will have pods labeled with an `yunikorn.apache.org/app-id`. Further details can be found in the [Service Configuration #admission-controller-filtering-settings](service_config#admission-controller-filtering-settings) documentation.                                     |

For more details surrounding gang-scheduling labels and annotations, please refer to the documentation on [gang scheduling](user_guide/gang_scheduling.md).
