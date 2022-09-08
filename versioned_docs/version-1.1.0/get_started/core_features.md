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
One of the key differences of YuniKorn is, it does app-aware scheduling. In default K8s scheduler, it simply schedules
pod by pod, without any context about user, app, queue. However, YuniKorn recognizes users, apps, queues, and it considers
a lot more factors, e.g resource, ordering etc, while making scheduling decisions. This gives us the possibility to do
fine-grained controls on resource quotas, resource fairness and priorities, which are the most important requirements
for a multi-tenancy computing system.

## Hierarchy Resource Queues

Hierarchy queues provide an efficient mechanism to manage cluster resources. The hierarchy of the queues can logically
map to the structure of an organization. This gives fine-grained control over resources for different tenants. The YuniKorn
UI provides a centralised view to monitor the usage of resource queues, it helps you to get the insight how the resources are
used across different tenants. What's more, By leveraging the min/max queue capacity, it can define how elastic it can be
in terms of the resource consumption for each tenant.

## Job Ordering and Queuing
Applications can be properly queued in working-queues, the ordering policy determines which application can get resources first.
The policy can be various, such as simple `FIFO`, `Fair`, `StateAware` or `Priority` based. Queues can maintain the order of applications,
and based on different policies, the scheduler allocates resources to jobs accordingly. The behavior is much more predictable.

What's more, when the queue max-capacity is configured, jobs and tasks can be properly queued up in the resource queue.
If the remaining capacity is not enough, they can be waiting in line until some resources are released. This simplifies
the client side operation. Unlike the default scheduler, resources are capped by namespace resource quotas,
and that is enforced by the quota-admission-controller, if the underneath namespace has no enough quota, pods cannot be
created. Client side needs complex logic, e.g retry by condition, to handle such scenarios.

## Resource fairness
In a multi-tenant environment, a lot of users are sharing cluster resources. To avoid tenants from competing resources
and potential get starving. More fine-grained fairness needs to achieve fairness across users, as well as teams/organizations.
With consideration of weights or priorities, some more important applications can get high demand resources that stand over its share.
This is often associated with resource budget, a more fine-grained fairness mode can further improve the expense control.

## Resource Reservation

YuniKorn automatically does reservations for outstanding requests. If a pod could not be allocated, YuniKorn will try to
reserve it on a qualified node and tentatively allocate the pod on this reserved node (before trying rest of nodes).
This mechanism can avoid this pod gets starved by later submitted smaller, less-picky pods.
This feature is important in the batch workloads scenario because when a large amount of heterogeneous pods is submitted
to the cluster, it's very likely some pods can be starved even they are submitted much earlier. 

## Throughput
Throughput is a key criterion to measure scheduler performance. It is critical for a large scale distributed system.
If throughput is bad, applications may waste time on waiting for scheduling, and further impact service SLAs.
When the cluster gets bigger, it also means the requirement of higher throughput. The [performance evaluation based on Kube-mark](performance/evaluate_perf_function_with_kubemark.md)
reveals some perf numbers.
