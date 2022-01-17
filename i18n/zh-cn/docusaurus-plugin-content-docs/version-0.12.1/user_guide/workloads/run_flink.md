---
id: run_flink
title: 运行Flink作业
description: 如何与YuniKorn一起运行Flink作业
image: https://svn.apache.org/repos/asf/flink/site/img/logo/png/100/flink_squirrel_100_color.png
keywords:
 - spark
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

使用 YuniKorn 在 Kubernetes 上运行 [Apache Flink](https://flink.apache.org/) 非常容易。
根据在 Kubernetes 上运行 Flink 的模式不同，配置会略有不同。

## Standalone（独立）模式

请关注 [Kubernetes 设置](https://ci.apache.org/projects/flink/flink-docs-stable/ops/deployment/kubernetes.html) 以获取 standalone 部署模式的细节和示例。
在这种模式下，我们可以直接在 Deployment/Job spec 中添加需要的标签（applicationId 和 queue）来使用 YuniKorn 调度器运行 flink 应用程序，以及 [使用 YuniKorn 调度器运行 workloads](#run-workloads-with-yunikorn-scheduler) .

## Native（原生）模式

请关注 [原生 Kubernetes 设置](https://ci.apache.org/projects/flink/flink-docs-stable/ops/deployment/native_kubernetes.html) 以获取原生部署模式的细节和示例。
只有 flink 1.11 或更高版本才支持在 native 模式下使用 YuniKorn 调度程序运行 flink 应用程序，我们可以利用两个 flink 配置 `kubernetes.jobmanager.labels` 和 `kubernetes.taskmanager.labels` 来设置所需的标签。
例子：

* 启动一个 flink session
```
./bin/kubernetes-session.sh \
  -Dkubernetes.cluster-id=<ClusterId> \
  -Dtaskmanager.memory.process.size=4096m \
  -Dkubernetes.taskmanager.cpu=2 \
  -Dtaskmanager.numberOfTaskSlots=4 \
  -Dresourcemanager.taskmanager-timeout=3600000 \
  -Dkubernetes.jobmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox \
  -Dkubernetes.taskmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox
```

* 启动一个 flink application
```
./bin/flink run-application -p 8 -t kubernetes-application \
  -Dkubernetes.cluster-id=<ClusterId> \
  -Dtaskmanager.memory.process.size=4096m \
  -Dkubernetes.taskmanager.cpu=2 \
  -Dtaskmanager.numberOfTaskSlots=4 \
  -Dkubernetes.container.image=<CustomImageName> \
  -Dkubernetes.jobmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox \
  -Dkubernetes.taskmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox \
  local:///opt/flink/usrlib/my-flink-job.jar
```