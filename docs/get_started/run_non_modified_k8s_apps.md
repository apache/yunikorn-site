---
id: run_non_modified_k8s_apps
title: Run Unmodified K8s Applications
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

YuniKorn is fully K8s compatible, K8s applications can run with YuniKorn without any modification.
All volumes, predicates are supported.

## Affinity scheduling
The scheduler supports affinity and ati affinity scheduling on kubernetes using predicates:
```
kubectl create -f examples/predicates/pod-anti-affinity-example.yaml
```
This deployment ensures 2 pods cannot be co-located together on same node.
If this yaml is deployed on 1 node cluster, expect 1 pod to be started and the other pod should stay in a pending state.
More examples on affinity and anti affinity scheduling in the predicates section of the [README predicates](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples#predicates)

## Volume examples
There are three examples with volumes available. The NFS example does not work on docker desktop and requires [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/). 
The EBS volume requires a kubernetes cluster running on AWS (EKS).
Further instructions for the volume examples in the section of the [README Volumes](https://github.com/apache/incubator-yunikorn-k8shim/tree/master/deployments/examples#volumes).

CAUTION: All examples will generate an unending stream of data in a file called `dates.txt` on the mounted volume. This could cause a disk to fill up and execution time should be limited. 

### Local volume
* create the local volume and volume claim
```
kubectl create -f examples/volume/local-pv.yaml
```
* create the pod that uses the volume
```
kubectl create -f examples/volume/pod-local.yaml
```

### NFS volume
* create the NFS server
```
kubectl create -f nfs-server.yaml
```
* get the IP address for the NFS server and update the pod yaml by replacing the existing example IP with the one returned:
```
kubectl get services | grep nfs-server | awk '{print $3}'
```
* create the pod that uses the volume
```
kubectl create -f pod-nfs.yaml
```

### EBS volume
The Volume for the first two examples must be created before you can run the examples. The `VolumeId` must be updated in the yaml files to get this to work.
To create a volume you can use the command line or web UI:
```
aws ec2 create-volume --volume-type gp2 --size 10 --availability-zone us-west-1
```
The `VolumeId` is part of the returned information of the create command.

* create the pod that uses a direct volume reference:
```
kubectl create -f pod-ebs-direct.yaml
```
* create the persistent volume (pv) and a pod that uses a persistent volume claim (pvc) to claim the existing volume:
```
kubectl create -f ebs-pv.yaml
kubectl create -f pod-ebs-exist.yaml
```
* create a storage class to allow dynamic provisioning and create the pod that uses this mechanism:
```
kubectl create -f storage-class.yaml
kubectl create -f pod-ebs-dynamic.yaml
```
Dynamic provisioning has a number of pre-requisites for it to work, see [Dynamic Volume Provisioning](https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/) in the kubernetes docs. 
The dynamically created volume will be automatically destroyed as soon as the pod is stopped.
