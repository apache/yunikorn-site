---
id: user_based_resource_usage_tracking
title: User Based Resource Usage Tracking
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

Tracking resource allocation usage is currently limited to a queue. An application, which owns the allocation, is the source of that resource usage. All applications that are part of the queue will count towards the resource usage of the queue. A queue could also have a resource usage quota set. The queue’s resource quota is enforced during the scheduling cycle.

An application is always owned by a user/group. One user/group could own applications in one or more queues. Like a queue a user/group could have a limit set. A limit can specify a resource usage quota, and an application usage limit. Tracking these usages per user/group is currently not implemented and is covered as part of this design.

## Goals

- Specify tracking usage in relation to the following objects:
  - users
  - applications
  - queues
- An interface to define how to track running applications:
  - Read a user/group running applications
  - Increase a user/group running applications *)
  - Decrease a user/group running applications

- An interface to define how to track usage:
  - Read a user/group resource usage
  - Increase a user/group resource usage *)
  - Decrease a user/group resource usage

  *) This call could be extended for enforcement later.

- Expose user/group tracked information through REST API

## Non Goals
- User and group retrieval is part of the k8shim which is out of scope
- Exposing usage as a metric into prometheus
- Specify enforcement rules
- Implementation of enforcement
- Interface definition to allow enforcement

## Tracking definitions

### User vs Group tracking

Tracking is based on the _security.UserGroup_ object defined in the core scheduler. User and group information is retrieved by the shim and communicated via the _UserGroupInformation_ object as defined in the scheduler interface. A _security.UserGroup_ object contains:
- user (exactly 1)
- groups (0 or more)

Limits can be configured for both users and groups at the same time in the same queue. So, in the case of users for which no limit has been configured explicitly but group (to which the user belongs to) limits have configured works based on the group limits configuration. In case of users for which a limit has been configured explicitly works based on its own configured limits irrespective of whether configuration has been set for the corresponding group (to which the user belongs to)  or not. In other words, user limit settings always have the higher precedence when group limit settings have been configured too.

"*" is also allowed for both users and groups limit configuration. In this case, any user or group needs to go through enforcement checks to ensure limit settings are being honoured properly. However, the tracker does not need to track the wildcard user as a specific user or group is already being tracked during their activities.

### Group limitations

Users can belong to zero, one or multiple groups. In some systems, like unix, a concept of a primary group exists. This concept is not universal and there is no consistent definition of a primary group either. If the system does not define a primary group how would we distinguish between the groups?

In the case the user is a member of multiple groups the assignment of usage to a group also becomes problematic. The decision which group to assign the usage to becomes arbitrary. As an example consider a user with multiple groups assigned. Joe has groups dev and test assigned. When an application is started does that application count towards the limits for the dev group or against the limits for the test group or both?

The _UserGroup_ object contains a slice, list or array, of groups which has a fixed order from the moment of creation. The group resolution configured might not guarantee an ordering which means we cannot rely on the order in the _UserGroup_ to be stable. A stable and pre-defined way of choosing a group to track usage against must be defined.

The first point to define is that tracking can only occur against zero (0) or one (1) group. Usage can never be tracked against multiple groups. If a user is a member of multiple groups, a group is selected when the first usage is registered for the application. The group selected out of the list of groups in the _UserGroup_ object to track against is based on the hierarchical queue limit configuration. The hierarchy is considered bottom up, starting from the leaf up to the root. The first group that is specified in the queue hierarchy for limiting usage that matches a group in the _UserGroup_ object is selected for that application.

If no group limits are defined, in the hierarchy, usage is not tracked for a group. If no groups are defined in the _UserGroup_ object no usage will be tracked against a group.

The tracker considers only the group received as part of the _UserGroup_ object at the time of first usage registration for the application in the tracker. In case of group changes while the user’s application is actively being tracked, the tracker does not consider the group change. However, If the user submits a new application, the most current group information at that point in time will be used.

Until there is full support for groups in the k8shim, group tracking will be limited. No groups are passed by the k8shim to the core. This results in the _UserGroup_ object in the current implementation to always have only one group. The group name will be the same as the username. We also have excluded configuration processing for the tracking. For the current tracking implementation as described in the document these limitations will result in the user and group linked to the user to track the same usage.

###  Cluster or queue based tracking

Tracking user usage will be based on the usage per queue. The full hierarchy of the queue will be tracked. We should not just track the leaf or root of the hierarchy. The overall cluster usage is the same as the usage of the root queue. Cluster level usage does not need separate tracking.

The overhead of tracking per queue should be really limited. In most cases a user will run their workloads in a specific queue. Deeply nested queues do also add overhead to the tracking. During testing the impact of workload spread and or deep nesting needs to be assessed. If needed this can be called out in the documentation.

We also need to take into account that multiple members of a group could be using different queues in the hierarchy. If tracking usage would be limited to the leaf level, aggregating group usage becomes more difficult and loses transparency.

The documentation around limits, part of the enforcement, reference different limits at different levels for users or groups. Tracking at just the leaf or root level could break that functionality. The design should support the current documented features. If during enforcement design a different decision is made then the tracking is not the deciding factor.

## Application tracking

Applications go through a number of states within the core scheduler. Allocations linked to applications are the triggers for application state changes. From a tracking perspective we need to define what is considered a running application.

Since placeholders and placeholder timeout can play a role in state changes the implementation of the running application tracking must take into account these cases:
- no gang defined
- gang defined, all or some placeholders replaced
- gang style "soft" defined, all placeholders time out
- gang style "hard" defined, all placeholders time out

### Running state entry

The application when submitted and placed into a queue is in the _New_ state. At this point there is no allocation or pending request present on the application. After one or more requests, _AllocationAsks_, are added the application moves into an _Accepted_ state. The _Accepted_ state is exited when the first _Allocation_ is added to the application. The application then transitions into the Running state.

At this point a resource quota would be used by the application and the application should be considered as running from a tracking perspective. This means that the addition of the first _Allocation_ onto the application also must be the trigger point for the increase of the running applications. This trigger point for tracking is when the application is in the _Accepted_ state. This is also the point at which the group for the usage tracking needs to be set as described in the [group limitations](#group-limitations).

Note that currently, the application state transition code block in application_state.go updates the application running queue metrics when the application enters _Running_ state. The metric must be updated to be consistent with the above definition of a running application. Linking this back to a state transition the entry into the Running state should be used.

### Running state exit

An application should be considered running as long as at least one allocation is assigned to the application. The removal of the last allocation should decrease the number of running applications. However, we also need to consider the pending requests.

As part of the application states the application enters into a _Completing_ state when the last allocation is removed and there are no pending requests. This automatically progresses into the _Completed_ state if nothing changes for the application. Applications going into the _Completing_ state all have no allocations left and pending requests are considered. The entry of the _Completing_ state thus could be used as a point for triggering the decrease of the running application count.

However there are circumstances that the application goes from the _Completing_ state back into a _Running_ state. This is linked to auto restart of a pod by Kubernetes. This case must be handled.

A last case that needs to be considered is an application that fails. If an application fails it moves into the Failing state. The application does not enter _Completing_ but could have incremented the running applications. A failure could be triggered by the gang scheduling style "hard" or the removal of a partition.

## Resource usage tracking

Resource usage is tracked simply based on the addition or removal of an allocation.

Removal of an allocation is an out-of-band action. The shim notifies the core scheduler that an allocation no longer exists and the core updates the tracking based on that removal. If an allocation is preempted the core initiates the removal but still gets notified by the shim that the removal has occurred. Until the confirmation of the shim is received no tracking updates must be created.

The replacement of a placeholder by the real allocation for gang scheduling follows a similar concept. However, in that case there is a possibility that there is a discrepancy between the placeholder size and the real allocation. See [YUNIKORN-982](https://issues.apache.org/jira/browse/YUNIKORN-982) for more detailed information on this issue. The changes that fixed the accounting for the queues and nodes also need to be taken into account for user based resource tracking.

Adding a new allocation to an application triggers the update of the tracked resources for the user and or group as described in the [group limitations](#group-limitations). Enforcement is not a goal of the design document but the enforcement implementation needs to be taken into account. The point to add the resource usage must line up with the point that the queue structure is currently updated and the queue quotas are enforced.

The order of the updates: queue structure first then user or user first then queue structure is debatable. The current proposal is to implement the following:
- Update user and group based usage
- Queue quota enforcement and update
- If the queue enforcement fails, roll back the user and group based update.

## Scheduler transparency

Resource usage tracking is based on the allocated resource, and linked to the application’s queue path and the application’s _user_ field. Application tracking is a simple count of the applications, and is linked to the application’s queue path and the application’s user field.
As an extension on this we could consider adding the _applicationID_ into the tracking of the running applications to help with troubleshooting. This is part of the current proposal. The proposal is to not link the running application tracking to the applicationID.

The user field of an application is the earlier mentioned _security.UserGroup_ object and has all the identifying details needed to track the usage.

From the schedulers perspective there should be no special setup needed. The tracking should always work without the need to pre-create a user, group or queue based entry. This means that the tracking cannot fail even if the user or group has no enforcement linked to it and does not exist in the tracker.

In summary the tracker must implement:
- User and or group creation on the fly.
- Auto cleanup of tracking information no longer needed.
- Configuration processing needed for enforcement.

## User Group Manager (UGM)

Tracking all the resources will be part of a new self-contained module in the scheduler. This means that there must be no imports from the `scheduler.objects` package. This will allow us to run the tracker separately and push updates, if needed, into a background processing queue.

There will be one user group manager created per partition as part of the partition creation process. There will be no tracking of user quotas over a partition boundary.

The new self-contained module, user group manager contains all specifications and code for tracking and can be extended in the future to include enforcement code.

Tracking the resources and application count for all users occurs from startup. This happens irrespective of whether enforcement is configured for the user or group. By starting tracking independently of the enforcement changes in enforcement will always have a consistent view of the resources tracked at least at a user level. Recovery must be tested in combination with the tracking code.

Storing data in the user group manager is based on the _security.UserGroup_ structure content. The built-in _UserGroupCache_ resolution cannot guarantee that the same object is returned for the same user each time.

### UserGroup cache impact

The concept of a stable user entry in the cache is not currently present in the _UserGroupCache_. This concept will most likely also not be possible based on the fact that group resolution does not guarantee ordering. Based on the assumption that we cannot guarantee group ordering for all group resolutions that are possible the tracking will not rely on it.

Currently, _UserGroupCache_ holds the _UserGroup_ object entry only for the cache period. This is either 300 seconds for a positive resolution or 30 seconds for a negative resolution. After this cache time the entry will be deleted as part of the cache cleanup/expiration process. If the same user submits a second application after the expiry, a new _UserGroup_ object will be created and stored in the cache. The _UserGroup_ object has a property "resolved", which holds a timestamp at which the user group resolution has been executed for the first time. The cache cleaner wakes up after every 60 seconds and deletes all entries whose "resolved"  timestamp is older than the cache timeout.

Other internal changes might be needed to make sure all _UserGroup_ objects are cached correctly and returned as expected internally in the cache. These are left as implementation details for the cache changes.

### Tracking structure

The user group Manager must be able to track usage for users and groups. Users are the primary access point for all tracking. The user group Manager structure will implement the [tracker interface](#tracker-interface).

````
package user_group_manager

type Manager struct {
  users  map[string]*userTracker
  groups map[string]*groupTracker

  sync.RWMutex
}
(m *Manager) checkAppGroup(queuePath, applicationID string, user *security.UserGroup)
````

All objects in the user group manager will be managed internally. Creation of user and or group tracker objects is based on the request to track usage. The objects are added to one of the two structures in the user group manager. Adding user or group objects can only be triggered by an increase of tracked resources. The creation of the user and or group tracker objects is handled by the user group manager. The user group manager is also responsible for setting the usage information for the queue hierarchy directly after creation.

The resolution of the group that the usage is tracked against for an application is handled by the user group Manager via the checkAppGroup. As part of an increase of resource usage the Manager will check if the application is already tracked for the user. If the application is already tracked nothing changes. If the application is not tracked the manager will resolve the group to track against and update the userTracker object. If there is no active tracker registered for the group a new groupTracker object will be created and initialised as required.

Removal of user or group objects can only be triggered after a decrease of tracked resources has removed the last usage. Usage tracked for a user must be zero. For group tracker objects the application reference count must be zero.
Removal of the user and or group tracker objects is done periodically. This cleanup must be `go routine` safe. Updates to either map could be triggered from different routines, scheduler allocation processing or a release of an allocation by a shim.

### Tracker interface

The interface describes the functions that will be exposed by the user group manager. The other scheduler components can rely on the functions defined in the interface to be available to increase, decrease applications and or resource usage and get the tracked resources.

```
package user_group_manager

type Tracker interface {
  GetUserResources(user *security.UserGroup) *Resource
  GetGroupResources(group string) *Resource

  GetUsersResources() []*userTracker
  GetGroupsResources() []*groupTracker

  IncreaseTrackedResource(queuePath, applicationID string, usage *Resource, user *security.UserGroup) error
  DecreaseTrackedResource(queuePath, applicationID string, usage *Resource, removeApp bool, user *security.UserGroup) error
}
```

The _IncreaseTrackedResource()_ and _DecreaseTrackedResource()_ calls will implement the tracking data updates. The Get* calls are providing safe access to the tracked data to be used as part of exposing the data in the REST interface. See [exposure of usage tracking](#exposure-of-usage-tracking) for more detail.

Applications are added automatically during the call to increase the tracked resources. The first time the applicationID is encountered the structures are updated accordingly and tracking starts. The removal of the application is triggered by leaving the [running state](#running-state-exit), this is equivalent to the removal of the last usage and must also set the removeApp flag to true.

Calling _IncreaseTrackedResource()_ and _DecreaseTrackedResource()_ with empty or nil parameters is not allowed and will return an error to be handled by the caller. The _GetUserResource_ and _GetGroupResource_ calls can return a _nil_ Resource value. The _GetUsersResource_ and _GetGroupsResource_ calls can return an empty slice.

### User tracking

The userTracker contains all tracked usage information for a user. Changes for all usage, even the group usage, are part of the change that gets triggered on the user object.

The userTracker object contains a reference map to the usage for each application that is tracked linking it to the groupTracker object for the specific application. Multiple applications can be tracked against the same groupTracker object.

The group references will be set for each application when usage is added for an application and is not mutable. The existence of a groupTracker for the application can be checked by calling _hasGroupForApp_ on the userTracker object. It returns true in case the application ID exists in the group mapping, false if it does not. The return value is only based on the existence of the applicationID as the key, not on the value it references.

The groupTracker can be set in the userTracker object by calling _setGroupForApp_. If the applicationID already exists, the call to set the groupTracker reference is a noop, nothing will change. The reference cannot be changed after it is set. The groupTracker reference can be nil. In the case of a nil reference, no tracking for that application against a group is performed. Even a nil reference cannot be replaced.

An increase or decrease of the resources tracked for the user requires the applicationID to be set to a non-empty value. On removal of the last allocation for the application the group reference will be removed from the userTracker object. To remove a running application from the userTracker the applicationID must be set in the _decreaseResource_ call and the flag removeApp must be set to true. Removal of the groupTracker reference can only occur as part of a _decreaseResource_ call.

If there are no applications left in the group references the object will be removed by the cleanup run from the user group manager. This will also mean that there is no usage tracked anymore by the referenced queueTracker object.

The usage per queue is stored in a queue structure specific for this user. The queueTracker object provides a hierarchical structure. This structure starts at the root of the queue hierarchy and only contains child queues for which a usage is being tracked. The hierarchy must be updated, add or delete of child entries, as part of the updates that are processed.

The creation of the root queueTracker is part of the creating a new userTracker object.

```
package user_group_manager

type userTracker struct {
  userName  string
  group     map[string]*groupTracker
  queue     *queueTracker
  
  sync.RWMutex
}

newUserTracker(queuePath string, user *security.UserGroup) *userTracker

(ut *userTracker) increaseResource(queuePath, applicationID string, usage *Resource)
(ut *userTracker) decreaseResource(queuePath, applicationID string, usage *Resource, removeApp bool)
(ut *userTracker) hasGroupForApp(applicationID string) bool
(ut *userTracker) setGroupForApp(applicationID string, groupTrack *groupTracker)
```

### Group tracking

The groupTracker contains all tracked usage information for a group. This object can be shared by multiple users for one or more applications. It adds the applications that are tracked for this specific group automatically to the list. For this it expects an applicationID to be set to a non-empty value for each _increaseResource_ call.

To simply decrease the resources tracked for the group the applicationID could be empty. On removal of the last allocation for the application the application will be removed from the groupTracker object. To remove a running application from the groupTracker the applicationID must be set in the _decreaseResource_ call and the flag removeApp must be set to true.

If there are no entries left in the applications tracked in the groupTracker the object will be removed by the cleanup run from the user group manager. This will also mean that there is no usage tracked any more by the referenced queueTracker object.

The usage per queue is stored in a queue structure specific for this group. The queueTracker object provides a hierarchical structure. This structure starts at the root of the queue hierarchy and only contains child queues for which a usage is being tracked. The hierarchy must be updated, add or delete of child entries, as part of the updates that are processed.

The creation of the root queueTracker is part of the creating a new groupTracker object.

```
package user_group_manager

type groupTracker struct {
  groupName    string
  applications map[string]bool
  queue        *queueTracker
  
  sync.RWMutex
}

newGroupTracker(queuePath string, group string) *groupTracker

(gt *groupTracker) increaseResource(queuePath, applicationID string, usage *Resource)
(gt *groupTracker) decreaseResource(queuePath, applicationID string, usage *Resource, removeApp bool)
```

### Queue tracking

The queueTracker acts as a base for both user and group tracking. It provides the actual location for the tracked usage.The top of the structure, which is referenced from the userTracker or groupTracker objects, contains the root queue usage. The queueTracker is only referenced by one userTracker or one groupTracker object and must not be shared. This means that we should not require any locking within the queueTracker object.

The queue hierarchy below the root, for which a usage is registered, is part of the childQueues. Each part of the full queue path creates a new level of objects. This structure shows a sparse hierarchical queue structure. It may not represent the full queue structure as known in the scheduler.

The creation of the root queueTracker returns a plain object without usage set and a fixed queueName of "root". The usage should then be updated by a call to _increaseResource_. The call must handle the recursive creation of the queue path as given. It expects an applicationID to be set to a non-empty value for each call.

To simply decrease the resources tracked for the queue the applicationID can be empty. On removal of the last allocation for the application the application will be removed from the queueTracker. To remove a running application from the queueTracker the applicationID must be set in the _decreaseResource_ call and the flag removeApp must be set to true.

```
package user_group_manager

type queueTracker struct {
  queueName           string
  resourceUsage       *Resource
  runningApplications map[string]boolean

  childQueues   map[string]*queueTracker
}

newQueueTracker() *queueTracker

(qt *queueTracker) increaseResource(queuePath, applicationID string, usage *Resource)
(qt *queueTracker) decreaseResource(queuePath, applicationID string, usage *Resource, removeApp bool)
```

### Update consistency

All changes are triggered against a userTracker object. Since enforcement of a quota is out of scope of this design we can ignore update failures due to quota exhaustion. There is no requirement or possibility that updates need to be rolled back.

Usage updates can be triggered from two points: allocation by the scheduler and releases by a shim. Allocations as well as releases need to update both user and group usage information. We must guarantee that for both the full hierarchy is changed or neither are changed.

The releases are also processed asynchronously from the scheduling cycle. This means that we have to be able to guarantee that the increases and decreases are applied consistently to both objects also. Locking of the objects to serialise changes must be in place to support this.

The other point is the update ordering and locking. The increase and decrease processing must follow the same order. Both must update the userTracker and related groupTracker objects in the same order. This is a requirement to prevent the processing of being able to deadlock while updating the same user for a simultaneous increase and decrease.

For groupTracker updates that originate from two different users the locking of the groupTracker object is required. One of the two updates will be able to proceed while the other waits for the update to finalise.

A final consideration is the consistency of two updates on the same object that follow each other closely. If the first update removes all existing usage the userTracker or groupTracker object is cleared for removal. While the update is in progress a second update comes in to add a new usage to the same object. The resolution of the userTracker in the user group manager has finished. The code has a reference to the object. Processing is waiting to lock the userTracker object. This point could cause the object to become unlinked and usage tracking information to be lost. The implementation needs to prevent this race condition.

### Exposure of usage tracking

The usage tracking information that is part of the user group manager must be exposed for external consumption. All our current information is exposed via a REST call.

Based on the current REST api definition for other object the proposal is to expose the following new endpoints:

- /ws/v1/partition/{partitionName}/usage/users
- /ws/v1/partition/{partitionName}/usage/groups

For both endpoints we expose the full queue hierarchy. As an example below the approximate output for the user's endpoint for one user:

```json
[
  {
    "userName": "user1",
    "groups": {
      "app2": "tester"
    },
    "queues":
    {
      "queuename": "root",
      "resourceUsage": {
        "memory": 12000000000,
        "vcore": 12000
      },
      "runningApplications": ["app1", "app2"],
      "children": [
        {
        "queuename": "root.default",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": ["app1"],
        "children": []
        },
        {
          "queuename": "root.test",
          "resourceUsage": {
            "memory": 6000000000,
            "vcore": 6000
          },
          "runningApplications": [
            "app2"
          ],
          "children": []
        }]
    }
  }
]
```


An example below the approximate output for the groups endpoint for one group:

```json
[
  {
    "groupName" : "tester",
    "applications": ["app2"],
    "queues":
    {
      "queuename": "root",
      "resourceUsage": {
        "memory": 6000000000,
        "vcore": 6000
      },
      "runningApplications": ["app2"],
      "children": [
        {
        "queuename": "root.test",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": ["app2"],
        "children": []
        }
      ]
    }
  }
]
```
