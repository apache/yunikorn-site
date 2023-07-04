---
id: acls
title: ACLs
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

:::info
用户信息通过 [这里](usergroup_resolution) 定义的方法从 kubernetes shim 传递给 Yunikorn core。
:::

## 使用方法
访问控制列表对 YuniKorn 来说是通用的。
它们可以在 YuniKorn 的多个地方使用。
目前的使用情况仅限于队列 ACL。

访问控制列表允许对列表中指定的用户和组进行访问。
他们不提供明确删除或拒绝访问列表中指定的用户和组的可能性。

如果没有配置访问控制列表，默认情况下访问是 *拒绝* 的。

## 语法
访问控制列表的定义如下：
```
ACL ::= “*” |  userlist [ “ “ grouplist ]
userlist ::= “” | user { “,” user }
grouplist ::= “” | group { “,” group }
```

这个定义指定了一个通配符 *，结果是每个人都可以访问。

如果用户列表为空，组列表为空，则没有人可以访问。
拒绝所有的 ACL 有两种可能的表现形式：
* 一个空的访问控制列表。(隐式)
* 一个空格(显式)


## 示例配置

### 简单示例
一个只允许用户 `sue` 访问的 ACL
```yaml
  adminacl: sue
```
其他人不会得到访问权，这仅适用于 `sue`。
`john` 和 `bob` 将被拒绝访问。

一个允许用户 `sue` 和组 `dev` 成员访问的 ACL。
```yaml
  adminacl: sue dev
```
用户 `sue` 根据她在ACL的用户部分的明确提及而获得访问权。
尽管她不是 `dev` 组的成员。她的组员身份是不相关的。

名为 `john` 的用户是 `dev` 组的成员，他将被允许根据他的组员身份进行访问。
第三个用户叫 `bob` ，他没有被明确提到，也不是 `dev` 组的成员，将被拒绝访问。

一个允许访问 `dev` 和 `test` 组成员的 ACL。
```yaml
  adminacl: " dev,test"
```
ACL必须以空格开始，表示没有用户列表。
如果ACL没有正确引用，空格会被 yaml 解析器删除。
由于用户列表是空的，除非他们是 `dev` 或 `test` 组的成员，否则没有一个用户会得到访问权。

看一下和之前一样的三个用户：
用户 `sue` 不是任何一个组的成员，被拒绝访问。
名为 `john` 的用户是 `dev` 组的成员，根据他的组员身份，他将被允许访问。
`bob` 不是 `dev` 组的成员。由于其为 test 的成员，所以 `bob` 将被允许访问。

### 转义和引号
ACL 目前是在队列配置中实现的，它使用一个 yaml 文件。
这对如何转义值有一些限制。
不正确的引号值将导致 yaml 解析错误，或者可能导致对值的不正确解释。

以下几点需要考虑到：
1. 通配符条目必须在 yaml 配置中加引号。
1. 一个简单的用户列表，无论它后面是否有一个组的列表，都不需要加引号，但可以加引号。
1. 一个没有用户列表，只有一个或多个组的 ACL 必须加引号，以找到起始空间：

正确引用 ACL 的例子
```yaml
partitions:
  - name: default
    queues:
      - name: test
        submitacl: "*"
        adminacl: sue dev,test
      - name: product
        submitacl: " product"
```

## 访问检查
访问检查遵循以下模式：
* 检查 ACL 是否是通配符
* 检查该用户是否在用户列表中
* 检查该用户所属的任何组是否是组列表的一部分

如果检查匹配，ACL 允许访问并停止检查。
如果没有一个检查匹配，则 ACL 拒绝访问。

## 用户和组信息
对于用户和组的解决，请遵循 [这里](usergroup_resolution) 定义的说明
