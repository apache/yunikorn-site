---
id: scheduler_plugin
title: K8s 调度器插件
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
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
-->


## 背景

在 Kubernetes 上，原始的作法是将 YuniKorn 当作 Kubernetes 调度器从零开始实现的。这使我们能够快创新，但也存在问题。我们目前有许多地方
调用非公开的 K8S 源代码API，这些API的稳定性各不相同，当我们切换到新的 Kubernetes 版本时，需要进行破坏性的代码更动。

理想情况下，我们应该能够自动地支援新的 Kubernetes 发布版本，并受益于新功能。使用插件模式可以增强 Kubernetes 版本的兼容性，减少工作量。
此外，在许多情况下，允许非批次处理工作负载绕过 YuniKorn 调度功能并使用默认调度逻辑是可取的。然而，我们目前无法做到这一点，因为 
YuniKorn 调度器二进制文件中没有默认的调度功能。自 Kubernetes 1.19 版本以来，Kubernetes 项目已经创建了一个稳定的 API 
用于[调度框架](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/)，
允许创建实现各种扩展点的插件。插件实现一个或多个这些扩展点，然后编译为调度器的二进制文件，其中包含默认调度器和差件代码，
并在正常调度流程中调用插件。

## 设计

我们在 k8s-shim 代码库中添加了一个调度器插件，可以用来编译为 Kubernetes 调度器，其中包含 YuniKorn 功能以及默认调度器功能。
显著地提高 YuniKorn 与 Kubernetes 的兼容性，并有更大的信心将 YuniKorn 部署为集群中唯一的调度器。将为调度器建构分别两种 Docker 镜像：
传统的 YuniKorn 调度器构建为 `scheduler-{version}`，而新的插件版本构建为 `scheduler-plugin-{version}`。可以通过自定义调度器镜像
来交替部署它们到 Kubernetes 集群中，使用相同的 Helm charts 进行部署。

## 入口点

现有的 shim `main()` 方法已经被移动到 `pkg/cmd/shim/main.go`，并创建了一个新的 `main()` 方法在 
`pkg/cmd/schedulerplugin/main.go` 之下。该方法实例化默认的 Kubernetes 调度器，并将 YuniKorn 作为一组插件添加到其中。
它还修改了默认调度器器的 CLI 参数解析，以添加 YuniKorn 特定的选项。创建 YuniKorn 插件时，它将在后台启动现有的 shim / core 调度器，
同步所有的 informer， 并启动正常的 YuniKorn 调度循环。

## Shim 调度器更改

为了与默认调度器合作，当处于插件模式时，shim 需要稍微不同地操作。这些差异包括：

- 在 `postTaskAllocated()` 中，我们实际上不会绑定 Pod 或 Volumes，因为这是默认调度器框架的责任。
  相反，我们在内部映射中跟踪 YK 为节点分配的节点，分派一个新的 BindTaskEvent，并在 Pod 上记录一个 `QuotaApproved` 事件。
- 在 `postTaskBound()` 中，我们将 Pod 的状态更新为 `QuotaApproved`，因为这将导致默认调度器重新评估 Pod 的调度（更多细节见下文）。
- 在调度器缓存中，我们跟踪待处理和进行中的 Pod 分配。当 Pod 在 Kubernetes 中被删除时，也将调度器缓存中的 Pod 删除。


## 插件模式的实现

为了暴露 YuniKorn 的全部功能，我们实现了三个调度框架插件：

### PreFilter

PreFilter 插件被传入一个 Pod 的引用，并根据是否应该考虑该 Pod 进行调度，返回 `Success` 或 `Unschedulable`。

对于 YuniKorn 的实现，我们首先检查 Pod 是否定义 `applicationId`。如果没有，我们立即返回 `Success`，
这允许我们将非批处理工作负载委托给默认调度器。

如果存在 `applicationId`，则确定是否存在待处理的 Pod 分配（表示 YuniKorn core 已经决定分配该 Pod）。
如果存在待处理的 Pod 分配，我们返回 `Success`，否则返回 `Unschedulable`。
此外，如果检测到正在进行的分配（表示我们先前尝试过调度该 Pod），我们触发一个 `RejectTask` 事件给 YuniKorn core，
以便稍后重新发送该 Pod 进行调度。

### Filter

Filter 插件用于过滤无法运行 Pod 的节点。只有在 PreFilter 阶段通过的 Pod 才会进行评估。

对于 YuniKorn 插件，我们遵循类似 PreFilter 的逻辑，但我们还验证「待处理的 Pod 分配」之节点是否与 YuniKorn 选择的节点匹配。
如果节点匹配，我们将待处理分配转换为进行中的分配。这样做的目的是确保与默认调度器保持同步。因为有可能我们允许分配继续进行，
但由于某些原因导致绑定失败。这样的处理方式有助于保持一致性。

### PostBind

PostBind 扩展点在信息上用于通知插件一个 Pod 已成功绑定。

YuniKorn 使用这个来清理未完成的Pod分配进程。
