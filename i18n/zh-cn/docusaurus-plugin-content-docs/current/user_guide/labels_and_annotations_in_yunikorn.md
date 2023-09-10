---
id: labels_and_annotations_in_yunikorn
title: 标签和注释
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

## YuniKorn 中的标签和注释
YuniKorn 利用了几个 Kubernetes 标签和注释来支持各种功能：

### YuniKorn 的标签
| 名称                   | 说明                                                                                                                            |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `applicationId`      | 将这个 Pod 与一个应用程序联系起来。<br/><br/>应用ID的优先级由以下因素决定：注释 `yunikorn.apache.org/app-id` > 标签 `applicationId` > 标签 `spark-app-selector`。 |
| `queue`              | 选择这个应用程序应该被安排在哪个 YuniKorn 队列中。如果有放置策略，这可能被忽略。<br/><br/>队列的优先级由以下因素决定：注释 `yunikorn.apache.org/queue` > 标签 `queue` > 默认。        |
| `spark-app-selector` | 如果标签 `applicationId` 和注解 `yunikorn.apache.org/app-id` 未设置，Spark Operator 使用的指定 `applicationId` 的替代方法。                         |
| `disableStateAware`  | 如果存在，则禁用该 pod 的 YuniKorn 状态感知调度策略。由 YuniKorn 接纳控制器内部设置。                                                                       |
| `placeholder`        | 设置该 pod 是否代表分组调度的占位符。由 YuniKorn 内部设置。                                                                                         |

### YuniKorn 中的注解
所有注解都在 `yunikorn.apache.org` 的命名空间下。例如 `yunikorn.apache.org/app-id` 。

| Name                         | Description                                                                                                                              |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `app-id`                     | 将这个pod与一个应用程序联系起来。<br/><br/>应用ID的优先级由以下因素决定：注释 `yunikorn.apache.org/app-id` > 标签 `applicationId` > 标签 `spark-app-selector`。              |
| `queue`                      | 选择这个应用程序应该被安排在哪个 YuniKorn 队列中。如果有放置策略，这可能被忽略。<br/><br/>队列的优先级由以下因素决定：注释 `yunikorn.apache.org/queue` > 标签 `queue` > 默认。                   |
| `task-group-name`            | 设置这个pod所属的任务组名称，以便进行分组调度。它必须列在`task-groups`中。                                                                                            |
| `task-groups`                | 定义了这个应用程序的任务组集合，用于分组调度。一个应用程序中的每个pod必须定义所有的任务组。                                                                                          |
| `schedulingPolicyParameters` | 任意的键值对，用于定制调度策略，如分组调度。                                                                                                                   |
| `placeholder`                | 设置该pod是否代表分组调度的占位符。由YuniKorn内部设置。                                                                                                        |
| `allow-preemption`           | `allow-preemption'注解只能设置在PriorityClass对象上。它将触发对具有该特定优先级类的pod的选择退出抢占。进一步的细节可以在[使用简单的抢占器进行 DaemonSet 调度](../design/simple_preemptor)文档中找到。 |
| `parentqueue`                | 为一组K8s命名空间定义一个父队列。进一步的细节可以在[资源配额管理](resource_quota_management#命名空间的父队列映射)文档中找到。                                                          |
| `namespace.quota`            | 设置映射到该命名空间的队列的最大容量。进一步的细节可以在[资源配额管理](resource_quota_management#命名空间配额)文档中找到。                                                             |
| [已删除] `namespace.max.cpu`    | 从1.2.0版开始，用 `namespace.quota` 代替。                                                                                                        |
| [已删除] `namespace.max.memory` | 自1.2.0版起被`namespace.quota`取代。                                                                                                            |
| `namespace.enableYuniKorn`   | 控制哪些命名空间的pod将被转发给Yunikorn进行调度。进一步的细节可以在[服务配置#准入控制器过滤设置](service_config#准入控制器过滤设置)文档中找到。                                                  |
| `namespace.generateAppId`    | 控制哪些命名空间将有标有 `applicationId` 的 pod。进一步的细节可以在[服务配置#准入控制器过滤设置](service_config#准入控制器过滤设置)文档中找到。                                             |
| `disable-state-aware`        | 如果存在，则禁用该 pod 的 YuniKorn 状态感知调度策略。由 YuniKorn 接纳控制器内部设置。                                                                                  |

关于分组调度的标签和注释的更多细节，请参考[分组调度](../user_guide/gang_scheduling.md)的文档。
