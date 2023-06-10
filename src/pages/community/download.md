---
id: download
title: Apache YuniKorn
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

# Apache YuniKorn

Apache YuniKorn is released as source code tarballs.
The downloads for the latest release are distributed via mirror sites.
Older releases can be downloaded from the Apache archive site.
All release artifacts should be checked for tampering using GPG or SHA-512.

We publish prebuilt docker images for everyone's convenience.

The latest release of Apache YuniKorn is v1.3.0.

| Version | Release date | Source download                                                                                                                                                                                                                                                                                            | Docker images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Release notes                           |
| ------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| v1.3.0  | 20203-06-09  | [Download](https://downloads.apache.org/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz.sha512) & [Signature]()                                                                                               | [scheduler]()<br/>[[admission-controller]() <br/>[web]() <br/> [scheduler plugin]()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [Announcement](/release-announce/1.3.0) |
| v1.2.0  | 2023-02-02   | [Download](https://archive.apache.org/dist/yunikorn/1.2.0/apache-yunikorn-1.2.0-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/yunikorn/1.2.0/apache-yunikorn-1.2.0-src.tar.gz.sha512) & [Signature](https://archive.apache.org/dist/yunikorn/1.2.0/apache-yunikorn-1.2.0-src.tar.gz.asc)    | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.2.0/images/sha256-c3b1a7b2cfec3f3560415519278cc4d94748f0f60ee80dfaf23fcc22dbb8b8e5) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.2.0/images/sha256-7f18fcd080640974ae586d30eda009daf0ad93fa22ada66b0a337ac3fb46b7ac) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-1.2.0/images/sha256-706a2895461623f20d4102f0132d66dade9c15edf5cad40065506a4d70c32576) <br />[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.2.0/images/sha256-d946495946b89d03f7a8f786702d4b350a93f74d52e50bebb6b2bbdcb8e911a4?context=explore) | [Announcement](/release-announce/1.2.0) |
| v1.1.0  | 2022-09-08   | [Download](https://archive.apache.org/dist/yunikorn/1.1.0/apache-yunikorn-1.1.0-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/yunikorn/1.1.0/apache-yunikorn-1.1.0-src.tar.gz.sha512) & [Signature](https://archive.apache.org/dist/yunikorn/1.1.0/apache-yunikorn-1.1.0-src.tar.gz.asc)    | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.1.0/images/sha256-5a45cede355b4c1d0016ba81b317e12a7608ac5de4779892f8c7fa53adf5d739) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.1.0/images/sha256-4389c126f252671e55bdac16e1bcfe7f83ef4ea7c3e83d333c81508920da825c) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-1.1.0/images/sha256-3f3075161283d8a78f4849f8163104d7db3e7bd3a467163729fb401421ac670f) <br />[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.1.0/images/sha256-b182ec4d08c590cd179b811fe68dffa2d58dccc9b8568f108ad35af0ed62a4c1?context=explore) | [Announcement](/release-announce/1.1.0) |

## Verifying the signature

To verify the Apache YuniKorn release using GPG:

- Download the release apache-yunikorn-X.Y.Z-src.tar.gz from a mirror site.
- Download the signature file apache-yunikorn-X.Y.Z-src.tar.gz.asc from Apache.
- Download the Apache YuniKorn [KEYS](https://downloads.apache.org/yunikorn/KEYS) file.
- `gpg --import KEYS`
- `gpg --verify apache-yunikorn-X.Y.Z-src.tar.gz.asc`

Note: On MacOS-X the GNU gpg utility does not read from a file when importing.
The import command should be `gpg --import < KEYS`   

## Verifying the checksum

To verify the integrity of Apache YuniKorn release using the SHA-512 checksum:

- Download the release apache-yunikorn-X.Y.Z-src.tar.gz from a mirror site.
- Download the checksum apache-yunikorn-X.Y.Z-src.tar.gz.sha512 from Apache.
- Verify the checksum
  - on MacOS-X: `shasum -c apache-yunikorn-X.Y.Z-src.tar.gz.sha512`
  - on Linux: `sha512sum -c apache-yunikorn-X.Y.Z-src.tar.gz.sha512`

## Verifying the release

The release is a source code release and must be built before it can be used.
Unpack the archive and follow the instructions in the `README.md` file to build the images.
A script and configuration to create a small cluster, using the locally built images, is provided in the release archive.

Run the script for more instructions and to list the tools required for validating the release:  
```shell
./validate_cluster.sh
```
The `kind` cluster created is a small, but fully functional, Kubernetes cluster with Apache YuniKorn deployed. 

## Older releases

Release announcement for all releases are available on the website [release announcements](/release-announce/).

You can find all previous releases in the [archive repository](https://archive.apache.org/dist/yunikorn/).
If you are looking for older releases made during incubation check the [incubator archive repository](https://archive.apache.org/dist/incubator/yunikorn/).

The archives include all releases made not mentioned in the table above.

## License

The software is licensed under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
