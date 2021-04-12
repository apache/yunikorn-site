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
You can review your changes from the local endpoint to verify your changes.
Once the development is done, you need to ctrl+c to exit the script mode.

A build via the script will generate the website in the `build` directory.

The script also allows you to remove all dependencies and installed artefacts. 
This will ensure the next build is a complete clean build like Github Action will run when publishing the site. 
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

## Updating the site
The website is built based using [docusaurus-v2](https://v2.docusaurus.io/docs/docs-introduction). 
The pages and documentation are written in MD file format, the data required is located at:
* `docusaurus.config.js` the main site layout and menu definition
* `src/pages` the non-versioned static pages of the site
* `static` images not used in the documentation 
* `docs` the master version of the documentation
* `sidebars.js` the layout of the documentation menu

The directories `versioned_docs` and `versioned_sidebars` contain the versioned copies of the documentation and the layout.
See [Documentation](#Documentation) for maintenance recommendations.

For advanced updates, including style, theme, etc, please refer to the docusaurus documentation.

## Static pages
Static pages form a small but crucial part of the site.
The following pages are part of the static content:
* roadmap 
* download information
* community pages

The top menu is defined in the `docusaurus.config.js`.
New pages that are added which need to be accessible from the menu must be added 
The Apache links are only defined as part of the site layout and are not backed by any pages.

## Documentation
Images that are part of a documentation page must be located in the `assets` directory as part of the documents, i.e. `docs/assets`.
All other images that are used, for instance the homepage and menu, that do not change when or if the documentation is updated/versioned must be located in the `static/img` directory.   

The versioned documents and sidebars should only be updated to fix errors that cannot wait for a release.
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

## Releasing a new version
Releasing a new version requires you to have yarn locally installed.
This should only be run by a release manager or on request of the release manager.

Pre-requisites: 
* The release must have been approved via the release process.
* The source archive file and signatures must have been uploaded to the Apache locations.
* The docker convenience images must have been pushed to the Apache docker hub.   

Open a PR and commit all the changes below to the **master** branch, once the auto-build is done, the new documentation will be presented on the website.

### Version the documentation
Documentation versioning uses the simple **MAJOR.MINOR.PATCH** semver version of the release. 
This means no letters, release candidate tags or anything like that:  
```shell script
yarn release 0.9.0
```
This command will snapshot all the docs from the current `docs` directory, and copy all files to another new directory
under `versioned_docs`, e.g `versioned_docs/version-0.9.0`.
A similar copy will be generated for the sidebar under `versioned_sidebars` that belongs to the documentation version.

This process will also update the `version.json` file in the root and add the new release as a line item.

### Release announcement
The release announcement is a static Markdown file added to the directory `src/pages/release-announce`.
The file name is the same a simple semver version of the release:
``` 
src/pages/release-announce/0.9.0.md
```
The page is in Markdown format and should follow the example of the already existing pages:
* id and title definition (docusaurus syntax)
* Apache license
* Following headings
  * Title (level 1)
  * Overview of the release (level 2)
  * Highlights (level 2)
    Chosen highlights at level 3 heading
  * Community update (level 2)

### Update the download page
The download page contains the link to the Apache source download, signatures etc.
The table on the page has a specific layout that is correctly rendered after going through the docusaurus build.
Please do not change the release entry layout in the table.

First step is to update the `latest release` line to the correct version.  
Second step is to update the table: copy an existing entry and change the links and details to point to the new release.
All links must be updated:
* 3 for the download (source tar, checksum and signature)
* 2 for the docker images (scheduler and admission controller)
* 1 release announcement 

### Update announcementBar
The site can, and most likely will, contain an announcement bar.
This announcement bar is part of the `docusaurus.config.js` file in the root of the source tree.
Update the announcement bar to the correct release.

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
