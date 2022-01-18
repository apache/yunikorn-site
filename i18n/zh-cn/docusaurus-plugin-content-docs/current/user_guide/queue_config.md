---
id: queue_config
title: 分区和队列配置
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

队列配置的基本信息在 [配置设计文档](design/scheduler_configuration.md) 中有描述。

本文档提供了通用队列配置的相关信息。
请同时参考 [访问控制列表](user_guide/acls.md) 和 [放置规则](user_guide/placement_rules.md) 文档。

本文档通过示例说明了如何为调度器创建分区和队列配置。

作为应用程序提交的一部分，调度器依赖于 shim 来可靠地提供用户信息。
当前 shim 使用 [用户和组解析](usergroup_resolution) 中提供的方法识别用户和用户所属的组。

## 配置
这里描述的调度器的配置文件只提供了分区和队列的配置。

默认情况下，我们在部署中使用名为 `queues.yaml` 的文件。
可以通过调度器的命令行标志 `policyGroup` 更改文件名。
更改文件名后必须在 deployment 详细信息中进行相应的更改，无论是 `configmap` 还是包含在 docker 容器中的文件。

配置的示例文件位于调度器核心内 [queues.yaml](https://github.com/apache/incubator-yunikorn-core/blob/master/config/queues.yaml)。

## 分区
分区是调度器配置的顶层。
配置中可以定义多个分区。

配置中分区定义的基本结构：
```yaml
partitions:
  - name: <name of the 1st partition>
  - name: <name of the 2nd partition>
```
分区的默认名称是 `default`。
分区定义包含特定 shim 的调度程器的完整配置。
每个 shim 使用自己唯一的分区。

分区必须至少定义以下键：
* 名称
* [队列](#queues)

队列配置释义如下。

可以选择为分区定义以下键：
* [布置规则](#placement-rules)
* [限制](#limits)
* 节点排序策略
* 抢占

布置规则和限制在它们自己的章节中进行了详解

`nodesortpolicy` 定义了节点为分区排序的方式。
可以使用的值的详细信息在 [排序策略](sorting_policies.md#node-sorting) 文档中可以参考。

抢占键目前只能有一个子键：_enabled_ 。
这个布尔值定义了整个分区的抢占行为。

_enabled_ 的默认值为 _false_ 。
允许值：_true_ 或 _false_ ，任何其他值都会导致解析错误。

设置了 _preemption_ 标志和 `nodesortpolicy` 为 _fair_ 的示例 `partition` yaml 描述：
```yaml
partitions:
  - name: <分区名称>
    nodesortpolicy: fair
    preemption:
      enabled: true
```
注意:
目前，YuniKorn 在 Kubernetes 上不支持除 `default` 分区之外的任何其他分区。
详情请见 [YUNIKORN-22](https://issues.apache.org/jira/browse/YUNIKORN-22) 。

### 队列

YuniKorn 通过利用资源队列来管理资源。资源队列具有以下特征：
- 队列可以有 **层级结构** 
- 每个队列都可以预设 **最小/最大容量** ，其中最小容量定义了保障资源，最大容量定义了资源限制（又名资源配额）
- 任务必须在某个叶子队列下运行
- 队列可以是 **静态的**（从配置文件加载）或 **动态的**（由 YuniKorn 内部管理）
- 队列级别 **资源公平** 由调度器强制执行
- 一个作业只能运行在某一个特定的队列，即一个作业无法垮队列运行。

:::info
YuniKorn 队列与 [Kubernetes 命名空间](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) 的区别：
Kubernetes 命名空间提供了 Kubernetes 资源的范围，包括安全上下文（即谁可以访问对象）和当 [资源配额](https://kubernetes.io/docs/concepts/policy/resource-quotas/) 被定义（即对象可以使用多少资源）时的资源边界。
另一方面，YuniKorn 队列仅用于一组作业可以使用多少资源，以及按什么顺序使用。考虑到资源公平性、作业排序等，它对跨租户的资源共享会提供更细粒度的控制。在大多数情况下，YuniKorn 队列可以用来代替命名空间资源配额，以提供更多的调度功能 .
:::

_queues_ 内容是主要的配置元素。
它定义了队列的层次结构。

我们可以定义一个 `root` 队列，但它不是必需的元素。
如果没有定义 `root` 队列，配置解析将插入根队列以保持一致性。
根队列的插入由以下情况触发：
* 如果配置在顶层定义了多个队列，一个根队列会被插入。
* 如果在顶层只定义了一个队列并且它不被称为 `root`，一个根队列会被插入。

定义的队列将成为插入的 `root` 队列的子队列。

带有子队列的基本 `queues` yaml 内容：
```yaml
queues:
- name: <队列名>
  queues:
  - name: <队列名>
```

队列支持的参数：
* name
* parent
* queues
* properties
* adminacl
* submitacl
* [resources](#resources)
* [limits](#limits)

每个队列都必须有一个 _名称_。
队列的名称在定义队列的级别上必须是唯一的。
由于队列结构是完全分层的，层次结构中不同点的队列可能具有相同的名称。
例如：队列结构 `root.testqueue` 和 `root.parent.testqueue` 是一个有效的结构。
队列不能包含点 “.” 字符，因为该字符用于分隔层次结构中的队列。
如果配置中队列的名称不是唯一的或包含点，则会生成解析错误并拒绝配置。

* parent
* leaf
在结构中的队列将自动获得分配的类型。
队列的类型基于队列具有子队列或次级队列的这个事实。
队列的两个类型是：
* parent
* leaf

应用程序只能分配到 _leaf_ 队列。
在配置中具有子队列或次级队列的队列自动成为 _parent_ 队列。
如果队列在配置中没有子队列，则它是 _leaf_ 队列，除非 `parent` 参数设置为 _true_。
尝试覆盖配置中的 _parent_ 队列类型会导致配置解析错误。

父队列的次级队列在 `queues` 层级下定义。
`queues` 层级是队列级别的递归条目，并使用完全相同的参数集。

`properties` 参数是一个简单的键值对列表。
该列表为队列提供了一组简单的参数属性。
键或值的值没有限制，任何配置都是允许的。
目前，属性列表仅用于调度器中，用于为 leaf 队列定义 [排序顺序](sorting_policies.md#application-sorting)。
未来的扩展，比如在队列或其他排序策略上打开或关闭抢占的选项，将使用相同的属性构造，而无需更改配置。

对队列的访问是通过 `adminacl` 设置的，用于管理操作和通过 `submitacl` 条目提交申请。
ACL 记录在 [访问控制列表](acls.md) 文档中。

队列资源限制是通过 `resources` 参数设置的。
用户和组限制是通过 `limits` 参数设置的。
由于这两个条目都是复杂的配置条目，它们在下面的 [资源](#resources) 和 [限制](#limits) 中进行了说明。

下面列举一个具有限制的 _parent_ 队列 `root.namespaces` 的示例配置：
```yaml
partitions:
  - name: default
    queues:
      - name: namespaces
        parent: true
        resources:
          guaranteed:
            {memory: 1000, vcore: 10}
          max:
            {memory: 10000, vcore: 100}
```

### 放置规则

放置规则在 [放置规则](placement_rules.md) 文档中定义和记录。

每个分区只能定义一组放置规则。
如果没有定义规则，则不会启动放置管理器，并且每个应用程序 *必须* 在提交时设置一个队列。

### 限制
限制为分区或队列定义了一组限制对象。
它可以设置在任何级别的分区或队列上。
```yaml
limits:
  - limit: <description>
  - limit: <description>
```

限制对象是一个复杂的配置对象。
它为一组用户和/或组定义了一个限制范围。
可以将多个独立限制设置为队列或分区上一个 `limits` 内容的一部分。
不属于限制设置的用户和/或组将不受限制。

一个简单的限制内容如下:
```yaml
limits:
  - limit: <description>
    users:
    - <user name or "*"">
    - <user name>
    groups:
    - <group name or "*"">
    - <group name>
    maxapplications: <1..maxint>
    maxresources:
      <resource name 1>: <0..maxint>
      <resource name 2>: <0..maxint>
```

队列限制可以递归使用。
这意味着对 `root` 队列的限制是集群中用户或组的总体限制。
因此，`root` 队列限制也与 `partition` 限制等效。

限制对象参数：
* limit
* users
* groups
* maxapplications
* maxresources

_limit_ 参数是限制条目的可选描述。
它不用于任何用途，只是使配置易于理解和可读。

 _users_ 和 _groups_ 配置可以是以下两种类型之一：
* 星号 “*”
* 用户或组列表

如果用户或组的内容包含多于一个条目，则它始终被视为用户或组的列表。
星号 “*” 是通配符，匹配所有用户或组。
列表中的重复条目将被忽略并且不会导致解析错误。
不允许在其他列表元素旁指定星号。

_maxapplications_ 是一个大于 1 的无符号整数值，它允许您为配置的用户或组运行的应用程序的数量做以限制。
不允许指定零作为最大应用程序限制，因为它会隐式拒绝访问。
拒绝访问必须通过 ACL 条目进行处理。

列表中未指定的资源不受限制。
资源限制可以设置为0。
这会阻止用户或组请求指定的资源，即使队列或分区具有可用的特定资源。
不允许将总体资源限制指定为零。
这意味着限制中指定的资源至少有一种必须大于零。

如果队列上的资源不可用，则应使用队列定义上的最大资源。
指定一个实际上为零的限制、_maxapplications_ 为零并且所有资源限制都为零，这都是不允许的，并且会导致解析错误。
 
限制分配给每个用户或组的。
它 *不是* 所有用户或组的组合限制。

举个例子： 
```yaml
limit: "example entry"
maxapplications: 10
users:
- sue
- bob
```
在这个例子里，用户 `sue` 和 `bob` 都被允许运行10个应用程序。

### 资源
队列的资源内容可以为队列设置 _guaranteed_ 和/或 _maximum_ 资源。
资源限制是递归检查的。
叶队列的使用量是为该队列分配的所有资源的总和。
父队列的使用量是父队列下方所有队列、叶子和父级的使用量之和。

根队列在定义时不能设置任何资源限制。
如果根队列设置了任何限制，则会发生解析错误。
根队列的最大资源限制自动等于集群大小。
根队列没有 guaranteed 资源设置。

配置的最大资源对可以在任何时间点分配给队列的所有分配的大小进行硬限制。
最大资源可以设置为0，这使得该资源不可用于队列。
guaranteed 资源在计算队列份额时和分配期间使用。
它被用作决定将分配给哪个队列的输入之一。
抢占会使用队列的 _guaranteed_ 资源作为队列不能低于限额的基本配置。

基础的 `resources` yaml 内容：
```yaml
resources:
  guaranteed:
    <资源名称 1>: <0..maxint>
    <资源名称 2>: <0..maxint>
  max:
    <资源名称 1>: <0..maxint>
    <资源名称 2>: <0..maxint>
```
对于最大资源，列表中未指定的资源不受限制，对于保障资源，也不会受保障。

### 子模板

父队列可以提供一个模板来定义它下面的动态叶子队列的行为。
如果父队列已定义，则没有子模板的父队列从其父队列继承子模板。可以在父类型队列的队列层次结构中的任何级别定义子模板。

模板中支持的配置如下所示。
1. 应用排序策略
2. 最大资源
3. 保障资源
4. 最大应用数目

举个例子：
```yaml
 partitions:
   - name: default
     placementrules:
       - name: provided
         create: true
     queues:
       - name: root
         submitacl: '*'
         childtemplate:
           maxapplications: 10
           properties:
             application.sort.policy: stateaware
           resources:
             guaranteed:
               vcore: 1000
               memory: 1000
             max:
               vcore: 20000
               memory: 600000
         queues:
           - name: parent
             parent: true
             childtemplate:
               resources:
                 max:
                   vcore: 21000
                   memory: 610000
           - name: notemplate
             parent: true
```
在这种情况下，`root.parent.sales` 将直接使用父队列 `root.parent` 的子模板。
相比之下，`root.notemplate.sales` 将使用在队列 `root` 上设置的子模板，因为它的父队列 `root.notemplate` 从队列 `root` 继承了子模板。

[已弃用] 如果您的集群依赖于动态叶队列可以从父级继承 `application.sort.policy` 的旧行为，请迁移到模板（由 [YUNIKORN-195](https://issues.apache.org/jira/browse/YUNIKORN-195) 引入)。旧的行为将在未来版本中删除。
