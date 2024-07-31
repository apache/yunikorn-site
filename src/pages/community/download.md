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

The latest release of Apache YuniKorn is v1.5.2.

| Version | Release date | Source download                                                                                                                                                                                                                                                                                       | Docker images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Release notes                           |
|---------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| v1.5.2  | 2024-07-26   | [Download](https://www.apache.org/dyn/closer.lua/yunikorn/1.5.2/apache-yunikorn-1.5.2-src.tar.gz)<br/>[Checksum](https://downloads.apache.org/yunikorn/1.5.2/apache-yunikorn-1.5.2-src.tar.gz.sha512) & [Signature](https://downloads.apache.org/yunikorn/1.5.2/apache-yunikorn-1.5.2-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.5.2/images/sha256-611d3cf1084a4d0f5e71a75d9c3e592b5a31061ad68d2595359dbee7b2c4aedf)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.5.2/images/sha256-4f04e64c02f595ff11eef1a956c939d2c6bcaf4983f5d167339542678ed7c0cc)<br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.5.2/images/sha256-2e090a87593d210e037f3bb80b5633a7e0f7ddad1d92474003ad380eda1c28b7)<br/>[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.5.2/images/sha256-d28f2724b0e2608682cf6506022bbedbc30938c9644155fa9e676269c7e688b1) | [Announcement](/release-announce/1.5.2) |
| v1.4.0  | 2023-11-20   | [Download](https://archive.apache.org/dist/yunikorn/1.4.0/apache-yunikorn-1.4.0-src.tar.gz)<br/>[Checksum](https://archive.apache.org/dist/yunikorn/1.4.0/apache-yunikorn-1.4.0-src.tar.gz.sha512) & [Signature](https://archive.apache.org/dist/yunikorn/1.4.0/apache-yunikorn-1.4.0-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.4.0/images/sha256-d013be8e3ad7eb8e51ce23951e6899a4b74088e52c3767f3fcc7efcdcc0904f5)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.4.0/images/sha256-d93cd7cb480d8bd0ae829d88484b5c8b8f89c843dd0ea48694a636cc0bb00e07)<br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.4.0/images/sha256-60a732eb04a9690214d2d2f852058a501585091901fb9c0faf66a378e710d452)<br/>[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.4.0/images/sha256-7a82c87f4f6caf950529478851f0aaa5da2b225668325ee50b7422c477804e02) | [Announcement](/release-announce/1.4.0) |
| v1.3.0  | 2023-06-12   | [Download](https://archive.apache.org/dist/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz)<br/>[Checksum](https://archive.apache.org/dist/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz.sha512) & [Signature](https://archive.apache.org/dist/yunikorn/1.3.0/apache-yunikorn-1.3.0-src.tar.gz.asc) | [scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-1.3.0/images/sha256-99a1973728c6684b1da7631dbf015daa1dbf519dbab1ffc8b23fccdfa7ffd0c5)<br/>[admission-controller](https://hub.docker.com/layers/apache/yunikorn/admission-1.3.0/images/sha256-3fb41eafcb16ec709879301f0f1cf5ffd18d95e6bb266b20e2971c39c6f6fc94)<br/>[web](https://hub.docker.com/layers/apache/yunikorn/web-1.3.0/images/sha256-47c1ff0b58c2c0833bf8662065f7517b8e235dbc2197a9511549ec2ee4b31969)<br/>[scheduler plugin](https://hub.docker.com/layers/apache/yunikorn/scheduler-plugin-1.3.0/images/sha256-c3c564033dd8ea07d2f7c5fe272be43b8eba7e7b115ac9b5bee4cf8cae681cd9) | [Announcement](/release-announce/1.3.0) |

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
