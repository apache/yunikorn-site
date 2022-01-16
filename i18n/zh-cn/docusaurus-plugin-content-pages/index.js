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
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import useThemeContext from '@theme/hooks/useThemeContext';

const ImageSwitcher = ({lightImageSrc, darkImageSrc}) => {
    const { isDarkTheme } = useThemeContext();
    return (
        <img src={isDarkTheme ? darkImageSrc : lightImageSrc} alt="why" className={styles.timelineImage} />
    )
}

const features = [
  {
    title: <>调度能力</>,
    imageUrl: './img/resource-scheduling.png',
    description: (
      <>
      内置全面的调度功能，包括层次队列、
      跨队列的资源公平性、作业排序 (FIFO/FAIR)、
      可插拔节点排序策略、抢占等。
      </>
    ),
  },
  {
    title: <>K8s 资源调度器</>,
    imageUrl: './img/support-k8s.png',
    description: (
      <>
      完全兼容 K8s，是默认 K8s 调度的替代方案，但功能更强大。
      对现有的 K8s 应用程序完全透明。
      </>
    ),
  },
  {
    title: <>云原生</>,
    imageUrl: './img/cloud-native.png',
    description: (
      <>
      支持本地和云端用例。 
      在云上运行时，它与自动缩放一起使用，以带来最大的资源弹性和更好的吞吐量。
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
      description="Apache YuniKorn (孵化项目) 网页">
        <header className={clsx('hero', styles.heroBanner)}>
            <div className="container">
                <div className="row">
                    <div className='hero_column_main'>
                        <h1 className="hero__title">{siteConfig.title}</h1>
                        <p className="hero__subtitle">释放在 Kubernetes 上运行大数据和机器学习资源调度的力量！</p>
                        <div className="container">
                            <div className="buttons_src-pages-">
                                <a className="button button--primary button--lg" href="/docs/">GET STARTED</a>
                                <a className="button button--primary button--lg" href="/community/download">DOWNLOAD</a>
                                <a className="button button--primary button--lg" href="/community/roadmap">ROADMAP</a>
                            </div>
                        </div>
                    </div>
                    <div className='hero_column_logo'>
                        <img className={styles.heroImg} src="./img/logo/yunikorn_classic_logo.png"/>
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
                                <div key={idx} className={clsx('col col--4', styles.feature)}>
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
                    <h1 className="text--center">☺ 为什么是YUNIKORN?</h1>
                    {/*<img src="img/why-dark.png" className={styles.timelineImage}/>*/}
                    <ImageSwitcher darkImageSrc={"./img/why-dark.png"} lightImageSrc={"./img/why.png"} />
                </div>
            </section>
        </main>
    </Layout>
  );
}

export default Home;
