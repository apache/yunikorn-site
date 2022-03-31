---
id: reporting_issues
title: Reporting Issues
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

## Reporting a security issue
YuniKorn community cares deeply about the security and actively addresses any security issues as
the top priority. We follow the Apache security guidelines for handling security issues, please see the Apache doc
about [handling security issues](https://www.apache.org/security/). If you find any security issue,
please send a vulnerability report to [security@apache.org](mailto:security@apache.org), the YuniKorn security team will assess the issue
immediately and work with the reporter on a plan to fix it. 
Please do not disclose the issue to any public forum before working with the security team.

## Non security issues
If you have an issue with YuniKorn operation, please follow these guidelines:

If you are having an issue with setup, configuration, or some other form of behavior not matching your expectation, join the user mailing list and ask your questions in that forum.
See the [Get Involved](get_involved#communication-channels) page for information on mailing lists.
You can also ask the YuniKorn slack channel for help, details on how to join can be found on the same page.
If you have a bug that needs a fix in the code or in the documentation, please follow the procedure in [Filing a JIRA](#filing-a-jira-for-yunikorn-issues) below.

JIRA is used by the Apache YuniKorn project to track all issues.
These include:
1. Add new features
1. Improving existing features
1. Report bugs that need to be fixed in the codebase

If you are interested in tracking development issues in JIRA, you can browse this [link](https://issues.apache.org/jira/projects/YUNIKORN).

## Filing a JIRA for YuniKorn issues
Go to the Apache JIRA page to file your issue.

Make sure the Project is set to YuniKorn. Set the issue type field appropriately based on your analysis or request:
* Bug
* New Feature
* Improvement
* Test
* Wish
* Task

For Summary, please provide a detailed title e.g. _K8 pod not scheduled in an empty cluster_ instead of just _YuniKorn scheduling failed_.

Please set the component field if you have isolated the issue to a particular component:

| Component           | Description                                         |
|---------------------|-----------------------------------------------------|
| build               | Project build, build scripts, and git issues        |
| core - common       | Common code, like resources, for the core scheduler |
| core - scheduler    | Core scheduling issues                              |
| documentation       | Documentation fixes and enhancements                |
| scheduler-interface | Scheduler interface specification                   |
| security            | Security related issues (encryption, authz & authn) |
| shim - kubernetes   | K8shim issues                                       |
| shim - yarn         | Hadoop YARN shim issues                             |
| test - smoke        | Smoke test failures                                 |
| test - unit         | Unit test failures                                  |
| webapp              | Web UI for the scheduler                            |
| website             | Website content (does not include documentation)    |

The Affects Versions/s field can be set to the earliest version of YuniKorn where you have seen the bug.
If you are not sure then just leave it empty.
Additionally, do not set the Fix Version. Committers use this field to determine which branches have had patches committed.
Instead, use the Affects and Target Versions to notify others of the branches that should be considered.

:::note
You can set the label for a JIRA to *newbie* if you think that it is a good issue for someone who is not familiar with the project yet.
:::

If you are a developer intending to fix the bug, put your JIRA ID in the Assignee field.
Note that you need to be in the contributors list of Apache YuniKorn in order to be able to be assign a JIRA ticket.
If you have not been added to the list, email the [dev@yunikorn.apache.org](mailto:dev@yunikorn.apache.org) mailing list or ask in a comment of the jira to request for it.

Please put as much detail as possible in the Description field.
Include your configuration changes, cluster size, and YuniKorn version.
Any related code or configuration that helps replicate the issue you should also add.

For bug reports: a short reproduction of the problem would be more than welcomed.
If you have logs, the specific part of the log with the error message or stack trace.
Attaching the entire log can be useful.
If you have already tried to debug the issue describe the steps you have already done.
Even if that result was that you were not able to reproduce the issue.

For new feature requests, it may include a design document.
If you do not have that, or it is just a generic request, work with us to design your feature and implement it.
