---
id: workload_overview
title: 概述
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

YuniKorn调度器支持任何的Kubernetes工作负载。所需要的只是确保将Pod规范的
`schedulerName`字段设置为`yunikorn`并将`applicationId`标签设置为每个应用程序的唯一值：

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

此外，如果存在YuniKorn准入控制器，则可以省略“schedulerName”字段，因为它将在新创建的pod上自动设置。

## 进阶例子

可以在此处找到更进阶的例子：

* [运行Spark作业](run_spark)
* [运行Flink作业](run_flink)
* [运行TensorFlow作业](run_tf)
