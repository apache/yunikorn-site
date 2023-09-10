---
id: openshift_development
title: Development in CodeReady Containers
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

YuniKorn 针对 OpenShift 进行了测试，开发人员可以设置本地环境来针对 OpenShift 测试补丁。
我们推荐本地环境使用 CodeReady 容器。

## 设置正在运行的 CRC 集群

1. 下载 CodeReady 容器二进制文件

    从下拉列表中选择您的操作系统，然后单击“下载”（在 Mac 上，您将下载 crc-macos-amd64.tar.xz；在 Linux 上，crc-linux-amd64.tar.xz）。
    系统会要求您使用 Red Hat 登录名进行连接。 如果您没有，只需单击“立即创建”。 您 *不* 需要 Red Hat 订阅。
   
   登录后，下载 CodeReady Containers 二进制文件和 pull secret。
   
1. 解压缩 tar 文件。

   ```bash
   tar -xvzf crc-macos-amd64.tar.xz
   ```
   
1. 将 crc 二进制文件移到您的路径下。 像

   ```bash
   sudo cp `pwd`/crc-macos-$CRCVERSION-amd64/crc /usr/local/bin
   ```

1. 根据您的硬件能力配置 CRC 。

   ```bash
   crc config set memory 16000
   crc config set cpus 12
   crc setup
   ```
1. 启动 CRC 并打开控制台。

   ```bash
   crc start --pull-secret-file pull-secret.txt
   crc console
   ```

## 测试补丁

以下步骤假设您的笔记本电脑中有一个正在运行的 CRC 集群。 
:::note
这些步骤未针对远程 CRC 集群进行测试。
:::

1. 通过 `oc` 命令访问您的环境。

   在 shell 中输入 `crc oc-env` 命令。
   ```bash
   $ crc oc-env
   export PATH="/Users/<user>/.crc/bin/oc:$PATH"
   # Run this command to configure your shell:
   # eval $(crc oc-env)
   ```
   所以你需要输入这个来访问 `oc` 命令：
   ```
   eval $(crc oc-env)
   ```

1. 登录到 “oc” 。 CRC 启动后，它会显示类似的消息：

   ```
   To access the cluster, first set up your environment by following 'crc oc-env' instructions.
   Then you can access it by running 'oc login -u developer -p developer https://api.crc.testing:6443'.
   To login as an admin, run 'oc login -u kubeadmin -p duduw-yPT9Z-hsUpq-f3pre https://api.crc.testing:6443'.
   To access the cluster, first set up your environment by following 'crc oc-env' instructions.
   ```

   使用 `oc login -u kubeadmin ...` 命令。

1. 通过输入以下命令获取本地 OpenShift 集群的内部私有 Docker 存储库的 URL。

   ```bash
   $ oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'
   default-route-openshift-image-registry.apps-crc.testing
   ```

   默认情况下，它应该是 “default-route-openshift-image-registry.apps-crc.testing” 。 如果显示的 URL 不同，请更改上述步骤。

1. 准备 Docker 镜像。

   您可以在底部的 *使用自定义镜像* 部分阅读更多相关信息。

1. 准备 helm chart.

   如果您想使用自定义 Docker 镜像，请替换 helm chart 的 “values.yaml” 配置文件中的镜像。

   :::note
   如果您直接将 Docker 镜像手动推送到 `default-route-openshift-image-registry.apps-crc.testing` docker registry ，您需要有有效的证书才能访问它。
   在 OpenShift 上有更容易使用的服务：`image-registry.openshift-image-registry.svc`。
   :::

   例如，如果你想覆盖所有 Docker 镜像，你应该使用以下配置：
   ```yaml
   image:
     repository: image-registry.openshift-image-registry.svc:5000/yunikorn/yunikorn
     tag: scheduler-latest
     pullPolicy: Always
   
   admission_controller_image:
     repository: image-registry.openshift-image-registry.svc:5000/yunikorn/yunikorn
     tag: admission-latest
     pullPolicy: Always
   
   web_image:
     repository: image-registry.openshift-image-registry.svc:5000/yunikorn/yunikorn-web
     tag: latest
     pullPolicy: Always
   ``` 

   您可以在 yunikorn-release 存储库的 helm chart 目录中找到它。

1. 安装 helm charts.

   ```bash
   helm install yunikorn . -n yunikorn
   ```

## 使用自定义镜像

### Podman

1. 使用以下命令登录 Podman。

   ```bash
   podman login --tls-verify=false -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
   ```

1. 在存储库中构建镜像，例如 在 shim 中使用通用的 “make image” 命令。

1. 验证镜像是否存在于存储库中。

   ```bash
   podman images
   REPOSITORY                TAG              IMAGE ID     CREATED            SIZE
   localhost/apache/yunikorn admission-latest 19eb41241d64 About a minute ago 53.5 MB
   localhost/apache/yunikorn scheduler-latest e60e09b424d9 About a minute ago 543 MB
   ```

## 直接推送 OS 镜像注册

1. 创建您要替换的镜像。

   您可以在本地构建新镜像或使用官方镜像（也可以混合使用）。
      * 对于 -shim 和 -web 镜像检查存储库（可选择进行更改）并输入以下命令：
      ```bash
      make clean image REGISTRY=default-route-openshift-image-registry.apps-crc.testing/<project>/<name>:<tag>
      ```
      :::note
      在 OpenShift 中，一个计划相当于一个 Kubernetes 命名空间。 推荐使用 `yunikorn` 项目/命名空间。
      :::

      * 可以使用官方镜像，通过 “docker tag” 命令重新标记。
      ```bash
      docker tag apache/yunikorn:scheduler-latest default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
      ```

1. 登录到 Docker 存储库。
   ```bash
   docker login -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
   ```

1. 将 Docker 镜像推送到内部 Docker 存储库
   ```
   docker push default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
   ```