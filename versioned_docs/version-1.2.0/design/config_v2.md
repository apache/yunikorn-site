---
id: config_v2
title: Configuration V2
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

## Introduction

Over time the YuniKorn configuration has increased in complexity. The current
configuration for YuniKorn is split over a number of different options, file
and command line, and formats. There is a requirement now to define an overall
configuration approach that can be used for all components.

### Goals

- Define a configuration format
- Define an update and modification strategy
- Provide consistency between configuration of YuniKorn components
- Legacy migration strategy

### Non-Goals

- Redefine the queue configuration
- Migration timeline for the old configuration options

### References

#### Implementation JIRA

[YUNIKORN-1221](https://issues.apache.org/jira/browse/YUNIKORN-1221) - [Umbrella] Configuration V2

#### Other relevant JIRAs

- [YUNIKORN-455](https://issues.apache.org/jira/browse/YUNIKORN-455) - Make the core configurable
- [YUNIKORN-1213](https://issues.apache.org/jira/browse/YUNIKORN-1213) - Background health checker needs to be configurable
- [YUNIKORN-1335](https://issues.apache.org/jira/browse/YUNIKORN-1335) - Write yunikorn-web error logs to stderr

### Services to cover

- Scheduler (Standard) - K8Shim + Core
- Scheduler (Plugin) - K8Shim + Core
- Admission controller

### Services excluded

  - Web UI (not needed after [YUNIKORN-1335](https://issues.apache.org/jira/browse/YUNIKORN-1335))

## Configuration format

Currently only Kubernetes is a supported deployment pattern. Future shims may
need an alternative configuration syntax. To enable this, we will update the
scheduler interface to support passing the core configuration (the content of
the `queues.yaml` ConfigMap entry) to the core on startup and refresh. The
existing config watcher functionality in the core will be removed and the shim
will gain the responsibility for watching for ConfigMap changes. The shim
actually already has this ability now, it is just not used.

We will use two ConfigMaps to configure YuniKorn:
 - `yunikorn-defaults`
   - This will be a new ConfigMap written by Helm; it will contain only values
     explicitly configured by an administrator via Helm variables.
 - `yunikorn-configs`
   - This ConfigMap will contain overrides for yunikorn-defaults. It was
     previously a Helm hook in previous YuniKorn releases; it will no longer
     be managed by Helm and may be updated freely by third-party tools.

The effective configuration will be the combination of both `yunikorn-defaults`
 and `yunikorn-configs`, with `yunikorn-configs` taking precedence.
 
Neither ConfigMap (even the existing one) is required for proper functionality.
In the case where a ConfigMap does not exist, we will use compiled-in defaults
for all options. This enables bootstrapping in a variety of environments,
including local development mode, as the ConfigMap need not exist to bring the
scheduler components up. Future configuration options should be set via the
ConfigMap exclusively.

### Mutability of configuration values

We should strive for hot-reload of all configuration values where possible.
Where hot-reload is not implemented, this should be clearly documented. For the
initial release, the core config and admission controller will be
hot-reloadable but many items in the shim will likely not be. The shim was not
designed to hot-reload anything so this will be a large future task. Some items
may never be reloadable due to architectural limitations.

### Update handling

Given the security issues involved with updates, the default Kubernetes access
control alone should be used for ConfigMap updates. We can still syntax-check
the core side of the configuration in the admission controller as before.
Partial updates are allowed as Kubernetes supports patching of ConfigMaps.

### Legacy configuration handling

Helm will be updated to render all existing legacy options into the
`yunikorn-defaults` ConfigMap for easier transition to the new configuration
format. Consequently, it is not necessary for YuniKorn components to parse the
old environment and command-line arguments.

### Environment variables

All environment variables for all services will be removed, with the exception
of:

 - `NAMESPACE`
   - Default value: `default`
   - Will be auto-populated from Helm and resolve to the pod's running
     namespace
   - Needed so that YuniKorn can determine what namespace it was launched in
   - Should only be provided explicitly at development time
 - `KUBECONFIG`
   - Default value: `$HOME/.kube/config`
   - Will be ignored if running inside Kubernetes; in-cluster configuration
     will be used in that case
   - Needed so that we can bootstrap to K8s and load the YuniKorn ConfigMap at
     runtime
   - Should only be provided explicitly at development time

### Helm considerations

All configuration options which have moved into the ConfigMap will be marked as
deprecated in the Helm chart documentation. Their replacement is the more
generic `yunikornDefaults` dictionary. If the legacy values are present but
the associated `yunikornDefaults` entry is missing, the legacy configuration
value will be used. This will allow users some time to migrate to the new
configuration style. The legacy attributes will be removed in a future release.

### Core Configuration

The core scheduler configuration is loaded from the `queues.yaml` section of
the ConfigMap, assuming `service.policyGroup` is set to the default value
`queues`. If the policy group has been customized, core scheduler configuration
will be read from `{service.policyGroup}.yaml`. This section is special as its
contents are passed directly to the core for evaluation and update and is not
read directly by the shim. The content of this section is unchanged from prior
releases.

## Appendix

### Default ConfigMap

If not present, the default ConfigMap will resolve to these defaults.
Additionally, individual options will resolve to those listed here if not
specified. Note that these values are subject to change in future releases.

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
      service.operatorPlugins: "general"
      service.disableGangScheduling: "false"
      service.enableConfigHotRefresh: "true"
      service.placeholderImage: "registry.k8s.io/pause:3.7"
      health.checkInterval: "30s"
      log.level: "0"
      kubernetes.qps: "1000"
      kubernetes.burst: "1000"
      admissionController.webHook.amServiceName: "yunikorn-admission-controller-service"
      admissionController.webHook.schedulerServiceAddress: "yunikorn-service:9080"
      admissionController.filtering.processNamespaces: ""
      admissionController.filtering.bypassNamespaces: "^kube-system$"
      admissionController.filtering.labelNamespaces: ""
      admissionController.filtering.noLabelNamespaces: ""
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
                submitacl: '*'`

### Admission Controller Configuration

#### Removed Environment Variables
 - `POLICY_GROUP`
   - Use ConfigMap: `service.policyGroup`
 - `ENABLE_CONFIG_HOT_REFRESH`
   - Use ConfigMap: `service.enableConfigHotRefresh`
 - `SCHEDULER_SERVICE_ADDRESS`
   - Use ConfigMap: `admissionController.webHook.schedulerServiceAddress`
 - `ADMISSION_CONTROLLER_SERVICE`
   - Use ConfigMap: `admissionController.webHook.amServiceName`
 - `ADMISSION_CONTROLLER_NAMESPACE`
   - Use Environment variable: `NAMESPACE`
 - `ADMISSION_CONTROLLER_PROCESS_NAMESPACES`
   - Use ConfigMap: `admissionController.filtering.processNamespaces`
 - `ADMISSION_CONTROLLER_BYPASS_NAMESPACES`
   - Use ConfigMap: `admissionController.filtering.bypassNamespaces`
 - `ADMISSON_CONTROLLER_LABEL_NAMESPACES`
   - Use ConfigMap: `admissionController.filtering.labelNamespaces`
 - `ADMISSION_CONTROLLER_NO_LABEL_NAMESPACES`
   - Use ConfigMap: `admissionController.filtering.noLabelNamespaces`

#### Removed CLI Options
None

### Scheduler (Standard) Configuration

#### Removed Environment Variables
 - `USER_LABEL_KEY`
   - No replacement
 - `OPERATOR_PLUGINS`
   - Use ConfigMap: `service.operatorPlugins`
 - `PLACEHOLDER_IMAGE`
   - Use ConfigMap: `service.placeholderImage`

#### Removed CLI Options
 - `-clusterId`
   - Use ConfigMap: `service.clusterId`
 - `-clusterVersion`
   - No replacement
 - `-policyGroup`
   - Use ConfigMap: `service.policyGroup`
 - `-interval`
   - Use ConfigMap: `service.schedulingInterval`
 - `-logLevel`
   - Use ConfigMap: `log.level`
 - `-logEncoding`
   - No replacement
 - `-logFile`
   - No replacement
 - `-volumeBindTimeout`
   - Use ConfigMap: `service.volumeBindTimeout`
 - `-eventChannelCapacity`
   - Use ConfigMap: `service.eventChannelCapacity`
 - `-dispatchTimeout`
   - Use ConfigMap: `service.dispatchTimeout`
 - `-kubeQPS`
   - Use ConfigMap: `kubernetes.qps`
 - `-kubeBurst`
   - Use ConfigMap: `kubernetes.burst`
 - `-operatorPlugins`
   - Use ConfigMap: `service.operatorPlugins`
 - `-enableConfigHotRefresh`
   - Use ConfigMap: `service.enableConfigHotRefresh`
 - `-disableGangScheduling`
   - Use ConfigMap: `service.disableGangScheduling`
 - `-userLabelKey`
   - No replacement
 - `-placeHolderImage`
   Use ConfigMap: `service.placeholderImage`

### Scheduler (Plugin) Configuration

#### Removed Environment Variables
 - `USER_LABEL_KEY`
   - No replacement
 - `OPERATOR_PLUGINS`
   - Use ConfigMap: `service.operatorPlugins`
 - `PLACEHOLDER_IMAGE`
   - Use ConfigMap: `service.placeholderImage`

#### Removed CLI Options
 - `--yk-scheduler-name`
   - No replacement
 - `--yk-cluster-id`
   - Use ConfigMap: `service.clusterId`
 - `--yk-cluster-version`
   - No replacement
 - `--yk-policy-group`
   - Use ConfigMap: `service.policyGroup`
 - `--yk-scheduling-interval
   - Use ConfigMap: `service.schedulingInterval`
 - `--yk-kube-config`
   - Use environment: `KUBECONFIG`
 - `--yk-log-level`
   - Use ConfigMap: `log.level`
 - `--yk-log-encoding`
   - No replacement
 - `--yk-log-file`
   - No replacement
 - `--yk-event-channel-capacity`
   - Use ConfigMap: `service.eventChannelCapacity`
 - `--yk-dispatcher-timeout`
   - Use ConfigMap: `service.dispatchTimeout`
 - `--yk-kube-qps`
   - Use ConfigMap: `kubernetes.qps`
 - `--yk-kube-burst`
   - Use ConfigMap: `kubernetes.burst`
 - `--yk-operator-plugins`
   - Use ConfigMap: `service.operatorPlugins`
 - `--yk-enable-config-hot-refresh`
   - Use ConfigMap: `service.enableConfigHotRefresh`
 - `--yk-disable-gang-scheduling`
   - Use ConfigMap: `service.disableGangScheduling`
 - `--yk-user-label-key`
   - No replacement
 - `--yk-placeholder-image`
   - Use ConfigMap: `service.placeholderImage`

### Helm Configuration

#### Removed Options
 - `userLabelKey`
   - No replacement

#### Deprecated Options
 - `operatorPlugins`
   - Use ConfigMap: `service.operatorPlugins`
 - `placeHolderImage`
   - Use ConfigMap: `service.placeholderImage`
 - `admissionController.processNamespaces`
   - Use ConfigMap: `admissionController.filtering.processNamespaces`
 - `admissionController.bypassNamespaces`
   - Use ConfigMap: `admissionController.filtering.bypassNamespaces`
 - `admissionController.labelNamespaces`
   - Use ConfigMap: `admissionController.filtering.labelNamespaces`
 - `admissionController.noLabelNamespaces`
   - Use ConfigMap: `admissionController.filtering.noLabelNamespaces`
 - `configuration`
   - Use ConfigMap: `queues.yaml`

