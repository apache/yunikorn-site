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

## 分区

显示有关分区的常规信息，如名称、状态、容量、已用容量和节点排序策略。

**URL** : `/ws/v1/partitions`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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

### 错误返回

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 队列

### 分区队列

获取与给定分区关联的所有队列，并显示有关队列的一般信息，如名称、状态、容量和属性。
队列的层次结构保存在响应json中。

**URL** : `/ws/v1/partition/{partitionName}/queues`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

对于默认队列层次结构（只有在 `root.default` leaf队列存在的时候），对以下内容的类似响应将发送回客户端：

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

### 错误返回

**返回代码** : `400 Bad Request`

**样例内容**

```json
{
    "status_code": 400,
    "message": "Partition is missing in URL path. Please check the usage documentation",
    "description": "Partition is missing in URL path. Please check the usage documentation"
}
```

**Code** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

### 所有队列

获取不同分区中的所有队列，并显示有关队列的一般信息，如名称、状态、容量和属性。
队列的层次结构保存在响应json中。

**URL** : `/ws/v1/queues`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

对于默认队列层次结构（仅限于`root.default`的叶队列存在），以下内容的类似响应将发送回客户端：

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

## 应用

### 队列应用

获取给定分区队列组合的所有应用程序，并显示有关应用程序的常规信息，如已用资源、队列名称、提交时间和分配。

**URL** : `/ws/v1/partition/{partitioName}/queue/{queueName}/applications`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

在下面的示例中，有3个资源分配属于两个应用。

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

### 错误返回

**返回代码** : `400 Bad Request`

**样例内容**

```json
{
    "status_code": 400,
    "message": "Partition is missing in URL path. Please check the usage documentation",
    "description": "Partition is missing in URL path. Please check the usage documentation"
}
```

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

### 所有应用

跨不同分区获取所有应用程序，并显示有关应用程序的常规信息，如已用资源、队列名称、提交时间和分配。

**URL** : `/ws/v1/apps`

**方法** : `GET`

**查询参数** : 

1. queue=<fully qualified queue name\>

用于筛选在给定队列中运行的应用程序的队列全称。例如，"/ws/v1/apps?queue=root.default" 返回在 "root.default" 排队中运行的应用程序。

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

在下面的示例中，有3个资源分配属于两个应用。

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

## 节点

### 分区节点

获取与给定分区关联的所有节点，并显示有关由YuniKorn管理的节点的常规信息。
节点详细信息包括主机和机架名称、容量、资源和分配。

**URL** : `/ws/v1/partition/{partitionName}/nodes`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

在下面的示例中，有3个资源分配属于两个应用。

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

### 错误返回

**返回代码** : `400 Bad Request`

**样例内容**

```json
{
    "status_code": 400,
    "message": "Partition is missing in URL path. Please check the usage documentation",
    "description": "Partition is missing in URL path. Please check the usage documentation"
}
```

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

### All nodes

获取跨越不同分区的所有节点，并显示有关由YuniKorn管理的节点的常规信息。
节点详细信息包括主机和机架名称、容量、资源和分配。

**URL** : `/ws/v1/nodes`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

这里您可以看到一个来自具有3个资源分配给2节点集群的响应示例。

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

## 节点利用率

显示了节点分布式部署的资源利用率情况

**URL** : `/ws/v1/nodes/utilization`

**方法** : `GET`

**是否需要认证** : NO

**返回代码** : `200 OK`

**样例内容**

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

## Goroutines信息

转储当前运行的goroutine的堆栈跟踪。

**URL** : `/ws/v1/stack`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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

### 错误返回

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 指标

从 Prometheus 服务器检索指标的接口。
这些指标是用帮助消息和类型信息进行转储的。

**URL** : `/ws/v1/metrics`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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

## 配置验证

**URL** : `/ws/v1/validate-conf`

**方法** : `POST`

**是否需要认证** : NO

### 成功返回

不管配置是否允许，如果服务器能够处理请求，它都将产生一个 200 HTTP 的状态码。

**返回代码** : `200 OK`

#### 被允许的配置方法

发送以下简单的配置会产生一个返回


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

#### 不被允许的配置方法

由于yaml文件中输入了 "wrong_text" 这个错误的字段，因此不允许进行以下配置。

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

## 配置创建

创建调度程序配置的请求，但当前仅限于配置验证目的

**URL** : `/ws/v1/config`

**方法** : `POST`

**查询变量** : 

1. dry_run

强制参数。仅允许 dry_run=1，并且只能用于配置验证，不能用于实际的配置创建。

**是否需要认证** : NO

### 成功返回

Regardless whether the configuration is allowed or not if the server was able to process the request, it will yield a 200 HTTP status code.

**返回代码** : `200 OK`

#### 允许的配置

发送以下简单配置会产生一个返回信息

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

#### 禁用的配置

由于yaml文件中存在 "wrong_text" 字段，因此不允许进行以下配置。

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

### 错误返回

**返回代码** : `400 Bad Request`

**样例内容**

```json
{
    "status_code": 400,
    "message": "Dry run param is missing. Please check the usage documentation",
    "description": "Dry run param is missing. Please check the usage documentation"
}
```

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 配置

用于检索当前调度配置的请求

**URL** : `/ws/v1/config`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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

## 配置更新

覆盖调度配置的请求。

**URL** : `/ws/v1/config`

**方法** : `PUT`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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
**注意:** 更新必须使用当前正在运行的配置作为基础。
基础配置是先前通过GET请求检索配置版本并由用户更新。
更新请求必须包含 _基础_ 配置的 checksum。
如果更新请求中提供的 checksum 与当前运行的配置 checksum 不同，则将拒绝更新。

### 失败返回

由于以下不同原因，配置更新可能会失败：
- 配置无效，
- 错误的基础配置 checksum.

在每种情况下，交易都将被拒绝，并且准确的错误消息将作为响应返回。

**返回代码** : `409 Conflict`

**样例消息** :  root queue must not have resource limits set

**样例内容**

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

### 错误返回

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 应用历史

通过时间戳检索关于总应用程序的数量的历史数据的接口。

**URL** : `/ws/v1/history/apps`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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

### 错误返回

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```

## 容器历史

通过时间戳检索有关容器总数的历史数据的请求。

**URL** : `/ws/v1/history/containers`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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

### 错误返回

**返回代码** : `500 Internal Server Error`

**样例内容**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```


## 健康检查请求

用于检索有关关键日志、节点/集群/应用程序上的负资源的历史数据的请求...

**URL** : `/ws/v1/scheduler/healthcheck`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

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


## 检索完整的状态转储

在单个响应中检索以下信息的 Endpoint ：

* 分区列表
* 应用程序列表（正在运行和已完成）
* 应用历史
* 节点
* 节点的利用
* 通用集群信息
* 集群利用率
* 容器历史
* 队列

**URL** : `/ws/v1/fullstatedump`

**方法** : `GET`

**是否需要认证** : NO

### 成功返回

**返回代码** : `200 OK`

**样例内容**

这个 REST 查询的输出可能相当大，它是已经那些演示过数据的组合。

### 失败返回

**返回代码**: `500 Internal Server Error`

## 启用或禁用定期状态转储到运行 YuniKorn 的容器内的外部文件

允许定期写入状态转储的Endpoint。默认情况下，它是 60 秒。输出到一个名为 `yunikorn-state.txt` 的文件中。在当前版本中，该文件位于 YuniKorn 当前工作目录中，不可配置。

尝试连续多次启用或禁用此功能会导致错误。

**URL** : `/ws/v1/periodicstatedump/{switch}/{periodSeconds}`

**方法** : `PUT`

**是否需要认证** : NO

`{switch}` 的值可以是 `disable` 或 `enable`。`{periodSeconds}` 定义了应该多久获取一次状态快照。它应该是一个正整数，并且只在 `enable` 的情况下处理。

### 成功返回

**返回代码** : `200 OK`

### 错误返回

**返回代码**: `400 Bad Request`

**样例内容**

```json
{
    "status_code": 400,
    "message": "required parameter enabled/disabled is missing",
    "description": "required parameter enabled/disabled is missing"
}
```
