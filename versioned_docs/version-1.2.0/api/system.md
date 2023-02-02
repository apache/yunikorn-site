---
id: system
title: System
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

These endpoints are for the [pprof](https://github.com/google/pprof) profiling tool.

## pprof

**URL** : `/debug/pprof/`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```text
/debug/pprof/

Types of profiles available:
Count	Profile
273	allocs
0	block
0	cmdline
78	goroutine
273	heap
0	mutex
0	profile
29	threadcreate
0	trace
full goroutine stack dump
Profile Descriptions:

allocs: A sampling of all past memory allocations
block: Stack traces that led to blocking on synchronization primitives
cmdline: The command line invocation of the current program
goroutine: Stack traces of all current goroutines
heap: A sampling of memory allocations of live objects. You can specify the gc GET parameter to run GC before taking the heap sample.
mutex: Stack traces of holders of contended mutexes
profile: CPU profile. You can specify the duration in the seconds GET parameter. After you get the profile file, use the go tool pprof command to investigate the profile.
threadcreate: Stack traces that led to the creation of new OS threads
trace: A trace of execution of the current program. You can specify the duration in the seconds GET parameter. After you get the trace file, use the go tool trace command to investigate the trace.
```

## Heap

**URL** : `/debug/pprof/heap`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Thread create

**URL** : `/debug/pprof/threadcreate`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Goroutine

**URL** : `/debug/pprof/goroutine`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Allocations

**URL** : `/debug/pprof/allocs`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Block

**URL** : `/debug/pprof/block`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Mutex

**URL** : `/debug/pprof/mutex`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Cmdline

**URL** : `/debug/pprof/cmdline`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Profile

**URL** : `/debug/pprof/profile`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Symbol

**URL** : `/debug/pprof/symbol`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## Trace		

**URL** : `/debug/pprof/trace`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```
