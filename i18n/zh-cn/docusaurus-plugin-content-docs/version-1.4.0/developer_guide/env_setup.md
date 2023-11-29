---
id: env_setup
title: 开发环境的设置
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

有很多种方法可以在本地设置Kubernetes开发环境，其中最常见的三种方法是`Minikube`([docs](https://kubernetes.io/docs/setup/minikube/))、`docker-desktop`和`kind`([kind](https://kind.sigs.k8s.io/)
`Minikube`通过数个虚拟机提供一个本地Kubernetes集群（通过VirtualBox或类似的东西）。`docker-desktop`能在docker容器中设置Kubernetes集群。 `kind`为Windows、Linux和Mac提供轻量级的Kubernetes集群。

## 使用Docker Desktop设置本地的Kubernetes集群

在本教程中，我们将基于Docker Desktop进行所有的安装。
我们也可以使用轻量级的[minikube](#使用minikube设置本地的kubernetes集群)设置，它可以提供同样的功能，且需要的资源较小。

### 安装

在你的笔记本电脑上下载并安装[Docker-Desktop](https://www.docker.com/products/docker-desktop)。其中，最新版本包含了Kubernetes，所以不需要额外安装。
只需按照[这里](https://docs.docker.com/docker-for-mac/#kubernetes)的步骤，就可以在docker-desktop中启动和运行Kubernetes。

一旦Kubernetes在docker桌面中启动，你应该看到类似以下的画面：

![Kubernetes in Docker Desktop](./../assets/docker-desktop.png)

这意味着：
1. Kubernetes正在运行。
2. 命令行工具`kubctl`安装在`/usr/local/bin`目录下。
3. Kubernetes的被设置到`docker-desktop`中。

### 部署和访问仪表板

设置好本地Kubernetes后，你需要使用以下步骤部署仪表盘： 
1. 按照[Kubernetes dashboard doc](https://github.com/kubernetes/dashboard)中的说明来部署仪表盘。
2. 从终端启动Kubernetes代理，让我们能存取本地主机上的仪表板：   
    ```shell script
    kubectl proxy &
    ```
3. 通过以下网址访问仪表板： [链接](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login)

### 访问本地Kubernetes集群

上一步部署的仪表板需要一个令牌或配置来登录。这里我们使用令牌来登录。该令牌是自动生成的，可以从系统中检索到。

1. 检索仪表板令牌的名称：
    ```shell script
    kubectl -n kube-system get secret | grep kubernetes-dashboard-token
    ```
2. 检索令牌的内容，注意令牌名称以随机的5个字符代码结尾，需要用步骤1的结果替换。例如：
    ```shell script
    kubectl -n kube-system describe secret kubernetes-dashboard-token-tf6n8
    ```
3. 複製`Data`中标签为 `token`的值。
4. 在用户介面仪表板中选择 **Token**：<br/>
    ![Token Access in dashboard](./../assets/dashboard_token_select.png)
5. 在输入框中粘贴`token`的值，然后登录：<br/>
    ![Token Access in dashboard](./../assets/dashboard_secret.png)

## 使用Minikube设置本地的Kubernetes集群

Minikube 可以被添加到现有的 Docker Desktop 中。Minikube 既可以使用预装的虚拟机管理程序(hypervisor)，也可以自己选择。预设是由[HyperKit](https://github.com/moby/hyperkit)所提供的虚拟化，它已被嵌入到 Docker Desktop 中。  

如果你不想使用 HyperKit 的虚拟机管理程序，请确保你遵循通用的minikube安装说明。如果需要的话，不要忘记为所选择的虚拟机管理程序安装正确的驱动程序。
基本说明在[minikube install](https://kubernetes.io/docs/tasks/tools/install-minikube/)中提供。

如果要检查 Docker Desktop 是否安装了 HyperKit。在终端上运行： `hyperkit`来确认。除了 `hyperkit: command not found` 以外的任何响应都证实了 HyperKit 已经安装并且在路径上。如果没有找到，你可以选择一个不同的虚拟机管理程序或修复Docker Desktop。

### 安装 Minikube
1. 你可以使用 brew 或是以下的步骤来安装 minikube：
    ```shell script
    curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
    chmod +x minikube
    sudo mv minikube /usr/local/bin
    ```
2. 你可以使用 brew 或是以下的步骤来安装 HyperKit 的驱动程序(必要)：
    ```shell script
    curl -LO https://storage.googleapis.com/minikube/releases/latest/docker-machine-driver-hyperkit
    sudo install -o root -g wheel -m 4755 docker-machine-driver-hyperkit /usr/local/bin/
    ```
3. 更新 minikube 配置，使其默认虚拟机管理程序为HyperKit：`minikube config set vm-driver hyperkit`。
4. 修改 docker desktop 以使用 Kubernetes 的 minikube：<br/>
    ![Kubernetes in Docker Desktop: minikube setting](./../assets/docker-dektop-minikube.png)

### 部署和访问集群
安装完成后，你可以开始启动一个新的集群。
1. 启动 minikube 集群： `minikube start --kubernetes-version v1.24.7`
2. 启动 minikube 仪表板： `minikube dashboard &`

### 开发环境对构建的影响
在创建映像之前，确保你的 minikube 运行在正确的环境中。
如果没有设定 minikube 环境，就会在部署调度器的时候找不到docker映像。
1. 确保 minikube 已启动。
2. 在你要运行构建的终端中，执行： `eval $(minikube docker-env)`
3. 在 yunikorn-k8shim 的根目录创建映像： `make image`
4. 按照正常指令部署调度器。

## 使用 Kind 的设置本地的 Kubernetes 集群

Kind（Kubernetes in Docker）是一个轻量级的工具，主要用来运行轻量级Kubernetes环境。 用kind测试不同的Kubernetes版本是非常容易的，只需选择你想要的映像。

### 安装

如果你已经安装过go，可以直接运行`go install sigs.k8s.io/kind@latest`。

可在[Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)的文件上找到其他方法。

Kubernetes 1.25 或更高版本需要 Kind 版本 0.15。Kind 的更高版本添加了 Kubernetes 1.26、1.27 和 1.28。检查种类发行说明以了解支持的特定 Kubernetes 版本

### 使用 Kind

若要要测试新版本的Kubernetes，你可以从kind的repo中拉出一个相应的映像。

创建版本为 v1.24.7 的 Kubernetes 集群： `kind create cluster --name test --image kindest/node:v1.24.7`

删除 kind 集群： `kind delete cluster --name test`

### 载入你的映像

为了使用本地镜像，你必须将你的映像加载到kind的注册表(registry)中。 如果你运行`make image`，你可以使用下面的命令来加载你的kind映像。 以下假设为AMD64架构。

下面是调度器、网页UI和存取控制器的例子： 

调度器：
`kind load docker-image apache/yunikorn:scheduler-amd64-latest`

网页UI： 
`kind load docker-image apache/yunikorn:web-amd64-latest`

存取控制器：
`kind load docker-image apache/yunikorn:admission-amd64-latest`

## 在本地调试代码

注意，这个指令要求你在 GoLand IDE 进行开发。

在GoLand中，进入yunikorn-k8shim项目。然后点击 "Run" -> "Debug..." -> "Edit Configuration..." 获取弹出的配置窗口。
注意，如果第一次没有 "Go Build "选项，你需要点击 "+"来创建一个新的配置文件。

![Debug Configuration](./../assets/goland_debug.jpg)

强调的字段是你需要添加的配置。包括以下：

- Run Kind： package
- Package path： 指向 `pkg/shim` 的路径
- Working directory： 指向`conf`目录的路径，这是程序加载配置文件的地方。
- Program arguments： 指定运行程序的参数，如 `-kubeConfig=/path/to/.kube/config -interval=1s -clusterId=mycluster -clusterVersion=0.1 -name=yunikorn -policyGroup=queues -logEncoding=console -logLevel=-1`.
注意，你需要把`/path/to/.kube/config`替换为kubeconfig文件的本地路径。如果你想改变或添加更多的选项，你可以运行`_output/bin/k8s-yunikorn-scheduler -h`来了解。

修改完成后，点击 "Apply"，然后点击 "Debug"。你将需要设置适当的断点，以便调试程序。

## 存取远端的 Kubernetes 集群

这个设置的前提是你已经安装了一个远程Kubernetes集群。
关于如何访问多个集群并将其整合，请参考Kubernetes的[访问多个集群](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)文档。

或者按照这些简化的步骤：
1. 从远程集群获取Kubernetes的`config`文件，将其复制到本地机器上，并给它一个唯一的名字，即`config-remote`。
2. 更新 `KUBECONFIG` 环境变量（如果已设置）。
    ```shell script
    export KUBECONFIG_SAVED=$KUBECONFIG
    ```
3. 将新文件添加到环境变量中。
    ```shell script
    export KUBECONFIG=$KUBECONFIG:config-remote
    ``` 
4. 运行`kubectl config view`命令，检查是否可以访问这两个配置。
5. 透过以下命令切换配置 `kubectl config use-context my-remote-cluster`
6. 确认是否切换到了远程集群的配置：
    ```text
    kubectl config get-contexts
    CURRENT   NAME                   CLUSTER                      AUTHINFO             NAMESPACE
              docker-for-desktop     docker-for-desktop-cluster   docker-for-desktop
    *         my-remote-cluster      kubernetes                   kubernetes-admin
    ```

更多的文件可以在[这里](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)找到。
