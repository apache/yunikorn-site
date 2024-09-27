---
id: run_spark
title: Run Spark Jobs
description: How to run Spark jobs with YuniKorn
keywords:
  - spark
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

## Deploy spark operator with Helm

:::note
Pre-requisites:
- This tutorial assumes YuniKorn is [installed](../../get_started/get_started.md) under the namespace `yunikorn`
- Use spark-operator version >= 2.0 to enable support for YuniKorn gang scheduling
:::


:::warning
These installation involves installing YuniKorn and Spark operator, which may take a few minutes to complete.
:::

### Install yunikorn
A simple script to install YuniKorn under the namespace `yunikorn`, refer to [Get Started](../../get_started/get_started.md) for more details.
```shell script
helm upgrade --install yunikorn yunikorn/yunikorn \
  --create-namespace \
  --namespace yunikorn
```

### Install spark operator

We should install with the batch scheduler enabled, and set the default scheduler to YuniKorn. It's optional to set the default scheduler to YuniKorn, since you can specify it later on, but it's recommended to do so.

```shell script
helm upgrade --install spark-operator spark-operator/spark-operator \
  --create-namespace \
  --namespace spark-operator \
  --set controller.batchScheduler.enable=true \
  --set controller.batchScheduler.default=yunikorn
```

### Create the example application

Create a Spark application to run a sample spark Pi job.

```shell script
cat <<EOF | kubectl apply -f -
apiVersion: sparkoperator.k8s.io/v1beta2
kind: SparkApplication
metadata:
  name: spark-pi-yunikorn
  namespace: default
spec:
  type: Scala
  mode: cluster
  image: spark:3.5.2
  imagePullPolicy: IfNotPresent
  mainClass: org.apache.spark.examples.SparkPi
  mainApplicationFile: local:///opt/spark/examples/jars/spark-examples_2.12-3.5.2.jar
  sparkVersion: 3.5.2
  driver:
    cores: 1
    memory: 512m
    serviceAccount: spark-operator-spark
  executor:
    instances: 2
    cores: 1
    memory: 512m
  batchScheduler: yunikorn
  batchSchedulerOptions:
    queue: root.default
EOF
```

## Using YuniKorn as a custom scheduler for Apache Spark on Amazon EMR on EKS

YuniKorn can be configured as a custom scheduler for Apache Spark jobs on Amazon EMR on EKS. This setup allows our
resource management and scheduling algorithms on Kubernetes clusters.

For a detailed guide on how to set up YuniKorn with Apache Spark on Amazon EMR on EKS, please refer to the
[AWS EMR documentation](https://docs.aws.amazon.com/emr/latest/EMR-on-EKS-DevelopmentGuide/tutorial-yunikorn.html).
