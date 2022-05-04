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
import Layout from '@theme/Layout';
import styles from '../styles.module.css';

let releaseNames = {};

function loadReleaseNames() {
    releaseNames = require.context("../release-announce/", false, /\.md$/).keys();
    releaseNames.sort((a, b) => -(a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })));
}

loadReleaseNames()

const LinkPage = () => {
    return (
        <Layout description="Apache YuniKorn website">
            <main>
                <div className={styles.postContainer}>
                <h1>Release Announcements</h1>
                    <div>
                        List of all release announcements for Apache YuniKorn.
                        Sorted by version, not by release date.
                    </div>
                    {releaseNames.map((release) => {
                        const name = release.replace("./","").replace(".md", "");
                        const link = `/release-announce/${name}`;
                        return (
                            <div>
                                <a href={link}>Release v{name}</a>
                            </div>
                        )
                    })}
                </div>
            </main>
        </Layout>
    );
};

export default LinkPage;
