---
id: translation
title: 翻译
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

Yunikorn网站采用Docusaurus管理文档。
[Docusaurus国际化系统(i18n)](https://docusaurus.io/docs/i18n/tutorial)允许开发人员翻译文档。
为网站添加新的语言翻译时，开发者应进行如下操作。

## 修改docusaurus.config.js以支持新语言
假设通过**新语言关键字**进行翻译。
预期的结果会像这个图。
![翻译结果](./../assets/translationDemo.png)

当前的Yunikorn网站包括**en**和**zh-cn**文档。
如果开发者想添加一个新的带有**新语言关键字**的翻译，如fr, jp。
则开发者需要修改`docusaurus.config.js`中的`i18n`栏位。
```
i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-cn', '<新语言关键字>'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      "zh-cn": {
        label: '中文',
      },
      "<新语言关键字>": {
        label: 'test',
      }
    },
  },
```
## 更新local-build.sh中的帮助信息
将**新语言关键字**添加到`print_usage`函数的语言环境列表中。
```
Usage: $(basename "$0") run [locale] | build | clean | help
    run     build the website, and launch the server in a docker image.
            a locale can be specified, currently supported: "en", "zh-cn", "<新语言关键字>"
```

## 将最新文件复制到i18n资料夹
```
mkdir -p i18n/<新语言关键字>/docusaurus-plugin-content-docs/current
cp -r docs/** i18n/<新语言关键字>/docusaurus-plugin-content-docs/current
mkdir -p i18n/<新语言关键字>/docusaurus-plugin-content-pages
cp -r src/pages/** i18n/<新语言关键字>/docusaurus-plugin-content-pages
mkdir -p i18n/<新语言关键字>/docusaurus-theme-classic
```

## 在sidebar.json和footer.json中添加翻译后的信息
在docusaurus-theme-classic资料夹中创建sidebar.json和footer.json档案。
例如，添加的footer.json内容如下。
```
{
    "link.item.label.Get Involved": {
        "message": "参与"
    },
    "link.title.Code Repositories": {
        "message": "代码库"
    },
    "link.item.label.People": {
        "message": "人们"
    },   
    "link.title.Blog": {
        "message": "博客"
    },
    "link.title.Community": {
        "message": "社区"
    }
}
```



## 链接img、assest与styles.module.css
在`i18n/new language keyword/docusaurus-plugin-content-pages`中创建链接文件。

```
# 清理重复文件
rm -rf img
rm styles.module.css
# 链接
ln -s ../../../static/img
ln -s ../../../src/pages/styles.module.css
```

在`i18n/new language keyword/docusaurus-plugin-content-docs/current`中创建链接文件。
```
# cleaning the duplicate files
rm -rf assests
# linking
ln -s ../../../../docs/assets
```

## 采用相对路径
`src/pages/index.js`中有部分图片url采用绝对路径，采用绝对路径会导致png丢失。
开发人员需要确保`/i18n/new language keyword/docusaurus-plugin-content-pages/index.js`中的图链接有效。
例如，在`index.js`中有一个`resource-scheduling.png`图像，图像链接是`/img/resource-scheduling.png`。
```
/img/resource-scheduling.png -> ./img/resource-scheduling.png
```
## 测试
```
./local-build.sh run <新语言关键字>
```
![建设网站](./../assets/translationBuilding.png)
