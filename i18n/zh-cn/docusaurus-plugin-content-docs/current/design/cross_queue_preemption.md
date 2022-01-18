---
id: cross_queue_preemption
title: 跨队列抢占
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

## 问题:

根据我们从 YARN Scheduler 抢占中吸取的教训。

**以下是最糟糕的事情:** 

- 抢占是一把“猎枪”，而不是“狙击手”，当抢占决定作出时，没有人知道抢占的资源是否会进入请求队列/应用程序/用户。
- 抢占逻辑和分配是不同的，我们必须实现（并模仿）我们在调度器分配逻辑中所做的事情。

**以下是最好的事情:**

- 抢占很快（多亏了“猎枪”），回收数千个容器只需要1秒。
- 我们已经了解处理DRF、多个抢占策略（队列间/队列内、散弹枪/外科抢占等）是多么痛苦，并且我们已经开发了一些不错的逻辑来确保更好的模块化和插件能力。

## 回答一些有关设计/实现选择的问题

**1\. 我们真的想要抢占延迟吗？（或者我们只是想控制节奏）**

在CS架构中，我们有抢占延迟，即在抢占候选中选择需要杀死的进程，等待一定时间后再杀死它。

抢占延迟的目的是：
a. 为应用程序留出时间，以便他们可以为坏事情的发生做好准备（不幸的是，至少从我们所知道的情况来看，没有一款应用程序能为这些问题做任何事情）。
b. 控制抢占速度。

在实践中，我们发现例如集群状态不断变化等情况会引起很多问题，很难保证准确的抢占。

**建议:**

消除抢占延迟，保持控制抢占速度的逻辑（例如 ```yarn.resourcemanager.monitor.capacity.preemption
.total_preemption_per_round```）。
我们可以通过抢占来进行资源的分配。
这并不意味着容器将在发出抢占权后立即停止。
相反，RM可以控制向容器发送信号和终止容器之间的延迟。
比如在K8s中终止Pod：https://kubernetes.io/docs/concepts/workloads/pods/pod/#termination-of-pods

**2\. 我们是想对每个调度逻辑进行抢占，还是可以周期性地进行抢占？**

在CS架构中，我们定期运行抢占逻辑，比如每1秒或3秒。

因为抢占逻辑涉及一些复杂的逻辑，比如计算队列/应用程序的共享。
在进行精确抢占时，我们可能需要扫描节点以寻找抢占的候选节点。
考虑到这一点，我们建议定期进行抢占操作。
但需要注意的是，我们需要尽可能多地使用代码来抢占内部分配，否则会有太多的复杂逻辑，未来将来很难维护。


**3\. 抢占成本与功能**

我们发现增加抢占成本是有帮助的，例如容器生存时间、优先级、容器类型。
它可以是一个成本函数（返回一个数值），也可以是一个比较器（用于比较抢占请求的两个分配情况）。

## 伪代码

分配逻辑（每个分配周期调用）

```
input:
  - nAlloc, allocate N allocations for this allocation cycle.

for partition: 
  askCandidates := findAskCandidates(nAlloc, preemption=false)
  
  allocated, failed_to_allocated := tryAllocate(askCandidates);
  
  send-allocated-to-cache-to-commit;
  
  update-missed-opportunity (allocated, failed_to_allocated);
  
  nAlloc -= len(allocated)   
```

抢占逻辑（每个抢占周期调用）

```
// It has to be done for every preemption-policy because calculation is different.
for preemption-policy: 
  preempt_results := policy.preempt()
  for preempt_results: 
     send-preempt-result-to-cache-to-commit;
     updated-missed-opportunity (allocated)
```

抢占策略内部

```
inter-queue-preempt-policy:
  calculate-preemption-quotas;
  
  for partitions:
    total_preempted := resource(0);
    
    while total_preempted < partition-limited:
      // queues will be sorted by allocating - preempting
      // And ignore any key in preemption_mask
      askCandidates := findAskCandidates(N, preemption=true)
      
      preempt_results := tryAllocate(askCandidates, preemption=true);
      
      total_preempted += sigma(preempt_result.allocResource)
      
      send-allocated-to-cache-to-commit;
      
      update-missed-opportunity (allocated, failed_to_allocated);
      
      update-preemption-mask(askCandidates.allocKeys - preempt_results.allocKeys)
```