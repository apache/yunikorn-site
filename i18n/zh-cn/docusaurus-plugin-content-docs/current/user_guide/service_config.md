---
id: service_config
title: 服务配置
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

YuniKorn的官方版本是通过Helm charts部署到Kubernetes中的。YuniKorn的配置分为两部分：Helm配置和YuniKorn服务配置。

## Helm 配置
Helm配置是用于将YuniKorn部署到Kubernetes的选项。

可以在YuniKorn安装期间通过Helm进行以下设置配置，可以使用Helm的命令行方式，例如`--set key=value`，也可以使用外部文件方式：`-f file.yaml`。以下示例将以YAML语法表示。

### 容器镜像
YuniKorn以一组容器镜像的形式提供。可以按照以下方式自定义其位置和拉取策略：

    # 标准调度程序的镜像信息
    image:
      repository: apache/yunikorn
      tag: scheduler-1.0.0          # 默认取决于YuniKorn版本
      pullPolicy: Always

    # 插件调度程序的镜像信息
    pluginImage:
      repository: apache/yunikorn
      tag: scheduler-plugin-1.0.0   # 默认取决于YuniKorn版本
      pullPolicy: Always

    # Web UI的镜像信息
    web:
      image:
        repository: apache/yunikorn
        tag: web-1.0.0              # 默认取决于YuniKorn版本
        pullPolicy: Always

    # 准入控制器的镜像信息
    admissionController:
      image:
        repository: apache/yunikorn
        tag: admission-1.0.0        # 默认取决于YuniKorn版本
        pullPolicy: Always

### Kubernetes 配置

#### affinity
设置YuniKorn调度程序Pod的亲和性。

默认值： `{}`

示例：

    affinity:
      nodeAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/hostname
                operator: In
                values:
                  - primary1
                  - primary2

#### admissionController.affinity
设置YuniKorn准入控制器Pod的亲和性。

默认值： `{}`

示例：

    admissionController:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                - key: kubernetes.io/hostname
                  operator: In
                  values:
                    - primary1
                    - primary2

#### hostNetwork
控制调度程序是否应在主机网络中运行。

默认值： `false`

示例：

    hostNetwork: true

#### admissionController.hostNetwork
控制准入控制器是否应在主机网络中运行。

默认值： `true`

示例：

    admissionController:
      hostNetwork: false

#### imagePullSecrets
提供提取YuniKorn镜像所需的机密信息。

默认值： `[]`

示例：

    imagePullSecrets:
      - secret1
      - secret2

#### nodeSelector
设置用于放置YuniKorn调度程序Pod的节点选择器。

默认值： `{}`

示例：

    nodeSelector:
      role.node.kubernetes.io/infra: "true"

#### admissionController.nodeSelector
设置用于放置YuniKorn准入控制器Pod的节点选择器。

默认值： `{}`

示例：

    admissionController:
      nodeSelector:
        role.node.kubernetes.io/infra: "true"

#### admissionController.replicaCount
设置用于YuniKorn准入控制器的副本数。可以将其设置为大于1以实现高可用性。

默认值： `1`

示例：

    admissionController:
      replicaCount: 2

#### serviceAccount
为YuniKorn调度程序设置备用服务账户。

不建议更改此值，因为Helm会为默认用户安装基于角色的访问控制（RBAC）策略，而这对于正确的功能是必需的。

默认值： `yunikorn-admin`

示例：

    serviceAccount: my-account

#### admissionController.serviceAccount
为YuniKorn准入控制器设置备用服务账户。

不建议更改此值，因为Helm会为默认用户安装基于角色的访问控制（RBAC）策略，而这对于正确的功能是必需的。

默认值： `yunikorn-admission-controller`

示例：

    admissionController:
      serviceAccount: my-account

#### service.type
设置用于调度程序的服务类型。

默认值： `ClusterIP`

示例：

    service:
      type: ClusterIP

#### admissionController.service.type
设置用于准入控制器的服务类型。

默认值： `ClusterIP`

示例：

    admissionController:
      service:
        type: ClusterIP

#### service.port
设置在YuniKorn调度程序服务中用于REST API的暴露端口。不建议更改此值。

默认值： 9080

示例：

    service:
      port: 9080

#### service.portWeb
设置在YuniKorn调度程序服务中用于Web UI的暴露端口。不建议更改此值。

默认值： 9889

示例：

    service:
      portWeb: 9889

#### tolerations
设置用于YuniKorn调度程序Pod的容忍规则。

默认值： `[]`

示例：

    tolerations:
      - key: *infraRoleKey
        operator: Equal
        value: "true"
        effect: NoSchedule
      - key: CriticalAddonsOnly
        operator: Exists

#### admissionController.tolerations
设置用于YuniKorn准入控制器Pod的容忍规则。

默认值： `[]`

示例：

    admissionController:
      tolerations:
        - key: *infraRoleKey
          operator: Equal
          value: "true"
          effect: NoSchedule
        - key: CriticalAddonsOnly
          operator: Exists

### 资源利用率
可以按照以下方式自定义YuniKorn Pod所需的资源：

    # 调度程序容器的资源
    resources:
      requests:
        cpu: 200m
        memory: 1Gi
      limits:
        cpu: 4
        memory: 2Gi

    # Web UI容器的资源
    web:
      resources:
        requests:
          cpu: 100m
          memory: 100Mi
        limits:
          cpu: 100m
          memory: 500Mi

    # 准入控制器的资源
    admissionController:
      resources:
        requests:
          cpu: 100m
          memory: 500Mi
        limits:
          cpu: 500m
          memory: 500mi

### 自选功能

#### embedAdmissionController
控制是否启用YuniKorn准入控制器。

默认值： `true`

示例：

    embedAdmissionController: false

#### enableSchedulerPlugin
控制是否以调度程序插件模式运行YuniKorn。

默认值： `false`

示例：

    enableSchedulerPlugin: true

### YuniKorn 默认值

#### yunikornDefaults
设置将呈现到 `yunikorn-defaults` ConfigMap的条目。这可以用于在部署时预配置YuniKorn。可以在此处设置 [YuniKorn 配置](#yunikorn-配置) 中声明的任何设置。

默认值： `{}`

示例：

    yunikornDefaults:
        service.clusterId: yunikorn-01
        service.policyGroup: group-01
        group-01.yaml: |
          partitions:
            - name: default
              placementrules:
                - name: tag
                  value: namespace
                  create: true
              queues:
            - name: root
              submitacl: '*'`


### 弃用设置
以下设置已被弃用，或在将来的 YuniKorn 版本中被删除。现在应该在 `yunikorn-configs` ConfigMap 或通过 Helm 的 `yunikornDefaults` 部分指定：

| 弃用设置                      | ConfigMap 替代方案                        |
| --------------------------------------- | ----------------------------------------------- |
| operatorPlugins                         | service.operatorPlugins                         |
| placeHolderImage                        | service.placeholderImage                        |
| admissionController: processNamespaces  | admissionController.filtering.processNamespaces |
| admissionController: bypassNamespaces   | admissionController.filtering.bypassNamespaces  |
| admissionController: labelNamespaces    | admissionController.filtering.labelNamespaces   |
| admissionController: noLabelNamespaces  | admissionController.filtering.noLabelNamespaces |
| configuration                           | queues.yaml                                     |

以下是一個過時的例子:

    operatorPlugins: general
    placeHolderImage: registry.k8s.io/pause:3.7
    admissionController:
      processNamespaces: "^spark-,^mpi-"
      bypassNamespaces: "^kube-system$"
      labelNamespaces: "^spark-"
      noLabelNamespaces: "^mpi-legacy-"
    configuration: |
      partitions:
        - name: default
          placementrules:
            - name: tag
              value: namespace
              create: true
          queues:
        - name: root
          submitacl: '*'`

以下是替代示例：

    yunikornDefaults:
      service.policyGroup: queues
      service.operatorPlugins: general
      service.placeholderImage: registry.k8s.io/pause:3.7
      admissionController.processNamespaces: "^spark-,^mpi-"
      admissionController.bypassNamespaces: "^kube-system$"
      admissionController.labelNamespaces: "^spark-"
      admissionController.noLabelNamespaces: "^mpi-legacy-"
      queues.yaml: |
        partitions:
          - name: default
            placementrules:
              - name: tag
                value: namespace
                create: true
            queues:
          - name: root
            submitacl: '*'`

近期，如果同时指定了被弃用的参数和替代的ConfigMap条目，则ConfigMap条目将优先生效。


## YuniKorn 配置

YuniKorn的服务配置由两个 Kubernetes ConfigMaps 控制，它们分别是在安装 YuniKorn 的命名空间中：`yunikorn-defaults` 和 `yunikorn-configs`。

运行时，YuniKorn会轮询这些ConfigMaps并将它们合并以形成有效配置。如果在两个 ConfigMaps 中都存在某个设置，则 `yunikorn-configs` 中的设置将覆盖 `yunikorn-defaults` 中的设置。

`yunikorn-defaults` 的目的是提供一种机制，供 Helm 配置初始的服务配置细节。它不应该被直接修改。

`yunikorn-configs` ConfigMap 完全不受 Helm 管理，适用于可能随时间变化的配置，如队列配置。所有对 YuniKorn 配置的更改都应在此处进行，而不是在基础设施供应之外。

### 默认 ConfigMap

如果没有提供任何配置映射，或者某个选项未被指定，YuniKorn将使用此处列出的默认值：

    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: yunikorn-configs
    data:
      service.clusterId: "mycluster"
      service.policyGroup: "queues"
      service.schedulingInterval: "1s"
      service.volumeBindTimeout: "10s"
      service.eventChannelCapacity: "1048576"
      service.dispatchTimeout: "5m"
      service.operatorPlugins: "general"
      service.disableGangScheduling: "false"
      service.enableConfigHotRefresh: "true"
      service.placeholderImage: "registry.k8s.io/pause:3.7"
      health.checkInterval: "30s"
      log.level: "0"
      kubernetes.qps: "1000"
      kubernetes.burst: "1000"
      admissionController.webHook.amServiceName: "yunikorn-admission-controller-service"
      admissionController.webHook.schedulerServiceAddress: "yunikorn-service:9080"
      admissionController.filtering.processNamespaces: ""
      admissionController.filtering.bypassNamespaces: "^kube-system$"
      admissionController.filtering.labelNamespaces: ""
      admissionController.filtering.noLabelNamespaces: ""
      admissionController.accessControl.bypassAuth: "false"
      admissionController.accessControl.trustControllers: "true"
      admissionController.accessControl.systemUsers: "^system:serviceaccount:kube-system:"
      admissionController.accessControl.externalUsers: ""
      admissionController.accessControl.externalGroups: ""
      queues.yaml: |
        partitions:
          - name: default
            placementrules:
              - name: tag
                value: namespace
                create: true
            queues:
              - name: root
                submitacl: '*'`

### 服务设置
YuniKorn可理解以下参数：

#### service.clusterId
为正在配置的集群设置标识符。这将作为REST API调用的一部分返回。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `mycluster`

示例：

    service.clusterId: "yunikorn-east"

#### service.policyGroup
定义此调度程序使用的策略组。策略组用于选择多个队列配置之一。此设置的值加上`.yaml`的扩展名控制用于检索分区和队列配置的ConfigMap条目。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `queues`

示例：

    service.policyGroup: group_b
    group_b.yaml: |
        partitions:
          - name: default
            placementrules:
              - name: tag
                value: namespace
                create: true
            queues:
              - name: root
                submitacl: '*'`

#### service.schedulingInterval
控制YuniKorn执行调度运行的频率。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `1s`

示例：

    service.schedulingInterval: "5s"

#### service.volumeBindTimeout
控制卷绑定失败之前的超时时间。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `10s`

示例：

    service.volumeBindTimeout: "30s"

#### service.eventChannelCapacity
控制YuniKorn一次允许有多少个内部调度事件在运行。作為内存不足的保护。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `1048576`

示例：

    service.eventChannelCapacity: "1000000"

#### service.dispatchTimeout
控制如果事件通道已满，内部事件将重新尝试调度多长时间。如果超过此超时时间，将发出警告。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `5m`

示例：

    service.dispatchTimeout: "10m"

#### service.operatorPlugins
控制在YuniKorn中启用的运算符插件集。目前，只实现了 `general`，`spark-k8s-operator` 和 `yunikorn-app` 插件。`general` 插件不应禁用。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `general`

示例：

    service.operatorPlugins: "general,spark-k8s-operator"

#### service.disableGangScheduling
允许全局禁用gang调度功能（不建议）。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `false`

示例：

    service.disableGangScheduling: "true"

#### service.enableConfigHotRefresh
控制配置是否应该进行热重载。默认情况下，这个设置为 `true`，但是它可以被禁用，以避免 ConfigMaps 的更改被拾起直到调度器重启。

更改此设置将在YuniKorn不需要重启的情况下生效。

注意：如果禁用了此设置，则可能无法重新启用，除非重新启动YuniKorn。

默认值： `true`

示例：

    service.enableConfigHotRefresh: "false"

#### service.placeholderImage
设置将用于gang调度占位符的Pod镜像。

更改此设置需要重新启动YuniKorn才能生效。

默认值： `registry.k8s.io/pause:3.7`

示例：

    service.placeholderImage: "registry.k8s.io/pause:3.6"

### 健康检查设置

#### health.checkInterval
设置YuniKorn自动健康检查的时间间隔。

将该值设置为 `0` 或负值将禁用后台健康检查。

更改此设置不需要重新启动YuniKorn即可生效。

默认值： `30s`

示例：

    health.checkInterval: "1m"

### 日志设置

#### log.level
设置YuniKorn的日志详细程度。

更改此设置不需要重新启动YuniKorn即可生效。可用的值有:

 - `-1`: 调试(Debug)
 - `0`: 信息(Info)
 - `1`: 警告(Warn)
 - `2`: 错误(Error)
 - `3`: 不可恢復的錯誤(DPanic)
 - `4`: 不可恢復的錯誤(Panic)
 - `5`: 致命错误(Fatal)

默认值： `0` (Info)

示例：

    log.level: "-1"

### Kubernetes 设置

#### kubernetes.qps
设置 YuniKorn Kubernetes 客户端每秒查询（QPS）的数量。该数字必须>=0。

更改此设置需要重新启动 YuniKorn 才能生效。

默认值： `1000`

示例：

    kubernetes.qps: "500"

#### kubernetes.burst
该设置用于设置 Kubernetes 查询的突发大小，临时允许事件突发到此数字，而不会超过 kubernetes.qps。

更改此设置需要重新启动 YuniKorn 才能生效。

默认值： `1000`

示例：

    kubernetes.burst: "500"

### 准入控制器 webhook 设置

#### admissionController.webHook.amServiceName
设置 YuniKorn 准入控制器所在的服务的名称下注册。这是准入控制器注册所必需的本身与 Kubernetes 兼容，通常不应更改。

更改此设置需要重新启动 YuniKorn 准入控制器生效。

默认值： `yunikorn-admission-controller-service`

示例：

    admissionController.webHook.amServiceName: "yunikorn-admission-controller-alt-service-name"

#### admissionController.webHook.schedulerServiceAddress
设置 YuniKorn 调度程序服务的地址。这个地址必须是准入控制器可达，并由准入使用验证 ConfigMap 更改时的控制器。准入控制器将联系调度程序上的 REST API 以验证任何提议 ConfigMap 更改。通常不应更改此设置。

更改此设置需要重新启动 YuniKorn 准入控制器生效。

默认值： `yunikorn-service:9080`

示例：

    admissionController.webHook.schedulerServiceAddress: "alt-yunikorn-service:9080"

### 准入控制器过滤设置

#### admissionController.filtering.processNamespaces
控制哪些命名空间会将 pod 转发给 YuniKorn 进行调度。

此设置是以逗号分隔的正则表达式列表。如果这个设置是一个空字符串，在所有命名空间中创建的 pod 将由 YuniKorn 调度。

无需重新启动准入控制器即可获取对此设置的更改。

默认值： empty

示例：

    # Schedule only pods in spark-* and mpi-* namespaces with YuniKorn
    admissionController.filtering.processNamespaces: "^spark-,^mpi-"

#### admissionController.filtering.bypassNamespaces
该设置控制哪些命名空间的 pod *不会* 被转发到 YuniKorn 进行调度。它作为 `admissionController.filtering.processNamespaces` 的例外列表。

此设置是一组逗号分隔的正则表达式。如果该设置为空字符串，则不会从任何命名空间中排除由 YuniKorn 处理的 pod。

默认情况下，该设置将排除 kube-system 命名空间中的 pod，因为这些 pod 的调度通常需要成功将节点添加到群集中。这可能会阻止 YuniKorn 本身或其他关键服务的启动。

更改此设置将被 admission controller 感知，无需重新启动。

默认值： `^kube-system$`

示例：

    # 不要在 kube-system 或 fluentd-* 命名空间中调度 pod。
    admissionController.filtering.bypassNamespaces: "^kube-system$,^fluentd-"

#### admissionController.filtering.labelNamespaces
该设置控制哪些命名空间的 pod 将被打上 `applicationId` 标签。默认情况下，所有由 YuniKorn 调度的 pod 都会被打上 `applicationId` 标签。

当使用标准部署模型运行 YuniKorn 时，所有 pod 都应打上标签，因为 YuniKorn 无法调度未定义 `applicationId` 的 pod。

当使用调度程序插件部署模型运行 YuniKorn 时，此设置可用于过滤哪些命名空间应通过 YuniKorn 的队列模型进行调度，哪些命名空间应绕过队列模型并由嵌入式默认调度程序进行调度。

此设置是一组逗号分隔的正则表达式。如果该设置为空字符串，则将为转发到 YuniKorn 的所有 pod 打上 `applicationId` 标签。

更改此设置将被 admission controller 感知，无需重新启动。

默认值： empty

示例：

    # 将 applicationId 标签添加到 spark-* 命名空间中的 pod。
    admissionController.filtering.labelNamespaces: "^spark-"

#### admissionController.filtering.noLabelNamespaces
该设置控制哪些命名空间的 pod *不会* 打上` applicationId` 标签。它作为 `admissionController.filtering.labelNamespaces` 的例外列表。

当使用标准部署模型运行 YuniKorn 时，所有 pod 都应打上标签，因为 YuniKorn 无法调度未定义 `applicationId` 的 pod。

当使用调度程序插件部署模型运行 YuniKorn 时，此设置可用于过滤哪些命名空间应通过 YuniKorn 的队列模型进行调度，哪些命名空间应绕过队列模型并由嵌入式默认调度程序进行调度。

此设置是一组逗号分隔的正则表达式。如果该设置为空字符串，则不会应用到 `admissionController.filtering.labelNamespaces` 的任何例外。

更改此设置将被 admission controller 感知，无需重新启动。

默认值： empty

示例：

    # 在命名空间为 noqueue 时跳过队列。
    admissionController.filtering.labelNamespaces: "^noqueue$"

### 准入控制器访问控制列表（ACL）设置

#### admissionController.accessControl.bypassAuth
允许外部用户创建带有用户信息的 pod。

更改此设置将被准入控制器感知，无需重新启动。

默认值： `false`

示例：

    admissionController.accessControl.bypassAuth: "true"

#### admissionController.accessControl.trustControllers
允许控制器用户创建带有用户信息的 pod。

更改此设置将被准入控制器感知，无需重新启动。

默认值： `true`

示例：

    admissionController.accessControl.trustControllers: "false"

#### admissionController.accessControl.systemUsers
逗号分隔的正则表达式列表，用于匹配允许的控制器服务账户。

更改此设置将被准入控制器感知，无需重新启动。

默认值： `^system:serviceaccount:kube-system:`

示例：

    # 允许所有的 kube-system 账户以及 kube-controller-manager
    admissionController.accessControl.systemUsers: "^system:serviceaccount:kube-system,^system:kube-controller-manager$"

#### admissionController.accessControl.externalUsers
逗号分隔的正则表达式列表，用于匹配允许的外部用户。

更改此设置将被准入控制器感知，无需重新启动。

默认值： empty

示例：

    # 允许 'alice'、'bob' 和 'admin-*'
    admissionController.accessControl.externalUsers: "^alice$,^bob$,^admin-"

#### admissionController.accessControl.externalGroups
逗号分隔的正则表达式列表，用于匹配允许的外部用户组。

更改此设置将被准入控制器感知，无需重新启动。

默认值： empty

示例：

    # 允许 'sales'、'marketing' 和 'admin-*'
    admissionController.accessControl.externalGroups: "^sales$,^marketing$,^admin-"

