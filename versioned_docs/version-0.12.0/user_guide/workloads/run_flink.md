---
id: run_flink
title: Run Flink Jobs
description: How to run Flink jobs with YuniKorn
image: https://svn.apache.org/repos/asf/flink/site/img/logo/png/100/flink_squirrel_100_color.png
keywords:
 - spark
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

It's very easy to run [Apache Flink](https://flink.apache.org/) on Kubernetes with YuniKorn. Depending on which mode is
used to run Flink on Kubernetes, the configuration is slight different.

## Standalone mode

Please follow [Kubernetes Setup](https://ci.apache.org/projects/flink/flink-docs-stable/ops/deployment/kubernetes.html) to get details and examples of standalone deploy mode.
In this mode, we can directly add required labels (applicationId and queue) in Deployment/Job spec to run flink application with YuniKorn scheduler, as well as [Run workloads with YuniKorn Scheduler](#run-workloads-with-yunikorn-scheduler).

## Native mode

Please follow [Native Kubernetes Setup](https://ci.apache.org/projects/flink/flink-docs-stable/ops/deployment/native_kubernetes.html) to get details and examples of native deploy mode.
Running flink application with YuniKorn scheduler in native mode is only supported for flink 1.11 or above, we can leverage two flink configurations `kubernetes.jobmanager.labels` and `kubernetes.taskmanager.labels` to set the required labels.
Examples:

* Start a flink session
```
./bin/kubernetes-session.sh \
  -Dkubernetes.cluster-id=<ClusterId> \
  -Dtaskmanager.memory.process.size=4096m \
  -Dkubernetes.taskmanager.cpu=2 \
  -Dtaskmanager.numberOfTaskSlots=4 \
  -Dresourcemanager.taskmanager-timeout=3600000 \
  -Dkubernetes.jobmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox \
  -Dkubernetes.taskmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox
```

* Start a flink application
```
./bin/flink run-application -p 8 -t kubernetes-application \
  -Dkubernetes.cluster-id=<ClusterId> \
  -Dtaskmanager.memory.process.size=4096m \
  -Dkubernetes.taskmanager.cpu=2 \
  -Dtaskmanager.numberOfTaskSlots=4 \
  -Dkubernetes.container.image=<CustomImageName> \
  -Dkubernetes.jobmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox \
  -Dkubernetes.taskmanager.labels=applicationId:MyOwnApplicationId,queue:root.sandbox \
  local:///opt/flink/usrlib/my-flink-job.jar
```