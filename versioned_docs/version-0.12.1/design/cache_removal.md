---
id: cache_removal
title: Scheduler cache removal design
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 -->

# Proposal to combine Cache and Scheduler's implementation in the core
This document describes the current state of the scheduler and cache implementation.
It describes the changes planned based on the analysis that was done of the current behaviour.

## Goals
The goal is to provide the same functionality before and after the change.
- unit tests before and after the merge must all pass.
- Smoke tests defined in the core should all pass without major changes <sup id="s1">[definition](#f1)</sup>.
- End-to-end tests that are part of the shim code must all pass without changes.

## Background 
The current Scheduler Core is build up around two major components to store the data: the cache and scheduler objects.
The cache objects form the base for most data to be tracked. 
The Scheduler objects track specific in flight details and are build on top of a cache object.
 
The communication between the two layers uses a-synchronous events and in some cases direct updates.
A synchronous update between the scheduler and the cache does mean that there is a short period the scheduler is "out of sync" with the cache.
This short period can have an impact on the scheduling decisions. 
One of which is logged as [YUNIKORN-169](https://issues.apache.org/jira/browse/YUNIKORN-169).

A further point is the complexity that the two structure brings to the code.
A distinct set of messages to communicate between the scheduler and the cache.
A one on one mapping between the scheduler and cache objects shows that the distinction is probably more artificial than required.
---
<b id="f1"></b>definition: Major changes for smoke tests are defined as changes to the tests that alter use case and thus test flows. Some changes will be needed as checks made could rely on cache objects which have been removed. [↩](#s1)
## Structure analysis
### Objects
The existing objects as per the code analysis.
The overlap between the scheduler and the cache objects is shown by showing them at the same line.
N/A means that there is no equivalent object in either the scheduler or cache.

| Cache Object                   | Scheduler Object               |
| ------------------------------ | ------------------------------ |
| ClusterInfo                    | ClusterSchedulingContext       |
| PartitionInfo                  | partitionSchedulingContext     |
| AllocationInfo                 | schedulingAllocation           |
| N/A                            | schedulingAllocationAsk        |
| N/A                            | reservation                    |
| ApplicationInfo                | SchedulingApplication          |
| applicationState               | N/A                            |
| NodeInfo                       | SchedulingNode                 |
| QueueInfo                      | SchedulingQueue                |
| SchedulingObjectState          | N/A                            |

The `initializer` code that is part of the cache does not define a specific object.
It contains a mixture of code defined at the package level and code that is part of the `ClusterInfo` object.

### Events
Events defined in the core have multiple origins and destinations.
Some events are only internal for the core between the cache and scheduler.
These events will be removed.

| Event                                     | Flow                  | Proposal |
| ----------------------------------------- | --------------------- | -------- |
| AllocationProposalBundleEvent             | Scheduler -> Cache    | Remove   |
| RejectedNewApplicationEvent               | Scheduler -> Cache    | Remove   |
| ReleaseAllocationsEvent                   | Scheduler -> Cache    | Remove   |
| RemoveRMPartitionsEvent                   | Scheduler -> Cache    | Remove   |
| RemovedApplicationEvent                   | Scheduler -> Cache    | Remove   |
| SchedulerNodeEvent                        | Cache -> Scheduler    | Remove   |
| SchedulerAllocationUpdatesEvent           | Cache -> Scheduler    | Remove   |
| SchedulerApplicationsUpdateEvent          | Cache -> Scheduler    | Remove   |
| SchedulerUpdatePartitionsConfigEvent      | Cache -> Scheduler    | Remove   |
| SchedulerDeletePartitionsConfigEvent      | Cache -> Scheduler    | Remove   |
| RMApplicationUpdateEvent (add/remove app) | Cache/Scheduler -> RM | Modify   |
| RMRejectedAllocationAskEvent              | Cache/Scheduler -> RM | Modify   |
| RemoveRMPartitionsEvent                   | RM -> Scheduler       |          |
| RMUpdateRequestEvent                      | RM -> Cache           | Modify   |
| RegisterRMEvent                           | RM -> Cache           | Modify   |
| ConfigUpdateRMEvent                       | RM -> Cache           | Modify   |
| RMNewAllocationsEvent                     | Cache -> RM           | Modify   |
| RMReleaseAllocationEvent                  | Cache -> RM           | Modify   |
| RMNodeUpdateEvent                         | Cache -> RM           | Modify   |
|                                           |                       |          |

Events that are handled by the cache will need to be handled by the core code after the removal of the cache.
Two events are handled by the cache and the scheduler.

## Detailed flow analysis
### Object existing in both cache and scheduler
The current design is based on the fact that the cache object is the basis for all data storage.
Each cache object must have a corresponding scheduler object.
The contract in the core around the cache and scheduler objects was simple.
If the object exists in both scheduler and cache the object will be added to cache triggering the creation of the corresponding scheduler object.
Removing the object is always handled in reverse: first from the scheduler which will trigger the removal from the cache.
An example would be the creation of an application triggered by the `RMUpdateRequestEvent` would be processed by the cache.
Creating a `SchedulerApplicationsUpdateEvent` to create the corresponding application in the scheduler.

When the application and object state were added they were added into the cache objects.
The cache objects were considered the data store and thus also contain the state.
There were no corresponding state objects in the scheduler.
Maintaining two states for the same object is not possible. 

The other exceptions to that rule are two objects that were considered volatile and scheduler only.
The `schedulingAllocationAsk` tracks outstanding requests for an application in the scheduler.
The `reservation` tracks a temporary reservation of a node for an application and ask combination. 

### Operations to add/remove app
The RM (shim) sends a complex `UpdateRequest` as defined in the scheduler interface.
This message is wrapped by the RM proxy and forwarded to the cache for processing.
The RM can request an application to be added or removed.

**application add or delete**
```
1. RMProxy sends cacheevent.RMUpdateRequestEvent to cache
2. cluster_info.processApplicationUpdateFromRMUpdate
   2.1: Add new apps to the partition.
   2.2: Send removed apps to scheduler (but not remove anything from cache)
3. scheduler.processApplicationUpdateEvent
   3.1: Add new apps to scheduler 
        (when fails, send RejectedNewApplicationEvent to cache)
        No matter if failed or not, send RMApplicationUpdateEvent to RM.
   3.2: Remove app from scheduler
        Send RemovedApplicationEvent to cache
```

### Operations to remove allocations and add or remove asks
The RM (shim) sends a complex `UpdateRequest` as defined in the scheduler interface.
This message is wrapped by the RM proxy and forwarded to the cache for processing.
The RM can request an allocation to be removed.
The RM can request an ask to be added or removed

**allocation delete**
This describes the allocation delete initiated by the RM only
````
1. RMProxy sends cacheevent.RMUpdateRequestEvent to cache
2. cluster_info.processNewAndReleaseAllocationRequests
   2.1: (by-pass): Send to scheduler via event SchedulerAllocationUpdatesEvent
3. scheduler.processAllocationUpdateEvent 
   3.1: Update ReconcilePlugin
   3.2: Send confirmation of the releases back to Cache via event ReleaseAllocationsEvent
4. cluster_info.processAllocationReleases to process the confirmed release
````

**ask add**
If the ask already exists this add is automatically converted into an update.
```
1. RMProxy sends cacheevent.RMUpdateRequestEvent to cache
2. cluster_info.processNewAndReleaseAllocationRequests
   2.1: Ask sanity check (such as existence of partition/app), rejections are send back to the RM via RMRejectedAllocationAskEvent
   2.2: pass checked asks to scheduler via SchedulerAllocationUpdatesEvent
3. scheduler.processAllocationUpdateEvent
   3.1: Update scheduling application with the new or updated ask. 
   3.2: rejections are send back to the RM via RMRejectedAllocationAskEvent 
   3.3: accepted asks are not confirmed to RM or cache
```

**ask delete**
```
1. RMProxy sends cacheevent.RMUpdateRequestEvent to cache
2. cluster_info.processNewAndReleaseAllocationRequests
   2.1: (by-pass): Send to scheduler via event SchedulerAllocationUpdatesEvent
3. scheduler.processAllocationReleaseByAllocationKey
   3.1: Update scheduling application and remove the ask. 
```

### Operations to add, update or remove nodes
The RM (shim) sends a complex `UpdateRequest` as defined in the scheduler interface.
This message is wrapped by the RM proxy and forwarded to the cache for processing.
The RM can request a node to be added, updated or removed.

**node add** 
```
1. RMProxy sends cacheevent.RMUpdateRequestEvent to cache
2. cluster_info.processNewSchedulableNodes
   2.1: node sanity check (such as existence of partition/node)
   2.2: Add new nodes to the partition.
   2.3: notify scheduler of new node via SchedulerNodeEvent
3. notify RM of node additions and rejections via RMNodeUpdateEvent
   3.1: notify the scheduler of allocations to recover via SchedulerAllocationUpdatesEvent
4. scheduler.processAllocationUpdateEvent
   4.1: scheduler creates a new ask based on the Allocation to recover 
   4.2: recover the allocation on the new node using a special process
   4.3: confirm the allocation in the scheduler, on failure update the cache with a ReleaseAllocationsEvent
```

**node update and removal**
```
1. RMProxy sends cacheevent.RMUpdateRequestEvent to cache
2. cluster_info.processNodeActions
   2.1: node sanity check (such as existence of partition/node)
   2.2: Node info update (resource change)
        2.2.1: update node in cache
        2.2.2: notify scheduler of the node update via SchedulerNodeEvent
   2.3: Node status update (not removal), update node status in cache only
   2.4: Node removal
        2.4.1: update node status and remove node from the cache
        2.4.2: remove alloations and inform RM via RMReleaseAllocationEvent
        2.4.3: notify scheduler of the node removal via SchedulerNodeEvent
3. scheduler.processNodeEvent add/remove/update the node  
```

### Operations to add, update or remove partitions
**Add RM**
```
1. RMProxy sends commonevents.RemoveRMPartitionsEvent
   if RM is already registered
   1.1: scheduler.removePartitionsBelongToRM
        1.1.1: scheduler cleans up
        1.1.2: scheduler sends commonevents.RemoveRMPartitionsEvent
   1.2: cluster_info.processRemoveRMPartitionsEvent
        1.2.1: cache cleans up
2. RMProxy sends commonevents.RegisterRMEvent
3. cluster_info.processRMRegistrationEvent
   2.1: cache update internal partitions/queues accordingly.
   2.2: cache sends to scheduler SchedulerUpdatePartitionsConfigEvent.
3. scheduler.processUpdatePartitionConfigsEvent
   3.1: Scheduler update partition/queue info accordingly.
```

**Update and Remove partition**
Triggered by a configuration file update.
```
1. RMProxy sends commonevents.ConfigUpdateRMEvent
2. cluster_info.processRMConfigUpdateEvent
   2.1: cache update internal partitions/queues accordingly.
   2.2: cache sends to scheduler SchedulerUpdatePartitionsConfigEvent.
   2.3: cache marks partitions for deletion (not removed yet).
   2.4: cache sends to scheduler SchedulerDeletePartitionsConfigEvent
3. scheduler.processUpdatePartitionConfigsEvent
   3.1: scheduler updates internal partitions/queues accordingly.
4. scheduler.processDeletePartitionConfigsEvent
   4.1: Scheduler set partitionManager.stop = true.
   4.2: PartitionManager removes queues, applications, nodes async.
        This is the REAL CLEANUP including the cache
```

### Allocations
Allocations are initiated by the scheduling process.
The scheduler creates a SchedulingAllocation on the scheduler side which then gets wrapped in an AllocationProposal.
The scheduler has checked resources etc already and marked the allocation as inflight.
This description picks up at the point the allocation will be confirmed and finalised.

**New allocation**
```
1. Scheduler wraps an SchedulingAllocation in an AllocationProposalBundleEvent 
2. cluster_info.processAllocationProposalEvent
   preemption case: release preempted allocations
   2.1: release the allocation in the cache
   2.2: inform the scheduler the allocation is released via SchedulerNodeEvent
   2.3: inform the RM the allocation is released via RMReleaseAllocationEvent
   all cases: add the new allocation
   2.4: add the new allocation to the cache
   2.5: rejections are send back to the scheduler via SchedulerAllocationUpdatesEvent 
   2.6: inform the scheduler the allocation is added via SchedulerAllocationUpdatesEvent
   2.7: inform the RM the allocation is added via RMNewAllocationsEvent
3. scheduler.processAllocationUpdateEvent
   3.1: confirmations are added to the scheduler and change from inflight to confirmed.
        On failure of processing a ReleaseAllocationsEvent is send to the cache *again* to clean up.
        This is part of the issue in [YUNIKORN-169]
        cluster_info.processAllocationReleases
   3.2: rejections remove the inflight allocation from the scheduler. 
```

## Current locking
**Cluster Lock:**  
A cluster contains one or more Partition objects. A partition is a sub object of Cluster.  
Adding or Removing ANY Partition requires a write-lock of the cluster.
Retrieving any object within the cluster will require iterating over the Partition list and thus a read-lock of the cluster

**Partition Lock:**  
The partition object contains all links to Queue, Application or Node objects.
Adding or Removing ANY Queue, Application or Node needs a write-lock of the partition.
Retrieving any object within the partition will require a read-lock of the partition to prevent data races

Examples of operation needing a write-lock
- Allocation processing after scheduling, will change application, queue and node objects.
  Partition lock is required due to possible updates to reservations.
- Update of Node Resource 
  It not only affect node's available resource, it also affects the Partition's total allocatable Resource 

Example of operations that need a read-lock:
- Retrieving any Queue, Application or Node needs a read-lock
  The object itself is not locked as part of the retrieval
- Confirming an allocation after processing in the cache
  The partition is only locked for reading to allow retrieval of the objects that will be changed.
  The changes are made on the underlying objects.

Example of operations that do not need any lock: 
- Scheduling  
  Locks are taken on the specific objects when needed, no direct updates to the partition until the allocation is confirmed. 

**Queue lock:**  
A queue can track either applications (leaf type) or other queues (parent type).
Resources are tracked for both types in the same way.

Adding or removing an Application (leaf type), or a direct child queue (parent type) requires a write-lock of the queue.  
Updating tracked resources requires a write-lock.
Changes are made recursively never locking more than 1 queue at a time.  
Updating any configuration property on the queue requires a write-lock.
Retrieving any configuration value, or tracked resource, application or queue requires a read-lock.  

Examples of operation needing a write-lock
- Adding an application to a leaf queue
- Updating the reservations

Examples of operation needing a read-lock
- Retrieving an application from a leaf type queue
- Retrieving the pending resources 

**Application lock:**  
An application tracks resources of different types, the allocations and outstanding requests.  
Updating any tracked resources, allocations or requests requires a write-lock.
Retrieving any of those values requires a read-lock.

Scheduling also requires a write-lock of the application.
During scheduling the write-lock is held for the application.
Locks will be taken on the node or queue that need to be accessed or updated.  
Examples of the locks taken on other objects are:
- a read lock to access queue tracked resources
- a write-lock to update the in progress allocations on the node 

Examples of operation needing a write-lock
- Adding a new ask
- Trying to schedule a pending request 

Examples of operation needing a read-lock
- Retrieving the allocated resources
- Retrieving the pending requests

**Node lock:**  
An node tracks resources of different types and allocations.
Updating any tracked resources or allocations requires a write-lock.
Retrieving any of those values requires a read-lock.

Checks run during the allocation phases take locks as required.
Read-locks when checking write-locks when updating.
A node is not locked for the whole allocation cycle.

Examples of operation needing a write-lock
- Adding a new allocation
- updating the node resources

Examples of operation needing a read-lock
- Retrieving the allocated resources
- Retrieving the reservation status

## How to merge Cache and scheduler objects
Since there is no longer the requirement to distinguish the objects in the cache and scheduler the `scheduling` and `info` parts of the name will be dropped.

Overview of the main moves and merges:
1. `application_info` & `scheduling_application`: **merge** to `scheduler.object.application`
2. `allocation_info` & `scheduling_allocation`: **merge** to `scheduler.object.allocation`
3. `node_info` & `scheduling_node`: **merge** to `scheduler.object.node`
4. `queue_info` & `scheduling_queue`: **merge** to `scheduler.object.queue`
5. `partition_info` & `scheduling_partition`: **merge** to `scheduler.PartitionContext`
6. `cluster_info` & `scheduling_context`: **merge** to `scheduler.ClusterContext`
7. `application_state`: **move** to `scheduler.object.applicationState`
8. `object_state`: **move** to `scheduler.object.objectState`
9. `initializer`: **merge** into `scheduler.ClusterContext`

This move and merge of code includes a refactor of the objects into their own package.
That thus affects the two scheduler only objects, reservations and schedulingAsk, that are already defined.
Both will be moved into the objects package.

The top level scheduler package remains for the contexts and scheduling code.

## Code merges
The first change is the event processing.
All RM events will now directly be handled in the scheduler.
Event handling will undergo a major change, far more than a simple merge.
Only the RM generated events will be left after the merge.
As described in the analysis above the scheduler is, in almost all cases, notified of changes from RM events.

Broadly speaking there are only three types of changes triggered by the event removal: 
- configuration changes: new scheduler code required as the cache handling is not transferable to the scheduler
- node, ask and application changes: merge of the cache code into the scheduler
- allocation changes: removal of confirmation cycle and simplification of the scheduler code

Part of the event handling is the processing of the configuration changes.
All configuration changes will now update the scheduler objects directly.
The way the scheduler works is slightly different from the cache which means the code is not transferable. 

Nodes and applications are really split between the cache and scheduler.
Anything that is tracked in the cache object that does not have an equivalent value in the scheduler object will be moved into the scheduler object.
All references to scheduler objects will be removed.
With the code merges existing scheduler code that calls out directly into the cache objects will return the newly tracked value in the scheduler object.
These calls will thus become locked calls in the scheduler.

The concept of an in flight allocation will be removed.
Allocation will be made in the same scheduling iteration without events or creation of a proposal.
Removing the need for tracking of allocating resources on the scheduler objects.
In flight resource tracking was required to make sure that an allocation while not confirmed by the cache would being taken into account while making scheduling decisions.

The application and object state will be an integrated part of the scheduler object.
A state change is thus immediate and this should prevent an issue like [YUNIKORN-169](https://issues.apache.org/jira/browse/YUNIKORN-169) from occuring.

## Locking after merge

### Direction of lock 
It is possible to acquire another lock while holding a lock, but we need to make sure that we do not allow: 
- Holding A.lock and acquire B's lock. 
- Holding B.lock and acquire B's lock. 

The current code in the scheduler takes a lock as late as possible and only for the time period needed.
Some actions are not locked on the scheduler side just on the cache side as each object has its own lock.
This means that a read of a value from the cache would not lock the scheduling object.

With the integration of the cache into the scheduler the number of locks will decrease as the number of objects decreases.
Each equivalent object, cache and scheduler, which used to have their own lock will now have just one.
After the merge of the code is performed one lock will be left.
Locking will occur more frequently as the number of fields in the scheduler objects has increased.

Calls that did not lock the scheduler object before the merge will become locked.
Lock contention could lead to performance degradation.
The reduced overhead in objects and event handling can hopefully compensate for this.
One point to keep track of is the change in locking behaviour.
New behaviour could lead to new deadlock situations when code is simply merged without looking at the order.

### Mitigations for deadlocks
The locking inside the scheduler will be left as is.
This means that the main scheduling logic will be taking and releasing locks as required on the objects.
There are no long held read-locks or write-locks until the application is locked to schedule it.

A major point of attention will need to be that no iterations of objects should be performed while holding on to a lock.
For instance during scheduling while iterating over a queue's application we should not lock the queue.

Another example would be that event processing in the partition should not lock the partition unneeded.
The partition should be locked while retrieving for instance the node that needs updating and release the lock before it tries to lock the node itself.

This approach fits in with the current locking approach and will keep the locking changes to a minimum.
Testing, specifically end-to-end testing, should catch these deadlocks. 
There are no known tools that could be used to detect or describe lock order.
