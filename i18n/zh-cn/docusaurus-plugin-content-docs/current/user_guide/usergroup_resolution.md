---
id: usergroup_resolution
title: 用户和组解析
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

## 用户解析

用户信息是调度周期的一个重要方面。它是可用于确定作业应提交到的队列的关键标志之一。Yunikorn 调度器依靠 K8s Shim 来提供用户信息。在 Kubernetes 的世界中，没有定义识别实际用户的对象。这是设计使然，可以在 [此处](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#users-in-kubernetes) 找到更多信息。

由于 Kubernetes 没有用于用户信息的预定义字段或资源，并且具有唯一用户识别工具的单个集群部署可能会有所不同，因此我们定义了一种识别用户的标准方法。Yunikorn 需要添加一个 Kubernetes [标签](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)。使用此处提供的[建议](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)，默认的标签定义如下：

| 标签                                           | 名称 |
|----------------------------------------------- |---------------------	|
| yunikorn.apache.org/username 	                 | 用户名。它可以有重复的条目，但只会使用第一个值。默认用户是`nobody` |

例子:
```yaml
metadata:
  labels:
    yunikorn.apache.org/username: "john"
```
:::tip
为了使授权用户能够唯一地识别此字段，建议通过集群管理员使用的用户识别工具将此标签添加为不可变字段。集群管理员或用户可以自由使用任何方法或工具来添加该字段和值。这包括在提交时手动添加的情况。
:::

:::note 假设 
假设:
  YuniKorn 假设属于一个应用程序的所有 pod 都归同一个用户所有。我们建议将用户标签添加到应用程序的每个 pod。这是为了确保没有差异。
:::

`yunikorn.apache.org/username` 键可以通过使用 `USER_LABEL_KEY` 环境变量覆盖默认值来在 [K8s](https://github.com/apache/incubator-yunikorn-release/blob/master/helm-charts/yunikorn/templates/deployment.yaml) 来进行自定义。这在已经添加了用户标签或出于某些安全原因必须修改标签的情况下特别有用。

```yaml
env:
- name: USER_LABEL_KEY
  value: "custom_user_label"
```

## 组解析

组成员身份解析是可插拔的，并在此处定义。组不必是提供的用户和组对象的一部分。当对象添加到缓存中时，组会根据解析配置自动进行解析。
我们可以为每个分区设置链接到缓存的解析器。

默认组解析器是“无解析器”。
此解析器仅显示用户名和与用户同名的主要组。

其他解析器是：
* 操作系统解析器
* 测试解析器
