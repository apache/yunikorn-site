---
id: foreign_pod_tracking
title: Tracking non-Yunikorn pods
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

## Introduction

Currently, we only know about pods in the scheduler core which have been scheduled by Yunikorn. Resource calculation which decides whether a pod fits a node or not depends on a field called `occupiedResources`. This is first calculated in the shim then sent to the core.

This is not ideal for a couple of reasons:
1. Pod count is not maintained
2. The state dump and UI only contain Yunikorn pods
3. The occupied field is not relevant inside the shim, only in the core

If we have issues regarding available resources, it’s very difficult to figure out what happened. With adequate logging and proper pod tracking, troubleshooting is easier.

## Proposed changes

### K8s shim

**High level overview**

In the shim, we stop tracking the total amount of resources occupied by non-Yunikorn pods
(aka. "occupied resources"). Instead, whenever a new foreign pod is allocated or deleted, we
forward this information to the scheduler core. 
The allocations not scheduled by YuniKorn will be accounted for on the node but not as part
of a queue or application. Allocations will be marked by the shim as scheduled by a different
scheduler by adding a new entry to the `AllocationTags` map inside the `si.Allocation` type.

**State initialization**

Registering existing pods got significantly simpler after YUNIKORN-2180 and YUNIKORN-2779.
`NodeInfo.ExistingAllocations` no longer exists.

No change is needed. Pods that are already assigned to a node are registered via the
`Context.AddPod()` callback method. When Yunikorn is initializing the state, existing pods are
seen as new ones. From the perspective of the shim, it doesn’t matter if it got created after
the startup or it had already existed before.

**Node updates**

Current: we examine the old and new available resources based on the `Node.NodeStatus.Allocatable` field.
If they are different, we update the scheduler cache with `SchedulerCache.UpdateCapacity()` and send the
new value to the core.

Proposed change: we continue to send NodeInfo events, but we will stop using the `OccupiedResource` field.

**Foreign pod node assignment**

Current: the shim calculates the occupied resources for the given node. This happens in the
`Context.updateNodeOccupiedResources()` method. First, the scheduler cache is updated with
`SchedulerCache.UpdateOccupiedResource()`. Then we send the new available amount to the core
with `SchedulerAPI.UpdateNode()` which also sends a `NodeInfo` event.

Proposed change: instead of tracking just the resources occupied by all pods not scheduled
via YuniKorn on a node, send all pods to the core as allocations.

**Foreign pod deletion**

Current: same as the update case.

Proposed change: send an `AllocationReleasesRequest` (embedded in a `AllocationRequest`) to the core.

**Preemption considerations**

If we want to support preemption of foreign pods, we also have to know if it is a static pod. A
static pod is managed directly by the kubelet and cannot be controlled from the API server.
Therefore they cannot become preemption targets.
The owner reference of a static pod is "Node". When an allocation is added, this has to be
indicated explicitly in the SI object. The `si.Allocation` type has an `AllocationTags` map
which stores metadata about the pod. In the helper function `CreateTagsForTask()`, the
owner reference is checked if this is a static pod, then an appropriate entry to the tags is
added.

**Overview of code changes**
- Delete `Context.updateNodeOccupiedResources()`
- `Context.updateForeignPod()` - remove reference to
`ctx.updateNodeOccupiedResources()` and unify it with `Context.updateYunikornPod()`
- `Context.deleteForeignPod()` - remove reference to
`ctx.updateNodeOccupiedResources()` and
unify it with `Context.deleteYunikornPod()`
- Delete `SchedulerCache.UpdateCapacity()`,
`SchedulerCache.UpdateOccupiedResource()` and the related fields: `nodeOccupied`,
`nodeCapacity`
- `Context.updateNodeInternal()` - remove call to `schedulerCache.UpdateCapacity()`

### Scheduler interface

**Node object**

The following type is sent to the core when a node update occurs:
```
type NodeInfo struct {
  NodeID               string
  Action               NodeInfo_ActionFromRM
  Attributes           map[string]string
  SchedulableResource *Resource
  OccupiedResource    *Resource
}
```

`SchedulableResource` represents the capacity of the node, while `OccupiedResource` tells
how much is available for pods.

Proposal: remove the `OccupiedResource` field because it won’t be used anymore.

**Event system**

With the introduction of tracking all pods in the cluster, now we can generate events about
each individual allocations. Events for Yunikorn pods already exist: `APP_ALLOC` application
event and `NODE_ALLOC` node event. We won’t use the `APP_ALLOC` because we can’t tie the
non-Yunikorn allocation to an existing application.
Proposal: still generate `NODE_OCCUPIED` in the next release (Yunkorn 1.7), but announce the
deprecation of this event. It will be removed in Yunikorn 1.8.
We will also generate `NODE_ALLOC` for non-Yunikorn allocations, marking it foreign in the
"message" field.

|Event type|Event ID|State|When is it generated|
|--|--|--|--|
|Node|NODE_OCCUPIED|Existing - to be removed in 1.8|Occupied resource changes on a node|
|Node|NODE_ALLOC|Already exists for Yunikorn allocations|Allocation (node assignment) occurs|

**Constants**

One constans will be introduced as a key for application tags. All pods scheduled by a
different scheduler than YuniKorn will have the tag `foreign`.
Values for the foreign tag are:
- `static`: indicates a static pod, hard skip for preemption
- `default`: preemptable pod

### Scheduler core

**Scheduling context**

Processing updates happens in `ClusterContext.updateNode()`. There is a branch for
`NodeInfo_UPDATE`:

```
case si.NodeInfo_UPDATE:
  if sr := nodeInfo.SchedulableResource; sr != nil {
    partition.updatePartitionResource(node.SetCapacity(resources.NewResourceFromProto(sr)))
  }

  if or := nodeInfo.OccupiedResource; or != nil {
    node.SetOccupiedResource(resources.NewResourceFromProto(or))
  }
```

Proposed changes: remove the path `or != nil`, because that field won’t be used.

**Allocation object**

The `objects.Allocations` type needs to be extended. The scheduler core needs to know if
the allocation was scheduled by Yunikorn or not and if we want to support preemption, we
have to mark allocations which represent static pods. These will be determined from the
allocation tags explained in the K8s shim part.

Two flags (boolean) to be added to the objects.Allocations that can only be set on
creation. The flags can be read but never modified.

**Partition**

After YUNIKORN-2457, adding foreign allocations became much simpler. Some minor
changes inside `PartitionContext.UpdateAllocation()` are necessary to ignore the
application lookup for foreign pods.

We might track foreign pods as part of an application in the future but that is out of scope of
this change.


**REST Interface**

The way how allocations are counted gives the user more detailed information about the
resource usage of all pods. Now we can show individual foreign allocations, not just a single
counter.

In Yunikorn 1.7, the data in the REST output will not change. We can still calculate
OccupiedResources information per node. We also announce that AllocatedResources is
about to change, because the value will be based on all pods on the node.

From Yunikorn 1.8 onwards, we remove OccupiedResources and update the calculation of
`AllocatedResources`.

To support easier integration with the web UI, a separate list will be maintained for the two
types of allocations. Allocations made by Yunikorn are still available under `allocations`.
Non-Yunikorn allocations will be listed under `foreign_allocations`.


The foreign allocation will have a separate, lightweight DAO object with the following
information, following the existing `AllocationDAOInfo`:
- allocation key (pod UID): `AllocationKey`
- assigned node: `NodeID`
- priority: `Priority`
- resources: `ResourcePerAlloc`
- creation time: `RequestTime`
- tags: `AllocationTags`

The allocations will be available from two URLs:
- `/ws/v1/partition/<partition>/nodes`
- `/ws/v1/fullstatedump`

## Web UI integration

There are no changes planned for the web UI as part of this design. The REST information
for a node will not change and the web UI will keep working with the changes in place.
When the REST API specification is finalised the node page in the web UI will need to be
updated to allow the display of the new details.

## Testing

### Core side

**Smoke tests with MockScheduler**

Write a new test with the following steps:
- Creates a new partition context
- Registers a node
- Send a SI request which represents a foreign allocation
- Verify the following:
  - `Node.OccupiedResources` has changed
  - `Node.AvailableResources` has changed
  - `Node.AllocatedResources` is zero
  - Node object contains a new allocation
- Remove the foreign allocation
- Verify the following:
  - `Node.OccupiedResources` is zero
  - `Node.AvailableResources` is back to the original capacity
  - `Node.AllocatedResources` is zero
  - Node object does not contain any allocation

**Unit tests**

Changes are expected in the following methods - go for a 100% coverage wherever
possible:
- Context.processAllocations()
  - no notification is sent towards the shim if it is a foreign allocation
- Partition.UpdateAllocation()
  - foreign / non-foreign allocation
- NewAllocationFromSI()
  - new foreign allocation object where tag foreign = true and static =
true/false
- Node.addAllocationInternal()
- Node.RemoveAllocation()

### K8Shim side

**Smoke tests with MockScheduler**

Create a new test with the following steps:
- Creates a new `MockScheduler` instance
- Registers a node with some existing foreign allocations
- Starts the mock scheduler
- Verify that:
  - Existing allocations are properly registered to the node
  - Create a pod which with `PodSpec.SchedulerName` being empty
  -Send the pod to the mock scheduler and wait until it’s processed by the core
- Verify that:
  - `Node.OccupiedResources` has changed
  - `Node.AvailableResources` has changed
  - `Node.AllocatedResources` is zero
  - Node object contains a new allocation
- Remove the pod from the mock scheduler
- Verify that:
  - `Node.OccupiedResources` is zero
  - `Node.AvailableResources` is back to the original capacity
  - `Node.AllocatedResources` is zero
  - Node object does not contain any allocation

**Unit tests**

Changes are expected in the following methods - go for a 100% coverage wherever
possible:
- `Context.updateForeignPod()` and `Context.updateYunikornPod()`
  - These will be merged, make sure new method has coverage for both
Yunikorn and foreign pods
- `CreateTagsForTask()`
  - Determining whether pod is static or not
- `Context.deleteForeignPod()` and `Context.deleteYunikornPod()`
  - These will be merged, make sure new method has coverage for both
Yunikorn and foreign pods
- `CreateAllocationForForeignPod()`
  - New helper method to build an `AllocationRequest`

### E2E tests

Assumption: no change should be needed for existing tests.

Write a new test case with the following behavior:
- Create a new pod with `PodSpec.SchedulerName` being empty
- Wait until it gets scheduled by the default scheduler
- Perform a REST query to Yunikorn
- Retrieve output from the endpoint `/ws/v1/partition/default/nodes`
- Verify that:
  - It has allocations and `foreign_allocations` entries
  - Foreign pod is listed under `foreign_allocations`

## Summary

|Event|Curent|New|Notes|
|--|--|--|--|
|Yunikorn pod updated (node assignment)|Update scheduler cache|Update scheduler cache|Existing shim behavior doesn’t change (allocation is already in the core)|
|Yunikorn pod updated (resource usage)|Update scheduler cache|1. Update scheduler cache<br/>2. Send AllocationRequest|YUNIKORN-1765 will implement this for both YuniKorn and foreign pods|
|Yunikorn pod deleted|1. Remove pod from scheduler cache<br/>2. Notify core|1. Remove pod from scheduler cache<br/>2. Notify core|Existing shim behavior doesn’t change|
|Foreign pod updated (node assignment)|1. Update scheduler cache<br/>2. Send NodeInfo with new OccupiedResources|Send AllocationRequest||
|Foreign pod updated (resource usage)|Update scheduler cache|1. Update scheduler cache<br/>2. Send AllocationRequest|YUNIKORN-1765 will implement this for both YuniKorn and foreign pods|
|Foreign pod deleted|1. Update scheduler cache<br/>2. Send NodeInfo with new OccupiedResources|Send AllocationReleasesRequest||
|Node capacity updated|1. Update scheduler cache<br/>2. Send NodeInfo with new OccupiedResources|1. Update scheduler cache<br/>2. Send NodeInfo||
