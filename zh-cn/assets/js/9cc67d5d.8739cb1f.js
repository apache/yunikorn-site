"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3068],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var k=r.createContext({}),s=function(e){var t=r.useContext(k),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(k.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,k=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),u=s(n),c=i,m=u["".concat(k,".").concat(c)]||u[c]||d[c]||a;return n?r.createElement(m,l(l({ref:t},p),{},{components:n})):r.createElement(m,l({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=c;var o={};for(var k in t)hasOwnProperty.call(t,k)&&(o[k]=t[k]);o.originalType=e,o[u]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<a;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},55251:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>k,contentTitle:()=>l,default:()=>d,frontMatter:()=>a,metadata:()=>o,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const a={id:"env_setup",title:"\u5f00\u53d1\u73af\u5883\u7684\u8bbe\u7f6e"},l=void 0,o={unversionedId:"developer_guide/env_setup",id:"developer_guide/env_setup",title:"\u5f00\u53d1\u73af\u5883\u7684\u8bbe\u7f6e",description:"\x3c!--",source:"@site/i18n/zh-cn/docusaurus-plugin-content-docs/current/developer_guide/env_setup.md",sourceDirName:"developer_guide",slug:"/developer_guide/env_setup",permalink:"/zh-cn/docs/next/developer_guide/env_setup",draft:!1,tags:[],version:"current",frontMatter:{id:"env_setup",title:"\u5f00\u53d1\u73af\u5883\u7684\u8bbe\u7f6e"},sidebar:"docs",previous:{title:"\u6545\u969c\u6392\u9664",permalink:"/zh-cn/docs/next/user_guide/troubleshooting"},next:{title:"\u5efa\u6784\u548c\u8fd0\u884c",permalink:"/zh-cn/docs/next/developer_guide/build"}},k={},s=[{value:"\u4f7f\u7528Docker Desktop\u8bbe\u7f6e\u672c\u5730\u7684Kubernetes\u96c6\u7fa4",id:"\u4f7f\u7528docker-desktop\u8bbe\u7f6e\u672c\u5730\u7684kubernetes\u96c6\u7fa4",level:2},{value:"\u5b89\u88c5",id:"\u5b89\u88c5",level:3},{value:"\u90e8\u7f72\u548c\u8bbf\u95ee\u4eea\u8868\u677f",id:"\u90e8\u7f72\u548c\u8bbf\u95ee\u4eea\u8868\u677f",level:3},{value:"\u8bbf\u95ee\u672c\u5730Kubernetes\u96c6\u7fa4",id:"\u8bbf\u95ee\u672c\u5730kubernetes\u96c6\u7fa4",level:3},{value:"\u4f7f\u7528Minikube\u8bbe\u7f6e\u672c\u5730\u7684Kubernetes\u96c6\u7fa4",id:"\u4f7f\u7528minikube\u8bbe\u7f6e\u672c\u5730\u7684kubernetes\u96c6\u7fa4",level:2},{value:"\u5b89\u88c5 Minikube",id:"\u5b89\u88c5-minikube",level:3},{value:"\u90e8\u7f72\u548c\u8bbf\u95ee\u96c6\u7fa4",id:"\u90e8\u7f72\u548c\u8bbf\u95ee\u96c6\u7fa4",level:3},{value:"\u5f00\u53d1\u73af\u5883\u5bf9\u6784\u5efa\u7684\u5f71\u54cd",id:"\u5f00\u53d1\u73af\u5883\u5bf9\u6784\u5efa\u7684\u5f71\u54cd",level:3},{value:"\u4f7f\u7528 Kind \u7684\u8bbe\u7f6e\u672c\u5730\u7684 Kubernetes \u96c6\u7fa4",id:"\u4f7f\u7528-kind-\u7684\u8bbe\u7f6e\u672c\u5730\u7684-kubernetes-\u96c6\u7fa4",level:2},{value:"\u5b89\u88c5",id:"\u5b89\u88c5-1",level:3},{value:"\u4f7f\u7528 Kind",id:"\u4f7f\u7528-kind",level:3},{value:"\u8f7d\u5165\u4f60\u7684\u6620\u50cf",id:"\u8f7d\u5165\u4f60\u7684\u6620\u50cf",level:3},{value:"\u5728\u672c\u5730\u8c03\u8bd5\u4ee3\u7801",id:"\u5728\u672c\u5730\u8c03\u8bd5\u4ee3\u7801",level:2},{value:"\u5b58\u53d6\u8fdc\u7aef\u7684 Kubernetes \u96c6\u7fa4",id:"\u5b58\u53d6\u8fdc\u7aef\u7684-kubernetes-\u96c6\u7fa4",level:2}],p={toc:s},u="wrapper";function d(e){let{components:t,...a}=e;return(0,i.kt)(u,(0,r.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"\u6709\u5f88\u591a\u79cd\u65b9\u6cd5\u53ef\u4ee5\u5728\u672c\u5730\u8bbe\u7f6eKubernetes\u5f00\u53d1\u73af\u5883\uff0c\u5176\u4e2d\u6700\u5e38\u89c1\u7684\u4e09\u79cd\u65b9\u6cd5\u662f",(0,i.kt)("inlineCode",{parentName:"p"},"Minikube"),"(",(0,i.kt)("a",{parentName:"p",href:"https://kubernetes.io/docs/setup/minikube/"},"docs"),")\u3001",(0,i.kt)("inlineCode",{parentName:"p"},"docker-desktop"),"\u548c",(0,i.kt)("inlineCode",{parentName:"p"},"kind"),"(",(0,i.kt)("a",{parentName:"p",href:"https://kind.sigs.k8s.io/"},"kind"),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"Minikube"),"\u901a\u8fc7\u6570\u4e2a\u865a\u62df\u673a\u63d0\u4f9b\u4e00\u4e2a\u672c\u5730Kubernetes\u96c6\u7fa4\uff08\u901a\u8fc7VirtualBox\u6216\u7c7b\u4f3c\u7684\u4e1c\u897f\uff09\u3002",(0,i.kt)("inlineCode",{parentName:"p"},"docker-desktop"),"\u80fd\u5728docker\u5bb9\u5668\u4e2d\u8bbe\u7f6eKubernetes\u96c6\u7fa4\u3002 ",(0,i.kt)("inlineCode",{parentName:"p"},"kind"),"\u4e3aWindows\u3001Linux\u548cMac\u63d0\u4f9b\u8f7b\u91cf\u7ea7\u7684Kubernetes\u96c6\u7fa4\u3002"),(0,i.kt)("h2",{id:"\u4f7f\u7528docker-desktop\u8bbe\u7f6e\u672c\u5730\u7684kubernetes\u96c6\u7fa4"},"\u4f7f\u7528Docker Desktop\u8bbe\u7f6e\u672c\u5730\u7684Kubernetes\u96c6\u7fa4"),(0,i.kt)("p",null,"\u5728\u672c\u6559\u7a0b\u4e2d\uff0c\u6211\u4eec\u5c06\u57fa\u4e8eDocker Desktop\u8fdb\u884c\u6240\u6709\u7684\u5b89\u88c5\u3002\n\u6211\u4eec\u4e5f\u53ef\u4ee5\u4f7f\u7528\u8f7b\u91cf\u7ea7\u7684",(0,i.kt)("a",{parentName:"p",href:"#%E4%BD%BF%E7%94%A8minikube%E8%AE%BE%E7%BD%AE%E6%9C%AC%E5%9C%B0%E7%9A%84kubernetes%E9%9B%86%E7%BE%A4"},"minikube"),"\u8bbe\u7f6e\uff0c\u5b83\u53ef\u4ee5\u63d0\u4f9b\u540c\u6837\u7684\u529f\u80fd\uff0c\u4e14\u9700\u8981\u7684\u8d44\u6e90\u8f83\u5c0f\u3002"),(0,i.kt)("h3",{id:"\u5b89\u88c5"},"\u5b89\u88c5"),(0,i.kt)("p",null,"\u5728\u4f60\u7684\u7b14\u8bb0\u672c\u7535\u8111\u4e0a\u4e0b\u8f7d\u5e76\u5b89\u88c5",(0,i.kt)("a",{parentName:"p",href:"https://www.docker.com/products/docker-desktop"},"Docker-Desktop"),"\u3002\u5176\u4e2d\uff0c\u6700\u65b0\u7248\u672c\u5305\u542b\u4e86Kubernetes\uff0c\u6240\u4ee5\u4e0d\u9700\u8981\u989d\u5916\u5b89\u88c5\u3002\n\u53ea\u9700\u6309\u7167",(0,i.kt)("a",{parentName:"p",href:"https://docs.docker.com/docker-for-mac/#kubernetes"},"\u8fd9\u91cc"),"\u7684\u6b65\u9aa4\uff0c\u5c31\u53ef\u4ee5\u5728docker-desktop\u4e2d\u542f\u52a8\u548c\u8fd0\u884cKubernetes\u3002"),(0,i.kt)("p",null,"\u4e00\u65e6Kubernetes\u5728docker\u684c\u9762\u4e2d\u542f\u52a8\uff0c\u4f60\u5e94\u8be5\u770b\u5230\u7c7b\u4f3c\u4ee5\u4e0b\u7684\u753b\u9762\uff1a"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Kubernetes in Docker Desktop",src:n(1435).Z,width:"424",height:"391"})),(0,i.kt)("p",null,"\u8fd9\u610f\u5473\u7740\uff1a"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Kubernetes\u6b63\u5728\u8fd0\u884c\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u547d\u4ee4\u884c\u5de5\u5177",(0,i.kt)("inlineCode",{parentName:"li"},"kubctl"),"\u5b89\u88c5\u5728",(0,i.kt)("inlineCode",{parentName:"li"},"/usr/local/bin"),"\u76ee\u5f55\u4e0b\u3002"),(0,i.kt)("li",{parentName:"ol"},"Kubernetes\u7684\u88ab\u8bbe\u7f6e\u5230",(0,i.kt)("inlineCode",{parentName:"li"},"docker-desktop"),"\u4e2d\u3002")),(0,i.kt)("h3",{id:"\u90e8\u7f72\u548c\u8bbf\u95ee\u4eea\u8868\u677f"},"\u90e8\u7f72\u548c\u8bbf\u95ee\u4eea\u8868\u677f"),(0,i.kt)("p",null,"\u8bbe\u7f6e\u597d\u672c\u5730Kubernetes\u540e\uff0c\u4f60\u9700\u8981\u4f7f\u7528\u4ee5\u4e0b\u6b65\u9aa4\u90e8\u7f72\u4eea\u8868\u76d8\uff1a "),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u6309\u7167",(0,i.kt)("a",{parentName:"li",href:"https://github.com/kubernetes/dashboard"},"Kubernetes dashboard doc"),"\u4e2d\u7684\u8bf4\u660e\u6765\u90e8\u7f72\u4eea\u8868\u76d8\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u4ece\u7ec8\u7aef\u542f\u52a8Kubernetes\u4ee3\u7406\uff0c\u8ba9\u6211\u4eec\u80fd\u5b58\u53d6\u672c\u5730\u4e3b\u673a\u4e0a\u7684\u4eea\u8868\u677f\uff1a   ",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"kubectl proxy &\n"))),(0,i.kt)("li",{parentName:"ol"},"\u901a\u8fc7\u4ee5\u4e0b\u7f51\u5740\u8bbf\u95ee\u4eea\u8868\u677f\uff1a ",(0,i.kt)("a",{parentName:"li",href:"http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login"},"\u94fe\u63a5"))),(0,i.kt)("h3",{id:"\u8bbf\u95ee\u672c\u5730kubernetes\u96c6\u7fa4"},"\u8bbf\u95ee\u672c\u5730Kubernetes\u96c6\u7fa4"),(0,i.kt)("p",null,"\u4e0a\u4e00\u6b65\u90e8\u7f72\u7684\u4eea\u8868\u677f\u9700\u8981\u4e00\u4e2a\u4ee4\u724c\u6216\u914d\u7f6e\u6765\u767b\u5f55\u3002\u8fd9\u91cc\u6211\u4eec\u4f7f\u7528\u4ee4\u724c\u6765\u767b\u5f55\u3002\u8be5\u4ee4\u724c\u662f\u81ea\u52a8\u751f\u6210\u7684\uff0c\u53ef\u4ee5\u4ece\u7cfb\u7edf\u4e2d\u68c0\u7d22\u5230\u3002"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u68c0\u7d22\u4eea\u8868\u677f\u4ee4\u724c\u7684\u540d\u79f0\uff1a",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"kubectl -n kube-system get secret | grep kubernetes-dashboard-token\n"))),(0,i.kt)("li",{parentName:"ol"},"\u68c0\u7d22\u4ee4\u724c\u7684\u5185\u5bb9\uff0c\u6ce8\u610f\u4ee4\u724c\u540d\u79f0\u4ee5\u968f\u673a\u76845\u4e2a\u5b57\u7b26\u4ee3\u7801\u7ed3\u5c3e\uff0c\u9700\u8981\u7528\u6b65\u9aa41\u7684\u7ed3\u679c\u66ff\u6362\u3002\u4f8b\u5982\uff1a",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"kubectl -n kube-system describe secret kubernetes-dashboard-token-tf6n8\n"))),(0,i.kt)("li",{parentName:"ol"},"\u8907\u88fd",(0,i.kt)("inlineCode",{parentName:"li"},"Data"),"\u4e2d\u6807\u7b7e\u4e3a ",(0,i.kt)("inlineCode",{parentName:"li"},"token"),"\u7684\u503c\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u5728\u7528\u6237\u4ecb\u9762\u4eea\u8868\u677f\u4e2d\u9009\u62e9 ",(0,i.kt)("strong",{parentName:"li"},"Token"),"\uff1a",(0,i.kt)("br",null),(0,i.kt)("img",{alt:"Token Access in dashboard",src:n(4362).Z,width:"481",height:"267"})),(0,i.kt)("li",{parentName:"ol"},"\u5728\u8f93\u5165\u6846\u4e2d\u7c98\u8d34",(0,i.kt)("inlineCode",{parentName:"li"},"token"),"\u7684\u503c\uff0c\u7136\u540e\u767b\u5f55\uff1a",(0,i.kt)("br",null),(0,i.kt)("img",{alt:"Token Access in dashboard",src:n(41234).Z,width:"432",height:"209"}))),(0,i.kt)("h2",{id:"\u4f7f\u7528minikube\u8bbe\u7f6e\u672c\u5730\u7684kubernetes\u96c6\u7fa4"},"\u4f7f\u7528Minikube\u8bbe\u7f6e\u672c\u5730\u7684Kubernetes\u96c6\u7fa4"),(0,i.kt)("p",null,"Minikube \u53ef\u4ee5\u88ab\u6dfb\u52a0\u5230\u73b0\u6709\u7684 Docker Desktop \u4e2d\u3002Minikube \u65e2\u53ef\u4ee5\u4f7f\u7528\u9884\u88c5\u7684\u865a\u62df\u673a\u7ba1\u7406\u7a0b\u5e8f(hypervisor)\uff0c\u4e5f\u53ef\u4ee5\u81ea\u5df1\u9009\u62e9\u3002\u9884\u8bbe\u662f\u7531",(0,i.kt)("a",{parentName:"p",href:"https://github.com/moby/hyperkit"},"HyperKit"),"\u6240\u63d0\u4f9b\u7684\u865a\u62df\u5316\uff0c\u5b83\u5df2\u88ab\u5d4c\u5165\u5230 Docker Desktop \u4e2d\u3002  "),(0,i.kt)("p",null,"\u5982\u679c\u4f60\u4e0d\u60f3\u4f7f\u7528 HyperKit \u7684\u865a\u62df\u673a\u7ba1\u7406\u7a0b\u5e8f\uff0c\u8bf7\u786e\u4fdd\u4f60\u9075\u5faa\u901a\u7528\u7684minikube\u5b89\u88c5\u8bf4\u660e\u3002\u5982\u679c\u9700\u8981\u7684\u8bdd\uff0c\u4e0d\u8981\u5fd8\u8bb0\u4e3a\u6240\u9009\u62e9\u7684\u865a\u62df\u673a\u7ba1\u7406\u7a0b\u5e8f\u5b89\u88c5\u6b63\u786e\u7684\u9a71\u52a8\u7a0b\u5e8f\u3002\n\u57fa\u672c\u8bf4\u660e\u5728",(0,i.kt)("a",{parentName:"p",href:"https://kubernetes.io/docs/tasks/tools/install-minikube/"},"minikube install"),"\u4e2d\u63d0\u4f9b\u3002"),(0,i.kt)("p",null,"\u5982\u679c\u8981\u68c0\u67e5 Docker Desktop \u662f\u5426\u5b89\u88c5\u4e86 HyperKit\u3002\u5728\u7ec8\u7aef\u4e0a\u8fd0\u884c\uff1a ",(0,i.kt)("inlineCode",{parentName:"p"},"hyperkit"),"\u6765\u786e\u8ba4\u3002\u9664\u4e86 ",(0,i.kt)("inlineCode",{parentName:"p"},"hyperkit: command not found")," \u4ee5\u5916\u7684\u4efb\u4f55\u54cd\u5e94\u90fd\u8bc1\u5b9e\u4e86 HyperKit \u5df2\u7ecf\u5b89\u88c5\u5e76\u4e14\u5728\u8def\u5f84\u4e0a\u3002\u5982\u679c\u6ca1\u6709\u627e\u5230\uff0c\u4f60\u53ef\u4ee5\u9009\u62e9\u4e00\u4e2a\u4e0d\u540c\u7684\u865a\u62df\u673a\u7ba1\u7406\u7a0b\u5e8f\u6216\u4fee\u590dDocker Desktop\u3002"),(0,i.kt)("h3",{id:"\u5b89\u88c5-minikube"},"\u5b89\u88c5 Minikube"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u4f60\u53ef\u4ee5\u4f7f\u7528 brew \u6216\u662f\u4ee5\u4e0b\u7684\u6b65\u9aa4\u6765\u5b89\u88c5 minikube\uff1a",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64\nchmod +x minikube\nsudo mv minikube /usr/local/bin\n"))),(0,i.kt)("li",{parentName:"ol"},"\u4f60\u53ef\u4ee5\u4f7f\u7528 brew \u6216\u662f\u4ee5\u4e0b\u7684\u6b65\u9aa4\u6765\u5b89\u88c5 HyperKit \u7684\u9a71\u52a8\u7a0b\u5e8f(\u5fc5\u8981)\uff1a",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"curl -LO https://storage.googleapis.com/minikube/releases/latest/docker-machine-driver-hyperkit\nsudo install -o root -g wheel -m 4755 docker-machine-driver-hyperkit /usr/local/bin/\n"))),(0,i.kt)("li",{parentName:"ol"},"\u66f4\u65b0 minikube \u914d\u7f6e\uff0c\u4f7f\u5176\u9ed8\u8ba4\u865a\u62df\u673a\u7ba1\u7406\u7a0b\u5e8f\u4e3aHyperKit\uff1a",(0,i.kt)("inlineCode",{parentName:"li"},"minikube config set vm-driver hyperkit"),"\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u4fee\u6539 docker desktop \u4ee5\u4f7f\u7528 Kubernetes \u7684 minikube\uff1a",(0,i.kt)("br",null),(0,i.kt)("img",{alt:"Kubernetes in Docker Desktop: minikube setting",src:n(11103).Z,width:"425",height:"391"}))),(0,i.kt)("h3",{id:"\u90e8\u7f72\u548c\u8bbf\u95ee\u96c6\u7fa4"},"\u90e8\u7f72\u548c\u8bbf\u95ee\u96c6\u7fa4"),(0,i.kt)("p",null,"\u5b89\u88c5\u5b8c\u6210\u540e\uff0c\u4f60\u53ef\u4ee5\u5f00\u59cb\u542f\u52a8\u4e00\u4e2a\u65b0\u7684\u96c6\u7fa4\u3002"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u542f\u52a8 minikube \u96c6\u7fa4\uff1a ",(0,i.kt)("inlineCode",{parentName:"li"},"minikube start --kubernetes-version v1.24.7")),(0,i.kt)("li",{parentName:"ol"},"\u542f\u52a8 minikube \u4eea\u8868\u677f\uff1a ",(0,i.kt)("inlineCode",{parentName:"li"},"minikube dashboard &"))),(0,i.kt)("h3",{id:"\u5f00\u53d1\u73af\u5883\u5bf9\u6784\u5efa\u7684\u5f71\u54cd"},"\u5f00\u53d1\u73af\u5883\u5bf9\u6784\u5efa\u7684\u5f71\u54cd"),(0,i.kt)("p",null,"\u5728\u521b\u5efa\u6620\u50cf\u4e4b\u524d\uff0c\u786e\u4fdd\u4f60\u7684 minikube \u8fd0\u884c\u5728\u6b63\u786e\u7684\u73af\u5883\u4e2d\u3002\n\u5982\u679c\u6ca1\u6709\u8bbe\u5b9a minikube \u73af\u5883\uff0c\u5c31\u4f1a\u5728\u90e8\u7f72\u8c03\u5ea6\u5668\u7684\u65f6\u5019\u627e\u4e0d\u5230docker\u6620\u50cf\u3002"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u786e\u4fdd minikube \u5df2\u542f\u52a8\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u5728\u4f60\u8981\u8fd0\u884c\u6784\u5efa\u7684\u7ec8\u7aef\u4e2d\uff0c\u6267\u884c\uff1a ",(0,i.kt)("inlineCode",{parentName:"li"},"eval $(minikube docker-env)")),(0,i.kt)("li",{parentName:"ol"},"\u5728 yunikorn-k8shim \u7684\u6839\u76ee\u5f55\u521b\u5efa\u6620\u50cf\uff1a ",(0,i.kt)("inlineCode",{parentName:"li"},"make image")),(0,i.kt)("li",{parentName:"ol"},"\u6309\u7167\u6b63\u5e38\u6307\u4ee4\u90e8\u7f72\u8c03\u5ea6\u5668\u3002")),(0,i.kt)("h2",{id:"\u4f7f\u7528-kind-\u7684\u8bbe\u7f6e\u672c\u5730\u7684-kubernetes-\u96c6\u7fa4"},"\u4f7f\u7528 Kind \u7684\u8bbe\u7f6e\u672c\u5730\u7684 Kubernetes \u96c6\u7fa4"),(0,i.kt)("p",null,"Kind\uff08Kubernetes in Docker\uff09\u662f\u4e00\u4e2a\u8f7b\u91cf\u7ea7\u7684\u5de5\u5177\uff0c\u4e3b\u8981\u7528\u6765\u8fd0\u884c\u8f7b\u91cf\u7ea7Kubernetes\u73af\u5883\u3002 \u7528kind\u6d4b\u8bd5\u4e0d\u540c\u7684Kubernetes\u7248\u672c\u662f\u975e\u5e38\u5bb9\u6613\u7684\uff0c\u53ea\u9700\u9009\u62e9\u4f60\u60f3\u8981\u7684\u6620\u50cf\u3002"),(0,i.kt)("h3",{id:"\u5b89\u88c5-1"},"\u5b89\u88c5"),(0,i.kt)("p",null,"\u5982\u679c\u4f60\u5df2\u7ecf\u5b89\u88c5\u8fc7go\uff0c\u53ef\u4ee5\u76f4\u63a5\u8fd0\u884c",(0,i.kt)("inlineCode",{parentName:"p"},"go install sigs.k8s.io/kind@latest"),"\u3002"),(0,i.kt)("p",null,"\u53ef\u5728",(0,i.kt)("a",{parentName:"p",href:"https://kind.sigs.k8s.io/docs/user/quick-start/#installation"},"Kind"),"\u7684\u6587\u4ef6\u4e0a\u627e\u5230\u5176\u4ed6\u65b9\u6cd5\u3002"),(0,i.kt)("p",null,"Kubernetes 1.25 \u6216\u66f4\u9ad8\u7248\u672c\u9700\u8981 Kind \u7248\u672c 0.15\u3002Kind \u7684\u66f4\u9ad8\u7248\u672c\u6dfb\u52a0\u4e86 Kubernetes 1.26\u30011.27 \u548c 1.28\u3002\u68c0\u67e5\u79cd\u7c7b\u53d1\u884c\u8bf4\u660e\u4ee5\u4e86\u89e3\u652f\u6301\u7684\u7279\u5b9a Kubernetes \u7248\u672c"),(0,i.kt)("h3",{id:"\u4f7f\u7528-kind"},"\u4f7f\u7528 Kind"),(0,i.kt)("p",null,"\u82e5\u8981\u8981\u6d4b\u8bd5\u65b0\u7248\u672c\u7684Kubernetes\uff0c\u4f60\u53ef\u4ee5\u4ecekind\u7684repo\u4e2d\u62c9\u51fa\u4e00\u4e2a\u76f8\u5e94\u7684\u6620\u50cf\u3002"),(0,i.kt)("p",null,"\u521b\u5efa\u7248\u672c\u4e3a v1.24.7 \u7684 Kubernetes \u96c6\u7fa4\uff1a ",(0,i.kt)("inlineCode",{parentName:"p"},"kind create cluster --name test --image kindest/node:v1.24.7")),(0,i.kt)("p",null,"\u5220\u9664 kind \u96c6\u7fa4\uff1a ",(0,i.kt)("inlineCode",{parentName:"p"},"kind delete cluster --name test")),(0,i.kt)("h3",{id:"\u8f7d\u5165\u4f60\u7684\u6620\u50cf"},"\u8f7d\u5165\u4f60\u7684\u6620\u50cf"),(0,i.kt)("p",null,"\u4e3a\u4e86\u4f7f\u7528\u672c\u5730\u955c\u50cf\uff0c\u4f60\u5fc5\u987b\u5c06\u4f60\u7684\u6620\u50cf\u52a0\u8f7d\u5230kind\u7684\u6ce8\u518c\u8868(registry)\u4e2d\u3002 \u5982\u679c\u4f60\u8fd0\u884c",(0,i.kt)("inlineCode",{parentName:"p"},"make image"),"\uff0c\u4f60\u53ef\u4ee5\u4f7f\u7528\u4e0b\u9762\u7684\u547d\u4ee4\u6765\u52a0\u8f7d\u4f60\u7684kind\u6620\u50cf\u3002 \u4ee5\u4e0b\u5047\u8bbe\u4e3aAMD64\u67b6\u6784\u3002"),(0,i.kt)("p",null,"\u4e0b\u9762\u662f\u8c03\u5ea6\u5668\u3001\u7f51\u9875UI\u548c\u5b58\u53d6\u63a7\u5236\u5668\u7684\u4f8b\u5b50\uff1a "),(0,i.kt)("p",null,"\u8c03\u5ea6\u5668\uff1a\n",(0,i.kt)("inlineCode",{parentName:"p"},"kind load docker-image apache/yunikorn:scheduler-amd64-latest")),(0,i.kt)("p",null,"\u7f51\u9875UI\uff1a\n",(0,i.kt)("inlineCode",{parentName:"p"},"kind load docker-image apache/yunikorn:web-amd64-latest")),(0,i.kt)("p",null,"\u5b58\u53d6\u63a7\u5236\u5668\uff1a\n",(0,i.kt)("inlineCode",{parentName:"p"},"kind load docker-image apache/yunikorn:admission-amd64-latest")),(0,i.kt)("h2",{id:"\u5728\u672c\u5730\u8c03\u8bd5\u4ee3\u7801"},"\u5728\u672c\u5730\u8c03\u8bd5\u4ee3\u7801"),(0,i.kt)("p",null,"\u6ce8\u610f\uff0c\u8fd9\u4e2a\u6307\u4ee4\u8981\u6c42\u4f60\u5728 GoLand IDE \u8fdb\u884c\u5f00\u53d1\u3002"),(0,i.kt)("p",null,'\u5728GoLand\u4e2d\uff0c\u8fdb\u5165yunikorn-k8shim\u9879\u76ee\u3002\u7136\u540e\u70b9\u51fb "Run" -> "Debug..." -> "Edit Configuration..." \u83b7\u53d6\u5f39\u51fa\u7684\u914d\u7f6e\u7a97\u53e3\u3002\n\u6ce8\u610f\uff0c\u5982\u679c\u7b2c\u4e00\u6b21\u6ca1\u6709 "Go Build "\u9009\u9879\uff0c\u4f60\u9700\u8981\u70b9\u51fb "+"\u6765\u521b\u5efa\u4e00\u4e2a\u65b0\u7684\u914d\u7f6e\u6587\u4ef6\u3002'),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Debug Configuration",src:n(49850).Z,width:"1281",height:"965"})),(0,i.kt)("p",null,"\u5f3a\u8c03\u7684\u5b57\u6bb5\u662f\u4f60\u9700\u8981\u6dfb\u52a0\u7684\u914d\u7f6e\u3002\u5305\u62ec\u4ee5\u4e0b\uff1a"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Run Kind\uff1a package"),(0,i.kt)("li",{parentName:"ul"},"Package path\uff1a \u6307\u5411 ",(0,i.kt)("inlineCode",{parentName:"li"},"pkg/shim")," \u7684\u8def\u5f84"),(0,i.kt)("li",{parentName:"ul"},"Working directory\uff1a \u6307\u5411",(0,i.kt)("inlineCode",{parentName:"li"},"conf"),"\u76ee\u5f55\u7684\u8def\u5f84\uff0c\u8fd9\u662f\u7a0b\u5e8f\u52a0\u8f7d\u914d\u7f6e\u6587\u4ef6\u7684\u5730\u65b9\u3002"),(0,i.kt)("li",{parentName:"ul"},"Program arguments\uff1a \u6307\u5b9a\u8fd0\u884c\u7a0b\u5e8f\u7684\u53c2\u6570\uff0c\u5982 ",(0,i.kt)("inlineCode",{parentName:"li"},"-kubeConfig=/path/to/.kube/config -interval=1s -clusterId=mycluster -clusterVersion=0.1 -name=yunikorn -policyGroup=queues -logEncoding=console -logLevel=-1"),".\n\u6ce8\u610f\uff0c\u4f60\u9700\u8981\u628a",(0,i.kt)("inlineCode",{parentName:"li"},"/path/to/.kube/config"),"\u66ff\u6362\u4e3akubeconfig\u6587\u4ef6\u7684\u672c\u5730\u8def\u5f84\u3002\u5982\u679c\u4f60\u60f3\u6539\u53d8\u6216\u6dfb\u52a0\u66f4\u591a\u7684\u9009\u9879\uff0c\u4f60\u53ef\u4ee5\u8fd0\u884c",(0,i.kt)("inlineCode",{parentName:"li"},"_output/bin/k8s-yunikorn-scheduler -h"),"\u6765\u4e86\u89e3\u3002")),(0,i.kt)("p",null,'\u4fee\u6539\u5b8c\u6210\u540e\uff0c\u70b9\u51fb "Apply"\uff0c\u7136\u540e\u70b9\u51fb "Debug"\u3002\u4f60\u5c06\u9700\u8981\u8bbe\u7f6e\u9002\u5f53\u7684\u65ad\u70b9\uff0c\u4ee5\u4fbf\u8c03\u8bd5\u7a0b\u5e8f\u3002'),(0,i.kt)("h2",{id:"\u5b58\u53d6\u8fdc\u7aef\u7684-kubernetes-\u96c6\u7fa4"},"\u5b58\u53d6\u8fdc\u7aef\u7684 Kubernetes \u96c6\u7fa4"),(0,i.kt)("p",null,"\u8fd9\u4e2a\u8bbe\u7f6e\u7684\u524d\u63d0\u662f\u4f60\u5df2\u7ecf\u5b89\u88c5\u4e86\u4e00\u4e2a\u8fdc\u7a0bKubernetes\u96c6\u7fa4\u3002\n\u5173\u4e8e\u5982\u4f55\u8bbf\u95ee\u591a\u4e2a\u96c6\u7fa4\u5e76\u5c06\u5176\u6574\u5408\uff0c\u8bf7\u53c2\u8003Kubernetes\u7684",(0,i.kt)("a",{parentName:"p",href:"https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/"},"\u8bbf\u95ee\u591a\u4e2a\u96c6\u7fa4"),"\u6587\u6863\u3002"),(0,i.kt)("p",null,"\u6216\u8005\u6309\u7167\u8fd9\u4e9b\u7b80\u5316\u7684\u6b65\u9aa4\uff1a"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u4ece\u8fdc\u7a0b\u96c6\u7fa4\u83b7\u53d6Kubernetes\u7684",(0,i.kt)("inlineCode",{parentName:"li"},"config"),"\u6587\u4ef6\uff0c\u5c06\u5176\u590d\u5236\u5230\u672c\u5730\u673a\u5668\u4e0a\uff0c\u5e76\u7ed9\u5b83\u4e00\u4e2a\u552f\u4e00\u7684\u540d\u5b57\uff0c\u5373",(0,i.kt)("inlineCode",{parentName:"li"},"config-remote"),"\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u66f4\u65b0 ",(0,i.kt)("inlineCode",{parentName:"li"},"KUBECONFIG")," \u73af\u5883\u53d8\u91cf\uff08\u5982\u679c\u5df2\u8bbe\u7f6e\uff09\u3002",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"export KUBECONFIG_SAVED=$KUBECONFIG\n"))),(0,i.kt)("li",{parentName:"ol"},"\u5c06\u65b0\u6587\u4ef6\u6dfb\u52a0\u5230\u73af\u5883\u53d8\u91cf\u4e2d\u3002",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"export KUBECONFIG=$KUBECONFIG:config-remote\n"))),(0,i.kt)("li",{parentName:"ol"},"\u8fd0\u884c",(0,i.kt)("inlineCode",{parentName:"li"},"kubectl config view"),"\u547d\u4ee4\uff0c\u68c0\u67e5\u662f\u5426\u53ef\u4ee5\u8bbf\u95ee\u8fd9\u4e24\u4e2a\u914d\u7f6e\u3002"),(0,i.kt)("li",{parentName:"ol"},"\u900f\u8fc7\u4ee5\u4e0b\u547d\u4ee4\u5207\u6362\u914d\u7f6e ",(0,i.kt)("inlineCode",{parentName:"li"},"kubectl config use-context my-remote-cluster")),(0,i.kt)("li",{parentName:"ol"},"\u786e\u8ba4\u662f\u5426\u5207\u6362\u5230\u4e86\u8fdc\u7a0b\u96c6\u7fa4\u7684\u914d\u7f6e\uff1a",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-text"},"kubectl config get-contexts\nCURRENT   NAME                   CLUSTER                      AUTHINFO             NAMESPACE\n          docker-for-desktop     docker-for-desktop-cluster   docker-for-desktop\n*         my-remote-cluster      kubernetes                   kubernetes-admin\n")))),(0,i.kt)("p",null,"\u66f4\u591a\u7684\u6587\u4ef6\u53ef\u4ee5\u5728",(0,i.kt)("a",{parentName:"p",href:"https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/"},"\u8fd9\u91cc"),"\u627e\u5230\u3002"))}d.isMDXComponent=!0},41234:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/dashboard_secret-80e18f88ceb541c0d70bcd1c60176290.png"},4362:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/dashboard_token_select-a9c66b12d37a247d623e662d642b80be.png"},11103:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/docker-dektop-minikube-741c814795983ad6133a5b5b33a2f398.png"},1435:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/docker-desktop-7afa28a7972e0e8867bcab8a6a9ac614.png"},49850:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/goland_debug-bf10925ea3e1fdd82cfd32b6f4049678.jpg"}}]);