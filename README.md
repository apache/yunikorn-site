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
[![pre-commit](https://github.com/apache/yunikorn-site/actions/workflows/pre-commit.yml/badge.svg)](https://github.com/apache/yunikorn-site/actions/workflows/pre-commit.yml)
[![auto-publish](https://github.com/apache/yunikorn-site/actions/workflows/auto-publish.yml/badge.svg)](https://github.com/apache/yunikorn-site/actions/workflows/auto-publish.yml)

This README will walk you through building and updating the Apache YuniKorn website.

## Introduction
1. The `master` branch contains the website source code.
Modifications of the website need to be merged into the master branch.

2. The `asf-site` branch contains the deployed static pages, scripts and images of the website.
This branch is maintained by `yunikorn-bot`.
Manually updating this branch should only happen as a last resort.

The website running at https://yunikorn.apache.org will be updated automatically via the configuration set in the `.asf.yaml` file.

## Make changes
You can build and run the website server locally in development mode with the following command:
```shell script
./local-build.sh run
```

This command will build a Docker image `yunikorn/yunikorn-website:latest` locally, and launch the web-server at this URL: [http://localhost:3000](http://localhost:3000)
The website will be built based on the content in the current directory.
Any changes that are made within the directory will automatically trigger the update of the local webserver.
You can review your changes from the local endpoint to verify your changes.
Once the development is done, you need to press `Control+C` to exit the script mode.

For an overview of all options of the local build script run:
```shell script
./local-build.sh help
```

## Local build
Instead of running the build inside a docker image you can also run it locally when you have yarn installed. 
This is faster than running the build inside a Docker image:
```shell script
yarn install
yarn add @docusaurus/theme-search-algolia
yarn build
```
Run the website server locally in development mode with the following command:
```shell script
yarn install
yarn add @docusaurus/theme-search-algolia
yarn run start
```

## Updating the site
The website is built based using [docusaurus-v2](https://v2.docusaurus.io/docs/docs-introduction). 
The pages and documentation are written in MD file format, the data required is located at:
* `docusaurus.config.js` the main site layout and menu definition
* `src/pages` the non-versioned static pages of the site
* `static` images not used in the documentation 
* `docs` the master version of the documentation
* `sidebars.js` the layout of the documentation menu

The directories `versioned_docs` and `versioned_sidebars` contain the versioned copies of the documentation and the layout.
Documentation versioning is part of the release procedure. Updates to all current documentation follows the standard JIRA and pull request model. 

For advanced updates, including style, theme, etc, please refer to the docusaurus documentation.
Changes in this area should be discussed before applying.

## Static pages
Static pages form a small but crucial part of the site.
The following pages are part of the static content:
* roadmap 
* download information
* community pages

The top menu is defined in the `docusaurus.config.js`.
New pages that are added which need to be accessible from the menu must be added to the configuration.
Pages that are linked from other pages do not require a configuration entry.  
The Apache links are only defined as part of the site layout and are not backed by any pages.

## Deploy website
The deployment should happen automatically once all changes are merged into the master branch. It usually takes a few
minutes before the asf site gets updated.

### The manual steps of deploying the web-site
Note: In most of the cases, you do not need to read this section as publishing should be handled by the github workflow.

All the below steps expect that the current directory is the top-level directory of the repository.

1. Commit the `master` branch to GitHub repo.
2. run a [local build](#local-build) or `local-build.sh build`
3. Copy the `build` directory to a backup path **outside** the source tree, e.g. `mkdir ../backup-site && cp -R build/* ../backup-site`.
4. Checkout the `asf-site` branch, clear all the contents of the directory, e.g. `rm -rf ./*` (this leaves the files starting with a dot do not remove them!)
5. Copy the contents of the `backup-site` directory back to the top-level directory of the repo, e.g. `cp -R ../backup-site/* .`
6. Commit the `asf-site` branch to GitHub repo.

The website will be updated automatically as per the normal commit flow for the `asf-site` branch.
