---
id: run_mpi
title: Run MPI Jobs
description: How to run MPI jobs with YuniKorn
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

This guide walks through how to setup the [MPI Operator](https://github.com/kubeflow/mpi-operator) and to how to run a MPIJob with the YuniKorn scheduler.

## Installing the MPI Operator

You can use the following command to install the mpi operator. If you have problems with installation,
please refer to [this doc](https://github.com/kubeflow/mpi-operator) for details.
```
kubectl create -f https://raw.githubusercontent.com/kubeflow/mpi-operator/master/deploy/v2beta1/mpi-operator.yaml
```

## Run a MPI Job

This example shows to run a pure MPI application.

The program prints some basic information about the workers.
Then, it calculates an approximate value for pi.

Here is a Pi YAML example [example](https://github.com/apache/yunikorn-k8shim/blob/master/deployments/examples/mpioperator/Pi/pi.yaml).
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
Create the MPIJob.
```
kubectl create -f deployments/examples/mpioperator/Pi/pi.yaml
```

We added Yunikorn labels to the Pi example to demonstrate using the yunikorn scheduler.


