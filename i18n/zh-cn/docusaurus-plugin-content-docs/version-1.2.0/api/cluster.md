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

将回传Yunikorn所管理的集群的信息。信息包括应用程序的数量（包含总数、失败、挂起、正在运行、已完成）和容器的数量，以及资源管理器的构建信息。

**位置(URL)** : `/ws/v1/clusters`

**方法(Method)** : `GET`

**需求权限**：无

### 成功时的响应

**回传代码**：`200 OK`

**示例**

在本示例中，响应的内容来自含两个节点的群集，拥有三个应用程序和四个容器以及一个资源管理器。


```json
[
    {
        "startTime": 1649167576110754000,
        "rmBuildInformation": [
            {
                "buildDate": "2022-02-21T19:09:16+0800",
                "buildVersion": "latest",
                "isPluginVersion": "false",
                "rmId": "rm-123"
            }
        ],
        "partition": "default",
        "clusterName": "kubernetes",
        "totalApplications": "3",
        "failedApplications": "1",
        "pendingApplications": "",
        "runningApplications": "3",
        "completedApplications": "",
        "totalContainers": "4",
        "failedContainers": "",
        "pendingContainers": "",
        "runningContainers": "4",
        "activeNodes": "2",
        "totalNodes": "2",
        "failedNodes": ""
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
