---
id: run_mpi
title: 运行MPI作业
description: 在Yunikorn中运行MPI作业
keywords:
 - mpi
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

本指南介绍将介绍如何设置[MPI Operator](https://github.com/kubeflow/mpi-operator)，以及如何使用YuniKorn调度程序运行MPIJob。

## 安装MPI操作器
您可以使用以下命令安装MPI操作器。如果您在安装时遇到问题，请参阅[此文档](https://github.com/kubeflow/mpi-operator)了解详细信息。
```
kubectl create -f https://raw.githubusercontent.com/kubeflow/mpi-operator/master/deploy/v2beta1/mpi-operator.yaml
```

## 运行MPI作业
此示例显示如何运行MPI应用程序。

此程序将印出一些关于workers的基础信息，然后计算圆周率的近似值。

这是一个计算圆周率的[YAML示例](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/examples/mpioperator/Pi/pi.yaml)：

```yaml
apiVersion: kubeflow.org/v2beta1
kind: MPIJob
metadata:
  name: pi
spec:
  slotsPerWorker: 1
  runPolicy:
    cleanPodPolicy: Running
    ttlSecondsAfterFinished: 60
  sshAuthMountPath: /home/mpiuser/.ssh
  mpiReplicaSpecs:
    Launcher:
      replicas: 1
      template:
        labels:
          applicationId: "mpi_job_pi"
          queue: root.mpi
        spec:
          schedulerName: yunikorn
          containers:
          - image: mpioperator/mpi-pi
            name: mpi-launcher
            securityContext:
              runAsUser: 1000
            command:
            - mpirun
            args:
            - -n
            - "2"
            - /home/mpiuser/pi
            resources:
              limits:
                cpu: 1
                memory: 1Gi
    Worker:
      replicas: 2
      template:
        labels:
          applicationId: "mpi_job_pi"
          queue: root.mpi
        spec:
          schedulerName: yunikorn
          containers:
          - image: mpioperator/mpi-pi
            name: mpi-worker
            securityContext:
              runAsUser: 1000
            command:
            - /usr/sbin/sshd
            args:
            - -De
            - -f
            - /home/mpiuser/.sshd_config
            resources:
              limits:
                cpu: 1
                memory: 1Gi
```
创建一个MPIJob。
```
kubectl create -f deployments/examples/mpioperator/Pi/pi.yaml
```

我们在圆周率示例中添加了Yunikorn标签，以演示如何使用yunikorn调度程序。