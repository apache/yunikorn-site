---
id: k8shim
title: Kubernetes Shim 设计
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

Github仓库: https://github.com/apache/incubator-yunikorn-k8shim

在阅读这一章节之前请先阅读 [架构](architecture.md) 章节的文档。
在理解什么是 Kubernetes shim 之前，您需要了解YuniKorn的3层设计。

## Kubernetes shim

YuniKorn Kubernetes shim负责与Kubernetes交互，它负责转译Kubernetes集群资源，并通过调度器接口将资源请求发送到调度器核心。
当调度器做出决策时，它负责将pod绑定到特定节点。
在shim和调度器核心之间的所有通信都是通过调度器接口进行的。

## admission controller（准入控制器）

admission controller 在一个单独的pod中运行，它基于如下的方式运行一个 [mutation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) 和一个 [validation webhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) ：

1. `mutation webhook` 通过以下方式对pod规范进行变异：
   - 添加 `schedulerName: yunikorn`
     - 通过显式指定调度程序名称，pod将由YuniKorn调度程序进行调度
   - 添加 `applicationId` 标签
     - 当标签 `applicationId` 存在时，重用给定的 applicationId
     - 当标签 `spark-app-selector` 存在时，重用给定的 spark app ID
     - 否则，使用 `yunikorn-<namespace>-autogen` 为这个pod分配一个 application ID。每个命名空间都是唯一的。
   - 添加 `queue` 标签
     - 当标签 `queue` 存在时，重用给定的名称。注意，如果启用了放置规则，则忽略标签中设置的值。
     - 否则，添加 `queue: root.default`
  - 添加 `disableStateAware` 标签
     - 如果 pod 被准入控制器分配了一个生成的 applicationId，还要设置 `disableStateAware: true`。 这会导致生成的应用程序立即从 `Starting` 状态转换为 `Running` 状态，这样它就不会阻塞其他应用程序。 
2. `validation webhook` 验证 configmap 中的的配置集
   - 这用于防止将格式错误的配置写入configmap
   - validation webhook 调用调度器 [validation REST API](api/scheduler.md#configuration-validation) 以验证configmap更新

### admission controller 部署

当前，admission controller 的部署是作为调度器部署中的 `post-start` hook完成的。类似地，卸载是作为 `pre-stop` hook。
可以查看相关的代码 [链接](https://github.com/apache/incubator-yunikorn-release/blob/56e580af24ed3433e7d73d9ea556b19ad7b74337/helm-charts/yunikorn/templates/deployment.yaml#L80-L85)。
在安装过程中，admission controller与调度程序pod始终放在同一位置，这是通过在admission controller 的 pod 中添加 pod-affinity 来实现的，如：

```yaml
podAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
      matchExpressions:
      - key: component
        operator: In
        values:
        - yunikorn-scheduler
      topologyKey: "kubernetes.io/hostname"
```

它还可以容忍所有的污点，以防调度器pod有一些容忍集。

```yaml
tolerations:
- operator: "Exists"
```
