"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[23907],{1915:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>h,frontMatter:()=>o,metadata:()=>l,toc:()=>d});var t=i(13274),s=i(37155);const o={id:"coding_guidelines",title:"Coding Guidelines"},r="Coding Guidelines",l={type:"mdx",permalink:"/community/coding_guidelines",source:"@site/src/pages/community/coding_guidelines.md",title:"Coding Guidelines",description:"\x3c!--",frontMatter:{id:"coding_guidelines",title:"Coding Guidelines"},unlisted:!1},a={},d=[{value:"The basics",id:"the-basics",level:2},{value:"Automated checks",id:"automated-checks",level:2},{value:"Installing and running locally",id:"installing-and-running-locally",level:3},{value:"Configuration",id:"configuration",level:3},{value:"Integration in pull requests",id:"integration-in-pull-requests",level:3},{value:"False positives",id:"false-positives",level:2},{value:"GoLand IDE setup",id:"goland-ide-setup",level:2},{value:"Editor preferences",id:"editor-preferences",level:3},{value:"Inspections",id:"inspections",level:3}];function c(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"coding-guidelines",children:"Coding Guidelines"})}),"\n",(0,t.jsx)(n.h2,{id:"the-basics",children:"The basics"}),"\n",(0,t.jsxs)(n.p,{children:["GO as a language provides a build in formatter for the code: ",(0,t.jsx)(n.code,{children:"gofmt"}),".\nThe project uses the predefined format as implemented in ",(0,t.jsx)(n.code,{children:"gofmt"}),".\nThat means tabs and not spaces etc.\nRead the ",(0,t.jsx)(n.a,{href:"https://golang.org/doc/effective_go.html",children:"Effective GO"})," page for further details.\nBefore creating a pull request make sure the code at least is formatted using ",(0,t.jsx)(n.code,{children:"gofmt"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["Beside the effective GO guide follow the recommendations from the ",(0,t.jsx)(n.a,{href:"https://go.dev/wiki/CodeReviewComments",children:"CodeReviewComments"})," wiki page.\nThe wiki provides a good collection of comments from code reviews.\nMost of the comments will be checked in the automated checks described below."]}),"\n",(0,t.jsxs)(n.p,{children:["When using an IDE, like GoLand or Visual Studio Code, use the builtin options.\nMost IDEs will provide an extensive list of checks or formatting options that help formatting and point out code issues.\nSee ",(0,t.jsx)(n.a,{href:"#goland-ide-setup",children:"IDE setup"})," for a basic setup for the GoLand IDE."]}),"\n",(0,t.jsx)(n.h2,{id:"automated-checks",children:"Automated checks"}),"\n",(0,t.jsxs)(n.p,{children:["Not all code will be written using an IDE.\nEven between contributors the settings might not be the same in all installs.\nTo help keep code formatted consistently a ",(0,t.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/Lint_(software)",children:"lint"})," tool is part of the code approval."]}),"\n",(0,t.jsxs)(n.p,{children:["There are a large number of lint tools are available for Go.\nMost of the lint tools only check one specific thing.\nSome of the tools will aggregate a number of linters and provide an overview of all the issues found.\nFor the project we have chosen the ",(0,t.jsx)(n.a,{href:"https://github.com/golangci/golangci-lint",children:"golangci-lint"})," tool.\nThe tool can be run locally and will be integrated into the GitHub PR flow."]}),"\n",(0,t.jsx)(n.h3,{id:"installing-and-running-locally",children:"Installing and running locally"}),"\n",(0,t.jsxs)(n.p,{children:["Depending on your development system the instructions might differ slightly.\nFollow the ",(0,t.jsx)(n.a,{href:"https://golangci-lint.run/usage/install/#local-installation",children:"installation instructions"})," provided by the project."]}),"\n",(0,t.jsx)(n.p,{children:"After the tool is installed you can run it using the standard command line:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-shell",metastring:"script",children:"golangci-lint run\n"})}),"\n",(0,t.jsxs)(n.p,{children:["The projects still generate a number of warnings.\nThe high impact warnings have been fixed or ignored via comments, see ",(0,t.jsx)(n.a,{href:"#false-positives",children:"False positives"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["If you have been working on a new feature, or a bug fix you only want to check the files that have changed.\nYou can run the tool with the option ",(0,t.jsx)(n.code,{children:"--new"})," or ",(0,t.jsx)(n.code,{children:"--new-from-rev"})," option.\nThe ",(0,t.jsx)(n.code,{children:"--new"})," option will only check uncommitted files.\nThe ",(0,t.jsx)(n.code,{children:"--new-from-rev"})," option will check changes against a specific committed revision."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-shell",metastring:"script",children:"# for uncommitted changes\ngolangci-lint run --new\n# for committed changes against a revision\ngolangci-lint run --new-from-rev=origin/master\n"})}),"\n",(0,t.jsxs)(n.p,{children:["The make target is ",(0,t.jsx)(n.code,{children:"lint"}),":"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-shell",metastring:"script",children:"make lint\n"})}),"\n",(0,t.jsxs)(n.p,{children:["The ",(0,t.jsx)(n.code,{children:"make"})," integration checks two locations for the linter executable:"]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:(0,t.jsx)(n.code,{children:"$(go env GOPATH)/bin/"})}),"\n",(0,t.jsx)(n.li,{children:(0,t.jsx)(n.code,{children:"./bin/"})}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The location for a standard installation is slightly different for a developer and CI install.\nBy checking both locations we can run locally and during our automated builds."}),"\n",(0,t.jsxs)(n.p,{children:["The make integration uses the ",(0,t.jsx)(n.code,{children:"--new-from-rev"})," command line option.\nThe revision to check against is determined as part of the run to allow it to run on different branches and on pull requests during our CI build.\nA lint check is part of the standard CI build run for the project."]}),"\n",(0,t.jsx)(n.p,{children:"See the golangci-lint product documentation for more options and information on how to run the tool."}),"\n",(0,t.jsx)(n.h3,{id:"configuration",children:"Configuration"}),"\n",(0,t.jsx)(n.p,{children:"A predefined configuration is provided for the two projects that use them:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.a,{href:"https://github.com/apache/yunikorn-k8shim",children:"YuniKorn k8shim"}),", configuration file ",(0,t.jsx)(n.a,{href:"https://github.com/apache/yunikorn-k8shim/blob/master/.golangci.yml",children:"golangci.yml"}),"."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.a,{href:"https://github.com/apache/yunikorn-core",children:"YuniKorn core"}),", configuration file ",(0,t.jsx)(n.a,{href:"https://github.com/apache/yunikorn-core/blob/master/.golangci.yml",children:"golangci.yml"}),"."]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The web interface is a javascript project and the scheduler interface only has generated Go code and thus do not use it."}),"\n",(0,t.jsx)(n.h3,{id:"integration-in-pull-requests",children:"Integration in pull requests"}),"\n",(0,t.jsxs)(n.p,{children:["The planning is to integrate the ",(0,t.jsx)(n.code,{children:"golangci-lint"})," check into the GitHub PR flow."]}),"\n",(0,t.jsx)(n.h2,{id:"false-positives",children:"False positives"}),"\n",(0,t.jsx)(n.p,{children:"Tools are never 100% correct and neither is this one.\nCertain issue are too hard to correct or are not important enough to fix."}),"\n",(0,t.jsx)(n.p,{children:"The tool allows adding a comment to the code to ignore the issue.\nThese comments should be used sparingly as they could hide issues.\nIf they are used they should be accompanied by a comment to explain why they are used."}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-go",children:'\tvar s1 = "ignored by all linters" //nolint\n\tvar s2 = "ignored by the linter unused" //nolint:unused\n'})}),"\n",(0,t.jsxs)(n.p,{children:["Using the ",(0,t.jsx)(n.code,{children:"nolint"})," comment without a specific linter is discouraged."]}),"\n",(0,t.jsx)(n.h2,{id:"goland-ide-setup",children:"GoLand IDE setup"}),"\n",(0,t.jsx)(n.p,{children:"GoLand has a number of checks turned on by default.\nThese defaults already provide a good coverage and mark a lot of issues found by the linters as issues.\nTo extend the coverage further and help mark issues proactively check the following settings and change them to the settings as per the screenshots."}),"\n",(0,t.jsx)(n.h3,{id:"editor-preferences",children:"Editor preferences"}),"\n",(0,t.jsxs)(n.p,{children:["Open the preferences pane and go to: ",(0,t.jsx)(n.code,{children:"Editor"})," -> ",(0,t.jsx)(n.code,{children:"Code Style"})," -> ",(0,t.jsx)(n.code,{children:"Go"}),".\nThere are three tabs to configure, the first two are crucial to comply with the basic rules from ",(0,t.jsx)(n.code,{children:"gofmt"})," and ",(0,t.jsx)(n.code,{children:"goimports"}),":"]}),"\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{}),(0,t.jsx)(n.th,{})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"Tabs"}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.img,{alt:"tabs",src:i(9657).A+"",width:"747",height:"350"})})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"Imports"}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.img,{alt:"imports",src:i(2439).A+"",width:"908",height:"474"})})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"Other"}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.img,{alt:"other",src:i(48611).A+"",width:"799",height:"336"})})]})]})]}),"\n",(0,t.jsx)(n.p,{children:"The imports as configured above should create 3 groups of imports in a file when they are used:"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsx)(n.li,{children:"standard library imports"}),"\n",(0,t.jsx)(n.li,{children:"third-party imports"}),"\n",(0,t.jsx)(n.li,{children:"YuniKorn internal imports"}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"In the file it will give you an import that looks like this:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-go",children:"import (\n  // standard libraries\n\n  // third-party\n\n  // YuniKorn project imports\n)\n"})}),"\n",(0,t.jsx)(n.h3,{id:"inspections",children:"Inspections"}),"\n",(0,t.jsx)(n.p,{children:"The default inspections can be used except for one that helps highlight shadowing variables.\nShadowing can cause difficult to trace and obscure bugs in the code and should be prevented whenever possible."}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"inspections",src:i(8816).A+"",width:"742",height:"646"})})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},2439:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/goland_ide_pref_imports-cd2354a6555ffa4875c0ca47b05d6aa2.png"},8816:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/goland_ide_pref_inspections-2a09fdd866ac0d76ce6044af5f57cf4c.png"},48611:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/goland_ide_pref_other-007a1a6395a8a8092d496e049a1dcf3f.png"},9657:(e,n,i)=>{i.d(n,{A:()=>t});const t=i.p+"assets/images/goland_ide_pref_tabs-4a67a30d6d0eb572cf32cd079b051907.png"},37155:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>l});var t=i(79474);const s={},o=t.createContext(s);function r(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);