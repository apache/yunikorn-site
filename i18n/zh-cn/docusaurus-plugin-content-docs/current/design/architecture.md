---
id: architecture
title: 架构
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

Apache YuniKorn (Incubating) 是一个用于容器编排器系统的轻量级通用资源调度器。
它创建的目标是为了在大规模、多租户和云原生的环境中高效地实现各种工作负载的细粒度资源调度以及共享。
YuniKorn为无状态批处理和有状态服务组成的混合工作负载带来了统一的、跨平台的调度体验。

YuniKorn现在支持K8s并可以作为自定义K8s调度程序部署。
YuniKorn的架构设计还允许添加不同的 shim（中介）层，并采用不同的ResourceManager实现，包括 Apache Hadoop YARN 或任何的其他系统。

## 架构

下图说明了YuniKorn的系统架构。

<img src={require('./../assets/architecture.png').default} />

## 组件

### 调度器接口

[调度器接口](https://github.com/apache/incubator-yunikorn-scheduler-interface) 是一个抽象层。资源管理平台（如YARN/K8s）将通过GRPC/编程语言绑定等API与之对话。

### 调度器核心

调度器核心封装了所有的调度算法，它从底层的资源管理平台（如YARN/K8s）收集资源，并负责容器分配请求。
它决定每个请求的最佳位置，然后将响应分配发送到资源管理平台。
调度器核心对底层平台是不可知的，所有的通信都是通过 [调度器接口](https://github.com/apache/incubator-yunikorn-scheduler-interface)。
请阅读更多有关调度器核心的设计内容 [链接](scheduler_core_design.md)。

### Kubernetes shim

YuniKorn Kubernetes shim负责与Kubernetes交互，它负责翻译Kubernetes集群的资源请求信息，并通过调度器接口将资源请求发送到调度器核心。
当调度器做出决策时，它负责将pod绑定到特定节点。
shim和调度器核心之间的所有通信都是通过 [调度器接口](https://github.com/apache/incubator-yunikorn-scheduler-interface) 进行的。
请阅读更多关于Kubernetes shim的设计内容 [链接](k8shim.md)。
