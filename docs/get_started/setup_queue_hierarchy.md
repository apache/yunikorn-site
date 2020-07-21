---
id: setup_queue_hierarchy
title: Set Queue Hierarchy
keywords:
 - queue
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

YuniKorn manages resources by leveraging resource queues. The resource queue has the following characters:
- queues can have *hierarchical* structure
- each queue can be preset with *min/max capacity* where min-capacity defines the guaranteed resource and the max-capacity defines the resource limit (aka resource quota)
- tasks must be running under a certain leaf queue
- queues can be *static* (loading from configuration file) or *dynamical* (internally managed by YuniKorn)
- queue level resource fairness is enforced by the scheduler
- a job can only run under a specific queue

:::info
The difference between YuniKorn queue and [Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/):
Kubernetes namespace provides the scope for the Kubernetes resources, including the security context (i.e who can access the objects), and resource
boundary when [resource quota](https://kubernetes.io/docs/concepts/policy/resource-quotas/) is defined (i.e how many resources can be used by the objects).
On the other hand, YuniKorn queue is only used how many resources can be used by a group of jobs, and in which order. It provides
a more fine-grained control on resource sharing across multiple tenants with considering of resource fairness, job ordering, etc. In most of the cases,
YuniKorn queue can be used to replace the namespace resource quota, in order to provide more scheduling features.
:::
 
