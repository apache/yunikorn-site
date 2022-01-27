---
id: scheduler_plugin
title: K8s Scheduler Plugin
---

<!--
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
-->

## Background

YuniKorn (on Kubernetes) is traditionally implemented as a ground-up implementation of a Kubernetes scheduler.
This has allowed us to innovate rapidly, but is not without its problems; we currently have numerous places
where we call into non-public K8S source code APIs with varying levels of (code) stability, requiring
sometimes very disruptive code changes when we switch to new Kubernetes releases.

Ideally, we should be able to take advantage of enhancements to new Kubernetes releases automatically.
Using the plugin model enables us to enhance the Kubernetes scheduling logic with YuniKorn features.
This also helps keep YuniKorn compatible with new Kubernetes releases with minimal effort.

Additionally, it is desirable in many cases to allow non-batch workloads to bypass the YuniKorn scheduling
functionality and use default scheduling logic. However, we have no way to do that today as the default
scheduling functionality is not present in the YuniKorn scheduler binary.

Since Kubernetes 1.19, the Kubernetes project has created a stable API for the
[Scheduling Framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/),
which allows plugins to be created which implement various extension points. Plugins implement one or more
of these extension points, and are then compiled into a scheduler binary which contains the default
scheduler and plugin code, configured to call into the plugins during normal scheduling flow.

## Design

We have added a scheduler plugin to the k8s-shim codebase which can be used to build a Kubernetes
scheduler binary that includes YuniKorn functionality as well as the default scheduler functionality,
significantly improving the compatibility of YuniKorn with upstream Kubernetes and allowing deployment of
YuniKorn as the sole scheduler in a cluster with much greater confidence.

Separate docker images are created for the scheduler. The traditional YuniKorn scheduler is built as
`scheduler-{version}` while the new plugin version is built as `scheduler-plugin-{version}`. Either can be
deployed interchangeably into a Kubernetes cluster with the same helm charts by customizing the scheduler
image to deploy.

## Entrypoints

The existing shim `main()` method has been relocated to `pkg/cmd/shim/main.go`, and a new `main()` method
under `pkg/cmd/schedulerplugin/main.go` has be created. This method instantiates the default Kubernetes
scheduler and adds YuniKorn to it as a set of plugins. It also modifies the default scheduler CLI argument
parsing to add YuniKorn-specific options. When the YuniKorn plugin is created, it will launch an instance
of the existing shim / core schedulers in the background, sync all informers, and start the normal YuniKorn
scheduling loop.

## Shim Scheduler Changes

In order to cooperate with the default scheduler, the shim needs to operate slightly differently when in
plugin mode. These differences include:

 - In `postTaskAllocated()`, we don’t actually bind the Pod or Volumes, as this is the responsibility of
   the default scheduler framework. Instead, we track the Node that YK allocated for the Node in an
   internal map, dispatch a new BindTaskEvent, and record a `QuotaApproved` event on the Pod.
 - In `postTaskBound()`, we update the Pod’s state to `QuotaApproved` as this will cause the default scheduler
   to re-evaluate the pod for scheduling (more on this below).
 - In the scheduler cache, we track pending and in-progress pod allocations, and remove them if a pod is
   removed from the cache.

## Plugin Implementation

To expose the entirety of YuniKorn functionality, we implement three of the Scheduling Framework Plugins:

### PreFilter

PreFilter plugins are passed a reference to a Pod and return either `Success` or `Unschedulable`, depending
on whether that pod should be considered for scheduling.

For the YuniKorn implementation, we first check the Pod to see if we have an associated `applicationId`
defined. If not, we immediately return `Success`, which allows us to delegate to the default scheduler for
non-batch workloads.

If an `applicationId` is present, then we determine if there is a pending pod allocation (meaning the
YuniKorn core has already decided to allocate the pod). If so, we return `Success`, otherwise `Unschedulable`.
Additionally, if an in-progress allocation is detected (indicating that we have previously attempted to
schedule this pod), we trigger a `RejectTask` event for the YuniKorn core so that the pod will be sent back
for scheduling later.

### Filter

Filter plugins are used to filter out nodes that cannot run a Pod. Only Pods which pass the PreFilter stage
are evaluated. 

For the YuniKorn plugin, we follow similar logic to PreFilter, except that we also validate that the pending
pod allocation matches the node YuniKorn chose for the pod. If the node matches, we transition the pending
allocation to an in-progress allocation. This helps ensure that we stay in sync with the default scheduler,
as it is possible that we allow an allocation to proceed but the bind fails for some reason.

### PostBind

The PostBind extension point is used informationally to notify the plugin that a pod was successfully bound.

The YuniKorn implementation uses this to clean up the outstanding in-progress pod allocations.
