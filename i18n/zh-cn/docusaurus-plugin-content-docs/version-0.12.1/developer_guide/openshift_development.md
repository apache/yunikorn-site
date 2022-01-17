---
id: openshift_development
title: 在 CodeReady 容器中开发
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

YuniKorn经过了OpenShift的测试，开发人员可以设置他们的本地环境来测试OpenShift的补丁。
我们推荐本地环境使用CodeReady容器。

## 设置一个运行的CRC集群

1. 下载 CodeReady 容器二进制文件

   从列表中选择您的操作系统，然后单击“下载”（在Mac上，您将下载crc-macos-amd64.tar.xz；在Linux上，下载crc-linux-amd64.tar.xz）。
   您将被要求使用红帽登录进行连接。如果您没有，只需单击 "Create one now"。您 *不需要* 红帽的订阅。
   
   登录后，下载CodeReady容器二进制文件和拉取秘钥。
   
2. 解压tar文件。

   ```bash
   tar -xvzf crc-macos-amd64.tar.xz
   ```
   
3. 移动 crc 的二进制文件到您的路径下。例如

   ```bash
   sudo cp `pwd`/crc-macos-$CRCVERSION-amd64/crc /usr/local/bin
   ```

4. 根据您的硬件情况配置CRC。

   ```bash
   crc config set memory 16000
   crc config set cpus 12
   crc setup
   ```
   
5. 启动CRC并打开控制台。

   ```bash
   crc start --pull-secret-file pull-secret.txt
   crc console
   ```

## 测试补丁

以下步骤假设您的笔记本电脑中有一个正在运行的CRC集群。请注意，这些步骤没有针对远程CRC集群进行测试。

1. 通过 `oc` 命令访问您的环境。

   在shell中输入 `crc oc-env` 命令。
   ```bash
   $ crc oc-env
   export PATH="/Users/<user>/.crc/bin/oc:$PATH"
   # 运行此命令以配置shell:
   # eval $(crc oc-env)
   ```
   因此，您需要输入以下内容才能访问 `oc` 命令：
   ```
   eval $(crc oc-env)
   ```

1. 登录 `oc`，CRC启动后，将显示类似的消息：

   ```
   To access the cluster, first set up your environment by following 'crc oc-env' instructions.
   Then you can access it by running 'oc login -u developer -p developer https://api.crc.testing:6443'.
   To login as an admin, run 'oc login -u kubeadmin -p duduw-yPT9Z-hsUpq-f3pre https://api.crc.testing:6443'.
   To access the cluster, first set up your environment by following 'crc oc-env' instructions.
   ```

   Use the `oc login -u kubeadmin ...` command. 

2. 通过输入下面的命令，获取本地OpenShift集群的内部私有Docker存储库的URL。

   ```bash
   $ oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'
   default-route-openshift-image-registry.apps-crc.testing
   ```

   默认情况下，它应该是 `default-route-openshift-image-registry.apps-crc.testing`。如果显示的URL不同，请更改上述步骤。

3. 准备Docker镜像。

   您可以在底部的 *使用自定义镜像* 部分中阅读更多关于此的信息。

4. 准备 helm chart。

   如果要使用自定义Docker镜像，请替换chart的 `values.yaml` 配置文件中的镜像。

   请注意，如果手动将Docker映像推送到 `default-route-openshift-image-registry.apps-crc.testing` Docker注册服务内，则需要有有效的证书才能访问它。
   如果在OpenShift上有更易于使用的服务：`image-registry.openshift-image-registry.svc`。

   例如，如果要覆盖所有三个Docker镜像，您应使用以下配置：
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

   您可以在 yunikorn-release 的 helm chart 目录中找到它。

5. 安装 helm charts。

   ```bash
   helm install yunikorn . -n yunikorn
   ```

## 使用自定义镜像

### Podman

1. 用如下命名登陆Podman。

   ```bash
   podman login --tls-verify=false -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
   ```

2. 使用通用的 `make image` 命令在代码仓库中（例如在shim中）构建镜像。

3. 验证该镜像是否存在于镜像仓库中。

   ```bash
   podman images
   REPOSITORY                TAG              IMAGE ID     CREATED            SIZE
   localhost/apache/yunikorn admission-latest 19eb41241d64 About a minute ago 53.5 MB
   localhost/apache/yunikorn scheduler-latest e60e09b424d9 About a minute ago 543 MB
   ```

## 直接推送OS镜像到注册服务内

1. 创建您需要替换的镜像。

   您可以在本地创建新的镜像，也可以使用官方镜像（可能两者混合）。
      * 对于 -shim 和 -web 镜像，请在代码仓库中 checkout 出来（或者进行您自己的更改），然后输入以下命令：
      ```bash
      make clean image REGISTRY=default-route-openshift-image-registry.apps-crc.testing/<project>/<name>:<tag>
      ```
      请注意，在OpenShift中，project相当于Kubernetes的namespace。建议使用 `yunikorn` 项目/命名空间。
      * 可以通过 `docker tag` 命令重新标记来使用官方镜像。
      ```bash
      docker tag apache/yunikorn:scheduler-latest default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
      ```

2. 登录到Docker镜像仓库。
   ```bash
   docker login -u kubeadmin -p $(oc whoami -t) default-route-openshift-image-registry.apps-crc.testing
   ```

3. 将Docker映像推送到内部Docker镜像仓库。
   ```
   docker push default-route-openshift-image-registry.apps-crc.testing/yunikorn/yunikorn:scheduler-latest
   ```
