---
id: events
title: Events
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

## Upcoming Meetup

None planned at this moment, check for updates later...

---
## Past Meetups

**4:30pm - 6:00pm, PST, 20 October 2022**

Presentations and recording links located [below](#past-conference--meetup-recordings)

We are hosting an Apache YuniKorn meetup on Thursday, 20 October 2022. Come and join us!
This is the first hybrid on-line and in-person meetup for Apache YuniKorn.

A lot has changed since our last meetup a little over 6 months ago.
We since then have graduated to an Apache TLP, released v1.0.0 and two minor releases as a follow-up.
We had multiple presentations at: KubeCon Europe 2022, VISA Meetup and ApacheCON 2022.
This is just a partial list of all that has happened and is going to happen.
 
To add this event to your Google calendar [click here].
The invite includes a link for joining us virtually [using zoom webinar].

We have the following agenda lined up:  
1. **YuniKorn @ Pinterest**  
Speaker : Rainie, Pinterest  
Abstract:
Spark on YARN is used for production workloads.
Using Apache YuniKorn we try to move from YARN to Kubernetes.
A path of testing, comparing and changing at multiple levels.
2. **ApacheCON and YuniKorn : Feedback**  
Speaker : Wilfred, Cloudera  
Abstract:
As a community we delivered two talks at ApacheCON NA.
How did we do and what was the feedback on our two talks.
Cloud native also had its own track: some observations from other talks.
3. **YuniKorn roadmap**  
Speaker : Wilfred / Craig, Cloudera  
Abstract:
For YuniKorn 1.2 we have a roadmap defined around User Quotas, Application Priority and a K8s upgrade. 
Is that all we want and need. Do we want to add other things, and what do we want to do after this release?  

There will also plenty of time to discuss community related things that are not on the agenda.

---
**4:30pm - 5:30pm, PST, Feb 16, 2022**

We are hosting an Apache YuniKorn (Incubating) meetup on Wednesday February 16. Come join us! Since our first meetup held in November last year, lots of new development has happened in the community. We are excited to have three talks lined up! Add this event to your calendar: [calendar]

Erica Lin, Luna Xu, and Sean Gorsky from Sync Computing will present their work on Spark autotuner and orchestrator.
Description:
Efficiently managing the infrastructure and schedules of thousands of data pipelines in multi-tenant and heterogeneous environments is a daunting task. Poor application tuning, resource allocation, and scheduling can lead to exorbitant costs on the cloud, sluggish performance, and failed jobs due to the intractable infrastructure search space. Addressing each of these codependent issues separately also often doesn't lead to the best results overall. Sync Computing will share how their autotuner and orchestrator addresses these issues jointly as a single optimization problem. As a result, the solution offers globally optimized Spark configurations, resource provisioning, and job scheduling with configurable optimization goals, enabling a seamless user experience of running DAG workflows in the cloud. We experimentally demonstrate on AWS up to 77% cost savings or 45% performance acceleration of a Spark and Airflow DAG. Simulations of our solution on a multi-day Alibaba cloud trace resulted in a 57% reduction in total DAG completion time for their batch workloads. This work could be complementary to Yunikorn and we would like to discuss potential integration strategies with the community.

Craig Condit from Cloudera will talk about the latest YuniKorn release v0.12.2 and offer a glimpse of what the upcoming v1.0 release has in store.
Description:
v0.12.2 release offers a host of new features and bug fixes. Specifically, the admission controller implementation has been refactored to enable the YuniKorn scheduler to be seamless maintained and upgraded. In the upcoming v1.0 release, we will witness a major milestone of the YuniKorn project. An exciting feature is a new mode of deployment based on the Kubernetes Scheduling Framework, which offers better compatibility with the default scheduler and makes it easier for new users to try out YuniKorn.

Tingyao Huang and Yuteng Chen are both YuniKorn committers. They have done extensive performance benchmarking using the latest YuniKorn codebase. Their results showed convincing throughput advantages of YuniKorn compared to the default scheduler.

---
**4:30pm - 6:00pm, PST, Nov 18, 2021**

**Wilfred Spiegelenburg** presented a session to introduce the latest status in the YuniKorn community.

_Abstract_: Apache YuniKorn (Incubating) has released v0.11 earlier this year with a number of new features and improvements
like Gang scheduling, REST API enhancements and Kubernetes 1.19 support. In a month, we are planning the major
v1.0.0 release with Kubernetes 1.20 & 1.21 support, improved node sorting and numerous small fixes & enhancements! In this meetup, we will deep dive into the implementation of Gang scheduling behind the use of temporary
placeholder pods on Kubernetes, significant performance improvement with simplified scheduler core code and
a new node sorting algorithm. Please find all the topics for this meetup [here](https://drive.google.com/file/d/1cbT3i6_kSvrvlj4M7OyNIvXohVrGRiEl/view?usp=sharing). 

----

## Past Conference & Meetup Recordings

- Apache YuniKorn Meetup: [October 2022](https://youtu.be/l76NByMersg) | [Pinterest presentation](https://drive.google.com/file/d/1sSXRNx_ndk4mWaCICjtbddjoSUYN9TV7/view?usp=sharing) | [Cloudera presentation](https://drive.google.com/file/d/14jqfDNpCTTQr0R2ZBrghn-WGFBR89KI7/view?usp=sharing)
- VISA Data Meetup: [Apache YuniKorn scheduling Apache Spark on Kubernetes](https://web.cvent.com/event/9ceb73f1-4ce7-480e-95ed-fe65dea09cc4/websitePage:e6b9cca5-1c3b-4b7a-99e7-62c045b1ce26?i=bn_TynKrfUao8DzBYW3XwA&locale=en-US) :busts_in_silhouette: Wilfred Spiegelenburg
- KubeCon Batch & HPC day 2022: [Apache YuniKorn A Kubernetes Scheduler Plugin for Batch Workloads](https://www.youtube.com/watch?v=cQD_jwA4fqo) :busts_in_silhouette: Wilfred Spiegelenburg, Craig Condit 
- ApacheCon 2021: [Next Level Spark on Kubernetes with Apache YuniKorn (Incubating)](https://youtu.be/gOST-iT-hj8) :busts_in_silhouette: Weiwei Yang, Chaoran Yu
- ApacheCon Asia 2021: [State Of The Union With Apache Yunikorn (Incubating) - Cloud Native Scheduler For Big Data Usecases](https://www.youtube.com/watch?v=c9UYxzqVMeg)  :busts_in_silhouette: Julia Kinga Marton, Sunil Govindan
- Future of Data Meetup: [Apache YuniKorn: Cloud-native Resource Scheduling](https://www.youtube.com/watch?v=j-6ehu6GrwE) :busts_in_silhouette: Wangda Tan, Wilfred Spiegelenburg
- ApacheCon 2020: [Integrate Apache Flink with Cloud Native Ecosystem](https://youtu.be/4hghJCuZk5M) :busts_in_silhouette: Yang Wang, Tao Yang
- Spark+AI Summit 2020: [Cloud-Native Spark Scheduling with YuniKorn Scheduler](https://www.youtube.com/embed/ZA6aPZ9r9wA) :busts_in_silhouette: Gao Li, Weiwei Yang
- Flink Forward 2020: [Energize multi-tenant Flink on K8s with YuniKorn](https://www.youtube.com/embed/NemFKL0kK9U) :busts_in_silhouette: Weiwei Yang, Wilfred Spiegelenburg


---
## Demo Videos

Please subscribe to [YuniKorn Youtube Channel](https://www.youtube.com/channel/UCDSJ2z-lEZcjdK27tTj_hGw) to get notification about new demos!
- [Running YuniKorn on Kubernetes - a 12 minutes Hello-world demo](https://www.youtube.com/watch?v=cCHVFkbHIzo)
- [YuniKorn configuration hot-refresh introduction](https://www.youtube.com/watch?v=3WOaxoPogDY)
- [Yunikorn scheduling and volumes on Kubernetes](https://www.youtube.com/watch?v=XDrjOkMp3k4)
- [Yunikorn placement rules for applications](https://www.youtube.com/watch?v=DfhJLMjaFH0)
- [Federated K8s compute pools with YuniKorn](https://www.youtube.com/watch?v=l7Ydg_ZGZw0&t)

If you are a YuniKorn evangelist, and you have public conference talks, demo recording that related to YuniKorn.
Please submit a PR to extend this list!
