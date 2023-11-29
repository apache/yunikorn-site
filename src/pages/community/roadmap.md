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
Current build dependency: 1.27

# Next Release Development

Release Details:
- Version: 1.5.0
- Target release date: February / March 2024
- Release manager: undecided
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-970](https://issues.apache.org/jira/browse/YUNIKORN-970) Change queue metrics to labeled
- [YUNIKORN-1544](https://issues.apache.org/jira/browse/YUNIKORN-1544) User and group quota enforcement - Phase 2
- [YUNIKORN-2099](https://issues.apache.org/jira/browse/YUNIKORN-2099) [Umbrella] K8shim simplification
- [YUNIKORN-2115](https://issues.apache.org/jira/browse/YUNIKORN-2125) [Umbrella] Application tracking history - Phase 2
- [YUNIKORN-1362](https://issues.apache.org/jira/browse/YUNIKORN-1362) filtering nodes in UI
- [YUNIKORN-1727](https://issues.apache.org/jira/browse/YUNIKORN-1727) build info extension
- [YUNIKORN-1922](https://issues.apache.org/jira/browse/YUNIKORN-1922) display pending resources in web UI
- [YUNIKORN-2140](https://issues.apache.org/jira/browse/YUNIKORN-2140) Web UI: resource display rework
- [no jira yet] display preemption info in web UI


# Future development: long term goals
- [YUNIKORN-22](https://issues.apache.org/jira/browse/YUNIKORN-22) Partition support for nodes
- [YUNIKORN-1728](https://issues.apache.org/jira/browse/YUNIKORN-1728) Percentage support for queue max app and resources
- Queue type change from leaf to parent and reverse
- moving applications from queue to queue
- compressed queue config (configmap 1MB limit)
- reproducible builds
- FIPS builds
