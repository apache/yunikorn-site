---
id: labels_and_annotations_in_yunikorn
title: Labels and Annotations in YuniKorn
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

## Labels and Annotations in YuniKorn
YuniKorn utilizes several Kubernetes labels and annotations to support various features:

### Labels in YuniKorn
| Name                | Description                                                                                                                                             | 
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| `applicationId`     | Associates this pod with an application.                                                                                                                |
| `queue`             | Selects the YuniKorn queue this application should be scheduled in. This may be ignored if a placement policy is in effect.                             |
| `SparkLabelAppID `  | Alternative method of specifying `applicationId` used by Spark Operator if the label `applicationId` and annotation `yunikorn.apache.org/app-id` unset. | 
| `disableStateAware` | If present, disables the YuniKorn state-aware scheduling policy for this pod. Set internally by the YuniKorn admission controller.                      |
| `placeholder`       | Set if this pod represents a placeholder for gang scheduling. Set internally by YuniKorn.                                                               |

### Annotations in YuniKorn
All annotations are under the namespace `yunikorn.apache.org`. For example `yunikorn.apache.org/app-id`.

| Name                         | Description                                                                                                                                                                            | 
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `app-id`                     | Assoiates this pod with an application.<br/>The priority of applicationID is determined by: annotation `yunikorn.apache.org/app-id` > label `applicationId` > label `SparkLabelAppID`. |
| `queue`                      | Selects the YuniKorn queue this application should be scheduled in.<br/>The priority of queue is determined by: label `queue` > annotation `yunikorn.apache.org/queue` > default.      | 
| `task-group-name`            | Sets the task group name this pod belongs to for the purposes of gang scheduling. It must be listed within `task-groups`.                                                              |
| `task-groups`                | Defines the set of task groups for this application for gang scheduling. Each pod within an application must define all task groups.                                                   |
| `schedulingPolicyParameters` | Arbitrary key-value pairs used to customize scheduling policies such as gang scheduling.                                                                                               |
| `placeholder`                | Set if this pod represents a placeholder for gang scheduling. Set internally by YuniKorn.                                                                                              |

For more details surrounding gang-scheduling labels and annotations, please refer to the documentation on [gang scheduling](user_guide/gang_scheduling.md).
