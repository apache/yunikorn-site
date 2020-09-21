---
id: resource_quota_management
title: Resource Quota Management
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

YuniKorn can offer more fine-grained resource quota management comparing to simply
using namespace resource quota. Here are some how-to documents about setting up
resource quota management with YuniKorn queues.

## Option 1) Static queues

### Goal

Pre-setup a hierarchy of queues with min/max capacity, users can only submit
jobs to the leaf queues. This approach fully manages the resource capacity for
each of the queues, which is suitable to the scenarios that queues do not change
too often.

### Configuration

:::note
The following configuration is an example to demonstrate the format,
you need to setup the queue hierarchy based on your own structure and capacity,
:::

Apply the following configuration to YuniKorn's configmap:

```yaml
partitions:
  -
    name: default
    queues:
      -
        name: root
        submitacl: '*'
        queues:
          -
            name: advertisement
            resources:
              guaranteed:
                memory: 500000
                vcore: 50000
              max:
                memory: 800000
                vcore: 80000
          -
            name: search
            resources:
              guaranteed:
                memory: 400000
                vcore: 40000
              max:
                memory: 600000
                vcore: 60000
          -
            name: sandbox
            resources:
              guaranteed:
                memory: 100000
                vcore: 10000
              max:
                memory: 100000
                vcore: 10000
```

in this example, we are going to setup 3 queues under root, and each of them has
a specific min/max capacity set up.

### Run workloads

In order to run jobs in specific queues, you will need to set the following label in all pods' spec:

```yaml
labels:
  app: my-test-app
  applicationId: " my-test-app-01"
  queue: root.sandbox
```

## Option 2) 1:1 mapping from namespaces to queues

### Goal

User just needs to setup namespaces, YuniKorn automatically maps each namespace to an internal resource queue (AKA dynamical queue).
There is no additional steps to create YuniKorn queues, all queues will be created dynamically,
resource allocation and quotas will be managed by YuniKorn instead of the namespace resource quota.

### Configuration

Apply the following configuration to YuniKorn's configmap:

```yaml
partitions:
  -
    name: default
    placementrules:
      - name: tag
        value: namespace
        create: true
    queues:
      - name: root
        submitacl: '*'
        properties:
          application.sort.policy: stateaware

```

Note, the property `application.sort.policy` in this configuration is set to
`stateaware`. This is a simple app sorting policy applicable for batch jobs, you
can find more document [here](sorting_policies.md#StateAwarePolicy).

You can do this during the installation by overwriting the configuration in the
[helm chart template](https://github.com/apache/incubator-yunikorn-release/blob/724ec82d0d548598e170cc6d5ca6aaae00f8286c/helm-charts/yunikorn/values.yaml#L71-L81).

### Set up namespaces

Continue to create namespaces like before, do not create namespace quota anymore.
Instead, set the following annotation in the namespace object:

```yaml
yunikorn.apache.org/namespace.max.cpu: "64"
yunikorn.apache.org/namespace.max.memory: "100Gi"
```

YuniKorn will parse the annotation and set the max capacity of the dynamical queue
that mapped to this namespace to 64 CPU and 100GB memory.

### Run workloads

Jobs continue to be submitted to namespaces, based on the `Placementrule` used
in the configuration. YuniKorn will automatically run the job and all its pods in
the corresponding queue. For example, if a job is submitted to namespace `development`,
then you will see the job is running in `root.development` queue.
