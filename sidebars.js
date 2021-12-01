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
            'get_started/core_features'
        ],
        'User Guide': [
            'user_guide/queue_config',
            'user_guide/placement_rules',
            'user_guide/usergroup_resolution',            
            'user_guide/sorting_policies',
            'user_guide/acls',
            'user_guide/resource_quota_management',
            'user_guide/gang_scheduling',
            {
                type: 'category',
                label: 'Workloads',
                items: [
                    'user_guide/workloads/run_spark',
                    'user_guide/workloads/run_flink',
                    'user_guide/workloads/run_tf'
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
            'user_guide/trouble_shooting'
        ],
        'Developer Guide': [
            'developer_guide/env_setup',
            'developer_guide/build',
            'developer_guide/deployment',
            'developer_guide/openshift_development',
            {
                type: 'category',
                label: 'Designs',
                items: [
                    'design/architecture',
                    'design/scheduler_core_design',
                    'design/cache_removal',
                    'design/k8shim',
                    'design/cross_queue_preemption',
                    'design/namespace_resource_quota',
                    'design/pluggable_app_management',
                    'design/resilience',
                    'design/predicates',
                    'design/scheduler_configuration',
                    'design/state_aware_scheduling',
                    'design/scheduler_object_states',
                    'design/gang_scheduling'
                ]
            },
        ],
        'Performance': [
            'performance/evaluate_perf_function_with_kubemark',
            'performance/performance_tutorial',
            'performance/metrics',
            'performance/profiling'
        ]
    },
};
