---
id: labels_and_annotations_in_yunikorn
<<<<<<< HEAD
title: 标签和注释
=======
title: YuniKorn中的标签和注释
>>>>>>> yunikorn/master
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

<<<<<<< HEAD
## YuniKorn 中的标签和注释
YuniKorn 利用了几个 Kubernetes 标签和注释来支持各种功能：

### YuniKorn 的标签
|        名称          |          说明                 |
| ------------------- | ---------------------------- |
| `applicationId`     | 将这个 Pod 与一个应用程序联系起来。|
| `queue`             | 选择这个应用程序应该被安排在哪个 YuniKorn 队列中。如果有放置策略，这可能被忽略。|
| `SparkLabelAppID `  | 如果标签 `applicationId` 和注解 `yunikorn.apache.org/app-id` 未设置，Spark Operator 使用的指定 `applicationId` 的替代方法。|
| `disableStateAware` | 如果存在，则禁用该 pod 的 YuniKorn 状态感知调度策略。由 YuniKorn 接纳控制器内部设置。|
| `placeholder`       | 设置该 pod 是否代表分组调度的占位符。由 YuniKorn 内部设置。|

### YuniKorn 中的注解
所有注解都在 `yunikorn.apache.org` 的命名空间下。例如 `yunikorn.apache.org/app-id` 。

|                Name            |     Description    |
| ------------------------------ | ------------------ |
|             `app-id`           | 将这个pod与一个应用程序联系起来。<br/>应用ID的优先级由以下因素决定：注释 `yunikorn.apache.org/app-id` > 标签 `applicationId` > 标签 `SparkLabelAppID`。|
|            `queue`            | 选择这个应用程序应该被安排在YuniKorn队列中。<br/>队列的优先级由以下因素决定：标签 `queue` >注释 `yunikorn.apache.org/queue` >默认。|
|       `task-group-name`       | 设置这个pod所属的任务组名称，以便进行分组调度。它必须列在`task-groups`中。|
|         `task-groups`         | 定义了这个应用程序的任务组集合，用于分组调度。一个应用程序中的每个pod必须定义所有的任务组。|
| `schedulingPolicyParameters`  | 任意的键值对，用于定制调度策略，如分组调度。 |
|         `placeholder`         | 设置该pod是否代表分组调度的占位符。由YuniKorn内部设置。 |
|       `allow-preemption`      | `allow-preemption'注解只能设置在PriorityClass对象上。它将触发对具有该特定优先级类的pod的选择退出抢占。进一步的细节可以在[使用简单的抢占器进行 DaemonSet 调度](../design/simple_preemptor)文档中找到。 |
|        `parentqueue`          | 为一组K8s命名空间定义一个父队列。进一步的细节可以在[资源配额管理](resource_quota_management#命名空间的父队列映射)文档中找到。 |
| `namespace.quota` | 设置映射到该命名空间的队列的最大容量。进一步的细节可以在[资源配额管理](resource_quota_management#命名空间配额)文档中找到。 |
| [已删除] `namespace.max.cpu`  | 从1.2.0版开始，用 `namespace.quota` 代替。 |
| [已删除] `namespace.max.memory` | 自1.2.0版起被`namespace.quota`取代。 |
| `namespace.enableYuniKorn` | 控制哪些命名空间的pod将被转发给Yunikorn进行调度。进一步的细节可以在[服务配置#准入控制器过滤设置](service_config#准入控制器过滤设置)文档中找到。 |
| `namespace.generateAppId`  | 控制哪些命名空间将有标有 `applicationId` 的 pod。进一步的细节可以在[服务配置#准入控制器过滤设置](service_config#准入控制器过滤设置)文档中找到。 |

关于分组调度的标签和注释的更多细节，请参考[分组调度](../user_guide/gang_scheduling.md)的文档。
=======
## Labels and Annotations in YuniKorn
YuniKorn utilizes several Kubernetes labels and annotations to support various features:

### Labels in YuniKorn
| Name                | Description                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applicationId`     | Associates this pod with an application.                                                                                                                |
| `queue`             | Selects the YuniKorn queue this application should be scheduled in. This may be ignored if a placement policy is in effect.                             |
| `SparkLabelAppID `  | Alternative method of specifying `applicationId` used by Spark Operator if the label `applicationId` and annotation `yunikorn.apache.org/app-id` unset. |
| `disableStateAware` | If present, disables the YuniKorn state-aware scheduling policy for this pod. Set internally by the YuniKorn admission controller.                      |
| `placeholder`       | Set if this pod represents a placeholder for gang scheduling. Set internally by YuniKorn.                                                               |

### Annotations in YuniKorn
All annotations are under the namespace `yunikorn.apache.org`. For example `yunikorn.apache.org/app-id`.

| Name                                | Description                                                                                                                                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app-id`                            | Assoiates this pod with an application.<br/>The priority of applicationID is determined by: annotation `yunikorn.apache.org/app-id` > label `applicationId` > label `SparkLabelAppID`.                                                                                                          |
| `queue`                             | Selects the YuniKorn queue this application should be scheduled in.<br/>The priority of queue is determined by: label `queue` > annotation `yunikorn.apache.org/queue` > default.                                                                                                               |
| `task-group-name`                   | Sets the task group name this pod belongs to for the purposes of gang scheduling. It must be listed within `task-groups`.                                                                                                                                                                       |
| `task-groups`                       | Defines the set of task groups for this application for gang scheduling. Each pod within an application must define all task groups.                                                                                                                                                            |
| `schedulingPolicyParameters`        | Arbitrary key-value pairs used to customize scheduling policies such as gang scheduling.                                                                                                                                                                                                        |
| `placeholder`                       | Set if this pod represents a placeholder for gang scheduling. Set internally by YuniKorn.                                                                                                                                                                                                       |
| `allow-preemption`                  | The `allow-preemption` annotation can be set on the Pod or PriorityClass object. The annotation in Pod takes priority over PriorityClass. It will trigger opt out of preemption for pods. Further details can be found in the [DaemonSet Scheduling using Simple Preemptor](./../design/simple_preemptor) documentation. |
| `parentqueue`                       | Define a parent queue for a set of K8s namespaces. Further details can be found in the [ Resource Quota Management](resource_quota_management#parent-queue-mapping-for-namespaces) documentation.                                                                                               |
| `namespace.quota`                   | Set the maximum capacity of the queue mapped to this namespace. Further details can be found in the [ Resource Quota Management](resource_quota_management#namespace-quota) documentation.                                                                                                      |
| [DEPRECATED] `namespace.max.cpu`    | Replaced with ``namespace.quota`` since version 1.2.0                                                                                                                                                                                                                                           |
| [DEPRECATED] `namespace.max.memory` | Replaced with `namespace.quota` since version 1.2.0                                                                                                                                                                                                                                             |
| `namespace.enableYuniKorn`          | Controls which namespaces will have pods forwarded to Yunikorn for scheduling. Further details can be found in the [Service Configuration #admission-controller-filtering-settings](service_config#admission-controller-filtering-settings)documentation.                                       |
| `namespace.generateAppId`           | Controls which namespaces will have pods labeled with an `applicationId`. Further details can be found in the [Service Configuration #admission-controller-filtering-settings](service_config#admission-controller-filtering-settings) documentation.                                           |

For more details surrounding gang-scheduling labels and annotations, please refer to the documentation on [gang scheduling](user_guide/gang_scheduling.md).
>>>>>>> yunikorn/master
