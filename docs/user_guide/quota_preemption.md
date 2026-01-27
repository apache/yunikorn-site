---
id: quota_preemption
title: Quota Preemption
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

Queues can be configured with a quota. The quota for a queue can be changed while the system is running. In the case that a quota is changed the new quota is applied immediately in the next scheduling cycle. Depending on the type of change there are different impacts.

For a queue that had its quota increased: no impact. The queue could not have used more than its old quota and the new quota is higher providing more resources to be allocated by the workloads running in the queue.

For a queue that had its quota decreased there are two cases.
1) the new, lowered, quota is larger than the current usage in the queue: no impact. Workloads will be allocated until the new quota is reached. All running workloads are unaffected.
2) the new, lowered, quota is smaller than the current usage in the queue: the queue is impacted. Any workloads that were pending in the queue will need to wait until resources become available. Workloads will keep on running until they are done.

This second case is what is targeted by quota preemption. Quota preemption provides the administrator the option to intervene in the running workload when lowering a quota.
This document guide users to set up preemption delay for more details on the design, please refer [design doc](design/quota_preemptor.md).


## Global configuration

Quota preemption is available in YuniKorn 1.8 or later and turned `off` by default.

To turn on quota preemption it must be turned on globally at the partition level first in the YuniKorn config:

```yaml
partitions:
  - name: <name of the partition>
    preemption:
      quotapreemptionenabled: <boolean value>
```

The default value for _quotapreemptionenabled_ is _false_. Allowed values: _true_ or _false_, any other value will cause a parse error.

When quota preemption is turned on at the partition level quota changes could trigger a preemption when a queue quota is changed.

## Queue configuration

With the global configuration is turned on each queue must be configured to opt in to quota preemption. A queue can opt in by setting the _quota.preemption.delay_ property on the queue.

```yaml
queues:
  - name: default
    properties:
      quota.preemption.delay: <delay string>
```

The delay when not specified defaults to 0. A delay value explicitly set to 0 will prevent the quota change of the queue from triggering preemption.
Any non-zero value for the delay will be added to the time the change of the quota was applied to the queue. That timestamp defines the trigger point for quota preemption.
Quota preemption will only be triggered if the queue at the point in time of the change is above the new quota.
The standard scheduling quota enforcement will immediately enforce the new quota in all other cases and no further preemption actions are needed.

The scheduler will not trigger quota preemption until the delay has passed. If at that point in time the queue usage has dropped below the quota set no the queue at that point in time, no actions will be taken.
The quota preemption tracking information will be cleaned up in that case.

To prevent multiple quota changes from impacting each other quota preemption works top down in the queue hierarchy. If a change of a quota has triggered preemption on a queue none of the children of that queue will be able to trigger quota preemption.
This prevents complex victim selection interactions if multiple changes are made.

Victims for quota preemption can come from any queue below the queue that triggered the quota preemption. Quota preemption follows the same rules for victim selection as normal preemption.
It cannot cause a queue to go below its guaranteed, allocations are sorted based on priority and can opt out. See the description in the [preemption documentation](preemption.md) for details.

An example configuration turning on quota preemption and setting a delay of 15 minutes on the "prod" queue:

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
      - name: root
        queues:
          - name: prod
            parent: false
            resources:
              max:
                {memory: 10T, vcore: 1000}
            properties:
              quota.preemption.delay: 15m
```

:::note Dynamic Queues
Dynamic queues do not support quota preemption.
:::

:::note Inheritance
The current configuration does not support inheritance of the _quota.preemption.delay_ value.
[YUNIKORN-3208](https://issues.apache.org/jira/browse/YUNIKORN-3208) has been logged to support that functionality.
:::

## Recommendations

Quota preemption should be used with care. Using short delays is not recommended. Although no minimum delay is enforced any delay below a minute (60 seconds) should not be used.

If a queue mainly runs service type workloads up and down scaling of deployments should be considered when changing quotas. Workloads will not exit automatically and will be restarted if preempted.
Using quota preemption could cause the service to be left in a degraded state. The controller will also try to recreate the workload.

When running batch workloads, the delay should be based on the runtime of the workloads. Preempting workloads should be a last resort.
A workload that finishes automatically lowers the queue usage and will not require to be re-run. Preempted workloads have already used resources and will be more expensive overall.

:::tip
For consistency: until inheritance is provided setting a delay on a parent queue should not be set unless all children below it are also updated with the same delay.
:::
