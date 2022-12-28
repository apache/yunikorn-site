---
id: troubleshooting
title: 故障排除
---

<!--
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 -->

## 调度日志(Scheduler logs)

### 检索调度日志

调度器会将日志写入stdout/stderr，docker容器就会将这些日志重新导向到节点的本地位置，你可以从[这里](https://docs.docker.com/config/containers/logging/configure/)读到更多的文档，这些日志可以通过[kuberctl logs](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs)检索。如：

```shell script
//获取调度的pod
kubectl get pod -l component=yunikorn-scheduler -n yunikorn
NAME READY STATUS RESTARTS AGE
yunikorn-scheduler-766d7d6cdd-44b82 2/2 Running 0 33h

//检索日志
kubectl logs yunikorn-scheduler-766d7d6cdd-44b82 yunikorn-scheduler-k8s -n yunikorn
```

在大多数的情况下，这个命令没有办法获取所有的日志，因为调度程序的日志数量庞大，您需要为集群设置[日志级别](https://kubernetes.io/docs/concepts/cluster-administration/logging/#cluster-level-logging-architectures)。推荐的设置方式是利用[fluentd](https://www.fluentd.org/)在外部储存(例如s3)上持久的收集日志。

### 设定日志级别

###
:::note
我们建议通过REST API来调整日志级别，如此以来我们不需要每次修改级别时重新启动调动程序的pod。但是透过编辑部署配置来设定日志级别时，需要重新启用调度程序的pod，因此强烈不建议这么做。
:::

停止调度器：
```shell script
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=0
```

使用vim编辑部署配置：
```shell script
kubectl edit deployment yunikorn-scheduler -n yunikorn
```

在容器模板的`env`字段中加入`LOG_LEVEL`。例如将`LOG_LEVEL`设置为0会将日志纪录的级别设置为`INFO`。

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
…
spec:
template:
…
spec:
containers:
- env:
- name: LOG_LEVEL
value: '0'
```

启用调度器：
```shell script
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=1
```

可使用的日志级别：

|  值   	| 日志级别        	|
|:-----:	|:-------------:	|
|   -1  	|     DEBUG     	|
|   0   	|      INFO     	|
|   1   	|      WARN     	|
|   2   	|     ERROR     	|
|   3   	|     DPanic    	|
|   4   	|     Panic     	|
|   5   	|     Fatal     	|

## Pods卡在`Pending`状态

如果Pod卡在Pending状态，则意味着调度程序找不到分配Pod的节点。造成这种情况有以下几种可能：

### 1.没有节点满足pod的放置要求

可以在Pod中配置一些放置限制，例如[节点选择器(node-selector)](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector)、[亲合/反亲合性(affinity/anti-affinity)](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)、对节点的[污点(taints)](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)没有一定的容忍度等。若要修正此类问题，你可以通过以下方法观察pod：

```shell script
kubectl describe pod <pod名称> -n <命名空间>
```

pod事件中包含预测失败，而这解释了为什么节点不符合分配条件

### 2.队列的可用资源不足

如果队列的可用资源不足，Pod将等待队列资源。检查队列是否还有空间可以给Pending pod的方法有以下几种：

1 ) 从Yunikorn UI检查队列使用情况

如果你不知道如何访问UI，可以参考[这里](../get_started/get_started.md#访问-web-ui)的文档。在`Queues`页面中，寻找Pod对应到的队列。你将能够看到队列中剩馀的可用资源。

2 ) 检查pod事件

运行`kubectl describe pod`以获取pod事件。如果你看到类似以下的事件：`Application <appID> does not fit into <队列路径> queue`。则代表pod无法分配，因为队列的资源用完了。

当队列中的其他Pod完成工作或被删除时，代表目前Pending的pod能得到分配，如果Pod依旧在有足够的剩馀资源下，保持pending状态，则可能是因为他正在等待集群扩展。

## 获取完整的状态

Yunikorn状态储存中，包含了对每个进程中每个对象的状态。透过端点来检索，我们可以有很多有用的信息，举一个故障排除的例子：分区列表、应用程序列表(包括正在运行的、已完成的以及历史应用程序的详细信息)、节点数量、节点利用率、通用集群信息、集群利用率的详细信息、容器历史纪录和队列信息。

状态是Yunikorn提供的用于故障排除的宝贵资源。

有几种方法可以获得完整的状态：
### 1.调度器URL

步骤：
*在浏览器中打开Yunikorn UI，且在URL中编辑：
*将`/#/dashboard`取代为`/ws/v1/fullstatedump`，(例如，`http://localhost:9889/ws/v1/fullstatedump`)
*按下回车键。

透过这个简单的方法来观看即时且完整的状态。

### 2.调度器的REST API

使用以下的调度器REST API，能够让我们看到Yunikorn的完整状态。

`curl -X 'GET'http://localhost:9889/ws/v1/fullstatedump-H 'accept: application/json'`

有关储存状态的更多信息，可以参阅[检索完整状态](api/scheduler.md#retrieve-full-state-dump)的文档。

## 重启调度器
:::note
最好的故障排除方法是─把「重启调度器」当作完全没有其他方法之下的最后一步，他不应该在搜集所有日志和状态之前使用。
:::

Yunikorn可以在重启之后恢复其状态。Yunikorn调度器的pod作为deployment部署。我们可以透过`scale`来增加和减少副本数量来重启Yunikorn调度器，方法如下：

```shell script
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=0
kubectl scale deployment yunikorn-scheduler -n yunikorn --replicas=1
```

## 成组调度
### 1.没有占位符被创建，且app处于pending状态
*原因*：这通常是因为应用程序被调度气拒绝，因此没有一个pod被调度。

导致拒绝的常见原因有：

1)任务群组(taskGroups)定义无效。调度程序在应用程序被提交时会进行健全性检查，以确保正确定义所有任务群组，如果这些信息的格式不正确，调度程序将拒绝该应用程序

2)任务群组中定义的总最小资源量大于队列的最大资源量，因此调度程序拒绝该应用程序，因为队列的资源量无法满足它。可以通过检查pod事件中的相关消息，或调度器日志来找到更多详细的错误信息。

*解决方案*：更正任务群组的定义并重新提交应用程序。

### 2.有些占位符没有被分配
*原因*：占位符也会消耗资源，如果不能全部分配，通常是队列或者集群没有足够的资源分配给它们。在这种情况下，占位符将在一定时间后被清理，该时间由调度策略参数─`placeholderTimeoutInSeconds`所定义。

*解决方案*：如果占位符超时了，目前的app将会转为failed状态，无法再被调度。如果您愿意等待更长的时间，可以增加占位符超时的值。将来可能会添加倒退策略以提供重试，而不是使应用程序失败。

### 3.有些占位符没有被交换
*原因*：这通常代表应用程序的pod少于任务群组中定义的最小成员数(`minMembers`)

*解决方案*：检查任务群组字段中的`minMember`并确保其设置正确。`minMember`可以小于实际的pod数，设置大于实际pod数是无效的。

### 4.应用程序终止时不会清除占位符
*原因*：所有占位符都会设置[ownerReference](https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/#owners-and-dependents)到应用程序的第一个真实的pod，或控制器参考。如果无法清理占位符，则意味着垃圾回收(garbage collector)的机制不正常。

*解决方案*：检查占位符的`ownerReference`和Kubernetes中的垃圾收集器。

## 仍然遇到问题？
没问题！Apache Yunikorn社区将很乐意提供帮助。您可以通过以下选项联系社区：

1. 将您的问题发布到dev@yunikorn.apache.org。
2. 加入[YuniKorn slack](https://join.slack.com/t/yunikornworkspace/shared_invite/enQtNzAzMjY0OTI4MjYzLTBmMDdkYTAwNDMwNTE3NWVjZWE1OTczMWE4NDI2Yzg3MmEyZjUyYTZlMDE5M2U4ZjZhNmYyNGFmYjY4ZGYyMGE)并将您的问题发布到`#yunikorn-user`频道。
3. 加入[社区会议](http://yunikorn.apache.org/community/get_involved#community-meetings)并直接与社区成员交谈。