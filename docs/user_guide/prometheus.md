---
id: prometheus
title: Setting Prometheus
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

YuniKorn exposes its scheduling metrics via Prometheus. Thus, we need to set up a Prometheus server to collect these metrics.

If you don't know what metric can be used, you can use [REST API](../api/scheduler.md#metrics).

### 1. **Download Prometheus release**

```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.30.3/prometheus-2.30.3.linux-amd64.tar.gz
```

```bash
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

### 2. **Configure prometheus.yml**

Prometheus collects metrics from *targets* by scraping metrics HTTP endpoints.

```yaml
global:
  scrape_interval:     3s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'yunikorn'
    scrape_interval: 1s
    metrics_path: '/ws/v1/metrics'
    static_configs:
    - targets: ['localhost:9080'] 
    # 9080 is internal port, need port forward or modify 9080 to service's port
```

### 3. Start port-forward

Port forwarding for the core's web service on the standard port can be turned on via:

```bash
kubectl port-forward svc/yunikorn-service 9080:9080 -n yunikorn
```

`9080`is the default port for core's web service. 

### 4. Execute prometheus

```bash
./prometheus --config.file=prometheus.yml
```

![prometheus-cmd](../assets/prometheus-cmd.png)

### 5. Access the Prometheus UI

You should be able to browse to a status page at [localhost:9090](http://localhost:9090/). Give it a couple of seconds to collect data about itself from its own HTTP metrics endpoint.

![prometheus-web-ui](../assets/prometheus-web-ui.png)

You can also verify that Prometheus is serving metrics by navigating to its metrics endpoint:[localhost:9090/metrics](http://localhost:9090/metrics)