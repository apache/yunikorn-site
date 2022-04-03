---
id: release_procedure
title: 发布程序
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

# YuniKorn 发布程序

[发布存储库](https://github.com/apache/yunikorn-release) 包含了 Apache YuniKorn 创建 release（下文统称为发布）的代码和配置。
我们需要在开始发布过程之前克隆存储库并签出主分支。
即使之前已经发布过该版本，也请确保签出最新的发布内容，因为代码和/或配置可能已更改。

相关说明和工具会遵守ASF的[发布政策](http://www.apache.org/legal/release-policy.html)。

* [创建一个发布](#创建一个发布)
    * [打标签并更新发布版本](#打标签并更新发布版本)
    * [更新修改日志](#更新修改日志)
    * [运行发布工具](#运行发布工具)
        * [创建签名](#创建签名)
        * [创建Checksum](#创建checksum)
    * [上传候选发布artifact](#上传候选发布artifact)
    * [开始投票流程](#开始投票流程)
    * [发布](#发布)
        * [发布Docker镜像](#发布docker镜像)
        * [发布 Helm Charts](#发布-helm-charts)
        * [更新网站](#更新网站)
        * [清理](#清理)
        * [创建GIT发布](#创建git发布)
    * [验证发布](#验证发布)
* [签名您的第一个发布](#签名您的第一个发布)
    * [生成密钥](#生成密钥)
    * [将签名添加到项目KEYS文件中](#将签名添加到项目keys文件中)

## 创建一个发布
简化的发布程序：
1. 在所有git存储库中为目标发布版本创建一个发布分支，比如 `branch-0.8`
2. 这个发布版本只能通过修复测试失败问题和错误来趋于稳定
3. 给新版本的更新发布打标签，以作为准备发布的候选版本，例如 `v0.8.0`
4. 更新 CHANGELOG (以后统称为修改日志)
5. 配置[release-configs.json](https://github.com/apache/yunikorn-release/tree/master/tools/release-configs.json)
6. 运行脚本[build-release.py](https://github.com/apache/yunikorn-release/tree/master/tools/build-release.py) 生成源代码压缩包、checksum 和签名。
7. 投票和发布候选版本

### 打标签并更新发布版本
分支和标签需要——并且在大多数情况下——更改 go mod 文件。
分支是发布准备的一部分，通常在发布过程开始之前的某个时间发生。
在开始发布过程之前，需要在git中给发布内容打上标签。
可以查看 [YUNIKORN-358](https://issues.apache.org/jira/browse/YUNIKORN-358)，它就是一个例子。
候选发布和最终发布使用相同的标签，如果生成新的候选发布，该标签会被移动。

打标签是一个多步骤的过程，所有操作都需在将要发布的分支上完成，例如 `branch-0.8` ：
1. 给 web 和 scheduler-interface 项目打上发布标签。
2. 使用 `go get github.com/apache/yunikorn-scheduler-interface` 更新 core 项目中的 `go.mod` 文件，然后添加标签并提交更改。
3. 使用 `go get github.com/apache/yunikorn-scheduler-interface` 和 `go get github.com/apache/yunikorn-core` 更新 shim 项目中的 `go.mod` 文件。之后再添加标签并提交更改。
4. 在yunikorn发布的存储库中新建一个分支，在[Chart.yaml](https://github.com/apache/yunikorn-release/tree/master/helm-charts/yunikorn/Chart.yaml) 中设置正确的chart版本，然后创建标签。

### 更新修改日志
我们为每个发行版中的artifact添加了一个[修改日志](https://github.com/apache/yunikorn-release/tree/master/release-top-level-artifacts/CHANGELOG)。
修改日志应包含版本中修复的 jiras 列表。
我们可以按照以下步骤生成列表：
- 转到 [jira发布页面](https://issues.apache.org/jira/projects/YUNIKORN?selectedItem=com.atlassian.jira.jira-projects-plugin%3Arelease-page&status=released-unreleased)
- 点击即将发布的版本，例如 `0.8`
- 点击页面顶部的 `Release Notes`（发布说明） 链接
- 单击 `Configure Release Notes`（配置发布说明）按钮
- 选择样式 `Text` 并点击 `create`
- 滚动到页面底部并复制文本区域的内容并更新 ../release-top-level-artifacts 目录中的修改日志文件。

### 运行发布工具
我们已经编写了一个工具来处理大部分的发布任务。
该工具需要在运行前更新一个简单的 [json](https://github.com/apache/yunikorn-release/tree/master/tools/release-configs.json) 输入文件。
此配置指向当前的发布标签。它只会更新每个存储库的标签。

该工具在标准的Python3之外有一项要求：[GitPython](https://gitpython.readthedocs.io/en/stable/intro.html)
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

### 上传候选发布artifact
发布的artifact由三个部分组成：
- 源压缩包
- 签名文件
- checksum文件  

三个artifact需要上传到：`https://dist.apache.org/repos/dist/dev/yunikorn/`

根据版本创建发布目录，例如 `0.8.0`，将这三个文件添加到目录中，随后提交更改。

如果您还没有这样做，请确保 [添加您的签名](#将签名添加到项目keys文件中) 到 KEYS 文件。
不要从保存在此处的文件中删除任何密钥，这是为了方便验证旧的版本。

注意：您需要安装 subversion 才能访问此 repo（使用您的 apache ID）。为方便起见，您可以使用任何 SVN 客户端，例如 svnX。

### 开始投票流程
根据 Apache [发布批准文档](http://www.apache.org/legal/release-policy.html#release-approval)，步骤如下：
- 在 `dev@yunikorn.apache.org` 上启动投票流程。（72 小时）
需要至少三个 +1 票，而且 +1 票要多于 -1 票。

### 发布
一旦投票通过，将发布的artifact内容从暂存区移动到发布位置 `https://dist.apache.org/repos/dist/release/yunikorn/`。  
一旦移动到这个空间，内容将自动同步到 `https://downloads.apache.org/yunikorn/`，它必须作为发布文件的最终位置。  
可以阅读 [主服务器上文件位置](https://infra.apache.org/mirrors#location) 来了解更多内容。

这将会在发布区暂时为我们提供两个版本。
这是允许启动镜像同步过程并允许更新下载页面的必要条件。
在 [清理](#清理) 章节中会说明如何在更新网站后对旧的版本进行清理。

#### 发布Docker镜像
我们应该使用标准构建过程来构建映像。
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

如果发布工具 **未** 使用 `Chart.yaml` 那么 `values.yaml` 必须手动更新。
另一种选择是像工具一样针对生成的源目录运行 helm 脚本：
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
- 根据 [文档](https://github.com/apache/yunikorn-site/tree/master/docs) 目录中的最新内容在 YuniKorn 网站上创建新的文档版本。 请参阅这里的 [指南](https://github.com/apache/yunikorn-site/tree/master#release-a-new-version) 以创建新的文档。
- 创建要从网站下载页面引用的发布公告。发布公告是一个基于版本的markdown文件：`0.8.0.md`。该文件存储为网站上[静态页面](https://github.com/apache/yunikorn-site/tree/master/src/pages/release-announce)中的一部分。
- 更新网站的 [下载页面](https://github.com/apache/yunikorn-site/tree/master/src/pages/community/download.md)。

发布公告链接到下载页面上的发布详细信息内。

发布的链接必须遵循以下规则：
* 页面上的第一个下载链接 **必须** 只能使用源 tar 包的镜像解析链接。
* 签名和 checksum 链接 **必须** 指向发布地址。
* 非当前版本 **必须** 使用存档链接：`https://archive.apache.org/dist/yunikorn/` 用于 tar 包、签名和checksum。

表中应保留有限的三或四个版本以供直接访问。
表中未提及的旧版本仍可通过页面底部的存档链接访问，无需参考。

#### 清理
注意：此步骤应在网站更新后执行，因为下载链接会进行更改。

发布区域中应该只有一个发布信息，即最新的发布。
已在发布区域中的任何发布信息都将自动复制到存档中。
旧的发布信息应直接从存档下载，而不是从发布区域下载。

发布信息需要在两个位置进行清理：
* 通过删除旧的候选发布目录，从 _dev_ 区域中删除新发布的版本。
  请参阅 [发布候选位置](#上传候选发布artifact) 来查看相关位置
* 通过删除旧发布目录从 _发布_ 区域中删除非当前的发布信息。
  请参见 [发布位置](#发布) 来查看相关位置

#### 创建GIT发布
在 GIT 存储库中，通过添加的 git 标签来创建发布，并最终完成发布流程。
对所有五个存储库（core、k8shim、web、scheduler-interface 和 release）都重复这些步骤：
- 转到 `tags` 页面
- 单击要发布的页面右侧的 `...` ，从下拉列表中选择 `Create Release`
- 更新名称和说明
- 添加打包好的 helm chart 文件（仅限 yunikorn-release 存储库）
- 单击 `Publish Release` 以完成步骤

### 验证发布
完成整个过程后，验证网站上的文档以及可下载的发布artifact。
镜像链接最长可能需要 24 小时才能更新。

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
