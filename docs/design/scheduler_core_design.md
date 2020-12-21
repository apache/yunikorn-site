---
id: scheduler_core_design
title: Scheduler Core Design
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

:::caution
The scheduler core design has changed. [YUNIKORN-317](https://issues.apache.org/jira/browse/YUNIKORN-317) was committed and has removed the scheduler cache.
This document will not be maintained and is just for historical reference.
See [scheduler cache removal design](cache_removal.md)
:::

Github repo: https://github.com/apache/incubator-yunikorn-core/

Scheduler core encapsulates all scheduling algorithms, it collects resources from underneath resource management
platforms (like YARN/K8s), and is responsible for container allocation requests. It makes the decision where is the
best spot for each request and then sends response allocations to the resource management platform.
Scheduler core is agnostic about underneath platforms, all the communications are through the [scheduler interface](https://github.com/apache/incubator-yunikorn-scheduler-interface).

## Components:

```

                     +---------------+  +--------------+
                     |K8s Shim       |  |YARN Shim     |
                     +---------------+  +--------------+

                                +--------------+   +------------+
                Scheduler-      | GRPC Protocol|   |Go API      |
                Interface:      +--------------+   +------------+

+---------------------------------------------------------------------------+
                     +--------------------+
                     |Scheduler API Server|
 +-------------+     +---------+----------+
 |AdminService |               |
 +-------------+               |Write Ops                    +----------------+
 +-------------+               V                            ++Scheduler       |
 |Configurator |      +-------------------+  Allocate       ||   And          |
 +-------------+      |Cache Event Handler+<-----------------|                |
         +----------> +-------------------+  Preempt        ++Preemptor       |
          Update Cfg   Handled by policies                   +----------------+
                               +  (Stateless)
                        +------v--------+
                        |Scheduler Cache|
                        +---------------+
                +---------------------------------------------+
                |--------+ +------+ +----------+ +----------+ |
                ||Node   | |Queue | |Allocation| |Requests  | |
                |--------+ +------+ +----------+ +----------+ |
                +---------------------------------------------+
```

### Scheduler API Server (RMProxy)

Responsible for communication between RM and Scheduler, which implements scheduler-interface GRPC protocol,
or just APIs. (For intra-process communication w/o Serde).

### Scheduler Cache

Caches all data related to scheduler state, such as used resources of each queues, nodes, allocations.
Relationship between allocations and nodes, etc. Should not include in-flight data for resource allocation.
For example to-be-preempted allocation candidates. Fair share resource of queues, etc.

### Scheduler Cache Event Handler

Handles all events which needs to update scheduler internal state. So all the write operations will be carefully handled.

### Admin Service

Handles request from Admin, which can also load configurations from storage and update scheduler policies.

### Scheduler and Preemptor

Handles Scheduler's internal state. (Which is not belong to scheduelr cache), such as internal reservations, etc.
Scheduler and preemptor will work together, make scheduling or preemption decisions. All allocate/preempt request
will be handled by event handler.

## Scheduler's responsibility

- According to resource usages between queues, sort queues, applications, and figure out order of application allocation. (This will be used by preemption as well).
- It is possible that we cannot satisfy some of the allocation request, we need to skip them and find next request.
- It is possible that some allocation request cannot be satisfied because of resource fragmentation. We need to reserve room for such requests.
- Different nodes may belong to different disjoint partitions, we can make independent scheduler runs
- Be able to config and change ordering policies for apps, queues.
- Application can choose their own way to manage sort of nodes.

## Preemption

- It is important to know "who wants the resource", so we can do preemption based on allocation orders.
- When do preemption, it is also efficient to trigger allocation op. Think about how to do it.
- Preemption needs to take care about queue resource balancing.

## Communication between Shim and Core 

YuniKorn-Shim (like https://github.com/apache/incubator-yunikorn-k8shim) communicates with core by
using scheduler-interface (https://github.com/apache/incubator-yunikorn-scheduler-interface).
Scheduler interface has Go API or GRPC. Currently, yunikorn-k8shim is using Go API to communicate with yunikorn-core
to avoid extra overhead introduced by GRPC. 

**Shim (like K8shim) first need to register with core:** 

```go
func (m *RMProxy) RegisterResourceManager(request *si.RegisterResourceManagerRequest, callback api.ResourceManagerCallback) (*si.RegisterResourceManagerResponse, error)
```

Which indicate ResourceManager's name, a callback function for updateResponse. The design of core is be able to do scheduling for multiple clusters (such as multiple K8s cluster) just with one core instance.

**Shim interacts with core by invoking RMProxy's Update API frequently, which updates new allocation request, allocation to kill, node updates, etc.** 

```go
func (m *RMProxy) Update(request *si.UpdateRequest) error
```

Response of update (such as new allocated container) will be received by registered callback.

## Configurations & Semantics

Example of configuration:

- Partition is name space.
- Same queues can under different partitions, but enforced to have same hierarchy.

    Good:

    ```
     partition=x    partition=y
         a           a
       /   \        / \
      b     c      b   c
    ```

    Good (c in partition y acl=""):

    ```
     partition=x    partition=y
         a           a
       /   \        /
      b     c      b
    ```

    Bad (c in different hierarchy)

    ```
     partition=x    partition=y
         a           a
       /   \        /  \
      b     c      b    d
                  /
                 c
    ```

    Bad (Duplicated c)

    ```
     partition=x
         a
       /   \
      b     c
     /
    c

    ```

- Different hierarchies can be added

    ```scheduler-conf.yaml
    partitions:
      - name:  default
        queues:
            root:
              configs:
                acls:
              childrens:
                - a
                - b
                - c
                - ...
            a:
              configs:
                acls:
                capacity: (capacity is not allowed to set for root)
                max-capacity: ...
          mapping-policies:
            ...
      - name: partition_a:
        queues:
            root:...
    ```

## How scheduler do allocation

Scheduler runs a separate goroutine to look at asks and available resources, and do resource allocation. Here's allocation logic in pseudo code: 

Entry point of scheduler allocation is `scheduler.go: func (s *Scheduler) schedule()`

```
# First of all, YuniKorn has partition concept, a logical resource pool can consists
# of one of multiple physical dis-joint partitions. It is similar to YARN's node
# partition concept.

for partition : partitions:
  # YuniKorn can reserve allocations for picky asks (such as large request, etc.)
  # Before doing regular allocation, YuniKorn look at reservedAllocations first.
  for reservedAllocation : partition.reservedAllocations: 
     reservedAllocation.tryAllocate(..)
  
  # After tried all reserved allocation, YuniKorn will go to regular allocation
  partition.tryAllocate(..)
  
  # If there's any allocation created, scheduler will create an AllocationProposal
  # and send to Cache to "commit" the AllocationProposal 
```

**Allocation by hierchical of queues**

Inside `partition.tryAllocate` 

It recursively traverse from root queue and down to lower level, for each level, logic is inside `pkg/scheduler/scheduling_queue.go func (sq *SchedulingQueue) tryAllocate`

Remember YuniKorn natively supports hierarchical of queues. For ParentQueue (which has sub queues under the parent queue), it uses queue's own sorting policy to sort subqueues and try to allocate from most preferred queue to least-preferred queue. 

For LeafQueue (which has applications inside the queue), it uses queue's own sorting policy to sort applications belong to the queue and allocate based on the sorted order. 

(All sorting policies can be configured differently at each level.) 

**Allocation by application**

When it goes to Application, see (`scheduler_application.go: func (sa *SchedulingApplication) tryAllocate`), It first sort the pending resource requests belong to the application (based on requests' priority). And based on the selected request, and configured node-sorting policy, it sorts nodes belong to the partition and try to allocate resources on the sorted nodes. 

When application trying to allocate resources on nodes, it will invokes PredicatePlugin to make sure Shim can confirm the node is good. (For example K8shim runs predicates check for allocation pre-check).

**Allocation completed by scheduler** 

Once allocation is done, scheduler will create an AllocationProposal and send to Cache to do further check, we will cover details in the upcoming section.

## Flow of events

Like mentioned before, all communications between components like RMProxy/Cache/Schedulers are done by using async event handler. 

RMProxy/Cache/Scheduler include local event queues and event handlers. RMProxy and Scheduler have only one queue (For example: `pkg/scheduler/scheduler.go: handleSchedulerEvent`), and Cache has two queues (One for events from RMProxy, and one for events from Scheduler, which is designed for better performance). 

We will talk about how events flowed between components: 

**Events for ResourceManager registration and updates:**

```
Update from ResourceManager -> RMProxy -> RMUpdateRequestEvent Send to Cache
New ResourceManager registration -> RMProxy -> RegisterRMEvent Send to Cache
```

**Cache Handles RM Updates** 

There're many fields inside RM Update event (`RMUpdateRequestEvent`), among them, we have following categories: 

```
1) Update for Application-related updates
2) Update for New allocation ask and release. 
3) Node (Such as kubelet) update (New node, remove node, node resource change, etc.)
```

More details can be found at: 

```
func (m *ClusterInfo) processRMUpdateEvent(event *cacheevent.RMUpdateRequestEvent)

inside cluster_info.go
```

**Cache send RM updates to Scheduler**

For most cases, Cache propagate updates from RM to scheduler directly (including Application, Node, Asks, etc.). And it is possible that some updates from RM is not valid (such as adding an application to a non-existed queue), for such cases, cache can send an event back to RMProxy and notify the ResourceManager. (See `RMApplicationUpdateEvent.RejectedApplications`)

**Cache handles scheduler config** 

Cache also handles scheduler's config changes, see

```go
func (m *ClusterInfo) processRMConfigUpdateEvent(event *commonevents.ConfigUpdateRMEvent)
```

Similar to other RM updates, it propages news to scheduelr.

**Scheduler do allocation**

Once an AllocationProposal created by scheduler, scheduler sends `AllocationProposalBundleEvent` to Cache to commit. 

Cache look at AllocationProposal under lock, and commit these proposals. The reason to do proposal/commit is Scheduler can run in multi-threads which could cause conflict for resource allocation. This approach is inspired by Borg/Omega/YARN Global Scheduling.

Cache checks more states such as queue resources, node resources (we cannot allocate more resource than nodes' available), etc. Once check is done, Cache updates internal data strcture and send confirmation to Scheduler to update the same, and scheduler sends allocated Allocation to RMProxy so Shim can do further options. For example, K8shim will `bind` an allocation (POD) to kubelet.

```
Job Add:
--------
RM -> Cache -> Scheduler (Implemented)

Job Remove:
-----------
RM -> Scheduler -> Cache (Implemented)
Released allocations: (Same as normal release) (Implemented)
Note: Make sure remove from scheduler first to avoid new allocated created. 

Scheduling Request Add:
-----------------------
RM -> Cache -> Scheduler (Implemented)
Note: Will check if requested job exists, queue exists, etc.
When any request invalid:
   Cache -> RM (Implemented)
   Scheduler -> RM (Implemented)

Scheduling Request remove:
------------------------- 
RM -> Scheduler -> Cache (Implemented)
Note: Make sure removed from scheduler first to avoid new container allocated

Allocation remove (Preemption) 
-----------------
Scheduler -> Cache -> RM (TODO)
              (confirmation)

Allocation remove (RM voluntarilly ask)
---------------------------------------
RM -> Scheduler -> Cache -> RM. (Implemented)
                      (confirmation)

Node Add: 
---------
RM -> Cache -> Scheduler (Implemented)
Note: Inside Cache, update allocated resources.
Error handling: Reject Node to RM (Implemented)

Node Remove: 
------------
Implemented in cache side
RM -> Scheduler -> Cache (TODO)

Allocation Proposal:
--------------------
Scheduler -> Cache -> RM
When rejected/accepted:
    Cache -> Scheduler
    
Initial: (TODO)
--------
1. Admin configured partitions
2. Cache initializes
3. Scheduler copies configurations

Relations between Entities 
-------------------------
1. RM includes one or multiple:
   - Partitions 
   - Jobs
   - Nodes 
   - Queues
   
2. One queue: 
   - Under one partition
   - Under one RM.
   
3. One job: 
   - Under one queue (Job with same name can under different partitions)
   - Under one partition

RM registration: (TODO)
----------------
1. RM send registration
2. If RM already registered, remove old one, including everything belong to RM.

RM termination (TODO) 
--------------
Just remove the old one.

Update of queues (TODO) 
------------------------
Admin Service -> Cache

About partition (TODO) 
-----------------------
Internal partition need to be normalized, for example, RM specify node with partition = xyz. 
Scheduler internally need to normalize it to <rm-id>_xyz
This need to be done by RMProxy

```