---
id: priority_scheduling
title: Priority Scheduling
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

Currently, YuniKorn can sort at two levels: the applications in a queue and
the resource requests within the application. The queue sorting policy is
configurable and supports a _Fair_ or _FIFO_ policy. _StateAware_ is
considered a filtered _FIFO_ policy. Applications cannot be sorted based
on priority.

Within an application, requests are sorted based on priority of the requests.
For requests that have the same priority the submission time is used as a
secondary sort key. Requests are sorted in _FIFO_ order if they have the
same priority. Note that the priority of requests was not propagated from
the shim to the core until
[YUNIKORN-1235](https://issues.apache.org/jira/browse/YUNIKORN-1235) was
implemented in v1.0.0. Until that implementation all requests were created
with the _default_ priority.

Additionally, Kubernetes uses priority as a sort when performing preemption.
YuniKorn currently only does preemption of requests if a node-specific task
needs to be scheduled (i.e. a DaemonSet pod,
[YUNIKORN-1085](https://issues.apache.org/jira/browse/YUNIKORN-1085)).

## Goals

- Attempt to be compatible with Kubernetes standard priority handling
  wherever possible
- Priority should be orthogonal to application sorting policies (i.e.
  _Fair_, _FIFO_ and _StateAware_ policies should support prioritization)
- It should be possible to limit the scope of priority handling
- Design of priority scheduling should consider the impact on preemption
  design

## Non Goals

- Design of preemption
- Change AllocationAsk sorting within an application

## Definitions

The following terms are defined as follows and will be used throughout this
document.

### Priority

Priority is a numeric value associated with an Ask. Higher-priority asks have
higher numeric values. To be compatible with Kubernetes, all 32-bit signed
integers are considered valid priorities. An ask without a specific defined
priority is assumed to have the default priority.

### Minimum Priority

Minimum priority is defined as the lowest possible priority, or
`-2,147,483,648` (- 2<sup>31</sup>).

### Maximum Priority

Maximum priority is defined as the highest possible priority, or
`2,147,483,647` (2<sup>31</sup> - 1). Note that Kubernetes does not permit
custom priority classes (see below) to define priorities greater than
`1,000,000,000` (1 billion). Values higher are reserved for system-level
priorities.

### Default Priority

Default priority is defined as the value `0`.

### PriorityClass

A [PriorityClass](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#priorityclass)
is a Kubernetes object which maps between a priority name and an integer
priority value. The name cannot start with `system-` as that prefix is
reserved for Kubernetes internal usage.

Additionally, a `preemptionPolicy` may be set on a PriorityClass. Official
GA support was added in Kubernetes 1.24. The preemption policy is only
used while scheduling the pod itself. It is not taken into account after
the pod is scheduled.

The policy defaults to `Never`, implying that pods of this priority will
never preempt other pods. `PreemptLowerPriority` is also possible, which
allows the scheduler to preempt pods with lower priority values.

When a pod is submitted with its `priorityClassName` set to a valid priority
class, a Kubernetes-provided admission controller will automatically update
the `priority` and `preemptionPolicy` fields of the pod to match those of the
referenced PriorityClass. Pods that specify a priority as part of the
specification are rejected if the integer value set on the pod does not match
the PriorityClass value.

#### Pre-defined PriorityClass objects
- system-cluster-critical: `2,000,000,000`
- system-node-critical: `2,000,000,100`

## Current state

The framework for priority is minimally implemented within YuniKorn. The
_AllocationAsk_ structure within the scheduler interface already contains a
_priority_ field which is populated by the shim based on the _priority_ field
on a Pod.

One priority can be set on creation of the _AllocationAsk_. Each
_AllocationAsk_ within an application may have its own priority.
_AllocationAsk_ sorting is based on this priority. This means that within the
application asks or pods are sorted based on priority. High-priority asks will
be scheduled before low-priority asks.

Priorities are currently also used for the minimal DaemonSet preemption process
implemented in [YUNIKORN-1085](https://issues.apache.org/jira/browse/YUNIKORN-1085).
Possible victims are sorted based on their priority among other things. The
priority of the _Allocation_ is the same as the _AllocationAsk_ they
represent.

One use of the capability to set a priority for each _AllocationAsk_ could be to
enable dynamic allocations such as those utilized by Apache Spark. An
application can submit a set of asks at high priority that will be scheduled
as soon as possible, and a set of lower-priority asks that can be used for
additional capacity if available.

## Proposal

### Priority fencing

By default, priority applies across queues globally. In other words, a
higher-priority ask will be attempted to be satisfied before a lower-priority
ask regardless of which queue the asks reside in.

However, it is often useful to limit the scope of priority handling. For
example, it may be desirable to limit the ability of asks in one area of the
queue hierarchy from jumping ahead of asks in another area. To support this,
we add the concept of a _Priority Fence_. A queue (either _leaf_ or _parent_)
may be configured as priority-fenced, which prevents priorities from
propagating upward.

If a queue is fenced, asks within that queue (and subqueues) will be
prioritized relative to each other, but not relative to asks in other portions
of the queue hierarchy. A priority fence is a YuniKorn queue subtree boundary
above which priorities are no longer considered. A priority fenced queue does
not expose priority levels of its children to its parent queue, thereby
ensuring that priorities are only considered within that queue and its
descendants.

Priority fences may be nested; for example a fenced queue `tenant 1` may have
child queues `queue A` (fenced) and `queue B` (unfenced). In this case tasks
in `queue A` will show as the default priority and will not be prioritized
above `queue B`, but tasks in `queue B` may be prioritized over those in
`queue A`. In no case will tasks in either queue be prioritized over tasks
outside the scope of queue `tenant 1`, as they show as the default priority
(shown in the diagram below with yellow arrows).

A similar setup is created for the `tenant 2` queue. However in this case the
priorities from `queue 1` to `queue 2` and vice-versa are fully visible
(shown in the diagram below with blue arrows).

None of the tasks running in the queues below `tenant 1` or `tenant 2` can be
prioritized above the `system` queue. Tasks in the `system` queue are not
fenced. That means that a task in the `system` queue can be prioritized above
any queue in the hierarchy (shown in the diagram below with red arrows).

![priority flows](./../assets/priority-flows.png)

### Priority offset

Priorities need to be pre-defined at the cluster level via the PriorityClass
objects. At the Kubernetes level there is no way to limit which priorities can
be used in which part of the system. The only exception to that rule are the
pre-defined system priorities from the Kubernetes system itself. This does not
give an administrator a lot of control.

Prioritizing a specific queue above another queue based on the priorities of
the tasks inside the queue is thus difficult. Any user can start a task with
any priority anywhere in the cluster. To allow an administrator more control
we need to be able to steer, or augment, the priority of a queue. To
accomplish this, we introduce the `priority.offset` property of a queue.

The `priority.offset` property on a queue allows the administrator to increase
(or decrease) a queue's priority. By using the offset a queue can be boosted
to become a high-priority queue. It also can be used to decrease the priority
compared to its siblings.

As a general rule: the priority of a _leaf_ queue is equal to the maximum
priority of the AllocationAsks in that queue, plus the `priority.offset`
value. The priority of a _parent_ queue is the maximum of the priority of its
child queues plus the `priority.offset` value. This means that priority
offsets are additive when traversing up the queue hierarchy. A priority offset
may be any valid signed `int32` value. The offset is applied after the dynamic
priority for the queue is calculated.

As a note of caution: a side effect of a very large offset value for a queue
could result in all pods in that queue being clamped at the maximum priority
level or exceeding the priority of Kubernetes system priority classes. This
could then adversely impact the scheduling of node and or cluster critical
pods in sibling queues. This effect needs to be clearly documented. Logging a
warning about a configured value that high should also be considered.

A second option that was considered is limiting the offset value to
`999,999,999`. This would prevent the offset priority from exceeding the
pre-defined system priorities. This would be a safe option but does not take
into account the fact that we can have negative priorities that we want to
offset. The current choice is to go with the first option to document and log.

Fencing affects the priority calculation for the queue. When a queue is
fenced (i.e. the `priority.policy` is set to `fence`), queue priority
calculations are disabled for that queue. The result of application priority
or child queue calculations are ignored for a fenced queue. The priority of
the fenced queue is always set to the default priority or to the priority
offset, if specified.

### Extended application sorting

Applications are currently sorted based on one of the defined application
sorting policies. All application sorting policies only take into account
applications that have pending requests.

Currently defined are _Fair_, _FIFO_, and _StateAware_:

- _Fair_ sorting sorts based on relative usage within a queue
- _FIFO_ sorts applications by creation time in a first-in, first-out manner
- _StateAware_ is similar to _FIFO_ except that only a single "new"
  application is allowed at once (this is an over-simplification, but will
  suffice here)

To support priority scheduling, the policies _Fair_ and _FIFO_ will get an
equivalent policy that considers the priority of an application first. For
applications that have the same priority, sorting will then fall back to the
secondary sort criteria (_Fair_ or _FIFO_).

_StateAware_ as a special form of _FIFO_ will however always filter
applications first and then sort. A priority based version of _StateAware_
must change the way it filters. The single "new" application that is
considered can no longer be the oldest application. That would be a major
behavioral change from the current policy.

The existing policies will not be changed to maintain backwards
compatibility. None of the existing policies have a tiebreak built in. In
the case the comparison returns equality the order of the elements is not
changed.

Instead of introducing new policies to add priority to the existing
behavior a flag will be added that allows switching priorities on or off.
The property will be added to the queue.

New property: `appication.sort.priority`

### Extended queue sorting

Queue sorting currently only supports one policy: _Fair_. Queues cannot
be sorted using a _FIFO_ mechanism. _FIFO_ sorting of queues is not in
scope of this design. However the design has allowed for a simple addition
of a new policy.

The _Fair_ policy works similarly to application _Fair_ sorting, except
that it sorts based on usage ratios between two queues. Allocations are
compared to guaranteed resources. This results in the queue furthest below
its guaranteed resource to be first in the sorted queue list as it is
considered "more starved". For queues that have the same usage ratio,
the queue with the highest pending requests is considered more starved.

To add priority support, a new property will be added to consider the
current queue priority as the main sorting factor. To break the tie between
queues with the same priority, starvation like in the _Fair_ policy will be
used. Again breaking the tie for queues with the same _Fair_ usage using the
pending requests.

The existing policy will not be changed to maintain backwards compatibility.
The same property as used for application sorting will be reused to control
priority behavior.

New property: `application.sort.priority`

### Priority Configuration

#### Queue Configuration

Three new attributes will be added to the queue configuration object to allow
specifying the priority fence type and priority offset and priority sorting.
All properties `priority.policy`, `priority.offset`, and
`application.sort.priority`, can be set on any queue. The attributes are part
of the queue properties as follows:

```yaml
queues:
  - name: fencedqueue
    properties:
      priority.policy: fence
      priority.offset: 100
      application.sort.priority: enabled
```

The `priority.policy` and `priority.offset` fields are not inherited from the
parent queue to a child queue; they apply only to the queue they are specified
on.

Note that the `application.sort.priority` field is only inherited if the value
is set to `disabled` (the `enabled` value is already the default). This allows
priorities to be ignored for an entire queue subtree by setting the property
on the parent queue.

Properties are fully supported in child templates. Support for setting these
properties for dynamic queues is included as part of the existing
functionality.

The supported, not case sensitive, values for the `application.sort.priority`
are:

 - `enabled`
 - `disabled`

The proposal is to default to `enabled` for the `application.sort.priority`
property. Given that the Kubernetes default scheduler and preemption support
are all based on priorities that choice seems more logical than `disabled`.

The `application.sort.priority` when set on a _parent_ queue affects the way
the queues are sorted. It will change queue sorting from the standard _Fair_
sorting to priority-based sorting. To break the tie for equal priority
queues it will use the _Fair_ comparison. When set on a _leaf_ queue it will
change the application sorting itself. All three existing policies will be
supported with `application.sort.priority` set to `enabled` or `disabled`.
For the `disabled` case nothing will change and the old behavior is
maintained. For the `enabled` case the primary sort will be priority and the
configured policy (_Fair_, _FIFO_,  or _StateAware_) will be used as
tiebreakers.

The `priority.policy` and `priority.offset` can be set on the `root` queue
but have no effect. The root `queue` as the top of the hierarchy has no
parent. This means priority cannot traverse further up the tree. No messages
will be logged if the `priority.policy` or `priority.offset` are set on the
`root` queue.

The supported, not case sensitive, values for the `priority.policy` are:

- `default`
- `fence`

If the value `fence` is set on a queue, the queue on which the property is
set does not propagate its priority outside of the queue's subtree. The value
`default` does not fence the queue. If no policy is set the value `default` is
used.

The `priority.offset` value must be a valid integer in string form. The value
will be converted into an integer using the standard parsing methods as defined
via: [`strconv.ParseInt`](https://pkg.go.dev/strconv#ParseInt)`(s, 10, 32)`.

If no `priority.offset` property is specified in the queue the default of `0`
is used. Specifying the property with an empty value is equivalent to `0`. If
parsing of the string fails the default of `0` is used.

### Scheduler storage object changes

#### Application

The _Application_ object within the scheduler core will be updated with a
dynamic priority value, defined as the maximum priority of all pending asks.
To avoid sorting performance degradation, this value should be cached and
recomputed only when allocation asks are added, allocated, or removed.

This recalculation can be avoided in many instances. When new asks are added,
an application's priority need not be recalculated unless the priority of the
new ask is greater than that of the application as a whole. Similarly, when
removing an ask, the priority need not be adjusted unless the ask's priority
is equal to the application's priority. When recalculating priority due to
adding a high-priority ask, the application's priority can simply be set to
the new ask's priority. When recalculating due to removal of an ask of equal
priority to the application, we can stop considering additional asks as soon
as any other ask of equal priority is encountered. This means that the
performance impact of application priority updates will be `O(1)` when adding
an ask, and at worst `O(n)` when removing an ask.

New field: `askMaxPriority`

#### Queue

The new configuration values need to be maintained on the queue. Besides those
values the _Queue_ object within the scheduler core will be updated with a
dynamic priority value. This dynamic priority will be defined as the maximum
priority of all applications within the queue, plus any "priority offset"
configured.

To avoid sorting performance degradation, this value should be cached and
recomputed only when necessary. For a _leaf_ queue, this is required if
application priorities in the queue have changed, and for a _parent_ queue this
is required if the priorities of child queues have changed.

New fields: `priorityPolicy`, `priorityOffset`, `currentPriority`

