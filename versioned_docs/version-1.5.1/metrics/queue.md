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
Each queue has a `<queue_name> queue_app` metric to trace the applications in the queue.
`<queue_name> queue_app` metrics records the number of applications in different states.
These application states include `running`, `accepted`, `rejected`, `failed` and `completed`. 
`<queue_name> queue_app` metrics record container states including `released`, `allocated`.

Prior to `1.5.0` queue metrics were pushed to a separate subsystem for each queue. In `1.5.0` 
fixed metrics with `<queue name>` labels were introduced. Metrics using `<queue name>` subsystems 
will be **deprecated in `1.6.0` and removed in `1.7.0`** in favor of a `<queue name>` label based approach.

### Label
(Introduced in `1.5.0`)

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Label**: `queue: <queue name>`

**TYPE**: `yunikorn_queue_app`

```json
yunikorn_queue_app{queue="root.default",state="accepted"} 3
yunikorn_queue_app{queue="root.default",state="running"} 3
```

### Subsystem
|:exclamation: To be deprecated in `1.6.0` and removed in `1.7.0`|
|----------------------------------------------------------------|

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Subsystem**: `<queue name>`

**TYPE**: `yunikorn_<queue name>_queue_app`

```json
yunikorn_root_default_queue_app{state="accepted"} 3
yunikorn_root_default_queue_app{state="running"} 3
```

## Resource
The `<queue_name> queue_resource` metric to trace the resource in the queue.
These resource states include `guaranteed`, `max`, `allocated`, `pending`, `preempting`.
### Label
(Introduced in `1.5.0`)

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Label**: `queue: <queue name>`

**TYPE**: `yunikorn_queue_resource`

```json
yunikorn_queue_resource{queue="root",resource="ephemeral-storage",state="max"} 9.41009558e+10
yunikorn_queue_resource{queue="root",resource="hugepages-1Gi",state="max"} 0
yunikorn_queue_resource{queue="root",resource="hugepages-2Mi",state="max"} 0
yunikorn_queue_resource{queue="root",resource="memory",state="max"} 1.6223076352e+10
yunikorn_queue_resource{queue="root",resource="pods",state="max"} 110
yunikorn_queue_resource{queue="root",resource="vcore",state="max"} 8000
```

### Subsystem
|:exclamation: To be deprecated in `1.6.0` and removed in `1.7.0`|
|----------------------------------------------------------------|

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Subsystem**: `<queue name>`

**TYPE**: `yunikorn_<queue name>_queue_resource`

```json
yunikorn_root_queue_resource{resource="ephemeral-storage",state="max"} 9.41009558e+10
yunikorn_root_queue_resource{resource="hugepages-1Gi",state="max"} 0
yunikorn_root_queue_resource{resource="hugepages-2Mi",state="max"} 0
yunikorn_root_queue_resource{resource="memory",state="max"} 1.6223076352e+10
yunikorn_root_queue_resource{resource="pods",state="max"} 110
yunikorn_root_queue_resource{resource="vcore",state="max"} 8000
```
