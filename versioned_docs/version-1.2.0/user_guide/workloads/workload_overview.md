---
id: workload_overview
title: Overview
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

The YuniKorn scheduler is able to run any Kubernetes workload. All that is required is to ensure
that the `schedulerName` field of a Pod specification is set to `yunikorn` and an `applicationId`
label is set to a unique value per application:

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: sleep
    applicationId: "application-sleep-0001"
  name: sleep-app-1
spec:
  schedulerName: yunikorn
  containers:
    - name: sleep-30s
      image: "alpine:latest"
      command: ["sleep", "30"]
      resources:
        requests:
          cpu: "100m"
          memory: "100M"
```

Additionally, if the YuniKorn admission controller is present, the `schedulerName` field may be
omitted as it will be set automatically on newly created pods.

## Advanced Examples

Examples of more advanced use cases can be found here:

* [Run Spark Jobs](run_spark)
* [Run Flink Jobs](run_flink)
* [Run TensorFlow Jobs](run_tf)
