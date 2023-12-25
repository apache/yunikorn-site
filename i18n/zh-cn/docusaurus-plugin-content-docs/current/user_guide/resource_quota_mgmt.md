---
id: resource_quota_management
title: 资源配额管理
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

## 配额配置和规则
与 Kubernetes 提供的简单命名空间资源配额相比，YuniKorn 可以提供一个更细化的资源配额管理设置。

在 Kubernetes 上，一个 pod 在提交时必须符合命名空间的配额。
如果 pod 不适合命名空间配额， pod 就会被拒绝。
客户端必须实现重试机制，如果它需要该 pod 被调度，就重新提交该 pod 。

与 Kubernetes 中的配额相反， YuniKorn 不在提交时强制执行配额，而只对主动消耗的资源执行配额。
解释一下区别：当使用 YuniKorn 执行配额时，提交给 Kubernetes 的新 pod 总是被接受。
 Yunikorn 将对 pod 进行排队，而不将排队的 pod 的资源计入已消耗的配额。
当 YuniKorn 试图调度 pod 时，它会在调度时检查 pod 是否符合为 pod 所分配的队列配置的配额。
如果这时 pod 不符合配额， pod 就会被跳过，不计入资源消耗。
这意味着，在一个 pod 的调度尝试成功之前，一个 pod 在 YuniKorn 配额系统中不消耗资源。

YuniKorn 中的资源配额与队列及其在队列层次结构中的位置有关。
队列结构的基础，即 `root` 队列，不允许设置配额，因为它反映了集群的当前规模。
节点的增加和删除会自动更新 `root` 队列的配额。

除了 `root` 队列，配额可以设置，并在层次结构的任何一点上执行。
每个队列都可以有一个配额设置。配额在整个层次结构中是递归执行的。
这意味着子队列使用的资源不能超过父队列的**配置的**配额。
因此，在子队列上设置大于其父队列配额的配额不会有任何影响，并被作为配置错误处理。

在层次结构中，还有一些需要考虑的规则。
如果一个父队列有多个子队列，所有子队列的**使用量之和不能超过父队列的**配置配额。
然而，从配置的角度来看，这并不意味着所有子队的**配置的**配额之和必须小于父队的配额。

![队列定额](./../assets/queue-resource-quotas.png)

举个例子，`root.parent` 队列的配额是 900。
它包含三个子队列，其中两个有配额设置。
`root.parent.child1` 没有设置配额，因此将被限制在 `root.parent` 的配额内。
另外两个队列 `root.parent.child2` 和 `root.parent.child3` 各设置了 750 的配额。
在正常运行期间，3 个子队列的总使用量将是 900。
在每个子队列中运行的应用程序，每个都有超过 1000 的需求。 

在这种情况下，分配可能是以下任何一种：
* 所有 900 个都被 `child1` 队列使用
* 平均分布在 3 个队列中（每个队列 300 个）。
* `child2` 最大使用 750，剩下的 150 由 `child3` 使用。 

队列之间的确切分布将是波动的，取决于调度策略。

## 转换 Kubernetes 资源和配额

对pod的资源支持仅限于作为_需求_规范的一部分而指定的资源：

* _cpu_ 被映射到 _vcore_，其值为 milli cpu。
* _memory_ 被映射到 _memory_，其值为MB（1 MB = 10^6 B = 1 000 000 B）。
* 所有其他资源都按照规定进行映射。

支持 [Kubernetes文档](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) 中提到的扩展资源。

有一个单一容器的 pod 例子：
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: container-1
    resources:
      requests:
        cpu: "250m"
        memory: "1Gi"
        hugepages-1Gi: "1"
```
上述规范将在 YuniKorn 中为调度设置 pod 资源请求：
* _vcore_ -> 250m
* _memory_ -> 1073741824
* _hugepages-1Gi_ -> 1

两个备注：  
多个容器规格将被自动汇总为一个总的 pod 资源请求。所有的内存都是以字节为单位报告的。

在为队列使用静态队列定义的情况下，对配额中可指定的资源类型没有限制。
作为自动队列创建的一部分，命名空间上的配额注释被限制在相当于 _cpu_ 和 _memory_ 的资源。
参见下面的 [设置](#命名空间配额)，了解命名空间上的配额注释。

## Kubernetes 和 YuniKorn 配额互动
建议关闭而不是配置 Kubernetes 命名空间配额。
只使用 YuniKorn 队列配额提供了一个更灵活的设置，并允许对工作负载进行排队。 

在同时开启 YuniKorn 和 Kubernetes 配额的设置中，考虑以下几点：
* 需要维护两个独立的配置。
  这增加了维护负担，以及配置错误的可能性。
* 两个配额都会被强制执行。
  
开启这两个配额可能会导致意外的行为。
主要问题是，Kubernetes 命名空间配额在提交时被强制执行。
有三种配额配置的组合是可能的。
当与 YuniKorn 配额结合使用时，这3种组合可能有两种效果。

1. 两种配额都是_平等的_：工作负载将不被排队，可以使用全部配置的配额。 
   - 最大使用量和排队将被限制在设定的配额内
2. Kubernetes 配额比 YuniKorn 低：YuniKorn 配额将永远不会达到，工作负载将不会被排队。  
   - 最大使用量将被限制在 Kubernetes 的配额内。
3. Kubernetes 配额比 YuniKorn 高： YuniKorn 将把使用量限制在 YuniKorn 中设置的配额。
   Kubernetes 配额将在提交时强制执行，从而为可以在 YuniKorn 配额之上排队的工作负载设置限制。 
   - 最大使用量将被限制在 YuniKorn 的配额内。
   - 工作负载的排队将被限制在 Kubernetes 配额内。

:::note
下面的配置例子只是为了演示需要的格式
来创建一个设置了配额的队列层次结构。
:::

## 静态队列定义

### 目标
一个预先配置好的具有最大和保证容量的队列层次结构。
用户只能向叶子队列提交申请。
这种方法管理每个队列的资源容量，适用于队列不经常变化的情况。

### 配置
将以下配置应用于 YuniKorn 的 configmap，以：
* 在 `root` 下设置 3 个队列
* 每个队列都有一个特定的保证和最大容量
* 任何人都可以向任何队列提交

```yaml
partitions:
  - name: default
    queues:
      - name: root
        submitacl: '*'
        queues:
          - name: advertisement
            resources:
              guaranteed:
                memory: 500G
                vcore: 50
              max:
                memory: 800G
                vcore: 80
          - name: search
            resources:
              guaranteed:
                memory: 400G
                vcore: 40
              max:
                memory: 600G
                vcore: 60
          - name: sandbox
            resources:
              guaranteed:
                memory: 100G
                vcore: 10
              max:
                memory: 100G
                vcore: 10
```

### 运行一个工作负载
为了在特定队列中运行应用程序，你需要在所有 pod 规格中设置以下标签。
所有具有相同 `applicationID` 标签的 pod 被认为是一个应用程序。
在下面的例子中，应用程序 `my-test-app` 将在队列 `root.sandbox` 中运行：

```yaml
labels:
  app: my-test-app
  applicationId: "my-test-app-01"
  queue: root.sandbox
```

## 名称空间到队列的映射

### 目标
自动将Kubernetes的 `namespace` 映射到 YuniKorn 的队列。
用户在 Kubernetes 中创建所需的命名空间。
YuniKorn k8s shim 和核心调度器会自动传递所需信息，并将命名空间映射到队列中，如果队列不存在，则创建队列。
资源配额将由 YuniKorn 管理，而不是使用 Kubernetes 命名空间配额。
这确实需要按照下面的 [设置](#命名空间配额) 设置命名空间，不需要 Kubernetes 配额的执行和标签。

### 配置
将以下配置应用于 YuniKorn 的配置图：

```yaml
partitions:
  - name: default
    placementrules:
      - name: tag
        value: namespace
        create: true
    queues:
      - name: root
        submitacl: '*'
        properties:
          application.sort.policy: stateaware
```

该配置根据 `tag` 规则放置一个应用程序。
选择的标签是 `namespace` 标签，它由 k8s shim 自动添加到所有被创建的应用程序中。
`create` 标志被设置为 `true`，如果队列不存在，它将触发与命名空间同名的队列的创建。

自动创建的子队列中的应用程序将根据父队列上设置的排序策略进行排序。
在这种情况下，属性 `application.sort.policy` 在此配置中被设置为 `stateaware` 。
这是一个适用于批处理作业的简单应用排序策略，你可以找到更多的文件 [这里](sorting_policies.md#stateawarepolicy)。

你可以在安装过程中使用 helm charts 来改变配置，通过覆盖在
[helm chart template](https://github.com/apache/yunikorn-release/blob/master/helm-charts/yunikorn/values.yaml#L71-L81)。

### 命名空间配额
Kubernetes 中的命名空间包含配额信息。
如果在命名空间上设置了配额，Kubernetes 将自动执行该配额。
在 YuniKorn 被用于执行配额的情况下，必须在命名空间上设置配额。

为了允许在命名空间上指定配额，应在命名空间对象中设置以下注释：

```yaml
yunikorn.apache.org/namespace.quota: "{\"cpu\": \"64\", \"memory\": \"100G\", \"nvidia.com/gpu\": \"1\"}"
```
YuniKorn 将解析这些注释，并设置映射到该命名空间的队列的最大容量。
指定的值遵循标准的 Kubernetes 格式和单位规范。
注释值必须是一个符合 json 的字符串。确保双引号被正确转义，以免造成任何问题。

上面的例子将把映射到注释命名空间的队列限制在 64 个 CPU、100GB 内存和 1 个 `nvidia.com/gpu`。

[已废弃]
以下注释已被废弃，并将在下一个主要版本中被删除。
它们只支持映射内存和cpu，不支持其他资源类型。
```yaml
yunikorn.apache.org/namespace.max.cpu: "64"
yunikorn.apache.org/namespace.max.memory: "100Gi"
```
废弃注释的例子将把队列配额设置为 64 个 CPU 和 100GB 内存。

### 运行一个工作负载

应用程序，以及作为应用程序一部分的 pod，可以在没有特定标签的情况下提交。
YuniKorn 将自动添加所需的标签。
如果需要，配置的放置规则将创建队列，并将应用程序添加到队列中。
 
例如，如果一个应用程序被提交到命名空间 `development` ，那么该应用程序将在 `root.development` 队列中运行。

## 命名空间的父队列映射

### 目标
尽管使用 `namespace` 标签的标签放置规则能够将应用程序放置在队列中，但这在所有设置中可能是不够的。
在某些情况下，例如多租户，命名空间需要被归为一组。
管理员可以对命名空间进行注释，如果设置了放置规则，可以根据多个注释动态放置应用程序。
YuniKorn 不能也不会将一个命名空间的所有注解添加到一个应用程序。

为了帮助支持这种分组情况，可以在命名空间上标记一个父队列。  

### 配置
这个功能的配置由两部分组成：
1. 映射规则
1. 命名空间注释

首先，我们在 YuniKorn 的 configmap 上设置以下配置：

```yaml
partitions:
   - name: default
     placementrules:
        - name: tag
          value: namespace
          create: true
          parent:
             name: tag
             value: namespace.parentqueue
     queues:
        - name: root
          queues:
             - name: production
               parent: true
             - name: development
               parent: true
```

用于命名空间到队列映射的配置与 [上文](#名称空间到队列的映射) 相同。
作为放置规则的扩展，添加了一个 `parent` 规则以支持分组。
父级规则用于生成层次结构中的父级，或上面的队列。
该规则使用应用程序中的标签 `namespace.parentqueue` 来生成父队列名称。
`namespace.parentqueue` 标签由 Kubernetes shim 自动添加，但确实需要一个命名空间注释（见下文）。

在给出的规则配置示例中，`create` 标志没有在父规则上设置。
这意味着父队列必须存在于配置中，否则应用提交将失败。
对于这个例子的配置，这意味着父队的支持值被限制为 `production` 和 `development`。

不能使用任何这些映射在父队列上设置配额。
根据前面提供的命名空间映射，与命名空间相关的配额设置在命名空间队列上，而不是父队。

父队列的配额必须总是直接在配置中设置。
这需要在父规则上将 `create` 标志设置为 `false`。

### 命名空间父队列
与命名空间名称本身相反，并与配额设置相一致，命名空间需要被注解以使用父队列映射。
命名空间名称在 Kubernetes 中必须是唯一的，这不受此注释的影响。
相同的注解值可以用于多个命名空间：
```yaml
yunikorn.apache.org/parentqueue: root.production
```

上面的例子注释将把父队列映射到现有的 `root.production` 队列。
注意，如果需要的话，规则将完全限定名称，因此你可以省略注释中的 `root.` 部分。
如果注释以 `root.` 开头，系统会认为这是一个完全合格的队列名称。

为了使图片更完整，这里有一张图片，显示了 YuniKorn 中从 Kubernetes 命名空间到队列的映射。
它使用了 Kubernetes 中命名空间的注释，以及映射规则的配置示例。
`finance` 和 `sales`命名空间成为队列，归入父队列 `production` 之下。
命名空间 `dev` 和 `test` 被放在 `development` 父队列下。

![队列配额](./../assets/namespace-mapping.png)

### 运行一个工作负载
应用程序，以及作为应用程序一部分的 pod，可以在没有特定标签或更改的情况下提交。
YuniKorn 将添加标签，安置规则将做其余的事情。
配置的放置规则将创建队列（如果需要），并将应用程序添加到队列中。

由于命名空间 `finance` 被注释为示例值，并且规则已经到位。
`finance` 命名空间的应用程序将在动态创建的 `root.production.finance` 队列中运行。
