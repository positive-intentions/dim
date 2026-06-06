"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[508],{"./src/stories/01-GettingStarted.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{UseStoreDemo:()=>UseStoreDemo,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_01_GettingStarted_stories});var react=__webpack_require__("./node_modules/react/index.js");(0,__webpack_require__("./src/core/dim.ts").E8)({tag:"crypto-test-store-demo",component:(props,{useStore,useState,css,html,useEffect,useStyle})=>{useStyle(css`
    .crypto-test {
      padding: 20px;
      border: 1px solid #ccc;
      margin: 20px;
    }
    .status {
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
      cursor: pointer;
      background: #029cfd;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover {
      background: #0278c7;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .error {
      color: red;
      margin: 10px 0;
    }
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
    }
  `);const[testData,setTestData]=useState("Initial encrypted data"),[counter,setCounter]=useState(0),[objectData,setObjectData]=useState({name:"test",value:123}),store=useStore({testData:[testData,setTestData],counter:[counter,setCounter],objectData:[objectData,setObjectData]}),[isLoading,setIsLoading]=useState(!1),[error,setError]=useState(null),getCurrentValue=key=>store[key]&&Array.isArray(store[key])&&store[key].length>0?store[key][0]:null,getSetter=key=>store[key]&&Array.isArray(store[key])&&store[key].length>1?store[key][1]:null;return useEffect((()=>{setIsLoading(!0);const timer=setTimeout((()=>{setIsLoading(!1),console.log("Store demo ready")}),1e3);return()=>clearTimeout(timer)}),[]),html`
    <div class="crypto-test">
      <h2>Crypto Test with Store (Demo)</h2>
      
      ${error?html`<div class="error">Error: ${error}</div>`:""}
      
      <div class="status">
        <h3>Current Values:</h3>
        <p>
          <strong>Test Data:</strong> 
          ${isLoading?"Loading...":getCurrentValue("testData")||"No data"}
        </p>
        <p>
          <strong>Counter:</strong> 
          ${isLoading?"Loading...":getCurrentValue("counter")??0}
        </p>
        <p>
          <strong>Object Data:</strong>
          ${isLoading?"Loading...":html`<pre>${JSON.stringify(getCurrentValue("objectData")||{},null,2)}</pre>`}
        </p>
      </div>
      
      <div>
        <button @click="${()=>{try{const setter=getSetter("testData");if(!setter)throw new Error("testData setter not available");const newValue=`Updated at ${(new Date).toISOString()}`;setter(newValue),console.log("Updated testData to:",newValue),setError(null)}catch(err){console.error("Failed to update testData:",err),setError(err.message)}}}" ?disabled="${isLoading}">Update Test Data</button>
        <button @click="${()=>{try{const setter=getSetter("counter");if(!setter)throw new Error("counter setter not available");const newValue=(getCurrentValue("counter")||0)+1;setter(newValue),console.log("Incremented counter to:",newValue),setError(null)}catch(err){console.error("Failed to increment counter:",err),setError(err.message)}}}" ?disabled="${isLoading}">Increment Counter</button>
        <button @click="${()=>{try{const setter=getSetter("objectData");if(!setter)throw new Error("objectData setter not available");const newValue={name:`Object ${getCurrentValue("counter")||0}`,value:1e3*Math.random(),timestamp:(new Date).toISOString()};setter(newValue),console.log("Updated objectData to:",newValue),setError(null)}catch(err){console.error("Failed to update objectData:",err),setError(err.message)}}}" ?disabled="${isLoading}">Update Object</button>
      </div>
      
      <div class="status">
        <p><strong>Store Status:</strong> ${isLoading?"Loading...":"Ready"}</p>
        <p><em>This demo uses encrypted store with safe error handling</em></p>
        <p><em>Check console and IndexedDB for encrypted values</em></p>
      </div>
    </div>
  `}});const _01_GettingStarted_stories={title:"Getting Started",parameters:{layout:"fullscreen",docs:{description:{component:"\n# Getting Started with Dim\n\nDim is a web components framework with a React-like API — `useState`, `useEffect`, `useStyle`, `useStore`, and more.\n\n## Where to go next\n\n- **Demo/Shopping App** — Full navigable e-commerce demo with view transitions, persistent cart, and checkout flow\n- **Demo/Messaging App** — Navigable messaging UI with shared-element transitions\n- **API Reference** — Complete hook and component documentation\n- **useTransition()** — View transition gallery and examples\n\n## useStore demo\n\nThe story below demonstrates encrypted, persistent global state with `useStore`.\nFor a complete application walkthrough, start with **Demo/Shopping App**.\n        "}}},tags:["autodocs"]},UseStoreDemo={render:()=>react.createElement("crypto-test-store-demo"),name:"useStore - Encrypted State Management",parameters:{docs:{description:{story:"Demonstrates the useStore hook for global state management with automatic encryption and persistence.\n\nThe store encrypts data at rest in IndexedDB and provides reactive state updates across components.\nCheck the console and IndexedDB in DevTools to see the encrypted values."}}}},__namedExportsOrder=["UseStoreDemo"];UseStoreDemo.parameters={...UseStoreDemo.parameters,docs:{...UseStoreDemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("crypto-test-store-demo"),\n  name: "useStore - Encrypted State Management",\n  parameters: {\n    docs: {\n      description: {\n        story: `Demonstrates the useStore hook for global state management with automatic encryption and persistence.\n\nThe store encrypts data at rest in IndexedDB and provides reactive state updates across components.\nCheck the console and IndexedDB in DevTools to see the encrypted values.`\n      }\n    }\n  }\n}',...UseStoreDemo.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-01-GettingStarted-stories.5f8c83ea.iframe.bundle.js.map