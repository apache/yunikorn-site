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
      在云上运行时，它与弹性伸缩控制器共同协作，以带来最大的资源弹性和更好的吞吐量。
      </>
    ),
  },
];

const why = [
    {
        title: <>分层资源队列</>,
        imageUrl: './img/why-hierarchical-queue.svg',
        description: (
            <>
                对不同租户的资源配额进行细粒度控制，轻松映射到您的组织结构。
                为队列的最小/最大资源提供了超额分配的功能，同时确保了有保障的资源。
            </>
        ),
    },
    {
        title: <>应用感知调度</>,
        imageUrl: './img/why-app.svg',
        description: (
            <>
                识别用户、应用程序、队列。 
                应用程序按特定顺序进行排队和调度。 
                根据资源公平性、提交时间和优先级应用排序。 
                您可以获得更可预测的调度结果。
            </>
        ),
    },
    {
        title: <>效率和成本节约</>,
        imageUrl: './img/why-save-cost.svg',
        description: (
            <>
                针对云进行了优化，并尽可能地适应弹性伸缩。
                Gang Scheduling 减少了资源碎片，并主动触发扩容。 
                Bin-packing 在云上运行时可以改变使用曲线，并降低成本。
            </>
        ),
    },
    {
        title: <>中央管理控制台</>,
        imageUrl: './img/why-console.svg',
        description: (
            <>
                不再丢失跟踪租户的资源使用情况！ 
                YuniKorn 提供中央管理 UI 和一站式看板来跟踪集群、队列和应用程序的资源利用率。 
                让我们开始为您的团队规划和监控资源！
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
                                <a className="button button--primary button--lg" href="/docs/">开始文档</a>
                                <a className="button button--primary button--lg" href="/community/download">下载</a>
                                <a className="button button--primary button--lg" href="/community/roadmap">路线图</a>
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
                                <div key={idx} className={clsx('col col--4')}>
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

            <h1 className={styles.whyText}>☺ 为什么选YUNIKORN?</h1>
            {why.map(({imageUrl, title, description}, idx) => (
            <div className={styles.postContainer}>
                <div className={styles.postThumb}><img src={imageUrl}/></div>
                <div className={styles.postContent}>
                    <h4>{title}</h4>
                    <p>{description}</p>
                </div>
            </div>
            ))}

            <h3 className={styles.learnMoreURL}><a href="./docs/get_started/core_features">了解更多 >>></a></h3>
        </main>
    </Layout>
  );
}

export default Home;
