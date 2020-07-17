---
id: run_sample_workloads
title: Run Sample Workloads
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

## Run application with YuniKorn scheduler

Unlike the default Kubernetes scheduler, YuniKorn has `application` notion in order to support batch workloads better.
There are a few ways to run batch workloads with YuniKorn scheduler

- Add labels `applicationId` and `queue` in pod's spec.
- Pods that have the same applicationId will be considered as tasks from 1 application.

Here is an example of the entry to add:
```yaml
  labels:
    applicationId: "MyOwnApplicationId"
    queue: "root.sandbox"
```   
All examples provided in the next section have the labels already set. The `queue` name must be a known queue name from the configuration.
Unknown queue names will cause the pod to be rejected by the YuniKorn scheduler.  

## Run sample applications

All sample deployments can be found under `examples` directory.
The list of all examples is in the [README](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/deployments/examples).
Not all examples are given here. Further details can be found in that README.

A single pod based on a standard nginx image: 
```
kubectl create -f examples/nginx/nginx.yaml
```
A simple sleep job example:
```
kubectl create -f examples/sleep/sleeppods.yaml
```
The files for these examples can be found in the [README nginx](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples#nginx) and the [README sleep](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples#sleep) sections.
