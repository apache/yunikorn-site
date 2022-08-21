---
id: performance_tutorial
title: 基准测试教程
keywords:
 - 性能
 - 教程
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

## 概述

YuniKorn社区不断优化调度器的性能，确保YuniKorn满足大规模批处理工作负载的性能要求。 因此，社区为性能基准测试构建了一些有用的工具，可以跨版本重用。 本文档介绍了所有这些工具和运行它们的步骤。

## 硬件

请注意，性能结果因底层硬件而异。 文档中发布的所有结果只能作为参考。 我们鼓励每个人在自己的环境中运行类似的测试，以便根据您自己的硬件获得结果。 本文档仅用于演示目的。

本次测试中使用的服务器列表是（非常感谢[国立台中教育大学](http://www.ntcu.edu.tw/newweb/index.htm), [Kuan-Chou Lai](http://www.ntcu.edu.tw/kclai/) 为运行测试提供这些服务器):

| 机型                   | CPU |  内存  |   下载/上传(Mbps)       |
| --------------------- | --- | ------ | --------------------- |
| HP                    | 16  | 36G    | 525.74/509.86         |
| HP                    | 16  | 30G    | 564.84/461.82         |
| HP                    | 16  | 30G    | 431.06/511.69         |
| HP                    | 24  | 32G    | 577.31/576.21         |
| IBM blade H22         | 16  | 38G    | 432.11/4.15           |
| IBM blade H22         | 16  | 36G    | 714.84/4.14           |
| IBM blade H22         | 16  | 42G    | 458.38/4.13           |
| IBM blade H22         | 16  | 42G    | 445.42/4.13           |
| IBM blade H22         | 16  | 32G    | 400.59/4.13           |
| IBM blade H22         | 16  | 12G    | 499.87/4.13           |
| IBM blade H23         | 8   | 32G    | 468.51/4.14           |
| WS660T                | 8   | 16G    | 87.73/86.30           |
| ASUSPRO D640MB_M640SA | 4   | 8G     | 92.43/93.77           |
| PRO E500 G6_WS720T    | 16  | 8G     | 90/87.18              |
| WS E500 G6_WS720T     | 8   | 40G    | 92.61/89.78           |
| E500 G5               | 8   | 8G     | 91.34/85.84           |
| WS E500 G5_WS690T     | 12  | 16G    | 92.2/93.76            |
| WS E500 G5_WS690T     | 8   | 32G    | 91/89.41              |
| WS E900 G4_SW980T     | 80  | 512G   | 89.24/87.97           |

每个服务器都需要执行以下步骤，否则由于用户/进程/打开文件的数量有限，大规模测试可能会失败。

### 1. 设置/etc/sysctl.conf
```
kernel.pid_max=400000
fs.inotify.max_user_instances=50000
fs.inotify.max_user_watches=52094
```
### 2. 设置/etc/security/limits.conf

```
* soft nproc 4000000
* hard nproc 4000000
root soft nproc 4000000
root hard nproc 4000000
* soft nofile 50000
* hard nofile 50000
root soft nofile 50000
root hard nofile 50000
```
---

## 部署工作流

在进入细节之前，这里是我们测试中使用的一般步骤：

- [步骤 1](#Kubernetes): 正确配置Kubernetes API服务器和控制器管理器，然后添加工作节点。
- [步骤 2](#Setup-Kubemark): 部署空pod，将模拟工作节点，命名空节点。 在所有空节点都处于就绪状态后，我们需要封锁(cordon)所有本地节点，这些本地节点是集群中的物理存在，而不是模拟节点，以避免我们将测试工作负载 pod 分配给本地节点。
- [步骤 3](#Deploy-YuniKorn): 在主节点上使用Helm chart部署YuniKorn，并将 Deployment 缩减为 0 副本，并在`prometheus.yml`中 [修改端口](#Setup-Prometheus) 以匹配服务的端口。
- [步骤 4](#Run-tests): 部署50k Nginx pod进行测试，API服务器将创建它们。 但是由于YuniKorn调度程序Deployment已经被缩减到0个副本，所有的Nginx pod都将停留在等待状态。
- [步骤 5](../user_guide/trouble_shooting.md#restart-the-scheduler): 将YuniKorn部署扩展回1个副本，并封锁主节点以避免YuniKorn 在那里分配Nginx pod。 在这一步中，YuniKorn将开始收集指标。
- [步骤 6](#Collect-and-Observe-YuniKorn-metrics): 观察Prometheus UI中公开的指标。
---

## 设置 Kubemark

[Kubemark](https://github.com/kubernetes/kubernetes/tree/master/test/kubemark)是一个性能测试工具，允许用户在模拟集群上运行实验。 主要用例是可扩展性测试。 基本思想是在一个物理节点上运行数十或数百个假kubelet节点，以模拟大规模集群。 在我们的测试中，我们利用 Kubemark 在少于20个物理节点上模拟多达4K节点的集群。

### 1. 构建镜像

##### 克隆kubernetes仓库，并构建kubemark二进制文件

```
git clone https://github.com/kubernetes/kubernetes.git
```
```
cd kubernetes
```
```
KUBE_BUILD_PLATFORMS=linux/amd64 make kubemark GOFLAGS=-v GOGCFLAGS="-N -l"
```

##### 将kubemark二进制文件复制到镜像文件夹并构建kubemark docker镜像

```
cp _output/bin/kubemark cluster/images/kubemark
```
```
IMAGE_TAG=v1.XX.X make build
```
完成此步骤后，您可以获得可以模拟集群节点的kubemark镜像。 您可以将其上传到Docker-Hub或仅在本地部署。

### 2. 安装Kubermark

##### 创建kubemark命名空间

```
kubectl create ns kubemark
```

##### 创建configmap

```
kubectl create configmap node-configmap -n kubemark --from-literal=content.type="test-cluster"
```

##### 创建secret

```
kubectl create secret generic kubeconfig --type=Opaque --namespace=kubemark --from-file=kubelet.kubeconfig={kubeconfig_file_path} --from-file=kubeproxy.kubeconfig={kubeconfig_file_path}
```
### 3. 标签节点

我们需要给所有的原生节点打上标签，否则调度器可能会将空pod分配给其他模拟的空节点。 我们可以利用yaml中的节点选择器将空pod分配给本地节点。

```
kubectl label node {node name} tag=tagName
```

### 4. 部署Kubemark

hollow-node.yaml如下所示，我们可以配置一些参数。

```
apiVersion: v1
kind: ReplicationController
metadata:
  name: hollow-node
  namespace: kubemark
spec:
  replicas: 2000  # 要模拟的节点数
  selector:
      name: hollow-node
  template:
    metadata:
      labels:
        name: hollow-node
    spec:
      nodeSelector:  # 利用标签分配给本地节点
        tag: tagName  
      initContainers:
      - name: init-inotify-limit
        image: docker.io/busybox:latest
        imagePullPolicy: IfNotPresent
        command: ['sysctl', '-w', 'fs.inotify.max_user_instances=200'] # 设置为与实际节点中的max_user_instance相同
        securityContext:
          privileged: true
      volumes:
      - name: kubeconfig-volume
        secret:
          secretName: kubeconfig
      - name: logs-volume
        hostPath:
          path: /var/log
      containers:
      - name: hollow-kubelet
        image: 0yukali0/kubemark:1.20.10 # 您构建的kubemark映像 
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 4194
        - containerPort: 10250
        - containerPort: 10255
        env:
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        command:
        - /kubemark
        args:
        - --morph=kubelet
        - --name=$(NODE_NAME)
        - --kubeconfig=/kubeconfig/kubelet.kubeconfig
        - --alsologtostderr
        - --v=2
        volumeMounts:
        - name: kubeconfig-volume
          mountPath: /kubeconfig
          readOnly: true
        - name: logs-volume
          mountPath: /var/log
        resources:
          requests:    # 空pod的资源，可以修改。
            cpu: 20m
            memory: 50M
        securityContext:
          privileged: true
      - name: hollow-proxy
        image: 0yukali0/kubemark:1.20.10 # 您构建的kubemark映像 
        imagePullPolicy: IfNotPresent
        env:
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        command:
        - /kubemark
        args:
        - --morph=proxy
        - --name=$(NODE_NAME)
        - --use-real-proxier=false
        - --kubeconfig=/kubeconfig/kubeproxy.kubeconfig
        - --alsologtostderr
        - --v=2
        volumeMounts:
        - name: kubeconfig-volume
          mountPath: /kubeconfig
          readOnly: true
        - name: logs-volume
          mountPath: /var/log
        resources:  # 空pod的资源，可以修改。
          requests:
            cpu: 20m
            memory: 50M
      tolerations:
      - effect: NoExecute
        key: node.kubernetes.io/unreachable
        operator: Exists
      - effect: NoExecute
        key: node.kubernetes.io/not-ready
        operator: Exists
```

完成编辑后，将其应用于集群：

```
kubectl apply -f hollow-node.yaml
```

---

## 部署 YuniKorn

#### 使用helm安装YuniKorn

我们可以用 Helm 安装 YuniKorn，请参考这个[文档](https://yunikorn.apache.org/docs/#install)。 我们需要根据默认配置调整一些参数。 我们建议克隆[发布仓库](https://github.com/apache/yunikorn-release)并修改`value.yaml`中的参数。

```
git clone https://github.com/apache/yunikorn-release.git
cd helm-charts/yunikorn
```

#### 配置

`value.yaml`中的修改是：

- 增加调度程序 pod 的内存/cpu 资源
- 禁用 admission controller
- 将应用排序策略设置为 FAIR

请参阅以下更改：

```
resources:
  requests:
    cpu: 14
    memory: 16Gi
  limits:
    cpu: 14
    memory: 16Gi
```
```
embedAdmissionController: false
```
```
configuration: |
  partitions:
    -
      name: default
      queues:
        - name: root
          submitacl: '*'
          queues:
            -
              name: sandbox
              properties:
                application.sort.policy: fair
```

#### 使用本地版本库安装YuniKorn

```
Helm install yunikorn . --namespace yunikorn
```

---

## 设置Prometheus

YuniKorn通过Prometheus公开其调度指标。 因此，我们需要设置一个Prometheus服务器来收集这些指标。

### 1. 下载Prometheus版本

```
wget https://github.com/prometheus/prometheus/releases/download/v2.30.3/prometheus-2.30.3.linux-amd64.tar.gz
```
```
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

### 2. 配置prometheus.yml

```
global:
  scrape_interval:     3s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'yunikorn'
    scrape_interval: 1s
    metrics_path: '/ws/v1/metrics'
    static_configs:
    - targets: ['docker.for.mac.host.internal:9080'] 
    # 9080为内部端口，需要端口转发或修改9080为服务端口
```

### 3. 启动Prometheus
```
./prometheus --config.file=prometheus.yml
```

---
## 运行测试

设置环境后，您就可以运行工作负载并收集结果了。 YuniKorn社区有一些有用的工具来运行工作负载和收集指标，更多详细信息将在此处发布。

---

## 收集和观察YuniKorn指标

Prometheus 启动后，可以轻松收集 YuniKorn 指标。 这是 YuniKorn 指标的[文档](metrics.md)。 YuniKorn 跟踪一些关键调度指标，这些指标衡量一些关键调度路径的延迟。 这些指标包括：

 - **scheduling_latency_seconds:** 主调度例程的延迟，以秒为单位。
 - **app_sorting_latency_seconds**: 所有应用程序排序的延迟，以秒为单位。
 - **node_sorting_latency_seconds**: 所有节点排序的延迟，以秒为单位。
 - **queue_sorting_latency_seconds**: 所有队列排序的延迟，以秒为单位。
 - **container_allocation_attempt_total**: 尝试分配容器的总次数。 尝试状态包括 `allocated`、`rejected`、`error`、`released`。 该指标仅增加。

您可以在Prometheus UI上轻松选择和生成图形，例如：

![Prometheus Metrics List](./../assets/prometheus.png)


---

## 性能调优

### Kubernetes

默认的 K8s 设置限制了并发请求，这限制了集群的整体吞吐量。 在本节中，我们介绍了一些需要调整的参数，以提高集群的整体吞吐量。

#### kubeadm

设置pod网络掩码

```
kubeadm init --pod-network-cidr=10.244.0.0/8
```

#### CNI

修改CNI掩码和资源。

```
  net-conf.json: |
    {
      "Network": "10.244.0.0/8",
      "Backend": {
        "Type": "vxlan"
      }
    }
```
```
  resources:
    requests:
      cpu: "100m"
      memory: "200Mi"
    limits:
      cpu: "100m"
      memory: "200Mi"
```


#### Api-Server

在 Kubernetes API 服务器中，我们需要修改两个参数：`max-mutating-requests-inflight`和`max-requests-inflight`。 这两个参数代表API请求带宽。 因为我们会产生大量的Pod请求，所以我们需要增加这两个参数。修改`/etc/kubernetes/manifest/kube-apiserver.yaml`：

```
--max-mutating-requests-inflight=3000
--max-requests-inflight=3000
```

#### Controller-Manager

在Kubernetes控制器管理器中，我们需要增加三个参数的值：`node-cidr-mask-size`、`kube-api-burst` `kube-api-qps`. `kube-api-burst`和`kube-api-qps`控制服务器端请求带宽。`node-cidr-mask-size`表示节点 CIDR。 为了扩展到数千个节点，它也需要增加。


Modify `/etc/kubernetes/manifest/kube-controller-manager.yaml`:

```
--node-cidr-mask-size=21 //log2(集群中的最大pod数)
--kube-api-burst=3000
--kube-api-qps=3000
```

#### kubelet

在单个工作节点中，我们可以默认运行110个pod。 但是为了获得更高的节点资源利用率，我们需要在Kubelet启动命令中添加一些参数，然后重启它。

修改`/etc/systemd/system/kubelet.service.d/10-kubeadm.conf`中的起始参数，在起始参数后面添加`--max-Pods=300`并重启。

```
systemctl daemon-reload
systemctl restart kubelet
```

---

## 概括

借助Kubemark和Prometheus，我们可以轻松运行基准测试、收集YuniKorn指标并分析性能。 这有助于我们识别调度程序中的性能瓶颈并进一步消除它们。 YuniKorn社区未来将继续改进这些工具，并继续获得更多的性能改进。
