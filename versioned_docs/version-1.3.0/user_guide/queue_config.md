---
id: queue_config
title: Partition and Queue Configuration
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

The basis for the queue configuration is given in the [configuration design document](design/scheduler_configuration.md).

This document provides the generic queue configuration.
It references both the [Access Control Lists](user_guide/acls.md) and [Placement rules](user_guide/placement_rules.md) documentation.

This document explains how to create the partition and queue configuration for the scheduler with examples.

The scheduler relies on the shim to reliably provide user information as part of the application submission.
The current shim identifies the user and the groups the user belongs to using the methodology provided in [User & Group Resolution](usergroup_resolution).

## Configuration
The configuration file for the scheduler that is described here only provides the configuration for the partitions and queues.

By default the scheduler reads the ConfigMap section `queues.yaml` for partition and queue configuration. The section name can
be changed by updating the `service.policyGroup` ConfigMap entry to be something other than `queues`.

The example reference for the configuration is located in the scheduler core's [queues.yaml](https://github.com/apache/yunikorn-core/blob/master/config/queues.yaml) file.

## Partitions
Partitions are the top level of the scheduler configuration.
There can be more than one partition defined in the configuration.

Basic structure for the partition definition in the configuration:
```yaml
partitions:
  - name: <name of the 1st partition>
  - name: <name of the 2nd partition>
```
The default name for the partition is `default`.
The partition definition contains the full configuration for the scheduler for a particular shim.
Each shim uses its own unique partition.

The partition must have at least the following keys defined:
* name
* [queues](#queues)

The queues configuration is explained below.

Optionally the following keys can be defined for a partition:
* [placementrules](#placement-rules)
* [statedumpfilepath](#statedump-filepath) (deprecated since v1.2.0)
* [limits](#limits)
* nodesortpolicy
* preemption (deprecated since v1.3.0)

Placement rules and limits are explained in their own chapters

The `nodesortpolicy` key defines the way the nodes are sorted for the partition.
Details on the values that can be used are in the [sorting policy](sorting_policies.md#node-sorting) documentation.

The `preemption` key can have only one sub key: _enabled_. NOTE: This property
has been deprecated since v1.3.0 and will be ignored. Preemption policies are
now configured per-queue.

Example `partition` yaml entry with a `nodesortpolicy` of _fair_:
```yaml
partitions:
  - name: <name of the partition>
    nodesortpolicy: fair
```
NOTE:
Currently the Kubernetes unique shim does not support any other partition than the `default` partition..
This has been logged as an [jira](https://issues.apache.org/jira/browse/YUNIKORN-22) for the shim.

### Queues

YuniKorn manages resources by leveraging resource queues. The resource queue has the following characters:
- queues can have **hierarchical** structure
- each queue can be preset with **min/max capacity** where min-capacity defines the guaranteed resource and the max-capacity defines the resource limit (aka resource quota)
- tasks must be running under a certain leaf queue
- queues can be **static** (loading from configuration file) or **dynamical** (internally managed by YuniKorn)
- queue level **resource fairness is** enforced by the scheduler
- a job can only run under a specific queue

:::info
The difference between YuniKorn queue and [Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/):
Kubernetes namespace provides the scope for the Kubernetes resources, including the security context (i.e who can access the objects), and resource
boundary when [resource quota](https://kubernetes.io/docs/concepts/policy/resource-quotas/) is defined (i.e how many resources can be used by the objects).
On the other hand, YuniKorn queue is only used how many resources can be used by a group of jobs, and in which order. It provides
a more fine-grained control on resource sharing across multiple tenants with considering of resource fairness, job ordering, etc. In most of the cases,
YuniKorn queue can be used to replace the namespace resource quota, in order to provide more scheduling features.
:::

The _queues_ entry is the main configuration element. 
It defines a hierarchical structure for the queues.

It can have a `root` queue defined but it is not a required element.
If the `root` queue is not defined the configuration parsing will insert the root queue for consistency.
The insertion of the root queue is triggered by:
* If the configuration has more than one queue defined at the top level a root queue is inserted.
* If there is only one queue defined at the top level and it is not called `root` a root queue is inserted.  

The defined queue or queues will become a child queue of the inserted `root` queue.

Basic `queues` yaml entry with sub queue:
```yaml
queues:
- name: <name of the queue>
  queues:
  - name: <name of the queue>
```

Supported parameters for the queues:
* name
* parent
* queues
* maxapplications
* [properties](#properties)
* adminacl
* submitacl
* [resources](#resources)
* [limits](#limits)

Each queue must have a _name_.
The name of a queue must be unique at the level that the queue is defined.
Since the queue structure is fully hierarchical queues at different points in the hierarchy may have the same name.
As an example: the queue structure `root.testqueue` and `root.parent.testqueue` is a valid structure.
A queue cannot contain a dot "." character as that character is used to separate the queues in the hierarchy.
If the name is not unique for the queue in the configuration or contains a dot a parsing error is generated and the configuration is rejected. 

Queues in the structure will automatically get a type assigned.
The type of the queue is based on the fact that the queue has children or sub queues.
The two types of queues are:
* parent
* leaf

Applications can only be assigned to a _leaf_ queue.
A queue that has a child or sub queue in the configuration is automatically a _parent_ queue.
If a queue does not have a sub the queue in the configuration it is a _leaf_ queue, unless the `parent` parameter is set to _true_.
Trying to override a _parent_ queue type in the configuration will cause a parsing error of the configuration.   

Sub queues for a parent queue are defined under the `queues` entry.
The `queues` entry is a recursive entry for a queue level and uses the exact same set of parameters.  
The `maxapplications` property is an integer value, larger than 1, which allows you to limit the number of running applications for the queue. Specifying a zero for `maxapplications` is not allowed as it would block all allocations for applications in the queue. The `maxapplications` value for a _child_ queue must be smaller or equal to the value for the _parent_ queue.

The [properties](#properties) section contains simple key/value pairs. This is
used for further queue customization of features such as 
[application sorting](sorting_policies.md#application-sorting) and priority
scheduling. Future features will use the exisitng `properties` section as well
to avoid the need to define a new structure for queue configuration.

Access to a queue is set via the `adminacl` for administrative actions and for submitting an application via the `submitacl` entry.
ACLs are documented in the [Access control lists](acls.md) document.

Queue resource limits are set via the `resources` parameter.
User and group limits are set via the `limits` parameter.
As both entries are complex configuration entries they are explained in [resources](#resources) and [limits](#limits) below.

An example configuration of a queue `root.namespaces` as a _parent_ queue with limits:
```yaml
partitions:
  - name: default
    queues:
      - name: namespaces
        parent: true
        maxapplications: 12
        resources:
          guaranteed:
            {memory: 1G, vcore: 10}
          max:
            {memory: 10G, vcore: 100}
        queues:
          - name: level1
            maxapplications: 8
            resources:
              guaranteed:
                {memory: 0.5G, vcore: 5}
              max:
                {memory: 5G, vcore: 50}
```

### Placement rules

The placement rules are defined and documented in the [placement rule](placement_rules.md) document.

Each partition can have only one set of placement rules defined. 
If no rules are defined the placement manager is not started and each application *must* have a queue set on submit.

### Statedump filepath

**Status** : Deprecated and ignored since v1.2.0, no replacement.

```yaml
statedumpfilepath: <path/to/statedump/file>
```

### Limits
Limits define a set of limit objects for a partition or queue.
It can be set on either the partition or on a queue at any level.
```yaml
limits:
  - limit: <description>
  - limit: <description>
```

A limit object is a complex configuration object.
It defines one limit for a set of users and or groups.
Multiple independent limits can be set as part of one `limits` entry on a queue or partition.
Users and or groups that are not part of the limit setting will not be limited.

A sample limits entry:
```yaml
limits:
  - limit: <description>
    users:
    - <user name or "*">
    - <user name>
    groups:
    - <group name or "*">
    - <group name>
    maxapplications: <1..maxint>
    maxresources:
      <resource name 1>: <0..maxint>[suffix]
      <resource name 2>: <0..maxint>[suffix]
```

Limits are applied recursively in the case of a queue limit.
This means that a limit on the `root` queue is an overall limit in the cluster for the user or group.
A `root` queue limit is thus also equivalent with the `partition` limit.

The limit object parameters:
* limit
* users
* groups
* maxapplications
* maxresources

The _limit_ parameter is an optional description of the limit entry.
It is not used for anything but making the configuration understandable and readable. 

The _users_ and _groups_ that can be configured can be one of two types:
* a star "*" 
* a list of users or groups.

If the entry for users or groups contains more than one (1) entry it is always considered a list of either users or groups.
The star "*" is the wildcard character and matches all users or groups.
Duplicate entries in the lists are ignored and do not cause a parsing error.
Specifying a star beside other list elements is not allowed.

_maxapplications_ is an unsigned integer value, larger than 1, which allows you to limit the number of running applications for the configured user or group.
Specifying a zero maximum applications limit is not allowed as it would implicitly deny access.
Denying access must be handled via the ACL entries.

The _maxresources_ parameter can be used to specify a limit for one or more resources.
The _maxresources_ uses the same syntax as the [resources](#resources) parameter for the queue. 
Resources that are not specified in the list are not limited.
A resource limit can be set to 0.
This prevents the user or group from requesting the specified resource even though the queue or partition has that specific resource available.  
Specifying an overall resource limit of zero is not allowed.
This means that at least one of the resources specified in the limit must be greater than zero.

If a resource is not available on a queue the maximum resources on a queue definition should be used.
Specifying a limit that is effectively zero, _maxapplications_ is zero and all resource limits are zero, is not allowed and will cause a parsing error.
 
A limit is per user or group. 
It is *not* a combined limit for all the users or groups together.

As an example: 
```yaml
limit: "example entry"
maxapplications: 10
users:
- sue
- bob
```
In this case both the users `sue` and `bob` are allowed to run 10 applications.

### Properties

Additional queue configuration can be added via the `properties` section,
specified as simple key/value pairs. The following parameters are currently
supported:

#### `application.sort.policy` 

Supported values: `fifo`, `fair`, `stateaware`

Default value: `fifo`

Sets the policy to be used when sorting applications within a queue. This
setting has no effect on a _parent_ queue.

See the documentation on [application sorting](sorting_policies.md#application-sorting)
for more information.


#### `application.sort.priority`

Supported values: `enabled`, `disabled`

Default value: `enabled`

When this property is `enabled`, priority will be considered when sorting
queues and applications. Setting this value to `disabled` will ignore
priorities when sorting. This setting can be specified on a _parent_ queue and
will be inherited by _child_ queues.

**NOTE:** YuniKorn releases prior to 1.2.0 did not support priorities when
sorting. To keep the legacy behavior, set `application.sort.priority` to
`disabled`.

#### `priority.policy`

Supported values: `default`, `fence`

Default value: `default`

Sets the inter-queue priority policy to use when scheduling requests.

**NOTE**: This value is not inherited by child queues.

By default, priority applies across queues globally. In other words,
higher-priority requests will be satisfied prior to lower-priority requests
regardless of which queue they exist within.

When the `fence` policy is in use on a queue, the priorities of _child_ queues
(in the case of a _parent_ queue) or applications (in the case of a _leaf_
queue) will not be exposed outside the fence boundary. 

See the documentation on [priority support](priorities.md) for more information.

#### `priority.offset`

Supported values: any positive or negative 32-bit integer

Default value: `0`

Adjusts the priority of the queue relative to it's siblings. This can be useful
to create high or low-priority queues without needing to set every task's
priority manually.

**NOTE**: This value is not inherited by child queues.

When using the `default` priority policy, the queue's priority is adjusted up
or down by this amount.

When using the `fence` policy, the queue's priority is always set to the offset
value (in other words, the priorities of tasks in the queue are ignored).

See the documentation on [priority support](priorities.md) for more information.

#### `preemption.policy`

Supported values: `default`, `fence`, `disabled`

Default value: `default`

When using the `default` preemption policy, preemption is enabled for the queue.

When using the [`fence` preemption policy](../design/preemption.md#preemption-fence), tasks running in or below the queue on which the property is set cannot preempt tasks outside the queue tree.

When using the `disabled` preemption policy, tasks running within the queue can't be victims.

#### `preemption.delay`

Supported values: any positive [Golang duration string](https://pkg.go.dev/time#ParseDuration)

Default value: `30s`

The property can only be set on a leaf queue. A queue with pending requests can only trigger preemption after it has been in the queue for at least this duration.

### Resources
The resources entry for the queue can set the _guaranteed_ and or _maximum_ resources for a queue.
Resource limits are checked recursively.
The usage of a leaf queue is the sum of all assigned resources for that queue.
The usage of a parent queue is the sum of the usage of all queues, leafs and parents, below the parent queue. 

The root queue, when defined, cannot have any resource limit set.
If the root queue has any limit set a parsing error will occur.
The maximum resource limit for the root queue is automatically equivalent to the cluster size.
There is no guaranteed resource setting for the root queue.

Maximum resources when configured place a hard limit on the size of all allocations that can be assigned to a queue at any point in time.
A maximum resource can be set to 0 which makes the resource not available to the queue.
Guaranteed resources are used in calculating the share of the queue and during allocation. 
It is used as one of the inputs for deciding which queue to give the allocation to.
Preemption uses the _guaranteed_ resource of a queue as a base which a queue cannot go below.

Basic `resources` yaml entry:
```yaml
resources:
  guaranteed:
    <resource name 1>: <0..maxint>[suffix]
    <resource name 2>: <0..maxint>[suffix]
  max:
    <resource name 1>: <0..maxint>[suffix]
    <resource name 2>: <0..maxint>[suffix]
```
Resources that are not specified in the list are not limited, for max resources, or guaranteed in the case of guaranteed resources.

An optional suffix may be specified for resource quantities. Valid suffixes are `k`, `M`, `G`, `T`, `P`, and `E` for SI powers of 10,
and `Ki`, `Mi`, `Gi`, `Ti`, `Pi`, and `Ei` for SI powers of 2. Additionally, resources of type `vcore` may have a suffix of `m` to indicate millicores. For example, `500m` is 50% of a vcore. Units of type `memory` are interpreted in bytes by default. All other resource types have no designated base unit.

Note that this is a behavioral change as of YuniKorn 1.0. Prior versions interpreted `memory` as units of 1000000 (1 million) bytes and `vcore` as millicores.

### Child Template

The parent queue can provide a template to define the behaviour of dynamic leaf queues below it. A parent queue having no child template inherits the child template
from its parent if that parent has one defined. A child template can be defined at any level in the queue hierarchy on a queue that is of the type parent.

The supported configuration in template are shown below.
1. application sort policy
2. max resources
3. guaranteed resources
4. max applications

As an example:
```yaml
 partitions:
   - name: default
     placementrules:
       - name: provided
         create: true
     queues:
       - name: root
         submitacl: '*'
         childtemplate:
           maxapplications: 10
           properties:
             application.sort.policy: stateaware
           resources:
             guaranteed:
               vcore: 1
               memory: 1G
             max:
               vcore: 20
               memory: 600G
         queues:
           - name: parent
             parent: true
             childtemplate:
               resources:
                 max:
                   vcore: 21
                   memory: 610G
           - name: notemplate
             parent: true
```
In this case, `root.parent.sales` will directly use the child template of parent queue `root.parent`. By contrast,
`root.notemplate.sales` will use the child template set on the queue `root` since its parent queue `root.notemplate` inherits the child template from the queue `root`.

[DEPRECATED] Please migrate to template if your cluster is relying on old behavior that dynamic leaf queue can inherit
`application.sort.policy` from parent (introduced by [YUNIKORN-195](https://issues.apache.org/jira/browse/YUNIKORN-195)). The old behavior will get removed in the future release.
