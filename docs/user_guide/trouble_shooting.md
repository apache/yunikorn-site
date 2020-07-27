---
id: trouble_shooting
title: Trouble Shooting
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

## Pods are stuck at Pending state

If some pods are stuck at Pending state, that means the scheduler could not find a node to allocate the pod. There are
several possibilities to cause this:

### 1. Non of the nodes satisfy pod placement requirement

A pod can be configured with some placement constraints, such as [node-selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector),
[affinity/anti-affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity),
do not have certain toleration for node [taints](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/), etc.
To debug such issues, you can describe the pod by:

```shell script
kubectl describe pod <pod-name> -n <namespace>
```

the pod events will contain the predicate failures and that explains why nodes are not qualified for allocation.

### 2. The queue is running out of capacity

If the queue is running out of capacity, pods will be pending for available queue resources. To check if a queue is still
having enough capacity for the pending pods, there are several approaches:

1) check the queue usage from yunikorn UI

If you do not know how to access the UI, you can refer the document [here](../get_started/get_started.md#access-the-web-ui). Go
to the `Queues` page, navigate to the queue where this job is submitted to. You will be able to see the available capacity
left for the queue.

2) check the pod events

Run the `kubectl describe pod` to get the pod events. If you see some event like:
`Application <appID> does not fit into <queuePath> queue`. That means the pod could not get allocated because the queue
is running out of capacity.

The pod will be allocated if some other pods in this queue is completed or removed. If the pod remains pending even
the queue has capacity, that may because it is waiting for the cluster to scale up.

## Restart the scheduler

YuniKorn can recover its state upon a restart. YuniKorn scheduler pod is deployed as a deployment, restart the scheduler
can be done by scale down and up the replica:

```shell script
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=0
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=1
```

## Still got questions?

No problem! The Apache YuniKorn community will be happy to help. You can reach out to the community with the following options:

1. Post your questions to dev@yunikorn.apache.org
2. Join the [YuniKorn slack channel](https://join.slack.com/t/yunikornworkspace/shared_invite/enQtNzAzMjY0OTI4MjYzLTBmMDdkYTAwNDMwNTE3NWVjZWE1OTczMWE4NDI2Yzg3MmEyZjUyYTZlMDE5M2U4ZjZhNmYyNGFmYjY4ZGYyMGE) and post your questions to the `#yunikorn-user` channel.
3. Join the [community sync up meetings](http://yunikorn.apache.org/community/get_involved#community-meetings) and directly talk to the community members. 