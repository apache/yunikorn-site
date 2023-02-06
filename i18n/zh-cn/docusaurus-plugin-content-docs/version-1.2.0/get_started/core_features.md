---
id: core_features
title: 特征
keywords:
 - 特征
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

YuniKorn的主要特点包括：

## 应用感知调度

YuniKorn的关键特性之一就是支持应用感知。在默认的K8s调度程序中，它只能根据Pod进行调度，而不能基于用户、作业或者队列进行更细粒度的调度。
与之不同的是，YuniKorn可以识别用户、作业或者队列，并在做出调度决策时，考虑更多与它们相关的因素，如资源、排序等。
这使我们能够对资源配额、资源公平性和优先级进行细粒度控制，这是多租户计算系统最重要的需求。

## 层次资源队列

层次队列提供了一种有效的机制来管理集群资源。
队列的层次结构可以在逻辑上映射到组织结构。这为不同租户提供了对资源的细粒度控制。
YuniKorn UI 提供了一个集中的视图来监视资源队列的使用情况，它可以帮助您了解不同租户是如何使用资源的。
此外，用户可以利用设置最小/最大队列容量来为每个租户设定其弹性资源配额。

## 作业排序和排队

YuniKorn将每个资源队列中的队列进行排队，排序策略决定哪个应用程序可以首先获得资源。
这个策略可以是多种多样的，例如简单的 `FIFO`、`Fair`、`StateAware` 或基于 `Priority` 的策略。
队列可以维持应用的顺序，调度器根据不同的策略为作业分配相应的资源。这种行为更容易被理解和控制。

此外，当配置队列最大容量时，作业和任务可以在资源队列中正确排队。
如果剩余的容量不够，它们可以排队等待，直到释放一些资源。这就简化了客户端操作。
而在默认调度程序中，资源由命名空间资源配额限制：如果命名空间没有足够的配额，Pod就不能被创建。这是由配额许可控制器强制执行的。
客户端需要更复杂的逻辑来处理此类场景，例如按条件重试。

## 资源公平性

在多租户环境中，许多用户共享集群资源。
为了避免租户争夺资源或者可能的资源不足，需要做到更细粒度的公平性需求，以此来实现跨用户以及跨团队/组织的公平性。
考虑到权重或优先级，一些更重要的应用可以获得超过其配额的更多的需求资源。
这往往与资源预算有关，更细粒度的公平模式可以进一步提高资源控制。

## 资源预留

YuniKorn会自动为未完成的请求进行资源预留。
如果Pod无法分配，YuniKorn将尝试把它预留在一个满足条件的节点上，并在这个节点上暂时分配该 pod（在尝试其他节点之前）。
这种机制可以避免这个 Pod 需要的资源被后来提交的更小的、更不挑剔的 Pod 所挤占。
此功能在批处理工作负载场景中非常重要，因为当对集群提交大量异构 Pod 时，很有可能一些 Pod 会处于“饥饿”状态，即使它们提交得更早。

## 吞吐量

吞吐量是衡量调度器性能的关键标准。这对于一个大规模的分布式系统来说是至关重要的。
如果吞吐量不好，应用程序可能会浪费时间等待调度，并进一步影响服务的 SLA（服务级别协议）。
集群越大，对吞吐量的要求也越高。[基于Kube标记的运行评估](performance/evaluate_perf_function_with_kubemark.md) 章节显示了一些性能数据。
