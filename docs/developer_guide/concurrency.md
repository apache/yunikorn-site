---
id: concurrency
title: Concurrency and Object Conventions
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

The scheduler is concurrent by design: a scheduling loop, a set of event handlers and a number of
background services all run at the same time and touch the same objects. The rules that keep that
safe are followed consistently in the code, but most of them are recorded only as comments on
individual functions. This page collects them.

It is aimed at anyone changing scheduler code or reviewing such a change. It describes the
conventions as they are, not as a proposal.

## Locking

All locks in `yunikorn-core` and `yunikorn-k8shim` are created through the `pkg/locking` package
rather than using `sync` directly. That package wraps
[go-deadlock](https://github.com/sasha-s/go-deadlock), so every lock taken through it can be checked
at runtime for lock order violations and for waits that never complete. Using `sync.Mutex` or
`sync.RWMutex` directly in scheduler code silently opts out of that checking.

### Lock order

Locks are acquired downward through the object hierarchy, never upward:

```
ClusterContext
  └── PartitionContext
        └── Application
              ├── Queue
              ├── Node
              ├── Allocation
              └── ugm user and group trackers
```

Scheduling holds the application write lock for the duration of a scheduling attempt and calls into
the queue, the node and the user group manager while holding it. Those objects therefore sit below
the application in the order, and none of them may call back into an application while holding their
own lock.

### Two prohibitions

**The partition write lock must not be held while manipulating an application, a queue or a node.**
The reason is recorded on the `PartitionContext` struct itself. Scheduling runs continuously as a
background task and takes the application write lock first; while holding it, it asks the partition
for a list of nodes, which needs a partition read lock. Holding the partition write lock across an
application update creates the opposite order and can deadlock. Hold the partition lock only while
changing partition fields, and release it before working on the objects it refers to.

**A queue must not hold its own lock while calling its parent or its children.** Retrieve what is
needed from the parent first, without holding a lock, and only then lock the queue itself:

```go
func (sq *Queue) getHeadRoom() *resources.Resource {
    var parentHeadRoom *resources.Resource
    if sq.parent != nil {
        parentHeadRoom = sq.parent.getHeadRoom()   // no lock held here
    }
    return sq.internalHeadRoom(parentHeadRoom)     // takes sq's own lock
}
```

The same shape is used for pending and allocated resource updates, for the maximum and guaranteed
resource lookups and for building preemption snapshots. It means only one queue in the hierarchy is
ever locked at a time.

### When an upward call is unavoidable

Occasionally an object low in the order has to trigger work that takes a lock above it. The
convention is not to reorder the locks but to break the nesting with a goroutine, so the second lock
is never acquired while the first is held. The application does this when it notifies the partition
that it has terminated:

```go
func (sa *Application) executeTerminatedCallback() {
    if sa.terminatedCallback != nil {
        go sa.terminatedCallback(sa.ApplicationID)
    }
}
```

If you need this, add a comment saying which ordering the goroutine is breaking. Prefer hoisting the
work out of the critical section entirely where that is possible.

### Idioms

**Snapshot, release, then act.** Take the lock, copy what is needed, release it, and work on the
copy. `Queue.GetCopyOfApps()`, `Queue.GetCopyOfChildren()` and
`ClusterContext.GetPartitionMapClone()` all exist for this reason. The scheduling loop iterates a
cloned partition map, not the live one.

**Notify after unlocking.** Listener notifications are registered as a deferred call *before* the
lock is taken, so that the deferred calls run in reverse order and the notification happens after the
unlock:

```go
func (sn *Node) ReplaceAllocation(...) {
    defer sn.notifyListeners()   // runs after the Unlock below
    sn.Lock()
    defer sn.Unlock()
    ...
}
```

**Never return an internal map or slice.** Iterating or modifying a collection outside the lock that
protects it is a race regardless of what the caller intends. Return a copy, or expose a method that
does the work under the lock.

**Getters return clones.** `Node.GetAllocatedResource()` and `Queue.GetMaxResource()` return a
`Clone()` of the value. Reading such a field directly rather than through its getter is a data race
even when it looks safe, because the field can be replaced while it is being read.

**Unexported `xxxInternal` functions assume the lock is held.** Functions such as
`removeAsksInternal` or `addAllocationInternal` do not take a lock; their caller already has it.
They must not be called from outside the object.

### Read only fields

Several structs separate their fields into a block that is set once at construction and never
changed, and a block that is protected by the lock. `Node` marks the first block as "fields for fast
access, these fields are considered read only", `Allocation` as "read-only fields", `Application` and
`Queue` mark the second block as "private fields need protection".

These comments are a contract. The read only fields are read all over the code without taking a
lock, so adding a setter for one of them is not a small change.

### Comment banners

Functions with a locking precondition carry a banner stating it. The phrasing is consistent and each
form means something specific:

| Banner | Meaning |
|---|---|
| `Lock free call this all locks are taken when needed in called functions` | Takes no lock itself, safe to call with nothing held |
| `NOTE: this is a lock free call. It should only be called holding the PartitionContext lock.` | The caller must hold the partition lock |
| `NOTE: this is a lock free call. It must NOT be called holding the PartitionContext lock.` | The caller must not hold it, this guards the prohibition above |
| `This function MUST be called holding the lock for the queue.` | The caller holds the queue lock |
| `No locking must be called while holding the lock` | The caller holds this object's own lock |
| `lock free as it cannot be referenced yet` | Construction time, the object is not published |

When adding a function with a locking precondition, write the banner. When changing one, update it.
Reviewers rely on these instead of re-deriving the order from scratch.

## State machines

Both the core and the shim use [looplab/fsm](https://github.com/looplab/fsm). The states and
transitions themselves are described in [Scheduler Object States](scheduler_object_states.md); this
section covers how to work with them safely.

**The caller holds the object lock, and callbacks must be lock free.** The rule is recorded on the
shim's `Application.handle`: the object's lock is taken before the event is fired, so the state
machine callbacks run with it already held. A callback that acquires another object's lock nests
that acquisition inside both the object lock and the state machine's own internal locks, which is how
ordering problems get introduced.

**Do not release the object lock inside a callback.** Dropping and re-taking a lock in the middle of
a state transition leaves the object unprotected while the transition is still in progress, and
another goroutine can enter the state machine in that window.

**Do not use `SetState` to bypass a transition.** `SetState` sets the state directly and runs none of
the callbacks, so the metrics, events, notifications and cleanup attached to entering or leaving a
state are all skipped. Fire the event and let the state machine run.

**`"no transition"` is not an error.** The library returns it when an event resolves to the state the
object is already in. Both repositories check for it explicitly and treat it as success.

**Side effects belong in the callbacks.** Entering and leaving a state is where the metrics are
adjusted, state timers are set and cleared, and the resource manager is notified. Do not duplicate
that work at the call site.

## Resources

`resources.Resource` is a sparse map of resource type to quantity. It is used everywhere and its
semantics are easy to get wrong.

**A nil resource, a zero value and an absent type are three different things.** For a quota, a nil
maximum means no limit at all; a type present with a value of zero means a limit of zero; and a type
absent from a non-nil maximum means unlimited for that type. The root queue is the exception: a type
that is not registered there is rejected rather than treated as unlimited.

**All operations are nil safe** and an undefined quantity is treated as zero. Operations taking more
than one resource return the union of the entries.

**Resources are mutable, so a function that returns one must return a copy.** `Add`, `Sub` and the
`OnlyExisting` variants already allocate a new resource, so cloning their result again is redundant.
`Clone()` itself is nil safe.

**`Prune()` removes zero valued entries, which changes meaning.** Because a zero value and an absent
type are interpreted differently for quotas, pruning is not a no-op. Where metrics are recorded from
a resource, they are recorded before it is pruned.

**Know which comparison you need.** `FitIn` treats a type that is undefined in the receiver as a
limit of zero, while `FitInMaxUndef` treats it as unlimited. `SubErrorNegative` reports an error if a
subtraction goes negative and is used for the tracked pending and allocated totals, while
`SubEliminateNegative` clamps at zero instead.

**Usage can legitimately exceed capacity.** Node capacity can shrink while allocations are running,
and recovery adds existing allocations without checking limits. Code must tolerate an allocated value
larger than the maximum rather than assuming it cannot happen.

## Threading model

### Core

Scheduling runs in a single background goroutine. It is woken when something happens that may affect
the result and otherwise runs on a short timer. Because there is only one, scheduling decisions do
not race with each other, and adding a goroutine to the scheduling path removes that guarantee.

Everything that changes cluster state arrives as an event on a buffered channel and is drained by a
handler goroutine: one for allocation and application updates, one for node updates and one for
registration and configuration changes. The enqueue is a non-blocking send, so a full channel is
reported as an error rather than applying back pressure to the caller.

Alongside these there are periodic services: a health checker, a node usage monitor, an outstanding
request inspector, a quota preemption trigger, and per partition cleanup routines for finished
applications and removed queues. The REST handlers run with whatever concurrency the HTTP server
provides and only read.

Communication back to the resource manager goes through the RMProxy on its own goroutine. The
scheduling loop sends the update and waits for the reply on a channel, holding no object locks while
it does so.

### Kubernetes shim

The shim's `Context` lock is a serialisation lock as well as a data lock: it is documented as
ensuring that multiple event types are not executed concurrently, so informer callbacks hold it for
their whole body.

Scheduling events are delivered through a single dispatcher: one channel drained by one goroutine, so
application, task and node events are handled in order. When the channel is full the dispatcher falls
back to retrying in a separate goroutine, and beyond a configured limit it panics rather than
silently dropping events.

Two rules follow from this structure. **Do not make Kubernetes API calls while holding an object
lock** — the call takes as long as the API server takes, and every goroutine waiting on that lock
waits with it. Snapshot what is needed, release the lock, then make the call. And **every informer
that is created must also be started and stopped**; an informer that is created but never started
produces no events and no error.

## Detecting problems

Deadlock detection is built in and disabled by default. It is enabled with environment variables and
is turned on automatically for unit tests, so a test run that reports `POTENTIAL DEADLOCK` has found
a real problem. See [deadlock detection](../user_guide/troubleshooting.md#deadlock-detection) for the
settings and how to read a report.

The race detector is also enabled for unit tests. Both find problems only on the code paths a test
actually exercises, so a change to a concurrent path is worth an explicit test that drives it from
more than one goroutine.

## Checklist

Locking:

- [ ] New locks use `pkg/locking`, not `sync` directly
- [ ] New fields are in the correct block, and the block comment is still accurate
- [ ] The lock order is respected: cluster, partition, application, then queue, node, ugm, allocation
- [ ] The partition lock is not held while touching an application, queue or node
- [ ] A queue's own lock is not held while calling its parent or a child
- [ ] No internal map or slice is returned across the lock boundary
- [ ] No network, Kubernetes or resource manager call happens inside a critical section
- [ ] State machine callbacks take no locks, and the caller holds the object lock
- [ ] Locking preconditions are stated in a comment banner
- [ ] Any new goroutine started to break lock nesting says so in a comment

Resources:

- [ ] A returned resource is a copy, or is documented as owned by the caller
- [ ] No redundant `Clone()` on something that already returns a copy
- [ ] nil, zero and absent are handled deliberately in quota code
- [ ] Metrics are recorded before pruning

General:

- [ ] Getters are used rather than direct field access
- [ ] Tests run under the race detector and deadlock detection, and a concurrent change is driven from more than one goroutine
