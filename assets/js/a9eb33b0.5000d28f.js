"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[19200],{85094:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>t,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>d});var i=s(13274),o=s(37155);const r={id:"resilience",title:"Resilience"},t=void 0,c={id:"design/resilience",title:"Resilience",description:"\x3c!--",source:"@site/versioned_docs/version-1.5.2/design/resilience.md",sourceDirName:"design",slug:"/design/resilience",permalink:"/docs/1.5.2/design/resilience",draft:!1,unlisted:!1,tags:[],version:"1.5.2",frontMatter:{id:"resilience",title:"Resilience"},sidebar:"docs",previous:{title:"Priority Scheduling",permalink:"/docs/1.5.2/design/priority_scheduling"},next:{title:"Configuration V2",permalink:"/docs/1.5.2/design/config_v2"}},a={},d=[{value:"The problem",id:"the-problem",level:2},{value:"Design",id:"design",level:2},{value:"Workflow",id:"workflow",level:3},{value:"How to determine recovery is complete?",id:"how-to-determine-recovery-is-complete",level:3},{value:"Node recovery",id:"node-recovery",level:3},{value:"Requests for recovery",id:"requests-for-recovery",level:3},{value:"Applications",id:"applications",level:4},{value:"Nodes and allocations",id:"nodes-and-allocations",level:4}];function l(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"This is not a HA (High-availability) design, HA implies that a service can\nsurvive from a fatal software/hardware failure. That requires one or more\nstandby instances providing same services to take over active instance on failures.\nResilience here means for YuniKorn, we can restart it without losing its state."}),"\n",(0,i.jsx)(n.h2,{id:"the-problem",children:"The problem"}),"\n",(0,i.jsx)(n.p,{children:"YuniKorn is designed as a stateless service, it doesn't persist its state, e.g\napplications/queues/allocations etc, to any persistent storage. All states are\nin memory only. This design ensures YuniKorn to be able to response requests with\nlow latency, and deployment mode is simple. However, a restart (or recovery) will\nhave the problem to lose state data. We need a decent way to reconstruct all\nprevious states on a restart."}),"\n",(0,i.jsx)(n.h2,{id:"design",children:"Design"}),"\n",(0,i.jsx)(n.h3,{id:"workflow",children:"Workflow"}),"\n",(0,i.jsxs)(n.p,{children:['Scheduler core has no notion of "state", which means it does not know if it is under recovering.\nIt is too complex to maintain a series of ',(0,i.jsx)(n.code,{children:"scheduler states"})," in both core and shim, because we must\nkeep them in-sync. However, if we live under a simple assumption: ",(0,i.jsx)(n.strong,{children:"scheduler core only responses\nrequests, the correction of requests is ensured by shim according its current state"}),".\nThe design becomes much simpler. This way, the shim maintains a state machine like below. When\nit is under ",(0,i.jsx)(n.code,{children:"running"})," state, it sends new requests to the scheduler core as long as a new one is found;\nwhen under ",(0,i.jsx)(n.code,{children:"recovering"})," state, it collects previous allocations and send recovery messages to\nthe scheduler core, and waiting for recovery to be accomplished."]}),"\n",(0,i.jsx)(n.p,{children:"Shim scheduler state machine"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:"      Register                 Recover                Success\nNew -----------\x3e Registered -----------\x3e Recovering ----------\x3e Running\n                                             |   Fail\n                                              --------\x3e Failed\n"})}),"\n",(0,i.jsx)(n.p,{children:"Following chart illustrate how yunikorn-core and shim works together on recovery."}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.img,{alt:"Workflow",src:s(41392).A+"",width:"7198",height:"2222"})}),"\n",(0,i.jsx)(n.p,{children:"Restart (with recovery) process"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"yunikorn-shim registers itself with yunikorn-core"}),"\n",(0,i.jsxs)(n.li,{children:['shim enters "recovering" state. Under "recovering" state, the shim only scans existing nodes and allocations, no new scheduling requests will be sent.',"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"shim scans existing nodes from api-server and added them to cache"}),"\n",(0,i.jsx)(n.li,{children:"shim scans existing pods from api-server, filter out the pods that already assigned (scheduled to a node), and added that to cache (allocation in that node)"}),"\n",(0,i.jsx)(n.li,{children:"shim sends update request to yunikorn-core with the info found in previous steps"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["yunikorn-core handles update requests, the steps should look like a replay of allocation process, including","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"adding node"}),"\n",(0,i.jsx)(n.li,{children:"adding applications"}),"\n",(0,i.jsx)(n.li,{children:"adding allocations"}),"\n",(0,i.jsx)(n.li,{children:"modifying queue resources"}),"\n",(0,i.jsx)(n.li,{children:"update partition info"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.li,{children:'when all nodes are fully recovered, shim transits the state to "running"'}),"\n",(0,i.jsx)(n.li,{children:'shim notifies yunikorn-core that recovery is done, then yunikorn-core transits to "running" state.'}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"how-to-determine-recovery-is-complete",children:"How to determine recovery is complete?"}),"\n",(0,i.jsxs)(n.p,{children:["Shim queries K8s api-server to get how many nodes were available in this cluster. It tracks the recovering status of each node.\nOnce all nodes are recovered, it can claim the recovery is completed. This approach requires us to add ",(0,i.jsx)(n.code,{children:"recovering"})," and ",(0,i.jsx)(n.code,{children:"recovered"}),"\nstates to nodes' state machine in the shim."]}),"\n",(0,i.jsx)(n.h3,{id:"node-recovery",children:"Node recovery"}),"\n",(0,i.jsxs)(n.p,{children:["In the shim layer, it maintains states for each node and pods running on this node. When start to recover nodes,\nall nodes initially are considered as under ",(0,i.jsx)(n.code,{children:"recovering"}),". Only when all pods running on this node are fully recovered,\nthe node can be considered as ",(0,i.jsx)(n.code,{children:"recovered"}),"."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.img,{alt:"node-recovery",src:s(96011).A+"",width:"6426",height:"2489"})}),"\n",(0,i.jsx)(n.p,{children:"Like demonstrated on upon diagram,"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Node0 is still recovering because pod0 is recovering."}),"\n",(0,i.jsx)(n.li,{children:"Node1 is recovered (become schedulable) because all pods on this node have been recovered."}),"\n",(0,i.jsx)(n.li,{children:"Node2 is lost, shim lost contact with this node. If after sometime this node comes back, shim should still try to recover this node."}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"requests-for-recovery",children:"Requests for recovery"}),"\n",(0,i.jsx)(n.p,{children:"During recovery process, shim needs to collect all known information of applications, nodes and allocations from the underneath\nResource Manager and use them for recovery."}),"\n",(0,i.jsx)(n.h4,{id:"applications",children:"Applications"}),"\n",(0,i.jsxs)(n.p,{children:["Existing applications must be recovered first before allocations. Shim needs to scan all existing applications\nfrom nodes, and add applications info as a list of ",(0,i.jsx)(n.code,{children:"AddApplicationRequest"})," in the ",(0,i.jsx)(n.code,{children:"UpdateRequest"}),". This is same\nas the fresh application submission."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:"message AddApplicationRequest {\n  string applicationID = 1;\n  string queueName = 2;\n  string partitionName = 3;\n}\n"})}),"\n",(0,i.jsx)(n.h4,{id:"nodes-and-allocations",children:"Nodes and allocations"}),"\n",(0,i.jsxs)(n.p,{children:["Once a shim is registered to the scheduler-core, subsequent requests are sent via ",(0,i.jsx)(n.code,{children:"UpdateRequest#NewNodeInfo"}),"\n(see more from ",(0,i.jsx)(n.a,{href:"https://github.com/apache/yunikorn-scheduler-interface/blob/master/si.proto",children:"si.proto"}),").\nThe structure of the messages looks like,"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{children:"message NewNodeInfo {\n  // nodeID\n  string nodeID = 1;\n  // optional node attributes\n  map<string, string> attributes = 2;\n  // total node resource\n  Resource schedulableResource = 3;\n  // existing allocations on this node\n  repeated Allocation existingAllocations = 4;\n}\n"})}),"\n",(0,i.jsxs)(n.p,{children:["Shim needs to scan all existing allocations on a node and wrap these info up as a ",(0,i.jsx)(n.code,{children:"NewNodeInfo"}),", add that to a\n",(0,i.jsx)(n.code,{children:"UpdateRequest"})," and then send to scheduler-core."]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Note"}),": the recovery of existing allocations depend on the existence of applications, which means applications must\nbe recovered first. Since scheduler-core handles ",(0,i.jsx)(n.code,{children:"UpdateRequest"})," one by one, it is required that all existing allocations\nin a ",(0,i.jsx)(n.code,{children:"UpdateRequest"})," must from known applications or new applications embedded within the same ",(0,i.jsx)(n.code,{children:"UpdateRequest"}),", which can be\nspecified in ",(0,i.jsx)(n.code,{children:"NewApplications"})," field. Scheduler-core ensures ",(0,i.jsx)(n.code,{children:"NewApplications"})," are always processed first."]})]})}function h(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}},96011:(e,n,s)=>{s.d(n,{A:()=>i});const i=s.p+"assets/images/resilience-node-recovery-6abe663c243bdfdbff691e14a70166e5.jpg"},41392:(e,n,s)=>{s.d(n,{A:()=>i});const i=s.p+"assets/images/resilience-workflow-191f147a7501740ec6632f216f2bb25f.jpg"},37155:(e,n,s)=>{s.d(n,{R:()=>t,x:()=>c});var i=s(79474);const o={},r=i.createContext(o);function t(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:t(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);