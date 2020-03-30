# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM ubuntu:18.04
RUN \
  apt-get update && \
  apt-get install -y wget vim git python-pip zlib1g-dev libssl-dev

RUN apt-get update && apt-get -y install bundler

ADD . /incubator-yunikorn-site
RUN ls -la /incubator-yunikorn-site/*

RUN \
  cd / && \
#  git clone https://gitbox.apache.org/repos/asf/incubator-yunikorn-site.git && \
  cd /incubator-yunikorn-site && bundle update

ENV \
  YUNIKORN_SITE=/yunikorn-site
