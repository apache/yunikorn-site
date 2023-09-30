---
id: dependencies
title: Go 模块更新
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

## 什么时候更新
如果调度器接口发生更改，则必须更新`master`分支中的引用。
即使调度器接口没有改变，也可能需要更新shim的引用中,对core的依赖关系。
可以添加依赖于消息的更改字段内容而不是消息的字段布局的新功能。在这种情况下，只需要更新shim依赖项。

## 为什么是伪版本
在`master`分支中，我们**必须**对我们使用的所有 YuniKorn 存储库引用使用伪版本。
由于该分支正在积极开发中并且尚未发布，因此我们没有真正的版本标签可供引用。
但是，我们仍然需要能够指向依赖项的正确提交。
Go 允许在这些特定情况下使用[伪版本](https://go.dev/ref/mod#pseudo-versions)。
我们在 Kubernetes shim 中使用的伪版本的示例：
```
module github.com/apache/yunikorn-k8shim

go 1.16

require (
	github.com/apache/yunikorn-core v0.0.0-20220325135453-73d55282f052
	github.com/apache/yunikorn-scheduler-interface v0.0.0-20220325134135-4a644b388bc4
	...
)
```
发布分支**不得**使用伪版本。
在创建版本的过程中，将创建[标签](/community/release_procedure#tag-and-update-release-for-version)。
这些标签将用作该版本的 go.mod 文件中的参考。    

## 伪版本的执行
在拉取请求中，检查 `yunikorn-core` 和 `yunikorn-k8shim` 存储库强制执行版本格式。
如果`master`分支中 `yunikorn-core` 或 `yunikorn-scheduler-interface` 存储库的版本引用不是伪版本，则会触发构建失败。

该检查强制版本引用的开头为`v.0.0.0-`


根据上面的[为什么是伪版本](#why-a-pseudo-version)解释，伪版本不会在发布分支中强制执行。

## 更新core依赖
在更新core依赖项之前，必须确保调度器接口更改已完成。
1. 在调度器界面中进行更改。
2. 将更改提交到 GitHub 上的 master 分支并拉取最新的 master 分支提交。
3. 为调度器接口[生成新的伪版本](#generate-a-pseudo-version)。

更新core依赖

4. 更新依赖存储库的go.mod文件：core存储库
    * 打开go.mod文件
    * 复制生成的伪版本引用
    * 将调度器接口版本引用替换为**步骤 3**中生成的版本引用
    * 保存go.mod文件
5. 运行`make test`以确保更改有效。构建将拉取新的依赖项，并且将使用调度器接口中的更改。
6. 将更改提交到 GitHub 上的 master 分支并拉取最新的 master 分支提交。

## 更新shim依赖项
在更新 shim 依赖项之前，您必须确保core依赖项已更新并提交。
在某些情况下，调度器接口的引用没有改变。
这不是问题，要么跳过更新步骤，要么按照正常执行更新步骤，从而在提交过程中不会发生任何更改。

7. 为core[生成新的伪版本](#generate-a-pseudo-version)
8. 更新依赖存储库的go.mod文件：k8shim存储库
    * 打开go.mod文件
    * 复制生成的调度器接口的伪版本引用
    * 将调度器接口版本引用替换为**步骤 3**中生成的版本引用。
    * 复制生成的core伪版本引用
    * 将core版本引用替换为**步骤 7**中生成的版本引用。
    * 保存go.mod文件
9. 运行`make test`以确保更改有效。构建将拉下新的依赖项，并将使用core和调度器接口中的更改。
10. 将更改提交到 GitHub 上的 master 分支

:::note
如果同时在调度器接口和/或core中处理多个 PR，则不同的 PR 可能已经应用了更新。
这完全取决于提交顺序。
因此，执行**步骤 5**和**步骤 8**以确保不存在回归。
:::
## 生成伪版本

go.mod 文件中使用的伪引用基于提交hash和时间戳。
使用以下步骤生成一个很简单：

1. 更改为需要生成新伪版本的存储库。
2. 更新master分支的本地检查代码以获取最新提交
```
git pull; git status
```

状态应显示为最新的克隆位置的`origin`。

3. 运行以下命令获取伪版本：
```
TZ=UTC git --no-pager show --quiet --abbrev=12 --date='format-local:%Y%m%d%H%M%S' --format='v0.0.0-%cd-%h'
```
4. 该命令将打印如下一行：
```
v0.0.0-20220318052402-b3dfd0d2adaa
```
这是可以在 go.mod 文件中使用的伪版本。

:::note
伪版本必须基于 vcs 系统中的提交，即来自 Github 的提交。
无法使用本地提交或尚未合并到 PR 中的提交。
:::
