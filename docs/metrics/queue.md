---
id: queue
title: Queue
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

## Application

The `yunikorn_queue_app` metric, introduced in version `1.5.0`, tracks the number of applications and their container states in each queue using labels.

### Metric details

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Labels**:
- `queue`: the name of the queue (e.g., "root.default")
- `state`: the state of the application or container
  - **Application states**: `accepted`, `running`, `rejected`, `failed`, `completed`
  - **Container states**: `allocated`, `released`

**TYPE**: `yunikorn_queue_app`

```json
yunikorn_queue_app{queue="root.default",state="accepted"} 3
yunikorn_queue_app{queue="root.default",state="running"} 3
```

## Resource
The `yunikorn_queue_resource` metric, introduced in version `1.5.0`, tracks the resource states in each queue using labels.

### Metric details

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Labels**:
- `queue`: the name of the queue (e.g., "root")
- `state`: the resource states include `guaranteed`, `max`, `allocated`, `pending`, `preempting`
- `resource`: the type of resource (e.g., `ephemeral-storage`, `memory`, `vcore`, `pods`, `hugepages-1Gi`, `hugepages-2Mi`)

**TYPE**: `yunikorn_queue_resource`

```json
yunikorn_queue_resource{queue="root",resource="ephemeral-storage",state="max"} 9.41009558e+10
yunikorn_queue_resource{queue="root",resource="hugepages-1Gi",state="max"} 0
yunikorn_queue_resource{queue="root",resource="hugepages-2Mi",state="max"} 0
yunikorn_queue_resource{queue="root",resource="memory",state="max"} 1.6223076352e+10
yunikorn_queue_resource{queue="root",resource="pods",state="max"} 110
yunikorn_queue_resource{queue="root",resource="vcore",state="max"} 8000
```
