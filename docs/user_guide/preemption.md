---
id: preemption_cases
title: Preemption
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

Preemption is an essential feature found in most schedulers, and it plays a crucial role in enabling key system functionalities like DaemonSets in K8s, as well as SLA and prioritization-based features.

This document provides a brief introduction to the concepts and configuration methods of preemption in YuniKorn. For a more comprehensive understanding of YuniKorn's design and practical ideas related to preemption, please refer to the [design document](design/preemption.md).

## Kubernetes Preemption

Preemption in Kubernetes operates based on priorities. Starting from Kubernetes 1.14, you can configure preemption by adding a `preemptionPolicy` to the `PriorityClass`. However, it is important to note that preemption in Kubernetes is solely based on the priority of the pod during scheduling. The full documentation can be found [here](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#preemption).

While Kubernetes does support preemption, it does have some limitations. Preemption in Kubernetes only occurs during the scheduling cycle and does not change once the scheduling is complete. However, when considering batch or data processing workloads, it becomes necessary to account for the possibility of opting out at runtime.

## YuniKorn Preemption

In YuniKorn, we have introduced node-centric preemption for DaemonSet pods. With YuniKorn, we guarantee that a pod will run exclusively on a particular node, and no other pods will be scheduled on that node until the DaemonSet pod is scheduled.

Additionally, YuniKorn's generic preemption is based on a hierarchical queue model, enabling pods to opt out of running. Preemption is triggered after a specified delay, ensuring that each queue's resource usage reaches at least the guaranteed amount of resources. To configure the delay time for preemption triggering, you can utilize the `preemption.delay` property in the configuration.

To prevent the occurrence of preemption storms or loops, where subsequent preemption tasks trigger additional preemption tasks, we have designed seven preemption laws. These laws are as follows:

1. Preemption policies are strong suggestions, not guarantees
2. Preemption can never leave a queue lower than its guaranteed capacity
3. A task cannot preempt other tasks in the same application
4. A task cannot trigger preemption unless its queue is under its guaranteed capacity
5. A task cannot be preempted unless its queue is over its guaranteed capacity
6. A task can only preempt a task with lower or equal priority
7. A task cannot preempt tasks outside its preemption fence

For a detailed explanation of these preemption laws, please refer to the preemption [design document](design/preemption.md#the-laws-of-preemption).

Next, we will provide a few examples to help you understand the functionality and impact of preemption, allowing you to deploy it effectively in your environment. You can find the necessary files for the examples in the yunikorn-k8shim/deployment/example/preemption directory.

Included in the files is a YuniKorn configuration that defines the queue configuration as follows:

```bash
queues.yaml: |
    partitions: 
    - name: default
      placementrules:
        - name: provided
          create: true
      queues:
        - name: root
          submitacl: '*'
          properties:
            preemption.policy: fence
            preemption.delay: 10s
          queues:
          - name: 1-normal ...
          - name: 2-no-guaranteed ...
          - name: 3-priority-class ...
          - name: 4-priority-queue ...
          - name: 5-fence ...
```

Each queue corresponds to a different example, and the preemption will be triggered 10 seconds after deployment, as indicated in the configuration `preemption.delay: 10s`.

### General Preemption Case

In this case, we will demonstrate the outcome of triggering preemption when the queue resources are distributed unevenly in a general scenario.

We will deploy 10 pods with a resource requirement of 1 to both `queue-1` and `queue-2`. First, we deploy to `queue-1` and then introduce a few seconds delay before deploying to `queue-2`. This ensures that the resource usage in `queue-1` will exceed that of `queue-2`, depleting all resources in the parent queue and triggering preemption.

| Queue            | Max Resource | Guaranteed Resource |
| ---------------- | ------------ | ------------------- |
| `normal`         | 12           | - (not configured)  |
| `normal.queue-1` | 10           | 5                   |
| `normal.queue-2` | 10           | 5                   |

Result:

When a set of guaranteed resources is defined, preemption aims to ensure that all queues satisfy their guaranteed resources. Preemption stops once the guaranteed resources are met (law 4). A queue may be preempted if it has more resources than its guaranteed amount. For instance, in this case, if queue-1 has fewer resources than its guaranteed amount (<5), it will not be preempted (law 5).

| Queue            | Resource before preemption | Resource after preemption              |
| ---------------- | -------------------------- | -------------------------------------- |
| `normal.queue-1` | 10 (victim)                | 7                                      |
| `normal.queue-2` | 2                          | 5 (guaranteed resources are satisfied) |

![preemption_normal_case](../assets/preemption_normal_case.png)

### Preemption Case Without Guaranteed Resources

Similar to the previous example, but this time the queue does not have a "guaranteed resource" defined.

| Queue                   | Max Resource | Guaranteed Resource |
| ----------------------- | ------------ | ------------------- |
| `no-guaranteed`         | 12           | -                   |
| `no-guaranteed.queue-1` | 10           | -                   |
| `no-guaranteed.queue-2` | 10           | -                   |

Result:

In the absence of a guaranteed resource setting, preemption allows each queue to utilize an equal amount of resources.

| Queue                     | Resource before preemption | Resource after preemption |
| ------------------------- | -------------------------- | ------------------------- |
| `no-guaranteed.queue-1` | 10 (victim)                | 6                         |
| `no-guaranteed.queue-2` | 2                          | 6                         |

![preemption_no_guaranteed_case](../assets/preemption_no_guaranteed_case.png)

### Priority

In general, a pod can preempt a pod with equal or lower priority. You can set the priority by defining a [PriorityClass](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) or by utilizing [queue priorities](priorities).

While preemption allows service-type pods to scale up or down through preemption, it can also lead to the preemption of pods that should not be preempted in certain scenarios:

1. Spark Jobs, where the driver pod manages a large number of jobs, and if preempted, all jobs will be affected.
2. Interactive pods, such as Python notebooks, have a significant impact when restarted and should be avoided from preemption.

To address this issue, we have designed a "do not preempt me" flag. You can set the annotation `yunikorn.apache.org/allow-preemption` to `false` in the PriorityClass to prevent pod requests from being preempted. 
> **_NOTE:_** The flag `yunikorn.apache.org/allow-preemption` is a request only. It is not guaranteed but Pods annotated with this flag will be preempted last.


### PriorityClass

In this example, we will demonstrate the configuration of `yunikorn.apache.org/allow-preemption` using PriorityClass and observe its effect. The default value for this configuration is set to `true`.

```bash
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: preemption-not-allow
  annotations:
    "yunikorn.apache.org/allow-preemption": "false"
value: 0
```

We will deploy 8 pods with a resource requirement of 1 to `queue-1`, `queue-2`, and `queue-3`, respectively. We will deploy to `queue-1` and `queue-2` first, followed by a few seconds delay before deploying to `queue-3`. This ensures that the resource usage in `queue-1` and `queue-2` will be greater than that in `queue-3`, depleting all resources in the parent queue and triggering preemption.

| Queue                    | Max Resource | Guaranteed Resource | Policy                      |
| ------------------------ | ------------ | ------------------- | --------------------------- |
| `priority-class`         | 16           | -                   |                             |
| `priority-class.queue-1` | 8            | 3                   | `"allow-preemption": true`  |
| `priority-class.queue-2` | 8            | 3                   | `"allow-preemption": false` |
| `priority-class.queue-3` | 8            | 3                   | `"allow-preemption": true`  |

Result:

When preemption is triggered, `queue-3` will start searching for a victim. However, since `queue-2` is set with allow-preemption as false, the resources of `queue-1` will be preempted.

Please note that setting `yunikorn.apache.org/allow-preemption` is a strong recommendation but does not guarantee the lack of preemption. When this flag is set to `false`, it moves the Pod to the back of the preemption list, giving it a lower priority for preemption compared to other Pods. However, in certain scenarios, such as when no other preemption options are available, Pods with this flag may still be preempted.

For example, even with `allow-preemption` set to `false`, DaemonSet pods can still be preempted. Additionally, if an application in `queue-1` has a higher priority than one in `queue-3`, the application in `queue-2` will be preempted because an application can never preempt another application with a higher priority. In such cases where no other preemption options exist, the `allow-preemption` flag may not prevent preemption.


| Queue                  | Resource before preemption | Resource after preemption              |
| ---------------------- | -------------------------- | -------------------------------------- |
| `priority-class.queue-1` | 8 (victim)                 | 5                                      |
| `priority-class.queue-2` | 8                          | 8                                      |
| `priority-class.queue-3` | 0                          | 3 (guaranteed resources are satisfied) |

![preemption_priorityclass_case](../assets/preemption_priorityclass_case.png)

### Priority Queue

In addition to utilizing the default PriorityClass in Kubernetes, you can configure priorities directly on a [YuniKorn queue](priorities).

In the following example, we will demonstrate preemption based on queue priority.

We will deploy five pods with a resource demand of 3 in the `high-priority` queue, `normal-priority` queue, and `low-priority` queue, respectively. We will deploy them to the `normal-priority` queue first, ensuring that the resources in the `priority-queue`(parent queue) will be fully utilized. This will result in uneven resource distribution among the queues, triggering preemption.

| Queue                            | Max Resource | Guaranteed Resource | priority.offset |
| -------------------------------- | ------------ | ------------------- | --------------- |
| `priority-queue`                 | 18           | -                   |                 |
| `priority-queue.high-priority`   | 10           | 6                   | 100             |
| `priority-queue.normal-priority` | 18           | 6                   | 0               |
| `priority-queue.low-priority`    | 10           | 6                   | -100            |

Result:

A queue with higher priority can preempt resources from a queue with lower priority, and preemption stops when the queue has preempted enough resources to satisfy its guaranteed resources.

| Queue                            | Resource before preemption | Resource after preemption              |
| -------------------------------- | -------------------------- | -------------------------------------- |
| `priority-queue.high-priority`   | 0                          | 6 (guaranteed resources are satisfied) |
| `priority-queue.normal-priority` | 18 (victim)                | 12                                     |
| `priority-queue.low-priority`    | 0                          | 0                                      |

![preemption_priority_queue_case](../assets/preemption_priority_queue_case.png)

### Preeemption Fence

In a multi-tenant environment, it is essential to prevent one tenant from occupying the resources of another tenant. In YuniKorn, we map tenants to a queue hierarchy, the queue hierarchy can thus cross tenant boundaries.

To address this issue, YuniKorn introduces a [preemption fence](design/preemption.md#preemption-fence), which is a setting on the queue that prevents preemption from looking at queues outside the fence boundary.  The fence is a one-way fence. It prevents going out (i.e. higher up the queue hierarchy), but does not prevent coming in (or down) the queue hierarchy.

```bash
...
queues:
- name: default
  properties:
    preemption.policy: fence
```

We will use the following diagram as an example:

![preemption_fence_hierarchy_case](../assets/preemption_fence_hierarchy_case.png)

In this example, we will sequentially deploy 15 pods with a resource requirement of 1 to each sub-queue.

First, we deploy `queue-1` in `tenant-a` and wait until the application in `queue-1` occupies all the resources of `tenant-a`. Then, we deploy `queue-2` after the resources of `tenant-a` are fully utilized. Next, we deploy the application `tenant-b.queue-3` and allocate resources to the system when the fence queue is full.

| Queue                    | Max Resource | Guaranteed Resource | fence |
| ------------------------ | ------------ | ------------------- | ----- |
| `fence`                  | 3            | -                   | true  |
| `fence.tenant-a`         | 15           | 5                   | true  |
| `fence.tenant-a.queue-1` | 15           | 2                   |       |
| `fence.tenant-a.queue-2` | 15           | 2                   | true  |
| `fence.tenant-b`         | 15           | 10                  | true  |
| `fence.tenant-b.queue-3` | 15           | 10                  |       |
| `fence.system`           | 15           | 10                  |       |

Result:

In this example, two imbalances are observed:

- Within `tenant-a`, `queue-1` occupies all the resources, while `queue-2` has no resources. However, since `queue-2` is configured with a fence, it cannot acquire resources from outside the fence.
  ![preemption_fence_case1](../assets/preemption_fence_case1.png)
- Inside the `fence` queue, both `tenant-a` and `tenant-b` occupy all the resources, while the `system` queue has no resources, and no fence is set up. Therefore, the `system` queue can acquire resources from the queues in the hierarchy until its guaranteed resources are met. In this case, the `system` queue acquires resources from both `tenant-a` and `tenant-b`.
  ![preemption_fence_case2](../assets/preemption_fence_case2.png)

| Queue                    | Resource before preemption | Resource after preemption |
| ------------------------ | -------------------------- | ------------------------- |
| `fence.tenant-a`         | 15                         | 10                        |
| `fence.tenant-a.queue-1` | 15                         | 10                        |
| `fence.tenant-a.queue-2` | 0                          | 0                         |
| `fence.tenant-b`         | 15                         | 10                        |
| `fence.tenant-b.queue-3` | 15                         | 10                        |
| `fence.system`           | 0                          | 10                        |