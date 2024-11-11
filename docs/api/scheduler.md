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

## PlacementRules

Returns the list of currently active placement rules for the partition.
This list can be different from the list in the configuration.

**URL** : `/ws/v1/partition/{partitionName}/placementrules`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

```json
[
    {
        "name": "provided",
        "parameters": {
            "create":"false"
        }
    },
    {
        "name":"recovery",
        "parameters": {
            "queue": "root.@recovery@"
        }
    }
]
```

### Error responses

**Code** : `400 Bad Request` (URL query is invalid, missing partition name)

**Code** : `404 Not Found` (Partition not found)

**Code** : `500 Internal Server Error`

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

**Code** : `400 Bad Request` (URL query is invalid, missing partition name)

**Code** : `404 Not Found` (Partition not found)

**Code** : `500 Internal Server Error` 

## Queue

### Partition queue

Fetch a Queue associated with given Partition and displays general information about the queue like name, status, capacities and properties. 

If the query parameter `subtree` is not set, the queue's children will not be returned.

**URL** : `/ws/v1/partition/{partitionName}/queue/{queueName}`

**Method** : `GET`

**Auth required** : NO

**URL query parameters** :
- `subtree` (optional) : When `subtree` is set (it can be any value, e.g., `true`), the queue's children will be returned.

### Success response

**Code** : `200 OK`

**Content examples**

```json
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
```

### Error response

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition or Queue not found)

**Code** : `500 Internal Server Error`

## Applications

### Partition applications

Fetch all Applications for the given Partition/State combination and displays general information about the applications like used resources, queue name, submission time and allocations.
Only following application states are allowed: active, rejected, completed. Active is a fake state that represents all application states except completed and rejected.
For active state, can narrow the result by status query parameters(case-insensitive). For example, can fetch `Running` applications for the default partition by
`/ws/v1/partition/default/applications/active?status=running`.

**URL** : `/ws/v1/partition/:partition/applications/:state`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

The content of the application object is the same as Queue Applications. See
 [Queue Applications](#queue-applications) for details.

### Error Response

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition not found)

**Code** : `500 Internal Server Error` 

### Queue applications

Fetch all Applications for the given Partition/Queue combination and displays general information about the applications like used resources, queue name, submission time and allocations. In case the queue name contains any special characters, it needs to be url escaped to avoid issues.

**URL** : `/ws/v1/partition/{partitionName}/queue/{queueName}/applications`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Deprecated**:

Field `uuid` has been deprecated, would be removed from below response in YUNIKORN 1.7.0 release. `AllocationID` has replaced `uuid`. Both `uuid` and `AllocationID` fields have the same value. `AllocationID` has extra suffix containing hyphen and counter (-0, -1 and so on) at the end. 

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
                "allocationID": "9af35d44-2d6f-40d1-b51d-758859e6b8a8-0",
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
                "allocationID": "08033f9a-4699-403c-9204-6333856b41bd-0",
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
                "allocationID": "96beeb45-5ed2-4c19-9a83-2ac807637b3b-0",
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

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition or Queue not found)

**Code** : `500 Internal Server Error`

### Queue applications by state

Fetch all Applications for the given Partition/Queue/State combination and displays general information about the applications like used resources, queue name, submission time and allocations. 

The state parameter must be set to "active", which is not an actual application state but a virtual state used for this API call. This fake state represents the following application states: New, Accepted, Running, Completing, Failing, and Resuming. You can further narrow down the results using the optional status query parameter to filter for specific real states.

**URL** : `/ws/v1/partition/:partition/queue/:queue/applications/:state`

**Method** : `GET`

**Auth required** : NO

**URL query parameters** :
- `status` (optional) : Filters active applications by their specific real state (New, Accepted, Running, Completing, Failing, Resuming)

**Example requests**:
- Fetch active applications in the default partition and root queue:
  `/ws/v1/partition/default/queue/root/applications/active`
- Fetch only running applications in the default partition and root queue:
  `/ws/v1/partition/default/queue/root/applications/active?status=running`

Note: If the queue name contains any special characters, it needs to be URL escaped to avoid issues.

### Success response

**Code** : `200 OK`

**Content examples**

The content of the application object is the same as Queue Applications. See [Queue Applications](#queue-applications) for details.

### Error response

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition or Queue not found)

**Code** : `500 Internal Server Error`

## Application

### Partition/Queue application

Fetch an Application given a Partition, Queue(optional) and Application ID and displays general information about the application like used resources, queue name, submission time and allocations. In case the queue name contains any special characters, it needs to be url escaped to avoid issues.

**URL** : `/ws/v1/partition/{partitionName}/application/{appId}` or `/ws/v1/partition/{partitionName}/queue/{queueName}/application/{appId}`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Deprecated**:

Field `uuid` has been deprecated, would be removed from below response in YUNIKORN 1.7.0 release. `AllocationID` has replaced `uuid`. Both `uuid` and `AllocationID` fields have the same value. `AllocationID` has extra suffix containing hyphen and counter (-0, -1 and so on) at the end.

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
            "allocationID": "9af35d44-2d6f-40d1-b51d-758859e6b8a8-0",
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

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition or Application not found)

**Code** : `500 Internal Server Error`


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

## UserTracker
### Get specific user usage tracking information
Fetch specific user usage given a Partition and displays general information about the users managed by YuniKorn. In case the username contains any special characters, it needs to be url escaped to avoid issues.

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

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (User not found)

**Code** : `500 Internal Server Error`  

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

## GroupTracker
### Get specific group usage tracking information

Fetch specific group usage given a Partition and displays general information about the groups managed by YuniKorn. In case the group name contains any special characters, it needs to be url escaped to avoid issues.

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

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Group not found)

**Code** : `500 Internal Server Error`

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
                "allocationID": "08033f9a-4699-403c-9204-6333856b41bd-0",
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
                "allocationID": "9af35d44-2d6f-40d1-b51d-758859e6b8a8-0",
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
                "allocationID": "96beeb45-5ed2-4c19-9a83-2ac807637b3b-0",
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

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition not found)

**Code** : `500 Internal Server Error`

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
         "allocationID":"08033f9a-4699-403c-9204-6333856b41bd-0",
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
         "allocationID":"9af35d44-2d6f-40d1-b51d-758859e6b8a8-0",
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

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `404 Not Found` (Partition or Node not found)

**Code** : `500 Internal Server Error`

## Node utilization

Show how every node is distributed with regard to dominant resource utilization.

**Status** : Deprecated since v1.5.0 and will be removed in the next major release. Replaced with `/ws/v1/scheduler/node-utilizations`.

**URL** : `/ws/v1/scheduler/node-utilization`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

```json
{
    "type": "vcore",
    "utilization": [
      {
        "bucketName": "0-10%",
        "numOfNodes": 1,
        "nodeNames": [
          "aethergpu"
        ]
      },
      {
        "bucketName": "10-20%",
        "numOfNodes": 2,
        "nodeNames": [
            "primary-node",
            "second-node"
        ]
      },
      ...  
    ]
}
```

### Error response

**Code** : `500 Internal Server Error`


## Node utilizations

Show the nodes utilization of different types of resources in a cluster.

**URL** : `/ws/v1/scheduler/node-utilizations`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

```json
[
    {
        "clusterId": "mycluster",
        "partition": "default",
        "utilizations": [
            {
                "type": "pods",
                "utilization": [
                    {
                        "bucketName": "0-10%",
                        "numOfNodes": 2,
                        "nodeNames": [
                            "primary-node",
                            "second-node"
                        ]
                    },
                    {
                        "bucketName": "10-20%"
                    },
                    ...
                ]
            },
            {
                "type": "vcores",
                "utilization": [
                    {
                        "bucketName": "0-10%",
                        "numOfNodes": 2,
                        "nodeNames": [
                            "primary-node",
                            "second-node"
                        ]
                    },
                    {
                        "bucketName": "10-20%"
                    },
                    ...
                ]
            },
            ...
        ]
    }
]
```

### Error response

**Code** : `500 Internal Server Error`

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

## Healthcheck

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

## Batch Events

Endpoint is used to retrieve a batch of event records.

**URL**: `/ws/v1/events/batch`

**METHOD** : `GET`

**Auth required** : NO

**URL query parameters** :
- `count` (optional) : Specifies the maxmem number of events to be included in the response.
- `start` (optional) : Specifies the starting ID for retrieving events. If the specified ID is outside the ring buffer
  (too low or too high), the response will include the lowest and highest ID values with `EventRecords` being empty.

### Success response

**Code**: `200 OK`

**Content examples**

```json
{
  "InstanceUUID": "400046c6-2180-41a2-9be1-1c251ab2c498",
  "LowestID": 0,
  "HighestID": 7,
  "EventRecords": [
    {
      "type": 3,
      "objectID": "yk8s-worker",
      "message": "schedulable: true",
      "timestampNano": 1701347180239597300,
      "eventChangeType": 1,
      "eventChangeDetail": 302,
      "resource": {}
    },
    {
      "type": 3,
      "objectID": "yk8s-worker",
      "message": "Node added to the scheduler",
      "timestampNano": 1701347180239650600,
      "eventChangeType": 2,
      "resource": {
        "resources": {
          "ephemeral-storage": {
            "value": 502921060352
          },
          "hugepages-1Gi": {},
          "hugepages-2Mi": {},
          "memory": {
            "value": 33424998400
          },
          "pods": {
            "value": 110
          },
          "vcore": {
            "value": 8000
          }
        }
      }
    }
  ]
}
```

### Error response

**Code** : `500 Internal Server Error`

## Event stream

Creates a persistent HTTP connection for event streaming. New events are sent to the clients immediately, so unlike the batch interface, there is no need for polling.
The number of active connections is limited. The default setting is 100 connections total and 15 connections per host. The respective configmap properties are `event.maxStreams` and `event.maxStreamsPerHost`. 

**URL**: `/ws/v1/events/stream`

**METHOD** : `GET`

**Auth required** : NO

**URL query parameters**:
- `count` (optional) : Specifies the number of past events (those which have been generated before the connection establishment) to include in the response. Default value is 0.

### Success response

**Code**: `200 OK`

**Content examples**

Application (2) state change (1) to Accepted (204):
```json
{
  "type": 2,
  "objectID": "app-1",
  "timestampNano": 1708465452903045400,
  "eventChangeType": 1,
  "eventChangeDetail": 204,
  "resource": {}
}
```
Allocation (201) added (2) to Application (2):
```json
{
  "type": 2,
  "objectID": "app-1",
  "timestampNano": 1708465452903192800,
  "eventChangeType": 2,
  "eventChangeDetail": 201,
  "referenceID": "alloc-1",
  "resource": {
    "resources": {
      "memory": {
        "value": 10000000
      },
      "vcore": {
        "value": 1000
      }
    }
  }
}
```
Allocation (303) added (2) to Node (3):
```json
{
  "type": 3,
  "objectID": "node-1:1234",
  "timestampNano": 1708465452903312100,
  "eventChangeType": 2,
  "eventChangeDetail": 303,
  "referenceID": "alloc-1",
  "resource": {
    "resources": {
      "memory": {
        "value": 10000000
      },
      "vcore": {
        "value": 1000
      }
    }
  }
}
```
Application (2) state changed (1) to Completed (205):
```json
{
  "type": 2,
  "objectID": "app-1",
  "timestampNano": 1708465452903474200,
  "eventChangeType": 1,
  "eventChangeDetail": 208,
  "resource": {}
}
```
Allocation (603) added (2) to user resource usage (5):
```json
{
  "type": 5,
  "objectID": "testuser",
  "timestampNano": 1708465452903506200,
  "eventChangeType": 2,
  "eventChangeDetail": 603,
  "referenceID": "root.singleleaf",
  "resource": {
    "resources": {
      "memory": {
        "value": 10000000
      },
      "vcore": {
        "value": 1000
      }
    }
  }
}
```

### Error responses

**Code** : `400 Bad Request` (URL query is invalid)

**Code** : `503 Service Unavailable` (Too many active streaming connections)

**Code** : `500 Internal Server Error`

## Retrieve full state dump

Endpoint to retrieve most of the REST exposed information in a single response.
See [Retrieve state dump](system.md#retrieve-state-dump) as part of the System group

**Status** : Deprecated and permanently moved to `/debug/fullstatedump` since v1.7.0. Automatically redirected to the new endpoint.
Users should update their calls to the new endpoint. 

**URL** : `/ws/v1/fullstatedump`

## Goroutines info

Dumps the stack traces of the currently running goroutines.
See [Goroutines info](system.md#go-routine-info) as part of the System group

**Status** : Deprecated and permanently moved to `/debug/stack` since v1.7.0. Automatically redirected to the new endpoint.
Users should update their calls to the new endpoint.

**URL** : `/ws/v1/stack`
