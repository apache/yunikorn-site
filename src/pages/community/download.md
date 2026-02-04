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

The latest release of Apache YuniKorn is v1.8.0.

| Version | Release date | Source download                                                                                                                                                                                                                                                                                       | Docker images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Release notes                           |
|---------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| v1.8.0  | 2026-02-03   | [Download](https://www.apache.org/dyn/closer.lua/yunikorn/1.8.0/apache-yunikorn-1.8.0-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/yunikorn/1.8.0/apache-yunikorn-1.7.0-src.tar.gz.sha512) & [Signature](https://downloads.apache.org/yunikorn/1.8.0/apache-yunikorn-1.8.0-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.8.0/images/sha256-e038326d0dca5990d2f4505aa799bc46f70e95d73929fef5ff9ad98926c30822)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.8.0/images/sha256-b04a3c7c1957c812744e9dde33bf7fb1b81a524bc6c15e7f16541baa954caf6d)<br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.8.0/images/sha256-7af91391d816a22ecb9b34fe24224024aea7fb2d2fc7596a0fa50ede565fa44c)                                                                                                                                                                             | [Announcement](/release-announce/1.8.0) |
| v1.7.0  | 2025-05-06   | [Download](https://archive.apache.org/dist/yunikorn/1.7.0/apache-yunikorn-1.7.0-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/yunikorn/1.7.0/apache-yunikorn-1.7.0-src.tar.gz.sha512) & [Signature](https://downloads.apache.org/yunikorn/1.7.0/apache-yunikorn-1.7.0-src.tar.gz.asc)       | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.7.0/images/sha256-51262e07493f9beadf4488aefc23877d553597bfb0705b00303e88470ae98ae4)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.7.0/images/sha256-6398839ae00bf6227cb8322e4b7c206f055e68ba7eba351cd9822041e6b8a255)<br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.7.0/images/sha256-bf348d8473cc417327c6a3e9b672ca95a4ad969e102185e86243e774ab14dcee)<br/>[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.7.0/images/sha256-339af0d36f1dfaf514fa4e9d8fa83ceec03b88032fe7a1ffc211812a63b968f0) | [Announcement](/release-announce/1.7.0) |
| v1.6.3  | 2025-05-06   | [Download](https://archive.apache.org/dist/yunikorn/1.6.3/apache-yunikorn-1.6.3-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/yunikorn/1.6.3/apache-yunikorn-1.6.3-src.tar.gz.sha512) & [Signature](https://downloads.apache.org/yunikorn/1.6.3/apache-yunikorn-1.6.3-src.tar.gz.asc)       | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.6.3/images/sha256-093cea908ac49b8c2434db3b7b7eb3c0015f0a401af8c20da2b42f7bb42ebfff)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.6.3/images/sha256-ecca4134dc3417b1e8357fe309b2a55cb45a911fa3f678ed6e68f5ba87cdc2c9)<br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.6.3/images/sha256-702a814dbd783f610b51729e7ae9d0a5b25e9e9441c7cbfeebcb125a8cb31ac2)<br/>[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.6.3/images/sha256-713ae590d44d60429dcb0ba1781acb7b775cc89d1ac620af97327bec7c4dfbcc) | [Announcement](/release-announce/1.6.3) |

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

Release announcement for all releases are available on the website [release announcements](/release-announce).

You can find all previous releases in the [archive repository](https://archive.apache.org/dist/yunikorn/).
If you are looking for older releases made during incubation check the [incubator archive repository](https://archive.apache.org/dist/incubator/yunikorn/).

The archives include all releases made not mentioned in the table above.

## License

The software is licensed under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
