---
id: build
title: 建构和运行
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

YuniKorn始终与容器编排系统一起使用。目前，在我们的存储库中提供了一个Kubernetes适配器[yunikorn-k8shim](https://github.com/apache/yunikorn-k8shim)，您可以利用它来开发YuniKorn调度功能并与Kubernetes集成。本文档描述了如何设置开发环境以及如何进行开发。

## 开发环境设置

首先阅读[环境设置指南](developer_guide/env_setup.md)以设置Docker和Kubernetes开发环境。

## 为Kubernetes构建YuniKorn

先决条件:
- Golang: 在存储库的根目录中检查 `.go_version` 文件以获取Yunikorn所需的版本。最低版本可能会根据发布分支而变化。较早的Go版本可能会导致编译问题。 

您可以从 [yunikorn-k8shim](https://github.com/apache/yunikorn-k8shim) 项目构建用于Kubernetes的调度器。
构建过程将所有组件构建为一个可部署并在Kubernetes上运行的单个可执行文件。

通过拉取 `yunikorn-k8shim` 存储库来启动集成构建过程：
```bash
mkdir $HOME/yunikorn/
cd $HOME/yunikorn/
git clone https://github.com/apache/yunikorn-k8shim.git
```
此时，您已经拥有一个允许您构建YuniKorn调度器的集成映像的环境。

### 关于Go模块和Git版本的说明
Go使用Git来获取模块信息。
如果用于构建的计算机上安装的Git版本较旧，可能无法检索某些模块。
当首次尝试构建时，可能会记录类似于下面的消息：
```text
go: finding modernc.org/mathutil@v1.0.0
go: modernc.org/golex@v1.0.0: git fetch -f origin refs/heads/*:refs/heads/* refs/tags/*:refs/tags/* in <location>: exit status 128:
	error: RPC failed; result=22, HTTP code = 404
	fatal: The remote end hung up unexpectedly
```
要解决此问题，请将Git更新到较新的版本。
已知Git版本1.22或更高版本可以正常工作。

### 构建Docker镜像

可以通过以下命令触发构建Docker镜像。

```
make image
```

带有内置配置的镜像可以直接部署到Kubernetes上。
可以在 [deployments](https://github.com/apache/yunikorn-k8shim/tree/master/deployments/scheduler) 目录下找到一些示例部署。
对于使用ConfigMap的部署，您需要在Kubernetes中设置ConfigMap。
如何使用ConfigMap部署调度器在 [scheduler configuration deployment](developer_guide/deployment.md) 文档中有详细说明。

镜像构建命令首先会构建集成可执行文件，然后创建Docker镜像。
如果您想使用基于发布的预构建镜像，请检查 [Docker Hub repo](https://hub.docker.com/r/apache/yunikorn).

默认的镜像标签不适用于部署到可访问存储库，因为它使用了硬编码的用户并且会使用正确的凭据推送到Docker Hub。
您必须更新`Makefile`中的`TAG`变量以推送到可访问存储库。
在更新镜像标签时，请注意，所提供的部署示例也需要相应更新以反映相同的更改

### 检查 Docker 镜像

之前构建的Docker镜像包含了一些重要的构建信息，您可以使用Docker的inspect命令来检索这些信息。

```
docker inspect apache/yunikorn:scheduler-amd64-latest
```

`amd64`标签取决于您的主机架构（例如，对于`Intel`，它将是`amd64`，对于`Mac M1`，它将是`arm64`）。

这些信息包括每个组件的`git`修订版（最后的提交`SHA`），以帮助您了解此镜像中包含的源代码版本。它们以 `Docker` 镜像的`标签`形式列出，例如：

```
"Labels": {
    "BuildTimeStamp": "2019-07-16T23:08:06+0800",
    "Version": "0.1",
    "yunikorn-core-revision": "dca66c7e5a9e",
    "yunikorn-k8shim-revision": "bed60f720b28",
    "yunikorn-scheduler-interface-revision": "3df392eded1f"
}
```

### 依赖关系

项目中的依赖关系使用[Go模块](https://blog.golang.org/using-go-modules)来管理。
Go模块要求在开发系统上至少安装Go版本1.11。

如果您想在本地修改其中一个项目并使用本地依赖关系进行构建，您需要更改模块文件。
更改依赖关系使用`replace`指令，如 [Update dependencies](#updating-dependencies)中所述。

YuniKorn项目有四个存储库，其中三个存储库在Go级别有依赖关系。
这些依赖关系是Go模块的一部分，指向GitHub存储库。
在开发周期中，可能需要打破对GitHub提交版本的依赖关系。
这需要更改模块文件，以允许加载本地副本或从不同存储库中分叉的副本。  

#### 受影响的存储库
以下存储库之间存在依赖关系：

| repository| depends on |
| --- | --- |
| yunikorn-core | yunikorn-scheduler-interface | 
| yunikorn-k8shim | yunikorn-scheduler-interface, yunikorn-core |
| yunikorn-scheduler-interface | none |
| yunikorn-web | yunikorn-core |

`yunikorn-web` 存储库不直接依赖于其他存储库的Go模块。但是，对 `yunikorn-core` 的webservices进行的任何更改都可能影响Web界面。 

#### 进行本地更改

为了确保本地更改不会破坏构建的其他部分，您应该执行以下操作：
- 进行完整构建 `make`（构建目标取决于存储库）
- 运行完整的单元测试 `make test`

应该在继续之前修复任何测试失败。

#### 更新依赖关系

最简单的方法是在模块文件中使用`replace`指令。`replace`指令允许您使用新的（本地）路径覆盖导入路径。
不需要更改源代码中的任何导入。更改必须在具有依赖关系的存储库的`go.mod`文件中进行。

使用`replace`来使用分叉的依赖关系，例如：
```
replace github.com/apache/yunikorn-core => example.com/some/forked-yunikorn
```

没有必要分叉并创建新的存储库。如果您没有存储库，也可以使用本地检出的副本。
使用`replace`来使用本地目录作为依赖关系：
```
replace github.com/apache/yunikorn-core => /User/example/local/checked-out-yunikorn
```
对于相同的依赖关系，使用相对路径：
```
replace github.com/apache/yunikorn-core => ../checked-out-yunikorn
```
注意：如果`replace`指令使用本地文件系统路径，那么目标路径必须具有该位置的`go.mod`文件。

有关模块的更多详细信息，请参阅模块的维基页面。: [When should I use the 'replace' directive?](https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive).

## 构建Web用户界面（UI）

示例部署引用了[YuniKorn Web用户界面](https://github.com/apache/yunikorn-web)。
`yunikorn-web` 项目对构建有特定要求。请按照[README](https://github.com/apache/yunikorn-web/blob/master/README.md)中的步骤准备开发环境并构建Web用户界面（UI）。然而，调度器在没有Web用户界面的情况下仍然可以完全正常运作。

## 在本地运行集成调度器

在您设置好本地开发环境后，可以在本地的Kubernetes环境中运行集成调度器。
这已在桌面环境中进行了测试，包括Docker Desktop、Minikube和Kind。有关更多详细信息，请参阅[环境设置指南](developer_guide/env_setup.md)。

```
make run
```
它将使用用户配置的配置文件，位于 `$HOME/.kube/config` 中，连接到Kubernetes集群。

要以Kubernetes调度器插件模式运行YuniKorn，执行：

```
make run_plugin
```

只要`$HOME/.kube/config`文件指向远程集群，您也可以使用相同的方法在本地运行调度器并连接到远程Kubernetes集群。

## 通过端到端测试验证外部接口更改

Yunikorn具有外部REST接口，由端到端测试验证。但是，这些测试存在于k8shim存储库中。
每当对外部接口进行更改时，请确保通过运行端到端测试进行验证，或者相应地调整测试用例。

如何在本地运行测试的说明已经在文档中描述。[here](https://github.com/apache/yunikorn-k8shim/blob/master/test/e2e/README.md).