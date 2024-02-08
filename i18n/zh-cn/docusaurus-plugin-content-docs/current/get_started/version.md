---
id: version
title: 版本详情
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

# 应该使用哪个版本？

建议始终运行最新版本的 YuniKorn。新版本定期由 YuniKorn 本身和/或 shim 片的新功能驱动。目前，功能和修复仅添加到已删除版本的开发分支中。

此时该项目仅创建次要版本，没有补丁版本。

如果 shim 版本（即 Kubernetes）受多个 YuniKorn 版本支持，我们建议始终使用最新的 YuniKorn 版本。
早期版本中较旧的构建依赖项可能会阻止您使用 shim 的某些新功能。

# 每个 YuniKorn 版本的 Kubernetes 版本

| K8s 版本       | 从版本支持  |  支持结束  |
|--------------|:------:|:------:|
| 1.12.x (或更早) |   -    |   -    |
| 1.13.x       | 0.8.0  | 0.10.0 |
| 1.14.x       | 0.8.0  | 0.10.0 |
| 1.15.x       | 0.8.0  | 0.10.0 |
| 1.16.x       | 0.10.0 | 0.11.0 |
| 1.17.x       | 0.10.0 | 0.11.0 |
| 1.18.x       | 0.10.0 | 0.11.0 |
| 1.19.x       | 0.11.0 | 1.0.0  |
| 1.20.x       | 0.12.1 | 1.2.0  |
| 1.21.x       | 0.12.1 | 1.3.0  |
| 1.22.x       | 0.12.2 | 1.3.0  |
| 1.23.x       | 0.12.2 | 1.3.0  |
| 1.24.x       | 1.0.0  |   -    |
| 1.25.x       | 1.2.0  |   -    |
| 1.26.x       | 1.2.0  |   -    |
| 1.27.x       | 1.4.0  |   -    |
| 1.28.x       | 1.4.0  |   -    |
| 1.29.x       | 1.5.0  |   -    |

