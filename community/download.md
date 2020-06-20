---
id: download
title: Apache YuniKorn (Incubating)
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

Apache YuniKorn (Incubating) is released as source code tarballs. The downloads are distributed via mirror sites and should be checked for tampering using GPG or SHA-512.

The latest release of Apache YuniKorn is v0.8.0.

|  Version   | Release date  | Source download  | Docker images  | Release notes  |
|  ----  | ----  | ----  | ----  | ----  |
| v0.8.0  | 2020-05-04 | [Download](https://www.apache.org/dyn/closer.cgi/incubator/yunikorn/0.8.0-incubating/apache-yunikorn-0.8.0-incubating-src.tar.gz) ([Checksum](https://downloads.apache.org/incubator/yunikorn/0.8.0-incubating/apache-yunikorn-0.8.0-incubating-src.tar.gz.sha512) [Signature](https://downloads.apache.org/incubator/yunikorn/0.8.0-incubating/apache-yunikorn-0.8.0-incubating-src.tar.gz.asc)) | [Scheduler](https://hub.docker.com/layers/apache/yunikorn/scheduler-0.8.0/images/sha256-0b35f9bb767f06af7f84f58799401ba7de7b8991f3c9724f40f733bc517193df) [Admission controller](https://hub.docker.com/layers/apache/yunikorn/admission-0.8.0/images/sha256-700e9bf7bc5597ab144be9f29b489fb82d7e012ee46d34bbc26cfb91bf364124) [Web app](https://hub.docker.com/layers/apache/yunikorn/web-0.8.0/images/sha256-83faa83ec9d1c90b40ca5bee9977c31fba31ba34f3ae9c785d994adbb545a273) | [Announcement](https://yunikorn.apache.org/release/v0.8.0.html) |


## Verifying the signature

To verify the Apache YuniKorn release using GPG:

- Download the release apache-yunikorn-X.Y.Z-incubating-src.tar.gz from a mirror site.
- Download the signature file apache-yunikorn-X.Y.Z-incubating-src.tar.gz.asc from Apache.
- Download the Apache YuniKorn [KEYS](https://downloads.apache.org/incubator/yunikorn/KEYS) file.
- gpg –import KEYS
- gpg –verify apache-yunikorn-X.Y.Z-incubating-X.Y.Z-src.tar.gz.asc

## Verifying the checksum

To verify the integrity of Apache YuniKorn release using the SHA-512 checksum:

- Download the release apache-yunikorn-X.Y.Z-incubating-X.Y.Z-src.tar.gz from a mirror site.
- Download the checksum apache-yunikorn-X.Y.Z-incubating-X.Y.Z-src.tar.gz.sha512 from Apache.
- shasum –a 512 apache-yunikorn-X.Y.Z-incubating-X.Y.Z-src.tar.gz

## All releases

You can find all previous releases in the [Archive incubating repository](https://archive.apache.org/dist/incubator/yunikorn/).

## License

The software is licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)



