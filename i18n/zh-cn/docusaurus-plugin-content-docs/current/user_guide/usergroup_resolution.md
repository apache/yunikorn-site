---
id: usergroup_resolution
title: 解析用户和群组
---

<!--
Licensed to the Apache Software Foundation(ASF)under one
or more contributor license agreements.See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.The ASF licenses this file
to you under the Apache License，Version 2.0(the
"License")；you may not use this file except in compliance
with the License.You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing，
software distributed under the License is distributed on an
"AS IS"BASIS，WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND，either express or implied.See the License for the
specific language governing permissions and limitations
under the License.
-->

## 用户解析

用户信息是调度周期的重要概念。他是用来决定是否将作业提交到队列的关键指标之一。Yunikorn调度器依赖于k8s Shim来提供用户信息，但在Kubernetes的世界中，没有任何对象可以识别实际用户，这是基于设计使然，可以从这个[页面](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#users-in-kubernetes)中得到更多资讯。

在Yunikorn中有两种处理用户和群组的方法。
第一种是传统的方式，他使用标签`yunikorn.apache.org/usernname`。如果此标签设置在pod上，则该值会自动提取到shim中并被使用。群组解析也在shim中完成，但预设是不启用的。这种方法的问题有两个方面：首先，可以很容易地绕过用户限制，因为提交者可以自由地将标签设置为任何值，因此这只能在受信任的环境中使用。其次，在shim中识别组别太慢了─将用户分配到多个群组​是不可行的，因为根据身份验证机制(如X509，tokens，LDP，etc)可能很难查找用户属于哪一个群组。

由于这些限制很大，为了向后兼容才保留了此方法，并且将来可能会被删除。

一种更可靠和健全的机制是使用`yunikorn.apache.org/user.info`，其中用户信息可以由「允许的用户或群组列表」从外部设置，或者准入控制可以自动将其附加到每个工作负载。

## 传统的用户处理

### 使用`yunikorn.apache.org/username`标签

由于kubernetes没有预定义的字段和资源能用于用户信息，且个别集群使用的用户识别工具可能有所不同，于是我们定义了标准的方法来识别用户。Yunikorn需要添加一个kubernetes[标签](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)。这里提供了[推荐的使用方法](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)，预设的标签定义如下：

|标签|值|
|----------------------------------------------- |--------------------- |
| yunikorn.apache.org/username |用户名。可以重复该条目，但只会使用第一个值。默认的用户是`nobody` |

举例：
```yaml
metadata:
  labels:
    yunikorn.apache.org/username:"john"
```
:::tip 
为了让该字段成为唯一识别用户的指标，建议集群管理员使用用户识别工具，将这个标签设为不可变的字段。集群管理员或用户可以自由的使用任何方法或工具来增加这个字段和值。其中包含在提交时手动添加。
:::

:::note 假设
假设：
Yunikorn假设一个应用程序的所有pod都属于同一个用户。我们建议将用户标签添加到应用程序的每个pod。这是为了确保没有任何意外。
:::

在[K8s的部署](https://github.com/apache/yunikorn-release/blob/master/helm-charts/yunikorn/templates/deployment.yaml)时，可以通过覆盖`USER_LABEL_KEY`来改变标签`yunikorn.apache.org/username`的默认值，这在已经添加用户标签，或出于某些安全因素下必须修改标签的情况下特别有用。

```yaml
  env:
  - name: USER_LABEL_KEY
    value:"custom_user_label"
```

### 群组解析

群组成员的解析定义在这里，此外该功能是可以选择加入或移除的。群组不必是用户或群组对象所提供的一部分。当对象被加到缓存中时，群组将自动根据配置来解析。可以为每个分区(partition)设置连接到缓存的解析器。

预设的群组解析器是"no resolver"。此解析器仅回传用户明和与用户同名的主要群组。

其他解析器：
* 操作系统解析器
* 测试解析器

## 推荐的处理用户的新方式

从Yunikorn 1.2开始，可以使用更复杂的用户/群组解析方式。

在这种模式下，Yunikorn不再依赖标签`yunikorn.apache.org/username`，而是将`yunikorn.apache.org/user.info`附加到工作负载。通过简单的JSON值，定义用户名和群组：

```yaml
metadata:
  annotations:
    yunikorn.apache.org/user.info:"
    {
      username: \"yunikorn\"，
      groups: [
        \"developers\"，
        \"devops\"
      ]
    }"
```

然而，为了加强安全性，在准入控制器中强制执行了以下操作：
* 不是集群中的每个用户都可以附加此注解，只有在配置允许时才可以使用。
* 如果缺少注解，则准入控制器将自动添加
* 若尝试修改此注解将会被拒绝

我们不只在pods上这样做，而是在Deployments，ReplicaSet，DeamonSet，StatefulSet，Jobs和CronJobs上这样做。

此外，群组解析器不再需要放在k8s-shim中。

### 配置准入控制器

准入控制可以在`yunikorn-configs`的configmap中被配置。所有条目都以前缀`admissionController.accessControl.`开头

|变量|默认值|描述|
|--|--|--|
|`bypassAuth`|false|允许任何外部用户使用用户信息集创建pod|
|`trustControllers`|true|允许Kubernetes控制器的用户创建带有用户信息集的pod|
|`systemUsers`|"^system:serviceaccount:kube-system:"|允许控制器符物帐号列表使用正则表达式|
|`externalUsers`|""|在「允许的外部用户列表」上使用正则表达式|
|`externalGroups`|""|在「允许的外部群组列表」上使用正则表达式|

如果`bypassAuth`设置为`true`，但注解不存在且设定了已遗弃的用户标签，则准入控制器将不会把注解加到pod中。如果未设置注解也未设置用户标签，则新的注解将会被加入。
在`bypassAuth`为`false`(默认值)的情况下，准入控制器将始终添加新的注解，而不管是否存在已弃用的标签。

在某些情况下，必须将用户和群组在提交时提供给Yunikorn，因为用户和群组管理由外部系统提供，查找机制并不简单。因此，在这些情况下，可以将`externalUsers`和`externalGroups`配置为正则表达式。其中，匹配的用户或群组就可以将`yunikorn.apache.org/user.info`设置为任意值。但这会影响Yunikorn内部的调度，因此必须仔细设置这些属性。