---
id: architecture
title: Architecture
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

Apache YuniKorn (Incubating) is a light-weight, universal resource scheduler for container orchestrator systems.
It is created to achieve fine-grained resource sharing for various workloads efficiently on a large scale, multi-tenant,
and cloud-native environment. YuniKorn brings a unified, cross-platform, scheduling experience for mixed workloads that
consist of stateless batch workloads and stateful services.

YuniKorn now supports K8s and can be deployed as a custom K8s scheduler. YuniKorn's architecture design also allows
adding different shim layer and adopt to different ResourceManager implementation including Apache Hadoop YARN,
or any other systems.

## Architecture

Following chart illustrates the high-level architecture of YuniKorn.

<img src={require('./../assets/architecture.png').default} />
![](./../assets/architecture.png)
## Components

### Scheduler interface

[Scheduler interface](https://github.com/apache/incubator-yunikorn-scheduler-interface) is an abstract layer
which resource management platform (like YARN/K8s) will speak with, via API like GRPC/programing language bindings.

### Scheduler core

Scheduler core encapsulates all scheduling algorithms, it collects resources from underneath resource management
platforms (like YARN/K8s), and is responsible for container allocation requests. It makes the decision where is the
best spot for each request and then sends response allocations to the resource management platform.
Scheduler core is agnostic about underneath platforms, all the communications are through the [scheduler interface](https://github.com/apache/incubator-yunikorn-scheduler-interface).
Please read more about the design of schedule core [here](scheduler_core_design.md).

### Kubernetes shim

The YuniKorn Kubernetes shim is responsible for talking to Kubernetes, it is responsible for translating the Kubernetes
cluster resources, and resource requests via scheduler interface and send them to the scheduler core.
And when a scheduler decision is made, it is responsible for binding the pod to the specific node. All the communication
between the shim and the scheduler core is through the [scheduler interface](https://github.com/apache/incubator-yunikorn-scheduler-interface).
Please read more about the design of the Kubernetes shim [here](k8shim.md)

