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

# Next Release Development

Release Details:
- Version: 1.2.0
- Target release date: January 2023
- Release manager: undecided
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-984](https://issues.apache.org/jira/browse/YUNIKORN-984) [Umbrella] User quota tracking
- [YUNIKORN-1196](https://issues.apache.org/jira/browse/YUNIKORN-1196) Upgrade K8s build dependency
- [YUNIKORN-1275](https://issues.apache.org/jira/browse/YUNIKORN-1275) Support arbitrary resources in namespace annotation
- [YUNIKORN-1306](https://issues.apache.org/jira/browse/YUNIKORN-1306) [Umbrella] Enhanced user and group handling
- [YUNIKORN-1](https://issues.apache.org/jira/browse/YUNIKORN-1) Support app/task priority aware scheduling

Supported Kubernetes versions and the Kubernetes dependency will be defined and finalised during the development cycle.

# Future development: long term goals

- Preemption: non daemon set case(s)
- Plugin mode deployment as the default mode
- Standardised configuration of shim, core and web
- REST and Web UI: authn, authz and encryption
