---
id: run_spark
title: 运行Spark作业
description: 如何使用YuniKorn运行Spark作业
keywords:
 - spark
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

:::note 注意
本文档假设您已安装YuniKorn及其准入控制器。请参阅 [开始](../../get_started/get_started.md) 查看如何操作。
:::

## 为Spark准备docker镜像

要在Kubernetes上运行Spark，您需要Spark的docker镜像。您可以
1）使用Spark团队提供的docker镜像
2）从头开始构建一个镜像。如果你想建立自己的Spark的docker镜像，您可以找到 [完整说明](https://spark.apache.org/docs/latest/building-spark.html)
在 Spark 文档中。简化步骤:
* 下载一个支持Kubernetes的Spark版本，URL: https://github.com/apache/spark
* 构建支持Kubernetes的Spark版本:
```shell script
./buid/mvn -Pkubernetes -DskipTests clean package
```
建议使用[dockerhub](https://hub.docker.com/r/apache/spark/tags)中不同spark版本的官方镜像

## 为Spark作业创建一个命名空间

创建一个命名空间：

```shell script
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: spark-test
EOF
```

## 创建服务帐号和角色绑定

在 `spark-test` 命名空间下创建 service account 和 role bindings :

```shell script
cat <<EOF | kubectl apply -n spark-test -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: spark
  namespace: spark-test
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: spark-role
  namespace: spark-test
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list", "create", "delete"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: spark-role-binding
  namespace: spark-test
subjects:
- kind: ServiceAccount
  name: spark
  namespace: spark-test
roleRef:
  kind: Role
  name: spark-role
  apiGroup: rbac.authorization.k8s.io
EOF
```

:::注意
不可以在生产环境使用 `ClusterRole` 和 `ClusterRoleBinding` 去运行一个Spark作业！
请为运行Spark作业配置更细粒度的安全上下文。有关如何配置正确的RBAC规则的详细信息，请参见[链接](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)。
:::

## 提交一个Spark作业

如果这是从本地计算机运行的，您需要启动代理才能与api服务器通信。
```shell script
kubectl proxy
```

[dockerhub](https://hub.docker.com/r/apache/spark/tags)中有不同spark版本的官方镜像
运行一个简单的 SparkPi 作业，假设 Spark 二进制文件本地安装在 `/usr/local` 目录中。
```shell script
export SPARK_HOME=/usr/local/spark/
${SPARK_HOME}/bin/spark-submit --master k8s://http://localhost:8001 --deploy-mode cluster --name spark-pi \
   --master k8s://http://localhost:8001 --deploy-mode cluster --name spark-pi \
   --class org.apache.spark.examples.SparkPi \
   --conf spark.executor.instances=1 \
   --conf spark.kubernetes.namespace=spark-test \
   --conf spark.kubernetes.executor.request.cores=1 \
   --conf spark.kubernetes.container.image=docker.io/apache/spark:v3.3.0 \
   --conf spark.kubernetes.authenticate.driver.serviceAccountName=spark-test:spark \
   local:///opt/spark/examples/jars/spark-examples_2.12-3.3.0.jar
```
:::note
在 [spark](https://spark.apache.org/docs/latest/running-on-kubernetes.html#configuration) 中有更多设置驱动程序和执行程序的选项。
可以分配 applicationId 和队列路径。
```
--conf spark.kubernetes.executor.label.applicationId=application-spark-0001
--conf spark.kubernetes.driver.label.applicationId=application-spark-0001
--conf spark.kubernetes.executor.label.queue=root.default.sandbox
--conf spark.kubernetes.driver.label.queue=root.default.sandbox
```
:::

您可以看见Spark的driver和executors在Kubernetes上创建:

![spark-pods](./../../assets/RunningSparkOnK8s.png)

spark-pi结果在 driver pod中。

![spark-pods](./../../assets/sparkResult.png)

## 幕后发生了什么？

当Spark作业提交到集群时，该作业将提交到 `spark-test` 命名空间。Spark的driver的pod将首先在此名称空间下创建。
由于该集群已启用YuniKorn准入控制器，当driver的pod创建后，准入控制器会修改pod的规范并注入 `schedulerName=yunikorn`，
通过这样做默认K8s调度程序将跳过此pod，而由YuniKorn调度。请查看这里[在Kubernetes配置其他调度器](https://kubernetes.io/docs/tasks/extend-kubernetes/configure-multiple-schedulers/)来了解是如何完成的.

默认配置已启用放置规则，该规则会自动将 `spark-test` 命名空间映射到YuniKorn的队列 `root.spark test`。
提交到此命名空间的所有Spark作业将首先自动提交到该队列。
要了解有关放置规则如何工作的更多信息，请参阅文档[应用放置规则](user_guide/placement_rules.md)。
到目前为止，名称空间定义pod的安全上下文，队列考虑到作业顺序、队列资源公平性等因素会确定如何调度作业和pod。
注意，这是最简单的设置，不强制执行队列容量。该队列被视为具有无限容量。

YuniKor在标签 `spark-app-selector` 中重复设置Spark的应用程序ID，并提交此作业去YuniKorn，同时被视为一份作业。
当集群中有足够的资源时，作业被调度并运行。
YuniKorn将driver的pod分配给一个节点，绑定pod并启动所有容器。
一旦driver的pod启动，它会请求一堆executor的pod来运行它的任务。这些pod也将在相同的名称空间中创建，并且被YuniKorn所调度。
