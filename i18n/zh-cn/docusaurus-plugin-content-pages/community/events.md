---
id: events
title: 事件
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

即将举行的会议
---

加入我们 **4:30pm - 5:30pm，太平洋标准时间，2022 年 2 月 16 日**

我们将于2月16日星期三举办 Apache YuniKorn (Incubating) meetup。快来加入我们吧！自从我们去年11月举行第一次 meetup 以来，社区有了许多新的进展。我们很高兴能安排三场演讲！将此活动添加到您的日历：[:calendar:](https://calendar.google.com/calendar/u/0/r/eventedit/copy/N21jYmxiYWx0c211M2pvMTIydDZxZ2s5ajAgYXBhY2hlLnl1bmlrb3JuQG0/Y2hlbnlhemhhbmdjaGVueWFAZ21haWwuY29t?cid=YXBhY2hlLnl1bmlrb3JuQGdtYWlsLmNvbQ)

来自 Sync Computing 的 Erica Lin、Luna Xu 和 Sean Gorsky 将展示他们在 Spark autotuner 和 orchestrator 方面的工作。  
说明：  
在多租户和异构环境中有效管理数千条数据管道的基础架构和计划是一项艰巨的任务。由于棘手的基础架构搜索空间，糟糕的应用程序调优、资源分配和调度可能导致云计算成本过高、性能下降和作业失败。单独解决这些相互依赖的问题中的每一个通常也不会导致整体上的最佳结果。Sync Computing 将分享他们的 autotuner 和 orchestrator 如何将这些问题作为一个单一的优化问题来共同解决。因此，该解决方案提供了全局优化的 Spark 配置、资源供应和作业调度，具有可配置的优化目标，实现了在云中运行 DAG 工作流的无缝用户体验。我们在 AWS 上通过实验证明 Spark 和 Airflow DAG 最多可节省 77% 的成本或 45% 的性能加速。我们的解决方案在多天的阿里云上的追踪模拟结果上显示，批处理工作负载的总 DAG 完成时间减少了57%。这项工作可能是对 Yunikorn 的补充，我们想与社区讨论潜在的整合策略。

来自 Cloudera 的 Craig Condit 将讨论有关最新的 YuniKorn v0.12.2 的情况并简要介绍即将发布的 v1.0 版本的内容。  
说明：  
v0.12.2 版本提供了许多新的功能和错误修复。具体来说，准入控制器的实现已被重构，从而使 YuniKorn 调度器能够无缝维护和升级。在即将发布的 v1.0 版本中，我们将见证 YuniKorn 项目的一个重要里程碑。一个令人兴奋的特性是基于 Kubernetes 调度框架的新部署模式，它提供了与默认调度器更好的兼容性，并使新用户更容易试用 YuniKorn。

Tingyao Huang 和 Yuteng Chen 都是 YuniKorn 的 committers。他们使用最新的 YuniKorn 代码进行了广泛的性能基准测试。他们的结果表明，与默认的调度器相比，YuniKorn 具有令人信服的吞吐量优势。

----

过去的Meetup
---

**4:30pm - 6:00pm, 太平洋标准时间, 2021 年 11 月 18 日**

**Wilfred Spiegelenburg** 举办了一场介绍 YuniKorn 社区最新状态的会议。

_摘要_: Apache YuniKorn (Incubating) 今年早些时候发布了 v0.11 版本，其中包含了许多新功能和改进，比如 Gang scheduling、REST API 增强和 Kubernetes 1.19 支持。
在一个月内，我们计划发布主要的 v1.0.0 版本，它将支持 Kubernetes 1.20 和 1.21、改进的节点排序以及大量的小修复和增强功能！
在本次会议中，我们将深入探讨在 Kubernetes 上使用临时占位 pod 背后的 Gang scheduling 实现、通过简化的调度器核心代码和新的节点排序算法显著提高性能。
请在 [此处](https://docs.google.com/document/d/1-NP0J22-Gp3cZ_hfKyA9htXJw7tlk-BmljF-7CBJg44) 找到本次会议的所有主题。

----

过去的会议
---

- ApacheCon 2021: [Next Level Spark on Kubernetes with Apache YuniKorn (Incubating)](https://youtu.be/gOST-iT-hj8) :busts_in_silhouette: Weiwei Yang, Chaoran Yu
- ApacheCon Asia 2021: [State Of The Union With Apache YuniKorn (Incubating) - Cloud Native Scheduler For Big Data Usecases](https://www.youtube.com/watch?v=c9UYxzqVMeg)  :busts_in_silhouette: Julia Kinga Marton, Sunil Govindan
- Future of Data Meetup: [Apache YuniKorn: Cloud-native Resource Scheduling](https://www.youtube.com/watch?v=j-6ehu6GrwE) :busts_in_silhouette: Wangda Tan, Wilfred Spiegelenburg
- ApacheCon 2020: [Integrate Apache Flink with Cloud Native Ecosystem](https://youtu.be/4hghJCuZk5M) :busts_in_silhouette: Yang Wang, Tao Yang
- Spark+AI Summit 2020: [Cloud-Native Spark Scheduling with YuniKorn Scheduler](https://www.youtube.com/embed/ZA6aPZ9r9wA) :busts_in_silhouette: Gao Li, Weiwei Yang
- Flink Forward 2020: [Energize multi-tenant Flink on K8s with YuniKorn](https://www.youtube.com/embed/NemFKL0kK9U) :busts_in_silhouette: Weiwei Yang, Wilfred Spiegelenburg


演示视频
---

请订阅 [YuniKorn Youtube Channel](https://www.youtube.com/channel/UCDSJ2z-lEZcjdK27tTj_hGw) 获取有关新演示的通知！
- [Running YuniKorn on Kubernetes - a 12 minutes Hello-world demo](https://www.youtube.com/watch?v=cCHVFkbHIzo)
- [YuniKorn configuration hot-refresh introduction](https://www.youtube.com/watch?v=3WOaxoPogDY)
- [YuniKorn scheduling and volumes on Kubernetes](https://www.youtube.com/watch?v=XDrjOkMp3k4)
- [YuniKorn placement rules for applications](https://www.youtube.com/watch?v=DfhJLMjaFH0)
- [Federated K8s compute pools with YuniKorn](https://www.youtube.com/watch?v=l7Ydg_ZGZw0&t)

如果您是 YuniKorn 的布道者，并且您有公开的会议演讲、与 YuniKorn 相关的演示录音，请提交 PR 以扩展此列表！
