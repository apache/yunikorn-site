---
id: run_nvidia
title: 运行NVIDIA GPU作业
description: 如何使用Yunikorn运行通用的GPU调度示例
keywords:
 - NVIDIA GPU
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

## Yunikorn 与 NVIDIA GPUs
本指南概述了如何设置NVIDIA设备插件，该插件使用户可以在Yunikorn上运行GPU。如需更详细信息，请查看 [**使用GPU的Kubernetes**](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/install-k8s.html#option-2-installing-kubernetes-using-kubeadm)。

### 先决条件
在按照以下步骤之前，需要在 [**设置GPU的Kubernetes**](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/install-k8s.html#install-kubernetes)上部署Yunikorn。

### 安装NVIDIA设备插件
添加nvidia-device-plugin Helm存储库。
```
helm repo add nvdp https://nvidia.github.io/k8s-device-plugin
helm repo update
helm repo list
```

验证插件的最新发布版本是否可用。
```
helm search repo nvdp --devel
NAME                     	  CHART VERSION  APP VERSION	   DESCRIPTION
nvdp/nvidia-device-plugin	  0.12.3         0.12.3         A Helm chart for ...
```

部署设备插件。
```
kubectl create namespace nvidia
helm install --generate-name nvdp/nvidia-device-plugin --namespace nvidia --version 0.12.3
```

检查Pod的状态以确保NVIDIA设备插件正在运行。
```
kubectl get pods -A

NAMESPACE      NAME                                      READY   STATUS    RESTARTS      AGE
kube-flannel   kube-flannel-ds-j24fx                     1/1     Running   1 (11h ago)   11h
kube-system    coredns-78fcd69978-2x9l8                  1/1     Running   1 (11h ago)   11h
kube-system    coredns-78fcd69978-gszrw                  1/1     Running   1 (11h ago)   11h
kube-system    etcd-katlantyss-nzxt                      1/1     Running   3 (11h ago)   11h
kube-system    kube-apiserver-katlantyss-nzxt            1/1     Running   4 (11h ago)   11h
kube-system    kube-controller-manager-katlantyss-nzxt   1/1     Running   3 (11h ago)   11h
kube-system    kube-proxy-4wz7r                          1/1     Running   1 (11h ago)   11h
kube-system    kube-scheduler-katlantyss-nzxt            1/1     Running   4 (11h ago)   11h
kube-system    nvidia-device-plugin-1659451060-c92sb     1/1     Running   1 (11h ago)   11h
```

### 测试NVIDIA设备插件
创建一个GPU测试的YAML文件。
```
# gpu-pod.yaml
	apiVersion: v1
	kind: Pod
	metadata:
	  name: gpu-operator-test
	spec:
	  restartPolicy: OnFailure
	  containers:
	  - name: cuda-vector-add
	    image: "nvidia/samples:vectoradd-cuda10.2"
	    resources:
	      limits:
	         nvidia.com/gpu: 1
```
部署应用程序。
```
kubectl apply -f gpu-pod.yaml
```
检查日志以确保应用程序成功完成。
```
kubectl get pods gpu-operator-test

NAME                READY   STATUS      RESTARTS   AGE
gpu-operator-test   0/1     Completed   0          9d
```
检查结果。
```
kubectl logs gpu-operator-test
	
[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

---
## 启用GPU时间切片( 可选 )
GPU时间分片允许多租户共享单个GPU。
要了解GPU时间分片的工作原理，请参阅[**在Kubernetes中使用GPU的时间切片**](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/gpu-sharing.html#introduction)。此页面介绍了使用 [**NVIDIA GPU Operator**](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/gpu-operator)启用Yunikorn中GPU调度的方法。


### 配置
以下示例说明在ConfigMap中指定多个配置。
```yaml
# time-slicing-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: time-slicing-config
  namespace: nvidia
data:
    a100-40gb: |-
        version: v1
        sharing:
          timeSlicing:
            resources:
            - name: nvidia.com/gpu
              replicas: 8
            - name: nvidia.com/mig-1g.5gb
              replicas: 2
            - name: nvidia.com/mig-2g.10gb
              replicas: 2
            - name: nvidia.com/mig-3g.20gb
              replicas: 3
            - name: nvidia.com/mig-7g.40gb
              replicas: 7
    rtx-3070: |-
        version: v1
        sharing:
          timeSlicing:
            resources:
            - name: nvidia.com/gpu
              replicas: 8
```

:::note
如果节点上的GPU类型不包括a100-40gb或rtx-3070，您可以根据现有的GPU类型修改YAML文件。例如，在本地Kubernetes集群中只有多个rtx-2080ti，而rtx-2080ti不支持MIG，因此无法替代a100-40gb。但rtx-2080ti支持时间切片，因此可以替代rtx-3070。
:::

:::info
MIG支持于2020年添加到Kubernetes中。有关其工作原理的详细信息，请参阅 [**在Kubernetes中支援MIG**](https://www.google.com/url?q=https://docs.google.com/document/d/1mdgMQ8g7WmaI_XVVRrCvHPFPOMCm5LQD5JefgAh6N8g/edit&sa=D&source=editors&ust=1655578433019961&usg=AOvVaw1F-OezvM-Svwr1lLsdQmu3) 。
:::

在operator命名空间nvidia，创建一个ConfigMap。
```bash
kubectl create namespace nvidia
kubectl create -f time-slicing-config.yaml
```

### 安装NVIDIA GPU Operator
添加nvidia-gpu-operator Helm存储库。
```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update
helm repo list
```


使用NVIDIA GPU Operator启用共享GPU。
- 在启用时间切片的情况下首次安装NVIDIA GPU Operator。
  ```bash
  helm install gpu-operator nvidia/gpu-operator \
      -n nvidia \
      --set devicePlugin.config.name=time-slicing-config
  ```

- 对于已安装GPU Operator的情况下，动态启用时间切片。
  ```bash
  kubectl patch clusterpolicy/cluster-policy \
  -n nvidia --type merge \
  -p '{"spec": {"devicePlugin": {"config": {"name": "time-slicing-config"}}}}'
  ```

### 应用时间分片配置
有两种方法：
- 集群范围

通过传递时间分片ConfigMap名称和默认配置来安装GPU Operator。
  ```bash
  kubectl patch clusterpolicy/cluster-policy \
    -n nvidia --type merge \
    -p '{"spec": {"devicePlugin": {"config": {"name": "time-slicing-config", "default": "rtx-3070"}}}}'
  ```

- 在特定节点上

使用ConfigMap中所需的时间切片配置对节点进行标记。
  ```bash
  kubectl label node <node-name> nvidia.com/device-plugin.config=rtx-3070
  ```


一旦安装了GPU Operator和时间切片GPU，检查Pod的状态以确保所有容器都在运行，并且验证已完成。
```bash
kubectl get pods -n nvidia
```

```bash
NAME                                                          READY   STATUS      RESTARTS   AGE
gpu-feature-discovery-qbslx                                   2/2     Running     0          20h
gpu-operator-7bdd8bf555-7clgv                                 1/1     Running     0          20h
gpu-operator-node-feature-discovery-master-59b4b67f4f-q84zn   1/1     Running     0          20h
gpu-operator-node-feature-discovery-worker-n58dv              1/1     Running     0          20h
nvidia-container-toolkit-daemonset-8gv44                      1/1     Running     0          20h
nvidia-cuda-validator-tstpk                                   0/1     Completed   0          20h
nvidia-dcgm-exporter-pgk7v                                    1/1     Running     1          20h
nvidia-device-plugin-daemonset-w8hh4                          2/2     Running     0          20h
nvidia-device-plugin-validator-qrpxx                          0/1     Completed   0          20h
nvidia-operator-validator-htp6b                               1/1     Running     0          20h
```
验证时间分片配置是否成功应用。
```bash
kubectl describe node <node-name>
```

```bash
...
Capacity:
  nvidia.com/gpu: 8
...
Allocatable:
  nvidia.com/gpu: 8
...
```

### 测试GPU时间切片
创建一个工作负载测试文件 plugin-test.yaml。
```yaml
# plugin-test.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nvidia-plugin-test
  labels:
    app: nvidia-plugin-test
spec:
  replicas: 5
  selector:
    matchLabels:
      app: nvidia-plugin-test
  template:
    metadata:
      labels:
        app: nvidia-plugin-test
    spec:
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      containers:
        - name: dcgmproftester11
          image: nvidia/samples:dcgmproftester-2.1.7-cuda11.2.2-ubuntu20.04
          command: ["/bin/sh", "-c"]
          args:
            - while true; do /usr/bin/dcgmproftester11 --no-dcgm-validation -t 1004 -d 300; sleep 30; done
          resources:
            limits:
              nvidia.com/gpu: 1
          securityContext:
            capabilities:
              add: ["SYS_ADMIN"]
```


创建一个具有多个副本的部署。
```bash
kubectl apply -f plugin-test.yaml
```

验证所有五个副本是否正在运行。

- 在Pod群中
  ```bash
  kubectl get pods
  ```

  ```bash
  NAME                                  READY   STATUS    RESTARTS   AGE
  nvidia-plugin-test-677775d6c5-bpsvn   1/1     Running   0          8m8s
  nvidia-plugin-test-677775d6c5-m95zm   1/1     Running   0          8m8s
  nvidia-plugin-test-677775d6c5-9kgzg   1/1     Running   0          8m8s
  nvidia-plugin-test-677775d6c5-lrl2c   1/1     Running   0          8m8s
  nvidia-plugin-test-677775d6c5-9r2pz   1/1     Running   0          8m8s
  ```
- 在节点中
  ```bash
  kubectl describe node <node-name>
  ```

  ```bash
  ...
  Allocated resources:
    (Total limits may be over 100 percent, i.e., overcommitted.)
    Resource           Requests    Limits
    --------           --------    ------
    ...
    nvidia.com/gpu     5           5
  ...
  ```
- 在NVIDIA系统管理界面中
  ```bash
  nvidia-smi
  ```

  ```bash
  +-----------------------------------------------------------------------------+
  | NVIDIA-SMI 520.61.05    Driver Version: 520.61.05    CUDA Version: 11.8     |
  |-------------------------------+----------------------+----------------------+
  | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
  | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
  |                               |                      |               MIG M. |
  |===============================+======================+======================|
  |   0  NVIDIA GeForce ...  On   | 00000000:01:00.0  On |                  N/A |
  | 46%   86C    P2   214W / 220W |   4297MiB /  8192MiB |    100%      Default |
  |                               |                      |                  N/A |
  +-------------------------------+----------------------+----------------------+
                                                                                
  +-----------------------------------------------------------------------------+
  | Processes:                                                                  |
  |  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
  |        ID   ID                                                   Usage      |
  |=============================================================================|
  |    0   N/A  N/A   1776886      C   /usr/bin/dcgmproftester11         764MiB |
  |    0   N/A  N/A   1776921      C   /usr/bin/dcgmproftester11         764MiB |
  |    0   N/A  N/A   1776937      C   /usr/bin/dcgmproftester11         764MiB |
  |    0   N/A  N/A   1777068      C   /usr/bin/dcgmproftester11         764MiB |
  |    0   N/A  N/A   1777079      C   /usr/bin/dcgmproftester11         764MiB |
  +-----------------------------------------------------------------------------+
  ```

- 在Yunikorn用户界面中的应用程序中。
![](../../assets/yunikorn-gpu-time-slicing.png)