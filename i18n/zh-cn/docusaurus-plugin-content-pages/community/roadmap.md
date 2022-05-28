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

# 未来发展：长期的目标

- 应用程序和任务优先级的支持
- 抢占资源分配
- 用户和组配额和限制执行
- 除了当前的独立模式之外，还会提供另一种部署模式作为默认调度程序的插件

# 下一个发布研发内容

发布详情：
- 版本：1.1.0
- 目标发布日期：2022 年 8 月
- 发布负责人：尚未决定
- 开发状态：[问题跟踪器](https://issues.apache.org/jira/issues/?filter=12348416)

计划的主要功能：
- [YUNIKORN-984](https://issues.apache.org/jira/browse/YUNIKORN-984) 实施用户和组限制 (phase 1)
- [YUNIKORN-725](https://issues.apache.org/jira/browse/YUNIKORN-725) 支持ARM64处理器
- [YUNIKORN-1187](https://issues.apache.org/jira/browse/YUNIKORN-1187) 恢复稳定性
- [YUNIKORN-1](https://issues.apache.org/jira/browse/YUNIKORN-1) 应用优先级
- [YUNIKORN-1196](https://issues.apache.org/jira/browse/YUNIKORN-1196) 更新K8s构建依赖
- [YUNIKORN-1085](https://issues.apache.org/jira/browse/YUNIKORN-1085) 在自动缩放期间添加的新节点上，可能无法调度 DaemonSet pod

支持的 Kubernetes 版本和 Kubernetes 依赖项将在开发周期中进行选择和最终确定。
