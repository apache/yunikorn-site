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

## Share resources across different users or organizations
This is usually achieved by hierarchy queues. Applications need to be properly queued in working-queues,
the ordering policy determines which application can get resources first. The policy can be various, such as simple FIFO,
or priority based. Queues can maintain the order of applications, and it can also help to define how elastic can be in
terms of the resource consumption for a team/organization.

## Resource fairness between multi-tenant
In a multi-tenant environment, a lot of users are sharing cluster resources. To avoid tenants from competing resources
and potential get starving. More fine-grained fairness needs to achieve fairness across users, as well as teams/organizations.
With consideration of weights or priorities, some more important applications can get high demand resources that stand over its share.
This is often associated with resource budget, a more fine-grained fairness mode can further improve the expense control.

## Throughput
Throughput is a key criterion to measure scheduler performance. It is critical for a large scale distributed system.
If throughput is bad, applications may waste time on waiting for scheduling, and further impact service SLAs.
When the cluster gets bigger, it also means the requirement of higher throughput. The [performance evaluation based on Kube-mark](performance/evaluate_perf_function_with_kubemark.md)
reveals some perf numbers.
