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
            'get_started/run_sample_workloads',
            'get_started/run_non_modified_k8s_apps',
            'get_started/run_spark',
            'get_started/run_tf'
        ],
        'Developer Guide': [
            'developer_guide/developer_guide',
            'developer_guide/env_setup',
            'developer_guide/deployment'
        ],
        'Configuration': [
            'configuration/queue_config',
            'configuration/placement_rules',
            'configuration/acls',
            'configuration/sorting_policies'
        ],
        'Performance': [
            'performance/evaluate_perf_function_with_kubemark',
            'performance/metrics',
            'performance/profiling'
        ],
        'Design': [
            'design/architecture',
            'design/scheduler_core_design',
            'design/cross_queue_preemption',
            'design/namespace_resource_quota',
            'design/pluggable_app_management',
            'design/resilience',
            'design/scheduler_configuration',
            'design/state_aware_scheduling',
            'design/scheduler_object_states'
        ],
    },
};
