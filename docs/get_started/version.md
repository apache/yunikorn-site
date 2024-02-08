---
id: version
title: Version details
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

# Which version should be used?

The recommendation is to always run the latest possible version of YuniKorn.
New releases are made regular driven by new features for YuniKorn itself and or the shim. 
Features and fixes are currently only added to the development branch from which releases are cut.

At this point in time the project only creates minor releases, no patch releases.

If a shim version, i.e. Kubernetes, is supported by multiple YuniKorn releases we recommend to always use the latest YuniKorn release possible.
Older build dependencies in earlier releases could prevent you from using some new functionality exposed by a newer shim.

# Kubernetes versions per YuniKorn release

| K8s Version         | Supported <br/>from version | Support ended |
|---------------------|:---------------------------:|:-------------:|
| 1.12.x (or earlier) |              -              |       -       |
| 1.13.x              |            0.8.0            |    0.10.0     |
| 1.14.x              |            0.8.0            |    0.10.0     |
| 1.15.x              |            0.8.0            |    0.10.0     |
| 1.16.x              |           0.10.0            |    0.11.0     |
| 1.17.x              |           0.10.0            |    0.11.0     |
| 1.18.x              |           0.10.0            |    0.11.0     |
| 1.19.x              |           0.11.0            |     1.0.0     |
| 1.20.x              |           0.12.1            |     1.2.0     |
| 1.21.x              |           0.12.1            |     1.3.0     |
| 1.22.x              |           0.12.2            |     1.3.0     |
| 1.23.x              |           0.12.2            |     1.3.0     |
| 1.24.x              |            1.0.0            |       -       |
| 1.25.x              |            1.2.0            |       -       |
| 1.26.x              |            1.2.0            |       -       |
| 1.27.x              |            1.4.0            |       -       |
| 1.28.x              |            1.4.0            |       -       |
| 1.29.x              |            1.5.0            |       -       |

