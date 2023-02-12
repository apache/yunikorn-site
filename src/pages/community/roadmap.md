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
- Version: 1.3.0
- Target release date: May 2023
- Release manager: undecided
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-1461](https://issues.apache.org/jira/browse/YUNIKORN-1461) [Umbrella] Preemption support
- [YUNIKORN-1562](https://issues.apache.org/jira/browse/YUNIKORN-1562) plugin mode: remove status update completely
- [YUNIKORN-1548](https://issues.apache.org/jira/browse/YUNIKORN-1548) [Umbrella] Revamp E2E test - Phase 2
- [YUNIKORN-1544](https://issues.apache.org/jira/browse/YUNIKORN-1544) [Umbrella] User quota tracking - Phase 2
- [YUNIKORN-1573](https://issues.apache.org/jira/browse/YUNIKORN-1573) [Umbrella] User & Group Based Quota Enforcement

Supported Kubernetes versions and the Kubernetes dependency will be defined and finalised during the development cycle.

# Future development: long term goals

- Preemption: non daemon set case(s)
- Plugin mode deployment as the default mode
- Standardised configuration of shim, core and web
- REST and Web UI: authn, authz and encryption
