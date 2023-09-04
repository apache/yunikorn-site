---
id: prometheus_scheduler_metrics
title: Prometheus Scheduler Metrics
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

## container_allocation_attempt_total

**Metric Type**: `counter`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_container_allocation_attempt_total`

```
# HELP yunikorn_scheduler_container_allocation_attempt_total Total number of attempts to allocate containers. State of the attempt includes `allocated`, `rejected`, `error`, `released`
# TYPE yunikorn_scheduler_container_allocation_attempt_total counter
yunikorn_scheduler_container_allocation_attempt_total{state="allocated"} 0
yunikorn_scheduler_container_allocation_attempt_total{state="error"} 0
yunikorn_scheduler_container_allocation_attempt_total{state="released"} 0
```
## application_submission_total

**Metric Type**: `counter`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_application_submission_total`

```
```

## application_total

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_application_total`

```
# HELP yunikorn_scheduler_application_total Total number of applications. State of the application includes `running` and `completed`.
# TYPE yunikorn_scheduler_application_total gauge
yunikorn_scheduler_application_total{state="running"} 0
```

## node

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_node`

```
# HELP yunikorn_scheduler_node Total number of nodes. State of the node includes `active` and `failed`.
# TYPE yunikorn_scheduler_node gauge
yunikorn_scheduler_node{state="active"} 1
yunikorn_scheduler_node{state="failed"} 0
```

## scheduling_latency_milliseconds

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_scheduling_latency_milliseconds`

```
# HELP yunikorn_scheduler_scheduling_latency_milliseconds Latency of the main scheduling routine, in milliseconds.
# TYPE yunikorn_scheduler_scheduling_latency_milliseconds histogram
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="0.0001"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="0.001"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="0.01"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="0.1"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="1"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="10"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_bucket{le="+Inf"} 0
yunikorn_scheduler_scheduling_latency_milliseconds_sum 0
yunikorn_scheduler_scheduling_latency_milliseconds_count 0
```

## node_sorting_latency_milliseconds

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_node_sorting_latency_milliseconds`

```
# HELP yunikorn_scheduler_application_submission_total Total number of application submissions. State of the attempt includes `accepted` and `rejected`.
# TYPE yunikorn_scheduler_application_submission_total counter
yunikorn_scheduler_application_submission_total{result="accepted"} 6
```

## trynode_latency_milliseconds

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_trynode_latency_milliseconds`

```
# HELP yunikorn_scheduler_trynode_latency_milliseconds Latency of node condition checks for container allocations, such as placement constraints, in milliseconds.
# TYPE yunikorn_scheduler_trynode_latency_milliseconds histogram
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="0.0001"} 0
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="0.001"} 0
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="0.01"} 0
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="0.1"} 0
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="1"} 0
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="10"} 0
yunikorn_scheduler_trynode_latency_milliseconds_bucket{le="+Inf"} 0
yunikorn_scheduler_trynode_latency_milliseconds_sum 0
yunikorn_scheduler_trynode_latency_milliseconds_count 0
```

## trypreemption_latency_milliseconds

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_trypreemption_latency_milliseconds`

```
# HELP yunikorn_scheduler_trypreemption_latency_milliseconds Latency of preemption condition checks for container allocations, in milliseconds.
# TYPE yunikorn_scheduler_trypreemption_latency_milliseconds histogram
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="0.0001"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="0.001"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="0.01"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="0.1"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="1"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="10"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_bucket{le="+Inf"} 0
yunikorn_scheduler_trypreemption_latency_milliseconds_sum 0
yunikorn_scheduler_trypreemption_latency_milliseconds_count 0
```

## node_usage_total

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Subsystem**: `scheduler`

**TYPE**: `yunikorn_scheduler_<resource type>_node_usage_total`

```
# HELP yunikorn_scheduler_ephemeral_storage_node_usage_total Total resource usage of node, by resource name.
# TYPE yunikorn_scheduler_ephemeral_storage_node_usage_total gauge
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(10%, 20%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(20%,30%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(30%,40%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(40%,50%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(50%,60%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(60%,70%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(70%,80%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(80%,90%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="(90%,100%]"} 0
yunikorn_scheduler_ephemeral_storage_node_usage_total{range="[0,10%]"} 1

# HELP yunikorn_scheduler_memory_node_usage_total Total resource usage of node, by resource name.
# TYPE yunikorn_scheduler_memory_node_usage_total gauge
yunikorn_scheduler_memory_node_usage_total{range="(10%, 20%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(20%,30%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(30%,40%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(40%,50%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(50%,60%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(60%,70%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(70%,80%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(80%,90%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="(90%,100%]"} 0
yunikorn_scheduler_memory_node_usage_total{range="[0,10%]"} 1

# HELP yunikorn_scheduler_pods_node_usage_total Total resource usage of node, by resource name.
# TYPE yunikorn_scheduler_pods_node_usage_total gauge
yunikorn_scheduler_pods_node_usage_total{range="(10%, 20%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(20%,30%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(30%,40%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(40%,50%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(50%,60%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(60%,70%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(70%,80%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(80%,90%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="(90%,100%]"} 0
yunikorn_scheduler_pods_node_usage_total{range="[0,10%]"} 1

# HELP yunikorn_scheduler_vcore_node_usage_total Total resource usage of node, by resource name.
# TYPE yunikorn_scheduler_vcore_node_usage_total gauge
yunikorn_scheduler_vcore_node_usage_total{range="(10%, 20%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(20%,30%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(30%,40%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(40%,50%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(50%,60%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(60%,70%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(70%,80%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(80%,90%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="(90%,100%]"} 0
yunikorn_scheduler_vcore_node_usage_total{range="[0,10%]"} 1

```
