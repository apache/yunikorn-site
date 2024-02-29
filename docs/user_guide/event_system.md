---
id: event_system
title: event_system
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

# Overview

The Yunikorn scheduler core generates well-defined events at various points during the execution. Since an event has a fixed structure, it is an ideal input for automated tools for further processing. Although Yunikorn has extensive logging, the output is textual and needs to be parsed. Not only is it error-prone, but also nothing guarantees that it never changes over time: it might be completely removed in a future release or the log level can change. 

The event object is defined in the scheduler interface repository along with the constants that describe a certain event.

Certain types of events which are related to pods and nodes are also sent to Kubernetes itself. This allows the users to identify certain problems that can arise from misconfiguration, such as insufficient queue or user quota. If a pod is pending because the quota is exceeded, it will be updated with an event about why it cannot be scheduled. Previously this had to be inferred from the logs or state dump.

Various properties of the event subsystem are configurable. Changes are picked up and applied immediately.

# Event types

Events always describe a specific object type. There are four types of events: application, queue, node and user/group.
When it is appropriate, the event will be sent to Kubernetes using the K8s event API. Since the API requires a "regarding" object (ie. which K8s object the event is about), we only send node and pod events.

The following table summarizes when they are generated.

| Type | Event | Notes |
|--|--|--|
| Application | A new application is created ||
| Application | Application state transition ||
| Application | Successful allocation ||
| Application | An ask is added to the application ||
| Application | Application removed ||
| Application | Application rejected ||
| Application | Ask removed ||
| Application | Allocation removed ||
| Application | Placeholder timeout ||
| Application | Allocation replacement (gang scheduling) ||
| Application | Application is not runnable due to maxApplications | Queue or user maxApps limit |
| Application | Application has become runnable | Only sent if limit was hit before |
| Application | Ask is not schedulable due to quota limitations | Sent to Kubernetes to the respective pod |
| Application | Ask has become schedulable (there is quota now) | Sent to Kubernetes to the respective pod<br/> Only sent if quota was not available before |
| Application | Ask is not schedulable due to predicate error * | Sent to Kubernetes to the respective pod<br/> Rate limited: sent once in every 15 seconds |
| Application | Real allocation is larger than the placeholder | Sent to Kubernetes to the respective pod |
| Node | New node added to the scheduler core | Sent to Kubernetes to the respective node |                             
| Node | Node removed from the scheduler core | Sent to Kubernetes to the respective node |
| Node | Allocation added to a node ||
| Node | Allocation removed from a node ||
| Node | Node "ready" status changed ||
| Node | Node "schedulable" status changed ||
| Queue | Queue added to the scheduler core ||
| Queue | Application added to a queue ||
| Queue | Queue removed from the scheduler core ||
| Queue | Max resource changed | From leaf to parent or vice-versa ||
| Queue | Queue type changed ||
| User/group | Limit configured for a user ||
| User/group | Limit configured for a group ||
| User/group | Limit removed for a user ||
| User/group | Limit removed for a group ||
| User/group | Resource usage increased for a user ||
| User/group | Resource usage increased for a group | Only sent if group limit is active |
| User/group | Group tracking got associated with a user| Only sent if group limit is active |
| User/group | Group tracking removed from a user| Only sent if group limit is active |

`*` a predicate is a plugin located in the default scheduler. They're responsible for functionality like node selectors, affinity, anti-affinity, etc. Yunikorn runs the predicates for every allocation to see if it fits the candidate node.

# In-memory storage of historical events

Yunikorn stores a previously generated event objects in a ring buffer. Once it gets full, oldest elements are overwritten. The default size of the buffer is 100000.
On a busy cluster this might not be enough. The size can be changed in the configmap by using the key `event.ringBufferCapacity`.
Keep in mind that increasing the size results in higher memory usage and longer GC pause times. Events that are put in the ring buffer are not removed, only overwritten.
If the size of the buffer gets smaller after a config change, the oldest entries that do not fit are discarded.

Every event is assigned an ID starting from 0. This can be used to fetch them based on ID.

Yunikorn currently does not offer a solution which stores the generated events in a persistent storage. However, this might change in the upcoming releases.

# Retrieving events

The REST API provides two ways to see the generated events.

## Batch REST endpoint

The batch endpoint is available at `/ws/v1/events/batch`. If not defined, the start ID is 0 and a maximum of 10000 events are returned. This can be changed by defining the "start" and "count" URL query parameters.

See [batch interface](../api/scheduler.md#batch-events) for details.
 
## Streaming REST endpoint

The streaming endpoint is available at `/ws/v1/events/stream`. Unlike the batch interface, which closes the connection after the query, streaming keeps the HTTP connection open. There is no idle timeout, so as long as the connection is stable, it is never closed. New events are sent immediately to active clients. The URL parameter "count" is also accepted; it tells Yunikorn how many recent events we want to fetch that were generated before the connection.

Since this approach uses more resources inside Yunikorn, the number of streaming connections is limited, but the limits are configurable. See [streaming](../api/scheduler.md#event-stream) for details. Existing connections are not closed after configuration change.

The active streaming connections are also shown in the state dump.

# Event structure

A Yunikorn event has the following fields:

| Name | Description | Always set |
|--|--|--|
| ObjectID | Identifies the object what the event is about. | Yes |
| ReferenceID | Identifies a secondary object which is related to the first one. It can be an allocation ID, queue, etc. | No |
| Message| Textual details. Relevant if it is sent to Kubernetes. | No |
| Type | The type of the ObjectID: application, queue, node, user/group. | Yes |
| EventChangeType | The nature of the change: adding, setting, removing or none. | Yes |
| EventChangeDetail | Further details about the change itself. | Yes |
| TimestampNano | Unix nanotime inside Yunikorn when the event was generated. | Yes |
| Resource | Set if the event involves a resource (eg. allocation occurs).| No|

Example: when an allocation occurs, we generate three events: an application event, a node event and a user event about the usage (there's a group event if the limits are configured in a certain way, but it's not relevant in this example).
We use the following unique identifiers:
* Application is "app-1"
* The request is "req-1"
* The selected node is "node-1"
* Application belongs to the user "yunikorn"
* The application has been placed in the queue "root.test"

| What the event describes | ObjectID | ReferenceID | Type | EventChangeType | EventChangeDetail |
|--|--|--|--|--|--|
| Allocation occurred for a request | app-1 | req-1-0 * | `EventRecord_APP` | `EventRecord_ADD` | `EventRecord_APP_ALLOC` |
| Allocation on a node | node-1 | req-1-0 * | `EventRecord_NODE` | `EventRecord_ADD` | `EventRecord_NODE_ALLOC` |
| Resource usage changed for a user | yunikorn | root.test | `EventRecord_USERGROUP` | `EventRecord_ADD` | `EventRecord_UG_USER_RESOURCE` |

`*` the allocation ID is based on the ask ID plus a counter.

All events will contain the allocated resource.

# Disabling the event system

Although it has negligible overhead, it is possible to completely disable Yunikorn events. This can be achieved by setting `event.trackingEnabled` to `false`. This does NOT clear the ring buffer contents, so the history recorded until the change is still available.

