---
id: deployment_modes
title: 部署模式
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

## YuniKorn部署模式

YuniKorn有两种部署模式: `标准模式`与`插件模式`。 
在标准模式下，YuniKorn作为自定义模式运行Kubernetes调度程序。
在插件模式下，YuniKorn被实现为默认Kubernetes调度框架之上的一组插件。

在这两种情况下，建议同时运行准入控制器(admin controller)，这会确保只有一个调度程序在您的Kubernetes集群中处于活动状态。
当准入控制器运行时，所有pod将会绕过Kubernetes的默认调度器，除了YuniKorn本身的pod。

## 应该使用哪个版本？

### 标准模式(Standard)

目前的默认模式是标准模式。 标准模式提供稳定、高效、良好性能。
当pod利用YuniKorn的队列功能，此模式非常适合大多数此类部署。

### 插件模式(Plugin)

插件模式是一种新的部署模型，调度器是在默认的Kubernetes调度逻辑之上实现的，可以更好地兼容默认的Kubernetes调度器。
它非常适合混合工作负载，如传统的Kubernetes以及排队的应用程序。

插件模式目前非常新，因此还没有达到标准模式的成熟度。

要在使用 Helm 部署时激活插件模式，请将变量`enableSchedulerPlugin`设置为`true`。
