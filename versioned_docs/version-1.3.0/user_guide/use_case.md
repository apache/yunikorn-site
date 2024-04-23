---
id: use_cases
title: Use Cases
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

## Introduction

Yunikorn offers a range of features, including advanced capabilities like hierarchical resource queues, access control lists, resource limits, preemption, priority, and placement rules for managing your cluster. This page presents a real-world scenario to demonstrate the practical application of these features.

We will now introduce the various functions and configurations of Yunikorn in sequence.

The following will be included in this article：

- Access control with ACL
- Placement of different users
- Limit usable resources on a queue level
- Preemption and priority scheduling with fencing

---

## Prerequisite

Before configuring yunikorn-config, we need to create users using [Authenticating](https://kubernetes.io/docs/reference/access-authn-authz/authentication/) and [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) from Kubernetes.

To create the necessary users for the example, you can download the `create_user.sh` script directly from yunikorn-k8shim under deployment/examples/use-case/access-control.

Here are the users we need to create:

| user      | group     |
|-----------|-----------|
| admin     | admin     |
| sue       | group-a   |
| bob       | group-a   |
| kim       | group-b   |
| yono      | group-b   |
| anonymous | anonymous |

After the user is created, the pod can be obtained by the following command to confirm the creation is successful：

```yaml
kubectl --context=sue-context get pod
```

When you are done testing, you can run `./remove-user.sh` in the folder to delete all users.

---

## Partition and Queue Configuration

In this use case, we configure the cluster for two purposes - system management and multi-tenancy, with two groups of tenants. Below is the queue configuration:

- Root
    - system
    - tenants
        - group-a
        - group-b

```yaml
kind: ConfigMap
metadata:
  name: yunikorn-configs
  namespace: yunikorn
apiVersion: v1
data:
  queues.yaml: |
    partitions: 
    - name: default
      queues:
        - name: root
          queues:
          - name: system
          - name: tenants
            queues:
              - name: group-a
              - name: group-b
```

See the documentation on [Partition and Queue Configuration](queue_config) for more information.

---

## User/Group Resolution & ACL

In a multi-tenant environment, we want each user's workload to be independent from one another, with tenants restricted to using specific queues.

In Yunikorn, there are two steps to manage users:

1. The Admission Controller resolves the username and group and adds the user's informantion to the Annotation.
2. Yunikorn compares whether the user is in the ACL of a specific queue to determine whether the user has permission to deploy applications on that queue.

### Explanation of Configuration

In the following example, we configure the configuration based on the following:

| user      | group     | Queue allowed to put |
|-----------|-----------|----------------------|
| admin     | admin     | system               |
| sue       | group-a   | root.tenants.group-a |
| bob       | group-a   | root.tenants.group-a |
| kim       | group-b   | root.tenants.group-b |
| yono      | group-b   | root.tenants.group-b |
| anonymous | anonymous | x                    |

In this configuration, we allow users in the admin group to use the system queue by setting `adminacl: admin` for the `root.system` queue. We also allow the group-a and group-b groups to use their respective queues (`root.tenants.group-a` and `root.tenants.group-b`) by setting `adminacl: group-a` and `adminacl: group-b` for each queue, respectively.

Configuration for testing :

```yaml
kind: ConfigMap
metadata:
  name: yunikorn-configs
  namespace: yunikorn
apiVersion: v1
data:
  admissionController.accessControl.externalGroups: "admin,group-a,group-b"
  queues.yaml: |
    partitions: 
    - name: default
      queues:
        - name: root
          queues:
          - name: system
            adminacl: " admin"
          - name: tenants
            queues:
              - name: group-a
                adminacl: " group-a"
              - name: group-b
                adminacl: " group-b"
```

### Testing

In this test scenario, we utilize three users to create a Pod, but the access control list restricts each user to create Pods only in the allowed queue.

Among these users, one is named Sue and belongs to the group-a. Whenever Sue tries to create a Pod, the admission controller will first add the user's name and group to the Pod's annotation:

```yaml
Annotations:      
   ...
   yunikorn.apache.org/user.info: {"user":"sue","groups":["group-a","system:authenticated"]}
   ...
```

The scheduler will then determine whether to allow or block the user's pod based on the access control list of the assigned queue. 

Here are the results for different users assigned to different queues. You can use the YAML file we provide to test :

| user, group          | Assign queue         | result  | YAML filename |
|----------------------|----------------------|---------|---------------|
| sue, group-a         | root.tenants.group-a | created | nginx-1.yaml  |
| sue, group-a         | root.tenants.group-b | blocked | nginx-1.yaml  |
| kim, group-b         | root.tenants.group-a | blocked | nginx-2.yaml  |
| kim, group-b         | root.tenants.group-b | created | nginx-2.yaml  |
| anonymous, anonymous | root.tenants.group-a | blocked | nginx-3.yaml  |
| anonymous, anonymous | root.tenants.group-b | blocked | nginx-3.yaml  |

See the documentation on [User & Group Resolution](usergroup_resolution) or [ACLs](acls) for more information.

---

## Placement of different users

To simplify the user's experience, the scheduler can dynamically assign the application to a queue and create a new queue if necessary. By setting up the placement rules properly, the user won't need to specify the queue to run their application on.

### Explanation of Configuration

Yunikorn offers extensive support for placement rules, allowing users to assign queues based on the namespace or username of the Pod, or to create queues based on user specifications.

Let's take the "admin" user as an example to explain the configuration. We want the scheduler to create a new queue based on the queue provided by the "admin":

```yaml
placementrules:
  - name: provided
    create: true
```

To further restrict users and provide different placement rules for different users, we need to use `filter` since the previous configuration cannot achieve this. 

Additionally, we want to separate the system and tenant queues, and for queues created by the admin, we want them to be under the system queue. To do so, we use the `parent` attribute. 

To allow the queue to be designated as a parent, we need to set `parent: true` in the parent queue. 

Finally, we extend the configuration as follows:

```yaml
placementrules:
  - name: provided
    create: true
    parent: # Specify the parent of the created queue as root.system
      name: fixed
      value: root.system
    filter: # Only admin is allowed to use the rule
      type: allow
      users:
        - admin
      groups:
        - admin
```

In the following example, we configure the configuration based on the following:

| group   | placement rule | fixed parent         |
|---------|----------------|----------------------|
| admin   | provided       | root.system          |
| group-a | username       | root.tenants.group-a |
| group-b | namespace      | root.tenants.group-b |

Configuration for testing :

```yaml
kind: ConfigMap
metadata:
  name: yunikorn-configs
  namespace: yunikorn
apiVersion: v1
data:
  admissionController.accessControl.externalGroups: "admin,group-a,group-b"
  queues.yaml: |
    partitions: 
      - name: default
        placementrules:
          - name: provided
            create: true
            parent:
              name: fixed
              value: root.system
              filter:
                type: allow
                users:
                  - admin
                groups:
                  - admin
          - name: user
            create: true
            filter:
              type: allow
              groups:
                - group-a
            parent:
              name: fixed
              value: root.tenants.group-a
          - name: tag
            value: namespace
            create: true
            filter:
              type: allow
              groups:
                - group-b
            parent:
              name: fixed
              value: root.tenants.group-b
        queues:
          - name: root
            queues:
            - name: system
              adminacl: " admin"
              parent: true  # Let the queue be designated as the parent queue
            - name: tenants
              parent: true
              queues:
                - name: group-a
                  adminacl: " group-a"
                  parent: true
                - name: group-b
                  adminacl: " group-b"
                  parent: true
```

### Testing

In this test example, we use three users to verify all the placement rules. 

The following results are generated when creating a Pod according to different rules. You can use the YAML file we provide for testing:

| placement rule         | user, group  | provide queue             | namespace | Expected to be placed on  | YAML filename    |
|------------------------|--------------|---------------------------|-----------|---------------------------|------------------|
| provided               | admin, admin | root.system.high-priority |           | root.system.high-priority | nginx-admin.yaml |
| provided               | admin, admin | root.system.low-priority  |           | root.system.low-priority  | nginx-admin.yaml |
| username               | sue, group-a |                           |           | root.tenants.group-a.sue  | nginx-sue.yaml   |
| tag (value: namespace) | kim, group-b |                           | dev       | root.tenants.group-b.dev  | nginx-kim.yaml   |
| tag (value: namespace) | kim, group-b |                           | test      | root.tenants.group-b.test | nginx-kim.yaml   |

See the documentation on [App Placement Rules](placement_rules) for more information.

---

## Limit usable resources on a queue level

To avoid unfair resource usage, we can limit and reserve the amount of resources per queue.

### Explanation of Configuration

In the following example, we configure the configuration based on the following:

| queue                | guaranteed |       | max       |       |
|----------------------|------------|-------|-----------|-------|
|                      | memory(G)  | vcore | memory(G) | vcore |
| root                 | x          | x     | 15.6      | 16    |
| root.system          | 2          | 2     | 6         | 6     |
| root.tenants         | 2          | 2     | 4         | 8     |
| root.tenants.group-a | 1          | 1     | 2         | 4     |
| root.tenants.group-b | 1          | 1     | 2         | 4     |

Configuration for testing :

```yaml
kind: ConfigMap
metadata:
  name: yunikorn-configs
  namespace: yunikorn
apiVersion: v1
data:
  admissionController.accessControl.externalGroups: "admin,^group-$"
  queues.yaml: |
    partitions: 
    - name: default
      queues:
        - name: root
          queues:
          - name: system
            adminacl: " admin"
            resources:
              guaranteed:
                {memory: 2G, vcore: 2}
              max:
                {memory: 6G, vcore: 6}
          - name: tenants
            resources:
              guaranteed:
                {memory: 2G, vcore: 2}
              max:
                {memory: 4G, vcore: 8}
            queues:
              - name: group-a
                adminacl: " group-a"
                resources:
                  guaranteed:
                    {memory: 1G, vcore: 1}
                  max:
                    {memory: 2G, vcore: 4}
              - name: group-b
                adminacl: " group-b"
                resources:
                  guaranteed:
                    {memory: 1G, vcore: 1}
                  max:
                    {memory: 2G, vcore: 4}
```

### Testing

In the following example, we restrict `root.tenants.group-a` to use a maximum of `{memory: 2G, vcore: 4}` resources. 

When group-A is deployed in `root.tenants.group-a` and the required resources exceed the limit, the remaining pods will be blocked. 

The results of deploying Pods in different queues are shown below. You can use the YAML file we provide for testing.

| user, group  | Resource Limits for Destination Queues | request resources for each replicas | replica | result                                                   | YAML filename    |
|--------------|----------------------------------------|-------------------------------------|---------|----------------------------------------------------------|------------------|
| admin, admin | \{memory: 6G, vcore: 6\}                 | \{memory: 512M, vcore: 250m\}         | 1       | run all replica                                          | nginx-admin.yaml |
| sue, group-A | \{memory: 2G, vcore: 4\}                 | \{memory: 512M, vcore: 500m\}         | 5       | run 3 replica (4 replica will exceed the resource limit) | nginx-sue.yaml   |

See the documentation on [Partition and Queue Configuration #Resources](queue_config#resources) for more information.

---

## Preemption & Priority scheduling with fencing

YuniKorn supports priority scheduling, where priorities can be assigned to each task and also to each queue. 

This section demonstrates how to configure priority in a queue. If you want to configure the priority of each task, you can learn more about it from document Pod Priority and Preemption on Kubernete .

### Explanation of Configuration

In the following example, we configure the configuration based on the following:

| queue                       | offset      |
|-----------------------------|-------------|
| root                        |             |
| root.system                 |             |
| root.system.high-priority   | 1000        |
| root.system.normal-priority | 0           |
| root.system.low-priority    | -1000       |
| root.tenants                | 0 (fenced)  |
| root.tenants.group-a        | 20 (fenced) |
| root.tenants.group-b        | 5 (fenced)  |

By default, all priorities are globally scoped, which means that all high-priority queues will be served first. However, we can also limit the priority to certain queues.

The following configuration sets up a fence to ensure that the priorities of the `root.tenants` queues (and their sub-queues) are evaluated internally.

```yaml
kind: ConfigMap
metadata:
  name: yunikorn-configs
  namespace: yunikorn
apiVersion: v1
data:
  queues.yaml: |
    partitions: 
    - name: default
      queues:
        - name: root
          properties:
              application.sort.policy: fifo       # default value: fifo
              application.sort.priority: enabled  # default value: enable
          queues:
          - name: system
            adminacl: " admin"
            queues:
              - name: high-priority
                properties:
                  priority.offset: "1000"
              - name: normal-priority
                properties:
                  priority.offset: "0"
              - name: low-priority
                properties:
                  priority.offset: "-1000"
          - name: tenants
            properties:
              priority.policy: "fence"
            queues:
              - name: group-a
                adminacl: " group-a"
                properties:
                  priority.offset: "20"
              - name: group-b
                adminacl: " group-b"
                properties:
                  priority.offset: "5"
```

### Testing

**Case 1: priority**

In the first test, we deploy an equal number of Pods with identical resource requests to three queues with different priorities. Without any priorities, we would expect to see an equal number of Pods deployed to each queue. 

However, with priorities and limited resources, the high-priority queue can deploy all of its Pods, the medium-priority queue can deploy some Pods, and the low-priority queue won't be able to deploy any Pods until resources are released by the high-priority queue.

In the following tests, we run the environment with a node resource limit of `{memory:16GB, vcore:16}`. Note that results will vary based on the environment, and you can modify the YAML file we provide to achieve similar results.

| queue                       | offset | # of deploy apps | # of apps accept by yunikorn | YAML filename |
|-----------------------------|--------|------------------|------------------------------|---------------|
| root.system.low-priority    | 1000   | 8                | 8                            | system.yaml   |
| root.system.normal-priority | 0      | 8                | 5                            | system.yaml   |
| root.system.high-priority   | -1000  | 8                | 0                            | system.yaml   |

**Case 2: priority-fenced**

In the second test, we deploy the same number of Pods with the same resource requests to three different priority queues. However, this time, two queues are configured with a fence. 

While scheduling the task. Even though `root.tenants.group-a` has a higher priority than the other two queues, the scheduler will still execute root.system.normal first, which is in the global scope. Then, the scheduler will compare priorities within the local scope of `root.tenants`.

For the following tests, we run them in an environment with node resources of `{memory:16GB, vcore:16}`. The results will vary in different environments, but you can obtain similar results by modifying the YAML file we provide.

| queue                       | offset      | # of deploy apps | # of apps accept by yunikorn | YAML filename    |
|-----------------------------|-------------|------------------|------------------------------|------------------|
| root.system.normal-priority | 0 (global)  | 7                | 7                            | nginx-admin.yaml |
| root.tenants.group-a        | 20 (fenced) | 7                | 6                            | nginx-sue.yaml   |
| root.tenants.group-b        | 5 (fenced)  | 7                | 0                            | nginx-kim.yaml   |

See the documentation on [App & Queue Priorities](priorities) for more information.