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

# 下一个发布研发内容

发布详情：
- 版本：1.3.0
- 目标发布日期：2023 年 5 月
- 发布负责人：尚未决定
- 开发状态：[问题跟踪器](https://issues.apache.org/jira/issues/?filter=12348416)

计划的主要功能：
- [YUNIKORN-984](https://issues.apache.org/jira/browse/YUNIKORN-984) [Umbrella] 用户配额跟踪
- [YUNIKORN-1196](https://issues.apache.org/jira/browse/YUNIKORN-1196) 升级K8s构建依赖
- [YUNIKORN-1275](https://issues.apache.org/jira/browse/YUNIKORN-1275) 支持命名空间注解中的任意资源
- [YUNIKORN-1306](https://issues.apache.org/jira/browse/YUNIKORN-1306) [Umbrella]增强的用户和组群处理
- [YUNIKORN-1](https://issues.apache.org/jira/browse/YUNIKORN-1) 支持应用程序/任务优先级感知调度

支持的 Kubernetes 版本和 Kubernetes 依赖项将在开发周期中进行选择和最终确定。

# 未来发展：长期的目标

- 抢占：非守护进程集案例
- 插件模式部署为默认模式
- shim、core和web的标准化配置
- REST 和 Web UI：authn、authz和加密
