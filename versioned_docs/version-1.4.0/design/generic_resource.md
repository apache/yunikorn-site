---
id: generic_resource
title: Generic Resource Types in Namespace Quota
---

<!--
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 -->
# Generic Resource Types in Namespace Quota
Tracking jira: [YUNIKORN-1275](https://issues.apache.org/jira/browse/YUNIKORN-1279)

## Functional gap
The queue configuration allows all resource types to be set in a quota. Namespace annotations do not. Support for the same resource types in the annotations on namespaces should be possible.

## Current solution
In the current setup YuniKorn supports annotations on a namespace to specify a resource quota for that namespace. This is used in combination with placement rules to create a quota limited queue automatically based on the namespace in Kubernetes.

The annotations that are supported limit the possible resource types that are supported on these auto created queues. Each resource type uses its own annotation. Current annotations supported as per the quota management documentation:
```
yunikorn.apache.org/namespace.max.cpu
yunikorn.apache.org/namespace.max.memory
```
The queue configuration itself, as part of the yaml file, supports all Kubernetes resources including extended resources.
## Proposed solution
The current solution uses a specific annotation for each type that is supported. This means that each new resource would require a new annotation to be defined. Reading a new annotation requires a code change in the k8shim.

In comparison when we look at the gang scheduling setup with the task groups specification we are far more flexible. In that case we allow a map of resources to be specified. The map uses the resource name as the key and allows a value as per the Kubenetes resource specification. This solution allows any resource type to be set as a request for a task group.

An equivalent solution should be allowed for the quota annotation on the namespace. This would provide a more flexible solution that does not require code changes for every new resource type that must be supported as part of the namespace quota.

### Annotation name
The new name for the annotation should not interfere with the existing annotations that are used for the memory and cpu resource quota. Beside that rule we are free to use any name that complies with the naming conventions for names.

The proposal is to use:
```
yunikorn.apache.org/namespace.quota
```
### Annotation content
The content of the annotation must be a simple string. There are no length limits for a specific annotation. All annotations together on one object do have a size limit however that is not a restriction we have to plan around.

Since the content must be a simple string we should use a simple json representation for the quota that contains a list of resources. Representing the quota:
```
yunikorn.apache.org/namespace.quota: "
{
cpu: 100m,
memory: 1GB,
nvidia.com/gpu: 1
}
"
```

Similar as for other resources we allow in annotations: we allow any string as the key content.
The value content should be interpreted as a Kubernetes formatted resource quantity. Parsing will handle that enforcement. If any of the values do not comply with the formatting no quota will be set.
Propagation to the core
No changes are proposed or required. The quota is passed from the k8shim into the core via the application tags. The content of the tag is a Resource object as defined in the scheduler interface. The schedule interface Resource object supports arbitrary resources already. The content passed from the k8shim to the core will not change. There will also be no changes in the way the quota will be processed in the core as that processing is not linked to resource types.
Backwards compatibility
The current annotations will remain supported for the 1.x minor releases. Deprecation will be announced with the first release that supports the new annotation. Messages mentioning the processing of the old annotation will also be logged at a WARN level in the logs.

Removing the existing annotation processing is a breaking change that could cause a large change in behaviour. Removal of processing for the old annotations should be part of the next major release. The next major release is 2.0.0. This is based on the fact that we do not have a deprecation policy defined as yet.

Preference in processing will be with the new annotations. In the case that both the old and new annotations are present on the namespace the new annotation will be used. Using both old and new annotations, i.e. merging of the two sets, will not be supported.
