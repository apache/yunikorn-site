---
id: run_tf
title: Run Tensorflow Jobs
keywords:
 - tensorflow
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

Here is an example for Tensorflow job. You must install tf-operator first. 
You can install tf-operator by applying all yaml from two website down below:
* CRD: https://github.com/kubeflow/manifests/tree/master/tf-training/tf-job-crds/base
* Deployment: https://github.com/kubeflow/manifests/tree/master/tf-training/tf-job-operator/base
Also you can install kubeflow which can auto install tf-operator for you, URL: https://www.kubeflow.org/docs/started/getting-started/

A simple Tensorflow job example:

You need to [build the image](https://github.com/kubeflow/tf-operator/tree/master/examples/v1/dist-mnist) which used in example yaml.
```
kubectl create -f examples/tfjob/tf-job-mnist.yaml
```

The file for this example can be found in the [README Tensorflow job](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples#Tensorflow-job) section.
