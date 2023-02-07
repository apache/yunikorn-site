---
id: placement_rules
title: App 放置规则
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
基础的放置规则(placement rules)配置[调度弃配置设计文档](../design/scheduler_configuration#placement-rules-definition)中有相关描述。

我们可以将多个规则链结再一起形成一个放置策略，并通过[存取控制列表(Access control lists)](user_guide/acls.md)和规则过滤来定义和执行规则。

本篇文章将通过例子来解释如何建立策略以及规则的使用，而该放置策略为调度器的一部分。

## 配置
放置规则作为调度程序队列配置的一部分，可以在各分区(partition)中被定义。规则定义的顺序就是他们会被执行的顺序。如果一个规则匹配，策略会停止执行剩余的规则。

匹配的放置规则会产生一个完全合格的队列名称。同时这个回传的队列名称会从根队列(root)开始。而在队列层次结构中，可以生成的层次数量没有限制。

当要执行一条规则时，已经被执行过的规则不会被列入考虑；这条规则也不会对往后要执行的规则有所影响：规则不能影响其他的规则，除非它们被配置为父规则([parent](#parent-参数))。

当放置策略没有生成队列名称且没有更多的规则时，应用程式将会被拒绝。

在配置中，定义放置规则的基本结构如下：
```yaml
placementrules:
  - name: <第一条放置规则的名称>
  - name: <第二条放置规则的名称>
```
每个[规则](#规则)都可以在配置中采取一套预定义的参数。可以被使用的规则名称在规则描述中提及。规则名称在配置中不区分大小写，且必须遵从以下的命名惯例：
* 从字母开始：a-z 或 A-Z
* 后面跟着0或多个字元 a-z, A-Z, 0-9 或 _

当规则名称没有对应到任何已定义的规则时，表示规则处于未知的状态，会造成放置管理器初始化错误。如果参数不正确，会抛出解析错误或在初始化时发生错误。一个有错误的规则集永远不可能被激活。

如果放置管理器中含有一个被激活的规则集，就代表他已经初始化了。重新载入时，若配置了一个新的规则集时，就会将新的规则集激活，并取代旧有的。如果新规则集包含一个错误，放置管理器就会忽视这个新规则集，同时也持续处于「使用不完全的规则集」的状态。如果放置管理器持续使用已激活的规则集，忽视新的且有错误的规则集时，则会记录一条关于坏掉且被忽视的配置信息。

规则结果中的「点 "."」，会被文字的「"\_dot\_"」所替代。而「点」会被取代是因为在完全限定的队列名称中，他是被用来分隔队列层次的。而替代过程是发生在建构完整队列层次，且结果合格之前。这代表我们允许用「点」来表达用户名或标籤值，但不影响到队列层次。举例来说，当配置中的队列对应到「含有点的用户名」时，你必须要使用以下方法来指定它们：如果一个用户名称为`user.name`且使用`user`规则，则会产生队列名称为`root.user_dot_name`的队列。而如果该用户队列必须事先被加到配置中，则也该使用`user_dot_name`这个名字。

### Create 参数
create 参数是一个布林值，会定义当一个队列不存在时，是否可以在规则的定义下创建队列。不能保证队列一定会被创建，因为现有的队列可能会阻止创建。但如果规则定义下想创建的队列不存在，且`create: false`，那结果将会是创建失败。

带有`create`参数的简易yaml范例：
```yaml
placementrules:
  - name: <放置规则的名称>
    create: true
```
预设值为`false`。允许的值为`true`或`false`，其他值均会导致显示错误。

### Parent 参数
`parent` 参数允许指定一个规则，并为他产生一个父队列。父规则可以被嵌套，一个父规则可以包含另一个父规则，此外对于父规则的嵌套也没有强制限制。

父规则被视为顶层的规则，因此具有与放置定义中任何其他规则相同的参数和需求。例外的情况是，在「已经生成完全合格队列」的规则上再使用父规则，被认为是一个配置错误。这个错误只能发生在`fixed`型的规则上，查看规范可以得到更多细节。

注意：规则的执行会沿着父规则的列表向下遍历，并首先执行列表中的最后一条。代表最后一条父规则将会直接产生在根部，详见示例。

带有`parent`参数的简易yaml范例：
```yaml
placementrules:
  - name: <放置规则的名称>
    parent:
      name: <父规则的名称>
```
预设值中没有parent参数。

### Filter 参数
通过`filter`参数的定义，能过滤掉适用的用户来进行配置。过滤器是一个复杂的配置組件。

用户和群组可以被配置为两种类别：
* 正则表达式
* 用户或群组的列表

如果用户或群组在yaml中的条目超过一个，则就会被视为一个用户列表或群组列表。列表中重复的条目会被忽略，不会引起错误。依据其他列表元素来使用正则表达式是不被允许的。

用户和群组名称遵循标准的Linux 用户和群组惯例，对于用户名来说：
* 从一个字母作为开头：a-z 或 A-Z
* 后面跟着0或更多个字符：a-z, A-Z, 0-9 或 _ . @ -
* 最后一个字符可以式$

对于群组名来说：
* 从一个字母作为开头：a-z 或 A-Z
* 后面跟着0或更多个字符：a-z, A-Z, 0-9 或 _ -

如果列表中正好有一个条目，他可以是单个用户、群组或正则表达式。当一个条目包含一个在用户或群组中不允许的字符时，该条目会被认为是一个正则表达式。正则表达式必须按照规定进行编译。一个不能编译的正则表达式将会被忽略。

此外针对群组的正则表达式中：每次都是针对一个组进行匹配，而不是针对组的列表。

带有 `filter`参数的简易yaml范例：
```yaml
filter:
  type: deny
  users:
    - <user name or regexp>
    - <user name>
  groups:
    - <group name or regexp>
    - <group name>
```
预设值中没有filter参数。

### Value 参数
这是一个通用值，用来传递给规则以实现或改变其行为。该值被用来与[fixed](#fixed-rule)和[tag](#tag-rule)型的规则一起使用。此外`value`是以字串型式存在的单一值，也不会被系统解释或干扰。

带有 `value`参数的简易yaml范例：
```yaml
placementrules:
  - name: <放置规则的名称>
    value: "any string"
```
预设值中没有value参数。

## 准入控制列表
准入控制列表没有在规则中定义，但它们影响放置策略的结果。有两种准入控制列表可以被定义到队列上：
1. 提交ACL: `submitacl`
2. 管理ACL: `adminacl`

如果队列的ACL允许任何ACL提交存取，则放置规则才能匹配。管理队列ACL还提供「提交准入」的功能。如果队列不存在或没有配置ACL，则将检查父队列的ACL。这种递迴的检查会重复执行，直到有ACL提供存取或根目录的ACL被检查过后。

关于ACL语法的更多细节，请查阅[ACL文档](user_guide/acls.md)。

## 规则
### Provided Rule
在配置中使用的名称：*provided*

提供在提交应用时所指定的队列。本规则的行为是─如果队列不完全合格，则完全限定由「应用程序提供的队列」作为放置的队列。如果设置了一个父规则，并且在应用程序提交中提供的队列是完全合格的，那麽父规则就不会被执行。

支持的参数：
* create
* parent
* filter

举例：如果用户名下不存在队列，则用户传入的队列会被创建。
```yaml
placementrules:
  - name: provided
    create: true
    parent:
      name: user
      create: true
```
当用户 `developer` 向应用程式提交请求，且应用程式要求的队列名称为：`my_special_queue`。<br/>
结果：`root.developer.my_special_queue`(父规则将设置用户名称)。

当用户 `developer` 向应用程式提交请求，且应用程式要求的队列名称为：`root.dev_queue`。<br/>
结果：`root.dev_queue`(父规则将被忽视)。

### User Name Rule
在配置中使用的名称：*user*

提供一个基于用户名的队列，而该用户名为所提交的应用程序的一部分。

支持的参数：
* create
* parent
* filter

举例：提交一个基于用户名的队列，如果队列不存在，不要创建队列。
```yaml
placementrules:
  - name: user
    create: false
```

当用户`finance.test`提交了一个应用程式，此外对应的队列也存在。<br/>
结果： `root.finance_dot_test`(注意，「点」被替换了)。

当用户`developer`提交了一个应用程式，但对映的队列不存在。<br/>
结果：失败，执行下一条规则。

### Fixed Rule
在配置中使用的名称：*fixed*

回传一个队列，其依据规则参数的值作为名称，配置的值必须是一个合法的队列名称或层次结构。该队列名称不一定需要完全合格。名称中的层次结构使用「一个点(.)」作为层次结构中不同级别的分隔符。只有当配置的队列不存在且`create`标籤未设置时，`fixed`规则才会失败，因为他始终新增一个配置的队列。

支持的参数：
* value(reuqired)
* create
* parent
* filter

举例：因为总是会回传一个队列，若没有设置`create`标籤，则要在配置中将队列定义为子队列。
```yaml
placementrules:
  - name: fixed
    value: last_resort
```

当用户 `developer`提交请求，且在应用程式中设定的队列为：`my_special_queue` 。<br/>
结果：`root.last_resort`。

### Tag Rule
在配置中使用的名称：*tag*

从应用程式的标籤中检索队列名称。检查`tag`的值(value)，并在规则中使用该值进行配置。若`tag`规则没有包含任何值，则代表配置错误，但是一个应用程式不一定要设置该值。

如果应用程序上没有设置对应的`tag`，则规则失败。如果从应用程序回传的`tag` value是一个完全限定的队列名称，则父规则(如果已配置)将不会执行。

支持的参数：
* value(reuqired)
* create
* parent
* filter

举例：根据kubernetes命名空间放置一个应用程序，该命名空间在提交时自动在应用程序中设置。
```yaml
placementrules:
  - name: tag
    value: namespace
    create: true
```

用户`developer`在命名空间`default`，提交基于kubernetes的应用程序请求，且在应用程是中设定的队列为：`my_pecial_queue`。<br/>
结果：`root.default`。

用户`developer`在命名空间`testing`，提交基于kubernetes的应用程序请求，且在应用程是中设定的队列为：`my_pecial_queue`。<br/>
结果：`root.testing`。

用户提交非基于kubernetes的应用程序请求。<br/>
结果：失败，执行下一条规则。

## 复杂的例子
在这个复杂的例子中，我们串连了三个规则：

1. 一个`user`规则，其父规则标籤使用kubernetes命名空间，且仅供`dev`群组内的用户。
2. 一个`tag`规则，使用kubernetes命名空间，其`parent`规则固定使用已存在的队列─ `root.namespaces`。
3. 一个`fixed`规则，将所有到达这个点的应用程序都放在`root.default`队列中。

举例：
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
用户`john`在命名空间testing中提交基于kubernetes应用程序的请求。<br/>
结果：`root.namespaces.testing`(在规则2中匹配)。

用户`sarah`在命名空间`newapp`中提交基于kubernetes应用程序的请求，组员为`sarah`, `test_app`, `dev_app`。<br/>
结果：`root.newapp.sarah`(在规则1中匹配)。

用户bob在命名空间`testapp`中提交基于kubernetes应用程序的请求，组别成员为`bob`。<br/>
结果：`root.default`(在规则3中匹配)。
<br/>
在第二个例子中，我们使用了两条规则。

1. 一个`fixed`规则，将所有东西放在`root.production`队列中。
2. 一个`user`规则，以及设置 `create` 标籤。

但在这个例子中，我们在`root.production`的队列上设置了ACL，只允许两个特定的用户使用这个队列。因此，即使规则匹配，除非是`john`或`bob`，否则应用程式将不会被放在`production`队列中。所有其他用户将匹配第二条规则并使用它们自己的队列，如果队列不存在，就会创建。

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
