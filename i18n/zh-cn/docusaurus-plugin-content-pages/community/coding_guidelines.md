---
id: coding_guidelines
title: 编码指南
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

# 编码指南

## 基础指南
GO 作为一种语言为代码提供了内置的格式化程序：`gofmt`。
该项目使用在 `gofmt` 中实现的预定义格式。
这意味着例如：tabs而不是空格等。
阅读 [Effective GO](https://golang.org/doc/effective_go.html) 页面了解更多详情。
在创建拉取请求之前，请确保至少使用 `gofmt` 格式化代码。

除了 Effective GO 指南之外，请遵循 [CodeReviewComments](https://github.com/golang/go/wiki/CodeReviewComments) wiki 页面中的建议。
wiki 提供了一个很好的代码审查注释库。
大多数注释将在下面描述的自动检查中进行检查。

使用 IDE（如 GoLand 或 Visual Studio Code）时，请使用内置的选项。
大多数 IDE 将提供大量检查或格式化选项列表，以帮助格式化和指出代码的问题。
有关 GoLand IDE 的基本设置，请参阅 [IDE 设置](#goland-ide-setup)。

## 自动检查
并非所有代码都会使用 IDE 进行编写。
即使在贡献者之间，所有安装的设置也可能不同。
为了帮助保持代码格式一致，[lint](https://en.wikipedia.org/wiki/Lint_(software)) 工具是代码批准的一部分。

Go 有大量可用的 lint 工具。
大多数 lint 工具只检查一件特定的事情。
一些工具将聚合一些 linter，并提供所有发现的问题的概述。
对于该项目，我们选择了 [golangci-lint](https://github.com/golangci/golangci-lint) 工具。
该工具可以在本地运行，并将集成到 GitHub PR 流程中。

### 本地安装和运行
我们可以按照项目提供的 [安装说明](https://golangci-lint.run/usage/install/#local-installation) 进行运行。
不过根据您的开发系统，说明可能会略有不同。

安装工具后，您可以使用标准命令行运行它：
```shell script
golangci-lint run
```

这些项目仍然会产生许多警告。
高影响警告已通过评论修复或忽略，请参阅 [误报](#false-positives)。

如果您一直在研究新功能或修复错误，您只想检查已更改的文件。
您可以使用选项 `--new` 或 `--new-from-rev` 选项运行该工具。
`--new` 选项只会检查未提交的文件。
`--new-from-rev` 选项将根据特定提交的修订检查更改。

```shell script
# 对于未提交的更改
golangci-lint run --new
# 针对修订提交的更改
golangci-lint run --new-from-rev=origin/master
```

make命令追加 `lint`:
```shell script
make lint
```

`make` 使用 linter 集成检查可执行文件的两个位置：
* `$(go env GOPATH)/bin/`
* `./bin/`
  
对于开发人员和 CI 安装，标准的安装位置略有不同。
通过检查这两个位置，我们可以在本地和自动构建期间运行。
 
make 集成使用 `--new-from-rev` 命令行选项。
要检查的修改被确定为运行的一部分，以允许它在我们的 CI 构建期间在不同的分支和拉取请求上运行。
lint 检查是项目的标准 CI 构建运行的一部分。

有关如何运行该工具的更多选项和信息，请参阅 golangci-lint 产品文档。

### 配置
为使用它们的两个项目提供了预定义的配置：
* [YuniKorn k8shim](https://github.com/apache/incubator-yunikorn-k8shim), 配置文件 [golangci.yml](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/.golangci.yml).
* [YuniKorn core](https://github.com/apache/incubator-yunikorn-core), 配置文件 [golangci.yml](https://github.com/apache/incubator-yunikorn-core/blob/master/.golangci.yml). 

Web 界面是一个 javascript 项目，调度接口只生成了 Go 代码，因此不使用它。

### 拉取请求中的集成
计划是将 `golangci-lint` 检查集成到 GitHub PR 流程中。

## 误报
工具从来都不是 100% 正确的，这个也不是。
某些问题因太难纠正或不够重要而无法修复。

该工具允许向代码添加注释以忽略该问题。
这些注释应该谨慎使用，因为它们可能会隐藏问题。
如果使用它们，则应附有注明以解释使用它们的原因。
```go
	var s1 = "ignored by all linters" //nolint
	var s2 = "ignored by the linter unused" //nolint:unused
``` 
我们不鼓励使用没有特定 linter 的 `nolint` 注释。

## GoLand IDE 设置
GoLand 默认开启了许多检查。
这些默认值已经提供了很好的覆盖率，并将 linter 发现的许多问题标记为问题。
要进一步扩大覆盖范围并帮助标记问题，请主动检查以下设置并将其更改为根据屏幕截图的设置。

### preferences 偏好
打开 preferences 窗格并转到：Editor -> Code Style -> Go
需要配置三个选项卡，前两个对于遵守 `gofmt` 和 `goimports` 的基本规则至关重要：

| ||
| -------- | ---------- |
| Tabs |![tabs](/img/goland_ide_pref_tabs.png)|
| Imports |![imports](/img/goland_ide_pref_imports.png)|
| Other |![other](/img/goland_ide_pref_other.png)|

上面配置的导入在使用时应该在一个文件中创建 3 组导入：
1. 标准库导入
2. 第三方导入
3. YuniKorn 内部导入

在文件中，它将为您提供如下所示的导入：
```go
import (
  // 标准库导入

  // 第三方

  // YuniKorn 项目导入
)
```

### 检查
除开有助于突出显示阴影变量的检查，我们才可以使用默认检查。
阴影变量可能导致难以跟踪和掩盖代码中的错误，应尽可能防止。

![检查](/img/goland_ide_pref_inspections.png)
