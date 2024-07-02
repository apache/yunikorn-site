---
id: run_ray_cluster
title: Run RayCluster
description: How to run Ray Cluster jobs with YuniKorn
keywords:
 - Ray_crd
---

import RayOperator from './kuberay/_ray_operator.mdx';
import RayCRDYunikornConfig from './kuberay/_ray_crd_yunikorn_config.mdx';
import YunikornConfigMapPatch from './utils/_yunikorn_configmap_patch.mdx';

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

:::info[Note]
This example demonstrates how to set up [KubeRay](https://docs.ray.io/en/master/cluster/kubernetes/getting-started.html) and run a [RayCluster](https://docs.ray.io/en/master/cluster/kubernetes/getting-started/raycluster-quick-start.html) with the YuniKorn scheduler. It relies on an admission controller to configure the default applicationId and queue name. If you want more details, please refer to [Yunikorn supported labels](https://yunikorn.apache.org/docs/user_guide/labels_and_annotations_in_yunikorn) and [Yunikorn queue setting](https://yunikorn.apache.org/docs/user_guide/queue_config).
:::

<YunikornConfigMapPatch />
<RayOperator/>

## Create RayCluster 
```
helm install raycluster kuberay/ray-cluster --version 1.1.1
```
- RayCluster result
  ![ray_cluster_cluster](../../assets/ray_cluster_cluster.png)
- YuniKorn UI
  ![ray_cluster_on_ui](../../assets/ray_cluster_on_ui.png)
  
<RayCRDYunikornConfig />

## Submit a RayJob to RayCluster
```
export HEAD_POD=$(kubectl get pods --selector=ray.io/node-type=head -o custom-columns=POD:metadata.name --no-headers)
echo $HEAD_POD

kubectl exec -it $HEAD_POD -- python -c "import ray; ray.init(); print(ray.cluster_resources())"
```

Services in Kubernetes aren't directly accessible by default. However, you can use port-forwarding to connect to them locally.
```
kubectl port-forward service/raycluster-kuberay-head-svc 8265:8265
```
After port-forward set up, you can access the Ray dashboard by going to `http://localhost:8265` in your web browser.

- Ray Dashboard
  ![ray_cluster_ray_dashborad](../../assets/ray_cluster_ray_dashborad.png)

