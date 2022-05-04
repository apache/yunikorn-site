---
id: interface_message_simplication
title: Simplyfing Interface Messages
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

# Simplyfing Interface Messages and Breaking Shim build dependency on Core

# Proposal
This document describes a) complexity hidden behind existing Interface messages and 
explains the newly defined SI messages and its dependent changes on Core and Shim. 
b). Breaking Shim build dependency on Core.

## Goals
The goal is to provide the same functionality before and after the change.
- unit tests before and after the merge must all pass.
- Smoke tests defined in the core should all pass without major changes definition.
- End-to-end tests that are part of the shim code must all pass without changes.
## Background
The current interface allows us to only send one message between a shim and the core. This provides us with a really simple way of interactions definition.

The complexity is however hidden in the message itself. Every message serves multiple purposes and when the message is received the core and shim need to unpack it and process each part separately and for certain parts in a real specific order.
Because the message serves a number of purposes it has a large overhead. This might not show up in the code directly as the heavy lifting is done in the generated code. It will show up in the amount of data as a message, even if it does not have all fields, still needs to be encoded in a way that it unpacks correctly on the other side.

## Simplfying Interface Messages

Proposal is to split the one large message into 3 separate messages - one for each entity:

- Allocations
- Applications
- Nodes

### API Interface Changes

```
package api

import "github.com/apache/incubator-yunikorn-scheduler-interface/lib/go/si"

type SchedulerAPI interface {
    // Register a new RM, if it is a reconnect from previous RM, cleanup 
    // all in-memory data and resync with RM. 
    RegisterResourceManager(request *si.RegisterResourceManagerRequest, callback ResourceManagerCallback) (*si.RegisterResourceManagerResponse, error)
    
    // Update Allocation status
    UpdateAllocation(request *si.AllocationRequest) error
    
    // Update Application status
    UpdateApplication(request *si.ApplicationRequest) error
    
    // Update Node status
    UpdateNode(request *si.NodeRequest) error
    
    // Notify scheduler to reload configuration and hot-refresh in-memory state based on configuration changes 
    UpdateConfiguration(clusterID string) error
}

// RM side needs to implement this API
type ResourceManagerCallback interface {
	
    //Receive Allocation Update Response
    UpdateAllocation(response *si.AllocationResponse) error
    
    //Receive Application Update Response
    UpdateApplication(response *si.ApplicationResponse) error
    
    //Receive Node update Response
    UpdateNode(response *si.NodeResponse) error
    
    // Run a certain set of predicate functions to determine if a proposed allocation
    // can be allocated onto a node.
    Predicates(args *si.PredicatesArgs) error
    
    // RM side implements this API when it can provide plugin for reconciling
    // Re-sync scheduler cache can sync some in-cache (yunikorn-core side) state changes
    // to scheduler cache (shim-side), such as assumed allocations.
    ReSyncSchedulerCache(args *si.ReSyncSchedulerCacheArgs) error
    
    // This plugin is responsible for transmitting events to the shim side.
    // Events can be further exposed from the shim.
    SendEvent(events []*si.EventRecord)
    
    // Scheduler core can update container scheduling state to the RM,
    // the shim side can determine what to do incorporate with the scheduling state
    // update container scheduling state to the shim side
    // this might be called even the container scheduling state is unchanged
    // the shim side cannot assume to only receive updates on state changes
    // the shim side implementation must be thread safe
    UpdateContainerSchedulingState(request *si.UpdateContainerSchedulingStateRequest)
    
    // Update configuration
    UpdateConfiguration(args *si.UpdateConfigurationRequest) *si.UpdateConfigurationResponse
}
```

### Interface Changes to replace UpdateRequest

UpdateRequest would be divided into below messages:

#### AllocationRequest
```
message AllocationRequest {
  repeated AllocationAsk asks = 1;
  AllocationReleasesRequest releases = 2;
  string rmID = 3;
}
```
#### ApplicationRequest
```
message ApplicationRequest {
  repeated AddApplicationRequest new = 1;
  repeated RemoveApplicationRequest remove = 2;
  string rmID = 3;
}
```
#### NodeRequest
```
message NodeRequest {
  repeated NodeInfo nodes = 1;
  string rmID = 2;
}
```
### Merging Create and Update NodeInfo into Single NodeInfo
```
message NodeInfo {
  enum ActionFromRM {
    CREATE = 0;
    UPDATE = 1;
    DRAIN = 2;
    SCHEDULABLE = 3;
    DECOMISSION = 4;
  }

  string nodeID = 1;
  ActionFromRM action = 2;
  map<string, string> attributes = 3;
  Resource schedulableResource = 4;
  Resource occupiedResource = 5;
  repeated Allocation existingAllocations = 6;
}
```

### Event Changes to replace UpdateRequest

RMUpdateRequestEvent would be replaced by following events:

- RMUpdateAllocationEvent
- RMUpdateApplicationEvent
- RMUpdateNodeEvent

### Interface Changes to replace UpdateResponse

UpdateResponse would be divided into below messages:

#### AllocationResponse
```
message AllocationResponse {
  repeated Allocation new = 1;
  repeated AllocationRelease released = 2;
  repeated AllocationAskRelease releasedAsks =3;
  repeated RejectedAllocationAsk rejected = 4;
}
```
#### ApplicationResponse
```
message ApplicationResponse {
  repeated RejectedApplication rejected = 1;
  repeated AcceptedApplication accepted = 2;
  repeated UpdatedApplication updated = 3;
}
```
#### NodeResponse
```
message NodeResponse {
  repeated RejectedNode rejected = 1;
  repeated AcceptedNode accepted = 2;
}
```

### Event Changes for UpdateResponse

Scheduler/Context.go from Core already triggers an event for each entity separately and rmproxy.go is the one which handles all these events and packs it under single *si.UpdateResponse and eventually sends to shim through scheduler_callback#RecvUpdateResponse. With the above API interface change, rmproxy.go would use appropriate callback method to send response to shim. With this separate callback approach, each entity response would be handled separately in shim.

## Detailed Flow Analysis

### Add/Delete Allocations

The RM (shim) sends a simplified AllocationRequest as described above. This message is wrapped by the RM proxy and forwarded to the cache for processing. The RM can request an allocation to be added or removed.

```
1. Shim sends a simplified AllocationRequest to core through SchedulerAPI.UpdateAllocation
2. RMProxy sends rmevent.RMUpdateAllocationEvent to scheduler 
3. On receiving the above event, scheduler calls context.handleRMUpdateAllocationEvent to do the 
   following:
   3.1: processAsks
        2.1.2: Process each request.Asks ask of AllocationRequest request and adds to the application
        2.1.2: In case of rejection, triggers RMRejectedAllocationAskEvent with 
        all asks which has been rejected
        2.1.2: On receiving RMRejectedAllocationAskEvent, RMProxy.processUpdatePartitionConfigsEvent 
        process the event, creates a AllocationResponse using RMRejectedAllocationAskEvent 
        attributes and send to shim through UpdateAllocation callback method
   3.2: processAskReleases
        2.2.1: Process each request.Releases.AllocationAsksToRelease ask release of AllocationRequest request 
        and removes from the application
   3.3: processAllocationReleases
        3.3.1: Process each request.Releases.AllocationRelease allocation release of AllocationRequest 
        request and removes from the application
        3.3.2: Collect all above exact released allocations and triggers RMReleaseAllocationEvent with all allocations needs to be released
        3.3.3: On receiving RMReleaseAllocationEvent, RMProxy.processRMReleaseAllocationEvent
        prcoess the event, creates a AllocationResponse using RMReleaseAllocationEvent
        attributes and send to shim through UpdateAllocation callback method
        3.3.4: Collect all above confirmed (placeholder swap & preemption) allocations 
        and send to shim through two ways 
            a). Wraps confirmed allocations as AssumedAllocation 
            and send to shim ReSyncSchedulerCache callback plugin 
            b). Wraps confirmed allocations as Allocation and triggers 
            RMNewAllocationsEvent. On receiving RMNewAllocationsEvent, 
            RMProxy.processAllocationUpdateEvent process the event, creates a 
            AllocationResponse using RMNewAllocationsEvent attributes and send to shim 
            through UpdateAllocation callback method
```

### Add/Delete Applications

The RM (shim) sends a simplified ApplicationRequest as described above. This message is wrapped by the RM proxy and forwarded to the cache for processing. The RM can request an application to be added or removed.

```
1. Shim sends a simplified ApplicationRequest to core through SchedulerAPI.UpdateApplication
2. RMProxy sends rmevent.RMUpdateApplicationEvent to scheduler
3. On receiving the above event, scheduler calls context.handleRMUpdateApplicationEvent to do the 
   following:
   3.1: Add new apps to the partition. 
        3.1.2: Wraps AcceptedApps and RejectedApps (if any) as part of RMApplicationUpdateEvent 
        and fires the same
        3.1.2: On receiving RMApplicationUpdateEvent, RMProxy.processApplicationUpdateEvent 
        process the event, creates a ApplicationResponse using RMApplicationUpdateEvent 
        attributes and send to shim through UpdateApplication callback method
   3.2 Remove apps from the partition.
        3.2.1: Collect all allocations belongs to the removed app and triggers 
        RMReleaseAllocationEvent with all allocations needs to be released
        3.2.2: On receiving RMReleaseAllocationEvent, RMProxy.processRMReleaseAllocationEvent
        prcoess the event, creates a AllocationResponse using RMReleaseAllocationEvent
        attributes and send to shim through UpdateAllocation callback method
```

### Add/Delete Nodes

The RM (shim) sends a simplified NodeRequest as described above. This message is wrapped by the RM proxy and forwarded to the cache for processing. The RM can request an node to be added or removed.

```
1. Shim sends a simplified NodeRequest to core through SchedulerAPI.UpdateNode
2. RMProxy sends rmevent.RMUpdateNodeEvent to scheduler
3. On receiving the above event, scheduler calls context.handleRMUpdateNodeEvent to do the 
   following:
   3.1: Add new node to the partition. 
        3.1.2: Wraps AcceptedNodes and RejectedNodes (if any) as part of RMNodeUpdateEvent 
        and fires the same
        3.1.2: On receiving RMNodeUpdateEvent, RMProxy.processRMNodeUpdateEvent 
        process the event, creates a NodeResponse using RMNodeUpdateEvent 
        attributes and send to shim through UpdateNode callback method
   3.2: Update node
        3.2.1 Update the partition resource
   3.3: Drain node
        3.3.1 Ensures node is not schedulable
   3.4: Decommissioning (Remove) node from the partition.
        3.4.1: Ensures node is not schedulable
        3.4.2: Collect all above exact released allocations from that node and triggers 
        RMReleaseAllocationEvent with all allocations needs to be released
        3.4.3: On receiving RMReleaseAllocationEvent, 
        RMProxy.processRMReleaseAllocationEvent process the event, creates a 
        AllocationResponse using RMReleaseAllocationEvent attributes and 
        send to shim through UpdateAllocation callback method
        3.4.4: Collect all above confirmed (placeholder swap & preemption) from that node 
        allocations and send to shim through two ways 
            a). Wraps confirmed allocations as AssumedAllocation and send to shim 
            through ReSyncSchedulerCache callback plugin 
            b). Wraps confirmed allocations as Allocation and triggers RMNewAllocationsEvent. 
            On receiving RMNewAllocationsEvent, RMProxy.processAllocationUpdateEvent 
            process the event, creates a AllocationResponse using RMNewAllocationsEvent 
            attributes and send to shim through UpdateAllocation callback method
```

## Breaking the Shim build dependency on Core 

Planned for different phases. 

### Phase 1
Moved all plugins from core to appropriate place in SI under ResourceManagerCallback, 
a single common interface.

### Phase 2
Please refer https://issues.apache.org/jira/browse/YUNIKORN-930 for more details