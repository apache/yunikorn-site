---
id: cache_removal
title: 调度器缓存删除设计
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

# 在内核中结合缓存和调度器实现的建议
本文描述调度器和缓存实现的当前状态。
它描述了基于对当前行为所做的分析而计划的更改。

## 目标
本目标是在变更前后提供相同的功能。
- 合并前后的单元测试必须全部通过。
- 在内核定义的冒烟测试应全部通过并没有重大变化 <sup id="s1">[定义](#f1)</sup>.
- 作为shim代码一部分的端到端测试必须全部通过而不发生更改。

## 背景 
当前的调度器核心是围绕用于存储数据的两个主要组件构建的：缓存和调度器对象。
缓存对象构成了要跟踪的大多数数据的基础。
调度器对象跟踪特定于飞行(flight)细节并在缓存对象之上构建。

两层之间的通信使用一个同步事件，在某些情况下还使用直接更新。
调度器和缓存之间的同步更新确实意味着调度器与缓存之间有一段短时间的“不同步”。
这个短周期可对调度决策产生影响。
其中一个影响被记录在 [YUNIKORN-169](https://issues.apache.org/jira/browse/YUNIKORN-169).

另外一点是这两种结构给代码带来的复杂性。
在调度器和缓存之间包含一组不同的通信消息。
调度器和缓存对象之间的一对一映射表明，这种区别可能更需要人为控制这种依赖。
---
<b id="f1"></b>定义：冒烟测试的主要变化被定义为，在测试上改变用例和因而改变的变化。由于所做的检查可能依赖于已删除的缓存对象，因此需要进行一些更改。[↩](#s1)
## 结构分析
### 对象
按照代码分析现有的对象。
调度器和缓存对象之间的重叠部分通过在同一行显示它们来展现。
N/A 表示调度器或缓存中没有等效对象。

| 缓存对象                        | 调度器对象                       |
| ------------------------------ | ------------------------------ |
| ClusterInfo                    | ClusterSchedulingContext       |
| PartitionInfo                  | partitionSchedulingContext     |
| AllocationInfo                 | schedulingAllocation           |
| N/A                            | schedulingAllocationAsk        |
| N/A                            | reservation                    |
| ApplicationInfo                | SchedulingApplication          |
| applicationState               | N/A                            |
| NodeInfo                       | SchedulingNode                 |
| QueueInfo                      | SchedulingQueue                |
| SchedulingObjectState          | N/A                            |

作为缓存的一部分的 `initializer` 代码不定义特定的对象。
它含有一个包级别定义的混合体代码和作为 `ClusterInfo` 对象一部分的代码。

### 事件
在内核定义的事件里有多个来源和目标。
某些事件只在缓存和调度器之间的核心里。
这些事件将被删除。

| 事件                                       | 流程                  | 建议      |
| ----------------------------------------- | --------------------- | -------- |
| AllocationProposalBundleEvent             | Scheduler -> Cache    | Remove   |
| RejectedNewApplicationEvent               | Scheduler -> Cache    | Remove   |
| ReleaseAllocationsEvent                   | Scheduler -> Cache    | Remove   |
| RemoveRMPartitionsEvent                   | Scheduler -> Cache    | Remove   |
| RemovedApplicationEvent                   | Scheduler -> Cache    | Remove   |
| SchedulerNodeEvent                        | Cache -> Scheduler    | Remove   |
| SchedulerAllocationUpdatesEvent           | Cache -> Scheduler    | Remove   |
| SchedulerApplicationsUpdateEvent          | Cache -> Scheduler    | Remove   |
| SchedulerUpdatePartitionsConfigEvent      | Cache -> Scheduler    | Remove   |
| SchedulerDeletePartitionsConfigEvent      | Cache -> Scheduler    | Remove   |
| RMApplicationUpdateEvent (add/remove app) | Cache/Scheduler -> RM | Modify   |
| RMRejectedAllocationAskEvent              | Cache/Scheduler -> RM | Modify   |
| RemoveRMPartitionsEvent                   | RM -> Scheduler       |          |
| RMUpdateRequestEvent                      | RM -> Cache           | Modify   |
| RegisterRMEvent                           | RM -> Cache           | Modify   |
| ConfigUpdateRMEvent                       | RM -> Cache           | Modify   |
| RMNewAllocationsEvent                     | Cache -> RM           | Modify   |
| RMReleaseAllocationEvent                  | Cache -> RM           | Modify   |
| RMNodeUpdateEvent                         | Cache -> RM           | Modify   |
|                                           |                       |          |

移除缓存后，由缓存处理的事件将需要由核心代码处理。
两个事件由缓存和调度器处理。

## 详细流程分析
### 缓存和调度程序中同时存在的对象
当前的设计基于这样一个事实：缓存对象是所有数据存储的基础。
每个缓存对象必须有一个对应的调度器对象。
核心程序内围绕缓存和调度程序对象的协议很简单。
如果该对象同时存在于调度器和缓存中，则该对象将被添加到缓存中，从而触发相应调度器对象的创建。
删除对象总是以相反的方式处理：首先从调度器中删除，这将触发从缓存中删除的方法。
例如，由 `RMUpdateRequestEvent` 触发的应用程序的创建将由缓存处理。
Creating a `SchedulerApplicationsUpdateEvent` to create the corresponding application in the scheduler.
创建 `SchedulerApplicationsUpdateEvent` 会在调度器中创建相应的应用。

当添加应用程序和对象状态时，它们也会被添加到缓存对象中。
缓存对象被认为是数据存储，因此也包含了状态。
调度器中没有相应的状态对象。
不可能为同一对象维护两种状态。

该规则的其他例外是被认为遗失的对象和只有调度器的对象。
`schedulingAllocationAsk` 跟踪调度器中应用未完成的请求。
`reservation` 跟踪一个节点对应用和请求组合的临时保留。


### 添加/删除应用的操作
RM（shim）发送在调度器接口中定义的复合 `更新请求` 。
此消息由RM代理封装并转发到缓存进行处理。
RM可以请求添加或删除应用。

**应用添加或删除**
```
1. RM代理将 cacheevent.RMUpdateRequestEvent 发送到缓存
2. cluster_info.processApplicationUpdateFromRMUpdate
   2.1: 将新应用添加到分区。
   2.2: 将删除的应用发送到调度器（但不从缓存中删除任何内容）
3. scheduler.processApplicationUpdateEvent
   3.1: 将新应用添加到调度器
        (当失败时候, 发送 RejectedNewApplicationEvent 到缓存)
        无论是否失败，都将R MApplicationUpdateEvent 发送到 RM。
   3.2: 从调度器删除应用
        发送 RemovedApplicationEvent 到缓存
```

### 删除应用和添加或删除请求的操作
RM（shim）发送在调度器接口中定义的复合 `更新请求` 。
此消息由RM代理封装并转发到缓存进行处理。
RM可以请求删除应用。
RM可以请求添加或删除请求。

**资源分配删除**
如下描述了仅由 RM 发起的资源分配删除
````
1. RMProxy 将 cacheevent.RMUpdateRequestEvent 发送到缓存
2. cluster_info.processNewAndReleaseAllocationRequests
   2.1: (分支): 通过事件 ScheduleLocationUpdateEvent 发送到调度器
3. scheduler.processAllocationUpdateEvent 
   3.1: 更新 ReconcilePlugin（协调插件）
   3.2: 通过事件 ReleaseAllocationsEvent 将释放确认发送回缓存
4. cluster_info.processAllocationReleases 处理已确认的发布
````

**资源申请（ask）添加**
如果资源申请已存在，此添加将自动转换为一个更新。
```
1. RMProxy 发送 cacheevent.RMUpdateRequestEvent 到缓存
2. cluster_info.processNewAndReleaseAllocationRequests
   2.1: 资源申请健全性检查（如分区/应用程序的存在），拒绝信息会通过 RMRejectedAllocationAskEvent 发送回 RM
   2.2: 通过 ScheduleLocationUpdateEvent 将选中的资源申请传递给调度器
3. scheduler.processAllocationUpdateEvent
   3.1: 使用新的或更新的资源申请更新调度程序。
   3.2: 通过 RMRejectedAllocationAskEvent 将拒绝信息发送回 RM
   3.3: 接受的资源申请未确认到 RM 或缓存
```

**资源申请删除**
```
1. RMProxy 将 cacheevent.RMUpdateRequestEvent 发送到缓存
2. cluster_info.processNewAndReleaseAllocationRequests
   2.1: (分支): 通过事件 ScheduleLocationUpdateEvent 发送到调度器
3. scheduler.processAllocationReleaseByAllocationKey
   3.1: 更新调度应用程序并删除资源申请。
```

### 添加、更新或删除节点的操作
RM（shim）发送一个在调度器接口中定义好的复杂 `UpdateRequest` 。
此消息由 RM 代理包装并转发到缓存进行处理。
RM 可以请求添加、更新或删除节点。

**节点添加** 
```
1. RMProxy 发送 cacheevent.RMUpdateRequestEvent 到缓存
2. cluster_info.processNewSchedulableNodes
   2.1: 节点健全性检查（如分区/节点的存在）
   2.2: 向分区添加新的节点。
   2.3: 通过 SchedulerNodeEvent 通知调度器新节点
3. 通过 RMNodeUpdateEvent 通知 RM 节点添加和拒绝
   3.1: 通过 ScheduleLocationUpdateEvent 通知调度器要恢复的资源分配
4. scheduler.processAllocationUpdateEvent
   4.1: 调度器根据要恢复的资源分配创建新的资源申请 
   4.2: 使用特殊的处理来恢复新节点上的资源分配
   4.3: 确认调度器中的资源分配，失败时使用 ReleaseAllocationsEvent 更新缓存
```

**节点更新和移除**
```
1. RMProxy 发送 cacheevent.RMUpdateRequestEvent 到缓存
2. cluster_info.processNodeActions
   2.1: 节点健全性检查（如分区/节点的存在）
   2.2: 节点信息更新 (资源改变)
        2.2.1: 在缓存更新节点
        2.2.2: 通过 via SchedulerNodeEvent 通知调度器节点的更新
   2.3: 节点状态更新 (非产出), 只在缓存中更新节点状态
   2.4: 节点移除
        2.4.1: 从缓存中更新节点的状态然后移除节点
        2.4.2: 删除资源分配并通过 RMReleaseAllocationEvent 通知 RM
        2.4.3: 通过 SchedulerNodeEvent 通知调度器节点的移除
3. scheduler.processNodeEvent 新增/移除/更新节点
```

### 添加、更新或删除分区的操作
**添加 RM**
```
1. RMProxy 发送 commonevents.RemoveRMPartitionsEvent
   如果 RM 已经被注册
   1.1: scheduler.removePartitionsBelongToRM
        1.1.1: 调度器清理
        1.1.2: 调度器发送 commonevents.RemoveRMPartitionsEvent
   1.2: cluster_info.processRemoveRMPartitionsEvent
        1.2.1: 缓存清理
2. RMProxy 发送 commonevents.RegisterRMEvent
3. cluster_info.processRMRegistrationEvent
   2.1: 缓存相应地更新内部分区/队列。
   2.2: 缓存发送 ScheduleUpdatePartitionsConfigEvent 到调度器。
3. scheduler.processUpdatePartitionConfigsEvent
   3.1: 调度器相应地更新分区/队列信息。
```

**更新和移除分区**
基于配置文件更新触发。
```
1. RMProxy 发送 commonevents.ConfigUpdateRMEvent
2. cluster_info.processRMConfigUpdateEvent
   2.1: 缓存相应地更新内部分区/队列。
   2.2: 缓存发送 ScheduleUpdatePartitionsConfigEvent 到调度器。
   2.3: 缓存标记要删除的分区（尚未删除）。
   2.4: 缓存发送 SchedulerDeletePartitionsConfigEvent 到调度器。
3. scheduler.processUpdatePartitionConfigsEvent
   3.1: 调度器相应地更新分区/队列信息。
4. scheduler.processDeletePartitionConfigsEvent
   4.1: 调度器设置 partitionManager.stop = true.
   4.2: PartitionManager 异步删除队列、应用程序和节点。
        这是“真正的清理“，包括缓存。
```

### 资源分配
资源分配由调度器进程启动。
调度器在调度器端创建 SchedulingAllocation ，然后将其封装在 AllocationProposal 中。
调度器已经检查了资源等，并将资源分配标记为正在进行中。
此描述在资源分配将被确认和最终确定时开始

**新的分配**
```
1. 调度程序将 SchedulingAllocation 封装在 AllocationProposalBundleEvent 中。
2. cluster_info.processAllocationProposalEvent
   抢占案例：释放被抢占的资源分配
   2.1: 释放缓存中的资源分配
   2.2: 通过 SchedulerNodeEvent 通知调度器资源分配已经被释放
   2.3: 通过 RRMReleaseAllocationEvent 通知 RM 资源分配已经被释放
   所有情况：添加新的资源分配
   2.4: 向缓存中添加新的资源分配
   2.5: 通过 SchedulerAllocationUpdatesEvent 将拒绝信息发送回调度器 
   2.6: 通过 SchedulerAllocationUpdatesEvent 通知调度器资源分配已经被添加
   2.7: 通过 RMNewAllocationsEvent 通知 RM 资源分配已经被添加
3. scheduler.processAllocationUpdateEvent
   3.1: 确认信息被添加到调度器并从运行中更改为确认。
        在处理失败时，一个 ReleaseAllocationsEvent 被 *再次* 发送到缓存中进行清理。
        这是 [YUNIKORN-169] 问题中的一部分
        cluster_info.processAllocationReleases
   3.2: 拒绝处理会从调度器中删除进行中的资源分配。 
```

## 当前的锁机制
**集群锁:**  
一个集群包含一个或多个分区对象。一个分区是集群的一个子对象。
添加或删除“任何”分区需要集群的写锁。
检索集群内的任何对象都需要迭代分区列表，从而需要对集群进行读锁。

**分区锁:**  
分区对象包含到队列、应用程序或节点对象的所有链接。
添加或删除“任何”队列、应用程序或节点需要分区的写锁。
检索分区内的任何对象都需要分区的读锁以防止数据竞争。

需要写锁的操作示例
- 调度后的资源分配处理，将改变应用程序、队列和节点对象。
  由于预留可能的更新，因此需要分区锁定。
- 节点资源的更新
  它不仅会影响节点的可用资源，还会影响分区的总可分配资源 

需要读锁的操作示例：
- 检索任何队列、应用程序或节点都需要读锁
  对象本身没有作为检索的一部分被锁定
- 在缓存中处理后确认分配
  该分区仅被锁定以供读取，以允许检索将被更改的对象
  更改是在底层对象上进行的

不需要任何锁的操作示例：
- 调度中  
  在需要时锁定特定对象，在确认分配之前不会直接更新分区。

**队列锁:**  
队列可以跟踪应用程序（叶类型）或其他队列（父类型）。
资源可以以相同的方式被两种类型所跟踪。
 
添加或删除应用程序（叶类型）或一个直接的子队列（父类型）需要队列的写锁定。 
更新追踪的资源需要一个写锁定。  
更改以递归方式进行，一次不会锁定超过1个队列。
更新队列上的任何配置属性都需要一个写锁。
检索任何配置值，或跟踪的资源、应用程序或队列都需要读锁。

需要写锁的操作示例
- 将应用程序添加到叶队列
- 更新预留资源

需要读锁的操作示例
- 从叶类型队列中检索应用程序
- 检索挂起的资源

**应用程序锁:**  
应用程序跟踪不同类型的资源、分配和未完成的申请。
更新任何跟踪的资源、分配或申请都需要写锁。
检索这些值中的任何一个都需要一个读锁。

调度期间还需要应用程序的写锁。
在调度期间，为应用程序保留写锁。
将在需要访问或更新的节点或队列上进行锁定。
其他对象上的锁的例子是：
- 用于访问队列跟踪资源的读锁
- 用于更新节点上正在进行资源分配的写锁

需要写锁的操作示例
- 新增一个资源申请
- 尝试调度待处理的申请

需要读锁的操作示例
- 检索分配的资源
- 检索待处理的申请

**节点锁:**  
节点跟踪不同类型和分配的资源。
更新任何跟踪的资源或资源分配需要写锁。
检索这些值中的任何一个都需要一个读锁。

在分配阶段运行的检查根据需要获取锁。
更新时检查写锁时的读锁。
一个节点在整个分配周期内没有被锁定。

需要写锁的操作示例
- 添加新的资源分配
- 更新节点资源

需要读锁的操作示例
- 检索分配的资源
- 检索资源预留的状态

## 如何合并缓存和调度器对象
由于不再需要区分缓存和调度器中的对象，因此 `调度` 和 `信息` 部分的名称将被删除。

主体的调整和合并概述：
1. `application_info` 和 `scheduling_application`: **合并** 到 `scheduler.object.application`
2. `allocation_info` 和 `scheduling_allocation`: **合并** 到 `scheduler.object.allocation`
3. `node_info` 和 `scheduling_node`: **合并** 到 `scheduler.object.node`
4. `queue_info` 和 `scheduling_queue`: **合并** 到 `scheduler.object.queue`
5. `partition_info` 和 `scheduling_partition`: **合并** 到 `scheduler.PartitionContext`
6. `cluster_info` 和 `scheduling_context`: **合并** 到 `scheduler.ClusterContext`
7. `application_state`: **移动** 到 `scheduler.object.applicationState`
8. `object_state`: **移动** 到 `scheduler.object.objectState`
9. `initializer`: **移动** 入 `scheduler.ClusterContext`

代码的这种调整和合并包括将对象重构到它们自己的包中。
因此，这只会影响已经定义的两个调度器对象，预留和调度申请。
两者都将被移动到对象包中。

顶层调度器的包路径会保留用于上下文和调度代码。

## 代码合并
第一个变化是事件处理。
所有 RM 事件现在将直接在调度器中处理。
事件处理将发生重大变化，而不仅仅是简单的合并。
合并后将只剩下 RM 生成的事件。
正如上面分析中所描述的，几乎在所有情况下，调度器都会收到来自 RM 事件的更改通知。

从广义上讲，事件删除触发的更改类型只有三种：
- 配置更改：需要新的调度器代码，因为缓存处理不能转移到调度器
- 节点、资源申请和应用程序更改：将缓存代码合并到调度程序中
- 分配更改：取消确认周期并简化调度程序代码

配置更改的处理是事件处理的一部分。
所有配置更改现在将直接更新调度程序对象。
调度程序的工作方式与缓存略有不同，这意味着代码不可传输。

节点和应用程序实际上在缓存和调度器间被拆分。
在缓存对象中跟踪的而在调度器对象中没有等效值的对象都将移动到调度器对象中。
所有对调度器对象的引用都将被删除。
通过代码合并直接调用缓存对象的现有调度器代码将返回调度器对象中新的跟踪值。
这些调用因此将成为调度器中的锁定调用。

运行中的资源分配的概念将被删除。
分配将在相同的调度迭代中以没有事件或提案创建的方式进行。
移除了跟踪在调度器对象上的分配资源的必要性。
需要对进行中的资源进行跟踪，以确保在做出调度决策时将考虑未由缓存确认的分配。

应用程序和对象状态将是调度器对象的一个集成部分。
因此，状态更改是即时的，这应该可以防止发生 [YUNIKORN-169](https://issues.apache.org/jira/browse/YUNIKORN-169) 之类的问题。

## 合并后锁定

### 锁定方向
在持有锁的同时获取另一个锁是可能的，但我们需要确保我们不允许：
- 持有 A.lock 并获取 B 的锁。
- 持有 B.lock 并获取 B 的锁。 

调度器中的当前代码尽可能晚地锁定，并且仅在所需的时间段内锁定。
由于每个对象都有自己的锁，因此一些操作不会在调度程序端锁定，而只是在缓存端锁定。
这意味着从缓存中读取值不会锁定调度对象。

通过将缓存集成到调度器中，锁的数量将随着对象数量的减少而减少。
每个等价的对象、缓存和调度器，过去都有自己的锁，现在只有一个。
执行代码合并后，将留下一个锁。
随着调度器对象中字段数量的增加，锁定将更频繁地发生。

在合并之前未锁定调度器对象的调用将被锁定。
锁争用可能会导致性能下降。
对象和事件处理中减少的开销有望弥补这一点。
要跟踪的一点是锁定行为的变化。
当代码简单地合并而不查看顺序时，新行为可能会导致新的死锁情况。

### 缓解死锁
调度器内部的锁定将保持原样。
这意味着主调度逻辑将根据需要获取和释放对象上的锁。
在应用程序被锁定以对其进行调度之前，不会长期持有读锁或写锁。

需要注意的一个主要问题是在持有锁时不应执行对象的迭代。
例如，在迭代队列应用程序的调度期间，我们不应该锁定队列。

另一个例子是分区中的事件处理不应锁定不需要的分区。
例如，在检索需要更新的节点时应锁定分区，并在尝试锁定节点本身之前释放锁定。

这种方法适合当前的锁定方法，并将锁定更改保持在最低限度。
测试，特别是端到端测试，应该捕捉这些死锁。
没有已知的工具可用于检测或描述锁定顺序。