---
id: reporting_issues
title: 报告问题
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

# 报告问题

## 对于 YuniKorn 用户
如果您对 YuniKorn 操作有任何疑问，请遵循以下指南：

如果您在设置、配置或在其他不符合您期望的行为方面遇到问题时，请加入用户邮件列表并在该论坛中提问。
有关邮件列表的信息，请参见 [YuniKorn 网页](https://yunikorn.apache.org)。
您也可以向 YuniKorn slack 频道寻求帮助，查看网页了解如何加入的详细信息。
如果您在代码或文档中有需要修复的错误，请按照下面的 [归档 JIRA](#为-YuniKorn-问题提交-JIRA) 中的步骤进行操作。

## 对于 YuniKorn 开发人员
Apache YuniKorn 项目使用 JIRA 来跟踪所有问题。
这些包括：
1. 添加新功能
2. 改进现有功能
3. 报告代码库中需要修复的错误

如果您对在 JIRA 中跟踪开发问题感兴趣，可以浏览这个[链接](https://issues.apache.org/jira/projects/YUNIKORN)。

## 为 YuniKorn 问题提交 JIRA
请转到 Apache JIRA 页面来提交您的问题。

请确保项目设置为 YuniKorn。需要根据您的分析或请求适当设置问题类型字段：
* （Bug）漏洞
* （New Feature）新功能
* （Improvement）改进
* （Test）测试
* （Wish）希望
* （Task）任务

对于摘要，请提供详细的标题，例如 _K8 pod not scheduled in an empty cluster_ 而不仅仅是 _YuniKorn scheduling failed_。

如果您已将问题分到特定组件，请设置组件字段：

| 组件 | 描述 |
|-----------|-------------|
| build| 项目构建、构建脚本和 git 问题 |
| core - cache | 核心调度器缓存 |
| core - common | 核心调度器的公共代码，如资源 |
| core - scheduler | 核心调度问题 |
| documentation | 文档修复和增强 |
| scheduler-interface | 调度器接口规范 |
| security | 安全相关问题 |
| shim - kubernetes | K8shim 问题 |
| shim - yarn | Hadoop YARN shim 问题 |
| test - smoke | 冒烟测试失败 |
| test - unit | 单元测试失败 |
| webapp | 调度器的 Web UI |

影响版本字段可以设置为您发现错误的YuniKorn的最早版本。
如果您不确定，则将其留空。

如果您是打算修复该错误的开发人员，请将您的 JIRA ID 放在 Assignee 字段中。
请注意，您需要在 Apache YuniKorn 的贡献者列表中才能分配 JIRA ticket。
如果您还没有被添加到列表中，请发送电子邮件到 [dev@yunikorn.apache.org](mailto:dev@yunikorn.apache.org) 邮件列表或在 jira 的评论中请求它。

请在描述字段中填写尽可能多的详细信息。
这需要包括您的配置更改、集群大小和 YuniKorn 版本。
任何有助于复制您应该添加的问题的相关代码或配置。

对于错误报告：问题的简短再现将非常受欢迎。
如果您有日志，则日志的特定部分要带有错误消息或堆栈跟踪。
附加整个日志可能很有用。
如果您已经尝试调试问题，请描述您已经完成的步骤。
即使结果是您无法重现该问题。

对于新功能请求，它可能包括设计文档。
如果您没有，或者这只是一个通用请求，请与我们合作设计您的功能并实现它。
