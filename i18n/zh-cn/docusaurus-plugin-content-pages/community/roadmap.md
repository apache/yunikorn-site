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
目前的构建依赖版本: 1.27

# 下一个发布研发内容
发布详情：
- 版本：1.5.0
- 目标发布日期：2024 年 2 月/3 月
- 发布负责人：尚未决定
- 开发状态：[问题跟踪器](https://issues.apache.org/jira/issues/?filter=12348416)

计划的主要功能：
- [YUNIKORN-970](https://issues.apache.org/jira/browse/YUNIKORN-970) 将队列指标改为可标记的
- [YUNIKORN-1544](https://issues.apache.org/jira/browse/YUNIKORN-1544) 使用者与群组配额实施 - 阶段 2
- [YUNIKORN-2099](https://issues.apache.org/jira/browse/YUNIKORN-2099) [Umbrella] 简化 K8shim
- [YUNIKORN-2115](https://issues.apache.org/jira/browse/YUNIKORN-2125) [Umbrella] 应用程式追踪历史 - 阶段 2
- [YUNIKORN-1362](https://issues.apache.org/jira/browse/YUNIKORN-1362) UI 中的节点过滤
- [YUNIKORN-1727](https://issues.apache.org/jira/browse/YUNIKORN-1727) 建置资讯扩展
- [YUNIKORN-1922](https://issues.apache.org/jira/browse/YUNIKORN-1922) 在网页UI中显示待处理的资源
- [YUNIKORN-2140](https://issues.apache.org/jira/browse/YUNIKORN-2140) Web UI: 资源显示重制
- [no jira yet] 在 web UI 中显示抢占讯息

# 未来发展：长期的目标
- [YUNIKORN-22](https://issues.apache.org/jira/browse/YUNIKORN-22) 支援节点分区
- [YUNIKORN-1728](https://issues.apache.org/jira/browse/YUNIKORN-1728) 支持队列最大应用程式及资源百分比
- 队列类型从叶节点变为父节点，反之亦然
- 应用程式的队列间移动
- 压缩队列配置 (configmap 1MB 限制)
- 可重复的构建
- FIPS 构建