"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[13368],{14621:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>d,default:()=>c,frontMatter:()=>o,metadata:()=>r,toc:()=>a});var i=t(13274),s=t(37155);const o={id:"deployment_modes",title:"Deployment Modes"},d=void 0,r={id:"user_guide/deployment_modes",title:"Deployment Modes",description:"\x3c!--",source:"@site/versioned_docs/version-1.5.2/user_guide/deployment_modes.md",sourceDirName:"user_guide",slug:"/user_guide/deployment_modes",permalink:"/docs/1.5.2/user_guide/deployment_modes",draft:!1,unlisted:!1,tags:[],version:"1.5.2",frontMatter:{id:"deployment_modes",title:"Deployment Modes"},sidebar:"docs",previous:{title:"Version details",permalink:"/docs/1.5.2/get_started/version"},next:{title:"Service Configuration",permalink:"/docs/1.5.2/user_guide/service_config"}},l={},a=[{value:"YuniKorn deployment modes",id:"yunikorn-deployment-modes",level:2},{value:"Standard mode",id:"standard-mode",level:3},{value:"Plugin mode",id:"plugin-mode",level:3}];function u(e){const n={em:"em",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"yunikorn-deployment-modes",children:"YuniKorn deployment modes"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.em,{children:(0,i.jsx)(n.strong,{children:"NOTE:"})})," ",(0,i.jsx)(n.strong,{children:"This section is maintained largely for historical context.\nThe plugin deployment mode is deprecated and no longer supported. The\nremoval timeline agreed upon by the YuniKorn community is as follows:"})]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"YuniKorn 1.6"}),": Deprecation announced"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"YuniKorn 1.7"}),": Scheduler will emit warnings if plugin mode is in use"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"YuniKorn 1.8"}),": YuniKorn will no longer ship plugin mode binaries"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"YuniKorn 1.9"}),": Implementation removed from codebase"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"YuniKorn can be deployed in two different modes: standard and plugin.\nIn standard mode, YuniKorn runs as a standalone Kubernetes scheduler.\nIn plugin mode (now deprecated), YuniKorn is implemented as a set of\nplugins on top of the default Kubernetes scheduling framework."}),"\n",(0,i.jsx)(n.p,{children:"Regardless of the YuniKorn deployment mode in use, it is recommended to\nrun the admission controller as well, as this will ensure that only a single\nscheduler is active within your Kubernetes cluster. In this mode, the default\nKubernetes scheduler (which is always running) will be bypassed for all pods\nexcept YuniKorn itself."}),"\n",(0,i.jsx)(n.h3,{id:"standard-mode",children:"Standard mode"}),"\n",(0,i.jsx)(n.p,{children:"Standard mode is currently the default. It is stable, efficient, and very\nperformant. It is well-suited for all YuniKorn deployments and is recommended."}),"\n",(0,i.jsx)(n.h3,{id:"plugin-mode",children:"Plugin mode"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Deprecated for removal"})}),"\n",(0,i.jsx)(n.p,{children:"Plugin mode was an experimental deployment model where the scheduler was\nimplemented on top of the default Kubernetes scheduler as a set of plugins.\nOriginally, this was expected to help provide better compatibility with the\ndefault Kubernetes scheduler, but that did not end up being the case.\nConsequently, the plugin mode is now deprecated and will be removed from a\nfuture YuniKorn release."}),"\n",(0,i.jsx)(n.p,{children:"It is not recommended to use plugin mode for any new deployments, and existing\nusers should migrate to standard mode as soon as practically possible. The\nstandard mode is much more mature, providing excellent compatibility with the\ndefault Kubernetes scheduler (as it now uses the same scheduler plugins\ninternally) while providing significantly better performance then either the\ndefault Kubernetes scheduler or the now deprecated YuniKorn plugin deployment\nmode."})]})}function c(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(u,{...e})}):u(e)}},37155:(e,n,t)=>{t.d(n,{R:()=>d,x:()=>r});var i=t(79474);const s={},o=i.createContext(s);function d(e){const n=i.useContext(o);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),i.createElement(o.Provider,{value:n},e.children)}}}]);