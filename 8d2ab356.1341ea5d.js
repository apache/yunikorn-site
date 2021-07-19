(window.webpackJsonp=window.webpackJsonp||[]).push([[95],{150:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return s})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return p}));var r=n(2),a=n(6),o=(n(0),n(244)),i=["components"],l={id:"user_guide",title:"Get Started",slug:"/"},s={unversionedId:"get_started/user_guide",id:"version-0.10.0/get_started/user_guide",isDocsHomePage:!1,title:"Get Started",description:"\x3c!--",source:"@site/versioned_docs/version-0.10.0/get_started/get_started.md",slug:"/",permalink:"/docs/0.10.0/",version:"0.10.0",sidebar:"version-0.10.0/docs",next:{title:"Features",permalink:"/docs/0.10.0/get_started/core_features"}},c=[{value:"Install",id:"install",children:[]},{value:"Uninstall",id:"uninstall",children:[]},{value:"Access the Web UI",id:"access-the-web-ui",children:[]}],u={rightToc:c};function p(e){var t=e.components,l=Object(a.a)(e,i);return Object(o.b)("wrapper",Object(r.a)({},u,l,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Before reading this guide, we assume you either have a Kubernetes cluster, or a local Kubernetes dev environment, e.g MiniKube.\nIt is also assumed that ",Object(o.b)("inlineCode",{parentName:"p"},"kubectl")," is on your path and properly configured.\nFollow this ",Object(o.b)("a",{parentName:"p",href:"/docs/0.10.0/developer_guide/env_setup"},"guide")," on how to setup a local Kubernetes cluster using docker-desktop."),Object(o.b)("h2",{id:"install"},"Install"),Object(o.b)("p",null,"The easiest way to get started is to use our Helm Charts to deploy YuniKorn on an existing Kubernetes cluster.\nIt is recommended to use Helm 3 or later versions."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"helm repo add yunikorn  https://apache.github.io/incubator-yunikorn-release\nhelm repo update\nkubectl create namespace yunikorn\nhelm install yunikorn yunikorn/yunikorn --namespace yunikorn\n")),Object(o.b)("p",null,"By default, the helm chart will install the scheduler, web-server and the admission-controller in the cluster.\nWhen ",Object(o.b)("inlineCode",{parentName:"p"},"admission-controller")," is installed, it simply routes all traffic to YuniKorn. That means the resource scheduling\nis delegated to YuniKorn. You can disable it by setting ",Object(o.b)("inlineCode",{parentName:"p"},"embedAdmissionController")," flag to false during the helm install.  "),Object(o.b)("p",null,"Further configuration options for installing YuniKorn via Helm are available in the ",Object(o.b)("a",{parentName:"p",href:"https://hub.helm.sh/charts/yunikorn/yunikorn"},"YuniKorn Helm hub page"),"."),Object(o.b)("p",null,"If you don't want to use helm charts, you can find our step-by-step\ntutorial ",Object(o.b)("a",{parentName:"p",href:"/docs/0.10.0/developer_guide/deployment"},"here"),"."),Object(o.b)("h2",{id:"uninstall"},"Uninstall"),Object(o.b)("p",null,"Run the following command to uninstall YuniKorn:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"helm uninstall yunikorn --namespace yunikorn\n")),Object(o.b)("h2",{id:"access-the-web-ui"},"Access the Web UI"),Object(o.b)("p",null,"When the scheduler is deployed, the web UI is also deployed in a container.\nPort forwarding for the web interface on the standard port can be turned on via:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre"},"kubectl port-forward svc/yunikorn-service 9889:9889 -n yunikorn\n")),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"9889")," is the default port for web UI.\nOnce this is done, web UI will be available at: ",Object(o.b)("inlineCode",{parentName:"p"},"http://localhost:9889"),"."),Object(o.b)("p",null,Object(o.b)("img",{alt:"UI Screenshots",src:n(355).default})),Object(o.b)("p",null,"YuniKorn UI provides a centralised view for cluster resource capacity, utilization, and all application info."))}p.isMDXComponent=!0},244:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=a.a.createContext({}),u=function(e){var t=a.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return a.a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},b=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),p=u(n),b=r,m=p["".concat(i,".").concat(b)]||p[b]||d[b]||o;return n?a.a.createElement(m,l(l({ref:t},c),{},{components:n})):a.a.createElement(m,l({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=b;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var c=2;c<o;c++)i[c]=n[c];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},355:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/yk-ui-screenshots-d24de16a6a2af41a4d5ac1f488ce04a1.gif"}}]);