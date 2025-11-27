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
          '1.7.0 has been released, check the <a href="/community/download">DOWNLOADS</a>.',
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
    plugins: [
      [
        "@cmfcmf/docusaurus-search-local",
        {
          // whether to index docs pages
          indexDocs: true,

          // Whether to also index the titles of the parent categories in the sidebar of a doc page.
          // 0 disables this feature.
          // 1 indexes the direct parent category in the sidebar of a doc page
          // 2 indexes up to two nested parent categories of a doc page
          // 3...
          //
          // Do _not_ use Infinity, the value must be a JSON-serializable integer.
          indexDocSidebarParentCategories: 0,

          // Includes parent categories path in search result
          includeParentCategoriesInPageTitle: false,

          // whether to index blog pages
          indexBlog: true,

          // whether to index static pages
          // /404.html is never indexed
          indexPages: false,

          // language of your documentation, see next section
          language: "en",

          // setting this to "none" will prevent the default CSS to be included. The default CSS
          // comes from autocomplete-theme-classic, which you can read more about here:
          // https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-theme-classic/
          // When you want to overwrite CSS variables defined by the default theme, make sure to suffix your
          // overwrites with `!important`, because they might otherwise not be applied as expected. See the
          // following comment for more information: https://github.com/cmfcmf/docusaurus-search-local/issues/107#issuecomment-1119831938.
          style: undefined,

          // The maximum number of search results shown to the user. This does _not_ affect performance of
          // searches, but simply does not display additional search results that have been found.
          maxSearchResults: 8,
        },
      ],
    ],
  }
};
