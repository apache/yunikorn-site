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

## YuniKorn deployment mode

YuniKorn can be deployed in "standard" mode, an only way to run the scheduler as a standalone Kubernetes scheduler.

Standard mode is the only available option and set as default too. It is stable, efficient, and very
performant. It is well-suited for all YuniKorn deployments and is recommended.

It is recommended to run the admission controller as well, as this will ensure that only a single
scheduler is active within your Kubernetes cluster. In this mode, the default
Kubernetes scheduler (which is always running) will be bypassed for all pods
except YuniKorn itself.
