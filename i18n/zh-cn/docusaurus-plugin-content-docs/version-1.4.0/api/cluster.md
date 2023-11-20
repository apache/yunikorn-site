---
id: cluster
title: 集群
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

## 集群

回传 Yunikorn 所管理的集群信息，像是资源管理器的构建信息。

**位置(URL)** : `/ws/v1/clusters`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**回传代码**：`200 OK`

**示例**

在本示例中，响应的内容来自一个群集，拥有一个资源管理器。

```json
[
    {
        "startTime": 1697100824863892713,
        "rmBuildInformation": [
            {
                "arch": "amd64",
                "buildDate": "2023-09-04T18:11:43+0800",
                "buildVersion": "latest",
                "coreSHA": "0ecf24d2aad2",
                "goVersion": "1.21",
                "isPluginVersion": "false",
                "rmId": "mycluster",
                "shimSHA": "8b26c373b4b5",
                "siSHA": "e7622cf54e95"
            }
        ],
        "partition": "default",
        "clusterName": "kubernetes"
    }
]
```

### 出错时的响应

**回传代码**：`500 Internal Server Error`

**示例**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```
