---
id: metrics
title: Scheduler Metrics
keywords:
 - metrics
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

YuniKorn leverages [Prometheus](https://prometheus.io/) to record metrics. The metrics system keeps tracking of
scheduler's critical execution paths, to reveal potential performance bottlenecks. Currently, there are three categories
for these metrics:

- scheduler: generic metrics of the scheduler, such as allocation latency, num of apps etc.
- queue: each queue has its own metrics sub-system, tracking queue status.
- event: record various changes of events in YuniKorn.

all metrics are declared in `yunikorn` namespace.
###    Scheduler Metrics

| Metrics Name          | Metrics Type | Description  | 
| --------------------- | ------------ | ------------ |
| containerAllocation   | Counter      | Total number of attempts to allocate containers. State of the attempt includes `allocated`, `rejected`, `error`, `released`. Increase only. |
| applicationSubmission | Counter      | Total number of application submissions. State of the attempt includes `accepted` and `rejected`. Increase only. |
| application           | Gauge        | Total number of applications. State of the application includes `running`, `completed` and `failed`.             |
| node                  | Gauge        | Total number of nodes. State of the node includes `active` and `failed`.                                         |
| nodeResourceUsage     | Gauge        | Total resource usage of node, by resource name.                                                                  |
| schedulingLatency     | Histogram    | Latency of the main scheduling routine, in milliseconds.                                                         |
| sortingLatency        | Histogram    | Latency of all nodes sorting, in milliseconds.                                                                   |
| tryNodeLatency        | Histogram    | Latency of node condition checks for container allocations, such as placement constraints, in milliseconds.      |
| tryPreemptionLatency  | Histogram    | Latency of preemption condition checks for container allocations, in milliseconds.                               |
| schedulingCycle       | Histogram    | Total time for a full scheduling cycle, in milliseconds.                                                         |
| tryNodeEvaluation     | Histogram    | Total time for a pod to find a proper node, in milliseconds.                                                     |


###    Queue Metrics

| Metrics Name              | Metrics Type  | Description |
| ------------------------- | ------------- | ----------- |
| appMetrics                | Gauge         | Queue application metrics. State of the application includes `running`, `accepted`, `rejected`, `failed`, `completed`, `allocated`, `released`. |
| ResourceMetrics           | Gauge         | Queue resource metrics. State of the resource includes `guaranteed`, `max`, `allocated`, `pending`, `preempting`. |

###    Event Metrics

| Metrics Name             | Metrics Type  | Description |
| ------------------------ | ------------  | ----------- |
| totalEventsCreated       | Gauge         | Total events created.          |
| totalEventsChanneled     | Gauge         | Total events channeled.        |
| totalEventsNotChanneled  | Gauge         | Total events not channeled.    |
| totalEventsProcessed     | Gauge         | Total events processed.        |
| totalEventsStored        | Gauge         | Total events stored.           |
| totalEventsNotStored     | Gauge         | Total events not stored.       |
| totalEventsCollected     | Gauge         | Total events collected.        |

## Access Metrics

YuniKorn metrics are collected through Prometheus client library, and exposed via scheduler restful service.
Once started, they can be accessed via endpoint http://localhost:9080/ws/v1/metrics.

## Aggregate Metrics to Prometheus

It's simple to setup a Prometheus server to grab YuniKorn metrics periodically. Follow these steps:

- Setup Prometheus (read more from [Prometheus docs](https://prometheus.io/docs/prometheus/latest/installation/))

- Configure Prometheus rules: a sample configuration 

```yaml
global:
  scrape_interval:     3s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'yunikorn'
    scrape_interval: 1s
    metrics_path: '/ws/v1/metrics'
    static_configs:
    - targets: ['docker.for.mac.host.internal:9080']
```

- start Prometheus

```shell script
docker pull prom/prometheus:latest
docker run -p 9090:9090 -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

Use `docker.for.mac.host.internal` instead of `localhost` if you are running Prometheus in a local docker container
on Mac OS. Once started, open Prometheus web UI: http://localhost:9090/graph. You'll see all available metrics from
YuniKorn scheduler.

