---
id: label_and_annotation_in_yunikorn
title: Label and Annotation in YuniKorn
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

## The Labels and Annotations in YuniKorn
In current version, YuniKorn leverages various labels and annotations to support multiple feature.
Those feature include application, queue, spark, gang-scheduling etc. We will introduce those labels and annotations in tables down below.

### Labels in YuniKorn
| Name                | Description                                                                                                                                             | 
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| `applicationId`     | Record this pod is belong to which application.                                                                                                         |
| `queue`             | Record the pod and application locate to which queue.                                                                                                   |
| `disableStateAware` | Record this application disable State Aware scheduling policy or not.                                                                                   |
| `SparkLabelAppID `  | Record the spark application ID, YuniKorn will reuse it as application, if the label `applicationId` and annotation `yunikorn.apache.org/app-id` unset. | 
| `placeholder`       | Record this pod is placeholder or not.(for gang-scheduling, yunikorn will set this label.)                                                              | 

### Annotations in YuniKorn
| Name                                             | Description                                                                                                                                                                   | 
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yunikorn.apache.org/app-id`                     | Record this pod is belong to which application. <br/>The priority of applicationID: annotation `yunikorn.apache.org/app-id` > label `applicationId` > label `SparkLabelAppID` |
| `yunikorn.apache.org/queue`                      | Record the pod and application locate to which queue.  The priority if queue: label `queue` > annotation `yunikorn.apache.org/queue` > default(`root.sandbox`).               | 
| `yunikorn.apache.org/placeholder`                | Record this pod is placeholder or not.(for gang-scheduling, yunikorn will set this annotation.)                                                                               | 
| `yunikorn.apache.org/task-group-name`            | Record the Task group name, it must be unique within the application.(for gang-scheduling)                                                                                    |
| `yunikorn.apache.org/task-groups`                | Record the list of task groups, each item contains all the info defined for the certain task group.(for gang-scheduling)                                                      |
| `yunikorn.apache.org/schedulingPolicyParameters` | A arbitrary key value pairs to define scheduling policy parameters.(for gang-scheduling)                                                                                      |

More detail of gang-scheduling label and annotation, please refer [gang-scheduling](gang_scheduling.md).
