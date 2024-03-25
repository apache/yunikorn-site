---
id: service_config
title: Service Configuration
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

The official distribution of YuniKorn is deployed via Helm charts to
Kubernetes. Configuration for YuniKorn is split into two parts: Helm
configuration, and YuniKorn service configuration.

## Helm Configuration
Helm configuration is used to configure options for the deployment of
YuniKorn to Kubernetes.

The following settings can be configured during YuniKorn installation
via Helm, either via Helm's command-line, as in `--set key=value`, or
via an external file: `-f file.yaml`. The examples below will be given in
YAML syntax.

### Container images
YuniKorn ships as a set of container images. The locations and pull
policies can be customized as follows:
```yaml
# Image information for the standard scheduler
image:
  repository: apache/yunikorn
  tag: scheduler-1.0.0          # default depends on YuniKorn version
  pullPolicy: Always

# Image information for the plugin scheduler
pluginImage:
  repository: apache/yunikorn
  tag: scheduler-plugin-1.0.0   # default depends on YuniKorn version
  pullPolicy: Always

# Image information for the web UI
web:
  image:
    repository: apache/yunikorn
    tag: web-1.0.0              # default depends on YuniKorn version
    pullPolicy: Always

# Image information for the admission controller
admissionController:
  image:
    repository: apache/yunikorn
    tag: admission-1.0.0        # default depends on YuniKorn version
    pullPolicy: Always
```
### Kubernetes configuration

#### affinity
Sets the affinity for the YuniKorn scheduler pod.

Default: `{}`

Example:
```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
              - primary1
              - primary2
```
#### admissionController.affinity
Sets the affinity for the YuniKorn admission controller pod.

Default: `{}`

Example:
```yaml
admissionController:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - primary1
                - primary2
```

#### hostNetwork
Controls whether the scheduler should run in the host network.

Default: `false`

Example:
```yaml
hostNetwork: true
```

#### admissionController.hostNetwork
Controls whether the admission controller should run in the host network.

Default: `true`

Example:
```yaml
admissionController:
  hostNetwork: false
```
#### imagePullSecrets
Provides secrets needed for pulling YuniKorn images.

Default: `[]`

Example:
```yaml
imagePullSecrets:
  - secret1
  - secret2
```
#### nodeSelector
Sets a node selector(s) to use for placement of the YuniKorn scheduler pod.

Default: `{}`

Example:
```yaml
nodeSelector:
  node-role.kubernetes.io/control-plane: "true"
```
#### admissionController.nodeSelector
Sets a node selector(s) to use for placement of the YuniKorn admission controller pod.

Default: `{}`

Example:
```yaml
admissionController:
  nodeSelector:
    node-role.kubernetes.io/control-plane: "true"
```
#### admissionController.replicaCount
Sets the number of replicas to use for the YuniKorn admission controller. This
can be set to greater than 1 for high-availability.

Default: `1`

Example:
```yaml
admissionController:
  replicaCount: 2
```
#### serviceAccount
Sets an alternate service account for the YuniKorn scheduler.

Changing this value is not recommended, as Helm installs role-based access
control (RBAC) policies for the default user that are required for proper
functionaliy.

Default: `yunikorn-admin`

Example:
```yaml
serviceAccount: my-account
```
#### admissionController.serviceAccount
Sets an alternate service account for the YuniKorn admission controller.

Changing this value is not recommended, as Helm installs role-based access
control (RBAC) policies for the default user that are required for proper
functionaliy.

Default: `yunikorn-admission-controller`

Example:
```yaml
admissionController:
  serviceAccount: my-account
```
#### service.type
Sets the type of service used for the scheduler.

Default: `ClusterIP`

Example:
```yaml
service:
  type: ClusterIP
```
#### admissionController.service.type
Sets the type of service used for the admission controller.

Default: `ClusterIP`

Example:
```yaml
admissionController:
  service:
    type: ClusterIP
```
#### service.port
Sets the port exposed in the YuniKorn scheduler service for the REST API.
It is not recommended to change this value.

Default: 9080

Example:
```yaml
service:
  port: 9080
```
#### service.portWeb
Sets the port exposed in the YuniKorn scheduler service for the Web UI.
It is not recommended to change this value.

Default: 9889

Example:
```yaml
service:
  portWeb: 9889
```
#### tolerations
Sets the tolerations for the YuniKorn scheduler pod.

Default: `[]`

Example: 
```yaml
tolerations:
  - key: node-role.kubernetes.io/control-plane
    operator: Equal
    value: "true"
    effect: NoSchedule
  - key: CriticalAddonsOnly
    operator: Exists
```
#### admissionController.tolerations
Sets the tolerations for the YuniKorn admission controller pod.

Default: `[]`

Example: 
```yaml
admissionController:
  tolerations:
    - key: node-role.kubernetes.io/control-plane
      operator: Equal
      value: "true"
      effect: NoSchedule
    - key: CriticalAddonsOnly
      operator: Exists
```
#### podLabels
Sets the labels for the YuniKorn scheduler pod.

Default: `{}`

Example:
```yaml
podLabels:
  app.kubernetes.io/name: scheduler
  app.kubernetes.io/part-of: yunikorn
```
#### admissionController.podLabels
Sets the labels for the YuniKorn admission controller pod.

Default: `{}`

Example:
```yaml
admissionController:
  podLabels:
    app.kubernetes.io/name: admission-controller
    app.kubernetes.io/part-of: yunikorn
```
#### podAnnotations
Sets the annotations for the YuniKorn scheduler pod.

Default: `{}`

Example:
```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/path: /ws/v1/metrics
  prometheus.io/port: 9080
```
#### admissionController.podAnnotations
Sets the annotations for the YuniKorn admission controller pod.

Default: `{}`

Example:
```yaml
admissionController:
  podAnnotations:
    example.com/admission: "false"
```
### Resource utilization
The resources requested for YuniKorn pods can be customized as follows:
```yaml
# Scheduler container resources
resources:
  requests:
    cpu: 200m
    memory: 1Gi
  limits:
    cpu: 4
    memory: 2Gi

# Web UI container resources
web:
  resources:
    requests:
      cpu: 100m
      memory: 100Mi
    limits:
      cpu: 100m
      memory: 500Mi

# Admission controller resources
admissionController:
  resources:
    requests:
      cpu: 100m
      memory: 500Mi
    limits:
      cpu: 500m
      memory: 500Mi
```
### Optional features

#### embedAdmissionController
Controls whether to enable the YuniKorn admission controller.

Default: `true`

Example:
```yaml
embedAdmissionController: false
```
#### enableSchedulerPlugin
Controls whether to run YuniKorn in scheduler plugin mode.

Default: `false`

Example:
```yaml
enableSchedulerPlugin: true
```
### YuniKorn defaults

#### yunikornDefaults
Sets entries which will be rendered to the `yunikorn-defaults` ConfigMap. This
can be used to pre-configure YuniKorn at deployment time. Any settings
declared in [YuniKorn configuration](#yunikorn-configuration) may be set here.

Default: `{}`

Example:
```yaml
yunikornDefaults:
    service.clusterId: yunikorn-01
    service.policyGroup: group-01
    group-01.yaml: |
      partitions:
        - name: default
          placementrules:
            - name: tag
              value: namespace
              create: true
          queues:
        - name: root
          submitacl: '*'
```

### Deprecated settings
The following settings are deprecated, and will be removed from a future
YuniKorn release. They should now be specified in the `yunikorn-configs` ConfigMap
or via the Helm `yunikornDefaults` section:

| Deprecated setting                     | ConfigMap replacement                           |
|----------------------------------------|-------------------------------------------------|
| operatorPlugins                        | -                                               |
| placeHolderImage                       | service.placeholderImage                        |
| admissionController: processNamespaces | admissionController.filtering.processNamespaces |
| admissionController: bypassNamespaces  | admissionController.filtering.bypassNamespaces  |
| admissionController: labelNamespaces   | admissionController.filtering.labelNamespaces   |
| admissionController: noLabelNamespaces | admissionController.filtering.noLabelNamespaces |
| configuration                          | queues.yaml                                     |

Deprecated example:
```yaml
operatorPlugins: general
placeHolderImage: registry.k8s.io/pause:3.7
admissionController:
  processNamespaces: "^spark-,^mpi-"
  bypassNamespaces: "^kube-system$"
  labelNamespaces: "^spark-"
  noLabelNamespaces: "^mpi-legacy-"
configuration: |
  partitions:
    - name: default
      placementrules:
        - name: tag
          value: namespace
          create: true
      queues:
    - name: root
      submitacl: '*'
```
Replacement example:
```yaml
yunikornDefaults:
  service.policyGroup: queues
  service.placeholderImage: registry.k8s.io/pause:3.7
  admissionController.filtering.processNamespaces: "^spark-,^mpi-"
  admissionController.filtering.bypassNamespaces: "^kube-system$"
  admissionController.filtering.labelNamespaces: "^spark-"
  admissionController.filtering.noLabelNamespaces: "^mpi-legacy-"
  queues.yaml: |
    partitions:
      - name: default
        placementrules:
          - name: tag
            value: namespace
            create: true
        queues:
      - name: root
        submitacl: '*'
```
Currently, if both the deprecated parameter and the replacement ConfigMap entry are specified, the ConfigMap entry will take precedence.


## YuniKorn Configuration

Service configuration for YuniKorn is controlled by two Kubernetes ConfigMaps
in the namespace where YuniKorn is installed: `yunikorn-defaults` and
`yunikorn-configs`.

At runtime, these ConfigMaps are polled by YuniKorn and merged together to form an
effective configuration. If a setting is present in both ConfigMaps, the
`yunikorn-configs` setting will override the one present in `yunikorn-defaults`.

The purpose of `yunikorn-defaults` is to provide a mechanism for Helm to configure
initial service configuration details. It should not be modified directly.

The `yunikorn-configs` ConfigMap is completely unmanaged by Helm, and is meant for
configurations which may change over time, such as queue configuration. All changes
to YuniKorn configuration outside of provisioning infrastructure should be made here.

### Default ConfigMap

If neither ConfigMap is provided, or if an option is not specified, YuniKorn will
use the default values listed here:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yunikorn-configs
data:
  service.clusterId: "mycluster"
  service.policyGroup: "queues"
  service.schedulingInterval: "1s"
  service.volumeBindTimeout: "10s"
  service.eventChannelCapacity: "1048576"
  service.dispatchTimeout: "5m"
  service.disableGangScheduling: "false"
  service.enableConfigHotRefresh: "true"
  service.placeholderImage: "registry.k8s.io/pause:3.7"
  service.instanceTypeNodeLabelKey: "node.kubernetes.io/instance-type"
  health.checkInterval: "30s"
  log.level: "INFO"
  kubernetes.qps: "1000"
  kubernetes.burst: "1000"
  admissionController.webHook.amServiceName: "yunikorn-admission-controller-service"
  admissionController.webHook.schedulerServiceAddress: "yunikorn-service:9080"
  admissionController.filtering.processNamespaces: ""
  admissionController.filtering.bypassNamespaces: "^kube-system$"
  admissionController.filtering.labelNamespaces: ""
  admissionController.filtering.noLabelNamespaces: ""
  admissionController.filtering.generateUniqueAppId: "false"
  admissionController.filtering.defaultQueue: "root.default"
  admissionController.accessControl.bypassAuth: "false"
  admissionController.accessControl.trustControllers: "true"
  admissionController.accessControl.systemUsers: "^system:serviceaccount:kube-system:"
  admissionController.accessControl.externalUsers: ""
  admissionController.accessControl.externalGroups: ""
  queues.yaml: |
    partitions:
      - name: default
        placementrules:
          - name: tag
            value: namespace
            create: true
        queues:
          - name: root
            submitacl: '*'
```
### Service settings
The following parameters are understood by YuniKorn:

#### service.clusterId
Sets an identifier for the cluster being configured. This is returned as part
of REST API calls.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `mycluster`

Example:
```yaml
service.clusterId: "yunikorn-east"
```
#### service.policyGroup
Defines the policy group in use by this scheduler. The policy group is used to
choose one of several queue configurations. The value of this setting plus an
extension of `.yaml` controls the ConfigMap entry used to retrieve partition
and queue configuration.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `queues`

Example:
```yaml
service.policyGroup: group_b
group_b.yaml: |
    partitions:
      - name: default
        placementrules:
          - name: tag
            value: namespace
            create: true
        queues:
          - name: root
            submitacl: '*'
```

#### service.schedulingInterval
Controls the frequency with which YuniKorn executes scheduling runs.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `1s`

Example:
```yaml
service.schedulingInterval: "5s"
```
#### service.volumeBindTimeout
Controls the timeout before volume binding fails.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `10s`

Example:
```yaml
service.volumeBindTimeout: "30s"
```
#### service.eventChannelCapacity
Controls the number of internal scheduling events that YuniKorn will allow
to be in-flight at one time. This acts as an out-of-memory guard.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `1048576`

Example:
```yaml
service.eventChannelCapacity: "1000000"
```
#### service.dispatchTimeout
Controls how long internal events will reattempt dispatching if the event
channel is full. Warnings will be emitted if this timeout is exceeded.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `5m`

Example:
```yaml
service.dispatchTimeout: "10m"
```
#### service.disableGangScheduling
Allows global disabling of the gang scheduling feature (not recommended).

A change to this setting requires a restart of YuniKorn to take effect.

Default: `false`

Example:
```yaml
service.disableGangScheduling: "true"
```
#### service.enableConfigHotRefresh
Controls whether configuration should be hot-reloaded. By default, this
is set to `true`, but it can be disabled to avoid changes to the
ConfigMaps from being picked up until a scheduler restart.

A change to this setting will be picked up without a restart of YuniKorn.

NOTE: If this setting is disabled, it may not be re-enabled again without
a restart of YuniKorn.

Default: `true`

Example:
```yaml
service.enableConfigHotRefresh: "false"
```
#### service.placeholderImage
Sets the Pod image that will be used for gang scheduling placeholders.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `registry.k8s.io/pause:3.7`

Example:
```yaml
service.placeholderImage: "registry.k8s.io/pause:3.6"
```
#### service.instanceTypeNodeLabelKey
Sets the node label that will be used to determine the instance type of node.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `node.kubernetes.io/instance-type`

Example:
```yaml
service.instanceTypeNodeLabelKey: "node.kubernetes.io/my-instance-type"
```

### Event system settings

#### event.trackingEnabled
Enables or disables the event system and event generation.

Default: `true`

Example:
```yaml
event.trackingEnabled: "false"
```

#### event.ringbufferCapacity
Sets the capacity of the ring buffer which stores Yunikorn generated events.

Default: `10000`

Example:
```yaml
event.ringbufferCapacity: "300000"
```

#### event.maxStreams
Sets the maximum number of event stream connections.

Default: `100`

Example:
```yaml
event.maxStreams: "50"
```

#### event.maxStreamsPerHost
Sets the maximum number of event stream connections from a given host.

Default: `15`

Example:
```yaml
event.maxStreamsPerHost: "5"
```

### Health settings

#### health.checkInterval
Sets the time between automatic health checks of YuniKorn.

Setting the value to `0` or a negative interval will disable background health
checking.

A change to this setting will be picked up without a restart of YuniKorn.

Default: `30s`

Example:
```yaml
health.checkInterval: "1m"
```
### Log settings

#### log.level
Sets the default verbosity that YuniKorn will log at.

A change to this setting will be picked up without a restart of YuniKorn. The available
values can be numeric or textual:

- `-1` / `debug` / `DEBUG`
- `0` / `info` / `INFO`
- `1` / `warn` / `WARN`
- `2` / `error` / `ERROR`
- `3` / `dpanic` / `DPANIC`
- `4` / `panic` / `PANIC`
- `5` / `fatal` / `FATAL`

Default: `INFO`

Example:
```yaml
log.level: "DEBUG"
```

#### log.{subsystem}.level
Sets the verbosity that YuniKorn subsystem will log at.

Yunikorn allows fine-grained logging configuration in a hierarchical manner. For example, 
setting an entry for `log.core.level` will configure all loggers that start with `core.` 
(including `core.scheduler`, etc.) unless a more specific configuration is present. 
Each subsystem[^1] has its log level.

A change to this setting will be picked up without a restart of YuniKorn. The available
values can be numeric or textual:

- `-1` / `debug` / `DEBUG`
- `0` / `info` / `INFO`
- `1` / `warn` / `WARN`
- `2` / `error` / `ERROR`
- `3` / `dpanic` / `DPANIC`
- `4` / `panic` / `PANIC`
- `5` / `fatal` / `FATAL`

Default: `INFO`

Example:

The `log.level` is the default log level for all loggers.

```yaml
log.level: "INFO"
log.admission.level: "DEBUG"
log.core.config.level: "INFO"
```

### Kubernetes settings

#### kubernetes.qps
Sets the number of Kubernetes queries per second (QPS) used by YuniKorn's
Kubernetes client. This number must be >= 0.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `1000`

Example:
```yaml
kubernetes.qps: "500"
```
#### kubernetes.burst
Sets the maximum size of bursty queries to Kubernetes, temporarily allowing
events to burst to this number while not still exceeding `kubernetes.qps`.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `1000`

Example:
```yaml
kubernetes.burst: "500"
```
### Admission controller webhook settings

#### admissionController.webHook.amServiceName
Sets the name of the service that the YuniKorn admission controller is
registered under. This is required for the admission controller to register
itself properly with Kubernetes, and should normally not be changed.

A change to this setting requires a restart of the YuniKorn admission controller
to take effect.

Default: `yunikorn-admission-controller-service`

Example:
```yaml
admissionController.webHook.amServiceName: "yunikorn-admission-controller-alt-service-name"
```
#### admissionController.webHook.schedulerServiceAddress
Sets the address of the YuniKorn scheduler service. This address must be
reachable by the admission controller, and is used by the admission
controller when validating ConfigMap changes. The admission controller
will contact the REST API on the scheduler to validate any proposed
ConfigMap changes. This setting should not normally be changed.

A change to this setting requires a restart of the YuniKorn admission controller
to take effect.

Default: `yunikorn-service:9080`

Example:
```yaml
admissionController.webHook.schedulerServiceAddress: "alt-yunikorn-service:9080"
```
### Admission controller filtering settings

#### admissionController.filtering.processNamespaces
Controls which namespaces will have pods forwarded to YuniKorn for scheduling.

This setting is a comma-separated list of regular expressions. If this setting
is an empty string, pods created in all namespaces will be scheduled by YuniKorn.

A change to this setting will be picked up without a restart of the admission controller.

Default: empty

Example:
```yaml
# Schedule only pods in spark-* and mpi-* namespaces with YuniKorn
admissionController.filtering.processNamespaces: "^spark-,^mpi-"
```
#### admissionController.filtering.bypassNamespaces
Controls which namespaces will *not* have pods forwarded to YuniKorn for scheduling.
This acts as an exception list to `admissionController.filtering.processNamespaces`.

This setting is a comma-separated list of regular expressions. If this setting
is an empty string, no pods in any namespaces will be excluded from processing by
YuniKorn.

By default, this setting excludes pods in the `kube-system` namespace as scheduling
of these pods is often required for a node to be added to a cluster successfully.
This could possibly prevent starting of YuniKorn itself or other critical services.

A change to this setting will be picked up without a restart of the admission controller.

Default: `^kube-system$`

Example:
```yaml
# Don't schedule pods in kube-system or fluentd-* namespaces
admissionController.filtering.bypassNamespaces: "^kube-system$,^fluentd-"
```

> **_NOTE :_**  
> To simplify management, you can directly set the `yunikorn.apache.org/namespace.enableYunikorn` annotation on the namespace itself, regardless of whether it is specified in a regular expression. This annotation enables you to determine if the namespace should be managed by Yunikorn.

#### admissionController.filtering.labelNamespaces
Controls which namespaces will have pods labeled with an `applicationId`. By default,
all pods which are scheduled by YuniKorn will have an `applicationId` label applied.

When running YuniKorn using the standard deployment model, all pods should be labeled,
as YuniKorn is unable to schedule pods without an `applicationId` defined.

When running YuniKorn using the scheduler plugin deployment model, this setting can
be used to filter which namespaces should be scheduled via YuniKorn's queueing model,
and which should bypass queueing and be scheduled by the embedded default scheduler.

This setting is a comma-separated list of regular expressions. If this setting
is an empty string, all pods forwarded to YuniKorn will have an `applicationId` label
applied.

A change to this setting will be picked up without a restart of the admission controller.

Default: empty

Example:
```yaml
# Add applicationId labels to pods spark-* namespaces
admissionController.filtering.labelNamespaces: "^spark-"
```
#### admissionController.filtering.noLabelNamespaces
Controls which namespaces will *not* have pods labeled with an `applicationId`. This
acts as an exception list to `admissionController.filtering.labelNamespaces`.

When running YuniKorn using the standard deployment model, all pods should be labeled,
as YuniKorn is unable to schedule pods without an `applicationId` defined.

When running YuniKorn using the scheduler plugin deployment model, this setting can
be used to filter which namespaces should be scheduled via YuniKorn's queueing model,
and which should bypass queueing and be scheduled by the embedded default scheduler.

This setting is a comma-separated list of regular expressions. If this setting
is an empty string, no exclusions to `admissionController.filtering.labelNamespaces` will
be applied.

A change to this setting will be picked up without a restart of the admission controller.

Default: empty

Example:
```yaml
# Skip queueing in the noqueue namespace
admissionController.filtering.labelNamespaces: "^noqueue$"
```

> **_NOTE :_**
> To simplify management, you can directly set the `yunikorn.apache.org/namespace.generateAppId` annotation on the namespace itself, regardless of whether it is specified in a regular expression. This annotation enables you to determine if the namespace should be labeled by Yunikorn.

#### admissionController.filtering.generateUniqueAppId
YuniKorn generates `applicationId` for all the apps that do not have an `applicationId` to start with. This property controls if a *unique* `applicationId` should be generated for each such application or all the apps in a namespace should be bundled under a single `applicationId`.

This setting is turned off by default and only one `applicationId` will be generated per namespace.

When enabled, unique `applicationId` is generated using the namespace and the application's pod uid.

Default: `false`

Example:
```yaml
admissionController.filtering.generateUniqueAppId: "true"
```

#### admissionController.filtering.defaultQueue
Controlls what will be the default queue name for the application.

If the application does not define a queue name during app submission, admission controller will add a default queue name to the pod labels. `root.default` queue name will be added to the pod labels if this property is not set.

In case, the default queue name needs to be updated to something other than `root.default`,  `admissionController.filtering.defaultQueue` can be set with the desired queue name.

Example:
```yaml
# Change default queue to root.mydefault
admissionController.filtering.defaultQueue: "root.mydefault"
```

**_NOTE :_**
The queue name needs to be a fully qualified queue name.

For certain use-cases, there may be a need to skip adding a default queue name to the pod labels. In such cases, `admissionController.filtering.defaultQueue` can be set to empty string.

Adding default queue name should be avoided when `provided` rule is used in conjunction with other placement rules and `provided` rule is higher in the hierarchy. If default queue label is added whenever there is no queue name specified, all the apps will be placed via `provided` rule and the other rules after that will never be executed.

Default: `root.default`

Example:
```yaml
# Skip adding default queue name
admissionController.filtering.defaultQueue: ""
```

### Admission controller ACL settings

#### admissionController.accessControl.bypassAuth
Allow external users to create pods with user information already set.

A change to this setting will be picked up without a restart of the admission controller.

Default: `false`

Example:
```yaml
admissionController.accessControl.bypassAuth: "true"
```
#### admissionController.accessControl.trustControllers
Allow controller users to create pods with user information already set.

A change to this setting will be picked up without a restart of the admission controller.

Default: `true`

Example:
```yaml
admissionController.accessControl.trustControllers: "false"
```
#### admissionController.accessControl.systemUsers
Comma-separated list of regular expressions that match allowed controller
service accounts.

A change to this setting will be picked up without a restart of the admission controller.

Default: `^system:serviceaccount:kube-system:`

Example:
```yaml
# allow all kube-system accounts as well as kube-controller-manager
admissionController.accessControl.systemUsers: "^system:serviceaccount:kube-system,^system:kube-controller-manager$"
```
#### admissionController.accessControl.externalUsers
Comma-separated list of regular expressions that match allowed external users.

A change to this setting will be picked up without a restart of the admission controller.

Default: empty

Example:
```yaml
# allow 'alice', 'bob', and 'admin-*'
admissionController.accessControl.externalUsers: "^alice$,^bob$,^admin-"
```
#### admissionController.accessControl.externalGroups
Comma-separated list of regular expressions that match allowed external groups.

A change to this setting will be picked up without a restart of the admission controller.

Default: empty

Example:
```yaml
# allow 'sales', 'marketing', and 'admin-*'
admissionController.accessControl.externalGroups: "^sales$,^marketing$,^admin-"
```

### Using compressed values

The data in ConfigMap cannot exceed 1 MiB. YuniKorn supports the gzip algorithm to decompress data in the `binaryData` field.
If a key ends with `.gz`. YuniKorn will treat the value as gzip-compressed data and decompress it automatically. The base64 encoding is automatically.
If a value is set in both the `data` and `binaryData` sections, the value in the `binaryData` section will be used.

Example:

Users can run the command to get the value.

```bash
echo "
partitions:
  - name: default
    queues:
      - name: root
        submitacl: '*'
        parent: true
        queues:
          - name: parent
            submitacl: '*'" | gzip | base64
```

Set the result in the `binaryData` field.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yunikorn-configs
binaryData:
  queues.yaml.gz: "H4sIAMyHs2UAA2WMSQ6AIBAE77yibyQmfoDfoI4JCYvCzP/FjWDsY3Wl1GYzO3YpFqOAEdEGMlhoteK5EmAXErrec6+RU+IHAUWm4NjO3kAPuuHapsgGnIUa/Ob65K13xy98AFwE9HmuAAAA"
```

### Deprecated settings

#### service.operatorPlugins

**_DEPRECATED in 1.4.0:_** No replacement

Controls the set of operator plugins which are enabled within YuniKorn.
Currently, only the `general` plugin is implemented, and the plugin
functionality will be removed entirely in a future release.  The `general`
plugin should not be disabled as it is critical to the proper operation of
YuniKorn.

A change to this setting requires a restart of YuniKorn to take effect.

Default: `general`

Example:
```yaml
service.operatorPlugins: "general"
```

[^1]: Available log subsystem values:
    - admission
    - admission.client
    - admission.conf
    - admission.utils
    - admission.webhook
    - core
    - core.config
    - core.entrypoint
    - core.events
    - core.metrics
    - core.opentracing
    - core.resources
    - core.rest
    - core.rmproxy
    - core.rpc
    - core.scheduler
    - core.scheduler.allocation
    - core.scheduler.application
    - core.scheduler.application.usage
    - core.scheduler.context
    - core.scheduler.fsm
    - core.scheduler.health
    - core.scheduler.node
    - core.scheduler.partition
    - core.scheduler.preemption
    - core.scheduler.queue
    - core.scheduler.reservation
    - core.scheduler.ugm
    - core.security
    - core.utils
    - deprecation
    - kubernetes
    - shim
    - shim.appmgmt
    - shim.appmgmt.general
    - shim.appmgmt.sparkoperator
    - shim.cache.application
    - shim.cache.external
    - shim.cache.node
    - shim.cache.placeholder
    - shim.cache.task
    - shim.client
    - shim.config
    - shim.context
    - shim.dispatcher
    - shim.framework
    - shim.fsm
    - shim.predicates
    - shim.resources
    - shim.rmcallback
    - shim.scheduler
    - shim.scheduler.plugin
    - shim.utils
