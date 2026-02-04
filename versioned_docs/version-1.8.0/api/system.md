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

# System Debug

Endpoint for providing information to help debugging issues.

:::warning
All content exposed as part of these endpoints is considered `unstable`.
There is no guarantee of any kind around the content between releases.
:::

The pprof endpoints are for the [pprof](https://github.com/google/pprof) profiling tool. Because they are entirely dependent on the version of the go
compiler and the standard libraries used to build YuniKorn, we do not provide any content description.

## Retrieve state dump

Endpoint to retrieve the following information in a single response:

* Current timestamp (Unix timestamp in nanosecond)
* List of partitions
* List of applications (running, completed and rejected)
* Application history
* Nodes
* Generic cluster information
* Container history
* Queues
* RMDiagnostics
* Log level
* Configuration
* Placement rules
* Event stream overview (client hostname and creation timestamp)

Note that this list is not guaranteed to remain stable and can change from release to release.

**URL** : `/debug/fullstatedump`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

The output of this REST query can be rather large, and it is a combination of those which have already been documented as part of the [scheduler API](scheduler.md).

The `RMDiagnostics` shows the content of the K8Shim cache. The exact content is version dependent and is not stable.
The current content shows the cached objects:
* nodes
* pods
* priorityClasses
* schedulingState (pod status)

### Error response

**Code**: `500 Internal Server Error`

## Go routine info

Dumps the stack traces of the currently running goroutines. This is a similar view as provided in the [pprof goroutine](#pprof-goroutine) in a human-readable form.

**URL** : `/debug/stack`

**Method** : `GET`

**Auth required** : NO

### Success response

**Code** : `200 OK`

**Content examples**

```text
goroutine 4110 [running]:
github.com/apache/yunikorn-core/pkg/webservice.getStackInfo.func1()
	github.com/apache/yunikorn-core@v0.0.0-20241017135039-079a02dbdfa7/pkg/webservice/handlers.go:116 +0x64
github.com/apache/yunikorn-core/pkg/webservice.getStackInfo({0x22ba328, 0x40003b8460}, 0x4000619708?)
	github.com/apache/yunikorn-core@v0.0.0-20241017135039-079a02dbdfa7/pkg/webservice/handlers.go:123 +0x3c
net/http.HandlerFunc.ServeHTTP(0x1d2f320?, {0x22ba328?, 0x40003b8460?}, 0xe?)
	net/http/server.go:2171 +0x38
github.com/apache/yunikorn-core/pkg/webservice.newRouter.loggingHandler.func1({0x22ba328, 0x40003b8460}, 0x4003e18fc0)
	github.com/apache/yunikorn-core@v0.0.0-20241017135039-079a02dbdfa7/pkg/webservice/webservice.go:56 +0x7c
net/http.HandlerFunc.ServeHTTP(0x0?, {0x22ba328?, 0x40003b8460?}, 0x4?)
	net/http/server.go:2171 +0x38
github.com/apache/yunikorn-core/pkg/webservice.newRouter.(*Router).Handler.func2({0x22ba328?, 0x40003b8460?}, 0x40003229e0?, {0x0?, 0x4000619ae8?, 0x203fc?})
	github.com/julienschmidt/httprouter@v1.3.0/router.go:275 +0xd4
github.com/julienschmidt/httprouter.(*Router).ServeHTTP(0x4000682360, {0x22ba328, 0x40003b8460}, 0x4003e18fc0)
	github.com/julienschmidt/httprouter@v1.3.0/router.go:387 +0x6f8
net/http.serverHandler.ServeHTTP({0x4003eea8a0?}, {0x22ba328?, 0x40003b8460?}, 0x6?)
	net/http/server.go:3142 +0xbc
net/http.(*conn).serve(0x4003e4ac60, {0x22c9b78, 0x40003f02d0})
	net/http/server.go:2044 +0x508
created by net/http.(*Server).Serve in goroutine 87
	net/http/server.go:3290 +0x3f0

goroutine 1 [chan receive, 957 minutes]:
main.main()
	github.com/apache/yunikorn-k8shim/pkg/cmd/shim/main.go:61 +0x6e8

goroutine 52 [select, 957 minutes]:
github.com/apache/yunikorn-core/pkg/scheduler.(*Scheduler).handleRMEvent(0x40004237d0)
	github.com/apache/yunikorn-core@v0.0.0-20241017135039-079a02dbdfa7/pkg/scheduler/scheduler.go:129 +0x88
created by github.com/apache/yunikorn-core/pkg/scheduler.(*Scheduler).StartService in goroutine 1
	github.com/apache/yunikorn-core@v0.0.0-20241017135039-079a02dbdfa7/pkg/scheduler/scheduler.go:60 +0x98
```

### Error response

**Code** : `500 Internal Server Error`

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

## pprof heap

**URL** : `/debug/pprof/heap`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof thread create

**URL** : `/debug/pprof/threadcreate`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof goroutine

**URL** : `/debug/pprof/goroutine`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof allocations

**URL** : `/debug/pprof/allocs`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof block (mutex)

**URL** : `/debug/pprof/block`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof mutex

**URL** : `/debug/pprof/mutex`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof cmdline

**URL** : `/debug/pprof/cmdline`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```text
/yunikorn-scheduler
```

## pprof profile

**URL** : `/debug/pprof/profile`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```

## pprof symbol

**URL** : `/debug/pprof/symbol`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
num_symbols: 1
```

## pprof trace

**URL** : `/debug/pprof/trace`

**Method** : `GET`

### Success response

**Code** : `200 OK`

**Content examples**

```proto
// binary data from proto
```
