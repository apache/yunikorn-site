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
YuniKorn utilizes several Kubernetes labels and annotations to support various features:

### Labels in YuniKorn
| Name                 | Description                                                                                                                                                                                                                                           |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `applicationId`      | Associates this pod with an application.<br/><br/>The priority of applicationID is determined by: annotation `yunikorn.apache.org/app-id` > label `applicationId` > label `SparkLabelAppID`.                                                          |
| `queue`              | Selects the YuniKorn queue this application should be scheduled in. This config may be ignored if a placement policy is in effect.<br/><br/>The priority of queue is determined by: annotation `yunikorn.apache.org/queue` > label `queue` > default. |
| `spark-app-selector` | Alternative method of specifying `applicationId` used by Spark Operator if the label `applicationId` and annotation `yunikorn.apache.org/app-id` unset.                                                                                               |
| `disableStateAware`  | If present, disables the YuniKorn state-aware scheduling policy for this pod. Set internally by the YuniKorn admission controller.                                                                                                                    |
| `placeholder`        | Set if this pod represents a placeholder for gang scheduling. Set internally by YuniKorn.                                                                                                                                                             |

### Annotations in YuniKorn
All annotations are under the namespace `yunikorn.apache.org`. For example `yunikorn.apache.org/app-id`.

| Name                                | Description                                                                                                                                                                                                                                                                                                              |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `app-id`                            | Associates this pod with an application.<br/><br/>The priority of applicationID is determined by: annotation `yunikorn.apache.org/app-id` > label `applicationId` > label `spark-app-selector`.                                                                                                                          |
| `queue`                             | Selects the YuniKorn queue this application should be scheduled in. This config may be ignored if a placement policy is in effect. <br/><br/>The priority of queue is determined by: annotation `yunikorn.apache.org/queue` > label `queue` > default.                                                                   |
| `task-group-name`                   | Sets the task group name this pod belongs to for the purposes of gang scheduling. It must be listed within `task-groups`.                                                                                                                                                                                                |
| `task-groups`                       | Defines the set of task groups for this application for gang scheduling. Each pod within an application must define all task groups.                                                                                                                                                                                     |
| `schedulingPolicyParameters`        | Arbitrary key-value pairs used to customize scheduling policies such as gang scheduling.                                                                                                                                                                                                                                 |
| `placeholder`                       | Set if this pod represents a placeholder for gang scheduling. Set internally by YuniKorn.                                                                                                                                                                                                                                |
| `allow-preemption`                  | The `allow-preemption` annotation can be set on the Pod or PriorityClass object. The annotation in Pod takes priority over PriorityClass. It will trigger opt out of preemption for pods. Further details can be found in the [DaemonSet Scheduling using Simple Preemptor](./../design/simple_preemptor) documentation. |
| `parentqueue`                       | Define a parent queue for a set of K8S namespaces. Further details can be found in the [ Resource Quota Management](resource_quota_management#parent-queue-mapping-for-namespaces) documentation.                                                                                                                        |
| `namespace.quota`                   | Set the maximum capacity of the queue mapped to this namespace. Further details can be found in the [ Resource Quota Management](resource_quota_management#namespace-quota) documentation.                                                                                                                               |
| [DEPRECATED] `namespace.max.cpu`    | Replaced with ``namespace.quota`` since version 1.2.0                                                                                                                                                                                                                                                                    |
| [DEPRECATED] `namespace.max.memory` | Replaced with `namespace.quota` since version 1.2.0                                                                                                                                                                                                                                                                      |
| `namespace.enableYuniKorn`          | Controls which namespaces will have pods forwarded to Yunikorn for scheduling. Further details can be found in the [Service Configuration #admission-controller-filtering-settings](service_config#admission-controller-filtering-settings)documentation.                                                                |
| `namespace.generateAppId`           | Controls which namespaces will have pods labeled with an `applicationId`. Further details can be found in the [Service Configuration #admission-controller-filtering-settings](service_config#admission-controller-filtering-settings) documentation.                                                                    | |                                                                                               | |
| `disable-state-aware`               | If present, disables the YuniKorn state-aware scheduling policy for this pod. Set internally by the YuniKorn admission controller.                                                                                                                                                                                       |

For more details surrounding gang-scheduling labels and annotations, please refer to the documentation on [gang scheduling](user_guide/gang_scheduling.md).
