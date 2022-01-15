---
id: gang_scheduling
title: 帮派调度设计
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
# 帮派调度实现
一种新的调度应用程序的方法，它考虑了应用程序随着时间的推移预计会产生的资源需求。
它通过预留资源来保证应用程序的预期需求资源。

这个实现有两个部分：
*   Kubernetes Shim
*   Core（以后成为核心）和 scheduling (调度)

本文档描述了核心端的实现。

## 文档目标
本文档描述了以下实现设计要点：
1. 定义 shim 到核心通信所需的调整（调度器接口）
2. 调度器存储对象变化
3. 调度器逻辑变化

## 排除的设计点
目前，本设计文档未涵盖 Kubernetes shim 端实现。

本设计将 _不_ 讨论核心端的广义抢占。

## 通用流程
该流由提交的 pod 触发，该 pod 触发应用程序创建。
在 Spark 应用程序中，第一个 Pod 是驱动程序 Pod。
如果流程是从应用程序 CRD 的创建触发的，则不会有第一个 pod。
然而，这超出了核心调度逻辑。从核心方面来看，这两种情况应该没有区别。
更多细节在 [调度器逻辑更改](#scheduler-logic-changes) 章节中。

提交申请的流程。图中的数字对应于图下方的描述。

![通用流程](./../assets/gang_generic_flow.png)

应用程序启动期间shim和核心的组合流程：
*   提交的应用程序定义了任务组。 (1)
*   shim 创建应用程序并将应用程序传递给核心。 (2)
*   shim 为任务组的每个成员创建 placeholder（占位）pod。 (3)
*   按照正常行为，pod 作为具有正确信息集的应用程序的 AllocationAsk（资源分配请求）被处理并传递给核心。 (4)
*   占位 AllocationAsk 由核心调度，就好像它们是正常的 AllocationAsk 一样。 (5)
*   所有分配，即使它们是由调度器分配的占位 AllocationAsks 的结果，也会被传送回 shim。
*   原始的实际 pod 作为 AllocationAsk 传递给核心。 (6)
*   在实际 pod 和所有占位 pod 被调度后，shim 启动触发应用程序创建实际 pod。 (7)

在第一个实际 pod 启动后，以下 pod 都应该以相同的方式处理 (8)：
*   在 k8s 上创建了一个实际 pod。
*   处理 pod 并创建一个 AllocationAsk。
*   调度器处理 AllocationAsk（更多细节见下文）并用实际分配替换预留资源。

## 应用提交处理
### 预留资源总大小

如果请求一个或多个任务组，应用程序应该提供它要请求的所有任务组成员的总大小。
如果应用程序在限制了资源的队列中被调度，则需要总资源大小。

该值对于三种情况很重要：
1. 帮派请求大于队列配额
2. 开始预调度
3. 预调度时的资源压力

进一步的细节将在下面的 [在设置了配额的队列中进行调度](#scheduling-in-queues-with-a-quota-set) 中给出

从 shim 传递的信息应该是 AddApplicationRequest 中的一部分。
任务组的建立或成员数量的详细信息不相关。
所有任务组成员请求的总资源使用以下方法计算：

![请求计算](./../assets/gang_total_ask.png)

placeholderAsk（占位/资源预留请求）的总计信息作为可选字段添加到 AddApplicationRequest 消息中。
可以由 shim 根据 pod 描述中提供的 CRD 或注释进行计算。

如果占位请求大于队列上设置的队列配额，则必须拒绝申请。
这种拒绝是基于我们不能以任何方式满足请求的事实。
对于所有其他情况，会接受申请并进行正常的安排。

### 使用 FAIR（公平）排序策略处理队列
Queue sorting for the queue that the application runs in must be set to _FIFO_ or _StateAware_.
如果将应用程序提交到设置了 FAIR 排序策略的队列，则必须拒绝该应用程序。
应用程序运行所在队列的队列排序必须设置为 _FIFO_ 或 _StateAware_。

其他队列策略不能保证一次只处理一个 _新的_ 应用程序。
在 _公平_ 策略的情况下，我们可以同时分配多个 _新的_ 应用程序，从而无法强制实施配额管理。
使用 _公平_ 策略的另一个副作用可能是我们得到多个应用程序但只有部分能保证分配。

由于核心无法将占位情况放置在任何节点上，因此可以触发自动缩放。
如果队列使用 _公平_ 排序，这可能会导致其他应用程序使用放大的节点而不是预留资源从而再次破坏帮派调度。

## 在设置了配额的队列中进行调度
上面已经描述的主要情况是处理大于队列上设置的配额的总占位请求大小。
提交申请时，我们已经可以评估我们无法满足该要求并拒绝该请求。

在总占位请求确实适合队列的情况下，我们不应该开始调度，直到队列中有足够的可用资源来满足总请求。
然而，这不会停止对队列中其他应用程序的调度。
已在队列中运行的应用程序可能会请求更多资源。
从应用程序的角度来看，它可以请求的资源没有限制。
应用程序上定义的联邦是有保证的资源数量，而不是应用程序可以请求的最大资源数量。

我们拥有的队列层次结构是很复杂的。
配额可能不是直接在应用程序运行的队列上设置的。
它可以设置在某一个父队列上面。
这种情况可能会变得复杂，我们需要保证记住我们可以实时锁定调度。

在第一阶段中，我们应该关注这样一种情况，即请求的联邦资源也是应用程序将请求的最大资源数。
当我们查看队列时，我们应该关注具有配额的单个队列级别。

这两个假设对于没有使用从命名空间到队列的动态映射进行动态分配的 spark 用例是正确的。

此外，我们假设队列上设置的配额可以完全分配。
如果集群没有足够的资源，集群将扩展，直到为所有队列提供全部配额所需的大小。

这也可以在某些用例中利用抢占，例如抢占应用程序超过其总的联邦大小的分配。
在某些用例中，也可以利用抢占，比如在应用程序的总帮派规模上抢占分配。

通过允许指定时间和应用程序来等待占位分配，或开始使用保留资源的时间，可以添加进一步的增强功能。

## 调度器逻辑变化
调度器逻辑的变化需要考虑周期的两个部分：
*   占位请求及其分配。
*   替换占位的分配。

我们的基本假设是所有 pod 都会向核心生成占位 pod 请求。
如果我们不使用应用程序 CRD，这包括触发应用程序创建的 pod。
这个假设是必须的，才能确保调度器核心可以在提交应用程序的两种方式中以相同的方式运行。
占位 Pod 必须在真正的 Pod 之前与核心通信。

更改占位 AllocationAsks 是第一步。
作为应用程序创建的一部分，AllocationAsks 被添加。
添加 AllocationsAsk 通常会根据调度周期触发应用程序状态的更改。
它将应用程序从 _New_ 状态移动到 _Accepted_ 状态。这与当前设置一致，并且不会更改。

但是，在 AllocationAsk 设置了 _placeholder_ 标志的情况下，分配不应触发状态更改，应用程序保持在 _Accepted_ 状态。
处理分配请求，直到应用程序没有 pending （挂起）的资源。
作为安全预防措施，应忽略未设置 _placeholder_ 标志的 AllocationAsk。
占位 Pod 的所有结果分配都按照正常步骤向 shim 确认。
这个过程一直持续到没有更多的占位 pod 被分配。

此时的 shim 应为已缓冲的真实 pod 创建分配任务。
核心不能也不需假设每个应用程序只有一个任务组。
如果 shim 使用了上述选项1，则核心也无法假设它已收到属于任务组的所有分配任务。
这也是为什么我们假设每个 pod 都会向核心创建一个占位请求。

第二个变化是用真正的 pod 替换了占位 pod。
填充程序创建了一个设置了 _任务组名称_ 但未设置 _placeholder_ 标志的 AllocationAsk。

这里描述的过程与通用抢占的过程一致。
分配由核心释放，然后由 shim 确认。
对于帮派调度，我们有一个简单的一对一释放关系，在抢占的情况下，我们可以使用具有一对多释放关系的相同流程。

调度器按如下方式处理 AllocationAsk：
1. 检查应用程序是否有未释放的分配给具有相同 _任务组名称_ 的占位分配。如果没有找到占位分配，将使用正常的分配周期来分配请求。
2. 一个占位分配被选择并标记为释放。释放占位分配的请求被传送到 shim。这必须是一个异步过程，因为 shim 释放过程取决于底层的 K8s 响应，这可能不是即时的。
   注意：此时核心中没有释放任何分配。
3. 核心“暂停”处理真正的 AllocationAsk，直到 shim 响应确认已释放占位分配。
   注意：释放锁以允许调度继续
4. 在收到来自 shim 的释放确认后，“暂停的” AllocationAsk 处理会结束。
5. AllocationAsk 分配在与使用的占位相同的节点上。
   在任何一种情况下，占位分配的删除都将完成。这一切都需要作为对应用程序、队列和节点的一次更新来实现。
    * 成功时：创建一个新的分配。
    * 失败时：尝试在不同的节点上分配，如果失败，AllocationAsk 变得不可调度，并触发扩展。
6. 将分配传达回shim（如果适用，基于步骤 5）

## 应用程序完成
应用程序完成一直是一个长期存在的问题。
目前，应用程序在完成时不会转换到 _completed_ 状态。
应用程序的当前状态是 [参考文档](./scheduler_object_states.md)。
但是，此时应用程序将不会达到 _completed_ 状态，而是停留在 _waiting_ 状态。

这提供了许多问题，特别是在长时间运行部署中的内存使用和队列清理的情况下。

### 定义
由于我们不能依赖在 Kubernetes 上作为 Pod 运行的应用程序来表明它已经完成，因此我们需要定义何时考虑一个应用程序的 _完成_ 。
在这一点上，我们定义了一个应用程序在定义的时间段内处于 _等待_ 状态时，它会变成 _完成_ 。
当没有活动分配（已分配资源 > 0）和挂起分配请求（挂起资源 > 0）时，应用程序进入等待状态。

向 _waiting_ 状态的转换已经实现。
_waiting_ 状态的超时是一项新的功能。

资源预留不被视为活动分配。
占位请求被视为待处理的资源请求。
这些情况将在下面的 [清理](#Cleanup) 中处理。

### 清理
当我们查看帮派调度时，还有一个关于未使用的预留资源、占位请求及其清理的问题。
预留资源可以在有待处理分配请求或活动分配的任何时候转换为实际分配。

在处理实际分配之前，占位请求将全部转换为占位分配。

进入 _waiting_ 状态已被处理。
如果将新的分配请求添加到应用程序中，它将转换回 _running_ 状态。
当我们进入了等待状态，将没有待处理的请求或分配的资源。
只有可以分配的预留资源。

为了进入 _waiting_ 状态，应用程序必须是干净的。
但是，我们不能保证在应用程序运行期间应用程序将使用所有预留资源。
从 _waiting_ 状态转换到 _completed_ 状态根本不需要（占位）分配或请求。
影响转换的第二种情况是并非所有占位请求都被分配，因此应用程序从不请求任何真正的分配。
这两种情况可能会阻止应用程序转换出 _accepted_ 或 _waiting_ 状态。

因此，核心中的处理需要考虑两种会影响特定状态的转换的情况：
1. 占位请求挂起（退出 _accepted_ ）
2. 占位分配（退出 _waiting_ ）

占位请求挂起：
挂起的占位符是通过超时来处理的。
应用程序只能花费有限的时间等待分配所有预留资源。
这个超时是必需的，因为应用程序的部分占位分配可能会占用集群资源而没有真正使用它们。

应用程序可能排队等待未知时间，等待占位分配开始。
因此，占位请求的超时不能与应用程序或请求的创建相关联。
超时必须在分配第一个占位请求时开始。

在所有占位请求都被分配之前，应用程序不能请求真正的分配。
占位请求也由 shim 跟踪，因为它代表一个 pod。
在核心中释放请求需要消息在核心和 shim 之间流动以释放该请求。
但是，在这种情况下，分配预留资源的超时会触发应用程序失败。
当超时被触发并且占位请求挂起时，应用程序将从它所处的状态转换为 _killed_ 。

本案例的应用状态可以概括为：
*   申请状态为 _accepted_
*   占位分配的资源大于零，并且小于 _AddApplicationRequest_ 中的 _placeholderAsk_
*   待处理资源请求大于零

进入 _killed_ 状态必须自动将应用程序移出队列。

状态更改和占位分配释放可以在单个更新响应消息中处理。 该消息将包含以下内容：
* _UpdatedApplication_ 用于应用程序的状态变化
* 一个或多个 _AllocationRelease_ 消息，每个占位一个，_TerminationType_ 设置为 TIMEOUT
* 一条或多条 _TerminationType_ 设置为 TIMEOUT 的 AllocationAskRelease 消息

shim 首先处理 AllocationAskRelease 消息，然后是 _AllocationResponse_ 消息，最后是 _UpdatedApplication_ 消息。应用程序状态在核心端更改为 _killed_ 状态仅取决于移除所有占位 pod，而不取决于对 _UpdatedApplication_ 消息的响应。

![占位超时](./../assets/gang_timeout.png)

占位超时期间 shim 和核心的组合流程：
*   核心超时占位分配。 (1)
*   删除占位分配被传递到 shim。 (2)
*   所有占位分配都由 shim 释放，并传回核心。
*   删除占位分配请求被传递给 shim。 (3)
*   所有占位分配请求都由 shim 释放，并传回核心。
*   在占位分配和请求被释放后，核心将应用程序移动到终止状态，将其从队列中移除 (4)。
*   状态更改在核心和 shim 中完成。 (5) 


已分配的占位：
剩余的占位需要由核心释放。
需要通知 shim 将它们移除。这必须在进入 _完成_ 状态时触发。
在核心请求释放占位之后，应用程序的状态转换可以继续。
核心将处理从 shim 返回的占位分配的 _AllocationRelease_ 消息，并将 _TerminationType_ 设置为正常*超时*，而不会触发状态更改。

状态更改和占位分配释放可以在单个更新响应消息中处理。
该消息将包含以下内容：
*   _UpdatedApplication_ 用于应用程序的状态变化
*   零个或多个 _AllocationRelease_ 消息，每个占位一个，_TerminationType_ 设置为 *超时*

shim 首先处理 _AllocationResponse_ 消息，然后是 _UpdatedApplication_ 消息。
应用程序状态在核心端更改为 _完成_ 状态仅依赖于所有占位 pod 的移除，而不依赖于对 _UpdatedApplication_ 消息的响应。

进入 _完成_ 状态会自动将应用程序移出队列。
这也应该处理我们之前讨论的可能延迟处理来自 shim 的请求的情况，因为我们可以在需要时从 _等待_ 移回 _执行中_ 。
一个 _完成_ 的应用程序也不应该阻止围绕cron讨论的情况，例如每次调用使用相同的应用程序ID提交。
具有相同申请ID的 _完成_ 申请不得阻止提交具有相同ID的新申请。 

![应用程序清理流程](./../assets/gang_clean_up.png)
cation to the completed state removing it from the queue (6).
*   The state change is finalised in the core and shim. (7)
在清理应用程序期间 shim 和核心的组合流程：
*   在 Kubernetes 层发布了一个 pod。 (1)
*   shim 将分配释放传递给核心。 (2)
*   如果没有挂起或活动的分配，核心会将应用程序转换为等待状态。 (3)
*   等待状态超时并触发清理。 (4)
*   删除占位符配被传递到 shim。 (5)
*   所有占位分配都由 shim 释放，并传回核心。
*   释放所有占位后，核心将应用程序移动到完成状态，将其从队列中删除 (6)。
*   状态更改在核心和 shim 中完成。 (7) 

## 应用恢复
在应用程序恢复期间，占位 Pod 与节点上的任何其他 Pod 一样被恢复。
这些 pod 由 shim 作为节点现有分配的一部分传递到核心。
现有的分配在核心中没有相应的 _分配请求_。 核心根据恢复的信息生成 _分配请求_ 。

对于联邦调度，_分配请求_ 包含 _任务组名称_ 和 _占位_ 标志。
在恢复期间，相同的信息必须是 _分配_ 消息的一部分。
这是因为在两个方向上使用相同的消息，从 RM 到调度器，反之亦然，这意味着我们需要更新消息及其处理。

如果 _分配_ 消息中缺少信息，则恢复的分配将不会在核心中被正确标记。
恢复的分配将被视为常规分配。
这意味着它作为替换占位的正常分配周期的一部分被跳过。

逻辑变化只需要现有分配的恢复将接口消息中的字段复制到内核中的分配对象中。

## 接口变化
需要对 shim 和核心之间的通信进行多次更改，以支持所需的帮派信息。

应用程序必须提供占位请求的总大小，以防止接受永远无法运行的应用程序。

从 shim 发送到核心以进行分配请求的当前对象在 AllocationAsk 中定义。
由于从调度器核心传回的结果消息不会更改，因此分配不会更改。。但是，对于使用相同分配消息从 shim 到核心的恢复，必须包含与帮派相关的字段。
必须将与帮派相关的字段添加到这两个消息中。

分配释放请求和响应请求需要支持双向通信，并且需要进行重大更改。

### AddApplication
The AddApplicationRequest message requires a new field to communicate the total placeholder resource request that will be requested.
The field is used to reject the application if it is impossible to satisfy the request.
It can also be used to stop the core from scheduling any real pods for that application until all placeholder pods are processed.

In patched message form that would look like:
```
message AddApplicationRequest {
...
  // The total amount of resources gang placeholders will request
  Resource placeholderAsk = 7;
...
}
```

### AllocationAsk
The first part of the change is the base information for the task group.
This will require an additional optional attribute to be added.
The content of this optional attribute is a name, a string, which will be mapped to the name of the task group.
The field can be present on a real allocation and on a placeholder.

Proposed name for the new field is: _taskGroupName_

To distinguish normal AllocationAsks and placeholder AllocationAsks a flag must be added.
The flag will never have more than two values and thus maps to a boolean. As the default value for a boolean is _false_ the field should show the fact that it is an AllocationAsk that represents a placeholder as true.

Proposed name for the field is: _placeholder_

In patched message form that would look like:
```
message AllocationAsk {
...
  // The name of the TaskGroup this ask belongs to
  string taskGroupName = 10;
  // Is this a placeholder ask (true) or a real ask (false), defaults to false
  // ignored if the taskGroupName is not set
  bool placeholder = 11;
...
}
```

The last part of the task group information that needs to be communicated is the size of the task group.
This does not require a change in the interface as the current AllocationAsk object can support both possible options.

Requests can be handled in two ways:
1. Each member of the task group is passed to the core as a separate AllocationAsk with a maxAllocations, or the ask repeat, of 1
2. The task group is considered one AllocationAsk with a maxAllocations set to the same value as minMember of the task group information.

With option A the shim will need to generate multiple AllocationAsk objects and pass each to the core for scheduling.
Each AllocationAsk is linked to one pod.
Option B will only generate one AllocationAsk for all placeholder pods.
Option B requires less code and has less overhead on the core side.
However the logic on the shim side might be more complex as the returned allocation needs to be linked to just one pod.

Proposal is to use option: A

### Allocation
Similar to the change for the _AllocationAsk_ the _Allocation_ requires additional optional attributes to be added.
The new fields distinguish a normal Allocation and placeholder Allocations on recovery.
The same rules apply to these fields as the ones added to the _AllocationAsk_.

The content of this optional attribute is a name, a string, which will be mapped to the name of the task group.
The field can be present on a real allocation and on a placeholder.

Proposed name for the new field is: _taskGroupName_

The flag will never have more than two values and thus maps to a boolean.
As the default value for a boolean is _false_ the field should show the fact that it is an Allocation that represents a placeholder as true.

Proposed name for the field is: _placeholder_

In patched message form that would look like:
```
message Allocation {
...
  // The name of the TaskGroup this allocation belongs to
  string taskGroupName = 11;
  // Is this a placeholder allocation (true) or a real allocation (false), defaults to false
  // ignored if the taskGroupName is not set
  bool placeholder = 12;
...
}
```

### AllocationRelease Response and Request
The name for the messages are based on the fact that the release is always triggered by the shim.
In case of preemption and or gang scheduling the release is not triggered from the shim but from the core.
That means the message name does not cover the usage. A response message might not have an associated request message.
It could be used to indicate direction but that is in this case confusing.

When a release is triggered from the core, for preemption or the placeholder allocation, a response is expected from the shim to confirm that the release has been processed.
This response must be distinguished from a request to release the allocation initiated by the shim.
A release initiated by the shim must be followed by a confirmation from the core to the shim that the message is processed.
For releases initiated by the core no such confirmation message can or must be sent.
In the current request message there is no way to indicate that it is a confirmation message.

To fix the possible confusing naming the proposal is to merge the two messages into one message: _AllocationRelease_.

The _AllocationReleaseRequest_ is indirectly part of the _UpdateRequest_ message as it is contained in the _AllocationReleasesRequest_.
The _AllocationReleaseResponse_ is part of the _UpdateResponse_ message.
The flow-on effect of the rename and merge of the two messages is a change in the two messages that contain them.
The message changes for _UpdateResponse_ and _AllocationReleasesRequest_ are limited to type changes of the existing fields.

| Message                   | Field ID | Old type                  | New type          |
| ------------------------- | -------- | ------------------------- | ----------------- |
| UpdateResponse            | 3        | AllocationReleaseResponse | AllocationRelease |
| AllocationReleasesRequest | 1        | AllocationReleaseRequest  | AllocationRelease |

In patched message form that would look like:
```
message UpdateResponse {
...
  // Released allocation(s), allocations can be released by either the RM or scheduler.
  // The TerminationType defines which side needs to act and process the message. 
  repeated AllocationRelease releasedAllocations = 3;
...
}

message AllocationReleasesRequest {
  // Released allocation(s), allocations can be released by either the RM or scheduler.
  // The TerminationType defines which side needs to act and process the message. 
  repeated AllocationRelease releasedAllocations = 1;
...
}
```

The merged message _AllocationRelease_ will consist of:

| Field name      | Content type      | Required |
| --------------- | ----------------- | -------- |
| partitionName   | string            | yes      |
| applicationID   | string            | no       |
| UUID            | string            | no       |
| terminationType | _TerminationType_ | yes      |
| message         | string            | no       |

Confirmation behaviour of the action should be triggered on the type of termination received.
The core will confirm the release to the shim of all types that originate in the shim and vice versa.

A confirmation or response uses the same _TerminationType_ as was set in the original message.
An example of this is a pod that is removed from K8s will trigger an _AllocationRelease _message to be sent from the shim to the core with the TerminationType STOPPED_BY_RM. The core processes the request removing the allocation from the internal structures, and when all processing is done it responds to the shim with a message using the same _TerminationType_.
The shim can ignore that or make follow up changes if needed.

A similar process happens for a release that originates in the core.
Example of the core sending an _AllocationRelease_ message to the shim using the _TerminationType_ PREEMPTED_BY_SCHEDULER.
The shim handles that by releasing the pod identified and responds to the core that it has released the pod.
On receiving the confirmation that the pod has been released the core can progress with the allocation and preemption processing.

In patched message form that would look like:
```
message AllocationRelease {
  enum TerminationType {
    STOPPED_BY_RM = 0;
    TIMEOUT = 1; 
    PREEMPTED_BY_SCHEDULER = 2;
    PLACEHOLDER_REPLACED = 3;
  }

  // The name of the partition the allocation belongs to
  string partitionName = 1;
  // The application the allocation belongs to
  string applicationID = 2;
  // The UUID of the allocation to release, if not set all allocations are released for
  // the applicationID
  string UUID = 3;
  // The termination type as described above 
  TerminationType terminationType = 4;
  // human-readable message
  string message = 5;
}
```
### TerminationType
The currently defined _TerminationType_ values and specification of the side that generates (Sender), and the side that actions and confirms processing (Receiver):

| Value                    | Sender | Receiver |
| ------------------------ | ------ | -------- |
| STOPPED_BY_RM            | shim   | core     |
| TIMEOUT *                | core   | shim     |
| PREEMPTED_BY_SCHEDULER * | core   | shim     |

* currently not handled by the shim, core or both

When the placeholder allocation gets released the _AllocationReleaseResponse_ is used to communicate the release back from the core to the shim.
The response contains an enumeration called _TerminationType_, and a human-readable message.
For tracking and tracing purposes we should add a new _TerminationType_ specifically for the placeholder replacement. The shim must take action based on the type and confirm the allocation release to the core.

It should provide enough detail so we do not have to re-use an already existing type, or the human-readable message.
The human-readable format can still be used to provide further detail on which new allocation replaced the placeholder.

Proposal is to add: _PLACEHOLDER_REPLACED_

| Value                | Sender | Receiver |
| ---------------------| ------ | -------- |
| PLACEHOLDER_REPLACED | shim   | core     |

As part of the Scheduler Interface cleanup ([YUNIKORN-486](https://issues.apache.org/jira/browse/YUNIKORN-486)) the _TerminationType_ should be extracted from the _AllocationRelease_ and _AllocationaskRelease_ message.
It is an enumeration that can be shared between multiple objects.
[YUNIKORN-547](https://issues.apache.org/jira/browse/YUNIKORN-547) has been logged to handle this as it has an impact on the code outside of the scope of gang scheduling.


### AllocationAskRelease Response and Request
The allocation ask release right now can only be triggered by the shim.
In order for the core to perform the cleanup when the placeholder allocation times out, we need to make this a bidirectional message.
Similarly to the Allocation we would rename the _AllocationAskReleaseRequest_ to _AllocationAskRelease_, so we can use this message in both directions:
```
message AllocationReleasesRequest {
...
  // Released allocationask(s), allocationasks can be released by either the RM or
  // scheduler. The TerminationType defines which side needs to act and process the
  // message. 
  repeated AllocationAskRelease allocationAsksToRelease = 2;
}
```

Similar processing logic based on the _TerminationType_ which is used for allocations should be used for ask releases.
In patched message form that would look like:
```
message AllocationAskRelease {
  enum TerminationType {
    STOPPED_BY_RM = 0;
    TIMEOUT = 1; 
    PREEMPTED_BY_SCHEDULER = 2;
    PLACEHOLDER_REPLACED = 3;
  }
...
  // The termination type as described above 
  TerminationType terminationType = 4;
...
}
```

Confirmation behaviour of the action should be triggered on the type of termination received.
The core will confirm the release to the shim of all types that originate in the shim and vice versa.

A confirmation or response uses the same _TerminationType_ as was set in the original message.

## Scheduler storage object changes
### AllocationAsk
In line with the changes for the communication the objects in the scheduler also need to be modified to persist some of the detail communicated.
The AllocationAsk that is used in the communication has an equivalent object inside the scheduler with the same name.
This object needs to be able to store the new fields proposed above.

Proposed new fields: _taskGroupName_ and _placeholder_.

In the current interface specification a field called _executionTimeoutMilliSeconds_ is defined.
This is currently not mapped to the object inside the scheduler and should be added.
Time or Duration are stored as native go objects and do not include a size specifier.

Proposed new field: _execTimeout_

### Allocation
After the allocation is made an Allocation object is created in the core to track the real allocation. This Allocation object is directly linked to the application and should show that the allocation is a placeholder and for which task group. This detail is needed to also enable the correct display of the resources used in the web UI.

The propagation of the placeholder information could be achieved indirectly as the allocation object references an AllocationAsk. This would require a lookup of the AllocationAsk to assess the type of allocation. We could also opt to propagate the data into the Allocation object itself. This would remove the lookup and allow us to directly filter allocations based on the type and or task group information.

From a scheduling and scheduler logic perspective the indirect reference is not really desirable due to the overhead of the lookups required. This means that the same fields added in the AllocationAsk are also added to the Allocation object.

Proposed new fields: _taskGroupName_ and _placeholder_.

To support the release of the allocation being triggered from the core tracking of the release action is required. The release is not final until the shim has confirmed that release. However during that time period the allocation may not be released again.

Proposed new field: _released_

At the point that we replace the placeholder with a real allocation we need to release an existing placeholder.
The Allocation object allows us to specify a list of Allocations to release.
This field was added earlier to support preemption.
This same field will be reused for the placeholder release.

### Application
The AddApplicationRequest has a new field added that needs to be persisted in the object inside the scheduler.

Proposed new field: _placeholderAsk_

In the current interface specification a field called _executionTimeoutMilliSeconds_ is defined. This is currently not mapped to the object inside the scheduler and should be added. Time or Duration are stored as native go objects and do not include a size specifier.

Proposed new field: _execTimeout_

The application object should be able to track the placeholder allocations separately from the real allocations. The split of the allocation types on the application will allow us to show the proper state in the web UI.

Proposed new field: _allocatedPlaceholder_


### Queue & Node
No changes at this point.
The placeholder allocations should be counted as “real” allocations on the Queue and Node.
By counting the placeholder as normal the quota for the queue is enforced as expected.
The Node object needs to also show normal usage to prevent interactions with the autoscaler.
