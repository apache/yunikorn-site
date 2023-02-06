---
id: deployment_modes
title: Deployment Modes
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

## YuniKorn deployment modes

YuniKorn can be deployed in two different modes: standard and plugin. In standard mode, YuniKorn runs as a customized
Kubernetes scheduler. In plugin mode, YuniKorn is implemented as a set of plugins on top of the default Kubernetes
scheduling framework.

In both cases, it is recommended to run the admission controller as well, as this will ensure that only a single
scheduler is active within your Kubernetes cluster. In this mode, the default Kubernetes scheduler (which is always running)
will be bypassed for all pods except YuniKorn itself.

## Which version should I use?

### Standard mode

Standard mode is currently the default. It is stable, efficient, and very performant. It is well-suited for
deployments where most if not all pods are leveraging the queueing features of YuniKorn.

### Plugin mode

Plugin mode is a new deployment model where the scheduler is implemented on top of the default Kubernetes scheduling
logic, allowing for better compatibility with the default Kubernetes scheduler. It is well-suited for mixed
workloads (traditional Kubernetes as well as queued applications).

Plugin mode is currently very new and has therefore not yet reached the maturity level of standard mode.

To activate plugin mode when deploying with Helm, set the variable `enableSchedulerPlugin` to `true`.

