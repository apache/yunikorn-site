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

This readme will walk you through building and updating the Apache YuniKorn website

## Introduction

1. The `master` branch contains the website source code.
Modifications of the web-site need to be merged into the master branch.

2. The `asf-site` branch contains the deployed static pages, scripts and images of the website.
This branch is maintained by `yunikorn-bot`.
Manually updating this branch should only happen as a last resort.

The website running at https://yunikorn.apache.org will be updated automatically via the configuration set in the `.asf.yaml` file.

## Make changes

You can build and run the web-site server locally in development mode with the following command:
```shell script
./local-build.sh run
```

This commands will build a docker image `yunikorn/yunikorn-website:latest` locally, and launch the web-server at URL: [http://localhost:3000](http://localhost:3000)
The web-site will be built based on the content in the current directory.
Any changes that are made within the directory will automatically trigger the update of the local web-server.
You can review you changes from the local endpoint to verify your changes.
Once the development is done, you need to ctrl+c to exit the script mode.

A build via the script will generate the website in the `build` directory.

The script also allows you to remove all dependencies and installed artefacts. 
This will ensure the next build is a complete clean build like travis CI will run when publishing the site. 
```shell script
./local-build.sh clean
```

## Local build
Instead of running the build inside a docker image you can also run it locally when you have yarn installed. 
This is faster than running the build inside a docker image:
```shell script
yarn install
yarn build
yarn run start
```
A local build will also generate the website in the `build` directory same as with the script.

## Add / Update documents

The website is built based using [docusaurus-v2](https://v2.docusaurus.io/docs/docs-introduction). 
The pages and documentation are written in MD file format, the data required is located at:
- src/pages: the non-versioned pages of the site
- docs: the master version of the documentation
- sidebars.js: change this file if you need to update the layout of the documentation

Images that are part of a documentation page must be located in the `assets` directory as part of the documents, i.e. `docs/assets`.
All other images that are used, for instance the homepage and menu, that do not change when or if the documentation is updated/versioned must be located in the `static/img` directory.   

The versioned documents and side bars should only be updated to fix errors. The versioned documentation and side bar are located in: 
- versioned_docs: the released version of documentation
- versioned_sidebars: the sidebars for the corresponding released documentation

For advanced updates, including style, theme, etc, please refer to the docusaurus documentation.

## Release a new version
This step requires you to have yarn locally installed and is only needed when a new release is approved by the community.

```shell script
yarn release 0.9.0
```
This command will snapshot all the docs from the current `docs` directory, and copy all files to another new directory
under `versioned_docs`, e.g `versioned_docs/version-0.9.0`.
A similar copy will be generated for the sidebar under `versioned_sidebars` that belongs to the documentation version.

Open a PR and commit these changes to the **master** branch, once the auto-build is done, the new documentation will be presented on the website.

## Deploy website

The deployment should happen automatically once all changes are merged into the master branch. It usually takes a few
minutes before the asf site gets updated.

### The manual steps of deploying the web-site

Note: In most of the cases, you do not need to read this section as publishing should be handled by the github workflow.

All the below steps expect that the current directory is the top-level directory of the repository.

1. Commit the `master` branch to GitHub repo.
1. Copy the `build` directory to a backup path **outside** the source tree, e.g. `mkdir ../backup-site && cp -R build/* ../backup-site`.
1. Checkout the `asf-site` branch, clear all the contents of the directory, e.g. `rm -rf ./*` (this leaves the files starting with a dot do not remove them!)
1. Copy the contents of the `backup-site` directory back to the top-level directory of the repo, e.g. `cp -R ../backup-site/* .`
1. Commit the `asf-site` branch to GitHub repo.

The website will be updated automatically as per the normal commit flow for the `asf-site` branch.
