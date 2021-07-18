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
scheduler's critical execution paths, to reveal potential performance bottlenecks. Currently, there are two categories
for these metrics:

- scheduler: generic metrics of the scheduler, such as allocation latency, num of apps etc.
- queue: each queue has its own metrics sub-system, tracking queue status.

all metrics are declared in `yunikorn` namespace.

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

