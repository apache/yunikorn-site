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
 
## Scheduler logs

### Retrieve scheduler logs

Currently, the scheduler writes its logs to stdout/stderr, docker container handles the redirection of these logs to a
local location on the underneath node, you can read more document [here](https://docs.docker.com/config/containers/logging/configure/).
These logs can be retrieved by [kubectl logs](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs). Such as:

```shell script
// get the scheduler pod
kubectl get pod -l component=yunikorn-scheduler -n yunikorn
NAME                                  READY   STATUS    RESTARTS   AGE
yunikorn-scheduler-766d7d6cdd-44b82   2/2     Running   0          33h

// retrieve logs
kubectl logs yunikorn-scheduler-766d7d6cdd-44b82 yunikorn-scheduler-k8s -n yunikorn
```

In most cases, this command cannot get all logs because the scheduler is rolling logs very fast. To retrieve more logs in
the past, you will need to setup the [cluster level logging](https://kubernetes.io/docs/concepts/cluster-administration/logging/#cluster-level-logging-architectures).
The recommended setup is to leverage [fluentd](https://www.fluentd.org/) to collect and persistent logs on an external storage, e.g s3. 

### Set Logging Level

:::note
Changing the logging level requires a restart of the scheduler pod.
:::

Stop the scheduler:

```shell script
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=0
```
edit the deployment config in vim:

```shell script
kubectl edit deployment yunikorn-scheduler -n yunikorn
```

add `LOG_LEVEL` to the `env` field of the container template. For example setting `LOG_LEVEL` to `0` sets the logging
level to `INFO`.

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
 ...
spec:
  template: 
   ...
    spec:
      containers:
      - env:
        - name: LOG_LEVEL
          value: '0'
```

Start the scheduler:

```shell script
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=1
```

Available logging levels:

| Value 	| Logging Level 	|
|:-----:	|:-------------:	|
|   -1  	|     DEBUG     	|
|   0   	|      INFO     	|
|   1   	|      WARN     	|
|   2   	|     ERROR     	|
|   3   	|     DPanic    	|
|   4   	|     Panic     	|
|   5   	|     Fatal     	|

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

## Gang Scheduling

### 1. No placeholders created, app's pods are pending

*Reason*: This is usually because the app is rejected by the scheduler, therefore non of the pods are scheduled.
The common reasons caused the rejection are: 1) The taskGroups definition is invalid. The scheduler does the
sanity check upon app submission, to ensure all the taskGroups are defined correctly, if these info are malformed,
the scheduler rejects the app; 2) The total min resources defined in the taskGroups is bigger than the queues' max
capacity, scheduler rejects the app because it won't fit into the queue's capacity. Check the pod event for relevant messages,
and you will also be able to find more detail error messages from the schedulers' log.

*Solution*: Correct the taskGroups definition and retry submitting the app. 

### 2. Not all placeholders can be allocated

*Reason*: The placeholders also consume resources, if not all of them can be allocated, that usually means either the queue
or the cluster has no sufficient resources for them. In this case, the placeholders will be cleaned up after a certain
amount of time, defined by the `placeholderTimeoutInSeconds` scheduling policy parameter.

*Solution*: Note, if the placeholder timeout reaches, currently the app will transit to failed state and can not be scheduled
anymore. You can increase the placeholder timeout value if you are willing to wait for a longer time. In the future, a fallback policy
might be added to provide some retry other than failing the app.

### 3. Not all placeholders are swapped

*Reason*: This usually means the actual app's pods are less than the minMembers defined in the taskGroups.

*Solution*: Check the `minMember` in the taskGroup field and ensure it is correctly set. The `minMember` can be less than
the actual pods, setting it to bigger than the actual number of pods is invalid.

### 4.Placeholders are not cleaned up when the app terminated

*Reason*: All the placeholders are set an [ownerReference](https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/#owners-and-dependents)
to the first real pod of the app, or the controller reference. If the placeholder could not be cleaned up, that means
the garbage collection is not working properly. 

*Solution*: check the placeholder `ownerReference` and the garbage collector in Kubernetes.    


## Still got questions?

No problem! The Apache YuniKorn community will be happy to help. You can reach out to the community with the following options:

1. Post your questions to dev@yunikorn.apache.org
2. Join the [YuniKorn slack channel](https://join.slack.com/t/yunikornworkspace/shared_invite/enQtNzAzMjY0OTI4MjYzLTBmMDdkYTAwNDMwNTE3NWVjZWE1OTczMWE4NDI2Yzg3MmEyZjUyYTZlMDE5M2U4ZjZhNmYyNGFmYjY4ZGYyMGE) and post your questions to the `#yunikorn-user` channel.
3. Join the [community sync up meetings](http://yunikorn.apache.org/community/getInvolved#community-meetings) and directly talk to the community members. 