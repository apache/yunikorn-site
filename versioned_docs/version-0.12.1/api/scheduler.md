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

## Partitions

Displays general information about the partition like name, state, capacity, used capacity and node sorting policy. 

**URL** : `/ws/v1/partitions`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

```json
[
    {
        "name": "[mycluster]default",
        "state": "Active",
        "lastStateTransitionTime": "2021-05-20 12:25:49.018953 +0530 IST m=+0.005949717",
        "capacity": {
            "capacity": "[memory:1000 vcore:1000]",
            "usedCapacity": "[memory:800 vcore:500]"
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
        }
    },
    {
        "name": "[mycluster]gpu",
        "state": "Active",
        "lastStateTransitionTime": "2021-05-19 12:25:49.018953 +0530 IST m=+0.005949717",
        "capacity": {
            "capacity": "[memory:2000 vcore:2000]",
            "usedCapacity": "[memory:500 vcore:300]"
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
       "maxResource": "[memory:8000 vcore:8000]",
       "guaranteedResource": "[memory:54 vcore:80]",
       "allocatedResource": "[memory:54 vcore:80]",
       "isLeaf": "false",
       "isManaged": "false",
       "properties": {
           "application.sort.policy":"stateaware"
       },
       "parent": "",
       "partition": "[mycluster]default",
       "children": [
           {
               "queuename": "root.default",
               "status": "Active",
               "maxResource": "[memory:8000 vcore:8000]",
               "guaranteedResource": "[memory:54 vcore:80]",
               "allocatedResource": "[memory:54 vcore:80]",
               "isLeaf": "true",
               "isManaged": "false",
               "parent": "root"
            }
        ]
    } 
]
```

### Error response

**Code** : `400 Bad Request`

**Content examples**

```json
{
    "status_code": 400,
    "message": "Partition is missing in URL path. Please check the usage documentation",
    "description": "Partition is missing in URL path. Please check the usage documentation"
}
```

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

### All Queues

Fetch all Queues across different Partitions and displays general information about the queues like name, status, capacities and properties. 
The queues' hierarchy is kept in the response json.  

**Status** : Deprecated since v0.12.1, replaced by [Partition Queues](#partition-queues)

**URL** : `/ws/v1/queues`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

For the default queue hierarchy (only `root.default` leaf queue exists) a similar response to the following is sent back to the client:

```json
{
    "partitionName": "[mycluster]default",
    "capacity": {
        "capacity": "map[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:80000 pods:110 vcore:60000]",
        "usedCapacity": "0"
    },
    "nodes": null,
    "queues": {
        "queuename": "root",
        "status": "Active",
        "capacities": {
            "capacity": "[]",
            "maxCapacity": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:80000 pods:110 vcore:60000]",
            "usedCapacity": "[memory:8000 vcore:8000]",
            "absUsedCapacity": "[memory:54 vcore:80]"
        },
        "queues": [
            {
                "queuename": "default",
                "status": "Active",
                "capacities": {
                    "capacity": "[]",
                    "maxCapacity": "[]",
                    "usedCapacity": "[memory:8000 vcore:8000]",
                    "absUsedCapacity": "[]"
                },
                "queues": null,
                "properties": {}
            }
        ],
        "properties": {}
    }
}
```

## Applications

### Queue applications

Fetch all Applications for the given Partition Queue combination and displays general information about the applications like used resources, queue name, submission time and allocations.

**URL** : `/ws/v1/partition/{partitioName}/queue/{queueName}/applications`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

In the example below there are three allocations belonging to two applications. 

```json
[
    {
        "applicationID": "application-0001",
        "usedResource": "[memory:4000 vcore:4000]",
        "partition": "[mycluster]default",
        "queueName": "root.default",
        "submissionTime": 1595939756253216000,
        "allocations": [
            {
                "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
                "allocationTags": null,
                "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
                "resource": "[memory:4000 vcore:4000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0001",
                "applicationId": "application-0002",
                "partition": "default"
            }
        ],
        "applicationState": "Running"
    },
    {
        "applicationID": "application-0002",
        "usedResource": "[memory:4000 vcore:4000]",
        "partition": "[mycluster]default",
        "queueName": "root.default",
        "submissionTime": 1595939756253460000,
        "allocations": [
            {
                "allocationKey": "54e5d77b-f4c3-4607-8038-03c9499dd99d",
                "allocationTags": null,
                "uuid": "08033f9a-4699-403c-9204-6333856b41bd",
                "resource": "[memory:2000 vcore:2000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0001",
                "applicationId": "application-0002",
                "partition": "default"
            },
            {
                "allocationKey": "af3bd2f3-31c5-42dd-8f3f-c2298ebdec81",
                "allocationTags": null,
                "uuid": "96beeb45-5ed2-4c19-9a83-2ac807637b3b",
                "resource": "[memory:2000 vcore:2000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0002",
                "applicationId": "application-0002",
                "partition": "default"
            }
        ],
        "applicationState": "Running"
    }
]
```

### Error response

**Code** : `400 Bad Request`

**Content examples**

```json
{
    "status_code": 400,
    "message": "Partition is missing in URL path. Please check the usage documentation",
    "description": "Partition is missing in URL path. Please check the usage documentation"
}
```

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

### All applications

Fetch all Applications across different Partitions and displays general information about the applications like used resources, queue name, submission time and allocations.

**Status** : Deprecated since v0.12.1, replaced by [Queue Applications](#queue-applications)

**URL** : `/ws/v1/apps`

**Method** : `GET`

**Query Params** : 

1. queue=<fully qualified queue name\>

The fully qualified queue name used to filter the applications that run within the given queue. For example, "/ws/v1/apps?queue=root.default" returns the applications running in "root.default" queue.

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

In the example below there are three allocations belonging to two applications. 

```json
[
    {
        "applicationID": "application-0002",
        "usedResource": "[memory:4000 vcore:4000]",
        "partition": "[mycluster]default",
        "queueName": "root.default",
        "submissionTime": 1595939756253216000,
        "allocations": [
            {
                "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
                "allocationTags": null,
                "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
                "resource": "[memory:4000 vcore:4000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0001",
                "applicationId": "application-0002",
                "partition": "default"
            }
        ],
        "applicationState": "Running"
    },
    {
        "applicationID": "application-0001",
        "usedResource": "[memory:4000 vcore:4000]",
        "partition": "[mycluster]default",
        "queueName": "root.default",
        "submissionTime": 1595939756253460000,
        "allocations": [
            {
                "allocationKey": "54e5d77b-f4c3-4607-8038-03c9499dd99d",
                "allocationTags": null,
                "uuid": "08033f9a-4699-403c-9204-6333856b41bd",
                "resource": "[memory:2000 vcore:2000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0001",
                "applicationId": "application-0001",
                "partition": "default"
            },
            {
                "allocationKey": "af3bd2f3-31c5-42dd-8f3f-c2298ebdec81",
                "allocationTags": null,
                "uuid": "96beeb45-5ed2-4c19-9a83-2ac807637b3b",
                "resource": "[memory:2000 vcore:2000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0002",
                "applicationId": "application-0001",
                "partition": "default"
            }
        ],
        "applicationState": "Running"
    }
]
```

## Nodes

### Partition nodes

Fetch all Nodes associated with given Partition and displays general information about the nodes managed by YuniKorn. 
Node details include host and rack name, capacity, resources and allocations.

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
        "capacity": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:14577 pods:110 vcore:10000]",
        "allocated": "[memory:6000 vcore:6000]",
        "occupied": "[memory:154 vcore:750]",
        "available": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:6423 pods:110 vcore:1250]",
        "allocations": [
            {
                "allocationKey": "54e5d77b-f4c3-4607-8038-03c9499dd99d",
                "allocationTags": null,
                "uuid": "08033f9a-4699-403c-9204-6333856b41bd",
                "resource": "[memory:2000 vcore:2000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0001",
                "applicationId": "application-0001",
                "partition": "default"
            },
            {
                "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
                "allocationTags": null,
                "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
                "resource": "[memory:4000 vcore:4000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0001",
                "applicationId": "application-0002",
                "partition": "default"
            }
        ],
        "schedulable": true
    },
    {
        "nodeID": "node-0002",
        "hostName": "",
        "rackName": "",
        "capacity": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:14577 pods:110 vcore:10000]",
        "allocated": "[memory:2000 vcore:2000]",
        "occupied": "[memory:154 vcore:750]",
        "available": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:6423 pods:110 vcore:1250]",
        "allocations": [
            {
                "allocationKey": "af3bd2f3-31c5-42dd-8f3f-c2298ebdec81",
                "allocationTags": null,
                "uuid": "96beeb45-5ed2-4c19-9a83-2ac807637b3b",
                "resource": "[memory:2000 vcore:2000]",
                "priority": "<nil>",
                "queueName": "root.default",
                "nodeId": "node-0002",
                "applicationId": "application-0001",
                "partition": "default"
            }
        ],
        "schedulable": true
    }
]
```

### Error response

**Code** : `400 Bad Request`

**Content examples**

```json
{
    "status_code": 400,
    "message": "Partition is missing in URL path. Please check the usage documentation",
    "description": "Partition is missing in URL path. Please check the usage documentation"
}
```

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

### All nodes

Fetch all Nodes acrosss different Partitions and displays general information about the nodes managed by YuniKorn. 
Node details include host and rack name, capacity, resources and allocations.

**Status** : Deprecated since v0.12.1, replaced by [Partition Nodes](#partition-nodes)

**URL** : `/ws/v1/nodes`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

Here you can see an example response from a 2-node cluster having 3 allocations.

```json
[
    {
        "partitionName": "[mycluster]default",
        "nodesInfo": [
            {
                "nodeID": "node-0001",
                "hostName": "",
                "rackName": "",
                "capacity": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:14577 pods:110 vcore:10000]",
                "allocated": "[memory:6000 vcore:6000]",
                "occupied": "[memory:154 vcore:750]",
                "available": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:6423 pods:110 vcore:1250]",
                "allocations": [
                    {
                        "allocationKey": "54e5d77b-f4c3-4607-8038-03c9499dd99d",
                        "allocationTags": null,
                        "uuid": "08033f9a-4699-403c-9204-6333856b41bd",
                        "resource": "[memory:2000 vcore:2000]",
                        "priority": "<nil>",
                        "queueName": "root.default",
                        "nodeId": "node-0001",
                        "applicationId": "application-0001",
                        "partition": "default"
                    },
                    {
                        "allocationKey": "deb12221-6b56-4fe9-87db-ebfadce9aa20",
                        "allocationTags": null,
                        "uuid": "9af35d44-2d6f-40d1-b51d-758859e6b8a8",
                        "resource": "[memory:4000 vcore:4000]",
                        "priority": "<nil>",
                        "queueName": "root.default",
                        "nodeId": "node-0001",
                        "applicationId": "application-0002",
                        "partition": "default"
                    }
                ],
                "schedulable": true
            },
            {
                "nodeID": "node-0002",
                "hostName": "",
                "rackName": "",
                "capacity": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:14577 pods:110 vcore:10000]",
                "allocated": "[memory:2000 vcore:2000]",
                "occupied": "[memory:154 vcore:750]",
                "available": "[ephemeral-storage:75850798569 hugepages-1Gi:0 hugepages-2Mi:0 memory:6423 pods:110 vcore:1250]",
                "allocations": [
                    {
                        "allocationKey": "af3bd2f3-31c5-42dd-8f3f-c2298ebdec81",
                        "allocationTags": null,
                        "uuid": "96beeb45-5ed2-4c19-9a83-2ac807637b3b",
                        "resource": "[memory:2000 vcore:2000]",
                        "priority": "<nil>",
                        "queueName": "root.default",
                        "nodeId": "node-0002",
                        "applicationId": "application-0001",
                        "partition": "default"
                    }
                ],
                "schedulable": true
            }
        ]
    }
]
```

## Nodes utilization

Shows how nodes are distributed with regarding the utilization

**URL** : `/ws/v1/nodes/utilization`

**Method** : `GET`

**Auth required** : NO

**Code** : `200 OK`

**Content examples**

```text
[
    {
     partition: default,
     utilization: [ {
        type: "cpu",
        total: 100,
        used: 50,
        usage: 50%
      },
      {
         type: "memory",
         total: 1000,
         used: 500,
         usage: 50%
      }
     ]
    }, 
    ...
]
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
github.com/apache/incubator-yunikorn-core/pkg/webservice.getStackInfo.func1(0x30a0060,
0xc003e900e0,
0x2)
	/yunikorn/go/pkg/mod/github.com/apache/incubator-yunikorn-core@v0.0.0-20200717041747-f3e1c760c714/pkg/webservice/handlers.go: 41 +0xab
github.com/apache/incubator-yunikorn-core/pkg/webservice.getStackInfo(0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/yunikorn/go/pkg/mod/github.com/apache/incubator-yunikorn-core@v0.0.0-20200717041747-f3e1c760c714/pkg/webservice/handlers.go: 48 +0x71
net/http.HandlerFunc.ServeHTTP(0x2df0e10,
0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/usr/local/go/src/net/http/server.go: 1995 +0x52
github.com/apache/incubator-yunikorn-core/pkg/webservice.Logger.func1(0x30a0060,
0xc003e900e0,
0xc00029ba00)
	/yunikorn/go/pkg/mod/github.com/apache/incubator-yunikorn-core@v0.0.0-20200717041747-f3e1c760c714/pkg/webservice/webservice.go: 65 +0xd4
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

## Configuration Create

Endpoint to create scheduler configuration, but currently limited for configuration validation purpose alone

**URL** : `/ws/v1/config`

**Method** : `POST`

**Query Params** : 

1. dry_run

Mandatory Parameter. Only dry_run=1 is allowed and can be used for configuration validation only, not for the actual config creation.

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

Response

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

Response

```json
{
    "allowed": false,
    "reason": "yaml: unmarshal errors:\n  line 7: cannot unmarshal !!str `wrong_text` into configs.PartitionConfig"
}
```

### Error response

**Code** : `400 Bad Request`

**Content examples**

```json
{
    "status_code": 400,
    "message": "Dry run param is missing. Please check the usage documentation",
    "description": "Dry run param is missing. Please check the usage documentation"
}
```

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## Configuration

Endpoint to retrieve the current scheduler configuration

**URL** : `/ws/v1/config`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

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

## Configuration update

Endpoint to override scheduler configuration. 

**URL** : `/ws/v1/config`

**Method** : `PUT`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content example**

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
checksum: BAB3D76402827EABE62FA7E4C6BCF4D8DD9552834561B6B660EF37FED9299791
```
**Note:** Updates must use a current running configuration as the base. 
The base configuration is the configuration version that was retrieved earlier via a GET request and updated by the user.
The update request must contain the checksum of the _base_ configuration. 
If the checksum provided in the update request differs from the currently running configuration checksum the update will be rejected.

### Failure response

The configuration update can fail due to different reasons such as:
- invalid configuration,
- incorrect base checksum.

In each case the transaction will be rejected, and the proper
error message will be returned as a response.

**Code** : `409 Conflict`

**Message example** :  root queue must not have resource limits set

**Content example**

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
        resources:
          guaranteed:
            memory: "512"
            vcore: "1"
        properties:
          application.sort.policy: stateaware
checksum: BAB3D76402827EABE62FA7E4C6BCF4D8DD9552834561B6B660EF37FED9299791
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

* List of partitions
* List of applications (running and completed)
* Application history
* Nodes
* Utilization of nodes
* Generic cluster information
* Cluster utilization
* Container history
* Queues

**URL** : `/ws/v1/fullstatedump`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

The output of this REST query can be rather big and it is a combination of those which have already been demonstrated.

### Failure response

**Code**: `500 Internal Server Error`

## Enable or disable periodic state dump to an external file inside the container which runs Yunikorn

Endpoint to enable a state dump to be written periodically. By default, it is 60 seconds. The output goes to a file called `yunikorn-state.txt`. In the current version, the file is located in the current working directory of Yunikorn and it is not configurable.

Trying to enable or disable this feature more than once in a row results in an error.

**URL** : `/ws/v1/periodicstatedump/{switch}/{periodSeconds}`

**Method** : `PUT`

**Auth required** : NO

The value `{switch}` can be either `disable` or `enable`. The `{periodSeconds}` defines how often state snapshots should be taken. It is expected to be a positive integer and only interpreted in case of `enable`.

### Success response

**Code** : `200 OK`

### Error response

**Code**: `400 Bad Request`

**Content examples**

```json
{
    "status_code": 400,
    "message": "required parameter enabled/disabled is missing",
    "description": "required parameter enabled/disabled is missing"
}
```
