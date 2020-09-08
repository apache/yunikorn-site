---
id: kubernetes
title: Kubernetes shim
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

The Kubernetes shim has some additional features on top of the ones supported by a general shim.
These extra features are related to Kubernetes and is not interpretable for other resource managers (like YARN).

## Namespace's `parentqueue` annotation
   
You can configure the following annotation for a Kubernetes namespace in your cluster: `yunikorn.apache.org/parentqueue`.
Each pod (allocation) created in the namespace will be passed with the value of that annotation under the `namespace.parentqueue` tag.
   
## Example: Creating dynamic leaf queues based on namespaces

Cluster administrators can use this behaviour to put allocations in dedicated queues based on the namespace's annotations.

As a slightly complex example, the admin can put each application into different user's queue based on the namespace setting using this following setting: 
```yaml
placementrules:
 - name: user
   create: true
   parent:
     - name: tag
       value: namespace
       create: true
       parent:
         - name: tag
           value: namespace.parentqueue
queues:
 - name: root 
   queues:
     - name: namespaces
```
User `bob` submitting an application to namespace `production` that has been annotated with `yunikorn.apache.org/parentqueue=root.namespaces` will be placed onto `root.namespaces.production.bob`.
 