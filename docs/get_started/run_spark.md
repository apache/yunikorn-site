---
id: run_spark
title: Run Spark Jobs
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

Kubernetes support for Apache Spark is not part of all releases. You must have a current release of Apache Spark with Kubernetes support built in. 

The `examples/spark` directory contains pod template files for the Apache Spark driver and executor, they can be used if you want to run Spark on K8s using this scheduler.

* Get latest spark from github (only latest code supports to specify pod template), URL: https://github.com/apache/spark
* Build spark with Kubernetes support:
```
mvn -Pyarn -Phadoop-2.7 -Dhadoop.version=2.7.4 -Phive -Pkubernetes -Phive-thriftserver -DskipTests package
```
* Run spark submit
```
spark-submit --master k8s://http://localhost:8001 --deploy-mode cluster --name spark-pi \
  --class org.apache.spark.examples.SparkPi \
  --conf spark.executor.instances=1 \
  --conf spark.kubernetes.container.image=yunikorn/spark:latest \
  --conf spark.kubernetes.driver.podTemplateFile=examples/spark/driver.yaml \
  --conf spark.kubernetes.executor.podTemplateFile=examples/spark/executor.yaml \
  local:///opt/spark/examples/jars/spark-examples_2.12-3.0.0-SNAPSHOT.jar
```

Spark uses its own version of the application ID tag called *spark-app-id*. This tags is required for the pods to be recognised as specific spark pods.  
* examples/spark/driver.yaml
* examples/spark/executor.yaml
When you run Spark on Kubernetes with pod templates, *spark-app-id* is considered the applicationId.
A script to run the spark application and the yaml files are in the [README spark](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples#spark) section.
