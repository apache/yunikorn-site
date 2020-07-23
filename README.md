<!--
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 -->
# Apache YuniKorn website
---
![auto-publish](https://github.com/apache/incubator-yunikorn-site/workflows/auto-publish/badge.svg)

This readme will walk you through building the Apache YuniKorn website

## Introduction

1. The `master` branch contains the website source code. Modifications of the web-site need to be merged into the master branch.

2. The `asf-site` branch contains the deployed static pages, scripts and images of the website. This branch is maintained by `yunikorn-bot`, in most of the cases, no manual updates needed for this branch.

https://yunikorn.apache.org will be updated automatically via the configuration set in the `.asf.yaml` file.

## Make changes

You can build and run the web-site server locally in dev mode with the following command:

```shell script
./local-build.sh run
```

this commands builds a docker image `yunikorn/yunikorn-website:latest` locally, and launch the web-server at URL: http://localhost:3000.
All dependencies will be installed in the docker image in order to keep the local env clean, the web-site will be built by
the content in the current repo directory. So that any changes that have been done within the directory will automatically
trigger the update of the local web-server. You can review you changes from the local endpoint to verify your changes. Once
the dev is done, you need to ctrl+c to exit the dev mode.

## Add / Update documents

The website is built based on [docusaurus-v2](https://v2.docusaurus.io/docs/docs-introduction). The docs are written in MD file format,
docs are located at:

- community: the non-versioned docs
- docs: the master version of docs
- versioned_docs: the released version of docs
- sidebars.js: change this file if you need to update the layout of the docs

For advanced updates, including style, theme, etc, please refer to the docusaurus doc.

## Release a new version

```
yarn release x.x.x (e.g. 0.8.1)
```

this command will snapshot all the docs from the current `docs` directory, and copy all files to another new directory
under `versioned_docs`, e.g `versioned_docs/version-0.9.0`. Commit these changes to the master branch, once the auto-build
is done, the new doc will be presented on the website.

## Deploy website

The deployment should happen automatically once all changes are merged into the master branch. It usually takes a few
minutes before the asf site gets updated.

## The manual steps of deploying the web-site

Note: In most of the cases, you do not need to read this section as the publish should be done automatically with github workflow.

All the below steps expect that the current directory is the top-level directory of the repository.

1. Commit the `master` branch to GitHub repo.
1. Copy the `yunikorn-site` directory to a backup path **outside** the source tree, e.g. `mkdir ../backup-site && cp -R yunikorn-site/* ../backup-site`.
1. Checkout the `asf-site` branch, clear all the contents of the directory, e.g. `rm -rf ./*` (this leaves the files starting with a dot do not remove them!)
1. Copy the contents of the `backup-site` directory back to the top-level directory of the repo, e.g. `cp -R ../backup-site/* .`
1. Commit the `asf-site` branch to GitHub repo.
