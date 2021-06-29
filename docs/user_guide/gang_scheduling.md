---
id: gang_scheduling
title: Gang Scheduling
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

## What is Gang Scheduling

When Gang Scheduling is enabled, YuniKorn schedules the app only when
the app’s minimal resource request can be satisfied. Otherwise, apps
will be waiting in the queue. Apps are queued in hierarchy queues,
with gang scheduling enabled, each resource queue is assigned with the
maximum number of applications running concurrently with min resource guaranteed.

![Gang Scheduling](./../assets/gang_scheduling_iintro.png)

## Enable Gang Scheduling

There is no cluster-wide configuration needed to enable Gang Scheduling.
The scheduler actively monitors the metadata of each app, if the app has included
a valid taskGroups definition, it will be considered as gang scheduling desired.

:::info Task Group
A task group is a “gang” of tasks in an app, these tasks are having the same resource profile
and the same placement constraints. They are considered as homogeneous requests that can be
treated as the same kind in the scheduler.
:::

### Prerequisite

For the queues which runs gang scheduling enabled applications, the queue sorting policy needs to be set either
`FIFO` or `StateAware`. To configure queue sorting policy, please refer to doc: [app sorting policies](user_guide/sorting_policies.md#Application_sorting).

:::info Why FIFO based sorting policy?
When Gang Scheduling is enabled, the scheduler proactively reserves resources
for each application. If the queue sorting policy is not FIFO based (StateAware is FIFO based sorting policy),
the scheduler might reserve partial resources for each app and causing resource segmentation issues.
:::

### App Configuration

On Kubernetes, YuniKorn discovers apps by loading metadata from individual pod, the first pod of the app
is required to enclosed with a full copy of app metadata. If the app doesn’t have any notion about the first or second pod,
then all pods are required to carry the same taskGroups info. Gang scheduling requires taskGroups definition,
which can be specified via pod annotations. The required fields are:

| Annotation                                     | Value |
|----------------------------------------------- |---------------------	|
| yunikorn.apache.org/task-group-name 	         | Task group name, it must be unique within the application |
| yunikorn.apache.org/task-groups                | A list of task groups, each item contains all the info defined for the certain task group |
| yunikorn.apache.org/schedulingPolicyParameters | Optional. A arbitrary key value pairs to define scheduling policy parameters. Please read [schedulingPolicyParameters section](#scheduling-policy-parameters) |

#### How many task groups needed?

This depends on how many different types of pods this app requests from K8s. A task group is a “gang” of tasks in an app,
these tasks are having the same resource profile and the same placement constraints. They are considered as homogeneous
requests that can be treated as the same kind in the scheduler. Use Spark as an example, each job will need to have 2 task groups,
one for the driver pod and the other one for the executor pods.

#### How to define task groups?

The task group definition is a copy of the app’s real pod definition, values for fields like resources, node-selector
and toleration should be the same as the real pods. This is to ensure the scheduler can reserve resources with the
exact correct pod specification.

#### Scheduling Policy Parameters

Scheduling policy related configurable parameters. Apply the parameters in the following format in pod's annotation:

```yaml
annotations:
   yunikorn.apache.org/schedulingPolicyParameters: "PARAM1=VALUE1 PARAM2=VALUE2 ..."
```

Currently, the following parameters are supported:

`placeholderTimeoutInSeconds`

Default value: *15 minutes*.
This parameter defines the reservation timeout for how long the scheduler should wait until giving up allocating all the placeholders.
The timeout timer starts to tick when the scheduler *allocates the first placeholder pod*. This ensures if the scheduler
could not schedule all the placeholder pods, it will eventually give up after a certain amount of time. So that the resources can be
freed up and used by other apps. If non of the placeholders can be allocated, this timeout won't kick-in. To avoid the placeholder
pods stuck forever, please refer to [troubleshooting](trouble_shooting.md#gang-scheduling) for solutions.

` gangSchedulingStyle`

Valid values: *Soft*, *Hard*

Default value: *Soft*.
This parameter defines the fallback mechanism if the app encounters gang issues due to placeholder pod allocation.
See more details in [Gang Scheduling styles](#gang-scheduling-styles) section

More scheduling parameters will added in order to provide more flexibility while scheduling apps.

#### Example

The following example is a yaml file for a job. This job launches 2 pods and each pod sleeps 30 seconds.
The notable change in the pod spec is *spec.template.metadata.annotations*, where we defined `yunikorn.apache.org/task-group-name`
and `yunikorn.apache.org/task-groups`.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: gang-scheduling-job-example
spec:
  completions: 2
  parallelism: 2
  template:
    metadata:
      labels:
        app: sleep
        applicationId: "gang-scheduling-job-example"
        queue: root.sandbox
      annotations:
        yunikorn.apache.org/task-group-name: task-group-example
        yunikorn.apache.org/task-groups: |-
          [{
              "name": "task-group-example",
              "minMember": 2,
              "minResource": {
                "cpu": "100m",
                "memory": "50M"
              },
              "nodeSelector": {},
              "tolerations": []
          }]
    spec:
      schedulerName: yunikorn
      restartPolicy: Never
      containers:
        - name: sleep30
          image: "alpine:latest"
          command: ["sleep", "30"]
          resources:
            requests:
              cpu: "100m"
              memory: "50M"
```

When this job is submitted to Kubernetes, 2 pods will be created using the same template, and they all belong to one taskGroup:
*“task-group-example”*. YuniKorn will create 2 placeholder pods, each uses the resources specified in the taskGroup definition.
When all 2 placeholders are allocated, the scheduler will bind the the real 2 sleep pods using the spot reserved by the placeholders.

You can add more than one taskGroups if necessary, each taskGroup is identified by the taskGroup name,
it is required to map each real pod with a pre-defined taskGroup by setting the taskGroup name. Note,
the task group name is only required to be unique within an application.

### Enable Gang scheduling for Spark jobs

Each Spark job runs 2 types of pods, driver and executor. Hence, we need to define 2 task groups for each job.
The annotations for the driver pod looks like:

```yaml
Annotations:
  yunikorn.apache.org/schedulingPolicyParameters: “placeholderTimeoutSeconds=30”
  yunikorn.apache.org/taskGroupName: “spark-driver”
  yunikorn.apache.org/taskGroup: “
    TaskGroups: [
     {
       Name: “spark-driver”
       minMember: 1,
       minResource: {
         Cpu: 1,
         Memory: 2Gi
       },
       Node-selector: ...
       Tolerations: ...
     },
      {
        Name: “spark-executor”,
        minMember: 10, 
        minResource: {
          Cpu: 1,
          Memory: 2Gi
        }
      }
  ]
  ”
```

:::note
Spark driver and executor pod has memory overhead, that needs to be considered in the taskGroup resources. 
:::

For all the executor pods,

```yaml
Annotations:
  # the taskGroup name should match to the names
  # defined in the taskGroups field
  yunikorn.apache.org/taskGroupName: “spark-executor”
```

Once the job is submitted to the scheduler, the job won’t be scheduled immediately.
Instead, the scheduler will ensure it gets its minimal resources before actually starting the driver/executors. 

## Gang scheduling Styles

There are 2 gang scheduling styles supported, Soft and Hard respectively. It can be configured per app-level to define how the app will behave in case the gang scheduling fails.

- `Hard style`: when this style is used, we will have the initial behavior, more precisely if the application cannot be scheduled according to gang scheduling rules, and it times out, it will be marked as failed, without retrying to schedule it.
- `Soft style`: when the app cannot be gang scheduled, it will fall back to the normal scheduling, and the non-gang scheduling strategy will be used to achieve the best-effort scheduling. When this happens, the app transits to the Resuming state and all the remaining placeholder pods will be cleaned up.

**Default style used**: `Soft`

**Enable a specific style**: the style can be changed by setting in the application definition the ‘gangSchedulingStyle’ parameter to Soft or Hard.

#### Example

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: gang-app-timeout
spec:
  completions: 4
  parallelism: 4
  template:
    metadata:
      labels:
        app: sleep
        applicationId: gang-app-timeout
        queue: fifo
      annotations:
        yunikorn.apache.org/task-group-name: sched-style
        yunikorn.apache.org/schedulingPolicyParameters: "placeholderTimeoutInSeconds=60 gangSchedulingStyle=Hard"
        yunikorn.apache.org/task-groups: |-
          [{
              "name": "sched-style",
              "minMember": 4,
              "minResource": {
                "cpu": "1",
                "memory": "1000M"
              },
              "nodeSelector": {},
              "tolerations": []
          }]
    spec:
      schedulerName: yunikorn
      restartPolicy: Never
      containers:
        - name: sleep30
          image: "alpine:latest"
          imagePullPolicy: "IfNotPresent"
          command: ["sleep", "30"]
          resources:
            requests:
              cpu: "1"
              memory: "1000M"

```

## Verify Configuration

To verify if the configuration has been done completely and correctly, check the following things:
1. When an app is submitted, verify the expected number of placeholders are created by the scheduler.
If you define 2 task groups, 1 with minMember 1 and the other with minMember 5, that means we are expecting 6 placeholder
gets created once the job is submitted.
2. Verify the placeholder spec is correct. Each placeholder needs to have the same info as the real pod in the same taskGroup.
Check field including: namespace, pod resources, node-selector, and toleration.
3. Verify the placeholders can be allocated on correct type of nodes, and verify the real pods are started by replacing the placeholder pods.

## Troubleshooting

Please see the troubleshooting doc when gang scheduling is enabled [here](trouble_shooting.md#gang-scheduling).
