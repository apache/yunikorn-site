---
id: run_tf
title: Run TensorFlow Jobs
description: How to run TensorFlow jobs with YuniKorn
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

This guide gives an overview of how to set up [training-operator](https://github.com/kubeflow/training-operator)
and how to run a Tensorflow job with YuniKorn scheduler. The training-operator is a unified training operator maintained by
Kubeflow. It not only supports TensorFlow but also PyTorch, XGboots, etc.

## Install training-operator
You can use the following command to install training operator in kubeflow namespace by default. If you have problems with installation,
please refer to [this doc](https://github.com/kubeflow/training-operator#installation) for details.
```
kubectl apply -k "github.com/kubeflow/training-operator/manifests/overlays/standalone?ref=v1.3.0"
```

## Prepare the docker image
Before you start running a TensorFlow job on Kubernetes, you'll need to build the docker image.
1. Download files from [deployment/examples/tfjob](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples/tfjob)
2. To build this docker image with the following command

```
docker build -f Dockerfile -t kubeflow/tf-dist-mnist-test:1.0 .
```

## Run a TensorFlow job
Here is a TFJob yaml for MNIST [example](https://github.com/apache/incubator-yunikorn-k8shim/blob/master/deployments/examples/tfjob/tf-job-mnist.yaml).

```yaml
apiVersion: kubeflow.org/v1
kind: TFJob
metadata:
  name: dist-mnist-for-e2e-test
  namespace: kubeflow
spec:
  tfReplicaSpecs:
    PS:
      replicas: 2
      restartPolicy: Never
      template:
        metadata:
          labels:
            applicationId: "tf_job_20200521_001"
            queue: root.sandbox
        spec:
          schedulerName: yunikorn
          containers:
            - name: tensorflow
              image: kubeflow/tf-dist-mnist-test:1.0
    Worker:
      replicas: 4
      restartPolicy: Never
      template:
        metadata:
          labels:
            applicationId: "tf_job_20200521_001"
            queue: root.sandbox
        spec:
          schedulerName: yunikorn
          containers:
            - name: tensorflow
              image: kubeflow/tf-dist-mnist-test:1.0
```
Create the TFJob
```
kubectl create -f deployments/examples/tfjob/tf-job-mnist.yaml
```
You can view the job info from YuniKorn UI. If you do not know how to access the YuniKorn UI,
please read the document [here](../../get_started/get_started.md#access-the-web-ui).

![tf-job-on-ui](../../assets/tf-job-on-ui.png)
