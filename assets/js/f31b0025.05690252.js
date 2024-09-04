"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[12032],{21548:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>u,frontMatter:()=>s,metadata:()=>a,toc:()=>d});var i=t(13274),o=t(1780);const s={id:"rn-0.12.2",title:"Release Announcement v0.12.2"},r="Release Announcement v0.12.2",a={type:"mdx",permalink:"/release-announce/0.12.2",source:"@site/src/pages/release-announce/0.12.2.md",title:"Release Announcement v0.12.2",description:"\x3c!--",frontMatter:{id:"rn-0.12.2",title:"Release Announcement v0.12.2"},unlisted:!1},l={},d=[{value:"Overview",id:"overview",level:2},{value:"Highlights",id:"highlights",level:2},{value:"Supported Kubernetes versions",id:"supported-kubernetes-versions",level:3},{value:"Separation of admission controller deployment from scheduler deployment",id:"separation-of-admission-controller-deployment-from-scheduler-deployment",level:3},{value:"Removal of beta API usage in admission controller",id:"removal-of-beta-api-usage-in-admission-controller",level:3},{value:"Deprecation of old REST API endpoints",id:"deprecation-of-old-rest-api-endpoints",level:3},{value:"Community",id:"community",level:2}];function c(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"release-announcement-v0122",children:"Release Announcement v0.12.2"}),"\n",(0,i.jsx)(n.p,{children:"We are pleased to announce that the Apache YuniKorn (Incubating) community has voted to release 0.12.2. Apache YuniKorn (Incubating) is a standalone resource scheduler, designed for managing, and scheduling Big Data workloads on container orchestration frameworks like Kubernetes for on-prem and on-cloud use cases."}),"\n",(0,i.jsx)(n.h2,{id:"overview",children:"Overview"}),"\n",(0,i.jsxs)(n.p,{children:["The Apache YuniKorn (Incubating) community has fixed 19 ",(0,i.jsx)(n.a,{href:"https://issues.apache.org/jira/issues/?filter=12351270",children:"JIRAs"})," in this release. Version 0.12.2 is primarily a maintenance release to allow better compatibility with current Kubernetes releases. There is also a fix for a critical issue affecting the usage of dynamic volumes that was found in 0.12.1, so all users of 0.12.1 are urged to upgrade."]}),"\n",(0,i.jsx)(n.p,{children:"Release manager: Craig Condit"}),"\n",(0,i.jsx)(n.p,{children:"Release date: 2022-02-03"}),"\n",(0,i.jsx)(n.h2,{id:"highlights",children:"Highlights"}),"\n",(0,i.jsx)(n.h3,{id:"supported-kubernetes-versions",children:"Supported Kubernetes versions"}),"\n",(0,i.jsx)(n.p,{children:"In this release, support for Kubernetes 1.22.x and 1.23.x was added (the last release supported 1.19.x, 1.20.x and 1.21.x). Apache YuniKorn (Incubating) attempts to support all current Kubernetes releases."}),"\n",(0,i.jsx)(n.h3,{id:"separation-of-admission-controller-deployment-from-scheduler-deployment",children:"Separation of admission controller deployment from scheduler deployment"}),"\n",(0,i.jsx)(n.p,{children:"As of 0.12.2, the Admission controller is now managed explicitly via Helm instead of being ad-hoc installed from within the scheduler. This will make scheduler restarts and future upgrades more reliable. However, this does mean that migration from versions < 0.12.2 to versions >= 0.12.2 will require an uninstall/reinstall cycle via Helm. We expect that Helm upgrades will function properly moving forward."}),"\n",(0,i.jsx)(n.h3,{id:"removal-of-beta-api-usage-in-admission-controller",children:"Removal of beta API usage in admission controller"}),"\n",(0,i.jsx)(n.p,{children:"In 0.12.2, the admission controller was updated to remove usage of a few beta Kubernetes APIs which were dropped from Kubernetes 1.22. This now allows us to deploy on all currently maintained Kubernetes releases."}),"\n",(0,i.jsx)(n.h3,{id:"deprecation-of-old-rest-api-endpoints",children:"Deprecation of old REST API endpoints"}),"\n",(0,i.jsx)(n.p,{children:"The REST API has been updated with endpoints that support specifying partitions. The old versions which do not take a partition argument have been deprecated and will be removed in an upcoming release:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"/ws/v1/queues"})," replaced with ",(0,i.jsx)(n.code,{children:"/ws/v1/partition/{partitionName}/queues"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"/ws/v1/apps"})," replaced with ",(0,i.jsx)(n.code,{children:"/ws/v1/partition/{partitionName}/apps"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"/ws/v1/nodes"})," replaced with ",(0,i.jsx)(n.code,{children:"/ws/v1/partition/{partitionName}/nodes"})]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"community",children:"Community"}),"\n",(0,i.jsx)(n.p,{children:"The Apache YuniKorn (Incubating) community is pleased to welcome new committers Peter Bacsko and Yu Teng Chen. We would love to see more committers joining the community and help to shape the project. We continue to have bi-weekly community meetings in 2 different time zones, ad-hoc meetings, and offline channel discussions. The community continues to be open to all interested parties."})]})}function u(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},1780:(e,n,t)=>{t.d(n,{R:()=>r,x:()=>a});var i=t(79474);const o={},s=i.createContext(o);function r(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);