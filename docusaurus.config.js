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
  tagline: 'Apache YuniKorn (Incubating) is a light-weight, universal resource scheduler for container orchestrator systems.',
  url: 'http://yunikorn.apache.org',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'apache', // Usually your GitHub org/user name.
  projectName: 'incubator-yunikorn-core', // Usually your repo name.
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          homePageId: 'get_started/user_guide',
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          // editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
          // showLastUpdateAuthor: false,
          // showLastUpdateTime: false,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      hideOnScroll: false,
      title: 'Apache YuniKorn',
      logo: {
        alt: 'YuniKorn Site Logo',
        src: 'img/yunikorn_blue_256.png',
      },
      links: [
        {label: 'Quick Start', to: 'docs/next/get_started/user_guide', position: 'left'},
        {label: 'Download', to: 'docs/next/download', position: 'left'},
        {label: 'Community', to: 'apache', position: 'left',
          items: [
            {
              label: 'How To Contribute',
              to: 'docs/next/community/how_to_contribute'
            },
            {
              label: 'Coding Guidelines',
              to: 'docs/next/community/coding_guidelines'
            },
            {
              label: 'Reporting Issues',
              to: 'docs/next/community/reporting_issues'
            },
            {
              label: 'Community Sync Up',
              to: 'docs/next/community/community_sync_up'
            },

          ]
        },
        {label: 'Apache', to: 'apache', position: 'left',
          items: [
            {
              label: 'Apache Software Foundation',
              href: 'http://www.apache.org/foundation/how-it-works.html'
            },
            {
              label: 'Apache License',
              href: 'http://www.apache.org/foundation/how-it-works.html'
            },
            {
              label: 'Sponsorship',
              href: 'http://www.apache.org/foundation/how-it-works.html'
            },
            {
              label: 'Assets',
              href: 'http://www.apache.org/foundation/how-it-works.html'
            },
            {
              label: 'Thanks',
              href: 'http://www.apache.org/foundation/how-it-works.html'
            }
          ]
        },
        { label: 'Roadmap', to: 'docs/next/roadmap', position: 'left' },
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
      copyright: `
        
        <img src="https://incubator.apache.org/images/incubator_feather_egg_logo_sm.png" style="max-width: 300px"> <br/>
        
        Copyright © 2020 The Apache Software Foundation. <br/>
        Apache and the Apache feather logo are trademarks of The Apache Software Foundation<br/> <br/>
        
        <p style="text-align: left">Disclaimer: Apache YuniKorn (Incubating) is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Apache Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.</p>`

    },
  }
};
