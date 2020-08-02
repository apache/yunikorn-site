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

const features = [
  {
    title: <>Scheduling Capabilities</>,
    imageUrl: 'img/resource-scheduling.png',
    description: (
      <>
      Builtin with comprehensive scheduling capabilities, including hierarchy
      queues, resource fairness across queues, job ordering (FIFO/FAIR), pluggable
      node sorting policies, preemption, and more.
      </>
    ),
  },
  {
    title: <>Resource Scheduler for K8s</>,
    imageUrl: 'img/support-k8s.png',
    description: (
      <>
      Fully K8s compatible, an alternative of the default K8s
      scheduler, but more powerful. Transparent for the existing K8s applications.
      </>
    ),
  },
  {
    title: <>Cloud Native</>,
    imageUrl: 'img/cloud-native.png',
    description: (
      <>
      Supports both on-prem and on-cloud use cases. When running on cloud, it works
      with the autoscaler to bring maximum resource elasticity, with better throughput.
      </>
    ),
  },
];

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
        <header className={classnames('hero', styles.heroBanner)}>
            <div className="container">
                <div className="row">
                    <div className='hero_column_main'>
                        <h1 className="hero__title">{siteConfig.title}</h1>
                        <p className="hero__subtitle">{siteConfig.tagline}</p>
                        <div className="container">
                            <div className="buttons_src-pages-">
                                <a className="button button--primary button--lg" href="/docs/">GET STARTED</a>
                                <a className="button button--primary button--lg" href="/community/download">DOWNLOAD</a>
                                <a className="button button--primary button--lg" href="/community/roadmap">ROADMAP</a>
                            </div>
                        </div>
                    </div>
                    <div className='hero_column_logo'>
                        <img className={styles.heroImg} src="img/yunikorn_classic_logo.png"/>
                    </div>
                </div>
            </div>
        </header>
        <main>
            {features && features.length && (
                <section className={styles.features}>
                    <div className="container">
                        <div className="row">
                            {features.map(({imageUrl, title, description}, idx) => (
                                <div key={idx} className={classnames('col col--4', styles.feature)}>
                                    {imageUrl && (
                                        <div className="text--center">
                                            <img className={styles.featureImage} src={imageUrl} alt={title}/>
                                        </div>
                                    )}
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="features_src-pages-">
                <div className="container">
                    <h3 className="text--center">Project Timeline</h3>
                    <img src="/img/project-timeline.png" className={styles.timelineImage}/>
                </div>
            </section>
        </main>
    </Layout>
  );
}

export default Home;
