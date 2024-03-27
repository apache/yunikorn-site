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

Returns general information about the clusters managed by the YuniKorn Scheduler. 
The response includes build information about resource managers.  

**URL** : `/ws/v1/clusters`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

As an example, here is a response from a cluster with 1 resource manager.

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
