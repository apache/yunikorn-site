---
id: release_procedure
title: 发布流程
---

<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to you under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# YuniKorn 发布流程

[发布存储库](https://github.com/apache/yunikorn-release) 包含了 Apache YuniKorn 创建发行版本/发布（为了区分一些释义以及词语概念的混淆，下文暂在一些描述中以原始名称 release 进行说明）的代码和配置。
我们需要在开始发布流程之前克隆存储库并签出主分支。
即使之前已经发布过该版本，也请确保签出最新的发布内容，因为代码和/或配置可能已更改。

相关说明和工具会遵守ASF的[发布政策](http://www.apache.org/legal/release-policy.html)。

* [发布流程](#发布流程)
* [流程步骤](#流程步骤)
    * [打标签并更新发布版本](#打标签并更新发布版本)
    * [更新修改日志](#更新修改日志)
    * [运行发布工具](#运行发布工具)
        * [创建签名](#创建签名)
        * [创建Checksum](#创建checksum)
    * [上传候选发布文件](#上传候选发布文件)
    * [开始投票流程](#开始投票流程)
    * [发布](#发布)
        * [发布 Docker 镜像](#发布-docker-镜像)
        * [发布 Helm Charts](#发布-helm-charts)
        * [更新网站](#更新网站)
        * [清理](#清理)
        * [创建 GIT 发布](#创建-git-发布)
    * [验证发布](#验证发布)
* [为新发布更新网站](#为新发布更新网站)
  * [更新文档版本](#更新文档版本)
  * [发布公告](#发布公告)
  * [更新下载页面](#更新下载页面)
* [签名您的第一个发布](#签名您的第一个发布)
    * [生成密钥](#生成密钥)
    * [将签名添加到项目KEYS文件中](#将签名添加到项目keys文件中)

## 发布流程
简化的发布流程：
1. 在所有 git 存储库中为目标 release 的版本创建一个发布分支，比如 `branch-0.8`
2. 这个发布版本只能通过修复测试失败问题和错误来趋于稳定
3. 给新版本的更新发布打标签，以作为准备发布的候选版本，例如给 RC1 标记为 `v0.8.0-1` 
4. 更新 CHANGELOG (以后统称为修改日志)
5. 配置[release-configs.json](https://github.com/apache/yunikorn-release/tree/master/tools/release-configs.json)
6. 运行脚本[build-release.py](https://github.com/apache/yunikorn-release/tree/master/tools/build-release.py) 生成源代码压缩包、checksum 和签名。
7. 投票和发布候选版本

## 流程步骤
### 打标签并更新发布版本
分支和标签可以——并且在大多数情况下会——更改 go mod 文件。
分支是发布准备阶段的一部分，通常在发布过程开始之前的某个时间发生。
一个 release 在开始发布流程之前，需要在 git 中给它打上标签。
可以查看 [YUNIKORN-358](https://issues.apache.org/jira/browse/YUNIKORN-358) 或者 [YUNIKORN-1004](https://issues.apache.org/jira/browse/YUNIKORN-1004)，他们可以作为例子进行参考。
release 的候选版号本应该用 release 的版本号和候选构建数进行标记。
例如，用于构建 0.8.0 RC2 的文件应该标记为 `v0.8.0-2`，并在 GitHub 中创建该 release。
一旦 release 完成，应该为 `v0.8.0` 创建 git 的标签和 GitHub 的 releases，指向相同的提交。
在任何情况下，都不应删除或移动现有的标签。这将打破下游用户的 golang 依赖解析。

标签处理是一个多步骤的过程，所有操作都需在将要发布的分支上完成，例如 `branch-0.8` ：
1. 给 web 和 scheduler-interface 项目打上发布标签。
2. 使用 `go get github.com/apache/yunikorn-scheduler-interface` 更新 core 项目中的 `go.mod` 文件，然后添加标签并提交更改。
3. 使用 `go get github.com/apache/yunikorn-scheduler-interface` 和 `go get github.com/apache/yunikorn-core` 更新 shim 项目中的 `go.mod` 文件。之后再添加标签并提交更改。
4. 在yunikorn的发布存储库中新建一个分支，然后在[Chart.yaml](https://github.com/apache/yunikorn-release/tree/master/helm-charts/yunikorn/Chart.yaml) 中设置正确的chart版本并创建标签。

### 更新修改日志
我们为每次 release 内的发布文件里添加了一个[修改日志](https://github.com/apache/yunikorn-release/tree/master/release-top-level-artifacts/CHANGELOG)。
修改日志应包含版本中修复的 jiras 列表。
我们可以按照以下步骤生成列表：
- 转到 [jira发布页面](https://issues.apache.org/jira/projects/YUNIKORN?selectedItem=com.atlassian.jira.jira-projects-plugin%3Arelease-page&status=released-unreleased)
- 点击即将发布的版本，例如 `0.8.0`
- 点击页面顶部的 `Release Notes`（发布说明） 链接
- 单击 `Configure Release Notes`（配置发布说明）按钮
- 选择样式 `Text` 并点击 `create`
- 滚动到页面底部并复制文本区域的内容并更新 ../release-top-level-artifacts 目录中的修改日志文件。

### 运行发布工具
我们已经编写了一个工具来处理大部分的发布任务。
该工具需要在运行前更新一个简单的 [json](https://github.com/apache/yunikorn-release/tree/master/tools/release-configs.json) 输入文件。
此配置指向当前的发布标签。它只会更新每个存储库的标签。

该工具在标准的Python3之外有一项要求：[GitPython](https://gitpython.readthedocs.io/en/stable/intro.html)。
请确保您已通过运行 `pip install gitpython` 来安装它。

运行工具:
```shell script
python3 build-release.py
```
如果您想使用 GPG 密钥自动签署版本，请使用以下命令运行该工具：
```shell script
python3 build-release.py --sign <邮件地址>
```

#### 创建签名
如果您有带有 _pinentry_ 程序设置的 GPG，您可以使用发布工具自动签署发布。
在 MacOSX 上，如果您使用钥匙串作为秘钥，这将自动设置。
有关更多的详情，请查看 [GnuPG 工具 wiki](https://wiki.archlinux.org/index.php/GnuPG)，特别是 [pinentry](https://wiki.archlinux.org/index.php/GnuPG#pinentry) 章节。

使用 `--sign <邮件地址>` 选项来运行发布工具以自动签署发布。
 
为工具生成的文件手动创建签名：
```shell script
gpg --local-user <邮件地址> --armor --output apache-yunikorn-0.8.0-src.tar.gz.asc --detach-sig apache-yunikorn-0.8.0-src.tar.gz
```
这将在文件中创建签名：`apache-yunikorn-0.8.0-src.tar.gz.asc`  
使用以下命令验证签名是否正确：
```shell script
gpg --verify apache-yunikorn-0.8.0-src.tar.gz.asc apache-yunikorn-0.8.0-src.tar.gz
```

#### 创建Checksum
这一步包含在源tar包生成后的发布内容中，如果使用发布工具可以跳过这一步。
```shell script
shasum -a 512 apache-yunikorn-0.8.0-src.tar.gz > apache-yunikorn-0.8.0-src.tar.gz.sha512
```
这将在文件中创建 checksum : `apache-yunikorn-0.8.0-src.tar.gz.sha512`  
使用以下命令验证 checksum 是否正确：
```shell script
shasum -a 512 -c apache-yunikorn-0.8.0-src.tar.gz.sha512 
```

### 上传候选发布文件
发布的文件由三个部分组成：
- 源压缩包
- 签名文件
- checksum文件  

三个文件都需要上传到：`https://dist.apache.org/repos/dist/dev/yunikorn/`

根据版本创建发布目录，例如 `0.8.0`，将这三个文件添加到目录中，随后提交更改。

如果您还没有这样做，请确保 [添加您的签名](#将签名添加到项目keys文件中) 到 KEYS 文件。
不要从保存在此处的文件中删除任何密钥，这是为了方便验证旧的版本。

注意：您需要安装 subversion 才能访问此 repo（使用您的 apache ID）。为方便起见，您可以使用任何 SVN 客户端，例如 svnX。

### 开始投票流程
根据 Apache [发布批准文档](http://www.apache.org/legal/release-policy.html#release-approval)
投票流程必须在 `dev@yunikorn.apache.org` 上创建，并运行至少72小时。
需要至少三个 +1 票，而且 +1 票要多于 -1 票。

### 发布
一旦投票通过，将发布的文件从暂存区移动到发布位置 `https://dist.apache.org/repos/dist/release/yunikorn/`。  
一旦移动到这个空间，内容将自动同步到 `https://downloads.apache.org/yunikorn/`，它必须作为所有发布文件的最终位置。  

可以阅读 [分布式服务](https://apache.org/history/mirror-history.html) 来了解更多有关源代码的内容。


这将会在发布区暂时为我们提供两个版本。
这是允许启动镜像同步过程并允许更新下载页面的必要条件。
在 [清理](#清理) 章节中会说明如何在更新网站后对旧的版本进行清理。

#### 发布 Docker 镜像
我们应该使用标准构建过程来构建镜像。
在 `web` 和 `k8shim` 存储库中运行 `make image` 以生成所需的三个镜像（web、调度器和准入控制器）：
```shell script
VERSION=0.8.0; make image
```

如果您有权访问 Apache docker hub YuniKorn 容器，Make 也可用于构建和推送映像。
使用发布版本号作为标签将最新的 docker 镜像推送到 apache docker hub。
需要确保 docker 映像是基于特定的 SHA 构建的。
```shell script
VERSION=0.8.0; DOCKER_USERNAME=<用户名>; DOCKER_PASSWORD=<密码>; make push 
```
最后向 `dev@yunikorn.apache.org` 邮件列表发布一个公告邮件。

#### 发布 Helm Charts
此步骤是发布工具的一部分，如果使用了发布工具则可以跳过这个打包步骤。

如果发布工具 **未** 使用 `Chart.yaml`， 那么 `values.yaml` 必须手动更新。
另一种选择是像发布工具一样针对生成的源目录运行 helm 脚本：
```shell script
helm package --sign --key ${您的key名称} --keyring ${path/to/keyring.secret} staging/<发布文件夹>/helm-charts/yunikorn --destination staging/ 
```
签署 helm 包需要一个旧的 PGP keyring。 PGP v2 keyring 必须转换为旧的格式。
想了解更多的信息，请查看 [Helm 文档](https://helm.sh/docs/topics/provenance/)。
Helm charts 应在发布时签名。
与源代码 tar 包签名相反，对 helm 图表进行签名需要手动输入密钥密码。

helm 打包会生成两个文件：
- helm 打包文件：例如 `yunikorn-0.8.0.tgz`
- 出处或签名文件：例如 `yunikorn-0.8.0.tgz.prov`
这两个文件都应附加到发布存储库的 [创建GIT发布](#创建GIT发布) 中。

最后一步是使用新的发布版本更新 `gh-pages` 分支中的 [index.yaml](https://github.com/apache/yunikorn-release/blob/gh-pages/index.yaml) 文件。
index.yaml 文件中提到的 `摘要` 是由工具（未签名的包）打印或存储在出处文件中的摘要。
我们可以使用以下方法手动生成：
```shell script
shasum -a 256 yunikorn-0.8.0.tgz
```

注意：不要使用 `helm repo index` 命令来更新 `index.yaml` 文件。该命令不能很好地处理存储在 `index.yaml` 文件中的增强信息。
请手动更新文件。

#### 更新网站
- 根据 `docs` 目录中的最新内容，在 YuniKorn 网站上创建一个新的文档版本。
  请参考[如下步骤](#更新文档版本)来了解如何创建新的文档版本。
- 从网站上的下载页面下创建发布公告的引用链接。
  发布公告是一个基于版本号的 markdown 文件: `0.8.0.md`。
  如何创建[发布公告](#发布公告)的章节解释了相关的内容以及添加文件的位置。
- 按照[此步骤](#更新下载页面)更新网站的[下载页面](/community/download)。

这个网站可以，而且很可能会包含一个公告栏。
这个公告栏是源代码树的根目录中 `docusaurus.config.js` 文件的一部分。
我们需要更新公告栏到正确的 release。

#### 清理
注意：此步骤应在网站更新后执行，因为下载链接会进行更改。

发布区域中应该只有一个发布信息，即最新的发布。
已在发布区域中的任何发布信息都将自动复制到存档中。
旧的发布信息应直接从存档下载，而不是从发布区域下载。

发布信息需要在两个位置进行清理：
* 通过删除旧的候选发布目录，从 _dev_ 区域中删除新发布的版本。
  请参阅 [候选发布位置](#上传候选发布文件) 来查看相关位置
* 通过删除旧发布目录从 _发布_ 区域中删除非当前的发布信息。
  请参见 [发布位置](#发布) 来查看相关位置

#### 创建 GIT 发布
在 GIT 存储库中，通过添加的 git 标签来创建发布，并最终完成发布流程。
对所有五个存储库（core、k8shim、web、scheduler-interface 和 release）都重复这些步骤：
- 转到 `tags` 页面
- 单击要发布的页面右侧的 `...` ，从下拉列表中选择 `Create Release`
- 更新名称和说明
- 添加打包好的 helm chart 文件（仅限 yunikorn-release 存储库）
- 单击 `Publish Release` 以完成步骤

### 验证发布
在整个流程完成后，我们需要验证网站上的文档。
检查发布的文件是否可以从下载页面进行下载。

## 为新发布更新网站
发布新版本需要您在本地安装 yarn。

先决条件：
* 该 release 必须已从发布流程获得批准。
* 源存档文件和签名必须已上传到 Apache 对应的位置。
* docker 公共镜像必须已推送到 Apache docker hub。

打开一个PR，并将下面的所有更改提交到 **master** 分支，一旦自动构建完成，新的文档就会出现在网站上。

### 更新文档版本
文档的版本控制使用简单的 **主要版本.次要版本.补丁版本** 这种 semver（语义化的版本号）形式定义发布版本号。
这意味着没有字母，候选发布标签或类似的东西:
```shell script
yarn release 0.8.0
```
该命令将对当前 `docs` 目录中的所有文档打快照，并将所有文件复制到另一个新目录 `versioned_docs` 下，例如 `versioned_docs/version-0.8.0` 。
类似的复制过程会在 `versioned_sidebars` 下生成对应文档版本的侧边栏。

这个过程还会更新 `version.json` 文件，并将添加一行新的发布版本。

### 发布公告
发布公告是一个添加到 `src/pages/release-announce` 目录下的静态 Markdown 文件。
文件名与发布的 semver 简化版本号相同:
``` 
src/pages/release-announce/0.8.0.md
```
该页面采用 Markdown 格式，应遵循现有页面的示例：
* id和标题定义（docusaurus 语法）
* Apache license
* 如下的标题
    * 发布的概述（2级标题）
    * 重点内容（2级标题）  
      在第3级标题说明各个重点
    * 社区更新（2级标题）

### 更新下载页面
下载页面要包含指定到 Apache 源代码下载、签名等的链接。
页面上的表格有一个特定的布局，在完成 docusaurus 构建后，该布局会被正确地呈现。
请不要更改表格中的发布条目的布局。

第一步是将 `最新版本` 行更新为正确的版本。
第二步是更新表：从表中删除最后一行。
复制表格的第一行并更改链接和详细信息以反映新的发布详情。
必须更新所有的链接：
* 3个用于下载的内容（源码tar、checksum 和签名）
* 3个用于docker的镜像（scheduler, admission-controller 和 web）
* 1个发布公告，使用 `/release-announce/0.8.0` 形式的链接

对于第二行，更新源码tar、checksum 和签名的下载链接。

发布的链接必须遵循以下规则：
* 页面上的第一个下载链接 **必须** 只能使用源码tar包的镜像解析链接。
* 签名和 checksum 链接 **必须** 指向发布地址。
* 非当前版本 **必须** 使用存档链接：`https://archive.apache.org/dist/yunikorn/` 用于 tar 包、签名和checksum。

表中应保留有限的三或四个版本以供直接访问。
表中未提及的旧版本仍可通过页面底部的存档链接访问，无需参考。

## 签名您的第一个发布
如果您之前没有对任何版本进行签名，请阅读文档以 [生成签名密钥](https://infra.apache.org/openpgp.html#generate-key)
请按照以下步骤添加可用于签名的密钥。

### 生成密钥
生成新的 PGP 密钥（如果您已有 Apache 链接密钥，请跳过此步骤）：
```shell script
gpg --gen-key
```
使用您的全名和 Apache 邮件地址填写请求的信息。

将导出的密钥上传到像 `https://pgp.mit.edu/` 这样的公钥服务器。
```shell script
gpg --export --armor <邮件地址>
```

将 fingerprint 上传到 apache 服务器：`https://id.apache.org/`。
```shell script
gpg --fingerprint <邮件地址>
```

### 将签名添加到项目KEYS文件中
只有当这是使用特定密钥签名的第一个发布版本时才需要。
可以在此文档中找到更多详细信息：[签署版本](https://infra.apache.org/release-signing.html#keys-policy)
```shell script
(gpg --list-sigs <邮件地址> && gpg --armor --export <邮件地址>) >> MY_KEY
```
将生成文件的内容添加到 `https://dist.apache.org/repos/dist/release/yunikorn/KEYS` 现有 KEYS 列表中。  
切勿从此列表中删除密钥！

注意：您需要安装 subversion 才能访问此 repo（使用您的 apache ID）。为方便起见，您可以使用任何 SVN 客户端，例如 svnX。
