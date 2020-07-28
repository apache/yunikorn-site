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

## What's next

- Kubernetes 1.16/1.17 support
- Gang scheduling
- App tracking API and CRD
- Preemption phase 2
- App/task priority support
- Support spot instances for Spark scheduling
- Web UI refurbishment

## v0.9.0

In this version, the Apache YuniKorn (Incubating) community is focusing on improving the user experience, and usability
to running Apache Spark and Flink workloads. The main features delivered in this release includes:

### Resource Quota Management

This version YuniKorn provides a seamless way to manage resource quota for a Kubernetes cluster, it can work as an
alternative to the [namespace resource quota](https://kubernetes.io/docs/concepts/policy/resource-quotas/). There are
2 main advantages of using this feature comparing to the namespace resource quota:

1. The namespace resource quota is counting resources at the admission phase, irrespective of the pod is using the resources or not.
This can lead up to issues that the namespace resources could not be efficiently used.
2. The namespace resource quota is flat, it doesn't support hierarchy resource quota management.
3. The resource quota admission controller rejects the pods as long as it goes over the quota, this increases the complexity
of the client side code.

By using the resource quota management provided by YuniKorn, it is more efficient, seamlessly setup and it provides the
job queue to handle common scheduling ordering requirements.

### Job Ordering Policy: StateAware (optimized FIFO)

The `StateAware` app sorting policy orders jobs in a queue in FIFO order, and schedule them one by one on conditions.
The condition is to wait for the application enters a runnable state. This avoids the common race condition while submitting
lots of batch jobs, e.g Spark, to a single namespace (or cluster). By enforcing the certain ordering of jobs, it also improves
the scheduling of jobs to be more predictable. More explanation of this feature can be found in doc here.

### Work with the cluster-autoscaler

In this release, YuniKorn has been tested heavily to work nicely with the Kubernetes [cluster-autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler).
It brings the maximum elasticity to the Kubernetes cluster by working efficiently with the cluster-autoscaler. Some bugs
are fixed and some improvements are done in this release.

### Even cache system

In this release, an efficient even cache system is added into the scheduler. This system caches some key scheduling
events in a memory store and publishes them to Kubernetes event system when needed. More scheduling events are visible
directly from Kubernetes by using kubectl command. This helps to improve the usability and debuggability a lot.

### More comprehensive web UI

YuniKorn UI provides a better centralized view for resource management. An nodes page has been added to the UI, to display
the detailed nodes info in the cluster. The apps page has been enhanced, it now provides a search box to search apps by
queue or application ID.

## v0.8.0 (May 4, 2020)

This release ships a fully functional resource scheduler for Kubernetes with a number of useful features that empower
to run Big Data workloads on K8s. See more at [Release Notes](http://yunikorn.apache.org/docs/get_started/release_notes#release-notes-v080).

**yunikorn-scheduler-interface**

* Communication protocols between RM and scheduler-shim.
* gRPC interfaces.
* Scheduler plugin interfaces.

**yunikorn-core**

* Hierarchy queues with min/max resource quotas.
* Resource fairness between queues, users and apps.
* Cross-queue preemption based on fairness.
* Fair/Bin-packing scheduling policies.
* Placement rules (auto queue creation/mapping).
* Customized resource types (like GPU) scheduling support.
* Rich placement constraints support.
* Automatically map incoming container requests to queues by policies.
* Node partition: partition cluster to sub-clusters with dedicated quota/ACL management.
* Configuration hot-refresh.
* Stateful recovery.
* Metrics framework.

**yunikorn-k8shim**

* Support K8s predicates. Such as pod affinity/anti-affinity, node selectors.
* Support Persistent Volumes, Persistent Volume Claims, etc.
* Load scheduler configuration from configmap dynamically (hot-refresh).
* 3rd Operator/controller integration, pluggable app discovery.
* Helm chart support.

**yunikorn-web**

* Cluster overview page with brief info about the cluster.
* Read-only application view, including app info and task breakdown info.
* Read-only queue view, displaying queue structure, queue resource, usage info dynamically.
