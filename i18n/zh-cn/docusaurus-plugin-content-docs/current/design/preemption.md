---
id: preemption
title: 抢佔
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

# 抢佔式设计

## 简介

在过去很长一段时间以来，YuniKorn 的部份代码中都包含了抢佔代码，这个设计是为了去替换掉这些内容。

原始代码并没有经过充分测试。
在 [YUNIKORN-317](https://issues.apache.org/jira/browse/YUNIKORN-317) 移除核心的快取后，抢佔代码已从调度路径中移除。
唯一的改动是抢佔代码有经过编译修正。
在新版本抢佔设计的准备过程中，旧代码已经在 [YUNIKORN-1269](https://issues.apache.org/jira/browse/YUNIKORN-1269) 被删除。

为了帮助关键的工作负载顺利运行，抢占几乎是所有调度程序都会使用的功能。
抢佔的重要性来自系统没有这个功能就无法顺利运行的事实，例如 k8s 上的 DaemonSets，以及其他像 SLA 或优先级等因素。
DaemonSet pod 的抢占已作为 [yunikorn-1085](https://issues.apache.org/jira/browse/YUNIKORN-1085) 的一部份实现，因此，本设计着重在其他工作负载的抢占。

## 目标

* 重用现有的 Kubernetes 对象
* 实现队列间抢占
* 使用核心调度器中的优先级资讯支援抢佔功能

## 非目标

* 队列内抢占
* 跨节点抢占
* 支援所有的优先级

## 抢佔与优先级

### Kubernetes

整个集群中，所有命名空间内的所有 Pod 都会根据优先级进行排序。
相较于优先级低的 Pod，优先级高的 Pod 会先被进行调度。
Kubernetes 调度程序中的抢占也仅基于这种优先级。
完整的文档可以在[这里](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) 找到。

关于调度顺序和抢占行为的基本原理是：具有较高优先级的 Pod 比具有较低优先级的 Pod 更重要。
这个是跨命名空间的，且没有任何限制。
具有较高优先级的 Pod 会更早地被调度，并可能触发另一个命名空间的 Pod 的抢占。

Pod 的规范中定义了优先级。
优先级是一个数字，在规范中通过 PriorityClass 对象被引用。
该对象定义了一个优先级，并将其映射到一个值。
在较新的版本（Kubernetes 1.24 或更高版本）中，PriorityClass 还包含调度阶段的抢占策略。
此 preemptionPolicy 仅允许 Pod 在调度阶段可以选择不抢占其他优先级较低的 Pod。
它无法在 Pod 运行时改变抢占行为，也不是为此而设计的。

当节点上的 kubelet 驱逐 Pod 时，也会使用 Pod 优先级。
例如，如果节点超载，或者内存或 CPU 耗尽，节点就会开始驱逐 Pod。
这些驱逐有助于保持节点稳定，考虑驱逐的 Pod 对象则会根据优先级和其他一些因素进行排序。

### YuniKorn

Kubernetes 中的行为集中在调度周期上。
如果从批次处理，或资料处理工作负载的角度来检视抢占，我们需要考虑到在运行过程中退出的可能性，不过目前工作负载的配置中没有这一选项。

简单的抢占方法符合 Kubernetes 设计用于服务类工作负载的要求。
服务可以处理底下的 Pod 被抢佔之后所触发的扩容或缩容。

但 Spark 的情况并非如此。
驱动器(driver)的 Pod 会管理这个工作底下其他的 Pod。
当驱动器被抢占时，整个工作都会受到影响。
抢占驱动器会产生后续影响，导致多个 Pod 从群集中被删除，对于大型工作而言，这可能意味着数百个 Pod。
由于这种情况的影响远大于抢佔其他单个 Pod，因此需要尽可能避免抢占驱动器或初始化启动器的 Pod 。

我们需要考虑的另一种情况是：在集群上运行的互动式会话。
这种互动式会话（例如 python notebook）是一次性实例，重新启动会产生重大影响。
因此，抢占这样的实例也不是个理想的结果。

要知道去避免抢佔哪个 Pod 的系统是很困难的，甚至是不可能的。
在这种情况下，Pod 上设置需要设定「禁止抢占」的标记。
设计方案将在 Pod 规范中讨论此选项。

### 优先级限制

在 Kubernetes 集群中，PriorityClass 对象定义了优先级，它是集群层级的物件。
集群管理员会定义对象，因此也定义了支援的优先级。

Pod 上可设置的优先级没有限制。
提交 Pod 时，唯一的检查是：是否定义了 Pod 规范中的 PriorityClass。
任何恶意用户都可以创建具有最高优先级的 Pod。

限制优先级是可能的，但需要 API 服务器标记，而这很难在公共云环境中被支援。
在 YuniKorn 调度的集群中，我们无法依赖该选项。

## 抢占法则

在 Apache YARN 调度器中实施抢占的先验知识被用于创建本设计。
它构成了「抢占法则」的基础。
这些法则描述了整体抢占行为。

YuniKorn 的抢占基于分层队列模型，以及和分配给队列的资源保证。

抢占被用来使队列的使用率至少达到其保证的资源容量，但它不能保证每个队列都能获得这个目标，某些情况下会无法达到这种状态。
因此，抢占并不能保证会到达最终的最佳状态。
通常队列的最终状态会接近保证的资源容量。

无法达到最佳状态的一个例子是：一组队列的保证资源总和大于群集中当前可用的资源。
这就不可能让所有队列都获得其保证资源量。
类似情况还有很多，例如在分层结构中，最大配额设置在层级结构中的某一点，从而无法达到最佳状态。

下面提供了规则概述，之后会对每条规则进行详细解释：

1. 抢佔政策只是强列建议，没有任何保证
2. 抢占不会使队列的容量低于其保证容量
3. 一个任务不能抢占同一应用中的其他任务
4. 除非一个任务的队列低于其保证容量，否则任务不会触发抢占
5. 除非任务队列超过其保证容量，否则底下的任务不能被抢占
6. 任务只能抢占优先级较低或相同的任务
7. 任务不能抢占其抢占范围外的任务（单向限制）

围绕任务和队列给出的大多数规则都是为了防止抢占风暴或循环抢佔。
可能引发后续抢占的行为应该被避免，上述规则应保证不会出现这种情况。
违反规则可能会在调度或应用程序运行期间导致不可预测的行为。

### 抢占策略只是强烈建议，没有任何保证

Pod 可以请求不被抢占，但这并没有受到保证。
在某些情况下，调度程序仍有可能抢占 Pod。
如果没有其他解决方案，这会是最后的手段。
这意味着抢占策略只是一种强烈的提议，而不是保证。

DaemonSet 就可能打破规则，并抢占选择退出抢占规则的 Pod 。
DaemonSet Pod 必须在指定节点上运行。
如果该节点上运行的所有 Pod 不是 DaemonSet Pod，就是选择不能被抢占的 Pod 时，在没有其他选择的情况下，即使是选择不能被抢占的 Pod 也会被抢占。

### 抢占永远不会使队列的容量低于其保证容量

从抢占角度看，队列上配置的保证资源容量是队列的最佳资源配置。
由于抢占试图让队列获得其保证资源，如果允许让抢占将队列的资源减少到其保证容量以下，就会触发新一轮的抢占。

当一个任务被考虑成为抢占受害者时，从队列中移除该任务后，队列的使用量不得低于其保证资源容量。
如果删除任务会使队列低于其保证资源容量，该任务就不能成为候选人。

这可能意味着，即使队列高于其保证资源容量，也不允许抢占队列中的任何任务。

### 不能抢占同一应用程序中的其他任务

作为当前设计的一部分，我们只实施队列间抢占。
此规则不适用于队列间抢占。
在此特别记录是为了使其在不修改规则的情况下进行扩展，使得队列内抢占成为可能。

触发抢占的任务和被抢佔的任务不能来自同一应用程序。

### 除非任务队列低于其保证容量，否则无法触发抢占

抢占试图让队列至少获得其保证资源。
允许已超过其保证资源容量的队列中的任务进行抢占无助于实现这一目标。

抢占不是使队列达到最大资源容量的工具。
因此，在这种情况下不允许队列中的任务触发抢占。
正常调度将处理超出其保证容量的队列的资源分配。

### 除非队列超过保证容量，否则底下的任务不能被抢佔

这是防止队列低于其保证容量的规则扩展。
如果队列资源已低于其保证容量，则不能考虑抢占该队列正在运行中的任务。
该队列可以触发其他队列任务的抢占。
允许从低于保证容量的队列中删除更多资源，将导致队列更加远离其理想使用情况。

### 任务只能抢占优先级较低或相同的任务

这条规则与 Kubernetes 的默认抢占行为有关。
不过与 Kubernetes 的规则略有不同，Kubernetes 只允许 Pod 抢占优先级较低的 Pod，而不允许抢占优先级相同的 Pod。

在 YuniKorn 中，抢占的应用范围稍广，因为我们用它来允许队列使用被保证的资源容量。
两个不同队列中，具有相同优先级的 Pod 被允许相互抢占。
如果没有优先级相同情况的抢佔规则，重新分配将变得缓慢而困难。

### 任务不得抢占范围之外的任务

这是一个特别用于多租户的规则。
YuniKorn 允许在队列上设置抢占范围，限制可以被考虑进行抢占的任务。
只有当任务运行在位于抢占范围内的队列上时，才能抢占另一个任务。
关于抢占范围的更多信息如下。

## 抢占范围

在运行多租户工作负载的集群中，不应允许抢占一个租户的工作负载，并将资源分配给另一个租户。
这里的租户不一定是一个公司，也可以是同一公司内的一个部门或业务组。
租户映射到队列层次结构，队列层级结构可以跨越租户限制。

我们将这一点转化为 YuniKorn 的视角：让抢占行为仅限于队列层级结构的一部分是可能的。
为此，我们希望引入抢占范围的概念。
抢占范围是队列上的设置，用于阻止抢占动作检视范围外的队列。

抢占范围可以在层级结构上任何队列、任何位置进行设置。
在查找抢佔的受害者时，它会阻止向上遍历。
抢占范围是单向的，它阻止向外（即向队列层级结构的更高层）移动，但不会阻止向内（或向下）移动。
下面的示意图呈现了一个应用抢占范围的示例：

![preemption fencing](./../assets/preemption_fence.png)

该示例定义了三个不同级别的抢占范围。箭头描述了抢占流程。

首先看`队列 A`。
抢占范围是在叶队列上定义的，这意味着抢占被限制在该队列内。
这会限制`队列 A`进行队列间的抢占。
因此，抢佔只能发生在队列内，但这在当前的设计中是被排除的。
所以最终不会实现队列内抢佔的例子，不过我们允许这种配置。

第二个抢占范围设置在`租户 1`的级别。
这个抢占范围会影响`队列 B`中运行的任务。
`队列 B`中的任务可以在`租户 1`队列下方的所有队列找到抢占的受害者（在示意图中用 _黄色_ 箭头表示）。

对于`租户 2`队列也创建了类似的设置。
在这种情况下，`队列 1`和`队列 2`之间可以相互抢占（在示意图中用 _蓝色_ 箭头表示）。

在`租户 1`或`租户 2`队列下方的队列中的任务都不能抢占`系统队列`中的任务。
`系统队列`中的任务没有被设定抢占范围。
这意味着在示意图中，`系统队列`中的任务可以检查层级结构中的任何队列（如 _红色_ 箭头所示）。

## 抢占逻辑

要触发默认的 Kubernetes 调度程序进行抢占，Pod必须适应任何命名空间的配额，且找不到能分配该 Pod 的节点。
抢占会尝试找到一个节点来运行该 Pod，并专注于节点。
节点上所有具备较低优先级的 Pod 都被视为抢占的候选对象。
调度程序会减少候选对象的受害者列表，直到差不多足以容纳新 Pod。

调度程序会从触发抢占的 Pod 中，追踪进行抢占的节点。
出于多种原因，它不能保证触发抢占的 Pod 会被调度到抢占的节点上。

从 YuniKorn 的角度来看，我们已经为 DaemonSet 类型的 Pod 实现了以节点为重点的抢占。
来自 DaemonSet 的 Pod 必须在特定节点上运行，抢占的重点是为该节点腾出空间。
YuniKorn 保证该 Pod 将在该节点上运行，且直到 DaemonSet 的 Pod 被调度前，节点上没有任何 Pod 会被调度。

YuniKorn 中通用的抢占行为与其保证队列的保证配额有关（**规则 4**）。
只有在延迟之后才会触发抢占。
在触发抢占之前，必须至少经过一个抢占延迟单位。
与其查找节点不同，寻找受害者的第一步是基于其保证配额已用尽的队列构建受害者列表（**规则 5**）。
如果找不到在抢占范围内的队列（**规则 7**），抢占会立即停止。

下一步是构建受害者列表，这可能来自一个或多个队列。
若优先级高于触发抢占的 Pod，则该 Pod 会被忽略（**规则 6**）。
接着会忽略大于超额配额部分资源量的 Pod（**规则 2**）。
当决定要抢占哪些受害者时，可能会考虑受害队列在层次结构中，与触发抢占的队列的接近程度。
具体细节将在实施阶段中解决。

跨节点抢占是不支援的，被抢占的受害者们必须运行在同一节点上。
每个节点上的受害者们会被分组。
一组受害者，结合节点上可分配的空间，将决定该组是否可行。
在开始抢占之前，必须进行检查以确保进行抢佔的 Pod 能适应该节点。
如果有多个可行的组，则需要进行选择。
如何选择组的逻辑是一个实现细节。

在选择了一组受害者并间接选择了一个节点后，该节点将为 Pod 保留。
会根据受害者列表触发抢占，并在完成后将 Pod 调度到节点上。
保留动作会保证将触发抢佔的 Pod 被调度到该节点。
一个副作用是，重新启动被抢占的 Pod 后，这些受害者不能回到被释放的空间中，调度程序会等待所有被抢占的 Pod 退出。
它们可以被调度到不同的节点上，这不会阻止触发抢占的 Pod 被调度。

## 防止抢占循环

抢佔规则防止了循环抢占。应添加测试来复盖每个规则和以下情况。

ReplicaSet 是防止出现循环和循环抢占的良好示例。
每次从副本集中移除一个 Pod 时，ReplicaSet 控制器都会创建新的Pod，以确保集合完整。
如果规则未正确复盖所有情况，这种自动重新创建可能会触发循环。
标准测试的一部分应考虑涵盖以下的情况。

范例设置：Replica set _Prod Repl_ 在队列 _Prod_ 中运行。为了测试，一个 Replica set _Test Repl_ 在队列 _Test_ 中运行。这两个队列都属于相同的父队列（它们是同级的）。
这些Pod都使用相同的优先级和抢占设置。集群中没有剩馀空间。

基本范例 1：_Prod_ 位于其保证配额内，且多个 Replica set 的 Pod 被搁置。
_Test Repl_ 集合的所有 Pod 都在运行，且 _Test_ 超过了其保证资源容量。

抢占情形 1：为了为 _Prod Repl_ 创建一个 Pod 的空间，会抢占 _Test Repl_ 中的一个Pod。
两个队列最终都会超过其保证资源容量。
_Test Repl_ 中的Pod将被重新创建。它不能抢占 _Prod Repl_ 中的 Pod，因为那会导致 _Prod_ 队列低于其保证资源容量。
_Test Repl_ 中的Pod将不得不等待，直到集群中有空间可用。
_Prod Repl_ 的其他Pod也必须等待，由于 _Prod_ 队列已经超过了其保证资源，将无法再触发抢占。

抢占情形 2：尽管 _Test_ 超过了其保证资源容量，如果抢占了一个 _Test Repl_ 的 Pod，它最终会低于保证资源容量，因此不会触发抢占。
_Prod Repl_ 的 Pod 将保持搁置，直到集群中有可用空间。

抢占情形 3：为了帮 _Prod Repl_ 创建一个 Pod 的空间，会抢占 _Test Repl_ 中的一个 Pod。
_Prod_ 队列即使有额外的 Pod，仍然低于其保证资源。
_Test Repl_ 集合中的 Pod 将被重新创建。
由于 _Prod_ 仍然低于其保证资源，它不会被当成受害者。
_Test Repl_ 中的 Pod 必须等待到集群中有空间可用，而 _Prod_ 队列可以触发更多的抢占。
抢占检查会从头开始，这可能会触发 0 次或多次从 _Test_ 队列的抢占，具体情形取决于实际状态。

## 抢占配置

### 优先级类

作为 Pod 规范的一部分，我们需要提供禁止抢占的方式。
如果允许用户独立于优先级规则，在 Pod 上进行禁止抢占的设定，会导致 Kubernetes 和 YuniKorn 的抢占配置不一致。
这还会使得群集管理员失去定义哪些优先级不应该被排除的管理权。

一个设计目标是不在 Kubernetes 中引入新的物件。
考量上述提到在集群级别中，关于禁止抢占的控制和管理，这个设计重用了现有的 PriorityClass 对象。
我们不能也不该破坏默认的 Kubernetes 调度程序的现有功能，且插件版本会依赖于默认调度程序及其行为。
Pod 将像标准 Kubernetes 一样使用 priorityClassName。

PriorityClass对象允许指定一个 _preemptionPolicy_，这有两个可能的值：
* PreemptLowerPriority
* Never

这些值是在核心类型和验证中硬编码的。
除非对 Kubernetes 进行更改，否则无法添加新的值。
这意味着不能重新使用 _preemptionPolicy_ 属性本身。
该属性的内容将被传播到调度核心，让 YuniKorn 在调度时考虑此设置。

与 Kubernetes 中的其他所有对象一样，PriorityClass 对象扩展了基本对象，包括元数据。
作为元数据的一部分，我们可以在对象上设置标签或注释。
在我们添加的所有扩展中，标签比注释更受到限制。
一般情况中，我们倾向于在扩展中使用注释而不是标签。

我们的提议是在 PriorityClass 上添加一个注释，标示禁止抢占。
注释的名称将遵循我们用于所有其他注释的相同结构：
yunikorn.apache.org/allow-preemption

作为注释值，这里建议使用布尔值：

* "true"：允许被抢占
* "false"：不允许抢占

如果没有设置 _allow-preemption_ 的值，则将使用默认值 _true_。

这个设计要特别注意。
将注释的值设置为 _false_ 表示 Pod 可能会请求不被抢占。
但这不是一个保证。
如果没有其他解决方案可用，调度程序仍然可能会抢占 Pod，这将是最后手段。
这意味着上面定义的抢占策略只是强烈的提议，而不是一个保证。

可能会打破规则，抢占一个将注释设置为 _false_ 的 Pod 的示例是 DaemonSet。
DaemonSet Pod必须在指定的节点上运行。
如果在该节点上运行的所有 Pod 都是其他DaemonSet Pod 或 _allow-preemption_ 设置为 _false_ 的 Pod，那么在没有其他选择的情况下，选择禁止抢占的 Pod 还是会被抢占。

###  应用程序设置

优先级是 Kubernetes 上的 Pod 规范的一部分。
每个 Pod 都会被 k8shim 转换为 AllocationAsk 对象。
[YUNIKORN-1085](https://issues.apache.org/jira/browse/YUNIKORN-1085) 中实现了一部份的 DaemonSet 抢占，Pod 的优先级被读取，并设置到创建的 AllocationAsk 上。
目前传递的优先级只是一个普通的整数值，我们也不需要更多。

作为抢占的一部分，我们需要传递两个额外的附加值。
这两个值一起组成了 YuniKorn 的抢占策略。
这些值是 Kubernetes shim 发送的 AllocationAsk 中的一部分，并被传递到核心，两个值都映射到上述 PriorityClass 的内容。
与其添加两个单独的栏位，把它们封装到一条新消息中更清楚。

抢占策略可针对任何 AllocationAsk 进行处理，即使它有消息中的 "Originator" 标志设置为 _false_。
指定不同的抢占行为可能很重要，这会使得请求抢占的成本低，而选择退出抢佔的成本相对高。

使用案例还是 Spark 应用程序。一般会希望 driver 退出抢佔流程，而其他 Pod 则可以在调度期间进行抢占。

以 protobuf 消息的形式显示如下：

```
message AllocationAsk {
  ...
  // The preemption policy for this ask
  PreemptionPolicy preemptionPolicy = 12;
}

message PreemptionPolicy {
  // Allow preemption while running
  // Based on the YuniKorn annotation from the PriorityClass object
  bool allowPreemption = 1;
  // Preemption behavior while scheduling
  // Based on the K8s preemptionPolicy from the PriorityClass object
  string schedulerPreemption = 2;
}
```

### 队列配置
在队列配置对象中会添加两个新属性，以指定抢占范围类型和抢占延迟。
`preemption.policy` 和 `preemption.delay` 这两个属性可以作为队列的一部份，在任何队列上设置。
如下所示：

```yaml
queues:
  - name: fencedqueue
    properties:
      preemption.policy: fence
      preemption.delay: 30s
```

子模板中完全支援这些属性。
现有的功能中支援为动态队列设置这些属性。

根队列上可以设置 _preemption.policy_ 属性，但不会有任何作用。
根队列作为层级结构的顶层，没有父队列，这意味着抢占无法在队列树的更上层执行。
如果 _preemption.policy_ 设置在根队列上，则不会有任何记录。

支援的 _preemption.policy_ 值有
* default
* fence
* disabled

如果在队列上设置了 `fence`，则设置了该属性的队列或底下的下层队列中，不能抢占队列树外的其他任务。
默认值 `default` 不会将抢占范围限制在子树上。
如果没有设置抢佔策略 则使用 `default` 值。

_preemption.delay_ 只能在叶队列上设置。
叶队列包含任务，当队列低于其保证资源容量时，任务才会触发抢佔。
在非叶队列上设置抢占延迟则不会有任何影响，如果父队列上设置了 _preemption.delay_，则不会记录任何信息。

_preemption.delay_ 值必须是字符串形式的有效 Golang 时间长。
该值将使用时间包中定义的 `ParseDuration` 。

如果指定了 _preemption.delay_，其值必须大于 `0s`。如果没有指定 _preemption.delay_ 属性，则使用默认的 `30s`。
如果字符串解析失败，一样使用 `30s`。

## 调度器存储物件更改

### AllocationAsk

根据通讯的变化，调度器中的对象也需要修改，以永久话记录一些通信细节。
对于 AllocationAsk，我们需要存储两个新属性。

建议的新属性：_allowPreemption_ 和 _schedulerPreemption_

- _schedulerPreemption_ 仅在调度阶段使用
- _allowPreemption_ 将被传送到下方定义的 Allocation

### Allocation

基于 AllocationAsk 创建的分配(Allocation)需要一个新属性。
这消除了检查底层 AllocationAsk 是否允许抢占的需要。
分配中不需要调度程序的抢占值。

建议的新栏位：_allowPreemption_

### 队列

新的抢占策略和延迟值需要存储在队列对象中。
配置对象不会发生更改，因为我们在配置中使用队列属性来存储它们。

建议的新属性：_preemptionPolicy_ 和 _preemptionDelay_
