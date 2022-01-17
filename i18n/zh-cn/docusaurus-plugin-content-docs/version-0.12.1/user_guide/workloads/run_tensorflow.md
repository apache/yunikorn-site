---
id: run_tf
title: 运行 TensorFlow 作业
description: 如何使用 YuniKorn 运行 TensorFlow 作业
keywords:
 - tensorflow
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

本章节概述了如何设置 [training-operator](https://github.com/kubeflow/training-operator) 以及如何使用 YuniKorn 调度器运行 Tensorflow 作业。
training-operator 是由 Kubeflow 维护的一体化集成的训练 operator。它不仅支持 TensorFlow，还支持 PyTorch、XGboots 等。

## 安装 training-operator
您可以使用以下命令在 kubeflow 命名空间中默认安装 training operator。如果安装有问题，
请参阅 [此文档](https://github.com/kubeflow/training-operator#installation) 来查找相关的详细信息。
```
kubectl apply -k "github.com/kubeflow/training-operator/manifests/overlays/standalone?ref=v1.3.0"
```

## 准备 docker 镜像
在开始于 Kubernetes 上运行 TensorFlow 作业之前，您需要构建 docker 镜像。
1. 从 [deployment/examples/tfjob](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples/tfjob) 上下载文件
2. 使用以下命令构建这个 docker 镜像

```
docker build -f Dockerfile -t kubeflow/tf-dist-mnist-test:1.0 .
```

## 运行一个 TensorFlow 作业
以下是一个使用 MNIST [样例](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/deployments/examples/tfjob/tf-job-mnist.yaml) 的 TFJob yaml. 

```yaml
apiVersion: kubeflow.org/v1
kind: TFJob
metadata:
  name: dist-mnist-for-e2e-test
  namespace: kubeflow
spec:
  tfReplicaSpecs:
    PS:
      replicas: 2
      restartPolicy: Never
      template:
        metadata:
          labels:
            applicationId: "tf_job_20200521_001"
            queue: root.sandbox
        spec:
          schedulerName: yunikorn
          containers:
            - name: tensorflow
              image: kubeflow/tf-dist-mnist-test:1.0
    Worker:
      replicas: 4
      restartPolicy: Never
      template:
        metadata:
          labels:
            applicationId: "tf_job_20200521_001"
            queue: root.sandbox
        spec:
          schedulerName: yunikorn
          containers:
            - name: tensorflow
              image: kubeflow/tf-dist-mnist-test:1.0
```
创建 TFJob
```
kubectl create -f deployments/examples/tfjob/tf-job-mnist.yaml
```

您可以从 YuniKorn UI 中查看作业信息。 如果您不知道如何访问 YuniKorn UI，
请阅读此 [文档](../../get_started/get_started.md#访问-Web-UI)。

![tf-job-on-ui](../../assets/tf-job-on-ui.png)
