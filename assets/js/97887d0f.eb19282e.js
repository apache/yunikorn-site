"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[79936],{24981:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>t,default:()=>a,frontMatter:()=>d,metadata:()=>r,toc:()=>l});var s=i(13274),o=i(37155);const d={id:"foreign_pod_tracking",title:"Tracking non-Yunikorn pods"},t=void 0,r={id:"design/foreign_pod_tracking",title:"Tracking non-Yunikorn pods",description:"\x3c!--",source:"@site/docs/design/foreign_pod_tracking.md",sourceDirName:"design",slug:"/design/foreign_pod_tracking",permalink:"/docs/next/design/foreign_pod_tracking",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{id:"foreign_pod_tracking",title:"Tracking non-Yunikorn pods"},sidebar:"docs",previous:{title:"Scheduler Configuration",permalink:"/docs/next/design/scheduler_configuration"},next:{title:"Kubernetes Shim Design",permalink:"/docs/next/archived_design/k8shim"}},c={},l=[{value:"Introduction",id:"introduction",level:2},{value:"Proposed changes",id:"proposed-changes",level:2},{value:"K8s shim",id:"k8s-shim",level:3},{value:"Scheduler interface",id:"scheduler-interface",level:3},{value:"Scheduler core",id:"scheduler-core",level:3},{value:"Web UI integration",id:"web-ui-integration",level:2},{value:"Testing",id:"testing",level:2},{value:"Core side",id:"core-side",level:3},{value:"K8Shim side",id:"k8shim-side",level:3},{value:"E2E tests",id:"e2e-tests",level:3},{value:"Summary",id:"summary",level:2}];function h(e){const n={code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h2,{id:"introduction",children:"Introduction"}),"\n",(0,s.jsxs)(n.p,{children:["Currently, we only know about pods in the scheduler core which have been scheduled by YuniKorn. Resource calculation which decides whether a pod fits a node or not depends on a field called ",(0,s.jsx)(n.code,{children:"occupiedResources"}),". This is first calculated in the shim then sent to the core."]}),"\n",(0,s.jsx)(n.p,{children:"This is not ideal for a couple of reasons:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:"Pod count is not maintained"}),"\n",(0,s.jsx)(n.li,{children:"The state dump and UI only contain YuniKorn pods"}),"\n",(0,s.jsx)(n.li,{children:"The occupied field is not relevant inside the shim, only in the core"}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"If we have issues regarding available resources, it\u2019s very difficult to figure out what happened. With adequate logging and proper pod tracking, troubleshooting is easier."}),"\n",(0,s.jsx)(n.h2,{id:"proposed-changes",children:"Proposed changes"}),"\n",(0,s.jsx)(n.h3,{id:"k8s-shim",children:"K8s shim"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"High level overview"})}),"\n",(0,s.jsxs)(n.p,{children:['In the shim, we stop tracking the total amount of resources occupied by non-Yunikorn pods\n(aka. "occupied resources"). Instead, whenever a new foreign pod is allocated or deleted, we\nforward this information to the scheduler core.\nThe allocations not scheduled by YuniKorn will be accounted for on the node but not as part\nof a queue or application. Allocations will be marked by the shim as scheduled by a different\nscheduler by adding a new entry to the ',(0,s.jsx)(n.code,{children:"AllocationTags"})," map inside the ",(0,s.jsx)(n.code,{children:"si.Allocation"})," type."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"State initialization"})}),"\n",(0,s.jsxs)(n.p,{children:["Registering existing pods got significantly simpler after YUNIKORN-2180 and YUNIKORN-2779.\n",(0,s.jsx)(n.code,{children:"NodeInfo.ExistingAllocations"})," no longer exists."]}),"\n",(0,s.jsxs)(n.p,{children:["No change is needed. Pods that are already assigned to a node are registered via the\n",(0,s.jsx)(n.code,{children:"Context.AddPod()"})," callback method. When YuniKorn is initializing the state, existing pods are\nseen as new ones. From the perspective of the shim, it doesn\u2019t matter if it got created after\nthe startup or it had already existed before."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Node updates"})}),"\n",(0,s.jsxs)(n.p,{children:["Current: we examine the old and new available resources based on the ",(0,s.jsx)(n.code,{children:"Node.NodeStatus.Allocatable"})," field.\nIf they are different, we update the scheduler cache with ",(0,s.jsx)(n.code,{children:"SchedulerCache.UpdateCapacity()"})," and send the\nnew value to the core."]}),"\n",(0,s.jsxs)(n.p,{children:["Proposed change: we continue to send NodeInfo events, but we will stop using the ",(0,s.jsx)(n.code,{children:"OccupiedResource"})," field."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Foreign pod node assignment"})}),"\n",(0,s.jsxs)(n.p,{children:["Current: the shim calculates the occupied resources for the given node. This happens in the\n",(0,s.jsx)(n.code,{children:"Context.updateNodeOccupiedResources()"})," method. First, the scheduler cache is updated with\n",(0,s.jsx)(n.code,{children:"SchedulerCache.UpdateOccupiedResource()"}),". Then we send the new available amount to the core\nwith ",(0,s.jsx)(n.code,{children:"SchedulerAPI.UpdateNode()"})," which also sends a ",(0,s.jsx)(n.code,{children:"NodeInfo"})," event."]}),"\n",(0,s.jsx)(n.p,{children:"Proposed change: instead of tracking just the resources occupied by all pods not scheduled\nvia YuniKorn on a node, send all pods to the core as allocations."}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Foreign pod deletion"})}),"\n",(0,s.jsx)(n.p,{children:"Current: same as the update case."}),"\n",(0,s.jsxs)(n.p,{children:["Proposed change: send an ",(0,s.jsx)(n.code,{children:"AllocationReleasesRequest"})," (embedded in a ",(0,s.jsx)(n.code,{children:"AllocationRequest"}),") to the core."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Preemption considerations"})}),"\n",(0,s.jsxs)(n.p,{children:['If we want to support preemption of foreign pods, we also have to know if it is a static pod. A\nstatic pod is managed directly by the kubelet and cannot be controlled from the API server.\nTherefore they cannot become preemption targets.\nThe owner reference of a static pod is "Node". When an allocation is added, this has to be\nindicated explicitly in the SI object. The ',(0,s.jsx)(n.code,{children:"si.Allocation"})," type has an ",(0,s.jsx)(n.code,{children:"AllocationTags"})," map\nwhich stores metadata about the pod. In the helper function ",(0,s.jsx)(n.code,{children:"CreateTagsForTask()"}),", the\nowner reference is checked if this is a static pod, then an appropriate entry to the tags is\nadded."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Overview of code changes"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Delete ",(0,s.jsx)(n.code,{children:"Context.updateNodeOccupiedResources()"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Context.updateForeignPod()"})," - remove reference to\n",(0,s.jsx)(n.code,{children:"ctx.updateNodeOccupiedResources()"})," and unify it with ",(0,s.jsx)(n.code,{children:"Context.updateYunikornPod()"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Context.deleteForeignPod()"})," - remove reference to\n",(0,s.jsx)(n.code,{children:"ctx.updateNodeOccupiedResources()"})," and\nunify it with ",(0,s.jsx)(n.code,{children:"Context.deleteYunikornPod()"})]}),"\n",(0,s.jsxs)(n.li,{children:["Delete ",(0,s.jsx)(n.code,{children:"SchedulerCache.UpdateCapacity()"}),",\n",(0,s.jsx)(n.code,{children:"SchedulerCache.UpdateOccupiedResource()"})," and the related fields: ",(0,s.jsx)(n.code,{children:"nodeOccupied"}),",\n",(0,s.jsx)(n.code,{children:"nodeCapacity"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Context.updateNodeInternal()"})," - remove call to ",(0,s.jsx)(n.code,{children:"schedulerCache.UpdateCapacity()"})]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"scheduler-interface",children:"Scheduler interface"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Node object"})}),"\n",(0,s.jsx)(n.p,{children:"The following type is sent to the core when a node update occurs:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"type NodeInfo struct {\n  NodeID               string\n  Action               NodeInfo_ActionFromRM\n  Attributes           map[string]string\n  SchedulableResource *Resource\n  OccupiedResource    *Resource\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"SchedulableResource"})," represents the capacity of the node, while ",(0,s.jsx)(n.code,{children:"OccupiedResource"})," tells\nhow much is available for pods."]}),"\n",(0,s.jsxs)(n.p,{children:["Proposal: remove the ",(0,s.jsx)(n.code,{children:"OccupiedResource"})," field because it won\u2019t be used anymore."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Event system"})}),"\n",(0,s.jsxs)(n.p,{children:["With the introduction of tracking all pods in the cluster, now we can generate events about\neach individual allocations. Events for YuniKorn pods already exist: ",(0,s.jsx)(n.code,{children:"APP_ALLOC"})," application\nevent and ",(0,s.jsx)(n.code,{children:"NODE_ALLOC"})," node event. We won\u2019t use the ",(0,s.jsx)(n.code,{children:"APP_ALLOC"})," because we can\u2019t tie the\nnon-YuniKorn allocation to an existing application.\nProposal: still generate ",(0,s.jsx)(n.code,{children:"NODE_OCCUPIED"})," in the next release (Yunkorn 1.7), but announce the\ndeprecation of this event. It will be removed in YuniKorn 1.8.\nWe will also generate ",(0,s.jsx)(n.code,{children:"NODE_ALLOC"}),' for non-YuniKorn allocations, marking it foreign in the\n"message" field.']}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Event type"}),(0,s.jsx)(n.th,{children:"Event ID"}),(0,s.jsx)(n.th,{children:"State"}),(0,s.jsx)(n.th,{children:"When is it generated"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"Node"}),(0,s.jsx)(n.td,{children:"NODE_OCCUPIED"}),(0,s.jsx)(n.td,{children:"Existing - to be removed in 1.8"}),(0,s.jsx)(n.td,{children:"Occupied resource changes on a node"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"Node"}),(0,s.jsx)(n.td,{children:"NODE_ALLOC"}),(0,s.jsx)(n.td,{children:"Already exists for YuniKorn allocations"}),(0,s.jsx)(n.td,{children:"Allocation (node assignment) occurs"})]})]})]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Constants"})}),"\n",(0,s.jsxs)(n.p,{children:["One constans will be introduced as a key for application tags. All pods scheduled by a\ndifferent scheduler than YuniKorn will have the tag ",(0,s.jsx)(n.code,{children:"foreign"}),".\nValues for the foreign tag are:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"static"}),": indicates a static pod, hard skip for preemption"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"default"}),": preemptable pod"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"scheduler-core",children:"Scheduler core"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Scheduling context"})}),"\n",(0,s.jsxs)(n.p,{children:["Processing updates happens in ",(0,s.jsx)(n.code,{children:"ClusterContext.updateNode()"}),". There is a branch for\n",(0,s.jsx)(n.code,{children:"NodeInfo_UPDATE"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"case si.NodeInfo_UPDATE:\n  if sr := nodeInfo.SchedulableResource; sr != nil {\n    partition.updatePartitionResource(node.SetCapacity(resources.NewResourceFromProto(sr)))\n  }\n\n  if or := nodeInfo.OccupiedResource; or != nil {\n    node.SetOccupiedResource(resources.NewResourceFromProto(or))\n  }\n"})}),"\n",(0,s.jsxs)(n.p,{children:["Proposed changes: remove the path ",(0,s.jsx)(n.code,{children:"or != nil"}),", because that field won\u2019t be used."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Allocation object"})}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"objects.Allocations"})," type needs to be extended. The scheduler core needs to know if\nthe allocation was scheduled by YuniKorn or not and if we want to support preemption, we\nhave to mark allocations which represent static pods. These will be determined from the\nallocation tags explained in the K8s shim part."]}),"\n",(0,s.jsx)(n.p,{children:"Two flags (boolean) to be added to the objects.Allocations that can only be set on\ncreation. The flags can be read but never modified."}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Partition"})}),"\n",(0,s.jsxs)(n.p,{children:["After YUNIKORN-2457, adding foreign allocations became much simpler. Some minor\nchanges inside ",(0,s.jsx)(n.code,{children:"PartitionContext.UpdateAllocation()"})," are necessary to ignore the\napplication lookup for foreign pods."]}),"\n",(0,s.jsx)(n.p,{children:"We might track foreign pods as part of an application in the future but that is out of scope of\nthis change."}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"REST Interface"})}),"\n",(0,s.jsx)(n.p,{children:"The way how allocations are counted gives the user more detailed information about the\nresource usage of all pods. Now we can show individual foreign allocations, not just a single\ncounter."}),"\n",(0,s.jsx)(n.p,{children:"In YuniKorn 1.7, the data in the REST output will not change. We can still calculate\nOccupiedResources information per node. We also announce that AllocatedResources is\nabout to change, because the value will be based on all pods on the node."}),"\n",(0,s.jsxs)(n.p,{children:["From YuniKorn 1.8 onwards, we remove OccupiedResources and update the calculation of\n",(0,s.jsx)(n.code,{children:"AllocatedResources"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:["To support easier integration with the web UI, a separate list will be maintained for the two\ntypes of allocations. Allocations made by YuniKorn are still available under ",(0,s.jsx)(n.code,{children:"allocations"}),".\nNon-YuniKorn allocations will be listed under ",(0,s.jsx)(n.code,{children:"foreignAllocations"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:["The foreign allocation will have a separate, lightweight DAO object with the following\ninformation, following the existing ",(0,s.jsx)(n.code,{children:"AllocationDAOInfo"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["allocation key (pod UID): ",(0,s.jsx)(n.code,{children:"AllocationKey"})]}),"\n",(0,s.jsxs)(n.li,{children:["assigned node: ",(0,s.jsx)(n.code,{children:"NodeID"})]}),"\n",(0,s.jsxs)(n.li,{children:["priority: ",(0,s.jsx)(n.code,{children:"Priority"})]}),"\n",(0,s.jsxs)(n.li,{children:["resources: ",(0,s.jsx)(n.code,{children:"ResourcePerAlloc"})]}),"\n",(0,s.jsxs)(n.li,{children:["creation time: ",(0,s.jsx)(n.code,{children:"RequestTime"})]}),"\n",(0,s.jsxs)(n.li,{children:["tags: ",(0,s.jsx)(n.code,{children:"AllocationTags"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The allocations will be available from two URLs:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"/ws/v1/partition/<partition>/nodes"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"/ws/v1/fullstatedump"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"web-ui-integration",children:"Web UI integration"}),"\n",(0,s.jsx)(n.p,{children:"There are no changes planned for the web UI as part of this design. The REST information\nfor a node will not change and the web UI will keep working with the changes in place.\nWhen the REST API specification is finalised the node page in the web UI will need to be\nupdated to allow the display of the new details."}),"\n",(0,s.jsx)(n.h2,{id:"testing",children:"Testing"}),"\n",(0,s.jsx)(n.h3,{id:"core-side",children:"Core side"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Smoke tests with MockScheduler"})}),"\n",(0,s.jsx)(n.p,{children:"Write a new test with the following steps:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Creates a new partition context"}),"\n",(0,s.jsx)(n.li,{children:"Registers a node"}),"\n",(0,s.jsx)(n.li,{children:"Send a SI request which represents a foreign allocation"}),"\n",(0,s.jsxs)(n.li,{children:["Verify the following:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.OccupiedResources"})," has changed"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AvailableResources"})," has changed"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AllocatedResources"})," is zero"]}),"\n",(0,s.jsx)(n.li,{children:"Node object contains a new allocation"}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.li,{children:"Remove the foreign allocation"}),"\n",(0,s.jsxs)(n.li,{children:["Verify the following:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.OccupiedResources"})," is zero"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AvailableResources"})," is back to the original capacity"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AllocatedResources"})," is zero"]}),"\n",(0,s.jsx)(n.li,{children:"Node object does not contain any allocation"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Unit tests"})}),"\n",(0,s.jsx)(n.p,{children:"Changes are expected in the following methods - go for a 100% coverage wherever\npossible:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Context.processAllocations()","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"no notification is sent towards the shim if it is a foreign allocation"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["Partition.UpdateAllocation()","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"foreign / non-foreign allocation"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["NewAllocationFromSI()","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"new foreign allocation object where tag foreign = true and static =\ntrue/false"}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.li,{children:"Node.addAllocationInternal()"}),"\n",(0,s.jsx)(n.li,{children:"Node.RemoveAllocation()"}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"k8shim-side",children:"K8Shim side"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Smoke tests with MockScheduler"})}),"\n",(0,s.jsx)(n.p,{children:"Create a new test with the following steps:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Creates a new ",(0,s.jsx)(n.code,{children:"MockScheduler"})," instance"]}),"\n",(0,s.jsx)(n.li,{children:"Registers a node with some existing foreign allocations"}),"\n",(0,s.jsx)(n.li,{children:"Starts the mock scheduler"}),"\n",(0,s.jsxs)(n.li,{children:["Verify that:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Existing allocations are properly registered to the node"}),"\n",(0,s.jsxs)(n.li,{children:["Create a pod which with ",(0,s.jsx)(n.code,{children:"PodSpec.SchedulerName"})," being empty\n-Send the pod to the mock scheduler and wait until it\u2019s processed by the core"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["Verify that:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.OccupiedResources"})," has changed"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AvailableResources"})," has changed"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AllocatedResources"})," is zero"]}),"\n",(0,s.jsx)(n.li,{children:"Node object contains a new allocation"}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.li,{children:"Remove the pod from the mock scheduler"}),"\n",(0,s.jsxs)(n.li,{children:["Verify that:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.OccupiedResources"})," is zero"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AvailableResources"})," is back to the original capacity"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Node.AllocatedResources"})," is zero"]}),"\n",(0,s.jsx)(n.li,{children:"Node object does not contain any allocation"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Unit tests"})}),"\n",(0,s.jsx)(n.p,{children:"Changes are expected in the following methods - go for a 100% coverage wherever\npossible:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Context.updateForeignPod()"})," and ",(0,s.jsx)(n.code,{children:"Context.updateYunikornPod()"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"These will be merged, make sure new method has coverage for both\nYuniKorn and foreign pods"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"CreateTagsForTask()"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Determining whether pod is static or not"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Context.deleteForeignPod()"})," and ",(0,s.jsx)(n.code,{children:"Context.deleteYunikornPod()"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"These will be merged, make sure new method has coverage for both\nYuniKorn and foreign pods"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"CreateAllocationForForeignPod()"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["New helper method to build an ",(0,s.jsx)(n.code,{children:"AllocationRequest"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"e2e-tests",children:"E2E tests"}),"\n",(0,s.jsx)(n.p,{children:"Assumption: no change should be needed for existing tests."}),"\n",(0,s.jsx)(n.p,{children:"Write a new test case with the following behavior:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Create a new pod with ",(0,s.jsx)(n.code,{children:"PodSpec.SchedulerName"})," being empty"]}),"\n",(0,s.jsx)(n.li,{children:"Wait until it gets scheduled by the default scheduler"}),"\n",(0,s.jsx)(n.li,{children:"Perform a REST query to YuniKorn"}),"\n",(0,s.jsxs)(n.li,{children:["Retrieve output from the endpoint ",(0,s.jsx)(n.code,{children:"/ws/v1/partition/default/nodes"})]}),"\n",(0,s.jsxs)(n.li,{children:["Verify that:","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["It has allocations and ",(0,s.jsx)(n.code,{children:"foreignAllocations"})," entries"]}),"\n",(0,s.jsxs)(n.li,{children:["Foreign pod is listed under ",(0,s.jsx)(n.code,{children:"foreignAllocations"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"summary",children:"Summary"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Event"}),(0,s.jsx)(n.th,{children:"Curent"}),(0,s.jsx)(n.th,{children:"New"}),(0,s.jsx)(n.th,{children:"Notes"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"YuniKorn pod updated (node assignment)"}),(0,s.jsx)(n.td,{children:"Update scheduler cache"}),(0,s.jsx)(n.td,{children:"Update scheduler cache"}),(0,s.jsx)(n.td,{children:"Existing shim behavior doesn\u2019t change (allocation is already in the core)"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"YuniKorn pod updated (resource usage)"}),(0,s.jsx)(n.td,{children:"Update scheduler cache"}),(0,s.jsxs)(n.td,{children:["1. Update scheduler cache",(0,s.jsx)("br",{}),"2. Send AllocationRequest"]}),(0,s.jsx)(n.td,{children:"YUNIKORN-1765 will implement this for both YuniKorn and foreign pods"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"YuniKorn pod deleted"}),(0,s.jsxs)(n.td,{children:["1. Remove pod from scheduler cache",(0,s.jsx)("br",{}),"2. Notify core"]}),(0,s.jsxs)(n.td,{children:["1. Remove pod from scheduler cache",(0,s.jsx)("br",{}),"2. Notify core"]}),(0,s.jsx)(n.td,{children:"Existing shim behavior doesn\u2019t change"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"Foreign pod updated (node assignment)"}),(0,s.jsxs)(n.td,{children:["1. Update scheduler cache",(0,s.jsx)("br",{}),"2. Send NodeInfo with new OccupiedResources"]}),(0,s.jsx)(n.td,{children:"Send AllocationRequest"}),(0,s.jsx)(n.td,{})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"Foreign pod updated (resource usage)"}),(0,s.jsx)(n.td,{children:"Update scheduler cache"}),(0,s.jsxs)(n.td,{children:["1. Update scheduler cache",(0,s.jsx)("br",{}),"2. Send AllocationRequest"]}),(0,s.jsx)(n.td,{children:"YUNIKORN-1765 will implement this for both YuniKorn and foreign pods"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"Foreign pod deleted"}),(0,s.jsxs)(n.td,{children:["1. Update scheduler cache",(0,s.jsx)("br",{}),"2. Send NodeInfo with new OccupiedResources"]}),(0,s.jsx)(n.td,{children:"Send AllocationReleasesRequest"}),(0,s.jsx)(n.td,{})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"Node capacity updated"}),(0,s.jsxs)(n.td,{children:["1. Update scheduler cache",(0,s.jsx)("br",{}),"2. Send NodeInfo with new OccupiedResources"]}),(0,s.jsxs)(n.td,{children:["1. Update scheduler cache",(0,s.jsx)("br",{}),"2. Send NodeInfo"]}),(0,s.jsx)(n.td,{})]})]})]})]})}function a(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},37155:(e,n,i)=>{i.d(n,{R:()=>t,x:()=>r});var s=i(79474);const o={},d=s.createContext(o);function t(e){const n=s.useContext(d);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:t(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);