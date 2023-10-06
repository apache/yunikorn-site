---
id: deployment
title: 部署到 Kubernetes
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

部署YuniKorn的最简单方法是利用我们的[helm charts](https://hub.helm.sh/charts/yunikorn/yunikorn)，您可以在[这里](get_started/get_started.md)找到指南。本文档描述了手动部署YuniKorn调度器和准入控制器的过程，主要面向开发人员。

## 构建Docker镜像

在 `yunikorn-k8shim` 项目的根目录下，运行以下命令来使用配置文件构建一个镜像:
```
make image
```

此命令将构建一个镜像。该镜像将使用默认版本、镜像标签和您的构建架构进行标记。

**注意** 默认构建使用硬编码的用户和标签。您 *必须* 更新 `Makefile` 中的 `IMAGE_TAG` 变量，以便推送到适当的仓库。

**注意** Docker Hub 上的最新 YuniKorn 镜像不再更新，因为ASF政策的原因。因此，在部署之前，您应该在本地构建调度器镜像和Web镜像。

**注意** 镜像标记包含您的构建架构。对于Intel，它将是 `amd64`，对于Mac M1，它将是 `arm64v8`。

## 设置调度器的RBAC

第一步是为调度器创建RBAC角色，请参考以下步骤: [yunikorn-rbac.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/yunikorn-rbac.yaml)
```
kubectl create -f scheduler/yunikorn-rbac.yaml
```
角色是当前版本Kubernetes的要求。

## 创建/更新ConfigMap

在部署调度器之前，必须执行此操作。它需要一个正确设置的Kubernetes环境。这个Kubernetes环境可以是本地的或远程的。

- 如果配置文件在节点上不可用，请下载它以添加到Kubernetes:
```
curl -o queues.yaml https://raw.githubusercontent.com/apache/yunikorn-k8shim/master/conf/queues.yaml
```
- 根据需要修改 `queues.yaml` 文件的内容，然后在Kubernetes中创建ConfigMap:
```
kubectl create configmap yunikorn-configs --from-file=queues.yaml
```
- 或者在Kubernetes中更新ConfigMap:
```
kubectl create configmap  yunikorn-configs --from-file=queues.yaml -o yaml --dry-run=client | kubectl apply -f -
```
- 检查ConfigMap是否已正确创建/更新:
```
kubectl describe configmaps yunikorn-configs
```
注意：在资源分配队列规范中使用与yunikorn-defaults配置中使用的文件名相同的文件名，例如 `queues.yaml`。

## 部署调度器

可以使用以下命令部署调度器。
```
kubectl create -f deployments/scheduler/scheduler.yaml
```

部署将在一个Pod中运行2个容器，这些容器使用了您预先构建的Docker镜像。

* yunikorn-scheduler-core (yunikorn scheduler core and shim for K8s)
* yunikorn-scheduler-web (web UI)

或者，调度器也可以作为一个Kubernetes调度器插件部署：
```
kubectl create -f deployments/scheduler/plugin.yaml
```

Pod被部署为一个定制的调度器，它将负责调度那些在Pod规范中明确指定了`schedulerName: yunikorn`的Pod。除了`schedulerName`，您还必须为Pod添加一个标签`applicationId`。
```yaml
  metadata:
    name: pod_example
    labels:
      applicationId: appID
  spec:
    schedulerName: yunikorn
```

注意：准入控制器会从用户那里抽象出`schedulerName`和`applicationId`的添加，因此会将所有流量路由到YuniKorn。如果您使用Helm chart进行部署，它将会同时安装准入控制器和调度器。否则，如果运行的工作负载中Pod规范和元数据中没有`schedulerName`和`applicationId`，则可以继续下面的步骤手动部署准入控制器。

## 设置准入控制器的RBAC

在部署准入控制器之前，我们必须创建其RBAC角色，请参考以下链接： [admission-controller-rbac.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/admission-controller-rbac.yaml).

```
kubectl create -f scheduler/admission-controller-rbac.yaml
```

## 创建Secret

由于准入控制器拦截对API服务器的调用以验证/改变传入的请求，因此我们必须部署一个空的Secret，用于存储Webhook服务器的TLS证书和密钥，请参考以下链接：[admission-controller-secrets.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/admission-controller-secrets.yaml).

```
kubectl create -f scheduler/admission-controller-secrets.yaml
```

## 部署准入控制器

现在，我们可以部署准入控制器作为一个服务。这将自动验证/修改传入的请求和对象，与 [部署调度器中的示例](#部署调度器) 保持一致。请查看 [admission-controller.yaml](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/scheduler/admission-controller.yaml) 中的准入控制器部署和服务的内容。

```
kubectl create -f scheduler/admission-controller.yaml
```

## 访问Web用户界面

当调度器部署时，Web用户界面也会在一个容器中部署。可以通过以下方式打开标准端口上的Web界面的端口转发：

```
kubectl port-forward svc/yunikorn-service 9889 9080
```

`9889` 是Web用户界面的默认端口，`9080` 是调度器的Restful服务的默认端口，Web用户界面从这里获取信息。
完成上述操作后，Web用户界面将可通过 http://localhost:9889 访问。

## 配置热刷新

YuniKorn使用配置映射来存储配置，并支持通过使用共享的通知器（shared informers）监视配置映射的更改，从而自动加载配置更改。

要进行配置更改，只需更新配置映射中的内容，可以通过Kubernetes仪表板UI或命令行完成。请注意，对配置映射的更改可能需要一些时间才能被调度器检测到。

