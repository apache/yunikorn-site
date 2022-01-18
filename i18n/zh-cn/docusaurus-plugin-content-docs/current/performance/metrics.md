---
id: metrics
title: 调度器指标
keywords:
 - metrics
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

YuniKorn利用 [Prometheus](https://prometheus.io/) 记录指标。
指标系统跟踪调度器的关键执行路径，以展示潜在的性能瓶颈。
目前，这些指标分为三类：

- 调度器：调度程序的通用指标，如分配延迟、应用程序数等。
- 队列：每个队列都有自己的指标子系统，借以跟踪队列状态。
- 事件：在 YuniKorn 中记录事件的各种变化。

所有指标都在 `yunikorn` 命名空间中声明。

###    调度器指标

| 指标名称               | 指标类型        | 描述          | 
| --------------------- | ------------  | ------------ |
| containerAllocation   | 计数器         | 尝试分配容器的总次数。尝试的状态包括 `allocated`、`rejected`、`error`、`released`。 只会增加。 |
| applicationSubmission | 计数器         | 提交应用的总数。尝试的状态包括 `accepted` 和 `rejected`。 只会增加。 |
| applicationStatus     | 统计           | 应用状态总数。 应用的状态包括 `running` 和 `completed`。           |
| totalNodeActive       | 统计           | 活跃节点的总数。                          |
| totalNodeFailed       | 统计           | 失败节点的总数。                          |
| nodeResourceUsage     | 统计           | 按资源名称统计的节点的总资源使用量。          |
| schedulingLatency     | 直方图          | 主调度例程的延迟，以秒为单位。              |
| nodeSortingLatency    | 直方图          | 所有节点排序的延迟，以秒为单位。            |
| appSortingLatency     | 直方图          | 所有应用排序的延迟，以秒为单位。            |
| queueSortingLatency   | 直方图          | 所有队列排序的延迟，以秒为单位。            |
| tryNodeLatency        | 直方图          | 基于容器分配的节点状态检查的延迟，例如放置约束，以秒为单位。 |

###    队列指标

| 指标名称                    | 指标类型       | 描述         | 
| ------------------------- | ------------- | ----------- |
| appMetrics                | 计数器         | 应用指标，记录应用的总数。 应用的状态包括 `accepted`,`rejected` 和 `Completed`。    |
| usedResourceMetrics       | 统计           | 队列使用资源。    |
| pendingResourceMetrics    | 统计           | 队列待处理资源。  |
| availableResourceMetrics  | 统计           | 与队列等相关的已使用资源指标。   |

###    时间指标

| 指标名称                   | 指标类型       | 描述         | 
| ------------------------ | ------------   | ----------- |
| totalEventsCreated       | 统计           | 创建的事件总数。       |
| totalEventsChanneled     | 统计           | 通信的事件总数。       |
| totalEventsNotChanneled  | 统计           | 未通信的事件总数。      |
| totalEventsProcessed     | 统计           | 处理的事件总数。       |
| totalEventsStored        | 统计           | 排序的事件总数。       |
| totalEventsNotStored     | 统计           | 未排序的事件总数。      |
| totalEventsCollected     | 统计           | 收集的事件总数。       |

## 访问指标

YuniKorn通过Prometheus客户端的库收集指标，并通过调度器restful服务进行公开。
一旦启动，就可以通过路径 http://localhost:9080/ws/v1/metrics 来访问它们。

## 到Prometheus的聚合指标

可以很简单地设置Prometheus服务器来定期获取YuniKorn指标。需要遵循以下步骤：

- 设置Prometheus（请阅读[Prometheus文档](https://prometheus.io/docs/prometheus/latest/installation/)以获得更多信息）

- 配置Prometheus规则：如下为一个示例配置

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

- 启动Prometheus

```shell script
docker pull prom/prometheus:latest
docker run -p 9090:9090 -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

如果您在本地 Mac OS 的 docker 容器中运行Prometheus，请使用 `docker.for.mac.host.internal` 来替代 `localhost`。
启动后，请打开 Prometheus 的 web UI：http://localhost:9090/graph 。
您将从中看到所有来自于YuniKorn调度器的可用指标。