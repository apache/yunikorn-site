"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[90822],{76428:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>r,default:()=>h,frontMatter:()=>s,metadata:()=>l,toc:()=>c});var t=i(13274),a=i(37155);const s={id:"loki",title:"Loki"},r=void 0,l={id:"user_guide/observability/loki",title:"Loki",description:"\x3c!--",source:"@site/docs/user_guide/observability/loki.md",sourceDirName:"user_guide/observability",slug:"/user_guide/observability/loki",permalink:"/docs/next/user_guide/observability/loki",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{id:"loki",title:"Loki"},sidebar:"docs",previous:{title:"Prometheus and Grafana",permalink:"/docs/next/user_guide/observability/prometheus"},next:{title:"Scheduler",permalink:"/docs/next/metrics/scheduler"}},o={},c=[{value:"Modify YuniKorn settings",id:"modify-yunikorn-settings",level:2},{value:"Install Grafana",id:"install-grafana",level:2},{value:"Install Loki",id:"install-loki",level:2},{value:"Install promtail",id:"install-promtail",level:2},{value:"Grafana settings to connect to Loki",id:"grafana-settings-to-connect-to-loki",level:2},{value:"1. Access the Grafana Web UI",id:"1-access-the-grafana-web-ui",level:3},{value:"2. Set URL and HTTP headers",id:"2-set-url-and-http-headers",level:3},{value:"set URL field <code>http://loki-gateway</code>",id:"set-url-field-httploki-gateway",level:4},{value:"In order to fetch logs from promtail which tenantID is user, set HTTP headers field X-Scope-OrgId with user.",id:"in-order-to-fetch-logs-from-promtail-which-tenantid-is-user-set-http-headers-field-x-scope-orgid-with-user",level:4},{value:"Loki log result",id:"loki-log-result",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:"In this example, Loki, along with Promtail, is used to collect YuniKorn logs from the cluster. These logs are then visualized through a Grafana dashboard."}),"\n",(0,t.jsx)(n.h2,{id:"modify-yunikorn-settings",children:"Modify YuniKorn settings"}),"\n",(0,t.jsxs)(n.p,{children:["Follow ",(0,t.jsx)(n.a,{href:"https://yunikorn.apache.org/docs/",children:"YuniKorn install guide"}),' and modify YuniKorn configmap "yunikorn-defaults" to allow ray operator based on k8s service account.']}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:'kubectl patch configmap yunikorn-defaults -n yunikorn --patch \'{"data":{"admissionController.accessControl.systemUsers": "^system:serviceaccount:kube-system:,^system:serviceaccount:meta:"}}\' \n'})}),"\n",(0,t.jsx)(n.h2,{id:"install-grafana",children:"Install Grafana"}),"\n",(0,t.jsx)(n.p,{children:"Install the Grafana Helm chart:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"helm repo add grafana https://grafana.github.io/helm-charts\nhelm repo update\nhelm upgrade --install grafana grafana/grafana -n meta --create-namespace\n"})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"grafana",src:i(34353).A+"",width:"1188",height:"395"})}),"\n",(0,t.jsx)(n.h2,{id:"install-loki",children:"Install Loki"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:["Create the ",(0,t.jsx)(n.code,{children:"binary.yaml"})," file"]}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"#binary.yaml\nloki:\n  commonConfig:\n    replication_factor: 1\n  schemaConfig:\n    configs:\n      - from: 2024-04-01\n        store: tsdb\n        object_store: s3\n        schema: v13\n        index:\n          prefix: loki_index_\n          period: 24h\n  ingester:\n    chunk_encoding: snappy\n  tracing:\n    enabled: true\n  querier:\n    max_concurrent: 2\n\ndeploymentMode: SingleBinary\nsingleBinary:\n  replicas: 1\n  resources:\n    limits:\n      cpu: 1\n      memory: 2Gi\n    requests:\n      cpu: 1\n      memory: 2Gi\n  extraEnv:\n    # Keep a little bit lower than memory limits\n    - name: GOMEMLIMIT\n      value: 3750MiB\n\nchunksCache:\n  enabled: false\n  # default is 500MB, with limited memory keep this smaller\n  writebackSizeLimit: 10MB\n\nresultsCache:\n  enabled: false\n\n# Enable minio for storage\nminio:\n  enabled: true\n\n# Zero out replica counts of other deployment modes\nbackend:\n  replicas: 0\nread:\n  replicas: 0\nwrite:\n  replicas: 0\n\ningester:\n  replicas: 0\nquerier:\n  replicas: 0\nqueryFrontend:\n  replicas: 0\nqueryScheduler:\n  replicas: 0\ndistributor:\n  replicas: 0\ncompactor:\n  replicas: 0\nindexGateway:\n  replicas: 0\nbloomCompactor:\n  replicas: 0\nbloomGateway:\n  replicas: 0\n"})}),"\n",(0,t.jsxs)(n.ol,{start:"2",children:["\n",(0,t.jsx)(n.li,{children:"Install the Loki Helm chart:"}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"helm upgrade --install loki grafana/loki -n meta -f binary.yaml\n"})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"loki",src:i(20094).A+"",width:"1180",height:"345"})}),"\n",(0,t.jsx)(n.admonition,{title:"Troubleshoot",type:"info",children:(0,t.jsx)(n.p,{children:"If your Loki and Loki-minio pods remain pending, you need to delete them and wait for them to restart."})}),"\n",(0,t.jsx)(n.h2,{id:"install-promtail",children:"Install promtail"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:["Create the ",(0,t.jsx)(n.code,{children:"promtail.yaml"})," file"]}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"#promtail.yaml\nconfig:\n  clients:\n    - url: http://loki-gateway/loki/api/v1/push\n      tenant_id: user\n      external_labels:\n        cluster: kind-cluster\n"})}),"\n",(0,t.jsxs)(n.ol,{start:"2",children:["\n",(0,t.jsx)(n.li,{children:"Install the promtail Helm chart:"}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"helm upgrade --install promtail grafana/promtail -f promtail.yaml\n"})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"promtail",src:i(12641).A+"",width:"1179",height:"362"})}),"\n",(0,t.jsx)(n.h2,{id:"grafana-settings-to-connect-to-loki",children:"Grafana settings to connect to Loki"}),"\n",(0,t.jsx)(n.h3,{id:"1-access-the-grafana-web-ui",children:"1. Access the Grafana Web UI"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"kubectl port-forward -n meta service/grafana 3000:3000\n"})}),"\n",(0,t.jsxs)(n.p,{children:["After running port forwarding, you can access Grafana's web interface by ",(0,t.jsx)(n.a,{href:"http://localhost:3000",children:"localhost:3000"})," in your browser."]}),"\n",(0,t.jsx)(n.h3,{id:"2-set-url-and-http-headers",children:"2. Set URL and HTTP headers"}),"\n",(0,t.jsx)(n.p,{children:"In grafana, adding a loki data source with url and http headers allows grafana to fetch logs."}),"\n",(0,t.jsxs)(n.h4,{id:"set-url-field-httploki-gateway",children:["set URL field ",(0,t.jsx)(n.code,{children:"http://loki-gateway"})]}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"setting_1",src:i(65500).A+"",width:"1207",height:"585"})}),"\n",(0,t.jsx)(n.h4,{id:"in-order-to-fetch-logs-from-promtail-which-tenantid-is-user-set-http-headers-field-x-scope-orgid-with-user",children:"In order to fetch logs from promtail which tenantID is user, set HTTP headers field X-Scope-OrgId with user."}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"setting_2",src:i(23607).A+"",width:"1205",height:"455"})}),"\n",(0,t.jsx)(n.h2,{id:"loki-log-result",children:"Loki log result"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:["Set tracking target\n",(0,t.jsx)(n.img,{alt:"track_target",src:i(73872).A+"",width:"1209",height:"561"})]}),"\n",(0,t.jsxs)(n.li,{children:["bar chart\n",(0,t.jsx)(n.img,{alt:"bar\uff3fchart",src:i(58157).A+"",width:"1204",height:"605"})]}),"\n",(0,t.jsxs)(n.li,{children:["INFO log\n",(0,t.jsx)(n.img,{alt:"logs trace",src:i(21801).A+"",width:"1198",height:"671"})]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},34353:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/grafana-212b79c801ca3fcc7b760d21dc028415.png"},65500:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/grafana_loki_setting_1-f6097c5580d639001baff8161c14b3bd.png"},23607:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/grafana_loki_setting_2-0dfc7a638b559b62118cf7f255c891c0.png"},20094:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/loki-1024ece9c19a75da5d3eb78f61b27469.png"},58157:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/loki_log_1-086bd0e5199b26bb3c2dea26ecdf00ff.png"},21801:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/loki_log_2-af66fce4c6230a4319928a8630b321b4.png"},73872:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/loki_track_tg-c5be0bd5c8a33fe922bc50b059a45c39.png"},12641:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/promtail-5a2f2cd745df9b496bbd7cc316ee40b9.png"},37155:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>l});var t=i(79474);const a={},s=t.createContext(a);function r(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:r(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);