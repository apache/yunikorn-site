---
id: roadmap
title: 路线图
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

# Kubernetes 版本支持
支持的 Kubernetes 版本和 Kubernetes 依赖项将在开发周期中进行选择和最终确定。
随着 Kubernetes 依赖项更改计划作为该版本的主要功能之一，一些信息已经为人所知。
有关初步详细信息，请参阅 YuniKorn 1.3 [发布公告](/release-announce/1.3.0)。

# 下一个发布研发内容
发布详情：
- 版本：1.4.0
- 目标发布日期：2023 年 10 月/11 月
- 发布负责人：尚未决定
- 开发状态：[问题跟踪器](https://issues.apache.org/jira/issues/?filter=12348416)

计划的主要功能：
- [YUNIKORN-1699](https://issues.apache.org/jira/browse/YUNIKORN-1699) K8s 1.27 支持，包括预先入队hook
- [YUNIKORN-1573](https://issues.apache.org/jira/browse/YUNIKORN-1573) [Umbrella] 基于用户和群组的配额执行
- [YUNIKORN-1628](https://issues.apache.org/jira/browse/YUNIKORN-1628) [Umbrella] 应用跟踪历史
- [YUNIKORN-1777](https://issues.apache.org/jira/browse/YUNIKORN-1777) [Umbrella] 恢复和启动
- [YUNIKORN-22](https://issues.apache.org/jira/browse/YUNIKORN-22) 节点的分区支持
- [YUNIKORN-1728](https://issues.apache.org/jira/browse/YUNIKORN-1728) 队列最大应用量和资源的百分比支持

- Web UI更改:
  - [还没有jira] 显示抢占信息
  - [还没有jira] 资源显示返工
  - [YUNIKORN-1727](https://issues.apache.org/jira/browse/YUNIKORN-1727) 构建信息扩展
  - [YUNIKORN-1362](https://issues.apache.org/jira/browse/YUNIKORN-1362) 在 UI 中过滤节点

# 未来发展：长期的目标
- REST 和 Web UI：authn、authz和加密
- 支持隊列型態雙向改變(从叶队列到父队列和从父队列到叶队列)
- 将应用从一个队列移动到另一个队列
- 压缩队列配置（configmap 1MB 限制）