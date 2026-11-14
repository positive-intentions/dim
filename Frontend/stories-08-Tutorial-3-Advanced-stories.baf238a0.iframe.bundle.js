/*! For license information please see stories-08-Tutorial-3-Advanced-stories.baf238a0.iframe.bundle.js.LICENSE.txt */
"use strict";(self.webpackChunk_positive_intentions_dim=self.webpackChunk_positive_intentions_dim||[]).push([[357],{"./src/stories/08-Tutorial-3-Advanced.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Pitfalls:()=>Pitfalls,ReactInterop:()=>ReactInterop,UnderTheHood:()=>UnderTheHood,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_08_Tutorial_3_Advanced_stories});var react=__webpack_require__("./node_modules/react/index.js"),element_define=__webpack_require__("./src/core/element/define.ts"),crypto_manager=__webpack_require__("./src/core/store/crypto-manager.js"),storage_manager=__webpack_require__("./src/core/store/storage-manager.js"),events=__webpack_require__("./src/core/store/events.js");function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_defineProperty(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function _defineProperty(e,r,t){return(r=function _toPropertyKey(t){var i=function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}(t,"string");return"symbol"==_typeof(i)?i:i+""}(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _regenerator(){var e,t,r="function"==typeof Symbol?Symbol:{},n=r.iterator||"@@iterator",o=r.toStringTag||"@@toStringTag";function i(r,n,o,i){var c=n&&n.prototype instanceof Generator?n:Generator,u=Object.create(c.prototype);return _regeneratorDefine2(u,"_invoke",function(r,n,o){var i,c,u,f=0,p=o||[],y=!1,G={p:0,n:0,v:e,a:d,f:d.bind(e,4),d:function d(t,r){return i=t,c=0,u=e,G.n=r,a}};function d(r,n){for(c=r,u=n,t=0;!y&&f&&!o&&t<p.length;t++){var o,i=p[t],d=G.p,l=i[2];r>3?(o=l===n)&&(u=i[(c=i[4])?5:(c=3,3)],i[4]=i[5]=e):i[0]<=d&&((o=r<2&&d<i[1])?(c=0,G.v=n,G.n=i[1]):d<l&&(o=r<3||i[0]>n||n>l)&&(i[4]=r,i[5]=n,G.n=l,c=0))}if(o||r>1)return a;throw y=!0,n}return function(o,p,l){if(f>1)throw TypeError("Generator is already running");for(y&&1===p&&d(p,l),c=p,u=l;(t=c<2?e:u)||!y;){i||(c?c<3?(c>1&&(G.n=-1),d(c,u)):G.n=u:G.v=u);try{if(f=2,i){if(c||(o="next"),t=i[o]){if(!(t=t.call(i,u)))throw TypeError("iterator result is not an object");if(!t.done)return t;u=t.value,c<2&&(c=0)}else 1===c&&(t=i.return)&&t.call(i),c<2&&(u=TypeError("The iterator does not provide a '"+o+"' method"),c=1);i=e}else if((t=(y=G.n<0)?u:r.call(n,G))!==a)break}catch(t){i=e,c=1,u=t}finally{f=1}}return{value:t,done:y}}}(r,o,i),!0),u}var a={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}t=Object.getPrototypeOf;var c=[][n]?t(t([][n]())):(_regeneratorDefine2(t={},n,(function(){return this})),t),u=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(c);function f(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,GeneratorFunctionPrototype):(e.__proto__=GeneratorFunctionPrototype,_regeneratorDefine2(e,o,"GeneratorFunction")),e.prototype=Object.create(u),e}return GeneratorFunction.prototype=GeneratorFunctionPrototype,_regeneratorDefine2(u,"constructor",GeneratorFunctionPrototype),_regeneratorDefine2(GeneratorFunctionPrototype,"constructor",GeneratorFunction),GeneratorFunction.displayName="GeneratorFunction",_regeneratorDefine2(GeneratorFunctionPrototype,o,"GeneratorFunction"),_regeneratorDefine2(u),_regeneratorDefine2(u,o,"Generator"),_regeneratorDefine2(u,n,(function(){return this})),_regeneratorDefine2(u,"toString",(function(){return"[object Generator]"})),(_regenerator=function _regenerator(){return{w:i,m:f}})()}function _regeneratorDefine2(e,r,n,t){var i=Object.defineProperty;try{i({},"",{})}catch(e){i=0}_regeneratorDefine2=function _regeneratorDefine(e,r,n,t){if(r)i?i(e,r,{value:n,enumerable:!t,configurable:!t,writable:!t}):e[r]=n;else{var o=function o(r,n){_regeneratorDefine2(e,r,(function(e){return this._invoke(r,n,e)}))};o("next",0),o("throw",1),o("return",2)}},_regeneratorDefine2(e,r,n,t)}function _typeof(o){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function asyncGeneratorStep(n,t,e,r,o,a,c){try{var i=n[a](c),u=i.value}catch(n){return void e(n)}i.done?t(u):Promise.resolve(u).then(r,o)}function _asyncToGenerator(n){return function(){var t=this,e=arguments;return new Promise((function(r,o){var a=n.apply(t,e);function _next(n){asyncGeneratorStep(a,r,o,_next,_throw,"next",n)}function _throw(n){asyncGeneratorStep(a,r,o,_next,_throw,"throw",n)}_next(void 0)}))}}function _slicedToArray(r,e){return function _arrayWithHoles(r){if(Array.isArray(r))return r}(r)||function _iterableToArrayLimit(r,l){var t=null==r?null:"undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(null!=t){var e,n,i,u,a=[],f=!0,o=!1;try{if(i=(t=t.call(r)).next,0===l){if(Object(t)!==t)return;f=!1}else for(;!(f=(e=i.call(t)).done)&&(a.push(e.value),a.length!==l);f=!0);}catch(r){o=!0,n=r}finally{try{if(!f&&null!=t.return&&(u=t.return(),Object(u)!==u))return}finally{if(o)throw n}}return a}}(r,e)||function _unsupportedIterableToArray(r,a){if(r){if("string"==typeof r)return _arrayLikeToArray(r,a);var t={}.toString.call(r).slice(8,-1);return"Object"===t&&r.constructor&&(t=r.constructor.name),"Map"===t||"Set"===t?Array.from(r):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(r,a):void 0}}(r,e)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n}var cryptoManagerMap=new Map,storageManagerMap=new Map;function useDimStore(_ref){var key=_ref.key,password=_ref.password,_ref$defaultValue=_ref.defaultValue,defaultValue=void 0===_ref$defaultValue?"":_ref$defaultValue;if(!password)throw new Error("useDimStore: an explicit `password` (encryption key) is required.");var _useState2=_slicedToArray((0,react.useState)(defaultValue),2),value=_useState2[0],setValue=_useState2[1],_useState4=_slicedToArray((0,react.useState)(!0),2),isLoading=_useState4[0],setIsLoading=_useState4[1],_getManagers=function getManagers(password){var cryptoManager=cryptoManagerMap.get(password),storageManager=storageManagerMap.get(password);return cryptoManager||(cryptoManager=new crypto_manager.default(password),cryptoManagerMap.set(password,cryptoManager)),storageManager||(storageManager=new storage_manager.A(cryptoManager),storageManagerMap.set(password,storageManager)),{cryptoManager,storageManager}}(password),cryptoManager=_getManagers.cryptoManager,storageManager=_getManagers.storageManager,mountedRef=(0,react.useRef)(!0),eventListenerRef=(0,react.useRef)(null),instanceIdRef=(0,react.useRef)(Math.random().toString(36).substring(2,15)),isSettingValueRef=(0,react.useRef)(!1),hasLoadedRef=(0,react.useRef)(!1);(0,react.useEffect)((function(){mountedRef.current=!0;var loadFromStorage=function(){var _ref2=_asyncToGenerator(_regenerator().m((function _callee(){var result,_value,errorMessage,_t;return _regenerator().w((function(_context){for(;;)switch(_context.n){case 0:return _context.p=0,_context.n=1,storageManager.readValue(key,null);case 1:if(result=_context.v,mountedRef.current){_context.n=2;break}return _context.a(2);case 2:if(!result||null===result.value||void 0===result.value){_context.n=3;break}if("object"!==_typeof(_value=result.value)||null===_value||!_value.encryptedData||!_value.iv){_context.n=3;break}return console.error("useDimStore: Received encrypted payload structure instead of decrypted value - password may be incorrect"),hasLoadedRef.current||isSettingValueRef.current||(setValue(defaultValue),hasLoadedRef.current=!0),mountedRef.current&&setIsLoading(!1),_context.a(2);case 3:hasLoadedRef.current||isSettingValueRef.current?hasLoadedRef.current&&result&&null!==result.value&&void 0!==result.value&&setValue(result.value):(result&&null!==result.value&&void 0!==result.value?setValue(result.value):setValue(defaultValue),hasLoadedRef.current=!0),_context.n=5;break;case 4:_context.p=4,_t=_context.v,errorMessage=_t instanceof Error?_t.message:String(_t),console.error("Failed to load from storage:",_t),(errorMessage.includes("Incorrect password")||errorMessage.includes("Decryption failed"))&&console.warn("useDimStore: Password mismatch - using default value"),mountedRef.current&&!hasLoadedRef.current&&(setValue(defaultValue),hasLoadedRef.current=!0);case 5:return _context.p=5,mountedRef.current&&setIsLoading(!1),_context.f(5);case 6:return _context.a(2)}}),_callee,null,[[0,4,5,6]])})));return function loadFromStorage(){return _ref2.apply(this,arguments)}}();loadFromStorage();var eventListener=function(){var _ref3=_asyncToGenerator(_regenerator().m((function _callee2(event){var decryptedValue,errorMessage,_t2;return _regenerator().w((function(_context2){for(;;)switch(_context2.n){case 0:if(_context2.p=0,event.detail._instanceId!==instanceIdRef.current){_context2.n=1;break}return _context2.a(2);case 1:if(!isSettingValueRef.current){_context2.n=2;break}return _context2.a(2);case 2:if(mountedRef.current){_context2.n=3;break}return _context2.a(2);case 3:return _context2.n=4,cryptoManager.decryptData(_objectSpread(_objectSpread({},event.detail),{},{crypto:cryptoManager}));case 4:if(decryptedValue=_context2.v,mountedRef.current){_context2.n=5;break}return _context2.a(2);case 5:if(!(decryptedValue&&"object"===_typeof(decryptedValue)&&decryptedValue.encryptedData&&decryptedValue.iv)){_context2.n=6;break}return console.error("useDimStore: Event decryption returned encrypted payload structure - password may be incorrect"),_context2.a(2);case 6:setValue((function(currentValue){return decryptedValue!==currentValue?decryptedValue:currentValue})),_context2.n=8;break;case 7:_context2.p=7,_t2=_context2.v,(errorMessage=_t2 instanceof Error?_t2.message:String(_t2)).includes("Incorrect password")||errorMessage.includes("Decryption failed")?console.warn("useDimStore: Failed to process event data - password mismatch"):console.error("Failed to process event data:",_t2);case 8:return _context2.a(2)}}),_callee2,null,[[0,7]])})));return function eventListener(_x){return _ref3.apply(this,arguments)}}();return window.addEventListener(key,eventListener),eventListenerRef.current=eventListener,function(){mountedRef.current=!1,eventListenerRef.current&&(window.removeEventListener(key,eventListenerRef.current),eventListenerRef.current=null)}}),[key,password,defaultValue]);var setValueAndStore=function(){var _ref4=_asyncToGenerator(_regenerator().m((function _callee3(newValue){var encryptedData,encryptedObject,_t3;return _regenerator().w((function(_context3){for(;;)switch(_context3.n){case 0:return isSettingValueRef.current=!0,setValue(newValue),_context3.p=1,_context3.n=2,cryptoManager.encryptData(newValue);case 2:return encryptedData=_context3.v,_context3.n=3,storageManager.writeValue(key,encryptedData);case 3:console.log('Stored encrypted value for key "'.concat(key,'" in IndexedDB'));try{(encryptedObject=JSON.parse(encryptedData))._instanceId=instanceIdRef.current,(0,events.t)(key,encryptedObject)}catch(error){console.error("Failed to dispatch event:",error)}_context3.n=5;break;case 4:_context3.p=4,_t3=_context3.v,console.error("Failed to store value:",_t3);case 5:return _context3.p=5,setTimeout((function(){isSettingValueRef.current=!1}),100),_context3.f(5);case 6:return _context3.a(2)}}),_callee3,null,[[1,4,5,6]])})));return function setValueAndStore(_x2){return _ref4.apply(this,arguments)}}();return[value,setValueAndStore,isLoading]}var css=__webpack_require__("./src/core/renderer/css.js");css.AH`
  :host,
  :host([data-theme="light"]) {
    --tut-bg: #ffffff;
    --tut-fg: #0f172a;
    --tut-card: #f8fafc;
    --tut-border: #e2e8f0;
    --tut-muted: #64748b;
    --tut-accent: #029cfd;
    --tut-accent-hover: #0278c7;
    --tut-danger: #dc3545;
    --tut-ok: #15803d;
    --tut-badge-bg: #e0f2fe;
    --tut-badge-fg: #075985;
  }

  :host([data-theme="dark"]) {
    --tut-bg: #0b1220;
    --tut-fg: #e2e8f0;
    --tut-card: #111827;
    --tut-border: #1f2937;
    --tut-muted: #94a3b8;
    --tut-accent: #38bdf8;
    --tut-accent-hover: #7dd3fc;
    --tut-danger: #f87171;
    --tut-ok: #4ade80;
    --tut-badge-bg: #0c4a6e;
    --tut-badge-fg: #e0f2fe;
  }
`;const lessonStyles=css.AH`
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    color: var(--tut-fg, #0f172a);
    background: var(--tut-bg, #ffffff);
    line-height: 1.45;
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    max-width: 920px;
    margin: 0 auto;
    padding: 1.25rem;
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 12px;
    background: var(--tut-bg, #fff);
    color: var(--tut-fg, #0f172a);
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tut-accent, #029cfd);
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  h1,
  h2,
  h3 {
    margin: 0 0 0.5rem;
    color: var(--tut-fg, #0f172a);
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--tut-muted, #64748b);
  }

  .try {
    margin: 0 0 1rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    background: var(--tut-card, #f8fafc);
    border: 1px dashed var(--tut-border, #e2e8f0);
    color: var(--tut-fg, #0f172a);
    font-size: 0.9rem;
  }

  .try strong {
    color: var(--tut-accent, #029cfd);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 700px) {
    .split {
      grid-template-columns: 1fr;
    }
  }

  button,
  .btn {
    background: var(--tut-accent, #029cfd);
    color: #fff;
    border: none;
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
  }

  button:hover,
  .btn:hover {
    background: var(--tut-accent-hover, #0278c7);
  }

  button:disabled,
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  button.ghost {
    background: transparent;
    color: var(--tut-fg, #0f172a);
    border: 1px solid var(--tut-border, #e2e8f0);
  }

  button.ghost:hover {
    background: var(--tut-card, #f8fafc);
  }

  button.danger {
    background: var(--tut-danger, #dc3545);
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 6px;
    font: inherit;
    background: var(--tut-bg, #fff);
    color: inherit;
  }

  textarea {
    min-height: 7rem;
    resize: vertical;
  }

  .card {
    background: var(--tut-card, #f8fafc);
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    color: var(--tut-fg, #0f172a);
  }

  .card.selected,
  .card.active {
    border-color: var(--tut-accent, #029cfd);
    box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
  }

  .card.pinned {
    border-left: 4px solid var(--tut-accent, #029cfd);
  }

  .muted {
    color: var(--tut-muted, #64748b);
    font-size: 0.85rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--tut-badge-bg, #e0f2fe);
    color: var(--tut-badge-fg, #075985);
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .note-title {
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .note-body {
    margin: 0;
    color: var(--tut-muted, #64748b);
    white-space: pre-wrap;
  }

  .status {
    font-size: 0.85rem;
    color: var(--tut-ok, #15803d);
  }

  .status.error {
    color: var(--tut-danger, #dc3545);
  }

  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8em;
    background: var(--tut-card, #f8fafc);
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 4px;
    padding: 0.05rem 0.3rem;
  }
`;const INTEROP_KEY="tutReactNote",DimNote=(0,element_define.E)({tag:"tut-react-interop-dim-note",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook})=>{style(lessonStyles);const store=storeHook({[INTEROP_KEY]:state("Hello from Dim")},{encryptionKey:"dim-tutorial"}),[text,setText,loading]=store.tutReactNote;return tpl`
      <div class="card">
        <div class="eyebrow">Dim component</div>
        <p class="muted">${loading?"Loading encrypted store…":"useStore + encryptionKey"}</p>
        <textarea
          id="dim-note"
          .value="${"string"==typeof text?text:String(text??"")}"
          @input="${e=>setText(e.target.value)}"
        ></textarea>
      </div>
    `}}),DimEcho=(0,element_define.E)({tag:"tut-react-interop-echo",component:({label},{html:tpl,css:cssFn,useStyle:style})=>(style(lessonStyles),tpl`
      <div class="card">
        <div class="eyebrow">.props from React</div>
        <p id="echo-label">${label||"(no label yet — set via element.props)"}</p>
      </div>
    `)});function TutorialReactInterop(){const[value,setValue,isLoading]=useDimStore({key:"tutReactNote",password:"dim-tutorial",defaultValue:"Hello from React"}),echoRef=(0,react.useRef)(null);return(0,react.useEffect)((()=>{echoRef.current&&(echoRef.current.props={label:`React says: ${value||""}`})}),[value]),react.createElement("div",{style:{fontFamily:"system-ui, sans-serif",maxWidth:920,margin:"0 auto",padding:20,border:"1px solid #e2e8f0",borderRadius:12}},react.createElement("div",{style:{color:"#029cfd",fontWeight:700,fontSize:12,letterSpacing:"0.08em"}},"ADVANCED · LESSON 13"),react.createElement("h2",{style:{marginTop:4}},"React interop"),react.createElement("p",{style:{margin:"0 0 1rem",padding:"0.55rem 0.75rem",borderRadius:8,background:"#f8fafc",border:"1px dashed #e2e8f0",color:"#0f172a",fontSize:"0.9rem"}},react.createElement("strong",{style:{color:"#029cfd"}},"Try: "),"Type in either textarea — they share an encrypted store key (about 200ms debounce)."),react.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},react.createElement("div",null,react.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#029cfd"}},"React"),isLoading?react.createElement("p",null,"Loading…"):react.createElement("textarea",{id:"react-note",value:value||"",onChange:e=>setValue(e.target.value),style:{width:"100%",minHeight:120,font:"inherit",padding:8}})),react.createElement(DimNote.tag)),react.createElement(DimEcho.tag,{ref:echoRef}))}const _08_Tutorial_3_Advanced_stories={title:"Tutorial/3. Advanced",parameters:{layout:"fullscreen",docs:{description:{component:"\n# Track 3 — Advanced\n\nOptional once Dim Notes works: **React interop**, how Dim stores hooks\n(no virtual DOM), and the **rules of hooks**.\n        "}}},tags:["autodocs"]},ReactInterop={render:()=>react.createElement(TutorialReactInterop),name:"13. React interop",parameters:{docs:{description:{story:'\n**Goal:** Mount Dim in React and share encrypted store data via `useDimStore`.\n\n**New words:**\n- **`useDimStore`** — React hook that talks to the same encrypted key as Dim `useStore`.\n- **`element.props`** — how React passes objects into a custom element (attributes are strings).\n- **Debounce** — store events wait ~200ms before broadcasting.\n\n**Why it matters:** You can drop a Dim notes widget into an existing React page.\n\n**Try this:**\n1. Type in the React textarea.\n2. Watch the Dim textarea (after ~200ms debounce).\n3. The echo card updates via `element.props` from a React ref.\n\n**Snippet:**\n\n```javascript\nconst ref = useRef(null);\nuseEffect(() => {\n  if (ref.current) ref.current.props = { label: value };\n}, [value]);\n\nconst [value, setValue, isLoading] = useDimStore({\n  key: "tutReactNote",\n  password: userKey, // required — no default\n  defaultValue: "",\n});\n```\n\n**Common mistake:** Passing objects through React JSX attributes — they become strings. Use `element.props`.\n\n**Next:** Lesson 14 — hook slots and the update path.\n        '}}}},UnderTheHood={render:()=>react.createElement("tut-under-the-hood"),name:"14. Under the hood",parameters:{docs:{description:{story:'\n**Goal:** See how one update flows through Dim.\n\n**New words:**\n- **Hook slot** — `hooks["hook-N"]` on the host, filled in call order.\n- **No virtual DOM** — Dim commits template parts to the real shadow tree.\n- **`requestUpdate`** — batches work in a microtask.\n\n**Why it matters:** Conditional hooks shift slot numbers and “lose” state. Knowing the path explains the rules.\n\n**Try this:**\n1. Click **Increment**.\n2. Read the inspector: render count, `hookIndex`, hook slot names.\n\n**Update path:**\n1. `requestUpdate` batches in a microtask\n2. `render()` resets `hookIndex` and runs your function\n3. Renderer commits only changed parts (`preserveFocus`)\n4. `useStyle` flushes (adopted sheet or `<style>`)\n5. `updated()` runs\n\nHooks live in numbered slots on the **host element**. React keeps a fiber tree; Dim keeps slots on the custom element and patches the shadow DOM. That is why there is no virtual DOM, and why hook order must be stable.\n\nSource maps: `src/core/renderer`, `element`, `hooks`, `store`, `transitions`, `fs`.\n\n**Common mistake:** Calling `useState` inside `if` — the next render reads the wrong slot.\n\n**Next:** Lesson 15 — immutable updates and the rest of the rules.\n        '}}}},Pitfalls={render:()=>react.createElement("tut-pitfalls"),name:"15. Pitfalls and rules of hooks",parameters:{docs:{description:{story:"\n**Goal:** Avoid the mistakes that make Dim feel “broken.”\n\n**New words:**\n- **Identity** — `Object.is(prev, next)`. Same array reference → no re-render.\n- **Rules of hooks** — same number, same order, every render.\n- **Copy then set** — `setNotes([...notes, item])`.\n\n**Why it matters:** Mutating notes in Dim Notes looks like “the button does nothing.”\n\n**Try this:**\n1. **Push (mutate)** — UI stays at 2 items.\n2. **Force re-render** — mutated data finally shows.\n3. **Push (copy)** — UI updates immediately.\n\n**Wrong / right:**\n\n```javascript\n// Wrong — same array identity, Object.is bails out\nnotes.push(item); setNotes(notes);\n\n// Right\nsetNotes([...notes, item]);\n```\n\nOther rules:\n- Never call hooks inside conditions or loops\n- Objects/functions → `.props`, not attributes\n- `useEffect` always needs a deps array and usually a cleanup\n- `useLazyScope` evaluates code — unsafe for untrusted input\n- `useRef()` with no arg → host element, not `null`\n- Boolean state (`useState(false)`) is valid — Dim preserves falsy values\n\n**Common mistake:** `notes.push` then `setNotes(notes)`. Always copy.\n\n**Next:** API Reference and the Demo apps when you want more depth.\n        "}}}},__namedExportsOrder=["ReactInterop","UnderTheHood","Pitfalls"];ReactInterop.parameters={...ReactInterop.parameters,docs:{...ReactInterop.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(TutorialReactInterop),\n  name: "13. React interop",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Goal:** Mount Dim in React and share encrypted store data via \\`useDimStore\\`.\n\n**New words:**\n- **\\`useDimStore\\`** — React hook that talks to the same encrypted key as Dim \\`useStore\\`.\n- **\\`element.props\\`** — how React passes objects into a custom element (attributes are strings).\n- **Debounce** — store events wait ~200ms before broadcasting.\n\n**Why it matters:** You can drop a Dim notes widget into an existing React page.\n\n**Try this:**\n1. Type in the React textarea.\n2. Watch the Dim textarea (after ~200ms debounce).\n3. The echo card updates via \\`element.props\\` from a React ref.\n\n**Snippet:**\n\n\\`\\`\\`javascript\nconst ref = useRef(null);\nuseEffect(() => {\n  if (ref.current) ref.current.props = { label: value };\n}, [value]);\n\nconst [value, setValue, isLoading] = useDimStore({\n  key: "tutReactNote",\n  password: userKey, // required — no default\n  defaultValue: "",\n});\n\\`\\`\\`\n\n**Common mistake:** Passing objects through React JSX attributes — they become strings. Use \\`element.props\\`.\n\n**Next:** Lesson 14 — hook slots and the update path.\n        `\n      }\n    }\n  }\n}',...ReactInterop.parameters?.docs?.source}}},UnderTheHood.parameters={...UnderTheHood.parameters,docs:{...UnderTheHood.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("tut-under-the-hood"),\n  name: "14. Under the hood",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Goal:** See how one update flows through Dim.\n\n**New words:**\n- **Hook slot** — \\`hooks["hook-N"]\\` on the host, filled in call order.\n- **No virtual DOM** — Dim commits template parts to the real shadow tree.\n- **\\`requestUpdate\\`** — batches work in a microtask.\n\n**Why it matters:** Conditional hooks shift slot numbers and “lose” state. Knowing the path explains the rules.\n\n**Try this:**\n1. Click **Increment**.\n2. Read the inspector: render count, \\`hookIndex\\`, hook slot names.\n\n**Update path:**\n1. \\`requestUpdate\\` batches in a microtask\n2. \\`render()\\` resets \\`hookIndex\\` and runs your function\n3. Renderer commits only changed parts (\\`preserveFocus\\`)\n4. \\`useStyle\\` flushes (adopted sheet or \\`<style>\\`)\n5. \\`updated()\\` runs\n\nHooks live in numbered slots on the **host element**. React keeps a fiber tree; Dim keeps slots on the custom element and patches the shadow DOM. That is why there is no virtual DOM, and why hook order must be stable.\n\nSource maps: \\`src/core/renderer\\`, \\`element\\`, \\`hooks\\`, \\`store\\`, \\`transitions\\`, \\`fs\\`.\n\n**Common mistake:** Calling \\`useState\\` inside \\`if\\` — the next render reads the wrong slot.\n\n**Next:** Lesson 15 — immutable updates and the rest of the rules.\n        `\n      }\n    }\n  }\n}',...UnderTheHood.parameters?.docs?.source}}},Pitfalls.parameters={...Pitfalls.parameters,docs:{...Pitfalls.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("tut-pitfalls"),\n  name: "15. Pitfalls and rules of hooks",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Goal:** Avoid the mistakes that make Dim feel “broken.”\n\n**New words:**\n- **Identity** — \\`Object.is(prev, next)\\`. Same array reference → no re-render.\n- **Rules of hooks** — same number, same order, every render.\n- **Copy then set** — \\`setNotes([...notes, item])\\`.\n\n**Why it matters:** Mutating notes in Dim Notes looks like “the button does nothing.”\n\n**Try this:**\n1. **Push (mutate)** — UI stays at 2 items.\n2. **Force re-render** — mutated data finally shows.\n3. **Push (copy)** — UI updates immediately.\n\n**Wrong / right:**\n\n\\`\\`\\`javascript\n// Wrong — same array identity, Object.is bails out\nnotes.push(item); setNotes(notes);\n\n// Right\nsetNotes([...notes, item]);\n\\`\\`\\`\n\nOther rules:\n- Never call hooks inside conditions or loops\n- Objects/functions → \\`.props\\`, not attributes\n- \\`useEffect\\` always needs a deps array and usually a cleanup\n- \\`useLazyScope\\` evaluates code — unsafe for untrusted input\n- \\`useRef()\\` with no arg → host element, not \\`null\\`\n- Boolean state (\\`useState(false)\\`) is valid — Dim preserves falsy values\n\n**Common mistake:** \\`notes.push\\` then \\`setNotes(notes)\\`. Always copy.\n\n**Next:** API Reference and the Demo apps when you want more depth.\n        `\n      }\n    }\n  }\n}',...Pitfalls.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-08-Tutorial-3-Advanced-stories.baf238a0.iframe.bundle.js.map