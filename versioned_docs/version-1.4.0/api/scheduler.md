---
id: scheduler
title: Scheduler
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

# Overview

The scheduler REST API returns information about various objects used by the YuniKorn Scheduler.

Many of these APIs return collections of resources. Internally, all resources are represented as raw
64-bit signed integer types. When interpreting responses from the REST API, resources of type `memory`
are returned in units of bytes while resources of type `vcore` are returned in units of millicores
(thousands of a core). All other resource types have no specific unit assigned.

Under the `allocations` field in the response content for the app/node-related calls in the following spec, `placeholderUsed` refers to whether or not the allocation is a replacement for a placeholder. If true, `requestTime` is the creation time of its placeholder allocation, otherwise it's that of the allocation's ask. `allocationTime` is the creation time of the allocation, and `allocationDelay` is simply the difference between `allocationTime` and `requestTime`.

## Partitions

Returns general information and statistics about a partition.

**URL** : `/ws/v1/partitions`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Queues

### Partition queues

Fetch all Queues associated with given Partition and displays general information about the queues like name, status, capacities and properties. 
The queues' hierarchy is kept in the response json.  

**URL** : `/ws/v1/partition/{partitionName}/queues`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

For the default queue hierarchy (only `root.default` leaf queue exists) a similar response to the following is sent back to the client:

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
        "pendingResource": {
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
                "pendingResource": {
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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Applications

### Queue applications

Fetch all Applications for the given Partition/Queue combination and displays general information about the applications like used resources, queue name, submission time and allocations.

**URL** : `/ws/v1/partition/{partitionName}/queue/{queueName}/applications`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

In the example below there are three allocations belonging to two applications, one with a pending request.

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
        "pendingResource": {
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
        ],
        "hasReserved": false,
        "reservations": []
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
        "pendingResource": {
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
        "placeholderData": [],
        "hasReserved": false,
        "reservations": []
    }
]
```

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Application

### Queue application

Fetch an Application given a Partition, Queue and Application ID and displays general information about the application like used resources, queue name, submission time and allocations.

**URL** : `/ws/v1/partition/{partitionName}/queue/{queueName}/application/{appId}`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

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
    "pendingResource": {
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
    ],
    "hasReserved": false,
    "reservations": []
}
```

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## UsersTracker
### Get users usage tracking information

Fetch all users usage given a Partition and displays general information about the users managed by YuniKorn.

**URL** : `/ws/v1/partition/{partitionName}/usage/users`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

```json
[
  {
    "userName": "user1",
    "groups": {
      "app2": "tester"
    },
    "queues":
    {
      "queuePath": "root",
      "resourceUsage": {
        "memory": 12000000000,
        "vcore": 12000
      },
      "runningApplications": ["app1", "app2"],
      "children": [
        {
        "queuePath": "root.default",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": ["app1"],
        "children": []
        },
        {
          "queuePath": "root.test",
          "resourceUsage": {
            "memory": 6000000000,
            "vcore": 6000
          },
          "runningApplications": [
            "app2"
          ],
          "children": []
        }]
    }
  },
  {
    "userName": "user2",
    "groups": {
      "app1": "tester"
    },
    "queues":
    {
      "queuePath": "root",
      "resourceUsage": {
        "memory": 11000000000,
        "vcore": 10000
      },
      "runningApplications": ["app1", "app2", "app3"],
      "children": [
        {
        "queuePath": "root.default",
        "resourceUsage": {
          "memory": 5000000000,
          "vcore": 5000
        },
        "runningApplications": ["app1"],
        "children": []
        },
        {
          "queuePath": "root.test",
          "resourceUsage": {
            "memory": 4000000000,
            "vcore": 4000
          },
          "runningApplications": [
            "app3"
          ],
          "children": []
        }]
    }
  }
]
```

### Error response
**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## UserTracker
### Get specific user usage tracking information
Fetch specific user usage given a Partition and displays general information about the users managed by YuniKorn.

**URL** : `/ws/v1/partition/{partitionName}/usage/user/{userName}`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

```json
{
  "userName": "user1",
  "groups": {
    "app1": "tester"
  },
  "queues":
  {
    "queuePath": "root",
    "resourceUsage": {
      "memory": 12000000000,
      "vcore": 12000
    },
    "runningApplications": ["app1", "app2"],
    "children": [
      {
      "queuePath": "root.default",
      "resourceUsage": {
        "memory": 6000000000,
        "vcore": 6000
      },
      "runningApplications": ["app1"],
      "children": []
      },
      {
        "queuePath": "root.test",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": [
          "app2"
        ],
        "children": []
      }]
  }
}
```

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## GroupsTracker
### Get groups usage tracking information
Fetch all groups usage given a Partition and displays general information about the groups managed by YuniKorn.

**URL** : `/ws/v1/partition/{partitionName}/usage/groups`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

```json
[
  {
    "groupName": "group1",
    "applications": ["app1", "app2"],
    "queues":
    {
      "queuePath": "root",
      "resourceUsage": {
        "memory": 12000000000,
        "vcore": 12000
      },
      "runningApplications": ["app1", "app2"],
      "children": [
        {
        "queuePath": "root.default",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": ["app1"],
        "children": []
        },
        {
          "queuePath": "root.test",
          "resourceUsage": {
            "memory": 6000000000,
            "vcore": 6000
          },
          "runningApplications": [
            "app2"
          ],
          "children": []
        }]
    }
  },
  {
    "groupName": "group2",
    "applications": ["app1", "app2", "app3"],
    "queues":
    {
      "queuePath": "root",
      "resourceUsage": {
        "memory": 11000000000,
        "vcore": 10000
      },
      "runningApplications": ["app1", "app2", "app3"],
      "children": [
        {
        "queuePath": "root.default",
        "resourceUsage": {
          "memory": 5000000000,
          "vcore": 5000
        },
        "runningApplications": ["app1"],
        "children": []
        },
        {
          "queuePath": "root.test",
          "resourceUsage": {
            "memory": 4000000000,
            "vcore": 4000
          },
          "runningApplications": [
            "app3"
          ],
          "children": []
        }]
    }
  }
]
```

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## GroupTracker
### Get specific group usage tracking information

Fetch specific group usage given a Partition and displays general information about the groups managed by YuniKorn.

**URL** : `/ws/v1/partition/{partitionName}/usage/group/{groupName}`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

```json
{
  "groupName": "group1",
  "applications": ["app1", "app2"],
  "queues":
  {
    "queuePath": "root",
    "resourceUsage": {
      "memory": 12000000000,
      "vcore": 12000
    },
    "runningApplications": ["app1", "app2"],
    "children": [
      {
      "queuePath": "root.default",
      "resourceUsage": {
        "memory": 6000000000,
        "vcore": 6000
      },
      "runningApplications": ["app1"],
      "children": []
      },
      {
        "queuePath": "root.test",
        "resourceUsage": {
          "memory": 6000000000,
          "vcore": 6000
        },
        "runningApplications": [
          "app2"
        ],
        "children": []
      }]
  }
}
```

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Nodes

### Partition nodes

Fetch all Nodes associated with given Partition and displays general information about the nodes managed by YuniKorn. 
Node details include host and rack name, capacity, resources, utilization, and allocations.

**URL** : `/ws/v1/partition/{partitionName}/nodes`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

Here you can see an example response from a 2-node cluster having 3 allocations.

```json
[
    {
        "nodeID": "node-0001",
        "hostName": "",
        "rackName": "",
         "attributes": {
            "beta.kubernetes.io/arch": "amd64",
            "beta.kubernetes.io/os": "linux",
            "kubernetes.io/arch": "amd64",
            "kubernetes.io/hostname": "node-0001",
            "kubernetes.io/os": "linux",
            "node-role.kubernetes.io/control-plane": "",
            "node-role.kubernetes.io/master": "",
            "node.kubernetes.io/exclude-from-external-load-balancers": "",
            "ready": "true",
            "si.io/hostname": "node-0001",
            "si.io/rackname": "/rack-default",
            "si/instance-type": "",
            "si/node-partition": "[mycluster]default"
        },
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
        "attributes": {
            "beta.kubernetes.io/arch": "amd64",
            "beta.kubernetes.io/os": "linux",
            "kubernetes.io/arch": "amd64",
            "kubernetes.io/hostname": "node-0002",
            "kubernetes.io/os": "linux",
            "ready": "false",
            "si.io/hostname": "node-0002",
            "si.io/rackname": "/rack-default",
            "si/instance-type": "",
            "si/node-partition": "[mycluster]default"
        },
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
        "schedulable": true,
        "isReserved": false,
        "reservations": []
    }
]
```

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Node

### Partition node

Fetch a Node associated with given Partition and Node ID and displays general information about the node managed by YuniKorn. 
Node details include host and rack name, capacity, resources, utilization, and allocations.

**URL** : `/ws/v1/partition/{partitionName}/node/{nodeId}`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Goroutines info

Dumps the stack traces of the currently running goroutines.

**URL** : `/ws/v1/stack`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Metrics

Endpoint to retrieve metrics from the Prometheus server. 
The metrics are dumped with help messages and type information.

**URL** : `/ws/v1/metrics`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

```text
# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 2.567e-05
go_gc_duration_seconds{quantile="0.25"} 3.5727e-05
go_gc_duration_seconds{quantile="0.5"} 4.5144e-05
go_gc_duration_seconds{quantile="0.75"} 6.0024e-05
go_gc_duration_seconds{quantile="1"} 0.00022528
go_gc_duration_seconds_sum 0.021561648
go_gc_duration_seconds_count 436
# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 82
# HELP go_info Information about the Go environment.
# TYPE go_info gauge
go_info{version="go1.12.17"} 1
# HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 9.6866248e+07

...

# HELP yunikorn_scheduler_vcore_nodes_usage Nodes resource usage, by resource name.
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

## Configuration validation

**URL** : `/ws/v1/validate-conf`

**Method** : `POST`

**Auth required** : NO

### Success response

Regardless whether the configuration is allowed or not if the server was able to process the request, it will yield a 200 HTTP status code.

**Code** : `200 OK`

#### Allowed configuration

Sending the following simple configuration yields an accept

```yaml
partitions:
  - name: default
    queues:
      - name: root
        queues:
          - name: test
```

Reponse

```json
{
    "allowed": true,
    "reason": ""
}
```

#### Disallowed configuration

The following configuration is not allowed due to the "wrong_text" field put into the yaml file.

```yaml
partitions:
  - name: default
    queues:
      - name: root
        queues:
          - name: test
  - wrong_text
```

Reponse

```json
{
    "allowed": false,
    "reason": "yaml: unmarshal errors:\n  line 7: cannot unmarshal !!str `wrong_text` into configs.PartitionConfig"
}
```

## Configuration

Endpoint to retrieve the current scheduler configuration

**URL** : `/ws/v1/config`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example (with `Accept: application/json` header)**

```json
{
    "Partitions": [
        {
            "Name": "default",
            "Queues": [
                {
                    "Name": "root",
                    "Parent": true,
                    "Resources": {},
                    "SubmitACL": "*",
                    "ChildTemplate": {
                        "Resources": {}
                    }
                }
            ],
            "PlacementRules": [
                {
                    "Name": "tag",
                    "Create": true,
                    "Filter": {
                        "Type": ""
                    },
                    "Value": "namespace"
                }
            ],
            "Preemption": {
                "Enabled": false
            },
            "NodeSortPolicy": {
                "Type": ""
            }
        }
    ],
    "Checksum": "FD5D3726DF0F02416E02F3919D78F61B15D14425A34142D93B24C137ED056946",
    "Extra": {
        "event.trackingEnabled": "false",
        "log.core.scheduler.level": "info",
        "log.core.security.level": "info",
        "log.level": "debug"
    }
}
```

**Content example (without `Accept: application/json` header)**

```yaml
partitions:
    - name: default
        queues:
            - name: root
            parent: true
            submitacl: "*"
        placementrules:
            - name: tag
            create: true
            value: namespace
checksum: FD5D3726DF0F02416E02F3919D78F61B15D14425A34142D93B24C137ED056946
extra:
    event.trackingEnabled: "false"
    log.core.scheduler.level: info
    log.core.security.level: info
    log.level: debug

```

## Application history

Endpoint to retrieve historical data about the number of total applications by timestamp.

**URL** : `/ws/v1/history/apps`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Container history

Endpoint to retrieve historical data about the number of total containers by timestamp.

**URL** : `/ws/v1/history/containers`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```


## Endpoint healthcheck

Endpoint to retrieve historical data about critical logs, negative resource on node/cluster/app, ...

**URL** : `/ws/v1/scheduler/healthcheck`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

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

## Retrieve full state dump

Endpoint to retrieve the following information in a single response:

* Current timestamp (Unix timestamp in nanosecond)
* List of partitions
* List of applications (running, completed and rejected)
* Application history
* Nodes
* Generic cluster information
* Container history
* Queues
* RMDiagnostics
* Log level
* Configuration

**URL** : `/ws/v1/fullstatedump`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

The output of this REST query can be rather large, and it is a combination of those which have already been demonstrated.

The `RMDiagnostics` shows the content of the K8Shim cache. The exact content is version dependent and has not stabilised.
The current content shows the cached objects:
* nodes
* pods
* priorityClasses
* schedulingState (pod status)

### Failure response

**Code**: `500 Internal Server Error`

## Enable or disable periodic state dump

Endpoint to enable a state dump to be written periodically.

**Status** : Deprecated and ignored since v1.2.0, no replacement.

**URL** : `/ws/v1/periodicstatedump/{switch}/{periodSeconds}`

**Method** : `PUT`

**Auth required** : NO

### Success response

None

### Error response

**Code**: `400 Bad Request`
