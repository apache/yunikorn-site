---
id: roadmap
title: Roadmap
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

# Future development: long term goals

- Application and task priority support
- Preemption of allocations
- User and group quota and limit enforcement
- Offer an alternative mode of deployment as plugins to the default scheduler, in addition to the current standalone mode

# Next Release Development

Release Details:
- Version: 1.1.0
- Target release date: August 2022
- Release manager: undecided
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-984](https://issues.apache.org/jira/browse/YUNIKORN-984) Enforcing User and Group limits (phase 1)
- [YUNIKORN-725](https://issues.apache.org/jira/browse/YUNIKORN-725) Support for ARM64 processors
- [YUNIKORN-1187](https://issues.apache.org/jira/browse/YUNIKORN-1187) Recovery stabilization
- [YUNIKORN-1](https://issues.apache.org/jira/browse/YUNIKORN-1) Application priority
- [YUNIKORN-1196](https://issues.apache.org/jira/browse/YUNIKORN-1196) Update K8s build dependency
- [YUNIKORN-1085](https://issues.apache.org/jira/browse/YUNIKORN-1085) DaemonSet pods may fail to be scheduled on new nodes added during autoscaling

Supported Kubernetes versions and the Kubernetes dependency will be defined and finalised during the development cycle. 
