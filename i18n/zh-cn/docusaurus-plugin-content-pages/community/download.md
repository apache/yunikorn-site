---
id: download
title: Apache YuniKorn (Incubating)
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

# Apache YuniKorn

Apache YuniKorn 作为源代码压缩包已经发布。
最新版本的下载通过镜像站点进行分发。
旧版本可以从 Apache 存档站点进行下载。
我们可以使用 GPG 或 SHA-512 检查所有发布文件是否被篡改。

为了方便大家，我们发布了预构建的docker镜像。

Apache YuniKorn 的最新版本是 v1.3.0。

| 版本   | 发布日期    | 源代码下载                                                                                                                                                                                                                                                                                     | Docker 镜像                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 发布说明                        |
| ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| v1.3.0 | 20203-06-09 | [下载](https://downloads.apache.org/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz.sha512) & [签名](https://archive.apache.org/dist/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz.asc)         | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.3.0/images/sha256-cbf05725ca0fa89bda70547c6c00ac955d3aa2456a278b195973c4d7eddd516f?context=explore)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.3.0/images/sha256-6f3d18867eb39e6c60279c3ee7f2ef65ba243a1451deb0cca9ccac941a785b2f?context=explore) <br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.3.0/images/sha256-2d585beca081080671a56664492951b17e9f9463e7d30fd759ce65a4052c32e9?context=explore) <br/> [scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.3.0/images/sha256-67795e0071df286e3a8b089ed3613f516accddd319d97eeb4029412e7dce04db?context=explore) | [公告](/release-announce/1.3.0) |
| v1.2.0 | 2023-02-02  | [下载](https://archive.apache.org/dist/yunikorn/1.2.0/apache-yunikorn-1.2.0-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/yunikorn/1.2.0/apache-yunikorn-1.2.0-src.tar.gz.sha512) & [签名](https://archive.apache.org/dist/yunikorn/1.2.0/apache-yunikorn-1.2.0-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.2.0/images/sha256-c3b1a7b2cfec3f3560415519278cc4d94748f0f60ee80dfaf23fcc22dbb8b8e5) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.2.0/images/sha256-7f18fcd080640974ae586d30eda009daf0ad93fa22ada66b0a337ac3fb46b7ac) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-1.2.0/images/sha256-706a2895461623f20d4102f0132d66dade9c15edf5cad40065506a4d70c32576) <br />[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.2.0/images/sha256-d946495946b89d03f7a8f786702d4b350a93f74d52e50bebb6b2bbdcb8e911a4?context=explore)                                              | [公告](/release-announce/1.2.0) |
| v1.1.0 | 2022-09-08  | [下载](https://archive.apache.org/dist/yunikorn/1.1.0/apache-yunikorn-1.1.0-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/yunikorn/1.1.0/apache-yunikorn-1.1.0-src.tar.gz.sha512) & [签名](https://archive.apache.org/dist/yunikorn/1.1.0/apache-yunikorn-1.1.0-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.1.0/images/sha256-5a45cede355b4c1d0016ba81b317e12a7608ac5de4779892f8c7fa53adf5d739) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.1.0/images/sha256-4389c126f252671e55bdac16e1bcfe7f83ef4ea7c3e83d333c81508920da825c) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-1.1.0/images/sha256-3f3075161283d8a78f4849f8163104d7db3e7bd3a467163729fb401421ac670f) <br />[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.1.0/images/sha256-b182ec4d08c590cd179b811fe68dffa2d58dccc9b8568f108ad35af0ed62a4c1?context=explore)                                              | [公告](/release-announce/1.1.0) |

## 验证签名

使用 GPG 验证 Apache YuniKorn 版本：

- 从镜像站点下载发行版 apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz。
- 从 Apache 下载签名文件 apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz.asc。
- 下载 Apache YuniKorn [KEYS](https://downloads.apache.org/incubator/yunikorn/KEYS) 文件。
- `gpg --import KEYS`
- `gpg --verify apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz.asc`

注意：在 MacOS-X 上，GNU gpg 实用程序在导入时不会从文件中读取。
导入命令应该是 `gpg --import < KEYS`

## 验证 checksum

要使用 SHA-512 checksum 校验和验证 Apache YuniKorn 版本的完整性：

- 从镜像站点下载发行版 apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz。
- 从 Apache 下载校验和 apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz.sha512。
- 验证 checksum
  - 在 MacOS-X: `shasum -c apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz.sha512`
  - 在 Linux: `sha512sum -c apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz.sha512`

## 验证发布

本发布是一个源代码版本，您必须先构建后才能使用。
您需要解压档案文件并按照 `README.md` 文件中的说明构建镜像。
发布的档案文件中提供了使用本地构建的镜像创建小型集群的脚本和配置。

您可以运行如下脚本以获取更多说明并列出验证发布内容所需的工具：
```shell
./validate_cluster.sh
```
创建的 `kind` 集群是一个小型但功能齐全的 Kubernetes 集群，这里面部署了 Apache YuniKorn。

## 旧的发布

所有的发布公告都可以在网站上的 [发布公告](/release-announce/) 中找到。

您可以在 [档案存储库](https://archive.apache.org/dist/yunikorn/) 中找到以前所有的版本。
如果您正在寻找在孵化期间制作的旧版本，请检查 [孵化器档案存储库](https://archive.apache.org/dist/incubator/yunikorn/)。

档案里包括上表中未提及的所有版本。

## License

该软件在 [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 下获得许可。
