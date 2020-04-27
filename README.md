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
# Apache Yunikorn website

This readme will walk you through building the yunikorn website

## Introduction

1. The `master` branch of the yunikorn is used to manage the website source code. Every time you modify the website, you need to submit it to the `master` branch for saving.

2. The `asf-site` branch is used for the static page branch of the website. Every time you modify the website, you need to save the latest generated static page here. https://yunikorn.apache.org will be updated automatically.

## Build website by docker

```
git clone https://github.com/apache/incubator-yunikorn-site.git
git checkout master

docker build -t yunikorn/yunikorn-website:1.0.0 .

docker run -it -p 4000:4000 -v $PWD/yunikorn-site:/yunikorn-site yunikorn/yunikorn-website:1.0.0 bash
cd /incubator-yunikorn-site
bundle exec jekyll serve --watch --host=0.0.0.0
```

The static page of the website will be generated in the `$PWD/yunikorn-site/_site` directory.

view yunikorn website in local: http://localhost:4000/

## Deploy website

1. Submit the `master` branch to github repo.
2. Copy the `_site` directory to the other backup path, e.g., `back_site`.
3. Switch to the `asf-site` branch, clear all the contents of the directory, copy the contents of the `back_site` directory to this directory, and submit the `asf-site` branch to github repo.
