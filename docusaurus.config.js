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
  title: 'Apache YuniKorn',
  tagline: 'A light-weight, universal resource scheduler for container orchestrator systems. Designed for running Big Data & ML on Kubernetes!',
  url: 'http://yunikorn.apache.org',
  baseUrl: '/',
  favicon: 'img/yunikorn.ico',
  organizationName: 'apache',
  projectName: 'incubator-yunikorn-core',
  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      {
        routeBasePath: 'community',
        path: './community',
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          homePageId: 'get_started/user_guide',
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
    disableDarkMode: false,
    announcementBar: {
      id: 'new_release',
      content:
          '0.9.0 release is up-coming!!',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
    },
    navbar: {
      hideOnScroll: false,
      title: 'Apache YuniKorn',
      logo: {
        alt: 'YuniKorn Site Logo',
        src: 'img/yunikorn.ico',
        srcDark: 'img/yunikorn_white_logo.png',
      },
      links: [
        {label: 'Quick Start', to: 'docs/', position: 'left'},
        {label: 'Roadmap', to: 'community/roadmap', position: 'left' },
        {label: 'Download', to: 'community/download', position: 'left'},
        {label: 'Community', to: 'apache', position: 'left',
          items: [
            {
              label: 'How To Contribute',
              to: 'community/how_to_contribute'
            },
            {
              label: 'Coding Guidelines',
              to: 'community/coding_guidelines'
            },
            {
              label: 'Reporting Issues',
              to: 'community/reporting_issues'
            },
            {
              label: 'Community Syncup',
              to: 'community/community_sync_up'
            },
          ]
        },
        {label: 'Apache', to: 'apache', position: 'left',
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
              label: 'Apache License',
              href: 'https://www.apache.org/licenses/LICENSE-2.0'
            },
            {
              label: 'Sponsorship',
              href: 'https://www.apache.org/foundation/sponsorship.html'
            }
          ]
        },
        {
          label: 'Docs',
          to: 'docs', // "fake" link
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
          href: 'https://github.com/apache/incubator-yunikorn-core',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'grey',
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
              label: 'Community meetings',
              href: 'http://yunikorn.apache.org/community/community_sync_up'
            },
            {
              label: 'Roster',
              href: 'http://people.apache.org/phonebook.html?podling=yunikorn'
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
        src: 'https://incubator.apache.org/images/apache-incubator-logo-source.svg',
        href: 'https://incubator.apache.org/',
      },
      copyright: `Copyright © ${new Date().getFullYear()} The Apache Software Foundation.`
    },
  }
};
