---
id: namespace_resource_quota
title: 命名空间资源配额
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

在 K8s 中，用户可以使用 [资源配额](https://kubernetes.io/docs/concepts/policy/resource-quotas/) 设置命名空间，以限制该命名空间中的总计资源消耗。命名空间资源配额的验证直接在 api-server 中处理，因此 YuniKorn 像默认调度器一样简单地遵守配额。

## 最佳实践

不强制针对名称空间设置 YuniKorn 队列。
然而，在实践中，这样做更有意义。
命名空间通常被用于给每个用户组/团队设置资源消耗上限，
YuniKorn 队列也是为了将集群资源分成多个组。
让我们来看一个例子。

### 1. 设置命名空间

命名空间: `advertisement`:
```
apiVersion: v1
kind: ResourceQuota
metadata:
  name: advertisement
spec:
  hard:
    requests.cpu: "200m"
    requests.memory: 2000Mi
    limits.cpu: "200m"
    limits.memory: 4000Mi
```
创建命名空间
```
kubectl create namespace advertisement
kubectl create -f ./advertisement.yaml --namespace=advertisement
kubectl get quota --namespace=advertisement
kubectl describe quota advertisement --namespace=advertisement

// output
Name:            advertisement
Namespace:       advertisement
Resource         Used  Hard
--------         ----  ----
limits.cpu       0     200m
limits.memory    0     4000Mi
requests.cpu     0     200m
requests.memory  0     2000Mi
```

### 2. 设置 YuniKorn 队列

队列: `advertisement`:
```
name: advertisement
resources:
  guaranteed:
    vcore: 100
    memory: 1000
  max:
    vcore: 200
    memory: 2000
```

确保 `QueueMaxResource <= NamespaceResourceQuotaRequests`

### 3. 将应用程序映射到队列和命名空间

在一个 pod 的 spec 里

```
apiVersion: v1
kind: Pod
metadata:
  namespace: advertisement
  labels:
    app: sleep
    applicationId: "application_2019_01_22_00001"
    queue: "root.advertisement"
  name: task0
spec:
  schedulerName: yunikorn
  containers:
    - name: sleep-5s
      image: "alpine:latest"
      command: ["/bin/ash", "-ec", "while :; do echo '.'; sleep 5 ; done"]
      resources:
        requests:
          cpu: "50m"
          memory: "800M"
        limits:
          cpu: "100m"
          memory: "1000M"
```

检查配额

```
kubectl describe quota advertisement --namespace=advertisement

Name:            advertisement
Namespace:       advertisement
Resource         Used  Hard
--------         ----  ----
limits.cpu       100m  200m
limits.memory    1G    4000Mi
requests.cpu     50m   200m
requests.memory  800M  2000Mi
```

现在提交另一个应用程序，

```
apiVersion: v1
kind: Pod
metadata:
  namespace: advertisement
  labels:
    app: sleep
    applicationId: "application_2019_01_22_00002"
    queue: "root.advertisement"
  name: task1
spec:
  schedulerName: yunikorn
  containers:
    - name: sleep-5s
      image: "alpine:latest"
      command: ["/bin/ash", "-ec", "while :; do echo '.'; sleep 5 ; done"]
      resources:
        requests:
          cpu: "200m"
          memory: "800M"
        limits:
          cpu: "200m"
          memory: "1000M"
```

pod will not be able to submitted to api-server, because the requested cpu `200m` + used cpu `100m` = `300m` which exceeds the resource quota.
因为请求的 cpu `200m` + 使用的 cpu `100m` = `300m` 超过了资源配额，所以pod 将无法提交到 api-server。

```
kubectl create -f pod_ns_adv_task1.yaml
Error from server (Forbidden): error when creating "pod_ns_adv_task1.yaml": pods "task1" is forbidden: exceeded quota: advertisement, requested: limits.cpu=200m,requests.cpu=200m, used: limits.cpu=100m,requests.cpu=50m, limited: limits.cpu=200m,requests.cpu=200m
```

## 未来的工作

为了兼容性，我们应该尊重命名空间和资源配额。
资源配额在很多方面与队列配置重叠，例如，`requests` 配额就像队列的最大资源。 
然而，还有一些资源配额可以做但队列不能做的功能，例如

1. 资源 `限制`。 来自命名空间中所有 Pod 的总计资源不能超过此限制。
2. 存储资源配额，例如存储大小、PVC数量等。
3. 对象数量配额，例如 PVC、service、configmap等的数量。
4. 资源配额可以映射到进程优先级。

也许我们可以构建类似于此列表中（3）的实现。
但很难完全支持所有这些例子。

但是目前，将应用程序映射到队列以及相应的命名空间过于复杂。
未来的一些改进可能是：

1. 自动检测 k8s-shim 中的命名空间并映射到队列中。在场景中，我们根据命名空间定义自动生成队列配置。生成的队列附加在根队列下。
2. 当新的命名空间添加/更新/删除时，类似于（1），我们自动更新队列。
3. 用户可以为队列添加更多配置，例如添加队列ACL，在生成的队列上添加子队列。
4. 提交到命名空间的应用程序透明地提交到相应的队列中。