---
id: historical_usage_tracking
title: Historical Usage Tracking
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

Tracking an application lifecycle is not easy in the current YuniKorn setup.
Logs and statedump data is required to build an overview.
Historical tracking of applications is only possible with limited detail per application.
Applications come and go, we only track what is running and a time limited set of completed applications.

Storing detailed tracking information in memory is problematic.
Unbound growth can cause performance issues or even an out of memory failure of the service.
The lessons learned from the YARN days have shown that it is not simple.

A conscious choice was also made to keep YuniKorn stateless.
The service does not maintain its own datastore for any of its operations.
Adding a datastore for application and usage tracking will complicate things.

Tracking data can be easily generated and made available for external consumption.
The design will discuss the option to generate an event stream for applications, queues and nodes to allow external tools to build an overview of the usage pattern.

Work to be tracked under [YUNIKORN-1628](https://issues.apache.org/jira/browse/YUNIKORN-1628)

## Goals

-   Implementation of an event stream for an application, including:  
    -   State changes
    -   Asks and allocation changes
-   Implementation of an event stream for a node, including:
    -   State changes
    -   Allocation changes
-   Implementation of an event stream for a queue, including:
    -   State changes
    -   Usage changes
-   Define a REST interface for event retrieval

## Non Goals

-   Add a data store for the historical data
-   Display the event information
-   Rebuild data on recovery
    -   Historical data will not be rebuild
-   Authentication and Authorisation on the REST interface

## Existing Event System

The event system was designed to be far more flexible than the current usage.
Events for requests, applications, nodes and queues have been defined.
Most of those are currently not used.
The current event system is built on top of a generic event definition.
The scheduler interface defines the event as:

```go
si.EventRecord {
  Type: recordType,
  ObjectID: String,
  GroupID: String,
  Reason: String,
  Message: String,
  TimestampNano: int64,
}
```

Events definitions are used in the core and shim.
The simplicity of the events will most likely not match the current requirements.

As part of the standard scheduling cycle we track details at different levels.
Prometheus' metrics are tracked for specific changes and updates.
We also generate events, REQUEST events, that get passed back into the K8shim to attach to the Kubernetes pods.

The current events that get passed back are for:

- *Insufficient Queue Resources*: part of the allocation cycle. Called from: `Application.tryAllocate()`
- *Placeholder Size Mismatch*: part of the placeholder replacement cycle. Called from: `Application.tryPlaceholderAllocate()`

Both events are of the type REQUEST.
The K8shim also implements processing of NODE events but there is no code that generates those types of events.
The APPLICATION and QUEUE type events are not created or processed.

The event system was added as part of [YUNIKORN-42](https://issues.apache.org/jira/browse/YUNIKORN-42).
The jira contains a simple design document for the event system.
It only was implemented for events that we could not at that point get in any other way: [design v2](https://docs.google.com/document/d/1aKfY6wnBPCyBl03UfmMHbTSpabAbfxtsHT2KzOgEOQs/edit).
The original thought was a more generic event system.
It would relate everything back to either a pod or the YuniKorn CRD and was focussed on diagnostics and troubleshooting in general: [design v1](https://docs.google.com/document/d/19iMkLJGVwTSq9OfV9p75wOobJXAxR_CRo4YzSRG_Pzw/edit#heading=h.worp3vfnqgtn).
Linking it all back to a specific pod is The YuniKorn CRD is not used at this point in time.

### Scheduler integration

When the event system was designed the whole purpose was to allow out of band processing of the events from the scheduling cycle.
The events are generated during the scheduling cycle and processed asynchronously in the event system.

A channel is used for collecting the events during the scheduling cycle.
The scheduler generates an event and adds it for processing to the channel.
After the placement of the event on the channel the scheduler proceeds with the normal cycle.
Processing of the events does not, and must not, block the scheduling cycle.

This part of the event system must be maintained as it will guarantee the performance of the scheduler.

### Event storage

All events that have been sent to the channel are read from the channel and placed in a temporary store for publishing.
The store is a simple map with the key of the *ObjectID*.

Some of the assumptions in the event store however make it not directly usable for the purpose as described here.
The main limitation is that there can only be one event in the channel per *ObjectID*.
The newest one is kept, the older one is dropped when a new event comes in.
This however does not mean the code already available with minor changes could be re-used for this purpose.

### Publishing events

The current event system uses a push system for event publishing.
The event system allows the creation of multiple event publishers.
There is no implementation or design for a pull system, like for instance a REST based interface.

Currently, there is only an event publisher for a shim defined. 
This push system will send all the events that have been collected during the push interval to the shim. 
All events that are pushed will be removed from the store. 
This keeps the size of the store to a minimum.

There is no filtering or post-processing of events implemented.
Each event stored in the store is forwarded to the shim when the publisher runs.
See limitations of the store mentioned above. 
In the earlier design a level filter was described. 
That level was never part of the follow-up design, not in the events and not in the processing.

## Event System Updates

The currently defined events are not a fit for the system we want and need.
Since the events are only used between the core and the K8shim via the publisher we do not need to maintain backwards compatibility.
Changes can be made to the messages as we do not currently expose the message to the outside.

The *message* and *reason* fields are currently not properly used. 
The content of the two overlaps.
The message in both cases contains the reason, in slightly different wording.
We do not need both.

### Event description

We are also missing two fields to allow an extended usage for historical tracking: the *resource* and the *change type*.
Based on that the new message that would allow using the event system for tracking historical change would be:

```go
si.EventRecord {
  Type: eventRecordType,
  ChangeType: eventChangeType,
  ChangeDetail: eventChangeDetail,
  TimestampNano: int64,
  ObjectID: String,
  ReferenceID: String,
  Resource: si.Resource,
  Message: String,
}
```

The existing *GroupID* has been renamed to *ReferenceID*. The
*ReferenceID* is the identification of the second object for the event.
As an example that would be the Allocation UUID for a new allocation
added to an application, request or node. For the queue that would be
the application ID.

Note that the order of the attributes in the final definition might be
different as we do not reuse names and IDs in the messages.

### Event types

By keeping the event type for REQUESTS we can still fulfil the original
design of YUNIKORN-42. The current enumeration for the *eventRecordType*
would not change. Definition of the eventRecordType enumeration:

```text
UNKNOWN = 0
REQUEST = 1
APP = 2
NODE = 3
QUEUE = 4
```

### Change types

The additional change type that is added allows us to track the type of
change. Depending on the content of the other fields it provides the
possibility to track all changes we need to track. Definition of the
eventChangeType enumeration:

```text
NONE = 0
SET = 1
ADD = 2
REMOVE = 3
```

### Change details

Change detail provides more on the reason for the event. The change
detail is an enumerated value linked to the event types.

```text
DETAILS_NONE = 0

REQUEST_CANCEL = 100 // Request cancelled by the RM
REQUEST_ALLOC = 101 // Request allocated
REQUEST_TIMEOUT = 102 // Request cancelled due to timeout

APP_ALLOC = 200 // Allocation changed
APP_REQUEST = 201 // Request changed
APP_REJECT = 202 // Application rejected on create
APP_NEW = 203 // Application added with state new
APP_ACCEPTED = 204 // State change to accepted
APP_STARTING = 205 // State change to starting
APP_RUNNING = 206 // State change to running
APP_COMPLETING = 207 // State change to completing
APP_COMPLETED = 208 // State change to completed
APP_FAILING = 209 // State change to failing
APP_FAILED = 210 // State change to failed
APP_RESUMING = 211; // State change to resuming
APP_EXPIRED = 212; // State change to expired

NODE_DECOMISSION = 300 // Node removal
NODE_READY = 301 // Node ready state change
NODE_SCHEDULABLE = 302 // Node schedulable state change (cordon)
NODE_ALLOC = 303 // Allocation changed
NODE_CAPACITY = 304 // Capacity changed
NODE_OCCUPIED = 305 // Occupied resource changed
NODE_RESERVATION = 306; // Reservation/unreservation occurred

QUEUE_CONFIG = 400 // Managed queue update or removal
QUEUE_DYNAMIC = 401 // Dynamic queue update or removal
QUEUE_TYPE = 402 // Queue type change
QUEUE_MAX = 403 // Max resource changed
QUEUE_GUARANTEED = 404 // Guaranteed resource changed
QUEUE_APP = 405 // Application changed
QUEUE_ALLOC = 406 // Allocation changed
ALLOC_CANCEL = 500 // Allocation cancelled by the RM
ALLOC_PREEMPT = 501 // Allocation preempted by the core
ALLOC_TIMEOUT = 502 // Allocation cancelled due to timeout
ALLOC_REPLACED = 503 // Allocation replacement (placeholder)
ALLOC_NODEREMOVED = 504 // Allocation cancelled, node removal
```

### Content definition

The *eventRecordType* defines the object that the *ObjectID* points to.
The content of the *ReferenceID* depends on two things:
-   Change type
-   Object type inferred by the *eventRecordType*

For an object of type application it would not make sense to have the reference point to another application etc.
At this point the following mapping for *ReferenceID* is assumed:

| Event Type | Reference ID                     |
|------------|----------------------------------|
| REQUEST    | ApplicationID                    |
| APP        | Allocation UUID or Request UUID  |
| NODE       | Allocation UUID                  |
| QUEUE      | ApplicationID or Allocation UUID |

If the *eventChangeType* Is NONE or SET the *ReferenceID* is always empty.
The exception is for the REQUEST as in that case the change type NONE has an application ID set.
This special case is used to implement the existing functionality of the event system: sending events to the shim.

The APP record type supports Request IDs and Allocation UUIDs to be set in the *ReferenceID*.
The type of ID that is referenced is defined by the *ChangeDetail*.

The QUEUE record type supports application IDs and Allocation UUIDs to be set in the *ReferenceID*.
Individual allocations are not tracked on the queue.
However, we leave that option open for the event system at this point.

For the QUEUE if *ReferenceID* and *Resource* are set, the ID points to an allocation.
This can only happen if the *ChangeDetail* is set to QUEUE_ALLOC.

If only the *ReferenceID* is set it points to an application.
This can only happen if the *ChangeDetail* is set to QUEUE_APP.
Both cases can use the same *eventChangeType*, add or remove an allocation or an application from a queue.

The *Resource* that is part of any event would be the size of the resource for that change.
The interpretation depends on the *eventChangeType*.
For a SET it is the absolute value. For the ADD and REMOVE it is the positive delta on the existing tracked value.
The *Resource* is always a positive value.

## Event storage

The storage of events needs to be updated to allow multiple events to be stored for an *ObjectID*.
This is required as one object could trigger multiple events in a short time and all are important to track.
This will require a change from a map based storage to a different store or a change in the key used for the map.

The simplest solution might be a slice of pointers to events.
The slice has a configurable, limited set of entries.
The slice is accessed and maintained as a ring buffer.
This will prevent an unlimited growth of the schedulers memory requirements.
During the implementation a decision will be made which configuration, time; count or both, for limiting the size will be supported.

Nil, or empty, events will not be added to the storage.
However, no publisher must assume that while processing events retrieved from the buffer and needs to handle nil references.
A location in the buffer could contain a nil pointer and must be skipped while iterating over the buffer.
If a publisher gets a nil event pointer it must not crash and proceed as normal.

The current design will use two stores: one for external retrieval and one for the shim events.
A filter at the receiving end will be created.
The shim events will then be processed as per the existing implementation.
The new events will be stored and managed as per this design document in [SHIM events](#shim-events).

### Publishing events

Events are currently not post processed and all events are sent to the shim.
With the newly added events the publishing needs to be split into two separate loops.

#### SHIM events

Current functionality will be supported as described above.
Updates are required as the content of the events has changed.
The same event type will be generated.
The same processing mechanism will be used.

As part of processing events REQUEST type events are special.
The REQUEST type with the change type NONE has an application ID set and is only sent as an event to the shim.
These events must not be made available by any other publishers and are stored in a separate ring buffer.
After the event is sent to the shim the reference to the event in the buffer is cleared, replaced with a nil.

#### REST

The REST service that is currently running can be reused for exposing the events.
Proposal is to add a new endpoint to the HTTP service.
The REST endpoint servicing the event data should be a new end point.

Based on the current REST api definition the data exposed in the following new endpoint will be added to expose the events:
```text
/ws/v1/events/batch
```

The design will not define a sophisticated interface for querying events, like filtering, grouping, etc.
This is a deliberate decision.
Such an API can encourage bad practices later on.
That should be done in a separate application which fetches the events from YuniKorn and persists them in a permanent storage and offers a more feature rich REST/query interface.
This would be similar to what already exists in Apache Hadoop like Job History Server or Application Timeline Service.

As mentioned earlier in this document, such an application is not in the scope.

The batch endpoint, by default, returns a limited number of events.
The number of events to return can be specifically set via the query parameter *count*.
If the requested *count* is larger than the available number of events all events are returned.

```text
/ws/v1/events/batch?count=100
```

To prevent a DOS attack the maximum value of *count* might be limited as part of the implementation.

The second query parameter that will be supported is *start*.
This specifies the start ID of the first event returned.
Every event is assigned a unique id starting from 0.
The ring buffer maintains the current available highest and lowest ID.
If *start* refers to an ID which doesn't exist in the buffer, then an empty response is returned from the server, with *LowestID* and *HighestID* properly filled:
```json lines
{
    "InstanceUUID": "b4751b7d-a1a3-4431-bb68-bff896adb9c2",
    "LowestID": 1100,
    "HighestID": 11000,
    "EventRecords": null
}
```

In the next request, start should be defined as 1100.

In the response, the *InstanceUUID* field shows the unique instance ID.
Since YuniKorn is stateless, the generated ID for an event is not saved anywhere.
If an event consumer saves the events to a backend database, it makes it possible to distinguish between events with the same ID.
Also, clients can easily detect that YuniKorn was restarted.

#### Streaming

Streaming allows the user to see a continuous stream of events as they are occurring.
This can be very useful if we want to trace the state changes inside YuniKorn for a longer amount of time.
The REST interface can return the last "n" amount of events that occurred in a certain timeframe, but it will always be limited.
We can only increase the number of events at the expense of memory usage, which might not be acceptable in certain environments.

Although streaming is a nice feature, we do not consider it as a "must have", at least not in the first version of the history tracking.
This is because it's more complicated in nature: it maintains an open HTTP connection towards the client which makes it stateful.
There are ordering and memory usage concerns&considerations.
We need to make sure that rogue clients cannot abuse it.
Therefore, the first release of history tracking focuses on the batch interface.

Streaming needs to coexist beside the current REST api.
A separate endpoint must be exposed for the event stream:
```text
/ws/v1/events/stream
```

Streaming can be similar to how it's implemented inside Kubernetes informers.
The API server keeps the connection alive and sends the necessary events about pods, nodes, configmaps, etc.
The incoming data stream is decoded by the listeners.
Event processing on the client side is not part of this design.

At this point we do not provide endpoints for consumers to stream a specific event type as defined in [Event types](#event-types).
This could be made available via separate endpoints in the future following the same design as for *batch* specification

The *stream* endpoint does not take any query parameters.
The consumer must allow for more than one (1) event to be sent in one response.
No information besides the events will be sent in the response.

As an example below the approximate output for the stream endpoint for two events

```json
[
  {
  "type": 2,
    "changeType": 1,
    "changeDetail": 203,
    "timestamp": 1649167576110750000,
    "objectID": "spark-app-1"
  },
  {
    "type": 4,
    "changeType": 2,
    "changeDetail": 405,
    "timestamp": 1649167576110754000,
    "objectID": "root.spark",
    "referenceID": "spark-app-1"
  }
]
```

## Event overview

### Generic events

The following events are generated for streaming and REST consumers, meaning that they will not be sent to the shim.
This is based on the description of the [Event System Updates](#event-system-updates) earlier in this document.
It serves as a reference for the core scheduler actions that will trigger the event.

| Event type | Change type | Change details    | Reference type | Notes                                            |
|------------|-------------|-------------------|----------------|--------------------------------------------------|
| APP        | ADD         | DETAILS_NONE      |                | New application added                            |
| APP        | ADD         | APP_ALLOC         | AllocationID   | Successful allocation                            |
| APP        | ADD         | APP_REQUEST       | RequestID      | Incoming resource request (pod)                  |
| APP        | REMOVE      | DETAILS_NONE      |                | Normal removal of application                    |
| APP        | REMOVE      | APP_REJECT        |                | Application rejected                             |
| APP        | REMOVE      | ALLOC_CANCEL      | AllocationID   | Normal removal requested by the shim             |
| APP        | REMOVE      | ALLOC_TIMEOUT     | AllocationID   | Timeout                                          |
| APP        | REMOVE      | ALLOC_REPLACED    | AllocationID   | Replacement (placeholder)                        |
| APP        | REMOVE      | ALLOC_PREEMPT     | AllocationID   | Preemption triggered                             |
| APP        | REMOVE      | ALLOC_NODEREMOVED | AllocationID   | Removal triggered by node removal                |
| APP        | REMOVE      | APP_REQUEST       | RequestID      | Normal removal requested by the shim             |
| APP        | REMOVE      | REQUEST_TIMEOUT   | RequestID      | Timeout (placeholder)                            |
| APP        | REMOVE      | REQUEST_CANCEL    | RequestID      | Removal triggered by application removal         |
| APP        | SET         | APP_NEW           |                | State change: New                                |
| APP        | SET         | APP_ACCEPTED      |                | State change: Accepted                           |
| APP        | SET         | APP_STARTING      |                | State change: Starting                           |
| APP        | SET         | APP_RUNNING       |                | State change: Running                            |
| APP        | SET         | APP_COMPLETING    |                | State change: Completing                         |
| APP        | SET         | APP_COMPLETED     |                | State change: Completed                          |
| APP        | SET         | APP_FAILING       |                | State change: Failing                            |
| APP        | SET         | APP_FAILED        |                | State change: Failed                             |
| APP        | SET         | APP_RESUMING      |                | State change: Resuming                           |
| APP        | SET         | APP_EXPIRED       |                | State change: Expired                            |
|            |             |                   |                |                                                  |
| NODE       | ADD         | DETAILS_NONE      |                | New node added to the cluster                    |
| NODE       | ADD         | NODE_ALLOC        | AllocationID   | Successful allocation                            |
| NODE       | REMOVE      | NODE_DECOMISSION  |                | Removal requested by the shim                    |
| NODE       | REMOVE      | NODE_ALLOC        | AllocationID   | Normal allocation removal requested by the shim  |
| NODE       | SET         | NODE_READY        |                | Update "ready" status                            |
| NODE       | SET         | NODE_SCHEDULABLE  |                | Update "schedulable" status                      |
| NODE       | SET         | NODE_CAPACITY     |                | Update node capacity                             |
| NODE       | SET         | NODE_OCCUPIED     |                | Update occupied resources                        |
| NODE       | ADD         | NODE_RESERVATION  |                | Add reservation to a node                        |
| NODE       | REMOVE      | NODE_RESERVATION  |                | Remove reservation from a node                   |
|            |             |                   |                |                                                  |
| QUEUE      | ADD         | DETAILS_NONE      |                | Adding new configured queue                      |
| QUEUE      | ADD         | QUEUE_DYNAMIC     |                | Adding new dynamic queue                         |
| QUEUE      | ADD         | QUEUE_APP         | ApplicationID  | Application added                                |
| QUEUE      | REMOVE      | DETAILS_NONE      |                | Removing configured queue                        |
| QUEUE      | REMOVE      | QUEUE_DYNAMIC     |                | Removing dynamic queue                           |
| QUEUE      | REMOVE      | QUEUE_APP         | ApplicationID  | Application removed                              |
| QUEUE      | SET         | QUEUE_MAX         |                | Max resource changed                             |
| QUEUE      | SET         | QUEUE_GUARANTEED  |                | Guaranteed resource changed                      |
| QUEUE      | SET         | QUEUE_TYPE        |                | Queue type change(parent/leaf)                   |

### Shim events

Shim events are a type of REQUEST and the application ID is set. 
Right now we send only two types of events to the shim, both of which are originated from the application:

-   Insufficient resources in the queue for a request
-   Real allocation is larger than placeholder

| Event type | Change type | Change details | Reference type | Notes                 |
|------------|-------------|----------------|----------------|-----------------------|
| REQUEST    | NONE        | DETAILS_NONE   | ApplicationID  | New application added |               
| REQUEST    | NONE        | DETAILS_NONE   | ApplicationID  | Successful allocation |

## Configuration

As part of the design we anticipate the following configuration to be added for the event storage and retrieval. 
All settings will have the shared prefix: *service.event*. 
All the mentioned settings will require a restart of the scheduler for updates to take effect.

The following settings will be added to the system:

A flag to enable or disable sending request events to the K8shim.
This externalises the current setting that needs a recompile of the code. 
The default mirrors the current default in the code.

-   Name: **requestEventsEnabled**
-   Allowed values: all boolean values will be converted into a boolean using ParseBool as defined in the `strconv` package[^1].
-   Default value: false

A flag to enable or disable event collection in the system. 
The default is enabled for the tracking events.

-   Name: **trackingEventsEnabled**
-   Allowed values: all boolean values will be converted into a boolean using ParseBool as defined in the `strconv` package.
-   Default value: true

Size of the store for events that will be sent to the shim, request events.
Note that setting a size of 0 effectively turns off the request event system.

-   Name: **requestStoreCapacity**
-   Allowed values: integer value that can be converted into a 32-bit integer using ParseUint as defined in the `strconv` package[^2].
-   Default value: 1,000

The number of events to store in the ring buffer. 
This number defines the size of the ring buffer and thus the memory impact the event storage will have on the scheduler. 
Note that setting a size of 0 effectively turns off the event collection system.

-   Name: **ringBufferCapacity**
-   Allowed values: integer value that can be converted into a 32-bit integer using ParseUint as defined in the `strconv` package
-   Default value: 100,000

The maximum number of events to return in one REST response. 
The maximum that could be returned is limited to the ring buffer capacity.
However, preparing a large response the size of the whole ring buffer could cause large peaks in the schedulers memory usage.
This setting should be used to prevent these peaks.

-   Name: **RESTResponseSize**
-   Allowed values: integer value that can be converted into a 32-bit integer using ParseUint as defined in the `strconv` package
-   Default value: 10,000

## Performance considerations

### Memory usage of historical elements

We need to estimate how many elements we can expect to be generated with different pod churn rates on a daily basis. 
Queue and node events are much rarer, so they are not accounted for.
We also ignore potential failures and scheduling errors.

An application undergoes state transitions, so the following events are generated:
-   Add new application
-   State change: New
-   State change: Accepted
-   State change: Starting
-   State change: Running
-   State change: Completing
-   State change: Completed
-   Allocation changed

Pod (request) events:
-   Incoming allocation request
-   Successful allocation on a node

Pod (request) events with gang scheduling:
-   Incoming resource request
-   Successful allocation on a node
-   Replace event for placeholder

| Number of pods | Number of apps | Pods per app | Job type | Events per app | Events per pod | ∑ apps            | ∑ pods          | ∑ events |
|----------------|----------------|--------------|----------|----------------|----------------|-------------------|-----------------|----------|
| 150k           | 1500           | 100          | normal   | 200 + 7        | 2              | 310k (1500 * 207) | 300k (2 * 150k) | 610k     |
| 150k           | 1500           | 100          | gang     | 300 + 7        | 3              | 460k (1500 * 307) | 450k (3 * 150k) | 910k     |
| 300k           | 3000           | 100          | normal   | 200 + 7        | 2              | 621k (3000 * 207) | 600k (2 * 300k) | 1,2M     |
| 300k           | 3000           | 100          | gang     | 300 + 7        | 3              | 921k (3000 * 307) | 900k (3 * 300k) | 1,8M     |

On a busy cluster with 150,000 - 300,000 pods per day, we can expect the number of events generated to be around 600k - 1,8M (depending on the scheduling style).

If we want to retain the events for 5 days, we need to store 9 million events in the worst case and 3 million in the best case.

With 9 million objects in the memory, it is also critical to estimate how much extra memory usage is expected from YuniKorn with different kinds of data structures:

-   slice of pointers to si.EventRecord objects `[]*si.EventRecord`
-   slice of si.EventRecord objects `[]si.EventRecord`
-   slice of a memory-optimised data type `[]internalRecord`

As the name suggests, internalRecord type would only be available inside the ring buffer.
It's used together with string interning to save memory caused by repeated strings like IDs (application ID, ask ID, allocation ID, etc.).
There are various interning libraries in Go, but removing elements is not possible from them.
We need to create our own, so we can track the number of references per string.

The following table summarizes memory usage and GC time, depending on how we store the events.
The test was executed multiple times to get averages and ranges.
The slice was created once, then an index variable was increased for each record, so the built-in `append()` function was not used.

The results clearly indicate two things:

-   having millions of pointers has negative performance on both the memory usage and GC load
-   batch workloads inherently have a lot of repeated strings, so interning makes a noticeable difference

The GC detects pointers, since it has to follow them to walk the object graph to identify unreferenced objects.
If elements in the slice are pointers, then those allocations are scattered all around the heap (bad locality) with header information added by the allocator.
This reduces memory access times and increases the amount of the data that is allocated.

In the test, the assumption was 100 pods per application.
In real life, this value might be different, most likely it's lower.
The lower the value, the smaller the advantage of the interning - on the extreme, every application consists of only one pod.
But even with only 30 pods per application, it has value - more modest, 20-30% reductions are not negligible when storing millions of elements.

| Object type       | Number of elements | Increased memory usage\* | GC time\*\* |
|-------------------|--------------------|--------------------------|-------------|
| []*si.EventRecord | 3M                 | 805 MiB                  | 85-105 ms   |
| []si.EventRecord  | 3M                 | 437 MiB                  | 41-55 ms    |
| []internalRecord  | 3M                 | 211 MiB                  | 5-16 ms     |
| []*si.EventRecord | 6M                 | 1595 MiB                 | 160-200 ms  |
| []si.EventRecord  | 6M                 | 856 MiB                  | 75-110 ms   |
| []internalRecord  | 6M                 | 404 MiB                  | 10-30 ms    |
| []*si.EventRecord | 9M                 | 2380 MiB                 | 270-320 ms  |
| []si.EventRecord  | 9M                 | 1280 MiB                 | 116-150 ms  |
| []internalRecord  | 9M                 | 593 MiB                  | 16-33 ms    |

*\* "Sys" metrics returned by the Go runtime*

*\*\* measured by the execution time of `runtime.GC()`*

### Handling slow and rogue clients during streaming

It's possible to overwhelm YuniKorn with streaming or execute a DoS attack.

The first thing we need to address is a rogue client which simply stops reading on the receiver side from the TCP socket.
Eventually writes will block in YuniKorn. 
If we use channels and per-client goroutines, this should not be an issue - we can always check if the buffer is full using the built-in len() function.
If this happens, we can just drop the connection.
In some situations, the buffer is expected to be full, for example, when sending history.
It's always faster to send out a lot of existing objects, so we can expect the buffer to get full at times. 
This can be solved by repeatedly checking the rate of writes - if it falls below a certain threshold, then again, we just drop the connection with an error message.

We can also limit the number of concurrent streaming connections and historical objects to send, e.g. we simply won't serve requests which would result in sending millions of elements.

Note that it's still possible to deny the service from legitimate users because YuniKorn lacks authentication on the REST interface. 
This will be solved in the future.

### Approaches to streaming

When a client requests a stream of events, it can define how many past events it wants to receive.
This is necessary because when YuniKorn starts up, it's not possible to connect immediately. 
It can be important for certain users to save the state of YuniKorn on an external storage completely from the start.

Sending the historical events must be separated from the new events that are constantly occurring in the system, that is, old and current events must not interleave.
For example: we want a stream of old and new events, this means:

-   We're currently at *event~n~*
-   Send out events from *event~0~* all the way up to *event~n~*
-   In the meantime, *k* number of events have been generated
-   Therefore, send events up to event*~n+k~* until we're caught up completely

#### **Send history first, then stream new events**

The first approach is to retrieve the objects from the ring buffer and start to send them on a channel to the receiver.
There is a separate buffered channel for new events with capacity *localBufferSize*. 
As soon as we finish sending the history, we switch to this channel and relay events from it towards the client.

We can express this with the following pseudocode:
```go
consumerEventLoop(elementCount) {
    local = initLocalEventChannel(localBufferSize)
    // send history
    history := ringbuffer.getHistory(elementCount)
    foreach h : history {
        receiver <- h
    }
    // bridge new events
    foreach e : <-local {
        receiver <- e
    }
}
```

The publisher logic is:
```go
publishEvent(event) {
    foreach c : localChannels {
        if len(c) == localBufferSize { // local buffer full?
            closeChan(receiver)
            closeChan(local)
            receiverId = getReceiver(c)
            abort("slow receiver: " + receiverId)
        }
        c <- event
    }
}
```

Each receiver has its own goroutine.
That is, 10 clients means 10 different `consumerEventLoop()` calls running on separate goroutines.

To detect slow clients, we simply check the value of `len(c)` whenever we submit the new event.
If this equals the capacity of the buffer, we drop the receiver and close the connection.

It is possible to send events directly to the receiver channel and skip `c` on the publisher side which is local inside consumerEventLoop.
This requires a simple state machine and a temporary slice of new events, since we are not allowed to send directly as long as the history is being transmitted.
Overall, this is more complicated than the one described above.

The simplicity of this method is notable, which is the main advantage: reasoning about its correctness is trivial. 
We do not need complicated test code and back-and-forth review cycles to ensure that it indeed results in the correct order of events.

The biggest question is what happens if channel local becomes full. 
Let's say that localBufferSize is 1000. 
On a busy cluster with 100 events / second (busiest period), it takes 10 seconds to fill it up completely. 
However, nothing stops us from setting the capacity of the buffer to a higher value. 
If we bump it up to 10000, the client is expected to read the history in 100 seconds. 
On a decent network, this amount of time should be enough to read the event history, even if it means 100 000 entries from the ring buffer. 
If a single si.EventRecord results in 300 bytes of JSON text, then it is around 30MiB of data.
Even if we take serialisation into account, this will not (can not) take minutes.

The biggest disadvantage of this method is when a user requests a lot of elements from the history.
For example, someone wants to retrieve the last 1M elements.
In this case, we need to allocate a slice for 1M entries.
Based on the measurements, this will generate a sudden spike in the live heap size, around 145-150 MiB. If people repeatedly do this, the memory allocation of YuniKorn can increase very quickly, possibly resulting in a termination of the YuniKorn pod by the kubelet.

#### **Stream new events directly from ring buffer**

Instead of notifying receivers directly, we just insert the data into the ring buffer.
For every client, we create a cursor which points to a given position inside the buffer. 
If the pointer is behind the tail, it just keeps reading and going forward until it reaches the current tail.

Although this method sounds simple on the surface, the implementation is complicated:

-   When sending the history, we can't rely on `len(buf)` checking.
It is because when we are sending the history, we are always very close to the capacity.
Unlike the previous solution, we are processing elements from the buffer directly, and we do not bridge two channels. 
If we do that, we just add further complications.
Therefore, we have to calculate the sending rate, at least while sending past objects.
If the pointer is not making progress (or just very slow), then the tail of the ring buffer will catch up to it, but it can take a very long time.
-   In case of multiple cursors, we have to maintain which one is the closest to the tail.
If we don't do that, we have to check every cursor when adding elements.
We cannot wait for a slow reader to jump to the next element, so we have to invalidate the cursor, then have to calculate which is the nearest to tail again.
-   Whenever we reach the last element, we have to block and utilize the well-known wait-notify pattern (`Cond.Broadcast()` and `Cond.Wait()` in Go).
-   The overall sending logic is much more complicated: keep reading batches from the ring buffer until we reach the last element, then switch to wait-notify and block.

The advantage of this method is that we don't need large channel buffers to make sure that they don't get filled while sending historical records.
If the reader is fast enough, we just keep marshalling `si.EventRecord` objects and bump the pointer to the next element.

[^1]: https://pkg.go.dev/strconv#ParseBool

[^2]: https://pkg.go.dev/strconv#ParseUint
