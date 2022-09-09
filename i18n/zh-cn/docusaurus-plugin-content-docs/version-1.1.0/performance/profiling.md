---
id: profiling
title: 分析
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

使用[pprof](https://github.com/google/pprof)做CPU，Memory profiling可以帮助你了解YuniKorn调度器的运行状态。YuniKorn REST服务中添加了分析工具，我们可以轻松地从HTTP端点检索和分析它们。

## CPU 分析

在这一步，确保你已经运行了YuniKorn，它可以通过`make run`命令从本地运行，也可以部署为在K8s内运行的pod。 然后运行

```
go tool pprof http://localhost:9080/debug/pprof/profile
```

配置文件数据将保存在本地文件系统中，一旦完成，它就会进入交互模式。 现在您可以运行分析命令，例如

```
(pprof) top
Showing nodes accounting for 14380ms, 44.85% of 32060ms total
Dropped 145 nodes (cum <= 160.30ms)
Showing top 10 nodes out of 106
      flat  flat%   sum%        cum   cum%
    2130ms  6.64%  6.64%     2130ms  6.64%  __tsan_read
    1950ms  6.08% 12.73%     1950ms  6.08%  __tsan::MetaMap::FreeRange
    1920ms  5.99% 18.71%     1920ms  5.99%  __tsan::MetaMap::GetAndLock
    1900ms  5.93% 24.64%     1900ms  5.93%  racecall
    1290ms  4.02% 28.67%     1290ms  4.02%  __tsan_write
    1090ms  3.40% 32.06%     3270ms 10.20%  runtime.mallocgc
    1080ms  3.37% 35.43%     1080ms  3.37%  __tsan_func_enter
    1020ms  3.18% 38.62%     1120ms  3.49%  runtime.scanobject
    1010ms  3.15% 41.77%     1010ms  3.15%  runtime.nanotime
     990ms  3.09% 44.85%      990ms  3.09%  __tsan::DenseSlabAlloc::Refill
```

您可以键入诸如`web`或`gif`之类的命令来获得可以更好地帮助您的图表
了解关键代码路径的整体性能。 你可以得到一些东西
如下所示：

![CPU Profiling](./../assets/cpu_profile.jpg)

注意，要使用这些选项，您需要先安装虚拟化工具`graphviz`，如果您使用的是 Mac，只需运行`brew install graphviz`，更多信息请参考[这里](https://graphviz. gitlab.io/）。

## 内存分析

同样，您可以运行

```
go tool pprof http://localhost:9080/debug/pprof/heap
```

这将返回当前堆的快照，允许我们检查内存使用情况。 进入交互模式后，您可以运行一些有用的命令。 比如top可以列出top内存消耗的对象。
```
(pprof) top
Showing nodes accounting for 83.58MB, 98.82% of 84.58MB total
Showing top 10 nodes out of 86
      flat  flat%   sum%        cum   cum%
      32MB 37.84% 37.84%       32MB 37.84%  github.com/apache/yunikorn-core/pkg/cache.NewClusterInfo
      16MB 18.92% 56.75%       16MB 18.92%  github.com/apache/yunikorn-core/pkg/rmproxy.NewRMProxy
      16MB 18.92% 75.67%       16MB 18.92%  github.com/apache/yunikorn-core/pkg/scheduler.NewScheduler
      16MB 18.92% 94.59%       16MB 18.92%  github.com/apache/yunikorn-k8shim/pkg/dispatcher.init.0.func1
    1.04MB  1.23% 95.81%     1.04MB  1.23%  k8s.io/apimachinery/pkg/runtime.(*Scheme).AddKnownTypeWithName
    0.52MB  0.61% 96.43%     0.52MB  0.61%  github.com/gogo/protobuf/proto.RegisterType
    0.51MB  0.61% 97.04%     0.51MB  0.61%  sync.(*Map).Store
    0.50MB   0.6% 97.63%     0.50MB   0.6%  regexp.onePassCopy
    0.50MB  0.59% 98.23%     0.50MB  0.59%  github.com/json-iterator/go.(*Iterator).ReadString
    0.50MB  0.59% 98.82%     0.50MB  0.59%  text/template/parse.(*Tree).newText
```

您还可以运行 `web`、`pdf` 或 `gif` 命令来获取堆图形。

## 下载分析样本并在本地进行分析

我们在调度程序docker映像中包含了基本的go/go-tool二进制文件，您应该能够进行一些基本的分析
docker容器内的分析。 但是，如果您想深入研究一些问题，最好进行分析
本地。 然后您需要先将示例文件复制到本地环境。 复制文件的命令如下：

```
kubectl cp ${SCHEDULER_POD_NAME}:${SAMPLE_PATH_IN_DOCKER_CONTAINER} ${LOCAL_COPY_PATH}
```

例如

```
kubectl cp yunikorn-scheduler-cf8f8dd8-6szh5:/root/pprof/pprof.k8s_yunikorn_scheduler.samples.cpu.001.pb.gz /Users/wyang/Downloads/pprof.k8s_yunikorn_scheduler.samples.cpu.001.pb.gz
```

在本地环境中获取文件后，您可以运行“pprof”命令进行分析。

```
go tool pprof /Users/wyang/Downloads/pprof.k8s_yunikorn_scheduler.samples.cpu.001.pb.gz
```

## 资源

* pprof 文档 https://github.com/google/pprof/tree/master/doc。
