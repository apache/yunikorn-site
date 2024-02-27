---
id: core_features
title: Features
keywords:
 - feature
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

The main features of YuniKorn include:

## App-aware scheduling
One of the key differences of YuniKorn is that it does app-aware scheduling. The default K8s scheduler simply schedules
pod by pod without any context about user, app, or queue. However, YuniKorn recognizes users, apps, and queues, and it considers
a lot more factors, e.g resource, ordering etc, while making scheduling decisions. This gives us the possibility to use
fine-grained controls on resource quotas, resource fairness, and priorities, which are the most important requirements
for a multi-tenancy computing system.

## Hierarchy Resource Queues
Hierarchy queues provide an efficient mechanism to manage cluster resources. The hierarchy of the queues can logically
map to the structure of an organization. This gives fine-grained control over resources for different tenants. The YuniKorn
UI provides a centralised view to monitor the usage of resource queues and helps you to gain insight into how the resources are
used across different tenants. What's more, by leveraging the min/max queue capacity, it can define how elastic it can be
in terms of the resource consumption for each tenant.

## Gang Scheduling
An application can request a set of resources, i.e. a gang, to be scheduled all at once.
The gang defines all the resources the application requires to start.
During the first scheduling phase all resources requested will be reserved.
The application will only be started when all requested resources are available.

Reservation duration and application behaviour when the reservation fails are configurable.
It is even possible to create multiple gangs of different specifications for one application. 
See the [gang design](design/gang_scheduling.md) and the Gang Scheduling [user guide](user_guide/gang_scheduling.md) for more details.

## Job Ordering and Queuing
Applications can be properly queued in working-queues, the ordering policy determining which application can get resources first.
There are various policies such as simple `FIFO`, `Fair`, `StateAware`, or `Priority` based. Queues can maintain the order of applications,
and based on different policies, the scheduler allocates resources to jobs accordingly. The behavior is much more predictable.

What's more, when the queue max-capacity is configured, jobs and tasks can be properly queued up in the resource queue.
If the remaining capacity is not enough, they can be waiting in line until some resources are released. This simplifies
the client side operation. Unlike the default scheduler, resources are capped by namespace resource quotas which
are enforced by the quota-admission-controller. If the underlying namespace does not have enough quota, pods cannot be
created. Client side needs complex logic, e.g retry by condition, to handle such scenarios.

## Resource fairness
In a multi-tenant environment, a lot of users share cluster resources. To prevent tenants from competing for resources
and potentially getting starved, more fine-grained fairness controls are needed to achieve fairness across users, as well as across teams/organizations.
With consideration of weights or priorities, more important applications can demand resources beyond their share.
This feature is often considered in relation to resource budgets, where a more fine-grained fairness mode can further improve spending efficiency.

## Resource Reservation
YuniKorn automatically does reservations for outstanding requests. If a pod could not be allocated, YuniKorn will try to
reserve it on a qualified node and tentatively allocate the pod on this reserved node (before trying rest of nodes).
This mechanism can prevent the pod from being starved by future smaller, less-picky pods.
This feature is important in the batch workloads scenario because when a large amount of heterogeneous pods are submitted
to the cluster, it's very likely some pods can be starved even when they are submitted much earlier.

## Preemption
YuniKorn's preemption feature allows higher-priority tasks to dynamically reallocate resources by preempting lower-priority ones, ensuring critical workloads get necessary resources in a multi-tenant Kubernetes environment.
This proactive mechanism maintains system stability and fairness, integrating with Kubernetes' priority classes and YuniKorn's hierarchical queue system.

## Throughput
Throughput is a key criterion for measuring scheduler performance. It is critical for a large scale distributed system.
If throughput is bad, applications may waste time on waiting for scheduling and further impact service SLAs.
When the cluster gets bigger, it also means there is a requirement for higher throughput. The [performance evaluation based on Kube-mark](performance/evaluate_perf_function_with_kubemark.md)
reveals some perf numbers.

## MaxApplication Enforcement
The MaxApplication enforcement feature allows users to limit the number of running applications for a configured queue.
This feature is critical in large scale batch workloads.
Without this feature, when a large number of concurrent jobs are launched, they would compete for resources, and a certain amount of resources would be wasted, which could lead to job failure.
The [Partition and Queue Configuration](user_guide/queue_config.md) provides configuration examples.

## CPU Architecture support
YuniKorn supports running on ARM as well as on AMD/Intel CPUs.
With the release of YuniKorn 1.1.0, prebuilt convenience images for both architectures are provided in docker hub.

## Event system and application history tracking
Whenever something relevant happens inside the scheduler (eg. request is added, allocation happens in a queue, node removal, queue or user quota is exceeded, etc) an appropriate event is generated. This enables users to reliably generate usage statistics about their workloads over time. Since the event structure is well-defined, this is much more suitable for automated processing than logs. Application history (state transitions & allocations), node, queue, user and group resource usage can be examined without having to look at the logs.
The events accessible on the REST interface in two ways: batch or streaming. The batch query simply returns the list of events, while the streaming endpoint keeps the connection open and new events are immediately sent to the client.
