---
id: core_features
title: Features
keywords:
 - feature
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

The main features of YuniKorn include:

## Gang Scheduling
In this release, YuniKorn starts to support the Gang Scheduling. Users can apply Gang Scheduling for the applications requiring gang scheduling semantics, such as Spark, Tensorflow, Pytorch, etc. YuniKorn proactively reserves resources for gang scheduling applications, which can work more efficiently with cluster-autoscaler. The initial support has been well tested with Spark, and it can be used with the native Spark on K8s or the Spark K8s operator. For more information how to enable and use Gang Scheduling, please read the doc [here](/docs/user_guide/gang_scheduling).

## Application Tracking API and CRD Phase One
This release introduces an application tracking API and K8s custom resource definition (CRD) to further improve the user experience. The CRD will be used by the app operator/job server to interact with YuniKorn, to provide a better app lifecycle management. The first phase has defined the common protocol messages and CRD object formats.

