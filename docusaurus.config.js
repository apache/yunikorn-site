/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const versions = require('./versions.json');

module.exports = {
  title: 'Apache YuniKorn (Incubating)',
  tagline: 'Unleash the power of resource scheduling for running Big Data & ML on Kubernetes!',
  url: 'https://yunikorn.apache.org',
  baseUrl: '/',
  favicon: 'img/yunikorn.ico',
  organizationName: 'apache',
  projectName: 'incubator-yunikorn-core',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-cn'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      "zh-cn": {
        label: '中文',
      },
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
    colorMode: {
      disableSwitch: false,
    },
    image: 'img/logo/yunikorn-logo-main.png',
    announcementBar: {
      id: 'new_release',
      content:
          '0.12.1 has been released, check the DOWNLOADS',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
    },
    navbar: {
      hideOnScroll: false,
      title: 'Apache YuniKorn',
      logo: {
        alt: 'YuniKorn Site Logo',
        src: 'img/logo/yunikorn_blue_logo.png',
        srcDark: 'img/logo/yunikorn_white_logo.png',
      },
      items: [
        {
          to: 'docs/',
          label: 'Quick Start',
        },
        {
          to: 'community/roadmap',
          label: 'Roadmap',
        },
        {
          to: 'community/download',
          label: 'Download',
        },
        {
          label: 'Community',
          items: [
            {
              to: 'community/get_involved',
              label: 'Get Involved',
            },
            {
              to: 'community/how_to_contribute',
              label: 'How to Contribute',
            },
            {
              to: 'community/coding_guidelines',
              label: 'Coding Guidelines',
            },
            {
              to: 'community/reporting_issues',
              label: 'Reporting Issues',
            },
            {
              to: 'community/events',
              label: 'Events',
            },
            {
              to: 'community/people',
              label: 'People',
            },
            {
              to: 'community/maturity',
              label: 'Incubation Maturity Assessment',
            },
          ]
        },
        {
          label: 'Apache',
          items: [
            {
              label: 'Apache Software Foundation',
              href: 'https://www.apache.org/'
            },
            {
              label: 'Apache Incubator',
              href: 'https://incubator.apache.org/'
            },
            {
              label: 'Events',
              href: 'https://www.apache.org/events/current-event'
            },
            {
              label: 'License',
              href: 'https://www.apache.org/licenses/'
            },
            {
              label: 'Sponsors',
              href: 'https://www.apache.org/foundation/thanks.html'
            },
            {
              label: 'Sponsorship',
              href: 'https://www.apache.org/foundation/sponsorship.html'
            },
            {
              label: 'Security',
              href: 'https://www.apache.org/security/'
            }
          ]
        },
        {
          label: 'Docs',
          to: 'docs',
          position: 'right',
          activeBaseRegex: `docs/(?!next/(support|team|resources))`,
          items: [
            {
              label: 'Master',
              to: 'docs/next/',
              activeBaseRegex: `docs/next/(?!support|team|resources)`,
            },
            {
              label: versions[0],
              to: 'docs/',
              activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
            },
            ...versions.slice(1).map((version) => ({
              label: version,
              to: `docs/${version}/`,
            })),
          ],
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/apache/incubator-yunikorn-core',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Blog',
          items: [
            {
              label: 'What\'s YuniKorn?',
              href: 'https://blog.cloudera.com/yunikorn-a-universal-resources-scheduler/'
            },
            {
              label: 'What\'s new in YuniKorn 0.8.0?',
              href: 'https://blog.cloudera.com/apache-yunikorn-incubating-0-8-release-whats-new-and-upcoming/'
            }
          ]
        },
        {
          title: 'Github',
          items: [
            {
              label: 'scheduler-core',
              href: 'https://github.com/apache/incubator-yunikorn-core/'
            },
            {
              label: 'kubernetes-shim',
              href: 'https://github.com/apache/incubator-yunikorn-k8shim'
            },
            {
              label: 'scheduler-interface',
              href: 'https://github.com/apache/incubator-yunikorn-scheduler-interface'
            },
            {
              label: 'scheduler-web',
              href: 'https://github.com/apache/incubator-yunikorn-web'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Get Involved',
              to: 'community/get_involved'
            },
            {
              label: 'Roster',
              href: 'https://people.apache.org/phonebook.html?podling=yunikorn'
            },
            {
              label: 'Issues',
              href: 'https://issues.apache.org/jira/projects/YUNIKORN/issues'
            }
          ]
        },
      ],
      logo: {
        alt: 'Apache Incubator Logo',
        src: 'https://incubator.apache.org/images/incubator_feather_egg_logo.png',
        href: 'https://incubator.apache.org/',
      },
      copyright: `
<div style="font-size: 70%">
Copyright © 2020-${new Date().getFullYear()} <a href="https://www.apache.org/">The Apache Software Foundation</a>. Licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0</a>. <br>
<div style="padding:20px; margin: 10px; color: #4d4d4d;">
<p>Apache YuniKorn is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Apache Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.</p>

<p>The Apache Software Foundation Apache YuniKorn, YuniKorn, Apache, the Apache feather, and the Apache YuniKorn project logo are either registered trademarks or trademarks of the Apache Software Foundation.  Apache YuniKorn is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the name of Apache TLP sponsor.</p>
</div>
</div>`
    },
    algolia: {
      apiKey: '65b6e69046d08b5364868a53ff974c2f',
      indexName: 'yunikorn',
      contextualSearch: true,
    },
  }
};
