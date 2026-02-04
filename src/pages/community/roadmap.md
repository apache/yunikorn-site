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

# Kubernetes version support

Supported Kubernetes versions and the Kubernetes dependency will be defined and finalised during the development cycle.
Current build dependency: 1.34

# Next Release Development

Release Details:
- Version: 1.9.0
- Target release date: May 2026
- Release manager: undecided
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-3211](https://issues.apache.org/jira/browse/YUNIKORN-3211) K8s 1.35 support
- [YUNIKORN-3117](https://issues.apache.org/jira/browse/YUNIKORN-3117) DRA GA in K8s 1.34
- [YUNIKORN-3058](https://issues.apache.org/jira/browse/YUNIKORN-3058) [UMBRELLA] Support InPlacePodVerticalScaling (phase 3)
- [YUNIKORN-3210](https://issues.apache.org/jira/browse/YUNIKORN-3210) Remove plugin code
- [YUNIKORN-3122](https://issues.apache.org/jira/browse/YUNIKORN-3122) Optimize Node Evaluation by Pre-filtering Tainted Nodes
- [YUNIKORN-3203](https://issues.apache.org/jira/browse/YUNIKORN-3203) [Umbrella] Quota change enforcement via preemption
- [YUNIKORN-3192](https://issues.apache.org/jira/browse/YUNIKORN-3192) Queue configuration management
- [YUNIKORN-3118](https://issues.apache.org/jira/browse/YUNIKORN-3118) Implement Parallel TryNode Evaluation

Minor changes and important bugs:
- [YUNIKORN-3025](https://issues.apache.org/jira/browse/YUNIKORN-3025) Support for application-level preemption
- [YUNIKORN-1727](https://issues.apache.org/jira/browse/YUNIKORN-1727) build info extension
- [YUNIKORN-3132](https://issues.apache.org/jira/browse/YUNIKORN-3132) Placeholder deployment hardening
- [multiple jiras] Web UI updates to expose

# Future development: long term goals
- [YUNIKORN-2985](https://issues.apache.org/jira/browse/YUNIKORN-2985) [Umbrella] Foreign pod preemption
- [YUNIKORN-1546](https://issues.apache.org/jira/browse/YUNIKORN-1546) [Umbrella] Allow changing queue type
- FIPS builds
