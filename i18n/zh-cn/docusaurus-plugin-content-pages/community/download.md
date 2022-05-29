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

Apache YuniKorn 的最新版本是 v1.0.0。

| 版本     | 发布日期      | 源代码下载                                                                                                                                                                                                                                                                                                                                                                                      | Docker 镜像                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 发布说明                           |
|---------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| v1.0.0  | 2022-05-06   | [下载](https://www.apache.org/dyn/closer.lua/yunikorn/1.0.0/apache-yunikorn-1.0.0-src.tar.gz) <br />[Checksum](https://downloads.apache.org/yunikorn/1.0.0/apache-yunikorn-1.0.0-src.tar.gz.sha512) & [签名](https://downloads.apache.org/yunikorn/1.0.0/apache-yunikorn-1.0.0-src.tar.gz.asc)                                                                      | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.0.0/images/sha256-a38ef737337798a6597c56637efc5eeae1701898eb94c4c43e638cbdb9ad782c) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.0.0/images/sha256-2673539c26c42a1607fbf7eba9f11d7e9737eb21e90c20eafdbcc4367d07d7a6) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-1.0.0/images/sha256-10cb381da02db65c05e9ef2a712ddd28d36d67ee8cb127dd95f14603707db5d9) <br />[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.0.0/images/sha256-f7b2a186b3088e269842c415e1fe1c2afa8835e24a98fa85097e6be5c234712b) | [公告](/release-announce/1.0.0)  |
| v0.12.2 | 2022-02-03   | [下载](https://archive.apache.org/dist/incubator/yunikorn/0.12.2/apache-yunikorn-0.12.2-incubating-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/incubator/yunikorn/0.12.2/apache-yunikorn-0.12.2-incubating-src.tar.gz.sha512) & [签名](https://archive.apache.org/dist/incubator/yunikorn/0.12.2/apache-yunikorn-0.12.2-incubating-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-0.12.2/images/sha256-aa2de246fc48a6a9859f0cc1b9fb66c4a0928a5af5925494b68ca755c69e830b) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-0.12.2/images/sha256-0270b1912b5da05db635d1952608f04166e892385e879a16940d963bd1c79bd4) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-0.12.2/images/sha256-7c886a967d04c3a8df14a3ededf15e14af7db8cd7bea85ca4b935a5c9a0f0243)                                                                                                                                                                            | [公告](/release-announce/0.12.2) |
| v0.11.0 | 2021-08-18   | [下载](https://archive.apache.org/dist/incubator/yunikorn/0.11.0/apache-yunikorn-0.11.0-incubating-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/incubator/yunikorn/0.11.0/apache-yunikorn-0.11.0-incubating-src.tar.gz.sha512) & [签名](https://archive.apache.org/dist/incubator/yunikorn/0.11.0/apache-yunikorn-0.11.0-incubating-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-0.11.0/images/sha256-7d156e4df2cb1a99d6f3cf5bfd15ae42c7c195f66411b83a720b375194209d20) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-0.11.0/images/sha256-2b1cee3e79a0f08c835ed264c537b14eb0527d7196dcbbf613296f034c8c2a70) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-0.11.0/images/sha256-e07a8465fefb4f51ab989b7be4db824b51fc4b925fb400c09fad87d0b0729246)                                                                                                                                                                            | [公告](/release-announce/0.11.0) |

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
  - 在 Linux: `sha256sum -c apache-yunikorn-X.Y.Z-src.tar.gz.tar.gz.sha512`

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
