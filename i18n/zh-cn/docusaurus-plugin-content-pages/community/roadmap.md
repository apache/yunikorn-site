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
- 版本：1.0.0
- 目标发布日期：2022 年 3 月
- 发布负责人：Wilfred Spiegelenburg
- 开发状态：[问题跟踪器](https://issues.apache.org/jira/issues/?filter=12348416)

计划的主要功能：
- [YUNIKORN-971](https://issues.apache.org/jira/browse/YUNIKORN-971) 将 YuniKorn 实现为 Kubernetes 调度插件
- [YUNIKORN-978](https://issues.apache.org/jira/browse/YUNIKORN-978) 准入控制器部署改进
- [YUNIKORN-984](https://issues.apache.org/jira/browse/YUNIKORN-984) 实施用户和组限制（阶段 1）
- [YUNIKORN-954](https://issues.apache.org/jira/browse/YUNIKORN-954) 移除旧的 REST api
- [YUNIKORN-720](https://issues.apache.org/jira/browse/YUNIKORN-720) 对调度器资源队列指标监测系统的改进

支持的 Kubernetes 版本和 Kubernetes 依赖项将在开发周期中进行选择和最终确定。

# 过去的发布

| 版本     |    发布日期    |         发布负责人         | 发布公告                                               |
|--------|:----------:|:---------------------:|----------------------------------------------------|
| 0.12.1 | 2021-12-26 |      Chaoran Yu       | [0.12.1-release-notes](../release-announce/0.12.1) |
| 0.11.0 | 2021-08-18 |     Kinga Marton      | [0.11.0-release-notes](../release-announce/0.11.0) |
| 0.10.0 | 2021-04-09 |       Tao Yang        | [0.10.0-release-notes](../release-announce/0.10.0) |
| 0.9.0  | 2020-08-28 | Wilfred Spiegelenburg | [0.9.0-release-notes](../release-announce/0.9.0)   |
| 0.8.0  | 2020-05-04 |      Weiwei Yang      | [0.8.0-release-notes](../release-announce/0.8.0)   |
