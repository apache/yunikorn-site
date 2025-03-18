---
id: cluster
title: Cluster
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

## Clusters

Returns general information about the clusters managed by the YuniKorn Scheduler. 
The response includes build information about resource managers.  

**URL** : `/ws/v1/clusters`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

As an example, here is a response from a cluster with 1 resource manager.

```json
[
    {
        "startTime": 1697100824863892713,
        "rmBuildInformation": [
            {
                "arch": "amd64",
                "buildDate": "2023-09-04T18:11:43+0800",
                "buildVersion": "latest",
                "coreSHA": "0ecf24d2aad2",
                "goVersion": "1.21",
                "isPluginVersion": "false",
                "rmId": "mycluster",
                "shimSHA": "8b26c373b4b5",
                "siSHA": "e7622cf54e95"
            }
        ],
        "partition": "default",
        "clusterName": "kubernetes"
    }
]
```

### Error response

**Code** : `500 Internal Server Error`

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

