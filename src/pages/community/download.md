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

We publish pre-build docker images for everyone's convenience.

The latest release of Apache YuniKorn is v1.0.0.

| Version | Release date | Source download                                                                                                                                                                                                                                                                                                                                                              | Docker images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Release notes                            |
|---------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| v1.0.0  | 2022-05-06   | [Download](https://www.apache.org/dyn/closer.lua/yunikorn/1.0.0/apache-yunikorn-1.0.0-src.tar.gz) <br />[Checksum](https://downloads.apache.org/yunikorn/1.0.0/apache-yunikorn-1.0.0-src.tar.gz.sha512) & [Signature](https://downloads.apache.org/yunikorn/1.0.0/apache-yunikorn-1.0.0-src.tar.gz.asc)                                                                      | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.0.0/images/sha256-a38ef737337798a6597c56637efc5eeae1701898eb94c4c43e638cbdb9ad782c) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.0.0/images/sha256-2673539c26c42a1607fbf7eba9f11d7e9737eb21e90c20eafdbcc4367d07d7a6) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-1.0.0/images/sha256-10cb381da02db65c05e9ef2a712ddd28d36d67ee8cb127dd95f14603707db5d9) <br />[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.0.0/images/sha256-f7b2a186b3088e269842c415e1fe1c2afa8835e24a98fa85097e6be5c234712b) | [Announcement](/release-announce/1.0.0)  |
| v0.12.2 | 2022-02-03   | [Download](https://archive.apache.org/dist/incubator/yunikorn/0.12.2/apache-yunikorn-0.12.2-incubating-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/incubator/yunikorn/0.12.2/apache-yunikorn-0.12.2-incubating-src.tar.gz.sha512) & [Signature](https://archive.apache.org/dist/incubator/yunikorn/0.12.2/apache-yunikorn-0.12.2-incubating-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-0.12.2/images/sha256-aa2de246fc48a6a9859f0cc1b9fb66c4a0928a5af5925494b68ca755c69e830b) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-0.12.2/images/sha256-0270b1912b5da05db635d1952608f04166e892385e879a16940d963bd1c79bd4) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-0.12.2/images/sha256-7c886a967d04c3a8df14a3ededf15e14af7db8cd7bea85ca4b935a5c9a0f0243)                                                                                                                                                                            | [Announcement](/release-announce/0.12.2) |
| v0.11.0 | 2021-08-18   | [Download](https://archive.apache.org/dist/incubator/yunikorn/0.11.0/apache-yunikorn-0.11.0-incubating-src.tar.gz) <br />[Checksum](https://archive.apache.org/dist/incubator/yunikorn/0.11.0/apache-yunikorn-0.11.0-incubating-src.tar.gz.sha512) & [Signature](https://archive.apache.org/dist/incubator/yunikorn/0.11.0/apache-yunikorn-0.11.0-incubating-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-0.11.0/images/sha256-7d156e4df2cb1a99d6f3cf5bfd15ae42c7c195f66411b83a720b375194209d20) <br />[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-0.11.0/images/sha256-2b1cee3e79a0f08c835ed264c537b14eb0527d7196dcbbf613296f034c8c2a70) <br />[web](https://hub.docker.com/layers/apache/yunikorn/web-0.11.0/images/sha256-e07a8465fefb4f51ab989b7be4db824b51fc4b925fb400c09fad87d0b0729246)                                                                                                                                                                            | [Announcement](/release-announce/0.11.0) |

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
  - on Linux: `sha256sum -c apache-yunikorn-X.Y.Z-src.tar.gz.sha512`

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
