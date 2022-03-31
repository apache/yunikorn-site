---
id: dependencies
title: Go module updates
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

## When to update
The references in the `master` branches must be updated if a change is made in the scheduler interface.
Updating the dependency of a shim in reference to the core might be needed even if the scheduler interface does not change.
New functionality could be added that rely on changed content of the messages.
In that case just the shim dependency needs to be updated.

## Why a pseudo version
In the `master` branch we **must** use a pseudo version for all the YuniKorn repository references we use.
As the branch is in active development and not released we do not have a real version tag to reference.
However, we still need to be able to point to the right commit for the dependencies.

Go allows using [pseudo versions](https://go.dev/ref/mod#pseudo-versions) for these specific cases.
An example of the pseudo versions we use in the Kubernetes shim:
```
module github.com/apache/yunikorn-k8shim

go 1.16

require (
	github.com/apache/yunikorn-core v0.0.0-20220325135453-73d55282f052
	github.com/apache/yunikorn-scheduler-interface v0.0.0-20220325134135-4a644b388bc4
	...
)
```
Release branches **must** not use pseudo versions.
During the creation of a release, [tags](/community/release_procedure#tag-and-update-release-for-version) will be created.
These tags will be used as the reference in the go.mod files for the release.    

## Updating the core dependency
Before updating the core dependency must make sure that the scheduler interface changes are finalised.

1. Make the changes in the scheduler interface.
2. Commit the changes into the master branch on GitHub and pull the latest master branch commit.
3. [Generate a new pseudo version](#generating-a-pseudo-version) for the scheduler-interface.

Updating the core dependency

4. Update the go.mod file for the dependent repository: core repository
    * Open the go.mod file
    * Copy the generated pseudo version reference
    * Replace the scheduler-interface version reference with the one generated in step 3.
    * Save the go.mod file
5. Run a `make test` to be sure that the change works. The build will pull down the new dependency and the change in the scheduler interface will be used.
6. Commit the changes into the master branch on GitHub and pull the latest master branch commit

## Updating a shim dependency
Before updating a shim dependency you must make sure that the core dependency has been updated and committed.
There are cases that the reference for the scheduler-interface has not changed.
This is not an issue, either skip the update steps or execute them as per normal resulting in no changes as part of the commit.

7. [Generate a new pseudo version](#generating-a-pseudo-version) for the core
8. Update the go.mod file for the dependent repository: k8shim repository
    * Open the go.mod file
    * Copy the generated pseudo version reference of the scheduler interface
    * Replace the scheduler-interface version reference with the one generated in step 3.
    * Copy the generated pseudo version reference of the core
    * Replace the core version reference with the one generated in step 7.
    * Save the go.mod file
9. Run a `make test` to be sure that the change works. The build will pull down the new dependency and the changes in the core and scheduler interface will be used.
10. Commit the changes into the master branch on GitHub

:::note
If multiple PRs are being worked on in the scheduler interface and or core at the same time a different PR might have already applied the update.
This will all depend on the commit order.
It is therefor that steps 5 and 8 are performed to make sure there is no regression.
:::
## Generating a pseudo version

A pseudo references for use in a go.mod file is based on the commit hash and timestamp.
It is simple to generate one using the following steps: 

1. Change to the repository for which the new pseudo version needs to be generated.
2. Update the local checked out code for the master branch to get the latest commits
```
git pull; git status
```
The status should show up to date with the `origin` from where it was cloned.
3. Run the following command to get the pseudo version:
```
TZ=UTC git --no-pager show --quiet --abbrev=12 --date='format-local:%Y%m%d%H%M%S' --format='v0.0.0-%cd-%h'
```
4. This command will print a line like this:
```
v0.0.0-20220318052402-b3dfd0d2adaa
```
That is the pseudo version that can be used in the go.mod files.

:::note
The pseudo version must be based on a commit that is in the vcs system, i.e. from Github.
Local commits or commits that are not yet merged in a PR cannot be used.
:::
