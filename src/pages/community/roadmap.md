---
id: roadmap
title: Roadmap
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

# Future development: long term goals

- Application and task priority support
- Preemption of allocations
- User and group quota and limit enforcement
- Offer an alternative mode of deployment as plugins to the default scheduler, in addition to the current standalone mode

# Next Release Development

Release Details:
- Version: 1.0.0
- Target release date: March 2022
- Release manager: Wilfred Spiegelenburg
- Development status: [Issue tracker](https://issues.apache.org/jira/issues/?filter=12348416)

Planned major features:
- [YUNIKORN-971](https://issues.apache.org/jira/browse/YUNIKORN-971) Implement YuniKorn as a Kubernetes scheduler plugin
- [YUNIKORN-978](https://issues.apache.org/jira/browse/YUNIKORN-978) Admission controller deployment improvements
- [YUNIKORN-984](https://issues.apache.org/jira/browse/YUNIKORN-984) Enforcing User and Group limits (phase 1)
- [YUNIKORN-954](https://issues.apache.org/jira/browse/YUNIKORN-954) Remove old REST api
- [YUNIKORN-720](https://issues.apache.org/jira/browse/YUNIKORN-720) Improved queue metrics

Supported Kubernetes versions and the Kubernetes dependency will be defined and finalised during the development cycle. 

# Past Releases

| Version   | Release Date   |   Release Manager 	 | Release Note                                       |
|-----------|:--------------:|:---------------------:|----------------------------------------------------|
| 0.12.1    |   2021-12-26   | Chaoran Yu            | [0.12.1-release-notes](../release-announce/0.12.1) |
| 0.11.0    |   2021-08-18   | Kinga Marton          | [0.11.0-release-notes](../release-announce/0.11.0) |
| 0.10.0  	|   2021-04-09   | Tao Yang              | [0.10.0-release-notes](../release-announce/0.10.0) |
| 0.9.0   	|   2020-08-28   | Wilfred Spiegelenburg | [0.9.0-release-notes](../release-announce/0.9.0)   |
| 0.8.0   	|   2020-05-04   | Weiwei Yang           | [0.8.0-release-notes](../release-announce/0.8.0)   |
