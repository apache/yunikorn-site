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
With a Kubernetes dependency change planned as one of the major features for the release some info is already known.
See the announcement as part of YuniKorn 1.3 [release notes](/release-announce/1.3.0) for preliminary details.

# Next Release Development

Release Details:
- Version: 1.4.0
- Target release date: October / November 2023
- Release manager: undecided
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-1699](https://issues.apache.org/jira/browse/YUNIKORN-1699) K8s 1.27 support, includes pre-enqueue hook
- [YUNIKORN-1573](https://issues.apache.org/jira/browse/YUNIKORN-1573) [Umbrella] User & Group Based Quota Enforcement
- [YUNIKORN-1628](https://issues.apache.org/jira/browse/YUNIKORN-1628) [Umbrella] Application tracking history
- [YUNIKORN-1777](https://issues.apache.org/jira/browse/YUNIKORN-1777) [Umbrella] Recovery & startup
- [YUNIKORN-22](https://issues.apache.org/jira/browse/YUNIKORN-22)Partition support for nodes
- [YUNIKORN-1728](https://issues.apache.org/jira/browse/YUNIKORN-1728) Percentage support for queue max app and resources

- Web UI changes:
  - [no jira yet] display preemption information
  - [no jira yet] resource display rework
  - [YUNIKORN-1727](https://issues.apache.org/jira/browse/YUNIKORN-1727) build info extension
  - [YUNIKORN-1362](https://issues.apache.org/jira/browse/YUNIKORN-1362) filtering nodes in UI

# Future development: long term goals
- REST and Web UI: authn, authz and encryption
- Queue type change from leaf to parent and reverse
- moving applications from queue to queue
- compressed queue config (configmap 1MB limit)
