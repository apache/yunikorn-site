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

import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <br />
          <div className="buttons_src-pages-">
              <a className="button button--outline button--secondary button--lg" href="/docs/">GET STARTED</a> &nbsp;
              <a className="button button--outline button--secondary button--lg" href="/community/download">DOWNLOAD</a> &nbsp;
              <a className="button button--outline button--secondary button--lg" href="/community/roadmap">ROADMAP</a>
          </div>
        </div>
      </header>
      <main>
          <section className="features_src-pages-">
              <div className="container">
                  <h1 className="hero__title">Architecture</h1>
                  {/*<p>Apache YuniKorn (Incubating) is a light-weighted, universal resource scheduler for container orchestrator systems.</p>*/}
                  {/*<ul>*/}
                  {/*    <li><span className="glyphicon glyphicon-transfer"></span> Unified</li>*/}
                  {/*    <li><span className="glyphicon glyphicon-eye-open"></span> Capacity Planning</li>*/}
                  {/*    <li><span className="glyphicon glyphicon-dashboard"></span> Resource Monitoring</li>*/}
                  {/*    <li><span className="glyphicon glyphicon-wrench"></span> Resource Scheduling</li>*/}
                  {/*    <li><span className="glyphicon glyphicon-cloud"></span> Application Management</li>*/}
                  {/*</ul>*/}
                  <div className="row">
                      <div className="col col--12">
                          <div className="text--center">
                              <br />
                              <img src="/img/architecture.png" />
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </main>

    </Layout>
  );
}

export default Home;
