---
id: cluster
title: Cluster
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

## Clusters

Returns general information about the clusters managed by the YuniKorn Scheduler. Information includes number of (total, failed, pending, running, completed) applications and containers and the build information of resource managers.  

**URL** : `/ws/v1/clusters`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

As an example, here is a response from a 2-node cluster with 3 applications and 4 running containers and 1 resource manager.

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

### Error response

**Code** : `500 Internal Server Error`

**Content examples**

```json
{
    "status_code": 500,
    "message": "system error message. for example, json: invalid UTF-8 in string: ..",
    "description": "system error message. for example, json: invalid UTF-8 in string: .."
}
```
