---
id: quota_preemption
title: Quota Enforcement through Preemption
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

Quota Enforcement through preemption allows users to enforce newly configured quota with in certain amount of time rather than waiting indefinitely to come into effect through natural exits of running workloads. Preemption would be triggerred in case of quota decrease to evict the suitable victims only when delay has reached  to enforce the new quota into effect.

This document guide users to set up preemption delay while decreasing the quota, switching ON/OFF whole feature at partition level etc. For more details on the design, please refer [design doc](design/quota_change_enforcement_through_preemption.md) for details.

## Quota Preemption Configuration

### Global Switch at Partition Level

Quota Enforcement through Preemption feature can be turned off globally by setting the appropriate property at partition level. It is configurable as follows:

```yaml
partitions:  
  - name: <name of the partition>  
    preemption:  
   	 quotapreemptionenabled: <boolean value>  
    queues:  
      - name: <name of the queue>  
        resources:  
          max: <maximum resources allowed for this queue>
```

Default is false (disabled). Setting it to true would turn ON the feature globally and preemption would be triggered whenever any queue quota decreases. 

Examples are

1\) Switch ON the feature:

Current Set up:

Partition `default` doesn't have any preemption related configuration.

```yaml
partitions:  
  - name: default
    queues:
    - name: root
      queues:
        - name: default  
```

New Set up:

Partition `default` has `preemption.quotapreemptionenabled`

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
      - name: root
        queues:
          - name: default
```
Preemption would be triggerred in case of any quota decrease.

2\) Switch OFF the feature explicitly:

Current Set up:

Partition `default` doesn't have any preemption related configuration.

```yaml
partitions:  
  - name: default
    queues:
    - name: root
      queues:
        - name: default  
```

New Set up:

Partition `default` has `preemption.quotapreemptionenabled`

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: false
    queues:
      - name: root
        queues:
          - name: default
```
Preemption would be triggerred in case of any quota decrease.

3\) Switch OFF the feature (default):

Current Set up:

Partition `default` doesn't have any preemption related configuration.

```yaml
partitions:  
  - name: default
    queues:
    - name: root
      queues:
        - name: default  
```

New Set up:

Even in new set up, Partition `default` doesn't have any `preemption.quotapreemptionenabled` setting explicitly.

```yaml
partitions:
  - name: default
    queues:
      - name: root
        queues:
          - name: default
```
Preemption won't be triggerred in case of any quota decrease.

### Preemption Delay

Quota Preemption Delay is the time duration after which the preemption should get triggered for quota changes. It is configurable.Unit is seconds.

It is configurable as follows:
```yaml
partitions:  
  - name: <name of the partition>  
    queues:  
      - name: <name of the queue>  
        resources:  
          max: <maximum resources allowed for this queue>
        properties:
          quota.preemption.delay: <quota preemption delay in seconds>
```
It could be any value between 0 and max int. Setting any value between 60 seconds and 6 hours is preferable for most of the cases.

Examples are 

1\) Quota decrease with delay in hours:

Current Set up:

`root.default` max resource is `{memory: 20G}`

```yaml
partitions:  
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
    - name: root
      queues:
        - name: default 
          resources:  
            max:  
              {memory: 20G}  
```

New Set up:

`root.default` max resource reduced to `{memory: 10G}`. Delay of 2 hours should be configured as `2h`.

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
      - name: root
        queues:
          - name: default
            resources:
              max:
                {memory: 20G}
            properties:
              quota.preemption.delay: 2h
```
Preemption would be triggerred after 2 hours for the queue `root.default` to enforce newly configured quota by evicting the suitable victims.

2\) Quota decrease with delay in minutes:

Current Set up:

`root.default` max resource is `{memory: 20G}`

```yaml
partitions:  
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
    - name: root
      queues:
        - name: default 
          resources:  
            max:  
              {memory: 20G}  
```

New Set up:

`root.default` max resource reduced to `{memory: 10G}`. Delay of 5 minutes should be configured as `5m`.

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
      - name: root
        queues:
          - name: default
            resources:
              max:
                {memory: 20G}
            properties:
              quota.preemption.delay: 5m
```
Preemption would be triggerred after 5 minutes for the queue `root.default` to enforce newly configured quota by evicting the suitable victims.

3\) Quota decrease but not delay:

Current Set up:

`root.default` max resource is `{memory: 20G}`

```yaml
partitions:  
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
    - name: root
      queues:
        - name: default 
          resources:  
            max:  
              {memory: 20G}  
```

New Set up:

`root.default` max resource reduced to `{memory: 10G}` but delay is not configured.

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
      - name: root
        queues:
          - name: default
            resources:
              max:
                {memory: 10G}
```
Preemption won't be triggerred for this quota decrease as delay is 0 (default).

4\) Quota increase:

Current Set up:

`root.default` max resource is `{memory: 20G}`

```yaml
partitions:  
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
    - name: root
      queues:
        - name: default 
          resources:  
            max:  
              {memory: 20G}  
```

New Set up:

`root.default` max resource increased to `{memory: 50G}`

```yaml
partitions:
  - name: default
    preemption:
      quotapreemptionenabled: true
    queues:
      - name: root
        queues:
          - name: default
            resources:
              max:
                {memory: 50G}
```
Preemption won't be triggerred as it is not required for quota increase and not expected behaviour.