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

队列配置基础在[配置设计文档](design/scheduler_configuration.md)中有描述。

本文档提供通用队列配置。
队列配置引用了[访问控制列表](user_guide/acls.md)和[放置规则](user_guide/placement_rules.md)文档。

本文档通过示例说明如何为调度程序创建分区和队列配置。

调度程序依靠shim可靠地提供用户信息作为应用程序提交的一部分。
当前shim使用[用户和组解析](usergroup_resolution)中提供的方法识别用户和用户所属的组。

## 配置
此处描述的调度器的配置文件仅提供分区和队列的配置。

默认情况下，我们在部署中使用`queues.yaml`文件。
文件名可以通过命令行更改调度器的`policyGroup`标志。
更改文件名后必须对部署细节进行相应的更改，可以是`configmap`或包含在docker容器中的文件。
配置的示例文件位于yunikorn-core的[queues.yaml](https://github.com/apache/yunikorn-core/blob/master/config/queues.yaml).

## 分区
分区(partitions)是调度器配置的最高级别。
在配置中可以定义多个分区。

配置中分区定义的基本结构如下：
```yaml
partitions:
  - name: <第一个分区的名称>
  - name: <第二个分区的名称>
```
分区的默认名称是`default`。
分区定义包含特定shim相应调度器的完整配置。
每个shim都使用自己独特的分区。

分区必须至少需要定义以下键：
* name
* [queues](#queues)

队列配置会在分区结束后介绍。

可以选择为分区定义以下键：
* [placementrules](#placement-rules)
* [statedumpfilepath](#statedump-filepath)
* [limits](#limits)
* nodesortpolicy
* preemption

放置规则和限制在各自的章节中解释。

`nodesortpolicy`定义节点为分区排序的方式。
有关可以使用的节点排序策略值的详细信息，请参阅[排序策略](sorting_policies.md#node-sorting)文档。

抢占键目前只能有一个子键： _enabled_。
这个布林值定义了整个分区的抢占行为。

_enabled_的默认值为_false_。
_enabled_的允许值：_true_或_false_，任何其他值都会导致解析错误。

下方的示例中，`partition` yaml条目是带有_preemption_标志集和_fair_的`nodesortpolicy`。
```yaml
partitions:
  - name: <分区名称>
    nodesortpolicy: fair
    preemption:
      enabled: true
```
备注：
目前，Kubernetes独特的shim不支持除`default`分区之外的任何其他分区。
这已被记录为shim的[jira](https://issues.apache.org/jira/browse/YUNIKORN-22)。

### 队列

YuniKorn通过利用资源队列来管理资源。
资源队列(queues)具有以下特征：
- 队列可以有**层次**结构
- 每个队列都可以预设**最小/最大容量**，其中最小容量定义保证资源，最大容量定义资源限制(所谓的资源配额)
- 任务必须在某个`leaf`队列下运行
- 队列可以是**静态**(从配置文件加载)或**动态**(由YuniKorn内部管理)
- 队列级别的**资源公平**是由调度器强制执行
- 作业只能在特定队列下运行

:::info
YuniKorn队列与[Kubernetes命名空间](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)的区别：
Kubernetes命名空间提供了Kubernetes资源的范围，包括安全环境(即谁可以访问对象)，以及定义[资源配额](https://kubernetes.io/docs/concepts/policy/resource-quotas/)时的资源边界(即对象可以使用多少资源)。
另一方面，YuniKorn队列仅使用一组作业可以使用多少资源，以及以何种顺序使用。
YuniKorn队列在考虑资源公平性、作业排序等方面提供了更细粒度的多租户资源共享控制。
在大多数情况下，YuniKorn队列可用于替代命名空间资源配额，以提供更多的调度特性。
:::

_queues_条目是主要的配置元素，它为队列定义了层次结构。

它可以定义一个`root`队列，但它不是必需的元素。
如果未定义`root`队列，配置解析将插入root队列以保持一致性。
以下因素会触发root队列的插入：
* 如果配置在顶层定义了多个队列，则会插入一个根队列。
* 如果在顶层只定义了一个队列并且它不被称为`root`，则插入一个root队列。

定义的一个或多个队列将成为插入的`root`队列的子队列。

带有子队列的基本`queue` yaml条目：
```yaml
queues:
- name: <队列名称>
  queues:
  - name: <队列名称>
```

队列支持的参数：
* name
* parent
* queues
* maxapplications
* properties
* adminacl
* submitacl
* [resources](#resources)
* [limits](#limits)

每个队列都必须有一个_name_并且队列的名称在定义队列的同一级别上必须是唯一的。
由于队列结构是完全层次化的，层次结构中不同点的队列可能具有相同的名称。
例如：队列结构`root.testqueue`和`root.parent.testqueue`是一个有效的结构。
需注意的是，队列不能包含点“.”字符，因为该字符用于分隔层次结构中的队列。
如果名称对于配置中的队列不是唯一的，或者名称包含一个点，则会生成解析错误并拒绝配置。

依队列的类型是否于队列有子模板队列和子队列的事实，结构中的队列将自动获得分配的类型。
队列类型有两种：
* parent
* leaf

应用只能分配给_leaf_队列。
在配置中，队列具有子模板队列或子队列将自动成为_parent_队列。
如果队列在配置中没有子队列，则该队列是_leaf_队列，除非该队列`parent`参数设置为_true_。
尝试覆盖配置中的_parent_队列类型将导致配置解析错误。

parent队列的子队列在`queues`条目下定义。
`queues`条目是队列级别的递归条目，它使用完全相同的参数集。
_maxapplications_属性是一个大于 1 的整数值，它允许您限制队列中正在运行的应用的数量。
不允许为_maxapplications_指定零，因为它会阻止队列中应用的任何分配。
_子_队列的_maxapplications_值必须小于或等于_parent_队列的值。
`properties`参数是一个简单的键值对列表，并为队列提供一组简单的属性。其中的键或值没有限制，任何东西都是允许的。
目前，属性列表仅在调度器中用于定义leaf队列的[排序顺序](sorting_policies.md#application-sorting)。
在未来的扩展中，添加比如打开或关闭队列抢占或其他排序策略的选项，让使用相同的属性构造而无需更改配置。

通过`adminacl`设置对队列的访问权限以进行管理操作，并通过`submitacl`条目提交应用。
访问控制列表(ACLs)的描述可见[访问控制列表(ACLs)](acls.md)文档。

队列资源限制是通过`resources`参数设置。
用户和群组的限制是通过`limits`参数设置。
由于这两个条目都是复杂的配置条目，因此它们在下面的[resources](#资源)和[limits](#限制)中有相应解释。

以下示例配置是`root.namespaces`队列作为具有限制的_parent_队列：
```yaml
partitions:
  - name: default
    queues:
      - name: namespaces
        parent: true
        maxapplications: 12
        resources:
          guaranteed:
            {memory: 1G, vcore: 10}
          max:
            {memory: 10G, vcore: 100}
        queues:
          - name: level1
            maxapplications: 8
            resources:
              guaranteed:
                {memory: 0.5G, vcore: 5}
              max:
                {memory: 5G, vcore: 50}
```

### 放置规则

放置规则(placement rules)在[放置规则](placement_rules.md)文档中有相关定义和记录。

每个分区只能定义一组放置规则。 
如果没有定义规则，则放置管理器不会启动。
此外，在提交应用时，*必须*为每个应用设置一个队列。

### 状态转储文件路径(Statedump filepath)

状态转储文件路径定义YuniKorn状态转储的输出文件并且它可以在分区级别上设置。
如果设置转储文件路径，该字段的值可以是相对路径或绝对路径(此处相对路径是基于工作目录)。
如果YuniKorn调度器没有足够的权限在指定路径创建状态转储文件，它将无法启动状态转储的功能。

```yaml
statedumpfilepath: <path/to/statedump/file>
```
如果上面的键没有在分区配置中指定，它的默认值为`yunikorn-state.txt`。
需注意的是，如果键在多个分区中指定，则其第一次出现的值优先。

状态转储文件也有一个固定的循环策略。
目前，每个状态转储文件的容量为10MB，最多可以有10个这样的文件。
当前正在写入的状态转储文件将始终是上面配置的值或默认的`yunikorn-state.txt`。
当达到文件大小限制时，日志旋转器(`lumberjack`)将通过在文件前加上时间戳来修改文件，并创建一个具有相同的无前缀名称的新文件来写入状态转储。
如果达到状态转储文件的最大数量，轮换策略将删除根据标记时间戳的最旧文件。

### 限制
限制(limits)为分区或队列定义一组限制对象，以及它可以在分区或任何级别的队列上设置。
```yaml
limits:
  - limit: <描述>
  - limit: <描述>
```

限制对象是一个复杂的配置对象，它为一组用户和/或群组定义一个限制。
多个独立的限制可以设置为队列或分区上一个`limits`条目的一部分。
不属于限制设置的用户和/或群组将不受限制。

limits条目的示例：
```yaml
limits:
  - limit: <描述>
    users:
    - <用户名或"*">
    - <用户名>
    groups:
    - <群组名称或"*">
    - <群组名称>
    maxapplications: <1..最大值>
    maxresources:
      <资源名称1>: <0..最大值>[后缀]
      <资源名称2>: <0..最大值>[后缀]
```

队列限制的情况下，应用递归限制。
这意味着对`root`队列的限制是集群中用户或群组的总体限制。
因此，`root`队列限制也等同于`partition`限制。

limits参数：
* limit
* users
* groups
* maxapplications
* maxresources

_limit_参数是limits条目的可选描述。
除了使配置易于理解和可读之外，它不用于任何其他用途。

可以配置的_users_和_groups_可以是以下两种类型之一：
* 一个星号字符 "*" 
* users或groups的列表。

如果users或groups的条目包含超过1个条目，则它始终被视为users或groups的列表。
星号字符“*”为通配符，匹配所有用户或群组。
不允许在其他列表元素旁边指定星号字符。
列表中的重复条目将被忽略，并不会导致解析错误。

_maxapplications_是一个无符号整数值。
当_maxapplications_大于1，它允许您限制为配置的用户或群组运行的应用的数量。
不允许指定_maxapplications_为0，因为_maxapplications_为0时，隐含拒绝任何访问。
拒绝访问的规范应交由ACL条目处理。

_maxresources_参数可用于指定一个或多个资源的限制。
_maxresources_使用与队列的[resources](#资源)参数相同的语法。
未在列表中指定的资源不受限制。
资源限制可以设置为 0，这可以防止用户或群组请求指定的资源，即使队列或分区具有可用的特定资源也是如此。
不允许将总体资源限制指定为零，换言之，这意味着限制中指定的至少一个资源必须大于零。
如果资源在队列上不可用，则应使用队列定义上的最大资源。
指定一个实际上为零的限制，_maxapplications_ 为零并且所有资源限制为零，这是不允许的，并且会导致解析错误。
 
每个用户或群组都有一个限制，它*不是*所有用户或群组的组合限制。

举个例子：
```yaml
limit: "example entry"
maxapplications: 10
users:
- sue
- bob
```
在这种情况下，用户`sue`和`bob`都被允许运行10个应用。

### 资源
队列的resources条目可以为队列设置_guaranteed_和/或_maximum_资源，yunikorn会递归地检查资源限制。
leaf队列的资源使用量是为该队列分配的所有资源的总和。
parent队列的资源使用量是该parent队列下面所有队列，leaf和parent队列的资源使用量的总和。

root队列没有_guaranteed_的资源设置。
root队列的_max_资源限制自动等于集群大小。
如果root队列设置了任何限制，则会发生解析错误。
leaf队列在定义时不能设置任何资源限制。

配置后的_max_资源对可以在任何时间点分配给队列的所有分配的大小进行了硬性限制。
_max_资源可以设置为0，这使得资源对队列不可用。
_guaranteed_资源用于计算队列份额和分配期间，它用作决定将分配分配给哪个队列的输入之一。
抢占使用队列的_guaranteed_资源作为队列不能低于的基础。

基本的`resources` yaml条目：
```yaml
resources:
  guaranteed:
    <资源名称1>: <0..最大值>[后缀]
    <资源名称2>: <0..最大值>[后缀]
  max:
    <资源名称1>: <0..最大值>[后缀]
    <资源名称2>: <0..最大值>[后缀]
```
列表中未指定的资源不受限制，对于最大(max)资源，或在保证(guaranteed)资源的情况下保证。

可以为资源数量指定一个可选的后缀。
有效的国际单位制后缀是`k`、`M`、`G`、`T`、`P` 和 `E`，用于10的幂，以及`Ki`、`Mi`、`Gi`、`Ti`、 `Pi`和`Ei`表示2的幂。
此外，`vcore`类型的资源可能带有后缀`m`以表示millicores。 例如，`500m`是vcore的50%。
默认情况下，`memory`类型的单位以byte为单位进行解释。
所有其他资源类型都没有指定的基本单位。

注意，以上单位行为从yunikorn 1.0开始有效 
以前的版本将`memory`解释为1000000(百万)bytes的单位，将`vcore`解释为millicores。

### 子模板

子模板(child template)可以在父类型队列的队列层次结构中的任何级别来定义。
parent队列可以提供一个模板来定义它下面的动态leaf队列的行为。
如果parent队列定义了子模板，则没有子模板的parent队列会从其parent队列继承子模板。

模板中支持的配置如下所示。
1. application sort policy
2. max resources
3. guaranteed resources
4. max applications

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
               vcore: 1
               memory: 1G
             max:
               vcore: 20
               memory: 600G
         queues:
           - name: parent
             parent: true
             childtemplate:
               resources:
                 max:
                   vcore: 21
                   memory: 610G
           - name: notemplate
             parent: true
```
在这种情况下，`root.parent.sales`将直接使用parent队列`root.parent`的子模板。
相比之下，`root.notemplate.sales`将使用在队列`root`上设置的子模板，因为其parent队列 `root.notemplate` 从队列`root`继承了子模板。

[已弃用] 如果您的集群依赖于动态叶队列可以从父级继承`application.sort.policy`的旧行为(由[YUNIKORN-195](https://issues.apache.org/jira/browse/YUNIKORN-195)引入)，请迁移到模板。
旧的行为将在未来的版本中被删除。
