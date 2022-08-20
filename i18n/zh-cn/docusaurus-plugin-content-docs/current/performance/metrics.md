---
id: metrics
title: 调度程序指标
keywords:
 - 指标
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

YuniKorn利用[Prometheus](https://prometheus.io/) 记录指标。 度量系统不断跟踪调度程序的关键执行路径，以揭示潜在的性能瓶颈。 目前，这些指标分为三类：

- 调度器：调度器的通用指标，例如分配延迟、应用程序数量等。
- 队列：每个队列都有自己的指标子系统，跟踪队列状态。
- 事件：记录YuniKorn中事件的各种变化。

所有指标都在`yunikorn`命名空间中声明。
###    调度程序指标

| 指标名称               | 指标类型        | 描述         | 
| --------------------- | ------------  | ------------ |
| containerAllocation   | Counter       | 尝试分配容器的总次数。 尝试状态包括`allocated`, `rejected`, `error`, `released`。 该指标只会增加。  |
| applicationSubmission | Counter       | 提交申请的总数。 尝试的状态包括 `accepted`和`rejected`。 该指标只会增加。 |
| applicationStatus     | Gauge         | 申请状态总数。 应用程序的状态包括`running`和`completed`。  | 
| totalNodeActive       | Gauge         | 活动节点总数。                          |
| totalNodeFailed       | Gauge         | 失败节点的总数。                          |
| nodeResourceUsage     | Gauge         | 节点的总资源使用情况，按资源名称。        |
| schedulingLatency     | Histogram     | 主调度例程的延迟，以秒为单位。    |
| nodeSortingLatency    | Histogram     | 所有节点排序的延迟，以秒为单位。              |
| appSortingLatency     | Histogram     | 所有应用程序排序的延迟，以秒为单位。      |
| queueSortingLatency   | Histogram     | 所有队列排序的延迟，以秒为单位。             |
| tryNodeLatency        | Histogram     | 节点条件检查容器分配的延迟，例如放置约束，以秒为单位。 |

###    队列指标

| 指标名称                   | 指标类型        | 描述        |
| ------------------------- | ------------- | ----------- |
| appMetrics                | Counter       | 应用程序指标，记录申请总数。 应用程序的状态包括`accepted`、`rejected`和`Completed`。    |
| usedResourceMetrics       | Gauge         | 排队使用的资源。     |
| pendingResourceMetrics    | Gauge         | 排队等待的资源。  |
| availableResourceMetrics  | Gauge         | 与队列等相关的已用资源指标。    |

###    事件指标

| 指标名称                   | 指标类型        | 描述        |
| ------------------------ | ------------  | ----------- |
| totalEventsCreated       | Gauge         | 创建的事件总数。          |
| totalEventsChanneled     | Gauge         | 引导的事件总数。        |
| totalEventsNotChanneled  | Gauge         | 引导的事件总数。    |
| totalEventsProcessed     | Gauge         | 处理的事件总数。        |
| totalEventsStored        | Gauge         | 存储的事件总数。           |
| totalEventsNotStored     | Gauge         | 未存储的事件总数。       |
| totalEventsCollected     | Gauge         | 收集的事件总数。        |

## 访问指标

YuniKorn指标通过Prometheus客户端库收集，并通过调度程序RESTful服务公开。
启动后，可以通过端点http://localhost:9080/ws/v1/metrics访问它们。

## Prometheus 的聚合指标

设置 Prometheus 服务器以定期获取 YuniKorn 指标很简单。 按着这些次序：

- 设置Prometheus（从[Prometheus 文档](https://prometheus.io/docs/prometheus/latest/installation/)了解更多信息）

- 配置Prometheus规则：示例配置

```yaml
global:
  scrape_interval:     3s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'yunikorn'
    scrape_interval: 1s
    metrics_path: '/ws/v1/metrics'
    static_configs:
    - targets: ['docker.for.mac.host.internal:9080']
```

- 启动 Prometheus

```shell script
docker pull prom/prometheus:latest
docker run -p 9090:9090 -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

如果您在Mac OS上的本地docker容器中运行Prometheus，请使用`docker.for.mac.host.internal`而不是`localhost`。 启动后，打开Prometheus网页界面：http://localhost:9090/graph。 您将看到来自YuniKorn调度程序的所有可用指标。

