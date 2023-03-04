---
id: sorting_policies
title: 排序策略
---

<!--
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 -->

调度器使用策略可以在不更改代码的情况下改变调度行为。
可以为以下项目设置策略：
* [应用程序](#应用程序排序)
* [节点](#节点排序)
* [请求](#请求排序)

## 应用程序排序
通过配置为每个队列设置应用程序排序策略。排序策略设置仅对*叶子*队列有效。每个*叶子*队列可以使用不同的策略。

排序策略仅指定应用程序在队列内排序的顺序。
该顺序对于指定在分配资源时首先考虑哪个应用程序非常重要。
排序策略*不会*影响在队列中同时调度或激活的应用程序数量。
所有具有待处理资源请求的应用程序都可以并且将在队列中调度，除非明确地被过滤掉。
即使使用先进先出策略(FIFO)对应用程序进行排序，多个应用程序也将在队列中并行运行。

*父*队列始终使用公平策略对子队列进行排序。

考虑子队列的相对优先级（在*父*队列排序的情况下）和应用程序的相对优先级（在*叶子*队列排序的情况下）。
要在调度时忽略应用程序和队列优先级，请将队列属性`application.sort.priority`设置为`disabled`。

以下配置条目将应用程序排序策略设置为FIFO，适用于队列`root.sandbox`：

```yaml
partitions:
  - name: default
    queues:
    - name: root
      queues:
      - name: sandbox
        properties:
          application.sort.policy: fifo
```

仅考虑具有未处理请求的应用程序进行调度。
在排序应用程序*时*应用筛选器以移除所有没有未处理请求的应用程序。

### FifoSortPolicy
简短描述：先进先出，基于应用程序创建时间。 

配置值：`fifo`（默认）

在排序之前，需要过滤应用程序，并且必须有挂起(pending)的资源请求。

经过筛选后，应用程序将根据创建时间戳进行排序，不会使用其他过滤。
由于系统仅在锁定状态下添加应用程序，因此不可能有两个具有完全相同时间戳的应用程序。

结果，最早的请求资源的应用程序获得资源。
较晚请求的应用程序将在满足之前应用程序当前所有请求之后获得资源。

### FairSortPolicy
简短描述：基于资源利用率公平性排序。

配置值： `fair`

在排序之前，需要过滤应用程序，并且必须有挂起(pending)的资源请求。

经过筛选后，剩下的应用程序将根据使用情况进行排序。
应用程序的使用情况是指应用程序所有已确认和未确认的分配。
计算使用情况时，将考虑应用程序中定义的所有资源。

达到的效果是资源相对平均分配给所有请求资源的应用程序

### StateAwarePolicy
简短描述：限制同一时间只有一个为 Starting 或 Accepted 状态的应用程序。

配置值： `stateaware`

此排序策略需要了解应用程序状态。
应用程序状态在[应用程序状态](design/scheduler_object_states.md#application-state)文档中进行了描述。

在对所有排队的应用程序进行排序之前，将应用以下过滤器：
第一个过滤器基于应用程序状态。
以下应用程序通过过滤器并生成第一个中间列表：
* 处于 *running* 状态的所有应用程序
* *一个*（1）处于 *starting* 状态的应用程序
* 如果*没有*处于 *starting* 状态的应用程序，则添加 *一个*（1）处于 *accepted* 状态的应用程序

第二个过滤器将第一个过滤器的结果作为输入。
再次过滤初步列表：删除所有*没有*挂起(pending)请求的应用程序。

根据状态和挂起(pending)请求进行过滤后，剩余的应用程序将进行排序。
因此，最终列表将使用剩余的应用程序两次过滤并按创建时间排序。

回顾下 *Starting* 和 *Accepted* 状态的交互：
只有在没有处于 *Starting* 状态的应用程序时，才会添加处于 *Accepted* 状态的应用程序。
处于 *Starting* 状态的应用程序不必有挂起(pending)请求。
任何处于 *Starting* 状态的应用程序都将防止 *Accepted* 应用程序被添加到已过滤的列表中。

有关详细信息，请参阅设计文档中的 [示例](design/state_aware_scheduling.md#example-run) 运行。

达到的效果是，已经在运行的应用程序讲优先得到资源。
在所有已运行的应用程序后，逐一调度新的应用程序。


## 节点排序
节点排序策略通过配置文件为每个分区设置，不同的分区可以使用不同的策略。
以下配置项将分区`default`的节点排序策略设置为`fair`:
```yaml
partitions:
  - name: default
    nodesortpolicy:
        type: fair
```

### FairnessPolicy
简要描述：按可用资源排序，按降序排列

配置值：`fair` (默认值)

行为：
按可用资源的数量对节点列表进行排序，使具有最高可用资源量的节点排在列表的第一位。
计算使用情况时，将考虑节点上定义的所有资源。
对于节点的相同类型资源进行比较。

这将导致考虑可用性最低的节点首先进行新分配的分配，从而在所有可用节点上分散分配。
这将导致每个可用节点的整体利用率降低，除非整个环境的利用率非常高。
将所有节点的负载保持在相似水平有助于。
在自动缩放添加新节点的环境中，这可能会触发意外的自动缩放请求。   

### BinPackingPolicy
简要描述：按可用资源排序，按升序排列

配置值：`binpacking`

行为：
按可用资源的数量对节点列表进行排序，使具有最低可用资源量的节点排在列表的第一位。
计算使用情况时，将考虑节点上定义的所有资源。
对于节点的相同类型资源进行比较。

这将导致考虑可用性最高的节点首先进行新分配的分配，从而使少量节点的利用率更高，更适合云部署。

## 资源加权
节点排序策略可能使用节点利用率来确定顺序。
因为节点可以具有多个唯一的资源类型，所以节点的利用率是由其各个资源类型的加权平均值确定的。
资源加权可以通过使用`nodesortpolicy`的`resourceweights`部分进行自定义。
如果`resourceweights`不存在或为空，则默认配置将`vcore`和`memory`的权重设置为相等的`1.0`。
所有其他资源类型都将被忽略。
只有明确提到的资源类型才会具有权重。

YuniKorn在内部跟踪CPU资源作为`vcore`资源类型。
这将映射到Kubernetes资源类型`cpu`。
除`vcore`和memory之外，所有其他资源类型在YuniKorn和Kubernetes之间具有一致的命名。

例如，在默认配置中，如果节点的CPU和内存分别分配了`90％`和`50％`，则该节点将被视为已使用`70％`。

以下配置条目为分区default设置了`vcore`权重为`4.0`和`memory`权重为`1.0`。
这将使CPU使用的权重比内存使用高四倍：
```yaml
partitions:
  - name: default
    nodesortpolicy:
      type: fair
      resourceweights:
        vcore: 4.0
        memory: 1.0
```

使用此配置，在此示例中，如果节点的CPU和内存分别分配了`90％`和`50％`，则该节点将被视为已使用`82％`。

请注意，权重是相对于彼此的，因此指定`{4.0，1.0}`的权重等效于`{1.0，0.25}`。不允许负权重。

## 请求排序
当前仅有一种策略可用于在应用程序内对请求进行排序。
此策略不可配置。
仅可以基于请求的优先级对请求进行排序。
如果应用程序中有多个具有相同优先级的请求，则请求的顺序未确定。
这意味着具有相同优先级的请求的顺序可能会在运行之间改变。