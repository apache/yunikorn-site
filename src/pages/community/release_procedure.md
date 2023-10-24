---
id: release_procedure
title: Release Procedure
---

<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to you under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# YuniKorn Release Procedure

The [release repository](https://github.com/apache/yunikorn-release) contains the code and configuration to create a release for Apache YuniKorn.
Before starting the release procedure clone the repository and checkout the master branch.
Even if a release has been made before make sure that the latest version is checked out as the code and or config might have changed.  

The instructions and tools obey the ASF [release policy](http://www.apache.org/legal/release-policy.html).

* [Release procedure](#release-procedure)
* [Step-by-step procedure](#step-by-step-procedure)
    * [Branching](#branching)
    * [Tag for RCs](#tag-for-rcs)
    * [Update references based on tags](#update-references-based-on-tags)
    * [Update the CHANGELOG](#update-the-changelog)
    * [Run the release tool](#run-the-release-tool)
        * [Create Signature](#create-signature)
        * [Create Checksum](#create-checksum)
    * [Upload Release Candidate Artifacts](#upload-release-candidate-artifacts)
    * [Start Voting Thread](#start-voting-thread)
    * [Tag for release](#tag-for-release)
    * [Publish the Release](#publish-the-release)
        * [Release Docker images](#release-docker-images)
        * [Release Helm Charts](#release-helm-charts)
        * [Update the website](#update-the-website)
        * [Cleanup](#cleanup)
        * [Create the GIT releases](#create-the-git-releases)
    * [Verify the release publishing](#verify-the-release-publishing)
* [Website updates for a new release](#website-updates-for-a-new-release)
  * [Version the documentation](#version-the-documentation)
  * [Release announcement](#release-announcement)
  * [Update the download page](#update-the-download-page)
* [Signing your first release](#signing-your-first-release)
    * [Generate a Key](#generate-a-key)
    * [Add the signature to the project KEYS file](#add-the-signature-to-the-project-keys-file)

## Release Procedure
Simplified release procedure:
1. Create a release branch for the target release in all git repos, such as `branch-1.3`
2. Stabilize the release by fixing test failures and bugs only
3. Tag update release for a new version to prepare a release candidate, e.g `v1.3.0-1` for RC1
4. Update the CHANGELOG
5. Configure [release-configs.json](https://github.com/apache/yunikorn-release/tree/master/tools/release-configs.json)
6. Run script [build-release.py](https://github.com/apache/yunikorn-release/tree/master/tools/build-release.py) to generate source code tarball, checksum and signature.
7. Voting and releasing the candidate

## Step-by-step procedure
Branching and tagging can, and in most cases will, require changes in the go mod files.

### Branching
Branching is part of the release preparation and often has happened some time before the release process starts.
As an example the steps to create the branch for the `v1.3.0` release:
```shell script
git checkout -b branch-1.3 master
git push -u origin branch-1.3
```

### Tag for RCs
A release needs to be tagged in git before starting the release process.
As an example check [YUNIKORN-358](https://issues.apache.org/jira/browse/YUNIKORN-358) and [YUNIKORN-1004](https://issues.apache.org/jira/browse/YUNIKORN-1004).
Release candidates should be tagged with the version **and** build number of the release candidate.
For example artifacts used to build 1.3.0 RC1 should be tagged `v1.3.0-1`.
Releases are **not** created in GitHub for RCs.

Example for creating an annotated tag on the checked out commit for RC1 for `v1.3.0`:
```shell script
git tag -a v1.3.0-1 -m "RC1 for v1.3.0"
git push origin v1.3.0-1
```
:::caution
Under **no** circumstances should an existing tag be removed or moved.
This will break golang dependency resolution for downstream users.
:::

### Update references based on tags
The tagging is multistep process, all actions are done on the branch that will be released, like `branch-1.3`:
1. Tag the web and scheduler interface with the release candidate tag: i.e. `v1.3.0-1`.
2. Update the `go.mod` file in the core using:
   ```shell script
   go get github.com/apache/yunikorn-scheduler-interface
   ```  
   Add the same tag as in the previous step and commit the changes.
3. Update the `go.mod` file in the shim using 
   ```shell script
   go get github.com/apache/yunikorn-scheduler-interface  
   go get github.com/apache/yunikorn-core
   ```
   Add the same tag as in the previous step and commit the changes.
4. Create a new branch in the yunikorn-release repo, set the correct chart version in [Chart.yaml](https://github.com/apache/yunikorn-release/tree/master/helm-charts/yunikorn/Chart.yaml), and then create the same tag in this repository.

### Update the CHANGELOG
In the release artifacts a [CHANGELOG](https://github.com/apache/yunikorn-release/tree/master/release-top-level-artifacts/CHANGELOG) is added for each release.
The CHANGELOG should contain the list of jiras fixed in the release.
Follow these steps to generate the list:
- Go to the [releases page in jira](https://issues.apache.org/jira/projects/YUNIKORN?selectedItem=com.atlassian.jira.jira-projects-plugin%3Arelease-page&status=released-unreleased)
- Click on the version that is about to be released, i.e. `1.3.0`
- Click on the `Release Notes` link on the top of the page
- Click the button `Configure Release Notes`
- Select the style `Text` and click `create`
- Scroll to the bottom of the page and copy the content of the text area and update the CHANGELOG file in the ../release-top-level-artifacts directory.

### Run the release tool
Please check the [signing your first release](#signing-your-first-release) before proceeding here for details on signing a release.
Limitations apply to the key that can be used for signing. 

A tool has been written to handle most of the release tasks.
The tool requires a simple [json](https://github.com/apache/yunikorn-release/tree/master/tools/release-configs.json) input file to be updated before running.
This configuration points to the tag to use in the release and the version to release.
Update the version to release and the tag for each repository.
The version used must be the _exact_ version that you intend to release.
So `0.12.2` or `1.3.0` **without** any additional references like a `RC1` or something similar.
The version is used as part of the source code, inside the Makefile etc., and to name the release artefact and cannot be changed anymore.
The tag format is as described in the [step tag for released version](#tag-for-release)

As an example when releasing the first release candidate for `1.3.0` the json file should contain version and tag information like below:
```json
{
  "release": {
    "version": "1.3.0"
  },

  "tag": "v1.3.0-1",
  "repository": "https://github..."
}
```

The tool has one requirement outside of standard Python 3: [GitPython](https://gitpython.readthedocs.io/en/stable/intro.html)
Make sure you have installed it by running `python3 -m pip install gitpython`.

Run the tool:
```shell script
python3 build-release.py
```
If you want to automatically sign the release using your GPG key run the tool using:
```shell script
python3 build-release.py --sign <email-address>
```

#### Create Signature
If you have GPG with a _pinentry_ program setup you can automatically sign the release using the release tool.
On MacOSX this will be setup automatically if you use the keychain for the keys.
For more details check the [GnuPG tools wiki](https://wiki.archlinux.org/index.php/GnuPG) and specifically the [pinentry](https://wiki.archlinux.org/index.php/GnuPG#pinentry) chapter.

Run the release tool using the option `--sign <email-address>` to auto sign the release.

Manually creating the signature for the file generated by the tool:
```shell script
gpg --local-user <email-address> --armor --output apache-yunikorn-1.3.0-src.tar.gz.asc --detach-sig apache-yunikorn-1.3.0-src.tar.gz
```
This will create the signature in the file: `apache-yunikorn-1.3.0-src.tar.gz.asc`
Verify that the signature is correct using:
```shell script
gpg --verify apache-yunikorn-1.3.0-src.tar.gz.asc apache-yunikorn-1.3.0-src.tar.gz
```

#### Create Checksum
This step is included in the release after generation of the source tar ball, if the release tool is used this step can be skipped.
```shell script
shasum -a 512 apache-yunikorn-1.3.0-src.tar.gz > apache-yunikorn-1.3.0-src.tar.gz.sha512
```
This will create the checksum in the file: `apache-yunikorn-1.3.0-src.tar.gz.sha512`
Verify that the checksum is correct using:
```shell script
shasum -a 512 -c apache-yunikorn-1.3.0-src.tar.gz.sha512 
```

### Upload Release Candidate Artifacts
The release artifacts consist of three parts:
- source tarball
- signature file
- checksum file

The three artefacts need to be uploaded to: `https://dist.apache.org/repos/dist/dev/yunikorn/` 

Create a release directory based on the version, i.e. `1.3.0`, add the three files to directory.
Commit the changes.

If you have not done so already make sure to [add your signature](#add-the-signature-to-the-project-keys-file) to the KEYS file.
Do not remove any keys from the file they are kept here to enable older releases to be verified.

NOTE: you will need to install subversion to access this repo (use your apache ID). You can use any SVN client, e.g svnX, for convenience.

### Start Voting Thread
According to the Apache [release approval doc](http://www.apache.org/legal/release-policy.html#release-approval) 
A voting thread must be created on `dev@yunikorn.apache.org` and run for at least 72 hours.
At least three +1 votes are required and more +1 votes than -1 votes.

### Tag for release
Once the release has passed voting, git tags and GitHub releases should be created for final release tag, example `v1.3.0`
The final tag must point to the same commit as the approved release candidate tag, example `v1.3.0-1`
Check the step [Create the GIT releases](#create-the-git-releases) later in the procedure for the release updates.

Adding the final release tag, again annotated, on the checked out commit:
```shell script
git tag -a v1.3.0 -m "Apache YuniKorn v1.3.0"
git push origin v1.3.0
```

### Publish the Release
Once the voting is passed, move the release artefacts from the staging area to the release location `https://dist.apache.org/repos/dist/release/yunikorn/`. 
Once moved to this space, the content will be automatically synced to `https://downloads.apache.org/yunikorn/` which must be used as the final location for all release files.

Read more about the [distribution services](https://apache.org/history/mirror-history.html) for the source code.

This will temporarily provide us with two releases in the release area.
This is needed to allow the start the mirror sync process and allow for the download page to be updated.
Cleanup of the older release is handled after the website has been updated in the [cleanup](#cleanup).

#### Release Docker images
As part of the release convenience images are build and uploaded to the Apache account on DockerHub.

:::note
Each Apache project has a limited number of people with write access to the Apache Docker organisation.
Not all PMC members can be given access.
Reach out to the private@ list to get help if you have not published images before or have trouble accessing Docker Hub. 
:::

As we added multi architecture support the release of the images has become a bit more complex and is now tool driven.

The Go compiler built-in in functionality is leveraged to cross-compile the executables for the scheduler and admission controller.
The web UI is a javascript application which does not require any special handling.

Besides that, the minimum requirement for building the multi architecture images is multi architecture support in Docker.
Multi architecture support is needed to be able to build both `amd64` and `arm64` images on your local machine.
Building the images for different architectures requires emulation of the non-native architecture to run the build instructions.

Support for emulating different architectures is provided by [QEMU](https://www.qemu.org).
The QEMU software is installed as part of Docker Desktop on Mac OSX and Windows.
For linux based build machines a manual installation of the QEMU package has to be performed.
The multi architecture build has been tested using Docker on Debian also. On Debian this only requires the `qemu-user-static` package.
Other distribution might require different docker and or QEMU install instructions.

The expectation is that this tool is run from the same location as the [release tool](#run-the-release-tool) was run from.
Configuration and code used as the input for this build **must** be the same as that was used for the source release.

Run the image release tool:
```shell script
python3 build-image.py
```
A standard run of the tool will ask for the docker hub credentials.
The credentials used must have _write_ access to the `apache/yunikorn` docker hub area.

The tool will then build all the images:
* admission
* scheduler
* scheduler-plugin
* web

Each image will be built twice, once for `amd64` and once for `arm64`.
All images are pushed to the docker hub.
When both architectures are built a manifest is created for the multi architecture image.
The manifest is pushed to docker hub and a cleanup of unused tags is executed.

The whole process can take a while as builds of executables and docker images are executed multiple times. 

If you want to test the tool run to make sure it all works you can run the tool against a non apache repository.
For this you provide the optional variable on the command line:
```shell script
python3 build-release.py --repository <name>
```

#### Release Helm Charts
This step is part of the release tool if the release tool is used the packaging can be skipped.

If the release tool is **not** used the `Chart.yaml` and the `values.yaml` must be updated manually.
The other option is to run the helm script against the generated source directory as the tool does:
```shell script
helm package --sign --key <your_key_name> --keyring </path/to/keyring.secret> staging/<release-dir>/helm-charts/yunikorn --destination staging/
```

The key name provided in the `--key` argument must be contained in your key's uid. The helm tool checks if the name provided is part of the key's uid via a substring match.
You can find all uids for your keys by executing:
```shell script
gpg --list-secret-keys
```
Signing the helm package requires a legacy PGP keyring. The GnuPG v2 keyring is stored in a must be converted to the legacy format.
It is not possible to use the new keybox (kbx) format. Please use the following command to convert your keyring to the legacy gpg format:
```shell script
gpg --export >~/.gnupg/pubring.gpg
gpg --export-secret-keys >~/.gnupg/secring.gpg
```
Note that you will be required to enter your passphrase for each secret keys that is exported.
The file that is created by exporting the secrect keys, `~/.gnupg/secring.gpg`, is the path used in the `--keyring` parameter.

All this combined will result in a similar command for signing the helm charts when run from the top level of the checked out release repository:
```shell script
helm package --sign --key wilfreds@apache.org --keyring ~/.gnupg/secring.gpg staging/apache-yunikorn-1.0.0-src/helm-charts/yunikorn --destination staging/
```

For more information please check [Helm documentation](https://helm.sh/docs/topics/provenance/).

Helm charts _must_ be signed on release.
Contrary to the source code tar ball signing, signing the helm charts requires manual entry of the key passphrase.
There is no option to provide the passphrase any other way to the helm tool.
The helm package will generate two files:
- helm package: example `yunikorn-1.3.0.tgz`
- provenance or signature file: example `yunikorn-1.3.0.tgz.prov`

Both files _must_ be attached to the [release in GIT](#create-the-git-releases) for the release repository.

Last step is to update the [index.yaml](https://github.com/apache/yunikorn-release/blob/gh-pages/index.yaml) and
[index.md](https://github.com/apache/yunikorn-release/blob/gh-pages/index.md) file in the `gh-pages` branch with the new release.
First the `index.yaml` file:  
The `digest` mentioned in the index.yaml file is the digest that gets printed by the tool (unsigned package) or stored in the provenance file.
It can be generated manually using:
```shell script
shasum -a 256 yunikorn-1.3.0.tgz
```

:::caution
Do not use the `helm repo index` command to update the `index.yaml` file. The command does not handle the enhanced information stored in the `index.yaml` file nicely.
Update the file manually.
:::

In the same PR update the `index.md` file. In most cases the change is limited to the supported Kubernetes versions.
If there are no changes for the release this step can be skipped. Larger changes should be tracked as a separate jira not as a work item for a release. 
Releases are always tracked based on the minor release only, i.e. 1.23.x or 1.25.x.
Multiple Kubernetes versions can be added as supported from the current release. Each version should be mentioned as a separate entry under the **K8s Version** column.
The current YuniKorn release is added to the **Supported from version** and **Support ended** as needed.

Any change in supported Kubernetes versions _must_ be mentioned in the [release announcement](#release-announcement).  

#### Update the website
- Create a new documentation version on YuniKorn website based on the latest content in the `docs` directory.
  Refer to [these steps](#version-the-documentation) on how to create the new documentation version. 
- Create the release announcement to be referenced from download page on the website. 
  The release announcement is a markdown file based on the version: `1.3.0.md`. 
  The steps on how to create the [release announcement](#release-announcement) explains the content and where to add the file. 
- Update the [download page](/community/download) of the website as per the [steps](#update-the-download-page).

The site can, and most likely will, contain an announcement bar.
This announcement bar is part of the `docusaurus.config.js` file in the root of the source tree.
Update the announcement bar to the correct release.

At this point all changes for the release are done and an announcement email can be sent to the `dev@yunikorn.apache.org` email list.

#### Cleanup
:::info
This step should be performed after the website updates have been made as the download links change.
:::

There should only be one release, the latest, in the release area.
Any release that has been in the release area will be automatically copied to the archive.
Older releases should be downloaded from the archive directly, not from the release area.

The releases need to clean up in two locations:
* Remove the newly released version from the _dev_ area by removing the old release candidate directory.
  For the location see [release candidate location](#upload-release-candidate-artifacts)
* Remove the non-current release from the _release_ area by removing the old release directory.
  For the location see [release location](#publish-the-release)

:::note
If there are multiple releases actively maintained then there could be multiple releases in the release area.
We _must_ have only one release per active branch in the _release_ area, i.e. one for 1.0, one for 1.1 etc. 
For detailed information you can check the [release distribution policy](https://infra.apache.org/release-distribution.html).   
:::

#### Create the GIT releases
In the GIT repositories finish the release process by creating a release based on the release git tag that was added.
Do not use any of the RC tags for a release.
Repeat these steps for all five repositories (core, k8shim, web, scheduler-interface and release):
- Go to the `tags` page
- click the `...` at the right-hand side of the page that you want to release, select `Create Release` from the drop down
- update the name and note
- add the packaged helm chart files (yunikorn-release repository only)
- click `Publish Release` to finish the steps

### Verify the release publishing
After the whole procedure has been finalised verify the documentation on the website.
Check that the released artifacts can be downloaded from the download page.

## Website updates for a new release
Releasing a new version requires you to have yarn locally installed.

Pre-requisites:
* The release must have been approved via the release process.
* The source archive file and signatures must have been uploaded to the Apache locations.
* The docker convenience images must have been pushed to the Apache docker hub.

Open a PR and commit all the changes below to the **master** branch, once the auto-build is done, the new documentation will be presented on the website.

### Version the documentation
Documentation versioning uses the simple **MAJOR.MINOR.PATCH** semver version of the release.
This means no letters, release candidate tags or anything like that:
```shell script
yarn release 1.3.0
```
This command will snapshot all the docs from the current `docs` directory, and copy all files to another new directory
under `versioned_docs`, e.g `versioned_docs/version-1.3.0`.
A similar copy will be generated for the sidebar under `versioned_sidebars` that belongs to the documentation version.

This process will also update the `version.json` file in the root and add the new release as a line item.

### Release announcement
The release announcement is a static Markdown file added to the directory `src/pages/release-announce`.

Jiras that are labeled with the `release-notes` label must be mentioned in the announcement.
For an overview of which Jiras are marked for inclusion in the release notes the following Jira search can be used:
[YuniKorn Release note needed](https://issues.apache.org/jira/issues/?filter=12352474).
All committers have access to the filter and can update the version to be checked. *Login is required to run and see the filter.

The file name must be the same as the semver version of the release without the 'v':
``` 
src/pages/release-announce/1.3.0.md
```
All releases are automatically added to the [index list](https://yunikorn.apache.org/release-announce/). 

The page itself is in Markdown format and should follow the example of the already existing pages:
* id and title definition (docusaurus syntax)
* Apache license
* Following headings
    * Overview of the release (level 2)  
      This contains the generic overview of the release, including the release manager and date etc.
      The link to the included Jiras for the release must be available to anyone, and not require a login.
    * Incompatible changes  
      Details for incompatible changes at level 3 heading, referencing a Jira via a link to provide more details. 
    * Highlights (level 2)  
      Chosen highlights or features at level 3 heading, referencing a Jira via a link to provide more details.
    * Community update (level 2)  
      Mention all new committers and or PMC members added since the last release.

### Update the download page
The download page contains the link to the Apache source download, signatures etc.
The table on the page has a specific layout that is correctly rendered after going through the docusaurus build.
Please do not change the release entry layout in the table.

First step is to update the `latest release` line to the correct version.  
Second step is to update the table: remove the last row from the table.
Duplicate the first row of the table and change the links and details to reflect the new release details.
All links must be updated:
* 3 for the download (source tar, checksum and signature)
* 3 for the docker images (scheduler, admission controller and web)
* 1 release announcement using a link in the form of `/release-announce/1.3.0`

For the second row update the download links for the source tar, checksum and signature.

Links for the releases have to follow these rules:
* The first download link on the page **must** use the mirror resolution link for the source tar ball only.
* The signature and checksum links **must** point to the release location.
* The non-current releases **must** use the archive links: `https://archive.apache.org/dist/yunikorn/` for the tar ball, the signature and the checksum.

A limited set of three (3) or four (4) releases should be maintained in the table for direct access.
Older releases not mentioned in the table can still be accessed via the archive link on the bottom of the page and do not need to be referenced.

### Update the DOAP file
A [DOAP file](https://github.com/apache/yunikorn-site/blob/master/doap_YuniKorn.rdf) containing project details has to be maintained.
Update the DOAP file with the release version and release date.

```xml
<release>
  <Version>
    <name>YuniKorn x.y.z</name>
    <created>YYYY-MM-DD</created>
    <revision>x.y.z</revision>
  </Version>
</release>
```

## Signing your first release
If you haven't signed any releases before, read the documentation to [generate signing key](https://infra.apache.org/openpgp.html#generate-key)
Follow the steps below to add the key you can use to sign.

:::caution
The current releases of helm do not allow signing helm charts with an elliptic curve based key (ECDSA).
There is no change planned in helm v3 as stated in [this issue](https://github.com/helm/helm/issues/11634) in the Helm GitHub repository.
Please create a RSA based key. The minimum is 2048-bit, recommended is a 3072-bit or 4096-bit, RSA key.
:::

### Generate a Key
Generate a new PGP key (skip this step if you already have an Apache linked key):
```shell script
gpg --gen-key
```
Fill out the requested information using your full name and Apache email address.

Upload the exported key to a public key server like `https://pgp.mit.edu/`.
```shell script
gpg --export --armor <email-address>
```

Upload the fingerprint to apache server: `https://id.apache.org/`.
```shell script
gpg --fingerprint <email-address>
```

### Add the signature to the project KEYS file
Only needed if this is the first release signed with the specific key.
More detail can be found in the document: [Signing a Release](https://infra.apache.org/release-signing.html#keys-policy)
```shell script
(gpg --list-sigs <email-address> && gpg --armor --export <email-address>) >> MY_KEY
```
Add the content of the generated file to the existing KEYS list at `https://dist.apache.org/repos/dist/release/yunikorn/KEYS`
Never remove a key from this list!

:::note
You will need to install subversion to access this repo (use your apache ID). You can use any SVN client, e.g. svnX, for convenience.
:::
