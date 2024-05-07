---
id: deployment_modes
title: Deployment Modes
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

## YuniKorn deployment modes

***NOTE:*** **This section is maintained largely for historical context.
The plugin deployment mode is deprecated and no longer supported. The
removal timeline agreed upon by the YuniKorn community is as follows:**

* **YuniKorn 1.6**: Deprecation announced
* **YuniKorn 1.7**: Scheduler will emit warnings if plugin mode is in use
* **YuniKorn 1.8**: YuniKorn will no longer ship plugin mode binaries
* **YuniKorn 1.9**: Implementation removed from codebase

YuniKorn can be deployed in two different modes: standard and plugin.
In standard mode, YuniKorn runs as a standalone Kubernetes scheduler.
In plugin mode (now deprecated), YuniKorn is implemented as a set of
plugins on top of the default Kubernetes scheduling framework.

Regardless of the YuniKorn deployment mode in use, it is recommended to
run the admission controller as well, as this will ensure that only a single
scheduler is active within your Kubernetes cluster. In this mode, the default
Kubernetes scheduler (which is always running) will be bypassed for all pods
except YuniKorn itself.

### Standard mode

Standard mode is currently the default. It is stable, efficient, and very
performant. It is well-suited for all YuniKorn deployments and is recommended.

### Plugin mode

**Deprecated for removal**

Plugin mode was an experimental deployment model where the scheduler was
implemented on top of the default Kubernetes scheduler as a set of plugins.
Originally, this was expected to help provide better compatibility with the
default Kubernetes scheduler, but that did not end up being the case.
Consequently, the plugin mode is now deprecated and will be removed from a
future YuniKorn release.

It is not recommended to use plugin mode for any new deployments, and existing
users should migrate to standard mode as soon as practically possible. The
standard mode is much more mature, providing excellent compatibility with the
default Kubernetes scheduler (as it now uses the same scheduler plugins
internally) while providing significantly better performance then either the
default Kubernetes scheduler or the now deprecated YuniKorn plugin deployment
mode.
