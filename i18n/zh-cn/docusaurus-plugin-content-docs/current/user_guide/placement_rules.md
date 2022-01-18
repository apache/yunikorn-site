---
id: placement_rules
title: 应用放置规则
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

放置规则的基本信息在 [调度器配置设计文档](design/scheduler_configuration.md#placement-rules-definition) 中有描述。
一个放置策略可以连接多个规则。
[访问控制列表](user_guide/acls.md) 和规则过滤器根据规则定义，并根据规则强制执行。
本文档通过示例说明了如何构建作为调度器一部分的策略，包括规则用法。

## 配置
规则是作为调度器队列配置的一部分按分区定义的。
规则的定义顺序就是规则的执行顺序。
如果某个规则与策略匹配，则该策略将停止执行其余规则。

匹配规则生成一个全域名的队列名称。
这意味着返回的名称从 _root_ 队列开始。
可以生成的队列层次结构中的层级数目没有限制。

当执行规则时，已执行规则的结果是未知的，不会被考虑在内。
与尚未执行的规则类似：规则不能影响其他规则，除非它们被配置为 [父级](#parent-parameter) 规则。

如果策略不生成队列名称并且没有更多规则，则应用程序将被拒绝。

配置中规则放置定义的基本结构：
```yaml
placementrules:
  - name: <第一个规则名称>
  - name: <第二个规则名称>
```
每个规则都可以在配置中采用一组预定义的参数。
[规则](#rules) 章节的描述中给出了可以使用的规则名称。
配置中的规则名称不区分大小写。
规则名称必须遵循以下命名约定：
* 以字母开头：a-z 或 A-Z
* 后跟 0 个或多个字符 a-z、A-Z、0-9 或 _

未知的规则，即名称未映射到下面定义的规则，将导致放置策略管理器的初始化错误。
如果参数不正确，规则也可以在初始化期间抛出解析异常或错误。
有错误的规则集永远不会变为活动状态。

如果放置策略管理器具有活动规则集，则将其视为已初始化。
当重新加载配置时，将创建一个新规则集来替换活动规则集。
如果加载的新规则集包含错误，即被破坏，则放置策略管理器将忽略新规则集。
这意味着放置策略管理器保持在加载损坏的规则集时的状态。
如果放置策略管理器在已经初始化的情况下继续使用现有的活动规则集，它将记录有关损坏和忽略的配置的消息。

规则结果中的点 "." 字符串会被替换为 "\_dot_" 。
点被替换的原因是它在定义资源队列时被用作父队列与子队列中间的分隔符。
替换点发生在构建完整队列层次结构并且结果合格之前。
这意味着我们允许用户名和/或标签值包含点，而这些点不会影响队列层次结构。
例如，对于配置中必须用点映射到用户名的队列，您必须按如下方式指定它们：
具有用户 `user.name` 的用户规则将生成队列名称 `root.user_dot_name` 作为输出。
如果必须将该“用户队列”添加到配置中，则应使用 `user_dot_name` 名称。

### creat 参数
create 参数是一个布尔标志，它定义如果由规则生成的队列不存在时是否可以创建它。
我们无法保证队列是否能创建，因为现有队列可能会阻止创建队列。
如果规则生成的队列不存在且标志未设置为 _true_ ，则规则的结果将失败。

带有 `create` 标志的规则的基本 yaml 配置：
```yaml
placementrules:
  - name: <规则名称>
    create: true
```

默认值为 _false_ 。
允许值：_true_ 或 _false_，任何其他值都会导致解析错误。

### parent 参数
parent 参数允许指定为当前规则生成父队列的规则。
父规则可以嵌套，一个父规则 _可以_ 包含另一个父规则。
可以嵌套的父规则没有强制限制。

父规则被视为在列表顶层指定的规则，因此与放置定义中的任何其他规则具有相同的参数和要求。
例外情况是，在已生成全域名的队列规则上使用父规则被视为配置错误。
此错误只会出现在 [fixed](#fixed-rule) 类型的规则上，有关详细信息，请参阅规则规范。

注意：规则的执行会向下遍历父规则列表，并首先执行列表中的最后一个。
这意味着最后一个父规则将在根的正下方生成队列。
有关详细信息，请参阅示例。

具有 `parent` 规则的规则的基本 yaml 配置：
```yaml
placementrules:
  - name: <规则名称>
    parent:
      name: <父规则名称>
```

parent 的默认值为 _no_ 。

### filter 参数
规则上的 filter 允许过滤该规则适用的用户。
filter 是一个复杂的配置对象。

可配置的 _用户_ 和 _组_ 可以是以下两种类型之一：
* 一个正则表达式
* 用户或组的列表。

如果用户或组的条目在 yaml 中超过1条，则始终将其视为用户或组的列表。
列表中的重复条目将被忽略并且不会导致错误。
不允许在其他列表元素以外指定正则表达式。

用户和组名遵循标准的 linux 用户和组约定。
对于用户名：
* 以字母开头：a-z 或 A-Z
* 后跟0个或多个字符 a-z、A-Z、0-9 或 _ . @ -
* 最后一个字符也可以是 $

对于组名：
* 以字母开头：a-z 或 A-Z
* 后跟0个或多个字符 a-z、A-Z、0-9 或 _ -

如果列表恰好是一条，则它可以是单个用户或组，也可以是正则表达式。
当条目包含用户名或组名中不允许的字符时，该条目被视为正则表达式。
正则表达式必须按照指定的方式编译。
不编译的正则表达式将被忽略。

特别是对于组的正则表达式：匹配一次执行一个组，而不是针对组列表。

基本的 `filter` yaml 配置：
```yaml
filter:
  type: deny
  users:
    - <用户名称或正则表达式>
    - <用户名称>
  groups:
    - <组名称或正则表达式>
    - <组名称>
```

filter 的默认值为 _no_ 。

### value 参数
这是一个通用值，可用于传递给规则以实现或更改其行为。
value 被 [fixed](#fixed-rule) 和 [tag](#tag-rule) 规则使用。
value 是字符串形式的单个值，不会被系统解释或操作。

设置了 `value` 的规则的基本 yaml 配置：
```yaml
placementrules:
  - name: <规则名称>
    value: "任意string"
```

值的默认值为 _no_ 。

## 访问控制列表
访问控制列表不在规则中定义，但它们会影响放置策略的结果。
可以在队列上定义两个访问控制列表：
1.提交 ACL：_submitacl_
1.管理 ACL：_adminacl_

只有当队列允许通过任一 ACL 进行提交访问时，放置规则才会匹配。
管理队列 ACL 还提供 _提交_ 访问。
如果队列不存在或没有设置 ACL，则检查父队列的 ACL。
重复此递归检查，直到 ACL 提供访问权限或在检查根队列的 ACL 之后。

有关 ACL 语法的更多详细信息，请查看 [ACL 文档](user_guide/acls.md)。

## 规则
### Provided 规则
配置中使用的名称：*provided*

返回在提交应用程序期间提供的队列。
如果所指定的队列名为全域名，那么该应用会被提交到该全域名所指向的队列并忽略其他规则。
如果所指定的队列名为非全域名，该规则的父规则将得以执行以此来决定全域名。

支持的参数:
* create
* parent
* filter

示例：如果用户指定的队列不存在于给定的用户名的父队列下，则创建它
```yaml
placementrules:
  - name: provided
    create: true
    parent:
      name: user
      create: true
```
使用 `developer` 作为用户进行应用提交请求，应用提交给队列：`my_special_queue`<br/>
结果：`root.developer.my_special_queue`（父规则设置用户名）

使用 `developer` 作为用户进行应用提交请求，应用提交给队列：`root.dev_queue`<br/>
结果：`root.dev_queue`（忽略父规则）

### 用户名称规则
配置中使用的名称：*user*

根据作为提交应用程序一部分的用户名返回队列。

支持的参数:
* create
* parent
* filter

示例：根据用户名提交到队列，如果队列不存在则不创建队列：
```yaml
placementrules:
  - name: user
    create: false
```

使用 `finance.test` 作为用户进行应用提交请求，队列确实存在：<br/>
结果：`root.finance_dot_test`（注意点 dot 的替换）

使用 `developer` 作为用户进行应用提交请求，队列不存在：<br/>
结果：失败，执行下一条规则

### 固定规则
配置中使用的名称：*fixed*

返回在规则参数 _value_ 中配置的名称。
配置的值必须是合法的队列名称或队列层次结构。
该名称不必是全域名的队列名称。
名称中的层次结构使用点作为层次结构中不同级别的队列名称的分隔符。
只有在配置的队列不存在且未设置创建标志时，固定规则才会失败，因为它将始终返回配置的队列。

如果配置的值是一个全域名的队列名称，则配置父规则将被视为 _error_。

支持的参数:
* value (必须)
* create
* parent
* filter

示例：始终返回一个固定队列，没有设置 `create` 标志，因此需要在配置中将队列定义为叶队列。
```yaml
placementrules:
  - name: fixed
    value: last_resort
```

使用 `developer` 作为用户进行应用提交请求，应用提交给队列：`my_special_queue`<br/>
结果：`root.last_resort`

### 标签规则
配置中使用的名称：*tag*
从应用程序标签中检索队列名称。
检查其值的标签名称在规则中使用 `value` 进行配置。
在没有设置 `value` 的情况下配置标签规则是错误的，但是应用程序不必设置标签。

如果未在应用程序上设置标签，则规则失败。
如果从应用程序返回的标签值是一个全域名的队列名称，则不会执行父规则（如果已配置）。

支持的参数:
* value (必须)
* create
* parent
* filter

示例：基于 kubernetes `namespace` 放置一个应用程序，该应用程序在提交时会自动在应用程序中设置：
```yaml
placementrules:
  - name: tag
    value: namespace
    create: true
```

使用用户 `developer` 在命名空间 `default` 中提交一个基于kubernetes的应用程序的请求，应用提交给队列：`my_special_queue`<br/>
结果：`root.default`

使用用户 `developer` 在命名空间 `testing` 中提交一个基于kubernetes的应用程序的请求<br/>
结果：`root.testing`

用户 `developer` 对非 kubernetes 应用进行应用提交请求<br/>
结果：失败，执行下一条规则

## 复杂案例
在这个复杂的例子中，我们列出了三条规则：
1. 一个 `user` 规则，在 kubernetes 命名空间中使用父规则 `tag` ，仅用于属于“dev”组的用户。
2. 一个使用 kubernetes 命名空间的 `tag` 规则，使用现有队列 `root.namespaces` 的父规则 `fixed`。
3. 一个 `fixed` 规则，将到达该点的所有内容都放在 `root.default` 队列中。

Example:
```yaml
placementrules:
  - name: user
    create: true
    filter:
      type: allow
      groups:
        - dev*
    parent:
      - name: tag
        value: namespace
  - name: tag
    value: namespace
    create: true
    parent:
      - name: fixed
        value: root.namespaces
        filter:
          type: allow
          users:
            - john
  - name: fixed
    value: root.default
```

使用用户 `john` 在命名空间 `testing` 中提交基于 kubernetes 的应用程序的请求<br/>
结果：`root.namespaces.testing`（在规则 2 中匹配）

应用程序在命名空间 `newapp` 中由用户 `sarah` 提交基于 kubernetes 的应用程序的请求，组成员身份为 `sarah, test_app, dev_app`<br/>
结果：`root.newapp.sarah`（在规则 1 中匹配）

应用程序在名称空间 `testapp` 中由用户 `bob` 和组成员 `bob` 提交基于 kubernetes 的应用程序的请求<br/>
结果：`root.deault`（在规则 3 中匹配）

In this second example we chain two rules:
1. a `fixed` rule to place everything in the `root.production` queue
1. a `user` rule, with the create flag set
在第二个示例中，我们列出了两个规则：
1. 将所有内容放入 `root.production` 队列的 `fixed` 规则
2. 设置了 create 标志的`user` 规则

然而，在这种情况下，我们在 `root.production` 队列上设置了 ACL，只允许两个特定用户使用此队列。
因此，即使规则匹配，除非用户是 `john` 或 `bob`，应用程序也不会被放置在 `production` 队列中。
所有其他用户将匹配第二条规则并使用他们自己的队列，如果它不存在则创建该队列。

```yaml
partitions:
  - name: default
    queues:
      - name: production
        submitacl: john,bob
    placementrules:
      - name: fixed
        value: root.production
      - name: user
        create: true
```
