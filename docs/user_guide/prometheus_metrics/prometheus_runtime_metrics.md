---
id: prometheus_runtime_metrics
title: Prometheus Runtime Metrics
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

## go_mem_stats

**Metric Type**: `guage`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_mem_stats`

```
# HELP yunikorn_runtime_go_mem_stats Go MemStats metrics
# TYPE yunikorn_runtime_go_mem_stats gauge
yunikorn_runtime_go_mem_stats{MemStats="Alloc"} 5.6525024e+07
yunikorn_runtime_go_mem_stats{MemStats="BuckHashSys"} 1.454992e+06
yunikorn_runtime_go_mem_stats{MemStats="Frees"} 392555
yunikorn_runtime_go_mem_stats{MemStats="GCCPUFraction"} 1.6588893082370207e-05
yunikorn_runtime_go_mem_stats{MemStats="GCSys"} 8.714664e+06
yunikorn_runtime_go_mem_stats{MemStats="HeapAlloc"} 5.6525024e+07
yunikorn_runtime_go_mem_stats{MemStats="HeapIdle"} 6.856704e+06
yunikorn_runtime_go_mem_stats{MemStats="HeapInuse"} 5.9138048e+07
yunikorn_runtime_go_mem_stats{MemStats="HeapObjects"} 42935
yunikorn_runtime_go_mem_stats{MemStats="HeapReleased"} 1.163264e+06
yunikorn_runtime_go_mem_stats{MemStats="HeapSys"} 6.5994752e+07
yunikorn_runtime_go_mem_stats{MemStats="LastGC"} 1.693796422237579e+18
yunikorn_runtime_go_mem_stats{MemStats="Lookups"} 0
yunikorn_runtime_go_mem_stats{MemStats="MCacheSys"} 15600
yunikorn_runtime_go_mem_stats{MemStats="MSpanInuse"} 190560
yunikorn_runtime_go_mem_stats{MemStats="MSpanSys"} 261120
yunikorn_runtime_go_mem_stats{MemStats="Mallocs"} 435490
yunikorn_runtime_go_mem_stats{MemStats="NextGC"} 1.0978664e+08
yunikorn_runtime_go_mem_stats{MemStats="NumForcedGC"} 0
yunikorn_runtime_go_mem_stats{MemStats="NumGC"} 19
yunikorn_runtime_go_mem_stats{MemStats="OtherSys"} 1.740512e+06
yunikorn_runtime_go_mem_stats{MemStats="PauseTotalNs"} 3.530951e+06
yunikorn_runtime_go_mem_stats{MemStats="StackInuse"} 1.114112e+06
yunikorn_runtime_go_mem_stats{MemStats="StackSys"} 1.114112e+06
yunikorn_runtime_go_mem_stats{MemStats="Sys"} 7.9295752e+07
yunikorn_runtime_go_mem_stats{MemStats="TotalAlloc"} 1.06435488e+08
```

## go_pause_ns

**Metric Type**: `guage`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_pause_ns`

```
yunikorn_runtime_go_pause_ns{PauseNs="0"} 235211
yunikorn_runtime_go_pause_ns{PauseNs="1"} 199894
yunikorn_runtime_go_pause_ns{PauseNs="10"} 278601
yunikorn_runtime_go_pause_ns{PauseNs="100"} 0
yunikorn_runtime_go_pause_ns{PauseNs="101"} 0
yunikorn_runtime_go_pause_ns{PauseNs="102"} 0
yunikorn_runtime_go_pause_ns{PauseNs="103"} 0
.
.
.
yunikorn_runtime_go_pause_ns{PauseNs="9"} 83769
yunikorn_runtime_go_pause_ns{PauseNs="90"} 0
yunikorn_runtime_go_pause_ns{PauseNs="91"} 0
yunikorn_runtime_go_pause_ns{PauseNs="92"} 0
yunikorn_runtime_go_pause_ns{PauseNs="93"} 0
yunikorn_runtime_go_pause_ns{PauseNs="94"} 0
yunikorn_runtime_go_pause_ns{PauseNs="95"} 0
yunikorn_runtime_go_pause_ns{PauseNs="96"} 0
yunikorn_runtime_go_pause_ns{PauseNs="97"} 0
yunikorn_runtime_go_pause_ns{PauseNs="98"} 0
yunikorn_runtime_go_pause_ns{PauseNs="99"} 0
```

## go_pause_end

**Metric Type**: `guage`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_pause_end`

```
# HELP yunikorn_runtime_go_pause_end Go MemStats - PauseEnd
# TYPE yunikorn_runtime_go_pause_end gauge
yunikorn_runtime_go_pause_end{PauseEnd="0"} 1.6937946219565312e+18
yunikorn_runtime_go_pause_end{PauseEnd="1"} 1.6937946219613747e+18
yunikorn_runtime_go_pause_end{PauseEnd="10"} 1.6937954621056732e+18
yunikorn_runtime_go_pause_end{PauseEnd="100"} 0
yunikorn_runtime_go_pause_end{PauseEnd="101"} 0
yunikorn_runtime_go_pause_end{PauseEnd="102"} 0
yunikorn_runtime_go_pause_end{PauseEnd="103"} 0
yunikorn_runtime_go_pause_end{PauseEnd="104"} 0
.
.
.
yunikorn_runtime_go_pause_end{PauseEnd="94"} 0
yunikorn_runtime_go_pause_end{PauseEnd="95"} 0
yunikorn_runtime_go_pause_end{PauseEnd="96"} 0
yunikorn_runtime_go_pause_end{PauseEnd="97"} 0
yunikorn_runtime_go_pause_end{PauseEnd="98"} 0
yunikorn_runtime_go_pause_end{PauseEnd="99"} 0
```

## go_alloc_bysize_maxsize

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_alloc_bysize_maxsize`

```
# HELP yunikorn_runtime_go_alloc_bysize_maxsize Go MemStats - maximum byte size of this bucket
# TYPE yunikorn_runtime_go_alloc_bysize_maxsize histogram
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="0"} 3
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="8"} 6
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="16"} 9
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="24"} 12
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="32"} 15
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="48"} 18
.
.
.
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="28672"} 183
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="32768"} 183
yunikorn_runtime_go_alloc_bysize_maxsize_bucket{le="+Inf"} 183
yunikorn_runtime_go_alloc_bysize_maxsize_sum 594528
yunikorn_runtime_go_alloc_bysize_maxsize_count 183
```

## go_alloc_bysize_free

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_alloc_bysize_free`

```
# HELP yunikorn_runtime_go_alloc_bysize_free Go MemStats - cumulative count of heap objects freed in this size class
# TYPE yunikorn_runtime_go_alloc_bysize_free histogram
yunikorn_runtime_go_alloc_bysize_free_bucket{le="0"} 11
yunikorn_runtime_go_alloc_bysize_free_bucket{le="8"} 44
yunikorn_runtime_go_alloc_bysize_free_bucket{le="16"} 51
.
.
.
yunikorn_runtime_go_alloc_bysize_free_bucket{le="24576"} 177
yunikorn_runtime_go_alloc_bysize_free_bucket{le="27264"} 179
yunikorn_runtime_go_alloc_bysize_free_bucket{le="28672"} 180
yunikorn_runtime_go_alloc_bysize_free_bucket{le="32768"} 180
yunikorn_runtime_go_alloc_bysize_free_bucket{le="+Inf"} 183
yunikorn_runtime_go_alloc_bysize_free_sum 490983
yunikorn_runtime_go_alloc_bysize_free_count 183
```

## go_alloc_bysize_malloc

**Metric Type**: `histogram`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_alloc_bysize_malloc`

```
# HELP yunikorn_runtime_go_alloc_bysize_malloc Go MemStats - cumulative count of heap objects allocated in this size bucket
# TYPE yunikorn_runtime_go_alloc_bysize_malloc histogram
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="0"} 4
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="8"} 32
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="16"} 39
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="24"} 44
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="32"} 52
.
.
.
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="27264"} 177
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="28672"} 177
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="32768"} 180
yunikorn_runtime_go_alloc_bysize_malloc_bucket{le="+Inf"} 183
yunikorn_runtime_go_alloc_bysize_malloc_sum 608763
yunikorn_runtime_go_alloc_bysize_malloc_count 183

```

## go_generic

**Metric Type**: `gauge`

**Namespace**: `yunikorn`

**Subsystem**: `runtime`

**TYPE**: `yunikorn_runtime_go_generic`

```
# HELP yunikorn_runtime_go_generic Go Generics metrics
# TYPE yunikorn_runtime_go_generic gauge
yunikorn_runtime_go_generic{Generic="_cgo_go_to_c_calls:calls"} 0
yunikorn_runtime_go_generic{Generic="_cpu_classes_gc_mark_assist:cpu_seconds"} 0.00403092
yunikorn_runtime_go_generic{Generic="_cpu_classes_gc_mark_dedicated:cpu_seconds"} 0.20663994
yunikorn_runtime_go_generic{Generic="_cpu_classes_gc_mark_idle:cpu_seconds"} 0.004535843
yunikorn_runtime_go_generic{Generic="_cpu_classes_gc_pause:cpu_seconds"} 0.028247608
yunikorn_runtime_go_generic{Generic="_cpu_classes_gc_total:cpu_seconds"} 0.243454311
yunikorn_runtime_go_generic{Generic="_cpu_classes_idle:cpu_seconds"} 12599.889265701
yunikorn_runtime_go_generic{Generic="_cpu_classes_scavenge_assist:cpu_seconds"} 2.21e-07
yunikorn_runtime_go_generic{Generic="_cpu_classes_scavenge_background:cpu_seconds"} 8.5e-08
yunikorn_runtime_go_generic{Generic="_cpu_classes_scavenge_total:cpu_seconds"} 3.06e-07
yunikorn_runtime_go_generic{Generic="_cpu_classes_total:cpu_seconds"} 14402.3152608
yunikorn_runtime_go_generic{Generic="_cpu_classes_user:cpu_seconds"} 1802.182540482
yunikorn_runtime_go_generic{Generic="_gc_cycles_automatic:gc_cycles"} 19
yunikorn_runtime_go_generic{Generic="_gc_cycles_forced:gc_cycles"} 0
yunikorn_runtime_go_generic{Generic="_gc_cycles_total:gc_cycles"} 19
yunikorn_runtime_go_generic{Generic="_gc_heap_allocs:bytes"} 1.06605072e+08
yunikorn_runtime_go_generic{Generic="_gc_heap_allocs:objects"} 426529
yunikorn_runtime_go_generic{Generic="_gc_heap_frees:bytes"} 4.9910464e+07
yunikorn_runtime_go_generic{Generic="_gc_heap_frees:objects"} 382616
yunikorn_runtime_go_generic{Generic="_gc_heap_goal:bytes"} 1.0978664e+08
yunikorn_runtime_go_generic{Generic="_gc_heap_objects:objects"} 43913
yunikorn_runtime_go_generic{Generic="_gc_heap_tiny_allocs:objects"} 9939
yunikorn_runtime_go_generic{Generic="_gc_limiter_last_enabled:gc_cycle"} 0
yunikorn_runtime_go_generic{Generic="_gc_stack_starting_size:bytes"} 2048
yunikorn_runtime_go_generic{Generic="_memory_classes_heap_free:bytes"} 5.545984e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_heap_objects:bytes"} 5.6694608e+07
yunikorn_runtime_go_generic{Generic="_memory_classes_heap_released:bytes"} 1.163264e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_heap_stacks:bytes"} 1.114112e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_heap_unused:bytes"} 2.590896e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_metadata_mcache_free:bytes"} 6000
yunikorn_runtime_go_generic{Generic="_memory_classes_metadata_mcache_inuse:bytes"} 9600
yunikorn_runtime_go_generic{Generic="_memory_classes_metadata_mspan_free:bytes"} 70560
yunikorn_runtime_go_generic{Generic="_memory_classes_metadata_mspan_inuse:bytes"} 190560
yunikorn_runtime_go_generic{Generic="_memory_classes_metadata_other:bytes"} 8.714664e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_os_stacks:bytes"} 0
yunikorn_runtime_go_generic{Generic="_memory_classes_other:bytes"} 1.740512e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_profiling_buckets:bytes"} 1.454992e+06
yunikorn_runtime_go_generic{Generic="_memory_classes_total:bytes"} 7.9295752e+07
yunikorn_runtime_go_generic{Generic="_sched_gomaxprocs:threads"} 8
yunikorn_runtime_go_generic{Generic="_sched_goroutines:goroutines"} 103
yunikorn_runtime_go_generic{Generic="_sync_mutex_wait_total:seconds"} 0.000184208

```