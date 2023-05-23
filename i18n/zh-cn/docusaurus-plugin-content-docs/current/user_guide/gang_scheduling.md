---
id: gang_scheduling
title: 分组调度
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

##  什么是分组调度

当分组调度被启用时，YuniKorn 只在以下情况下调度应用程序
应用程序的最小资源请求能够得到满足时才会调度。否则，应用程序
将在队列中等待。应用程序被排在层次队列中、
启用分组调度后，每个资源队列都被分配有
在保证最小资源的情况下，每个资源队列都被分配了最大数量的应用程序并发运行。

![分组调度](./../assets/gang_scheduling_intro.png)

## 启用分组调度

启用分组调度不需要在集群范围内进行配置。
调度器会主动监控每个应用的元数据，如果该应用包含了
一个有效的任务组定义，它就会被认为是所需的分组调度。

:::info 任务组
一个任务组是一个应用程序中的任务 "群组"，这些任务具有相同的资源概况
和相同的放置限制。它们被认为是同质化的请求，在调度器中可以被视为
在调度器中被当作同一类请求处理。
:::

### 前提

对于运行支持调度的应用程序的队列，队列排序策略应该被设置为 "FIFO"。
要配置队列排序策略，请参考文档：[应用程序排序](user_guide/sorting_policies.md#应用程序排序)。

#### 为什么要使用 "FIFO" 排序策略？

当分组调度被启用时，调度器会主动为每个应用程序保留资源。
如果队列排序策略不是基于FIFO（StateAware 是基于 FIFO 的排序策略）、
调度器可能会为每个应用保留部分资源并导致资源分割问题。

#### "StateAware" 排序策略的副作用

我们不建议使用 `StateAware`，尽管它是一个基于 FIFO 的策略。第一个 pod 的失败或者该 pod 的初始化时间过长都会使处理过程变慢。
当驱动在请求执行器之前进行大量的预处理时，尤其是 Spark。
在这些情况下，`StateAware` 超时会使处理速度减慢到每次超时只有一个应用程序。
这实际上会推翻群组的保留，并导致减速和过度使用资源。

### 应用程序配置

在 Kubernetes 上，YuniKorn 通过从单个pod加载元数据来发现应用，应用的第一个pod
被要求附上一份完整的应用元数据副本。如果应用程序没有关于第一个或第二个pod的任何注释，
那么所有的pod都需要携带相同的 taskGroups 信息。分组調度需要 taskGroups 的定义，
可以通过 pod 注解来指定。所需的字段是：

| 注释 | 价值 |
|-----|------|
| yunikorn.apache.org/task-group-name 	         | 任务组名称，在应用程序中必须是唯一的。                                  |
| yunikorn.apache.org/task-groups                | 任务组的列表，每一项都包含了为该任务组定义的所有信息。                     |
| yunikorn.apache.org/schedulingPolicyParameters | 可选。一个任意的键值对来定义调度策略参数。请阅读[调度策略参数](#调度策略参数)  |

#### 需要多少个任务组？

这取决于这个应用程序向 K8s 请求多少不同类型的 pod。一个任务组是一个应用程序中的任务 "群组"、
这些任务具有相同的资源概况和相同的放置限制。它们被认为是同质的
在调度器中可以被视为同类的请求。以 Spark 为例，每个作业都需要有2个任务组、
一个用于driver pod，另一个用于 executor pods。

#### 如何定义任务组？

任务组的定义是应用程序的真实pod定义的副本，像资源、节点选择器、容忍度
和亲和力应该与真正的pod相同。这是为了确保调度器能够以准确的pod规格保留资源。
确切正确的pod规范。

#### 调度策略参数

调度策略相关的可配置参数。在pod的注释中以下列格式应用这些参数：

```yaml
annotations:
   yunikorn.apache.org/schedulingPolicyParameters: "PARAM1=VALUE1 PARAM2=VALUE2 ..."
```

目前，支持以下参数：

`placeholderTimeoutInSeconds`

默认值： *15分钟*。
这个参数定义了预约超时，即调度器在放弃分配所有占位符之前应该等待多长时间。
当调度器*分配第一个占位器pod*时，超时计时器开始计时。这确保了如果调度器
无法调度所有的占位荚，它最终会在一定的时间后放弃。这样，资源可以被
释放出来，供其他应用程序使用。如果没有占位符可以被分配，这个超时就不会启动。为了避免占位符
pods永远卡住，请参考 [故障排除](troubleshooting.md#成组调度) 了解解决方案。

`gangSchedulingStyle`

有效值： *Soft*, *Hard*

默认值：*Soft*.
这个参数定义了当应用程序由于占位符 pod 分配而遇到分组问题时的后退机制。
更多细节见[分组调度风格](#分组调度风格)部分

更多的调度参数将被添加，以便在调度应用程序时提供更多的灵活性。

#### 示例

下面的例子是一个工作的yaml文件。这个工作启动了2个 pod，每个 pod 睡眠时间为 30 秒。
在 pod 规范中值得注意的变化是 *spec.template.metadata.annotations*，在这里我们定义了 `yunikorn.apache.org/task-group-name
和 `yunikorn.apache.org/task-groups` 。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: gang-scheduling-job-example
spec:
  completions: 2
  parallelism: 2
  template:
    metadata:
      labels:
        app: sleep
        applicationId: "gang-scheduling-job-example"
        queue: root.sandbox
      annotations:
        yunikorn.apache.org/task-group-name: task-group-example
        yunikorn.apache.org/task-groups: |-
          [{
              "name": "task-group-example",
              "minMember": 2,
              "minResource": {
                "cpu": "100m",
                "memory": "50M"
              },
              "nodeSelector": {},
              "tolerations": [],
              "affinity": {}
          }]
    spec:
      schedulerName: yunikorn
      restartPolicy: Never
      containers:
        - name: sleep30
          image: "alpine:latest"
          command: ["sleep", "30"]
          resources:
            requests:
              cpu: "100m"
              memory: "50M"
```

当这项工作提交给 Kubernetes 时，将使用同一模板创建2个pod，它们都属于一个任务组：
*"task-group-example"*。 YuniKorn将创建2个占位符pod，每个都使用任务组定义中指定的资源。
当所有2个占位符分配完毕后，调度器将使用占位符保留的位置来绑定真正的2个睡眠pods。

如果有必要，你可以添加多个任务组，每个任务组由任务组名称标识、
通过设置任务组名称，需要将每个真实的pod与一个预先定义的任务组进行映射。注意、
任务组名称只要求在一个应用程序中是唯一的。


### 启用Spark作业的Gang调度

每个Spark作业都运行2种类型的pod，驱动和执行器。因此，我们需要为每个作业定义2个任务组。
驱动器pod的注释看起来像：

```yaml
Annotations:
  yunikorn.apache.org/schedulingPolicyParameters: “placeholderTimeoutSeconds=30”
  yunikorn.apache.org/taskGroupName: “spark-driver”
  yunikorn.apache.org/taskGroup: “
    TaskGroups: [
     {
       Name: “spark-driver”,
       minMember: 1,
       minResource: {
         Cpu: 1,
         Memory: 2Gi
       },
       Node-selector: ...,
       Tolerations: ...,
       Affinity: ...
     },
      {
        Name: “spark-executor”,
        minMember: 10, 
        minResource: {
          Cpu: 1,
          Memory: 2Gi
        }
      }
  ]
  ”
```

:::note
任务组的资源必须考虑到Spark驱动和执行器的内存开销。
参见 [Spark documentation](https://spark.apache.org/docs/latest/configuration.html#application-properties) 以了解如何计算这些数值的细节。
:::

对于所有的执行者 pod，

```yaml
Annotations:
  # 任务组字段中定义的名称相匹配
  # 在任务组字段中定义
  yunikorn.apache.org/taskGroupName: “spark-executor”
```

一旦工作被提交给调度器，工作就不会被立即调度。
相反，在实际启动驱动/执行器之前，调度器将确保它获得最小的资源。

## 分组调度风格

有2种分组调度方式支持，分别是 Soft 和 Hard。它可以在每个应用层面进行配置，以定义应用在分组调度失败时的行为。

- `Hard Style`：当使用这种风格时，我们将有初始行为，更确切地说，如果应用程序不能根据分组调度规则进行调度，并且超时，它将被标记为失败，而不会重新尝试调度。
- `Soft Style`：当应用程序不能被分组调度时，它将退回到正常的调度，并使用非分组调度策略来实现最佳努力的调度。当这种情况发生时，应用程序将过渡到恢复状态，所有剩余的占位符 pod 将被清理掉。

**使用的默认样式**： ``Soft。

**启用一个特定的风格**：可以通过在应用程序定义中设置'gangSchedulingStyle'参数来改变风格，即 Soft 或 Hard。

#### Example

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: gang-app-timeout
spec:
  completions: 4
  parallelism: 4
  template:
    metadata:
      labels:
        app: sleep
        applicationId: gang-app-timeout
        queue: fifo
      annotations:
        yunikorn.apache.org/task-group-name: sched-style
        yunikorn.apache.org/schedulingPolicyParameters: "placeholderTimeoutInSeconds=60 gangSchedulingStyle=Hard"
        yunikorn.apache.org/task-groups: |-
          [{
              "name": "sched-style",
              "minMember": 4,
              "minResource": {
                "cpu": "1",
                "memory": "1000M"
              },
              "nodeSelector": {},
              "tolerations": [],
              "affinity": {}
          }]
    spec:
      schedulerName: yunikorn
      restartPolicy: Never
      containers:
        - name: sleep30
          image: "alpine:latest"
          imagePullPolicy: "IfNotPresent"
          command: ["sleep", "30"]
          resources:
            requests:
              cpu: "1"
              memory: "1000M"

```

## 验证配置

为了验证配置是否已经完全正确，请检查以下事项：
1. 当一个应用程序被提交时，验证预期的占位符数量是否被调度器创建。
如果你定义了两个任务组，一个是minMember 1，另一个是minMember 5，这意味着我们期望在任务提交后有6个占位符被创建。
被创建。
2. 验证占位符的规格是否正确。每个占位符都需要有与同一任务组中的真实pod相同的信息。
检查领域包括：命名空间、pod资源、节点选择器、容忍度和亲和力。
3. 验证占位符可以分配到正确的节点类型上，并验证真正的pod是通过替换占位符pod而启动的。

## 故障排除

请参阅启用帮派调度时的故障排除文档 [這裡](troubleshooting.md#成组调度)
