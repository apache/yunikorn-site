---
id: evaluate_perf_function_with_kubemark
title: 使用 Kubemark 评估 YuniKorn 的性能
keywords:
 - 性能
 - 吞吐量
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

YuniKorn 社区关注调度程序的性能，并继续在发布时对其进行优化。 社区已经开发了一些工具来反复测试和调整性能。

## 环境设置

我们利用[Kubemark](https://github.com/kubernetes/kubernetes/blob/release-1.3/docs/devel/kubemark-guide.md#starting-a-kubemark-cluster)评估调度器的性能。 Kubemark是一个模拟大规模集群的测试工具。 它创建空节点，运行空kubelet以假装原始kubelet行为。 这些空节点上的调度pod不会真正执行。它能够创建一个满足我们实验要求的大集群，揭示yunikorn调度器的性能。 请参阅有关如何设置环境的[详细步骤](performance/performance_tutorial.md)。

## 调度程序吞吐量

我们在模拟的大规模环境中设计了一些简单的基准测试场景，以评估调度器的性能。 我们的工具测量[吞吐量](https://en.wikipedia.org/wiki/Throughput)并使用这些关键指标来评估性能。 简而言之，调度程序吞吐量是处理pod从在集群上发现它们到将它们分配给节点的速率。

在本实验中，我们使用 [Kubemark](https://github.com/kubernetes/kubernetes/blob/release-1.3/docs/devel/kubemark-guide.md#starting-a-kubemark-cluster) 设置了一个模拟的2000/4000节点集群。然后我们启动10个[部署](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)，每个部署分别设置5000个副本。 这模拟了大规模工作负载同时提交到K8s集群。 我们的工具会定期监控和检查pod状态，随着时间的推移，根据 `podSpec.StartTime` 计算启动的pod数量。 作为对比，我们将相同的实验应用到相同环境中的默认调度程序。 我们看到了YuniKorn相对于默认调度程序的性能优势，如下图所示：

![Scheduler Throughput](./../assets/yunirkonVSdefault.png)
<p align="center">图 1. Yunikorn 和默认调度器吞吐量 </p>

图表记录了集群上所有 Pod 运行所花费的时间：

|  节点数  | yunikorn        | k8s 默认调度器		| 差异   |
|------------------	|:--------------:	|:---------------------: |:-----:  |
| 2000(节点)       | 204(pods/秒)			| 49(pods/秒)			        |   416%  |
| 4000(节点)       | 115(pods/秒)			| 48(pods/秒)			        |   240%  |

为了使结果标准化，我们已经运行了几轮测试。 如上所示，与默认调度程序相比，YuniKorn实现了`2 倍`~`4 倍`的性能提升。

:::note

与其他性能测试一样，结果因底层硬件而异，例如服务器CPU/内存、网络带宽、I/O速度等。为了获得适用于您的环境的准确结果，我们鼓励您运行这些测试在靠近生产环境的集群上。

:::

## 性能分析

我们从实验中得到的结果是有希望的。 我们通过观察更多的YuniKorn内部指标进一步深入分析性能，我们能够找到影响性能的几个关键区域。

### K8s 限制

我们发现整体性能实际上受到了K8s主服务的限制，例如api-server、controller-manager和etcd，在我们所有的实验中都没有达到YuniKorn的限制。 如果您查看内部调度指标，您可以看到：

![Allocation latency](./../assets/allocation_4k.png)
<p align="center">图 2. 4k 节点中的 Yunikorn 指标 </p>

图2是Prometheus的截图，它记录了YuniKorn中的[内部指标](performance/metrics.md) `containerAllocation`。 它们是调度程序分配的 pod 数量，但不一定绑定到节点。 完成调度50k pod大约需要122秒，即410 pod/秒。 实际吞吐量下降到115个 Pod/秒，额外的时间用于绑定不同节点上的Pod。 如果K8s方面能赶上来，我们会看到更好的结果。 实际上，当我们在大规模集群上调整性能时，我们要做的第一件事就是调整API-server、控制器管理器中的一些参数，以提高吞吐量。 在[性能教程文档](performance/performance_tutorial.md)中查看更多信息。

### 节点排序

当集群大小增加时，我们看到YuniKorn的性能明显下降。 这是因为在YuniKorn中，我们对集群节点进行了完整排序，以便为给定的pod找到 **“best-fit”** 节点。 这种策略使Pod分布更加优化，基于所使用的 [节点排序策略](./../user_guide/sorting_policies#node-sorting)。 但是，对节点进行排序很昂贵，在调度周期中这样做会产生很多开销。 为了克服这个问题，我们在 [YUNIKORN-807](https://issues.apache.org/jira/browse/YUNIKORN-807) 中改进了我们的节点排序机制，其背后的想法是使用 [B-Tree ](https://en.wikipedia.org/wiki/B-tree)来存储所有节点并在必要时应用增量更新。 这显着改善了延迟，根据我们的基准测试，这在500、1000、2000 和 5000个节点的集群上分别提高了 35 倍、42 倍、51 倍、74 倍。

### 每个节点的前提条件检查

在每个调度周期中，另一个耗时的部分是节点的“前提条件检查”。 在这个阶段，YuniKorn评估所有K8s标准断言(Predicates)，例如节点选择器、pod亲和性/反亲和性等，以确定pod是否适合节点。 这些评估成本很高。

我们做了两个实验来比较启用和禁用断言评估的情况。 请参阅以下结果：

![Allocation latency](./../assets/predicateComaparation.png)
<p align="center">图 3. Yunikorn 中的断言效果比较 </p>

当断言评估被禁用时，吞吐量会提高很多。 我们进一步研究了整个调度周期的延迟分布和断言评估延迟。 并发现：

![YK predicate latency](./../assets/predicate_4k.png)
<p align="center">图 4. 断言延迟 </p>

![YK scheduling with predicate](./../assets/scheduling_with_predicate_4k_.png)
<p align="center">图 5. 启用断言的调度时间 </p>

![YK scheduling with no predicate](./../assets/scheduling_no_predicate_4k.png)
<p align="center">图 6. 不启用断言的调度时间 </p>

总体而言，YuniKorn 调度周期运行得非常快，每个周期的延迟下降在 **0.001s - 0.01s** 范围内。 并且大部分时间用于断言评估，10倍于调度周期中的其他部分。

|				| 调度延迟分布（秒）	| 断言-评估延迟分布（秒）	|
|-----------------------	|:---------------------:		|:---------------------:			|
| 启用断言		| 0.01 - 0.1				| 0.01-0.1					|
| 不启用断言	| 0.001 - 0.01				| 无						|

## 为什么 YuniKorn 更快?

默认调度器被创建为面向服务的调度器； 与YuniKorn相比，它在吞吐量方面的敏感性较低。 YuniKorn社区非常努力地保持出色的性能并不断改进。 YuniKorn可以比默认调度器运行得更快的原因是：

* 短调度周期

YuniKorn 保持调度周期短而高效。 YuniKorn 使用所有异步通信协议来确保所有关键路径都是非阻塞调用。 大多数地方只是在进行内存计算，这可能非常高效。 默认调度器利用 [调度框架](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/)，它为扩展调度器提供了很大的灵活性，但是，权衡是性能。 调度周期变成了一条很长的链，因为它需要访问所有这些插件。

* 异步事件处理

YuniKorn利用异步事件处理框架来处理内部状态。 这使得核心调度周期可以快速运行而不会被任何昂贵的调用阻塞。 例如，默认调度程序需要将状态更新、事件写入pod对象，这是在调度周期内完成的。 这涉及将数据持久化到etcd，这可能很慢。 YuniKorn将所有此类事件缓存在一个队列中，并以异步方式写回pod。

* 更快的节点排序

[YUNIKORN-807](https://issues.apache.org/jira/browse/YUNIKORN-807)之后，YuniKorn进行了高效的增量节点排序。 这是建立在所谓的基于“资源权重”的节点评分机制之上的，它也可以通过插件进行扩展。 所有这些一起减少了计算节点分数时的开销。 相比之下，默认调度器提供了一些计算节点分数的扩展点，例如`PreScore`、`Score`和`NormalizeScore`。 这些计算量很大，并且在每个调度周期中都会调用它们。 请参阅[代码行](https://github.com/kubernetes/kubernetes/blob/481459d12dc82ab88e413886e2130c2a5e4a8ec4/pkg/scheduler/framework/runtime/framework.go#L857)中的详细信息。

## 概括

在测试过程中，我们发现YuniKorn的性能非常好，尤其是与默认调度程序相比。 我们已经确定了YuniKorn中可以继续提高性能的主要因素，并解释了为什么YuniKorn的性能优于默认调度程序。 我们还意识到将Kubernetes扩展到数千个节点时的局限性，可以通过使用其他技术（例如联合）来缓解这些局限性。 因此，YuniKorn是一个高效、高吞吐量的调度程序，非常适合在Kubernetes上运行批处理/混合工作负载。
