---
id: how_to_contribute
title: 如何贡献
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

# 如何贡献

YuniKorn 使用：
* JIRA 用于问题跟踪。
* GitHub 用于 Pull Requests(以后简称拉取请求)来管理代码审查和更改本身。
* Markdown 文档，版本化并存储在网站存储库中。

## Jira 注册

2022 年 11 月，由于虚假 Jira 帐户的涌入造成大量垃圾邮件，Apache Infra 终止了 ASF Jira 帐户的公共注册。
这篇 [博客文章 - 英语](https://infra.apache.org/blog/jira-public-signup-disabled.html) 讨论了这个决定。
如果您想为 YuniKorn 开一个 Jira 票证并且没有 ASF Jira 账户，YuniKorn PMC 可以为您创建一个账户。

有两个选项可以轻松申请帐户：
* 电邮 [private@yunikorn](mailto:private@yunikorn.apache.org?subject=jira%20account%20request)
* Slack [YuniKorn Slack](https://join.slack.com/t/yunikornworkspace/shared_invite/enQtNzAzMjY0OTI4MjYzLTBmMDdkYTAwNDMwNTE3NWVjZWE1OTczMWE4NDI2Yzg3MmEyZjUyYTZlMDE5M2U4ZjZhNmYyNGFmYjY4ZGYyMGE)

我们需要以下信息来创建一个帐户：
* 电子邮件
* 首选用户名 (不允许使用连字符)
* 备用用户名 (如果首选的已经在使用中)
* 显示名称 (如果它与用户名不同)

:::caution
不要在 Slack 的频道中分享上述信息，在频道中联系，其中一位 PMC 成员将在私人聊天中联系以收集详细信息。  
:::

## 发现问题
我们使用 JIRA 问题库来跟踪该项目的错误。
找到您想要处理的问题，或者如果您发现了新问题，请提交新问题。
有关报告问题的帮助，请查看 [如何报告问题](reporting_issues)。

开始使用代码库的最简单方法是选择一个非常简单的 JIRA 问题并开始工作。
这将帮助您熟悉代码库、构建系统、审查过程等。
我们在 [此处](https://issues.apache.org/jira/issues/?jql=project%3DYUNIKORN%20AND%20status%3DOpen%20AND%20labels%3Dnewbie) 标记这些入门错误。

如果没有人在处理现有问题，请您在只想打算尽快处理该问题时将其分配给自己。
如果您选择现有的 JIRA，请查找链接到 JIRA ticket 的拉取请求。
有人可能已经在处理它并且没有分配 ticket。
具有拉取请求链接的 JIRA 将具有标签 `pull-request-available`，并且可以在问题链接下找到拉取请求的链接。

对于任何不只是微不足道的更改，例如拼写错误或一行代码更改，在公开的渠道如slack或者邮件列表讨论您将如何解决这个问题将很有帮助。
如果您在开始编写修复程序之前已经从 YuniKorn 社区获得了支持，那么您更有可能审查并提交您的补丁程序。

如果您无法将 JIRA 分配给自己，请请求社区帮助分配并将您添加到 JIRA 的贡献者列表中。

## 修复问题
必须在 `master` 分支上创建修复或改进。
将相关的 YuniKorn 项目 fork 到您自己的项目中并签出 `master` 分支。
确保在开始之前签出最新的代码修订。
创建一个分支来处理，一个好名字是你正在处理的 JIRA ID。

现在可以开始编码了！在编写补丁时，请牢记以下几点：

在您的补丁中需要包含测试。
如果您的补丁添加了功能或修复了错误并且不包括测试，则通常不会被接受。
如果您不确定如何为特定组件编写测试，请在 JIRA 上寻求指导。

您的补丁应该只包含对 JIRA 描述的问题的修复，超过改范围应该由新的 JIRA 来跟踪。这样的原则有利于代码的维护和审核。
一般来说，如果您在处理特定功能时发现错误，请为该错误提交 JIRA，并检查您是否可以将其分配给自己并独立于该功能进行修复。
这有助于我们区分错误修复和功能，并让我们构建稳定的维护版本。

确保您已遵守 [编码指南](coding_guidelines) 中的建议。
在您提交之前，您还应该使用 `make test` 运行完整的测试套件。
这样能确保所有测试都通过。

最后，请写一个好的、清晰的提交信息，并带有一个简短的描述性标题。
描述性标题必须以您正在处理的 JIRA ID 开头。
一个例子是：`[YUNIKORN-2] Support Gang Scheduling`。
提交消息将用于预填充拉取请求的信息。
消息中的 JIRA ID 将自动链接拉取请求和 JIRA。
下面的消息可用于解释问题是什么，以及如何解决。

## 创建拉取请求
请使用您的补丁在 github 上创建一个拉取请求。
有关所有的详细信息，请参阅 [开启拉取请求](https://help.github.com/articles/using-pull-requests/)。

对于提交者：您可以使用 GitHub UI 创建新分支、推送更改并创建 PR。
对于贡献者：您已经 fork 了存储库并将您的更改提交到您的 fork。
使用 GitHub UI 使用 `compare across forks` 选项创建 PR。

拉取请求描述必须包含您正在处理的 JIRA 链接。
如果您如上所述设置提交消息，则拉取请求将自动获取它。
如果您没有这样做，您可以修改拉取请求的描述以添加 JIRA ID。
例如，链接到 [YUNIKORN-2](https://issues.apache.org/jira/browse/YUNIKORN-2) 的拉取请求应具有如下描述：
`[YUNIKORN-2] Support Gang Scheduling`

## 提交更改
当更改被批准后，它将被提交到存储库的 `master` 分支。
提交消息必须在第一行包含 JIRA，并且应该包含 `Closes #1`，这样一个提交将自动关闭 PR。
JIRA 不会自动关闭。

## 如果仍有问题？
如果您不确定某些事情，请尝试遵循现有代码库的样式。
看看代码中是否有其他例子做类似的事情。
也可以在 [dev@yunikorn.apache.org](mailto:dev@yunikorn.apache.org) 列表中提问。
