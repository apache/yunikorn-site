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

Apache YuniKorn是一个轻量级、通用的容器编排资源调度器，旨在在大规模、多租户和云原生环境中高效实现各种工作负载的细粒度资源共享。YuniKorn为由无状态批处理工作负载和有状态服务组成的混合工作负载提供了统一的、跨平台的调度体验。

YuniKorn目前支持K8s，并可以部署为自定义的K8s调度器。YuniKorn的架构设计还允许添加不同的Shim层，并适应不同的ResourceManager实现，包括Apache Hadoop YARN或其他系统。

## 架构

以下图表展示了YuniKorn的高级架构。

<img src={require('./../assets/architecture.png').default} />

## 组件

### Scheduler interface

[Scheduler interface](https://github.com/apache/yunikorn-scheduler-interface) 调度器接口是一个抽象层，资源管理平台（如YARN/K8s）将通过像GRPC/编程语言绑定这样的API与其通信。

### Scheduler core

调度器核心封装了所有的调度算法，它从底层资源管理平台（如YARN/K8s）收集资源，并负责容器分配请求。它会决定每个请求的最佳位置，然后将响应的分配发送给资源管理平台。调度器核心对底层平台是不可知的，所有的通信都通过[scheduler interface](https://github.com/apache/yunikorn-scheduler-interface)进行。请在[此处](../archived_design/scheduler_core_design.md)详细了解调度器核心的设计。

### Kubernetes shim

YuniKorn的Kubernetes shim负责与Kubernetes通信，它负责通过调度器接口将Kubernetes集群资源和资源请求进行翻译，并将它们发送给调度器核心。当调度器做出决策时，Kubernetes shim负责将Pod绑定到特定的节点。Kubernetes shim与调度器核心之间的所有通信都通过[scheduler interface](https://github.com/apache/yunikorn-scheduler-interface)进行。请在[此处](../archived_design/k8shim.md)详细了解Kubernetes shim的设计。