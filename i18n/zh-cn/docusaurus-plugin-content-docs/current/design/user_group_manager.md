---
id: user_based_resource_usage_tracking
title: 用户资源使用监控
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

## 简介

目前，资源分配使用的跟踪仅限于一个队列。拥有分配的应用程序是该资源使用的来源。队列中的所有应用程序都将计入队列的资源使用量。队列还可以设置资源使用配额。队列的资源配额在调度周期内得到执行。

一个应用程序总是由一个用户/群组拥有。一个用户/群组可以拥有一个或多个队列中的应用程序。与队列一样，用户/群组可以设置限制。限制可以指定资源使用配额和应用程序使用限制。目前尚未实施按用户/群组跟踪这些用法，并将其作为这个设计的一部分进行讨论。



## 目标

- 指定与以下对象相关的跟踪用法：
  - 用户
  - 应用程序
  - 队列
- 提供一个界面来定义如何跟踪运行中的应用程序：
  - 读取用户/群组运行中的应用程序
  - 增加用户/群组运行中的应用程序 *)
  - 减少用户/群组运行中的应用程序

- 提供一个界面来定义如何跟踪使用情况：
  - 读取用户/群组资源使用情况
  - 增加用户/群组资源使用情况 *)
  - 减少用户/群组资源使用情况

  *) 这个调用可以在以后扩展以进行强制执行。

- 通过REST API公开用户/群组跟踪的信息

## 非目标

- 用户和群组检索是k8shim的一部分，不在范围内。
- 将使用情况作为指标暴露给Prometheus。
- 指定强制执行规则。
- 强制执行的实施。
- 定义允许强制执行的接口。

## 跟踪定义

### 用户与群组跟踪

跟踪基于核心调度程序中定义的_security.UserGroup_对象进行。用户和群组信息由shim检索，并通过调度程序接口中定义的_UserGroupInformation_对象进行通信。_security.UserGroup_对象包含：
- 用户（正好1个）
- 群组（0个或多个）

可以同时为用户和群组配置限制，放置在同一个队列中。因此，在明确配置用户限制的情况下，但已经配置了群组限制的情况下，将根据群组限制的配置来工作，而与是否为相应的群组（用户所属的群组）设置了配置无关。换句话说，用户限制设置始终具有较高的优先级，即使已为相应的群组（用户所属的群组）设置了配置也是如此。

"*"也允许用于用户和群组限制配置。在这种情况下，任何用户或群组都需要经过强制执行检查，以确保限制设置得到适当执行。然而，跟踪器不需要跟踪通配符用户，因为已经在其活动期间跟踪了特定用户或群组。

### 群组限制

用户可以属于零个、一个或多个群组。在某些系统中，比如Unix，存在主要群组的概念。这个概念并不普遍存在，也没有一致的主要群组定义。如果系统没有定义主要群组，我们该如何区分这些群组呢？

如果用户是多个群组的成员，那么将使用情况分配给一个群组也变得复杂。决定将使用情况分配给哪个群组变得随意。例如，考虑一个具有多个分配的用户。Joe属于dev和test两个群组。当启动一个应用程序时，该应用程序是否计入dev群组的限制还是计入test群组的限制，还是两者都计入？

_UserGroup_对象包含一个组的切片、列表或数组，从创建时刻开始具有固定的顺序。配置的组解析可能无法保证顺序，这意味着我们不能依赖_UserGroup_中的顺序是稳定的。必须定义一种稳定且预定义的选择群组的方式以跟踪使用情况。

首先要定义的一点是，跟踪只能针对零（0）或一个（1）群组进行。使用情况永远不会被跟踪到多个群组。如果用户是多个群组的成员，在首次为应用程序注册使用情况时会选择一个群组。在_UserGroup_对象中的群组列表中选择要跟踪的群组是基于层次队列限制配置的。层次结构从叶子开始被认为是自下而上的。在队列层次结构中首次指定的用于限制使用情况的群组，与_UserGroup_对象中的群组匹配的群组将被选择用于该应用程序。

如果未定义群组限制，在层次结构中，将不会跟踪群组的使用情况。如果_UserGroup_对象中未定义任何群组，则不会跟踪群组的使用情况。

跟踪器只考虑在跟踪器中首次使用注册的_UserGroup_对象中的群组。在用户的应用程序正在被跟踪时发生群组更改，跟踪器不会考虑群组更改。然而，如果用户提交了一个新的应用程序，那时刻的最新群组信息将被使用。

在k8shim完全支持群组之前，群组跟踪将受到限制。没有群组传递给核心的k8shim。这导致当前实现中的_UserGroup_对象始终只有一个群组。群组名称将与用户名相同。我们还排除了用于跟踪的配置处理。根据本文档中描述的当前跟踪实现，这些限制将导致与用户关联的用户和群组跟踪相同的使用情况。

### 基于集群或队列的跟踪

跟踪用户使用情况将基于每个队列的使用情况。将跟踪整个队列的层次结构，而不仅仅是叶子或根。整个集群的使用情况与根队列的使用情况相同。集群级别的使用情况不需要单独跟踪。

逐个跟踪队列的开销应该非常有限。在大多数情况下，用户将在特定队列中运行其工作负载。深度嵌套的队列也会增加跟踪的开销。在测试过程中，需要评估工作负载分布和/或深层嵌套的影响。如果需要，在文档中可以明确提到这一点。

我们还需要考虑的一点是，一个群组的多

个成员可能会在层次结构中使用不同的队列。如果跟踪使用情况仅限于叶子级别，汇总群组使用情况将变得更加困难，并丧失透明度。

与限制有关的文档，是强制执行的一部分，参考了用户或群组在不同级别的不同限制。仅跟踪叶子或根级别可能会破坏该功能。设计应该支持当前文档化的功能。如果在强制执行设计过程中做出了不同的决定，那么跟踪不是决定性因素。

## 应用程序跟踪

应用程序在核心调度程序中经历了多个状态。与应用程序相关的分配是应用程序状态更改的触发器。从跟踪的角度来看，我们需要定义什么是一个正在运行的应用程序。

由于占位符和占位符超时可能在状态更改中起作用，因此正在运行的应用程序跟踪的实现必须考虑到以下情况：
- 未定义gang
- 已定义gang，全部或部分占位符被替换
- 已定义gang风格为“soft”，所有占位符已超时
- 已定义gang风格为“hard”，所有占位符已超时

### 进入正在运行状态

应用程序在提交并放置到队列中时处于_New_状态。此时应用程序上没有分配或挂起的请求。在添加一个或多个请求（_AllocationAsks_）之后，应用程序进入了_Accepted_状态。当第一个分配（_Allocation_）添加到应用程序时，_Accepted_状态结束。应用程序然后转入Starting状态。

在此时，应用程序将使用资源配额，并且从跟踪的角度来看，应该被视为正在运行。这意味着将第一个_分配_添加到应用程序也必须是增加正在运行的应用程序的触发点。这个跟踪的触发点是应用程序处于_Accepted_状态时。这也是在[群组限制](#group-limitations)中所述的使用情况跟踪所需设置的时刻。

请注意，目前，应用程序状态转换代码块在应用程序进入_Running_状态时更新应用程序的运行队列指标。必须更新该指标以保持与上述正在运行的应用程序定义的一致性。将这一点与状态转换联系起来，进入Starting状态应该被使用。

### 退出正在运行状态

只要至少有一个分配被分配给应用程序，应用程序就应该被视为正在运行。移除最后一个分配应该减少正在运行的应用程序数量。但是，我们还需要考虑挂起的请求。

作为应用程序状态的一部分，当删除最后一个分配并且没有挂起的请求时，应用程序进入_Completing_状态。如果应用程序没有发生变化，它会自动进入_Completed_状态。进入_Completing_状态的应用程序都没有分配，但会考虑挂起的请求。因此，_Completing_状态的进入可以被用作减少正在运行的应用程序数量的触发点。

然而，存在应用程序从_Completing_状态返回到_Running_状态的情况。这与Kubernetes的Pod自动重启相关联。必须处理这种情况。

需要考虑的最后一种情况是应用程序失败。如果应用程序失败，它将进入Failing状态。应用程序不会进入_Completing_状态，但可能会增加正在运行的应用程序数量。故障可能是由于gang调度样式“hard”或分区的删除而触发的。

## 资源使用情况跟踪

资源使用情况是基于分配的添加或移除而跟踪的。

分配的移除是一种离线操作。shim通知核心调度程序分配不再存在，核心根据该移除更新跟踪。如果一个分配被抢占，核心会发起移除，但仍会被shim通知移除已发生。在接收到shim的确认之前，不得创建跟踪更新。

对于gang调度的实际分配替代占位符，遵循类似的概念。然而，在这种情况下，占位符的大小和实际分配之间可能存在不一致。关于这个问题的更多详细信息请参阅[YUNIKORN-982](https://issues.apache.org/jira/browse/YUNIKORN-982)。解决队列和节点的计费的更改也需要考虑到基于用户的资源跟踪。

将新的分配添加到应用程序会触发根据[群组限制](#group-limitations)中描述的用户和/或群组的跟踪资源的更新。设计文档没有涉及强制执行，但必须考虑强制执行实现。添加资源使用的时刻必须与当前队列结构更新和队列配额执行的时刻相一致。

更新的顺序：首先更新基于用户和群组的使用情况，然后进行队列配额强制执行和更新。如果队列强制执行失败，则回滚基于用户和群组的更新。

## 调度程序透明性

资源使用情况跟踪基于分配的资源分配，与应用程序的队列路径和应用程序的_user_字段相关联。应用程序跟踪是应

用程序数量的简单计数，与应用程序的队列路径和应用程序的用户字段相关联。
作为对此的扩展，我们可以考虑将_applicationID_添加到正在运行的应用程序的跟踪中，以帮助进行故障排除。这是当前提案的一部分。建议不将正在运行的应用程序跟踪与applicationID关联。

应用程序的用户字段是前面提到的_security.UserGroup_对象，并包含了跟踪使用情况所需的所有标识详细信息。

从调度程序的角度来看，不应该需要特殊的设置。跟踪应该始终能够正常工作，无需预先创建基于用户、群组或队列的条目。这意味着跟踪不能失败，即使用户或群组没有强制执行与之关联并且不存在于跟踪器中。

总之，跟踪器必须实现：
- 动态创建用户和/或群组。
- 自动清理不再需要的跟踪信息。
- 强制执行所需的配置处理。

## 用户群组管理器（UGM）

跟踪所有资源将成为调度程序中一个新的独立模块。这意味着不能从`scheduler.objects`包导入任何内容。这将允许我们将跟踪器单独运行，并在需要时将更新推送到后台处理队列中。

每个分区创建过程中将创建一个用户群组管理器。不会跟踪跨分区边界的用户配额。

新的独立模块，用户群组管理器包含了所有跟踪的规格和代码，将来可以扩展以包括强制执行代码。

对于所有用户，从启动开始都会跟踪资源和应用程序计数。这将发生无论用户或群组是否为其配置了强制执行。通过独立于强制执行的方式启动跟踪，使得在强制执行发生变化时，至少在用户级别，资源跟踪始终具有一致的视图。必须测试恢复与跟踪代码的组合。

在用户群组管理器中存储数据基于_security.UserGroup_结构内容。内置的_UserGroupCache_解析不能保证每次都返回相同的对象给同一个用户。

### UserGroup 缓存影响

_UserGroupCache_ 中目前没有稳定用户条目的概念。根据群组解析不保证顺序的事实，这个概念很可能也不可能存在。基于我们不能保证所有可能的群组解析都能保证群组的顺序，跟踪不会依赖于它。

目前，_UserGroupCache_ 仅在缓存期内保留 _UserGroup_ 对象条目。这对于积极的解析来说是300秒，对于消极的解析来说是30秒。在此缓存时间之后，该条目将作为缓存清理/过期过程的一部分而被删除。如果同一用户在过期后提交了第二个应用程序，将创建一个新的 _UserGroup_ 对象，并将其存储在缓存中。_UserGroup_ 对象具有一个属性 "resolved"，该属性保存了首次执行用户组解析的时间戳。缓存清理程序每60秒唤醒一次，删除所有 "resolved" 时间戳早于缓存超时的条目。

可能需要其他内部更改来确保所有 _UserGroup_ 对象都能正确缓存并在缓存内按预期返回。这些留作缓存更改的实施细节。

### 跟踪结构

用户组管理器必须能够跟踪用户和群组的使用情况。用户是所有跟踪的主要访问点。用户组管理器结构将实现 [跟踪器接口](#tracker-interface)。

```go
package user_group_manager

type Manager struct {
  users  map[string]*userTracker
  groups map[string]*groupTracker

  sync.RWMutex
}

(m *Manager) checkAppGroup(queuePath, applicationID string, user *security.UserGroup)
```

用户组管理器中的所有对象将在内部管理。创建用户和/或群组跟踪器对象基于跟踪资源的请求。这些对象将添加到用户组管理器的两个结构之一。只有在跟踪资源增加后，才能触发用户和群组对象的创建。用户和/或群组跟踪器对象的创建由用户组管理器处理。用户组管理器还负责在创建后立即为队列层次结构设置使用情况信息。

应用程序的使用情况跟踪所选择的群组是通过用户组管理器的 checkAppGroup 处理的。作为资源使用情况增加的一部分，管理器将检查应用程序是否已跟踪用户。如果已经跟踪了应用程序，不会发生任何变化。如果未跟踪应用程序，管理器将解析要跟踪的群组并更新 userTracker 对象。如果没有为该群组注册活动的跟踪器，将创建一个新的 groupTracker 对象，并根据需要初始化它。

只有在跟踪资源减少后才能触发用户或群组对象的删除。对于用户跟踪器对象，用户的使用情况必须为零。对于群组跟踪器对象，应用程序引用计数必须为零。用户和/或群组跟踪器对象的删除定期进行。这个清理必须是 `go routine` 安全的。从不同的例程、调度程序分配处理或由 shi回收分配引发的不同例程可能会触发对映射的更新。

### 跟踪器接口

该接口描述了用户组管理器将公开的功能。其他调度程序组件可以依赖于接口中定义的功能，以增加、减少应用程序和/或资源使用情况并获取跟踪的资源。

```go
package user_group_manager

type Tracker interface {
  GetUserResources(user *security.UserGroup) *Resource
  GetGroupResources(group string) *Resource

  GetUsersResources() []*userTracker
  GetGroupsResources() []*groupTracker

  IncreaseTrackedResource(queuePath, applicationID string, usage *Resource, user *security.UserGroup) error
  DecreaseTrackedResource(queuePath, applicationID string, usage *Resource, removeApp bool, user *security.UserGroup) error
}
```

_IncreaseTrackedResource()_ 和 _DecreaseTrackedResource()_ 调用将实现跟踪数据的更新。Get* 调用提供了安全访问跟踪数据的方式，以便作为在REST接口中公开数据的一部分使用。有关更多详细信息，请参阅[暴露使用情况跟踪](#exposure-of-usage-tracking)。

应用程序将在调用增加跟

踪资源时自动添加。首次遇到应用程序ID时，会相应地更新结构并开始跟踪。应用程序的删除是通过离开[运行状态](#running-state-exit)触发的，这等同于最后一次使用的删除，并且还必须将 removeApp 标志设置为 true。

不允许使用空值或nil参数调用 _IncreaseTrackedResource()_ 和 _DecreaseTrackedResource()_，将返回错误由调用者处理。_GetUserResource_ 和 _GetGroupResource_ 调用可以返回 _nil_ 资源值。_GetUsersResource_ 和 _GetGroupsResource_ 调用可以返回一个空切片。

### 用户跟踪

userTracker 包含了用户的所有跟踪使用情况信息。所有使用情况的更改，即使是群组使用情况，都是用户对象的一部分。

userTracker 对象包含一个对每个要跟踪的应用程序的使用情况的引用映射，将其链接到特定应用程序的 groupTracker 对象。多个应用程序可以跟踪相同的 groupTracker 对象。

对于应用程序的每个 groupTracker 对象都将在使用情况添加时设置。群组引用将在 userTracker 对象上检查，通过调用 _hasGroupForApp_ 可以检查应用程序是否存在于群组映射中。如果应用程序ID作为键存在，它将返回 true，否则返回 false。返回值仅基于应用程序ID的存在，而不基于它引用的值。

可以通过调用 _setGroupForApp_ 在 userTracker 对象上设置 groupTracker 引用。如果应用程序ID已经存在，则设置 groupTracker 引用的调用是无操作，不会更改任何内容。引用一旦设置就不能更改。groupTracker 引用可以为nil。在引用为nil的情况下，不会对该应用程序执行任何群组的跟踪。即使引用为nil，也不能被替换。

对于用户，增加或减少跟踪的资源需要将应用程序ID设置为非空值。在删除应用程序的最后一个分配时，群组引用将从 userTracker 对象中删除。要从 userTracker 中删除运行中的应用程序，必须在 _decreaseResource_ 调用中设置应用程序ID，并将 removeApp 标志设置为 true。删除 groupTracker 引用只能作为 _decreaseResource_ 调用的一部分进行。

如果在群组引用中没有留下应用程序，则该对象将被用户组管理器的清理运行删除。这也意味着被引用的 queueTracker 对象不再跟踪使用情况。

使用情况按队列存储在与该用户特定的队列结构中。queueTracker 对象提供了一个分层结构。这个结构从队列层次结构的根开始，只包含正在跟踪使用情况的子队列。必须作为处理的一部分更新层次结构，包括添加或删除子条目。

根 queueTracker 的创建是创建新 userTracker 对象的一部分。

```go
package user_group_manager

type userTracker struct {
  userName  string
  group     map[string]*groupTracker
  queue     *queueTracker
  
  sync.RWMutex
}

newUserTracker(queuePath string, user *security.UserGroup) *userTracker

(ut *userTracker) increaseResource(queuePath, applicationID string, usage *Resource)
(ut *userTracker) decreaseResource(queuePath, applicationID string, usage *Resource, removeApp bool)
(ut *userTracker) hasGroupForApp(applicationID string) bool
(ut *userTracker) setGroupForApp(applicationID string, groupTrack *groupTracker)
```

### 群组跟踪

groupTracker 包含了群组的所有跟踪使用情况信息。这个对象可以被多个用户共享，用于一个或多个应用程序。它会自动将跟踪的应用程序添加到列表中。为此，它期望每次 _increaseResource_ 调用都设置一个非空值的应用程序ID。

为了简单地减少跟踪群组的资源，应用程序ID可以为空。在删除应用程序的最后一个分配时，应用程序将从 groupTracker 对象中删除。要从 groupTracker 中删除运行中的应用程序，必须在 _decreaseResource_ 调用中设置应用程序ID，并将 removeApp 标志设置为 true。

如果在 groupTracker 中跟踪的应用程序中没有条目，该对象将被用户组管理器的清理运行删除。这也意味着被引用的 queueTracker 对象不再跟踪使用情况。

使用情况按队列存储在与该群组特定的队列结构中。queueTracker 对象提供了一个分层结构。这个结构从队列层次结构的根开始，只包含正在跟踪使用情况的子队列。必须作为处理的一部分更新层次结构，包括添加或删除子条目。

根 queueTracker 的创建是创建新 groupTracker 对象的一部分。

```go
package user_group_manager

type groupTracker struct {
  groupName    string
  applications map[string]bool
  queue        *queueTracker
  
  sync.RWMutex
}

newGroupTracker(queuePath string, group string) *groupTracker

(gt *groupTracker) increaseResource(queuePath, applicationID string, usage *Resource)
(gt *groupTracker) decreaseResource(queuePath, applicationID string, usage *Resource, removeApp bool)
```

### 队列跟踪

queueTracker 充当用户和群组跟踪的基础。它提供了跟踪使用情况的实际位置。结构的顶部，从 userTracker 或 groupTracker 对象引用，包含根队列使用情况。queueTracker 只被一个 user

Tracker 或一个 groupTracker 对象引用，不得共享。这意味着我们不应在 queueTracker 对象内部执行任何锁定。

根的队列结构，从用户或群组跟踪器对象引用，包含在 childQueues 中。完整队列路径的每个部分都创建了一个新级别的对象。此结构显示了一种稀疏的分层队列结构。它可能不代表调度程序中已知的完整队列结构。

根 queueTracker 的创建返回一个没有设置使用情况并且固定队列名称为 "root" 的普通对象。然后，应通过调用 _increaseResource_ 来更新使用情况。这个调用应该处理给定的递归队列路径的创建。它期望每次调用都设置一个非空值的应用程序ID。

要简单地减少队列的跟踪资源，应用程序ID可以为空。在删除应用程序的最后一个分配时，应用程序将从 queueTracker 中删除。要从队列跟踪器中删除运行中的应用程序，必须在 _decreaseResource_ 调用中设置应用程序ID，并将 removeApp 标志设置为 true。

```go
package user_group_manager

type queueTracker struct {
  queueName           string
  resourceUsage       *Resource
  runningApplications map[string]boolean

  childQueues   map[string]*queueTracker
}

newQueueTracker() *queueTracker

(qt *queueTracker) increaseResource(queuePath, applicationID string, usage *Resource)
(qt *queueTracker) decreaseResource(queuePath, applicationID string, usage *Resource, removeApp bool)
```

### 更新一致性

所有更改都是针对 userTracker 对象触发的。由于强制执行配额不在此设计的范围之内，因此我们可以忽略由于配额用尽而导致的更新失败。没有要求或可能需要回滚更新。

资源使用情况更新可以从两个点触发：调度程序的分配和 shi释放。分配和释放都需要更新用户和群组使用情况信息。我们必须保证两者都被更改，或者两者都不被更改。

释放也是从调度周期异步处理的。这意味着我们必须能够保证增加和减少同样适用于两个对象。用于序列化更改的对象锁定必须存在以支持此操作。

另一个点是更新的排序和锁定。增加和减少处理必须遵循相同的顺序。两者都必须以相同的顺序更新 userTracker 和相关的 groupTracker 对象。这是为了防止在同时更新相同用户的增加和减少时出现死锁的要求。

对于源自两个不同用户的 groupTracker 更新，需要对 groupTracker 对象进行锁定。两个更新中的一个将能够继续进行，而另一个将等待更新完成。

最后要考虑的是两个更新紧密跟随在同一对象上的一致性。如果第一个更新删除了所有现有的使用情况，那么用户组管理器的用户已经解析完成。代码对该对象有一个引用。处理等待锁定用户Tracker对象的引用。这一点可能会导致对象变得无链接并且使用情况跟踪信息丢失。实现需要防止这种竞争条件。


### 使用情况跟踪的暴露

用户组管理器的使用情况跟踪信息必须暴露给外部使用。我们目前的所有信息都是通过REST调用公开的。

基于当前其他对象的REST API 定义，建议公开以下新端点：

- /ws/v1/partition/{partitionName}/usage/users
- /ws/v1/partition/{partitionName}/usage/groups

对于这两个端点，我们公开完整的队列层次结构。以下是一个示例，显示了一个用户的用户端点的近似输出：

```json
[
  {
    "userName": "user1",
    "groups": {
      "app2": "tester"
    },
    "queues":
    {
      "queuename": "root",
      "resourceUsage": {
        "memory": 12000000000,
        "vcore": 12000
      },
      "runningApplications": ["app1", "app2"],
      "children": [
        {
        "queuename": "root.default",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": ["app1"],
        "children": []
        },
        {
          "queuename": "root.test",
          "resourceUsage": {
            "memory": 6000000000,
            "vcore": 6000
          },
          "runningApplications": [
            "app2"
          ],
          "children": []
        }]
    }
  }
]
```


An example below the approximate output for the groups endpoint for one group:

```json
[
  {
    "groupName" : "tester",
    "applications": ["app2"],
    "queues":
    {
      "queuename": "root",
      "resourceUsage": {
        "memory": 6000000000,
        "vcore": 6000
      },
      "runningApplications": ["app2"],
      "children": [
        {
        "queuename": "root.test",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": ["app2"],
        "children": []
        }
      ]
    }
  }
]
```