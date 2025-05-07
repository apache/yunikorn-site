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
  tagline: 'Unleash the power of resource scheduling for running Batch, Data & ML on Kubernetes!',
  url: 'https://yunikorn.apache.org',
  baseUrl: '/',
  favicon: 'img/yunikorn.ico',
  organizationName: 'apache',
  projectName: 'yunikorn-core',
  customFields: {
    trailingSlashes: true,
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
          '1.6.3 has been released, check the <a href="/community/download">DOWNLOADS</a>.',
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
          label: 'Docs',
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
              to: 'community/release_procedure',
              label: 'Release Procedure',
            },
            {
              to: 'community/events',
              label: 'Events',
            },
            {
              to: 'community/people',
              label: 'People',
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
              label: 'Privacy Policy',
              href: 'https://privacy.apache.org/policies/privacy-policy-public.html'
            },
            {
              label: 'Security',
              href: 'https://www.apache.org/security/'
            }
          ]
        },
        {
          label: 'Docs',
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/apache/yunikorn-core',
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
              label: 'Spark on Kubernetes – Gang Scheduling with YuniKorn',
              href: 'https://blog.cloudera.com/spark-on-kubernetes-gang-scheduling-with-yunikorn/'
            }
          ]
        },
        {
          title: 'Code Repositories',
          items: [
            {
              label: 'Core scheduler',
              href: 'https://github.com/apache/yunikorn-core/'
            },
            {
              label: 'Kubernetes shim',
              href: 'https://github.com/apache/yunikorn-k8shim'
            },
            {
              label: 'Scheduler Interface',
              href: 'https://github.com/apache/yunikorn-scheduler-interface'
            },
            {
              label: 'WEB application',
              href: 'https://github.com/apache/yunikorn-web'
            },
            {
              label: 'Website',
              href: 'https://github.com/apache/yunikorn-site'
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
              label: 'People',
              to: 'community/people'
            },
            {
              label: 'Issues',
              href: 'https://issues.apache.org/jira/projects/YUNIKORN/issues'
            }
          ]
        },
      ],
      copyright: `
<div style="font-size: 70%">
Copyright © 2020-${new Date().getFullYear()} <a href="https://www.apache.org/">The Apache Software Foundation</a>. Licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0</a>. <br>
<div style="padding:20px; margin: 10px; color: #4d4d4d;">
<p>The Apache Software Foundation Apache YuniKorn, YuniKorn, Apache, the Apache feather, and the Apache YuniKorn project logo are either registered trademarks or trademarks of the Apache Software Foundation.</p>
</div>
</div>`
    },
    algolia: {
      appId: 'Q1V951BG2V',
      apiKey: '9ae3e2f7a01a21300490729dfb9f2a51',
      indexName: 'yunikorn',
      contextualSearch: true,
    },
  }
};
