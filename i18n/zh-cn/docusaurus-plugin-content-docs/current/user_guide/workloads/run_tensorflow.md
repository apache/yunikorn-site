---
id: run_tf
title: 运行TensorFlow作业
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
1. 从 [deployment/examples/tfjob](https://github.com/apache/yunikorn-k8shim/tree/master/deployments/examples/tfjob) 上下载文件
2. 使用以下命令构建这个 docker 镜像

```
docker build -f Dockerfile -t kubeflow/tf-dist-mnist-test:1.0 .
```

## 运行一个 TensorFlow 作业
以下是一个使用 MNIST [样例](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/examples/tfjob/tf-job-mnist.yaml) 的 TFJob yaml. 

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
请阅读此 [文档](../../get_started/get_started.md#访问-web-ui)。

![tf-job-on-ui](../../assets/tf-job-on-ui.png)

## 使用GPU Time-slicing
### 前提
要使用 Time-slicing GPU，您需要先设定丛集以让GPU和Time-slicing GPU能被使用。
- 节点上必须连接GPU
- Kubernetes版本为1.24
- 丛集中需要安装 GPU drivers
- 透过  [GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/getting-started.html) 自动化的建置与管理节点中的 NVIDIA 软体组件
- 在Kubernetes中设定 [Time-Slicing GPUs in Kubernetes](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/gpu-sharing.html)


在安装完 GPU Operator 及 Time-slicing GPU 以后，确认pods的状态以确保所有的containers正在运行或完成：
```shell script
kubectl get pod -n gpu-operator
```
```shell script
NAME                                                          READY   STATUS      RESTARTS       AGE
gpu-feature-discovery-fd5x4                                   2/2     Running     0              5d2h
gpu-operator-569d9c8cb-kbn7s                                  1/1     Running     14 (39h ago)   5d2h
gpu-operator-node-feature-discovery-master-84c7c7c6cf-f4sxz   1/1     Running     0              5d2h
gpu-operator-node-feature-discovery-worker-p5plv              1/1     Running     8 (39h ago)    5d2h
nvidia-container-toolkit-daemonset-zq766                      1/1     Running     0              5d2h
nvidia-cuda-validator-5tldf                                   0/1     Completed   0              5d2h
nvidia-dcgm-exporter-95vm8                                    1/1     Running     0              5d2h
nvidia-device-plugin-daemonset-7nzvf                          2/2     Running     0              5d2h
nvidia-device-plugin-validator-gj7nn                          0/1     Completed   0              5d2h
nvidia-operator-validator-nz84d                               1/1     Running     0              5d2h
```
确认时间片设定是否被成功的使用：
```shell script
kubectl describe node
```

```shell script
Capacity:
  nvidia.com/gpu:     16
...
Allocatable:
  nvidia.com/gpu:     16
...
```
### 使用GPU测试TensorFlow job
在这个段落中会在 Time-slicing GPU 的支援下，测试及验证TFJob的运行

1. 新建一个workload的测试档案tf-gpu.yaml：
  ```shell script
  vim tf-gpu.yaml
  ```
  ```yaml
  apiVersion: "kubeflow.org/v1"
  kind: "TFJob"
  metadata:
    name: "tf-smoke-gpu"
    namespace: kubeflow
  spec:
    tfReplicaSpecs:
      PS:
        replicas: 1
        template:
          metadata:
            creationTimestamp: 
            labels:
              applicationId: "tf_job_20200521_001"
          spec:
            schedulerName: yunikorn
            containers:
              - args:
                  - python
                  - tf_cnn_benchmarks.py
                  - --batch_size=32
                  - --model=resnet50
                  - --variable_update=parameter_server
                  - --flush_stdout=true
                  - --num_gpus=1
                  - --local_parameter_device=cpu
                  - --device=cpu
                  - --data_format=NHWC
                image: docker.io/kubeflow/tf-benchmarks-cpu:v20171202-bdab599-dirty-284af3
                name: tensorflow
                ports:
                  - containerPort: 2222
                    name: tfjob-port
                workingDir: /opt/tf-benchmarks/scripts/tf_cnn_benchmarks
            restartPolicy: OnFailure
      Worker:
        replicas: 1
        template:
          metadata:
            creationTimestamp: null
            labels:
              applicationId: "tf_job_20200521_001"
          spec:
            schedulerName: yunikorn
            containers:
              - args:
                  - python
                  - tf_cnn_benchmarks.py
                  - --batch_size=32
                  - --model=resnet50
                  - --variable_update=parameter_server
                  - --flush_stdout=true
                  - --num_gpus=1
                  - --local_parameter_device=cpu
                  - --device=gpu
                  - --data_format=NHWC
                image: docker.io/kubeflow/tf-benchmarks-gpu:v20171202-bdab599-dirty-284af3
                name: tensorflow
                ports:
                  - containerPort: 2222
                    name: tfjob-port
                resources:
                  limits:
                    nvidia.com/gpu: 2
                workingDir: /opt/tf-benchmarks/scripts/tf_cnn_benchmarks
            restartPolicy: OnFailure
  ```
2. 创建TFJob
  ```shell script
  kubectl apply -f tf-gpu.yaml
  ```
3. 在Yunikorn中验证TFJob是否运行
  ![tf-job-gpu-on-ui](../../assets/tf-job-gpu-on-ui.png)
    察看pod的日志:
    ```shell script
    kubectl logs logs po/tf-smoke-gpu-worker-0 -n kubeflow
    ```
    ```
    .......
    ..Found device 0 with properties:
    ..name: NVIDIA GeForce RTX 3080 major: 8 minor: 6 memoryClockRate(GHz): 1.71

    .......
    ..Creating TensorFlow device (/device:GPU:0) -> (device: 0, name: NVIDIA GeForce RTX 3080, pci bus id: 0000:01:00.0, compute capability: 8.6)
    .......
    ```
    ![tf-job-gpu-on-logs](../../assets/tf-job-gpu-on-logs.png)
