/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    docs: {
        'Get Started': [
            'get_started/user_guide',
            'get_started/core_features',
            'get_started/version'
        ],
        'User Guide': [
            'user_guide/deployment_modes',
            'user_guide/service_config',
            'user_guide/queue_config',
            'user_guide/placement_rules',
            'user_guide/usergroup_resolution',            
            'user_guide/sorting_policies',
            'user_guide/priorities',
            'user_guide/preemption_cases',
            'user_guide/acls',
            'user_guide/resource_quota_management',
            'user_guide/gang_scheduling',
            'user_guide/labels_and_annotations_in_yunikorn',
            'user_guide/prometheus',
            'user_guide/use_cases',
            'user_guide/event_system',
            {
                type: 'category',
                label: 'Workloads',
                items: [
                    'user_guide/workloads/workload_overview',
                    'user_guide/workloads/run_nvidia',
                    'user_guide/workloads/run_spark',
                    'user_guide/workloads/run_flink',
                    'user_guide/workloads/run_tf',
                    'user_guide/workloads/run_mpi'
                ],
            },
            {
                type: 'category',
                label: 'REST APIs',
                items: [
                    'api/cluster',
                    'api/scheduler',
                    'api/system'
                ]
            },
            {
                type: 'category',
                label: 'Metrics for Prometheus',
                items: [
                    'metrics/scheduler',
                    'metrics/runtime',
                    'metrics/queue',
                ]
            },
            'user_guide/troubleshooting'
        ],
        'Developer Guide': [
            'developer_guide/env_setup',
            'developer_guide/build',
            'developer_guide/dependencies',
            'developer_guide/deployment',
            'developer_guide/openshift_development',
            'developer_guide/scheduler_object_states',
            'developer_guide/e2e_test',
            {
                type: 'category',
                label: 'Designs',
                items: [
                    'design/architecture',
                    'design/scheduler_plugin',
                    'design/gang_scheduling',
                    'design/user_group',
                    'design/user_based_resource_usage_tracking',
                    'design/user_group_resource_usage_enforcement',
                    'design/historical_usage_tracking',
                    'design/interface_message_simplification',
                    'design/cache_removal',
                    'design/preemption',
                    'design/simple_preemptor',
                    'design/generic_resource',
                    'design/priority_scheduling',
                    'design/resilience',
                    'design/config_v2',
                    'design/scheduler_configuration',
                ]
            },
            {
                type: 'category',
                label: 'Archived Designs',
                items: [
                    'archived_design/k8shim',
                    'archived_design/namespace_resource_quota',
                    'archived_design/predicates',
                    'archived_design/scheduler_core_design',
                    'archived_design/state_aware_scheduling',
                    'archived_design/cross_queue_preemption',
                    'archived_design/pluggable_app_management',
                ]                
            },
        ],
        'Performance': [
            'performance/evaluate_perf_function_with_kubemark',
            'performance/evaluate_perf_function_with_kwok',
            'performance/performance_tutorial',
            'performance/metrics',
            'performance/profiling'
        ]
    },
};
