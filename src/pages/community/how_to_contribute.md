---
id: how_to_contribute
title: How To Contribute
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

# How To Contribute

YuniKorn uses:
* JIRA for issue tracking.
* GitHub Pull Requests to manage code review and the change itself.
* Markdown for documentation, versioned and stored in the website repository.

## Jira Signup
In November 2022, due to an influx of false Jira accounts creating a flood of spam tickets, Apache Infra ended public signups to ASF Jira accounts.
This [blog post](https://infra.apache.org/blog/jira-public-signup-disabled.html) discusses the decision.
If you want to open a Jira ticket for YuniKorn and do not have an ASF Jira account, the YuniKorn PMC can create an account for you.

There are two options to easily request an account:
* email [private@yunikorn](mailto:private@yunikorn.apache.org?subject=jira%20account%20request)
* Slack [YuniKorn slack](https://join.slack.com/t/yunikornworkspace/shared_invite/enQtNzAzMjY0OTI4MjYzLTBmMDdkYTAwNDMwNTE3NWVjZWE1OTczMWE4NDI2Yzg3MmEyZjUyYTZlMDE5M2U4ZjZhNmYyNGFmYjY4ZGYyMGE)

We need the following information to create an account:
* email address
* preferred username (hyphens not allowed)
* alternate username (in case the preferred one is already in use)
* display name (if it is different from the username)

:::caution
Don't share the above information in a channel on slack, reach out on a channel and one of the PMC members will reach out in a private chat to collect the details.  
:::

## Find an issue
We use JIRA issues to track bugs for this project.
Find an issue that you would like to work on, or file a new one if you have discovered a new issue.
For help with reporting issues look at the [how to report an issue](reporting_issues).

The easiest way to get started working with the code base is to pick up a really easy
JIRA and work on that. This will help you get familiar with the code base, build system,
review process, etc. We flag these starter bugs [here](https://issues.apache.org/jira/issues/?jql=project%3DYUNIKORN%20AND%20status%3DOpen%20AND%20labels%3Dnewbie).

If nobody is working on an existing issue, assign it to yourself only if you intend to work on it shortly.
If you pick up an existing JIRA look for pull requests that are linked to the JIRA ticket.
Someone might be already working on it and not assigned the ticket.
JIRAs that have a pull requests linked will have the label `pull-request-available` and a link to the pull request can be found under issue links.

For anything that is more than a trivial change, like a typo or one line code change, it’s a good idea to discuss your intended approach on the issue.
You are much more likely to have your patch reviewed and committed if you’ve already got buy-in from the YuniKorn community before you start writing the fix.

If you cannot assign the JIRA to yourself ask the community to help assign it and add you to the contributors list in JIRA.   

## Fix an issue
Fixes or improvement must be created on the `master` branch.
Fork the relevant YuniKorn project into your own project and checkout the `master` branch.
If the same issue exist in an earlier release branch it can be back ported after the fix has been added to master. 
Make sure that you have an up-to-date code revision checked out before you start. Use `git status` to see if you are up-to-date.
Create a branch to work on, a good name to use is the JIRA ID you are working on.

Now start coding! As you are writing your patch, please keep the following things in mind:

Include tests with your patch.
If your patch adds a feature or fixes a bug and does not include tests, it will generally not be accepted.
If you are unsure how to write tests for a particular component, please ask on the JIRA for guidance.

Please keep your patch narrowly targeted to the problem described by the JIRA.
It’s better for everyone if we maintain discipline about the scope of each patch.
In general, if you find a bug while working on a specific feature, file a JIRA for the bug, check if you can assign it to yourself and fix it independently of the feature.
This helps us to differentiate between bug fixes and features and allows us to build stable maintenance releases.

Make sure you have observed the recommendations in the [coding guidelines](coding_guidelines).
Before you commit your changes and create a pull request based on your changes you should run the code checks. 
These same checks are run as part of the pull request workflow.
The pull request workflow performs the following checks:
* Apache license check: `make license-check`.
* Go lint check: `make lint`.
* Full unit test suite: `make test`.

These three checks should pass locally before opening a pull request. 
As part of the pull request workflow all checks must pass before the change is committed.
For first time contributors to a repository the automated pull request workflow must be approved by a committer.
Once the workflow has run and has given a pass (a +1 vote) a committer will review the patch.

As part of the Kubernetes shim there is also a set of tests defined called the _end to end_ tests.
These tests are more complex to execute as they require some extra tools to be installed.
Execution, and a pass, of the tests is strongly recommended for changes to the Kubernetes shim repository.
They can be executed locally via `make e2e_test`.

Finally, please write a good, clear commit message, with a short, descriptive title.
The descriptive title must start with the JIRA ID you are working on.
An example is: `[YUNIKORN-2] Support Gang Scheduling`
The body of the commit message is used to describe the change made. 
The whole commit message will be used to pre-fill the pull request information.
The body of the first commit message will be added to the PR Template.
The JIRA ID in the message will automatically link the pull request and the JIRA this is an essential part of tracking JIRA progress.

## Changes that modify multiple repositories
Apache YuniKorn consists of a number of repositories. Certain bug fixes or features will require modification in 2 or more repositories.
The dependencies are only relevant for the code repositories.

| repository                   | depends on                                  |
|------------------------------|---------------------------------------------|
| yunikorn-core                | yunikorn-scheduler-interface                | 
| yunikorn-k8shim              | yunikorn-scheduler-interface, yunikorn-core |
| yunikorn-scheduler-interface | none                                        |
| yunikorn-web                 | yunikorn-core                               |

The dependency between the web UI and the core code is limited to the exposed REST API.
Not all REST API end points are used in the web UI. Manually testing the web UI against the new REST API is required before approving and committing changes.
As a general rule there is an impact on the web UI if a change in the REST API removes or updates existing fields or completely removes existing end points.
Additional end points or fields should not require a web UI update but still require manual testing.

The scheduler interface, core and K8shim have a dependency based on the [Go modules](https://go.dev/blog/using-go-modules) that they import.

We follow the version numbering as described in the [version numbering](https://go.dev/doc/modules/version-numbers) for go modules.
The master branch *must* use a pseudo version.
See the [Go module dependencies](/docs/next/developer_guide/dependencies) for updating the pseudo version.
The release branches *must* use branch version.
See the [release procedure](release_procedure#tag-and-update-release-for-version) on when and how to update the tags and references during the release creation. 

## Documentation updates
Documentation is published and maintained as part of the website.
The process for updating the documentation is the same as for making code changes: file a jira and open a pull-request with the change.
Multiple versions of the documentation are published on the website.
Changes are always made against the `master` branch.
The versioned documents and sidebars should only be updated to fix errors that cannot wait for a release.

Images that are part of a documentation page must be located in the `assets` directory as part of the documents, i.e. `docs/assets`.
All other images that are used, for instance the homepage and menu, that do not change when or if the documentation is updated/versioned must be located in the `static/img` directory.

The versioned documentation and sidebar are located in:
- versioned_docs: the released version of documentation
- versioned_sidebars: the sidebars for the corresponding released documentation

Normal documentation maintenance must be performed by updating the non versioned documentation.
New pages are added by:
* adding a Markdown file
* updating the `sidebar.js` file

The page file must contain:
* id and title definition (docusaurus syntax)
* Apache license

The id is used by docusaurus to link the page to the specific point in the documentation menu.
The title is displayed in the menu.
```
---
id: MyPageID
title: My new documentation page
---
```
Pages can be grouped in categories in the sidebar.
The category should be represented as directories in the source tree.

After making the changes you can build the website locally in development mode with the following command:
```shell script
./local-build.sh run
```
The only requirement is that you have docker installed as the build and server will be run inside a docker container. 

## Create a pull request
Please create a pull request on github with your patch.
See [opening a pull request](https://help.github.com/articles/using-pull-requests/) for all the details.

Recommendation is to use a fork of the repository and create a branch in your fork.
Use the GitHub UI to create a PR using the `compare across forks` option.
In most cases the GitHub UI, after a short delay, will provide you the option to create a PR when a commit is detected on a forked repository.

The pull request description must include the JIRA reference that you are working on.
If you set the commit message as described above the pull request will automatically pick it up.
If you did not do that you can amend the description of the pull request to add the JIRA ID.
For example a pull request linked to [YUNIKORN-2](https://issues.apache.org/jira/browse/YUNIKORN-2) should have a description like:
`[YUNIKORN-2] Support Gang Scheduling`

## Committing a change
When a change is approved a committer will commit the change to the `master` branch of the repository.
Commits follow the "squash and merge" approach. This squashes all commits for a pull request into one commit which is then merged.

After committing a change the JIRA associated with the pull request will not be automatically closed.
The JIRA status should be resolved manually and the correct `Fixed Version/s` should be set when resolving.
If a patch is back ported into a branch the JIRA should show multiple `Fixed Version/s`.
One for the upcoming version for the master and one for each branch the fix is ported back to.

There are three options for committing a change:
* use the script (recommended)
* manually using the git command line
* use the GitHub web UI "squash and merge" button 

A [simple shell script](https://github.com/apache/yunikorn-release/tree/master/tools/merge-pr.sh) to help with a squash and merge is part of the release repository.
The script handles the checkout, merge and commit message preparation.
As part of the merge process conflicts can be resolved by the committer and added to the commit.
The commit message is prepared but not finalised. The committer can edit, and cleanup, the message before the commit is made.
Changes are pushed as the last step of the process.
Abandoning the process leaves the local system in the same state as it was before the commit process started.

:::caution
Using the GitHub web UI there is no control over the author or committers details.

The committer is always set to "GitHub <noreply@github.com>".
The user logged into the GitHub web UI and performing the action is not tracked in the commit.
The author name is influenced by the GitHub setting "Keep my email addresses private",
this can cause author names like "username <12345678-username@users.noreply.github.com>" to be used.
:::

Commit messages **must** comply to a simple set of rules:
* Subject line is the title of the change formatted as follows: `[JIRA reference] subject (#PR ID)`.  
* Second line must be empty, separates the subject from the body.
* The body of the message contains the description of the change.
* All lines in the commit message should be wrapped at 72 characters.

For all commits, via the command line or the GitHub web UI, the message body must be reviewed.
During the pull request review process multiple commits could be added and some text that end up in the commit message might be irrelevant.
Text like `review comment changes` or `fixed unit test` do not need to be part of the final commit message.

The pull request will automatically be marked as `merged` when the GitHub UI is used.
To close the pull request when using the git command line one of the magic phrases can be used in a commit message.
Including one of these "magic words" followed by the pull request ID in the commit summary will automatically close the pull request.
The script will automatically add the `Closes: #PR` phrase to the commit message.
For more information check this [GitHub help page](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) for more magic phrases.

An example of a pull request committed using the script see PR #329 for the YuniKorn core: [PR 329 commit](https://github.com/apache/yunikorn-core/commit/9e151829e14714b0e47b413bd9cecfdff6b44507)

## Still got questions?
If you’re not sure about something, try to follow the style of the existing codebase.
Look at whether there are other examples in the code that do a similar thing.
Feel free to ask questions on the [dev@yunikorn.apache.org](mailto:dev@yunikorn.apache.org) list as well.

See Also
* [Apache contributor documentation](http://www.apache.org/dev/contributors.html)
* [Apache voting documentation](http://www.apache.org/foundation/voting.html)
