---
id: scheduler
title: 调度器
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

# 概要

Yunikorn调度器能透过REST API来返回多个对象的信息
其中许多API将回传资源集合。在内部中，所有资源被「有符号的64位整数类型」所表示。当解析REST API的响应时，类型为`memory`的资源以bytes作为单位，而`vcore`则以一千表示一个CPU核心。而这两类之外的其他资源种类则没有具体指定。

在与app/node相关调用的响应中，包含一个`allocations`字段，而该字段中也包含多个字段。如`placeholderUsed`指的是分配是否是取代占位符（placeholder）。如果为true，`requestTime`将代表的是占位符的创建时间，如果为false，则就是代表这个分配（allocation）被询问时的时间。`allocationTime`则为分配被创建的时间，`allocationDelay`，则为`allocationTime`和`requestTime `相差的时间。

## 分区（Partitions）

显示有关分区的一般信息和统计数据。

**位置（URL）**：`/ws/v1/partitions`

**方法（Method）**：`GET`

**需求权限**：无

### 成功时的响应

**返回代码**：`200 OK`

**示例**

```json
[
    {
        "clusterId": "mycluster",
        "name": "default",
        "state": "Active",
        "lastStateTransitionTime": 1649167576110754000,
        "capacity": {
            "capacity": {
                "ephemeral-storage": 188176871424,
                "hugepages-1Gi": 0,
                "hugepages-2Mi": 0,
                "memory": 1000000000,
                "pods": 330,
                "vcore": 1000
            },
            "usedCapacity": {
                "memory": 800000000,
                "vcore": 500
            },
            "utilization": {
                "memory": 80,
                "vcore": 50
            }
        },
        "nodeSortingPolicy": {
            "type": "fair",
            "resourceWeights": {
                "memory": 1.5,
                "vcore": 1.3
            }
        },
        "applications": {
            "New": 5,
            "Pending": 5,
            "total": 10
        },
        "totalContainers": 0,
        "totalNodes": 2
    },
    {
        "clusterId": "mycluster",
        "name": "gpu",
        "state": "Active",
        "lastStateTransitionTime": 1649167576111236000,
        "capacity": {
            "capacity": {
                "memory": 2000000000,
                "vcore": 2000
            },
            "usedCapacity": {
                "memory": 500000000,
                "vcore": 300
            },
            "utilization": {
                "memory": 25,
                "vcore": 15
            }
        },
        "nodeSortingPolicy": {
            "type": "binpacking",
            "resourceWeights": {
                "memory": 0,
                "vcore": 4.11
            }
        },
        "applications": {
            "New": 5,
            "Running": 10,
            "Pending": 5,
            "total": 20
        },
        "totalContainers": 20,
        "totalNodes": 5
    }
]
```

### 错误时的响应

**返回代码**：`500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 队列（Queues）

### 分区队列

获取给定分区中的队列，及队列相关的信息，其中包含名称、状态、容量和属性。
队列层次结构（hierarchy）被保留在响应的json档中。

**位置（URL）**：`/ws/v1/partition/{partitionName}/queues`

**方法（Method）**：`GET`

**需求权限**：无

### 成功时的响应

**返回代码**：`200 OK`

**示例**

在预设的队列层次结构中（仅`root.default`），将会向客户端发送与以下相似的响应。

```json
[
    {
        "queuename": "root",
        "status": "Active",
        "maxResource": {
            "ephemeral-storage": 188176871424,
            "hugepages-1Gi": 0,
            "hugepages-2Mi": 0,
            "memory": 8000000000,
            "pods": 330,
            "vcore": 8000
        },
        "guaranteedResource": {
            "memory": 54000000,
            "vcore": 80
        },
        "allocatedResource": {
            "memory": 54000000,
            "vcore": 80
        },
        "isLeaf": "false",
        "isManaged": "false",
        "properties": {
            "application.sort.policy": "stateaware"
        },
        "parent": "",
        "template": {
            "maxResource": {
                "memory": 8000000000,
                "vcore": 8000
            },
            "guaranteedResource": {
                "memory": 54000000,
                "vcore": 80
            },
            "properties": {
                "application.sort.policy": "stateaware"
            }
        },
        "partition": "default",
        "children": [
            {
                "queuename": "root.default",
                "status": "Active",
                "maxResource": {
                    "memory": 8000000000,
                    "vcore": 8000
                },
                "guaranteedResource": {
                    "memory": 54000000,
                    "vcore": 80
                },
                "allocatedResource": {
                    "memory": 54000000,
                    "vcore": 80
                },
                "isLeaf": "true",
                "isManaged": "false",
                "properties": {
                    "application.sort.policy": "stateaware"
                },
                "parent": "root",
                "template": null,
                "children": [],
                "absUsedCapacity": {
                    "memory": 1,
                    "vcore": 0
                },
                "maxRunningApps": 12,
                "runningApps": 4,
                "allocatingAcceptedApps": [
                    "app-1",
                    "app-2"
                ]
            }
        ],
        "absUsedCapacity": {
            "memory": 1,
            "vcore": 0
        }
    } 
]
```

### 错误时的响应

**返回代码**：`500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 多个应用程序

### 队列中多个应用程序

获取给定分区/队列组合的所有应用程序，并显示有关应用程序的信息，如使用的资源、队列名称、提交时间和分配。

**位置（URL）**：`/ws/v1/partition/{partitionName}/queue/{queueName}/applications`

**方法（Method）**：`GET`

**需求权限**：无

### 成功时的响应

**返回代码**：`200 OK`

**示例**

在下面的示例中，有三个分配属于两个应用程序，其中一个具有挂起（Pending）的请求。

```json
[
    {
        "applicationID": "application-0001",
        "usedResource": {
            "memory": 4000000000,
            "vcore": 4000
        },
        "maxUsedResource": {
            "memory": 4000000000,
            "vcore": 4000
        },
        "partition": "default",
        "queueName": "root.default",
        "submissionTime": 1648754032076020293,
        "requests": [
            {
                "allocationKey": "f137fab6-3cfa-4536-93f7-bfff92689382",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0001",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task2"
                },
                "requestTime": 16487540320812345678,
                "resource": {
                    "memory": 4000000000,
                    "vcore": 4000
                },
                "pendingCount": 1,
                "priority": "0",
                "requiredNodeId": "",
                "applicationId": "application-0001",
                "partition": "default",
                "placeholder": false,
                "placeholderTimeout": 0,
                "taskGroupName": "",
                "allocationLog": [
                    {
                        "message": "node(s) didn't match Pod's node affinity, node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate",
                        "lastOccurrence": 16487540320812346001,
                        "count": 81
                    },
                    {
                        "message": "node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate, node(s) didn't match Pod's node affinity",
                        "lastOccurrence": 16487540320812346002,
                        "count": 504
                    },
                    {
                        "message": "node(s) didn't match Pod's node affinity",
                        "lastOccurrence": 16487540320812346003,
                        "count": 1170
                    }
                ]
            }
        ],
        "allocations": [
            {
                "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0001",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task0"
                },
                "requestTime": 1648754034098912461,
                "allocationTime": 1648754035973982920,
                "allocationDelay": 1875070459,
                "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
                "resource": {
                    "memory": 4000000000,
                    "vcore": 4000
                },
                "priority": "0",
                "nodeId": "node-0001",
                "applicationId": "application-0001",
                "partition": "default",
                "placeholder": false,
                "placeholderUsed": true
            }
        ],
        "applicationState": "Running",
        "user": "system:serviceaccount:kube-system:deployment-controller",
        "groups": [
            "system:serviceaccounts",
            "system:serviceaccounts:kube-system",
            "system:authenticated"
        ],
        "rejectedMessage": "",
        "stateLog": [
            {
                "time": 1648741409145224000,
                "applicationState": "Accepted"
            },
            {
                "time": 1648741409145509400,
                "applicationState": "Starting"
            },
            {
                "time": 1648741409147432100,
                "applicationState": "Running"
            }
        ],
        "placeholderData": [
            {
                "taskGroupName": "task-group-example",
                "count": 2,
                "minResource": {
                    "memory": 1000000000,
                    "vcore": 100
                },
                "replaced": 1,
                "timedout": 1
            }
        ]
    },
    {
        "applicationID": "application-0002",
        "usedResource": {
            "memory": 4000000000,
            "vcore": 4000
        },
        "maxUsedResource": {
            "memory": 4000000000,
            "vcore": 4000
        },
        "partition": "default",
        "queueName": "root.default",
        "submissionTime": 1648754032076020293,
        "requests": [],
        "allocations": [
            {
                "allocationKey": "54e5d77b-f4c3-4607-8038-03c9499dd99d",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0002",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task0"
                },
                "requestTime": 1648754034098912461,
                "allocationTime": 1648754035973982920,
                "allocationDelay": 1875070459,
                "uuid": "08033f9a-4699-403c-9204-6333856b41bd",
                "resource": {
                    "memory": 2000000000,
                    "vcore": 2000
                },
                "priority": "0",
                "nodeId": "node-0001",
                "applicationId": "application-0002",
                "partition": "default",
                "placeholder": false,
                "placeholderUsed": false
            },
            {
                "allocationKey": "af3bd2f3-31c5-42dd-8f3f-c2298ebdec81",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0002",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task1"
                },
                "requestTime": 1648754034098912461,
                "allocationTime": 1648754035973982920,
                "allocationDelay": 1875070459,
                "uuid": "96beeb45-5ed2-4c19-9a83-2ac807637b3b",
                "resource": {
                    "memory": 2000000000,
                    "vcore": 2000
                },
                "priority": "0",
                "nodeId": "node-0002",
                "applicationId": "application-0002",
                "partition": "default",
                "placeholder": false,
                "placeholderUsed": false
            }
        ],
        "applicationState": "Running",
        "user": "system:serviceaccount:kube-system:deployment-controller",
        "groups": [
            "system:serviceaccounts",
            "system:serviceaccounts:kube-system",
            "system:authenticated"
        ],
        "rejectedMessage": "",
        "stateLog": [
            {
                "time": 1648741409145224000,
                "applicationState": "Accepted"
            },
            {
                "time": 1648741409145509400,
                "applicationState": "Starting"
            },
            {
                "time": 1648741409147432100,
                "applicationState": "Running"
            }
        ],
        "placeholderData": []
    }
]
```

### 错误时的响应

**返回代码**：`500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 单一应用程序

### 队列中单一应用程序

从给定分区、队列和应用程序ID来获取应用程序，并显示有关应用程序的信息，如使用的资源、队列名称、提交时间和分配。

**位置（URL）**：`/ws/v1/partition/{partitionName}/queue/{queueName}/application/{appId}`

**方法（Method）**：`GET`

**需求权限**：无

### 成功时的响应

**返回代码**：`200 OK`

**示例**

```json
{
    "applicationID": "application-0001",
    "usedResource": {
        "memory": 4000000000,
        "vcore": 4000
    },
    "maxUsedResource": {
        "memory": 4000000000,
        "vcore": 4000
    },
    "partition": "default",
    "queueName": "root.default",
    "submissionTime": 1648754032076020293,
    "requests": [
        {
            "allocationKey": "f137fab6-3cfa-4536-93f7-bfff92689382",
            "allocationTags": {
                "kubernetes.io/label/app": "sleep",
                "kubernetes.io/label/applicationId": "application-0001",
                "kubernetes.io/label/queue": "root.default",
                "kubernetes.io/meta/namespace": "default",
                "kubernetes.io/meta/podName": "task2"
            },
            "requestTime": 16487540320812345678,
            "resource": {
                "memory": 4000000000,
                "vcore": 4000
            },
            "pendingCount": 1,
            "priority": "0",
            "requiredNodeId": "",
            "applicationId": "application-0001",
            "partition": "default",
            "placeholder": false,
            "placeholderTimeout": 0,
            "taskGroupName": "",
            "allocationLog": [
                {
                    "message": "node(s) didn't match Pod's node affinity, node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate",
                    "lastOccurrence": 16487540320812346001,
                    "count": 81
                },
                {
                    "message": "node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate, node(s) didn't match Pod's node affinity",
                    "lastOccurrence": 16487540320812346002,
                    "count": 504
                },
                {
                    "message": "node(s) didn't match Pod's node affinity",
                    "lastOccurrence": 16487540320812346003,
                    "count": 1170
                }
            ]
        }
    ],
    "allocations": [
        {
            "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
            "allocationTags": {
                "kubernetes.io/label/app": "sleep",
                "kubernetes.io/label/applicationId": "application-0001",
                "kubernetes.io/label/queue": "root.default",
                "kubernetes.io/meta/namespace": "default",
                "kubernetes.io/meta/podName": "task0"
            },
            "requestTime": 1648754034098912461,
            "allocationTime": 1648754035973982920,
            "allocationDelay": 1875070459,
            "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
            "resource": {
                "memory": 4000000000,
                "vcore": 4000
            },
            "priority": "0",
            "nodeId": "node-0001",
            "applicationId": "application-0001",
            "partition": "default",
            "placeholder": false,
            "placeholderUsed": true
        }
    ],
    "applicationState": "Running",
    "user": "system:serviceaccount:kube-system:deployment-controller",
    "groups": [
        "system:serviceaccounts",
        "system:serviceaccounts:kube-system",
        "system:authenticated"
    ],
    "rejectedMessage": "",
    "stateLog": [
        {
            "time": 1648741409145224000,
            "applicationState": "Accepted"
        },
        {
            "time": 1648741409145509400,
            "applicationState": "Starting"
        },
        {
            "time": 1648741409147432100,
            "applicationState": "Running"
        }
    ],
    "placeholderData": [
        {
            "taskGroupName": "task-group-example",
            "count": 2,
            "minResource": {
                "memory": 1000000000,
                "vcore": 100
            },
            "replaced": 1,
            "timedout": 1
        }
    ]
}
```

### 错误时的响应

**返回代码**：`500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 多个节点

### 分区中多个节点

获取给定分区的所有节点，并显示由YuniKorn管理的节点的信息。
节点详细信息包括主机和机架名称、容量、资源、利用率和分配。

**位置（URL）**：`/ws/v1/partition/{partitionName}/nodes`

**方法（Method）**：`GET`

**需求权限**：无

### 成功时的响应

**返回代码**：`200 OK`

**示例**

这个示例的响应，来自一个群集，其中包含2个节点和3个分配。

```json
[
    {
        "nodeID": "node-0001",
        "hostName": "",
        "rackName": "",
        "capacity": {
            "ephemeral-storage": 75850798569,
            "hugepages-1Gi": 0,
            "hugepages-2Mi": 0,
            "memory": 14577000000,
            "pods": 110,
            "vcore": 10000
        },
        "allocated": {
            "memory": 6000000000,
            "vcore": 6000
        },
        "occupied": {
            "memory": 154000000,
            "vcore" :750
        },
        "available": {
            "ephemeral-storage": 75850798569,
            "hugepages-1Gi": 0,
            "hugepages-2Mi": 0,
            "memory": 6423000000,
            "pods": 110,
            "vcore": 1250
        },
        "utilized": {
            "memory": 3,
            "vcore": 13
        },
        "allocations": [
            {
                "allocationKey": "54e5d77b-f4c3-4607-8038-03c9499dd99d",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0001",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task0"
                },
                "requestTime": 1648754034098912461,
                "allocationTime": 1648754035973982920,
                "allocationDelay": 1875070459,
                "uuid": "08033f9a-4699-403c-9204-6333856b41bd",
                "resource": {
                    "memory": 2000000000,
                    "vcore": 2000
                },
                "priority": "0",
                "nodeId": "node-0001",
                "applicationId": "application-0001",
                "partition": "default",
                "placeholder": false,
                "placeholderUsed": false
            },
            {
                "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0002",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task0"
                },
                "requestTime": 1648754034098912461,
                "allocationTime": 1648754035973982920,
                "allocationDelay": 1875070459,
                "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
                "resource": {
                    "memory": 4000000000,
                    "vcore": 4000
                },
                "priority": "0",
                "nodeId": "node-0001",
                "applicationId": "application-0002",
                "partition": "default",
                "placeholder": false,
                "placeholderUsed": false
            }
        ],
        "schedulable": true
    },
    {
        "nodeID": "node-0002",
        "hostName": "",
        "rackName": "",
        "capacity": {
            "ephemeral-storage": 75850798569,
            "hugepages-1Gi": 0,
            "hugepages-2Mi": 0,
            "memory": 14577000000,
            "pods": 110,
            "vcore": 10000
        },
        "allocated": {
            "memory": 2000000000,
            "vcore": 2000
        },
        "occupied": {
            "memory": 154000000,
            "vcore" :750
        },
        "available": {
            "ephemeral-storage": 75850798569,
            "hugepages-1Gi": 0,
            "hugepages-2Mi": 0,
            "memory": 6423000000,
            "pods": 110,
            "vcore": 1250
        },
        "utilized": {
            "memory": 8,
            "vcore": 38
        },
        "allocations": [
            {
                "allocationKey": "af3bd2f3-31c5-42dd-8f3f-c2298ebdec81",
                "allocationTags": {
                    "kubernetes.io/label/app": "sleep",
                    "kubernetes.io/label/applicationId": "application-0001",
                    "kubernetes.io/label/queue": "root.default",
                    "kubernetes.io/meta/namespace": "default",
                    "kubernetes.io/meta/podName": "task1"
                },
                "requestTime": 1648754034098912461,
                "allocationTime": 1648754035973982920,
                "allocationDelay": 1875070459,
                "uuid": "96beeb45-5ed2-4c19-9a83-2ac807637b3b",
                "resource": {
                    "memory": 2000000000,
                    "vcore": 2000
                },
                "priority": "0",
                "nodeId": "node-0002",
                "applicationId": "application-0001",
                "partition": "default",
                "placeholder": false,
                "placeholderUsed": false
            }
        ],
        "schedulable": true
    }
]
```

### 错误时的响应

**返回代码**：`500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 单一节点

### 分区中单一节点

从给定分区和节点ID来获取节点，并显示有关节点的信息，节点详细信息包括主机和机架名称、容量、资源、利用率和分配。

**位置（URL）** : `/ws/v1/partition/{partitionName}/node/{nodeId}`

**方法（Method）** : `GET`

**需求权限** : NO

### 成功时的响应

**返回代码** : `200 OK`

**示例**

```json
{
   "nodeID":"node-0001",
   "hostName":"",
   "rackName":"",
   "capacity":{
      "ephemeral-storage":75850798569,
      "hugepages-1Gi":0,
      "hugepages-2Mi":0,
      "memory":14577000000,
      "pods":110,
      "vcore":10000
   },
   "allocated":{
      "memory":6000000000,
      "vcore":6000
   },
   "occupied":{
      "memory":154000000,
      "vcore":750
   },
   "available":{
      "ephemeral-storage":75850798569,
      "hugepages-1Gi":0,
      "hugepages-2Mi":0,
      "memory":6423000000,
      "pods":110,
      "vcore":1250
   },
   "utilized":{
      "memory":3,
      "vcore":13
   },
   "allocations":[
      {
         "allocationKey":"54e5d77b-f4c3-4607-8038-03c9499dd99d",
         "allocationTags":{
            "kubernetes.io/label/app":"sleep",
            "kubernetes.io/label/applicationId":"application-0001",
            "kubernetes.io/label/queue":"root.default",
            "kubernetes.io/meta/namespace":"default",
            "kubernetes.io/meta/podName":"task0"
         },
         "requestTime":1648754034098912461,
         "allocationTime":1648754035973982920,
         "allocationDelay":1875070459,
         "uuid":"08033f9a-4699-403c-9204-6333856b41bd",
         "resource":{
            "memory":2000000000,
            "vcore":2000
         },
         "priority":"0",
         "nodeId":"node-0001",
         "applicationId":"application-0001",
         "partition":"default",
         "placeholder":false,
         "placeholderUsed":false
      },
      {
         "allocationKey":"deb12221-6b56-4fe9-87db-ebfadce9aa20",
         "allocationTags":{
            "kubernetes.io/label/app":"sleep",
            "kubernetes.io/label/applicationId":"application-0002",
            "kubernetes.io/label/queue":"root.default",
            "kubernetes.io/meta/namespace":"default",
            "kubernetes.io/meta/podName":"task0"
         },
         "requestTime":1648754034098912461,
         "allocationTime":1648754035973982920,
         "allocationDelay":1875070459,
         "uuid":"9af35d44-2d6f-40d1-b51d-758859e6b8a8",
         "resource":{
            "memory":4000000000,
            "vcore":4000
         },
         "priority":"0",
         "nodeId":"node-0001",
         "applicationId":"application-0002",
         "partition":"default",
         "placeholder":false,
         "placeholderUsed":false
      }
   ],
   "schedulable":true
}
```

### 错误时的响应

**返回代码** : `500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Goroutines信息

获取当前运行的goroutines的堆栈跟踪（stack traces）

**位置（URL）**：`/ws/v1/stack`

**方法（Method）**：`GET`

**需求权限**：无

### 成功时的响应

**返回代码**：`200 OK`

**示例**

```text
goroutine 356 [running
]:
github.com/apache/yunikorn-core/pkg/webservice.getStackInfo.func1(0x30a0060,
0xc003e900e0,
0x2)
	/yunikorn/go/pkg/mod/github.com/apache/yunikorn-core@v0.0.0-20200717041747-f3e1c760c714/pkg/webservice/handlers.go: 41 +0xab
github.com/apache/yunikorn-core/pkg/webservice.getStackInfo(0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/yunikorn/go/pkg/mod/github.com/apache/yunikorn-core@v0.0.0-20200717041747-f3e1c760c714/pkg/webservice/handlers.go: 48 +0x71
net/http.HandlerFunc.ServeHTTP(0x2df0e10,
0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/usr/local/go/src/net/http/server.go: 1995 +0x52
github.com/apache/yunikorn-core/pkg/webservice.Logger.func1(0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/yunikorn/go/pkg/mod/github.com/apache/yunikorn-core@v0.0.0-20200717041747-f3e1c760c714/pkg/webservice/webservice.go: 65 +0xd4
net/http.HandlerFunc.ServeHTTP(0xc00003a570,
0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/usr/local/go/src/net/http/server.go: 1995 +0x52
github.com/gorilla/mux.(*Router).ServeHTTP(0xc00029cb40,
0x30a0060,
0xc003e900e0,
0xc0063fee00)
	/yunikorn/go/pkg/mod/github.com/gorilla/mux@v1.7.3/mux.go: 212 +0x140
net/http.serverHandler.ServeHTTP(0xc0000df520,
0x30a0060,
0xc003e900e0,
0xc0063fee00)
	/usr/local/go/src/net/http/server.go: 2774 +0xcf
net/http.(*conn).serve(0xc0000eab40,
0x30a61a0,
0xc003b74000)
	/usr/local/go/src/net/http/server.go: 1878 +0x812
created by net/http.(*Server).Serve
	/usr/local/go/src/net/http/server.go: 2884 +0x4c5

goroutine 1 [chan receive,
	26 minutes
]:
main.main()
	/yunikorn/pkg/shim/main.go: 52 +0x67a

goroutine 19 [syscall,
	26 minutes
]:
os/signal.signal_recv(0x1096f91)
	/usr/local/go/src/runtime/sigqueue.go: 139 +0x9f
os/signal.loop()
	/usr/local/go/src/os/signal/signal_unix.go: 23 +0x30
created by os/signal.init.0
	/usr/local/go/src/os/signal/signal_unix.go: 29 +0x4f

...
```

### 错误时的响应

**返回代码** : `500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 指标(Metrics)

从Prometheus服务器检索指标的端点。
指标中包含帮助消息和类型信息(type information)。

**位置(URL)** : `/ws/v1/metrics`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**返回代码** : `200 OK`

**示例**

```text
# HELP go_gc_duration_seconds 作为垃圾收集周期的暂停期间的摘要。
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 2.567e-05
go_gc_duration_seconds{quantile="0.25"} 3.5727e-05
go_gc_duration_seconds{quantile="0.5"} 4.5144e-05
go_gc_duration_seconds{quantile="0.75"} 6.0024e-05
go_gc_duration_seconds{quantile="1"} 0.00022528
go_gc_duration_seconds_sum 0.021561648
go_gc_duration_seconds_count 436
# HELP go_goroutines 当前存在的goroutines数量。
# TYPE go_goroutines gauge
go_goroutines 82
# HELP go_info 关于Golang环境的信息。
# TYPE go_info gauge
go_info{version="go1.12.17"} 1
# HELP go_memstats_alloc_bytes 已经被分配且正在使用的记忆体位元（bytes）数。
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 9.6866248e+07

...

# HELP yunikorn_scheduler_vcore_nodes_usage 节点的CPU使用量
# TYPE yunikorn_scheduler_vcore_nodes_usage gauge
yunikorn_scheduler_vcore_nodes_usage{range="(10%, 20%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(20%,30%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(30%,40%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(40%,50%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(50%,60%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(60%,70%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(70%,80%]"} 1
yunikorn_scheduler_vcore_nodes_usage{range="(80%,90%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="(90%,100%]"} 0
yunikorn_scheduler_vcore_nodes_usage{range="[0,10%]"} 0
```

## 配置验证

**位置(URL)** : `/ws/v1/validate-conf`

**方法(Method)** : `POST`

**需求权限**：无

### 成功时的响应

无论配置是否被允许，如果服务器能够处理请求，它都将生成一个200HTTP状态代码。

**返回代码** : `200 OK`

#### 允许的配置

发送以下简单配置会被接受

```yaml
partitions:
  - name: default
    queues:
      - name: root
        queues:
          - name: test
```

返回

```json
{
    "allowed": true,
    "reason": ""
}
```

#### 不允许的配置

由于以下的的yaml档案中包含了“wrong_text”字段，因此是不允许的配置。

```yaml
partitions:
  - name: default
    queues:
      - name: root
        queues:
          - name: test
  - wrong_text
```

返回

```json
{
    "allowed": false,
    "reason": "yaml: unmarshal errors:\n  line 7: cannot unmarshal !!str `wrong_text` into configs.PartitionConfig"
}
```

## 配置

检索当前调度器配置的端点

**位置(URL)** : `/ws/v1/config`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**返回代码** : `200 OK`

**示例**

```yaml
partitions:
- name: default
  queues:
  - name: root
    parent: true
    submitacl: '*'
  placementrules:
  - name: tag
    create: true
    value: namespace
checksum: D75996C07D5167F41B33E27CCFAEF1D5C55BE3C00EE6526A7ABDF8435DB4078E
```

## 应用程序历史

检索历史数据的端点，依据时间来条列应用程序的总数。

**位置(URL)** : `/ws/v1/history/apps`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**返回代码** : `200 OK`

**示例**

```json
[
    {
        "timestamp": 1595939966153460000,
        "totalApplications": "1"
    },
    {
        "timestamp": 1595940026152892000,
        "totalApplications": "1"
    },
    {
        "timestamp": 1595940086153799000,
        "totalApplications": "2"
    },
    {
        "timestamp": 1595940146154497000,
        "totalApplications": "2"
    },
    {
        "timestamp": 1595940206155187000,
        "totalApplications": "2"
    }
]
```

### 错误时的响应

**返回代码** : `500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 容器历史

检索历史数据的端点，依据时间来条列容器的总数。

**位置(URL)** : `/ws/v1/history/containers`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**返回代码** : `200 OK`

**示例**

```json
[
    {
        "timestamp": 1595939966153460000,
        "totalContainers": "1"
    },
    {
        "timestamp": 1595940026152892000,
        "totalContainers": "1"
    },
    {
        "timestamp": 1595940086153799000,
        "totalContainers": "3"
    },
    {
        "timestamp": 1595940146154497000,
        "totalContainers": "3"
    },
    {
        "timestamp": 1595940206155187000,
        "totalContainers": "3"
    }
]
```

### 错误时的响应

**返回代码** : `500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```


## 健康检查的端点

用来检索历史数据的端点，其中包含关键日志，以及节点、集群、应用程序中资源量为负的资源。

**位置(URL)** : `/ws/v1/scheduler/healthcheck`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**返回代码** : `200 OK`

**示例**

```json
{
    "Healthy": true,
    "HealthChecks": [
        {
            "Name": "Scheduling errors",
            "Succeeded": true,
            "Description": "Check for scheduling error entries in metrics",
            "DiagnosisMessage": "There were 0 scheduling errors logged in the metrics"
        },
        {
            "Name": "Failed nodes",
            "Succeeded": true,
            "Description": "Check for failed nodes entries in metrics",
            "DiagnosisMessage": "There were 0 failed nodes logged in the metrics"
        },
        {
            "Name": "Negative resources",
            "Succeeded": true,
            "Description": "Check for negative resources in the partitions",
            "DiagnosisMessage": "Partitions with negative resources: []"
        },
        {
            "Name": "Negative resources",
            "Succeeded": true,
            "Description": "Check for negative resources in the nodes",
            "DiagnosisMessage": "Nodes with negative resources: []"
        },
        {
            "Name": "Consistency of data",
            "Succeeded": true,
            "Description": "Check if a node's allocated resource <= total resource of the node",
            "DiagnosisMessage": "Nodes with inconsistent data: []"
        },
        {
            "Name": "Consistency of data",
            "Succeeded": true,
            "Description": "Check if total partition resource == sum of the node resources from the partition",
            "DiagnosisMessage": "Partitions with inconsistent data: []"
        },
        {
            "Name": "Consistency of data",
            "Succeeded": true,
            "Description": "Check if node total resource = allocated resource + occupied resource + available resource",
            "DiagnosisMessage": "Nodes with inconsistent data: []"
        },
        {
            "Name": "Consistency of data",
            "Succeeded": true,
            "Description": "Check if node capacity >= allocated resources on the node",
            "DiagnosisMessage": "Nodes with inconsistent data: []"
        },
        {
            "Name": "Reservation check",
            "Succeeded": true,
            "Description": "Check the reservation nr compared to the number of nodes",
            "DiagnosisMessage": "Reservation/node nr ratio: [0.000000]"
        }
    ]
}
```

## 检索所有状态

能在单一响应包含以下的信息：

* 分区清单
* 应用程序清单（`运行中` 和 `已完成`）
* 应用程序历史
* 节点
* 节点的使用率
* 集群的基本信息
* 集群的使用率
* 容器的历史
* 队列
* RM 诊断

**位置(URL)** : `/ws/v1/fullstatedump`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**返回代码** : `200 OK`

**示例**

该REST请求的输出将会很巨大，且为前面演示过的输出的组合。

RM 诊断显示 K8Shim 缓存的内容。确切内容取决于版本并且尚未稳定。
当前内容显示缓存的对象：
* 节点
* pods
* 优先等级
* 调度状态（pod状态）

### 错误时的响应

**代码**：`500 Internal Server Error`

## 启用或禁用定期写入状态信息

为允许状态周期性地写入的端点。

**状态**：自v1.2.0以来已弃用并被忽略，无替代品。

**位置(URL)** : `/ws/v1/periodicstatedump/{switch}/{periodSeconds}`

**方法(Method)** : `PUT`

**需求权限**：无

### 成功时的响应

无

### 错误时的响应

**代码**: `400 Bad Request`

## 获取日志级别
接收当前Yunikorn的日志级别。

**URL** : `/ws/v1/loglevel`

**方法** : `GET`

**需求权限** : 无

### 成功时的响应

**代码**: `200 OK`

**示例**

```
info%
```

## 设置日志级别
设置Yunikorn日志级别。

**URL** : `/ws/v1/loglevel/{level}`

**方法** : `PUT`

**需求权限** : NO

### 成功时的响应

**代码**: `200 OK`

### 错误时的响应

**代码**: `400 Bad Request`

**示例**

```json
{
    "status_code":400,
    "message":"failed to change log level, old level active",
    "description":"failed to change log level, old level active"
}
```

