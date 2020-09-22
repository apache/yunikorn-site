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

## Option 3) Hierarchy queues with dynamical leaves that mapped to namespaces

### Goal
Though the tag placement rule using the `namespace` tag is capable of putting applications based on the name of the namespace, sometimes more dynamic placement is required.

Users can annotate namespaces which allows dynamic placement of applications based on the annotation value if proper placement rules are present.

### Configuration
Apply the following configuration to YuniKorn's configmap:

```yaml
placementrules:
 - name: tag
   value: namespace
   create: true
   parent:
     - name: tag
       value: namespace.parentqueue
queues:
 - name: root
   queues:
     - name: namespaces

```

The `namespace.parentqueue` tag is provided by the shim (see next section).

You can do this during the installation by overwriting the configuration in the
[helm chart template](https://github.com/apache/incubator-yunikorn-release/blob/724ec82d0d548598e170cc6d5ca6aaae00f8286c/helm-charts/yunikorn/values.yaml#L71-L81).

### Set up namespaces
You can configure the following annotation for a Kubernetes namespace in your cluster: `yunikorn.apache.org/parentqueue`.

E.g. `production` namespace can be annotated with the following annotation:
```yaml
yunikorn.apache.org/parentqueue: root.namespaces
```

Each pod (allocation) created in the namespace will be passed to the scheduler with the value of that annotation under the `namespace.parentqueue` tag.

This tag can be further used in the tag placement rule to provide the desired mapping as seen above in the Configuration section.

### Run workloads
After the configmap has been configured and the namespace has been annotated, users simply submit applications to the namespace and the placement rule will take effect.

Let's say a user submits an application to the `production` namespace. The application will be placed onto `root.namespaces.production` based on the configs above.
