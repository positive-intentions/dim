"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[137],{"./src/stories/02-APIReference.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{UseEffect:()=>UseEffect,UseMemo:()=>UseMemo,UseRef:()=>UseRef,UseScope:()=>UseScope,UseState:()=>UseState,UseStore:()=>UseStore,UseStyle:()=>UseStyle,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/core/dim.ts");(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"usestate-demo",component:(props,{useState,html,css,useStyle})=>{const[count,setCount]=useState(0),[text,setText]=useState(""),[items,setItems]=useState(["Item 1","Item 2"]);useStyle(css`
    .state-demo {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .demo-section {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .demo-label {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }

    button:hover {
      background: #0278c7;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      margin-bottom: 0.25rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .delete-btn {
      background: #dc3545;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    }

    .delete-btn:hover {
      background: #c82333;
    }
  `);return html`
    <div class="state-demo">
      <div class="demo-section">
        <div class="demo-label">Counter State</div>
        <div>Count: ${count}</div>
        <button @click="${()=>setCount(count+1)}">+</button>
        <button @click="${()=>setCount(count-1)}">-</button>
        <button @click="${()=>setCount(0)}">Reset</button>
      </div>
      
      <div class="demo-section">
        <div class="demo-label">Text State</div>
        <input 
          .value="${text}"
          @input="${e=>setText(e.target.value)}"
          placeholder="Type something..."
        />
        <div>You typed: ${text}</div>
      </div>
      
      <div class="demo-section">
        <div class="demo-label">Array State</div>
        ${items.map(((item,index)=>html`
          <div class="list-item">
            ${item}
            <button class="delete-btn" @click="${()=>(index=>{setItems(items.filter(((_,i)=>i!==index)))})(index)}">Delete</button>
          </div>
        `))}
        <button @click="${()=>{const newItem=`Item ${items.length+1}`;setItems([...items,newItem])}}">Add Item</button>
      </div>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"useeffect-demo",component:(props,{useState,useEffect,html,css,useStyle})=>{const[count,setCount]=useState(0),[logs,setLogs]=useState([]);return useStyle(css`
    .effect-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #0278c7;
    }

    .log-viewer {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .log-entry {
      margin-bottom: 0.25rem;
    }
  `),useEffect((()=>{const timestamp=(new Date).toLocaleTimeString();return setLogs((prev=>[...prev,`Effect ran at ${timestamp}`])),()=>{console.log("Cleanup function called")}}),[count]),html`
    <div class="effect-demo">
      <div class="controls">
        <span>Count: ${count}</span>
        <button @click="${()=>setCount(count+1)}">Increment</button>
        <button @click="${()=>setLogs([])}">Clear Logs</button>
      </div>
      
      <div class="log-viewer">
        ${logs.map((log=>html`<div class="log-entry">${log}</div>`))}
      </div>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"usestyle-demo",component:(props,{useState,html,css,useStyle,unsafeCSS})=>{const[theme,setTheme]=useState("light"),[color,setColor]=useState("#029cfd");return useStyle(css`
    .style-demo {
      padding: 2rem;
      border: 2px solid ${unsafeCSS(color)};
      border-radius: 8px;
      background-color: ${unsafeCSS("light"===theme?"#f5f5f5":"#2a2a2a")};
      color: ${unsafeCSS("light"===theme?"#333":"#fff")};
      transition: all 0.3s ease;
    }

    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    button {
      background: ${unsafeCSS(color)};
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      filter: brightness(0.9);
    }

    .demo-box {
      width: 100px;
      height: 100px;
      background: ${unsafeCSS(color)};
      border-radius: 8px;
      margin: 1rem 0;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    input[type="color"] {
      margin-left: 0.5rem;
    }
  `),html`
    <div class="style-demo">
      <div class="controls">
        <button @click="${()=>setTheme("light"===theme?"dark":"light")}">
          Toggle Theme: ${theme}
        </button>
        
        <label>
          Pick Color: 
          <input 
            type="color"
            .value="${color}"
            @input="${e=>setColor(e.target.value)}"
            @change="${e=>setColor(e.target.value)}"
          />
        </label>
      </div>

      <div class="demo-box"></div>
      
      <p>Styles update dynamically with state changes!</p>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"usescope-demo",component:(props,{html,css,useStyle,useScope})=>(useScope({"demo-child":({name,color},{html,css,useStyle})=>(useStyle(css`
      .child {
        padding: 0.75rem;
        background: ${(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.iz)(color)};
        color: white;
        border-radius: 4px;
        margin: 0.25rem;
        text-align: center;
      }
    `),html`<div class="child">Child: ${name}</div>`)}),useStyle(css`
    .scope-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .children-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `),html`
    <div class="scope-demo">
      <p>Parent component with scoped children:</p>
      <div class="children-container">
        <demo-child name="Component A" color="#029cfd"></demo-child>
        <demo-child name="Component B" color="#28a745"></demo-child>
        <demo-child name="Component C" color="#dc3545"></demo-child>
      </div>
    </div>
  `)}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"usememo-demo",component:(props,{useState,useMemo,html,css,useStyle})=>{const[count,setCount]=useState(0),[multiplier,setMultiplier]=useState(2),expensiveResult=useMemo((()=>(console.log("Computing expensive result..."),count*multiplier*100)),[count,multiplier]);return useStyle(css`
    .memo-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #0278c7;
    }

    .result {
      padding: 1rem;
      background: #e7f3ff;
      border-radius: 4px;
      font-weight: 600;
      margin: 1rem 0;
    }
  `),html`
    <div class="memo-demo">
      <div class="controls">
        <span>Count: ${count}</span>
        <button @click="${()=>setCount(count+1)}">+</button>
      </div>
      
      <div class="controls">
        <span>Multiplier: ${multiplier}</span>
        <button @click="${()=>setMultiplier(multiplier+1)}">+</button>
      </div>
      
      <div class="result">
        Memoized Result: ${expensiveResult}
      </div>
      <small>Check console to see when computation runs</small>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"useref-demo",component:(props,{useRef,html,css,useStyle})=>{const inputRef=useRef(),countRef=useRef(0);useStyle(css`
    .ref-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .demo-section {
      margin-bottom: 1.5rem;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 0.5rem;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #0278c7;
    }

    .info {
      background: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
  `);return html`
    <div class="ref-demo">
      <div class="demo-section">
        <h4>DOM Reference</h4>
        <input ref="${inputRef}" placeholder="Click button to focus" />
        <button @click="${()=>{inputRef.current?.focus()}}">Focus Input</button>
      </div>
      
      <div class="demo-section">
        <h4>Mutable Reference</h4>
        <button @click="${()=>{countRef.current+=1,console.log("Ref count:",countRef.current)}}">
          Increment Ref (check console)
        </button>
        <div class="info">
          Ref values persist without causing re-renders. Current ref count is logged to console.
        </div>
      </div>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"usestore-demo",component:(props,{html,css,useStyle,useStore,useState})=>{const{user:[user,setUser],theme:[theme,setTheme]}=useStore({user:useState({name:"John Doe"}),theme:useState("light")});return useStyle(css`
    .store-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: ${(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.iz)("light"===theme?"#f5f5f5":"#2a2a2a")};
      color: ${(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.iz)("light"===theme?"#333":"#fff")};
      transition: all 0.3s ease;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 1rem;
      width: 100%;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    button:hover {
      background: #0278c7;
    }

    .info {
      padding: 1rem;
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `),html`
    <div class="store-demo">
      <div class="info">
        <strong>Global State (persisted)</strong>
        <p>User: ${user?.name}</p>
        <p>Theme: ${theme}</p>
      </div>
      
      <input 
        .value="${user?.name||""}"
        @input="${e=>setUser({...user,name:e.target.value})}"
        placeholder="Change username"
      />
      
      <button @click="${()=>setTheme("light"===theme?"dark":"light")}">
        Toggle Theme
      </button>
      
      <small>This state persists across page reloads!</small>
    </div>
  `}});const __WEBPACK_DEFAULT_EXPORT__={title:"API Reference",parameters:{layout:"centered",docs:{description:{component:"\nComplete API documentation for all Dim hooks with interactive examples.\n\n## 🪝 Available Hooks\n\nDim provides React-like hooks for building functional web components:\n\n- **useState** - Local component state management  \n- **useEffect** - Side effects and lifecycle\n- **useStyle** - Scoped CSS-in-JS styling\n- **useScope** - Component composition\n- **useMemo** - Memoized computations\n- **useRef** - DOM references and mutable values\n- **useStore** - Global persistent state\n\nEach hook includes live examples and detailed documentation below.\n        "}}},tags:["autodocs"]},UseState={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("usestate-demo"),name:"useState",parameters:{docs:{description:{story:"\nManages local component state with automatic re-rendering on updates.\n\n### Basic Usage\n\n```javascript\nconst [count, setCount] = useState(0);\nconst [user, setUser] = useState({ name: 'John' });\n\n// Update state\nsetCount(count + 1);\nsetCount(prev => prev + 1); // Functional update\n\n// Update object state  \nsetUser({ ...user, age: 30 });\n```\n\n### Key Features\n\n- **Automatic re-rendering** when state changes\n- **Functional updates** for state based on previous value\n- **Any data type** - primitives, objects, arrays\n- **Multiple state variables** per component\n\n### Best Practices\n\n1. Keep state as local as possible\n2. Use functional updates for state that depends on previous value\n3. Don't mutate state directly - always create new objects/arrays\n        "}}}},UseEffect={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("useeffect-demo"),name:"useEffect",parameters:{docs:{description:{story:"\nPerforms side effects in components like API calls, subscriptions, and DOM manipulation.\n\n### Basic Usage\n\n```javascript\n// Run once on mount\nuseEffect(() => {\n  console.log('Component mounted');\n  return () => console.log('Component unmounted');\n}, []);\n\n// Run when dependencies change\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n\n// Run on every render\nuseEffect(() => {\n  console.log('Component rendered');\n});\n```\n\n### Cleanup Functions\n\nAlways clean up subscriptions, timers, and event listeners:\n\n```javascript\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.log('Tick');\n  }, 1000);\n  \n  return () => clearInterval(timer);\n}, []);\n```\n\n### Dependency Array\n\n- **Empty array []**: Run once on mount/unmount\n- **With dependencies [a, b]**: Run when dependencies change  \n- **No array**: Run on every render\n        "}}}},UseStyle={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("usestyle-demo"),name:"useStyle",parameters:{docs:{description:{story:"\nAdds scoped CSS styles to components using CSS-in-JS with automatic isolation via Shadow DOM.\n\n### Basic Usage\n\n```javascript\nuseStyle(css`\n  .my-component {\n    background: linear-gradient(135deg, #667eea, #764ba2);\n    padding: 2rem;\n    border-radius: 8px;\n  }\n  \n  /* Dynamic styles with interpolation */\n  .theme {\n    background: ${isDark ? '#333' : '#fff'};\n    color: ${isDark ? '#fff' : '#333'};\n  }\n`);\n```\n\n### Advanced Features\n\n```javascript\n// Media queries\nuseStyle(css`\n  @media (max-width: 768px) {\n    .component { padding: 1rem; }\n  }\n`);\n\n// Animations\nuseStyle(css`\n  @keyframes fadeIn {\n    from { opacity: 0; }\n    to { opacity: 1; }\n  }\n  \n  .fade { animation: fadeIn 0.3s ease; }\n`);\n```\n\n### Benefits\n\n- **Automatic scoping** - no CSS conflicts\n- **Dynamic styles** - update with component state\n- **Full CSS support** - pseudo-selectors, media queries, animations\n- **Performance** - styles are optimized and cached\n        "}}}},UseScope={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("usescope-demo"),name:"useScope",parameters:{docs:{description:{story:"\nRegisters child components within the current component's scope for composition.\n\n### Basic Usage\n\n```javascript\n// Define child components\nconst Button = ({ label }, { html }) => {\n  return html`<button>${label}</button>`;\n};\n\nconst Card = ({ title }, { html }) => {\n  return html`<div class=\"card\">${title}</div>`;\n};\n\n// Register in parent scope\nuseScope({\n  'my-button': Button,\n  'my-card': Card\n});\n\n// Use in template\nreturn html`\n  <div>\n    <my-card title=\"Hello\"></my-card>\n    <my-button label=\"Click me\"></my-button>\n  </div>\n`;\n```\n\n### Component Hierarchies\n\n```javascript\n// Nested component structure\nconst App = (props, { useScope, html }) => {\n  useScope({\n    'header': Header,\n    'sidebar': Sidebar, \n    'main-content': MainContent\n  });\n  \n  return html`\n    <div class=\"app\">\n      <header></header>\n      <div class=\"layout\">\n        <sidebar></sidebar>\n        <main-content></main-content>\n      </div>\n    </div>\n  `;\n};\n```\n\n### Best Practices\n\n1. Keep component hierarchies shallow when possible\n2. Use descriptive component names\n3. Group related components together\n4. Avoid deeply nested scopes\n        "}}}},UseMemo={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("usememo-demo"),name:"useMemo",parameters:{docs:{description:{story:"\nMemoizes expensive computations and only recalculates when dependencies change.\n\n### Basic Usage\n\n```javascript\nconst expensiveValue = useMemo(() => {\n  // Expensive calculation\n  return items.reduce((sum, item) => {\n    return sum + complexCalculation(item);\n  }, 0);\n}, [items]); // Only recalculate when items change\n```\n\n### Multiple Dependencies\n\n```javascript\nconst filteredData = useMemo(() => {\n  return data\n    .filter(item => item.category === category)\n    .sort((a, b) => a.name.localeCompare(b.name));\n}, [data, category]);\n```\n\n### When to Use\n\n- **Expensive calculations** that run on every render\n- **Complex data transformations** \n- **Object/array creation** that causes unnecessary re-renders\n- **Derived state** based on multiple values\n\n### When NOT to Use\n\n- Simple calculations (may be slower than just computing)\n- Values that change on every render anyway\n- Premature optimization without measuring performance\n\n### Performance Tips\n\n1. Only memoize genuinely expensive operations\n2. Ensure dependencies array is accurate\n3. Profile before and after to measure impact\n        "}}}},UseRef={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("useref-demo"),name:"useRef",parameters:{docs:{description:{story:'\nCreates mutable references that persist across renders without triggering re-renders.\n\n### DOM References\n\n```javascript\nconst inputRef = useRef();\n\nconst focusInput = () => {\n  inputRef.current?.focus();\n};\n\nreturn html`\n  <input ref="${inputRef}" />\n  <button @click="${focusInput}">Focus</button>\n`;\n```\n\n### Mutable Values\n\n```javascript\nconst countRef = useRef(0);\nconst timerRef = useRef(null);\n\nconst startTimer = () => {\n  timerRef.current = setInterval(() => {\n    countRef.current += 1;\n    console.log(countRef.current);\n  }, 1000);\n};\n\nconst stopTimer = () => {\n  clearInterval(timerRef.current);\n};\n```\n\n### Common Use Cases\n\n- **DOM element access** - focus, scroll, measure\n- **Instance variables** - timers, subscriptions  \n- **Previous values** - storing previous props/state\n- **Avoiding re-renders** - mutable values that don\'t affect UI\n\n### Key Differences from State\n\n- **No re-renders** when value changes\n- **Synchronous updates** - immediately available\n- **Persists** across renders like state\n- **Mutable** - can modify .current directly\n        '}}}},UseStore={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("usestore-demo"),name:"useStore",parameters:{docs:{description:{story:"\nManages global state that persists across page reloads and is shared between components.\n\n### Basic Usage\n\n```javascript\nconst {\n  user: [user, setUser],\n  settings: {\n    theme: [theme, setTheme],\n    language: [language, setLanguage]\n  }\n} = useStore({\n  user: null,\n  settings: {\n    theme: 'light',\n    language: 'en'\n  }\n});\n\n// Update store values\nsetUser({ id: 1, name: 'John' });\nsetTheme('dark');\n```\n\n### Nested State Structure\n\n```javascript\nconst store = useStore({\n  auth: {\n    user: null,\n    isLoggedIn: false\n  },\n  ui: {\n    sidebarOpen: false,\n    notifications: []\n  },\n  data: {\n    posts: [],\n    comments: {}\n  }\n});\n\n// Access nested values\nconst [user, setUser] = store.auth.user;\nconst [posts, setPosts] = store.data.posts;\n```\n\n### Persistence\n\n- **Automatic persistence** - survives page reloads\n- **localStorage integration** - works across browser sessions\n- **Shared state** - accessible from any component\n- **Type-safe** - maintains structure and types\n\n### Best Practices\n\n1. Use for truly global state (user auth, app settings)\n2. Keep local state in useState when possible  \n3. Structure store logically by feature/domain\n4. Don't store sensitive data (it's persisted to localStorage)\n        "}}}},__namedExportsOrder=["UseState","UseEffect","UseStyle","UseScope","UseMemo","UseRef","UseStore"];UseState.parameters={...UseState.parameters,docs:{...UseState.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('usestate-demo'),\n  name: \"useState\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nManages local component state with automatic re-rendering on updates.\n\n### Basic Usage\n\n\\`\\`\\`javascript\nconst [count, setCount] = useState(0);\nconst [user, setUser] = useState({ name: 'John' });\n\n// Update state\nsetCount(count + 1);\nsetCount(prev => prev + 1); // Functional update\n\n// Update object state  \nsetUser({ ...user, age: 30 });\n\\`\\`\\`\n\n### Key Features\n\n- **Automatic re-rendering** when state changes\n- **Functional updates** for state based on previous value\n- **Any data type** - primitives, objects, arrays\n- **Multiple state variables** per component\n\n### Best Practices\n\n1. Keep state as local as possible\n2. Use functional updates for state that depends on previous value\n3. Don't mutate state directly - always create new objects/arrays\n        `\n      }\n    }\n  }\n}",...UseState.parameters?.docs?.source}}},UseEffect.parameters={...UseEffect.parameters,docs:{...UseEffect.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('useeffect-demo'),\n  name: \"useEffect\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nPerforms side effects in components like API calls, subscriptions, and DOM manipulation.\n\n### Basic Usage\n\n\\`\\`\\`javascript\n// Run once on mount\nuseEffect(() => {\n  console.log('Component mounted');\n  return () => console.log('Component unmounted');\n}, []);\n\n// Run when dependencies change\nuseEffect(() => {\n  document.title = \\`Count: \\${count}\\`;\n}, [count]);\n\n// Run on every render\nuseEffect(() => {\n  console.log('Component rendered');\n});\n\\`\\`\\`\n\n### Cleanup Functions\n\nAlways clean up subscriptions, timers, and event listeners:\n\n\\`\\`\\`javascript\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.log('Tick');\n  }, 1000);\n  \n  return () => clearInterval(timer);\n}, []);\n\\`\\`\\`\n\n### Dependency Array\n\n- **Empty array []**: Run once on mount/unmount\n- **With dependencies [a, b]**: Run when dependencies change  \n- **No array**: Run on every render\n        `\n      }\n    }\n  }\n}",...UseEffect.parameters?.docs?.source}}},UseStyle.parameters={...UseStyle.parameters,docs:{...UseStyle.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('usestyle-demo'),\n  name: \"useStyle\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nAdds scoped CSS styles to components using CSS-in-JS with automatic isolation via Shadow DOM.\n\n### Basic Usage\n\n\\`\\`\\`javascript\nuseStyle(css\\`\n  .my-component {\n    background: linear-gradient(135deg, #667eea, #764ba2);\n    padding: 2rem;\n    border-radius: 8px;\n  }\n  \n  /* Dynamic styles with interpolation */\n  .theme {\n    background: \\${isDark ? '#333' : '#fff'};\n    color: \\${isDark ? '#fff' : '#333'};\n  }\n\\`);\n\\`\\`\\`\n\n### Advanced Features\n\n\\`\\`\\`javascript\n// Media queries\nuseStyle(css\\`\n  @media (max-width: 768px) {\n    .component { padding: 1rem; }\n  }\n\\`);\n\n// Animations\nuseStyle(css\\`\n  @keyframes fadeIn {\n    from { opacity: 0; }\n    to { opacity: 1; }\n  }\n  \n  .fade { animation: fadeIn 0.3s ease; }\n\\`);\n\\`\\`\\`\n\n### Benefits\n\n- **Automatic scoping** - no CSS conflicts\n- **Dynamic styles** - update with component state\n- **Full CSS support** - pseudo-selectors, media queries, animations\n- **Performance** - styles are optimized and cached\n        `\n      }\n    }\n  }\n}",...UseStyle.parameters?.docs?.source}}},UseScope.parameters={...UseScope.parameters,docs:{...UseScope.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('usescope-demo'),\n  name: \"useScope\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nRegisters child components within the current component's scope for composition.\n\n### Basic Usage\n\n\\`\\`\\`javascript\n// Define child components\nconst Button = ({ label }, { html }) => {\n  return html\\`<button>\\${label}</button>\\`;\n};\n\nconst Card = ({ title }, { html }) => {\n  return html\\`<div class=\"card\">\\${title}</div>\\`;\n};\n\n// Register in parent scope\nuseScope({\n  'my-button': Button,\n  'my-card': Card\n});\n\n// Use in template\nreturn html\\`\n  <div>\n    <my-card title=\"Hello\"></my-card>\n    <my-button label=\"Click me\"></my-button>\n  </div>\n\\`;\n\\`\\`\\`\n\n### Component Hierarchies\n\n\\`\\`\\`javascript\n// Nested component structure\nconst App = (props, { useScope, html }) => {\n  useScope({\n    'header': Header,\n    'sidebar': Sidebar, \n    'main-content': MainContent\n  });\n  \n  return html\\`\n    <div class=\"app\">\n      <header></header>\n      <div class=\"layout\">\n        <sidebar></sidebar>\n        <main-content></main-content>\n      </div>\n    </div>\n  \\`;\n};\n\\`\\`\\`\n\n### Best Practices\n\n1. Keep component hierarchies shallow when possible\n2. Use descriptive component names\n3. Group related components together\n4. Avoid deeply nested scopes\n        `\n      }\n    }\n  }\n}",...UseScope.parameters?.docs?.source}}},UseMemo.parameters={...UseMemo.parameters,docs:{...UseMemo.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('usememo-demo'),\n  name: \"useMemo\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nMemoizes expensive computations and only recalculates when dependencies change.\n\n### Basic Usage\n\n\\`\\`\\`javascript\nconst expensiveValue = useMemo(() => {\n  // Expensive calculation\n  return items.reduce((sum, item) => {\n    return sum + complexCalculation(item);\n  }, 0);\n}, [items]); // Only recalculate when items change\n\\`\\`\\`\n\n### Multiple Dependencies\n\n\\`\\`\\`javascript\nconst filteredData = useMemo(() => {\n  return data\n    .filter(item => item.category === category)\n    .sort((a, b) => a.name.localeCompare(b.name));\n}, [data, category]);\n\\`\\`\\`\n\n### When to Use\n\n- **Expensive calculations** that run on every render\n- **Complex data transformations** \n- **Object/array creation** that causes unnecessary re-renders\n- **Derived state** based on multiple values\n\n### When NOT to Use\n\n- Simple calculations (may be slower than just computing)\n- Values that change on every render anyway\n- Premature optimization without measuring performance\n\n### Performance Tips\n\n1. Only memoize genuinely expensive operations\n2. Ensure dependencies array is accurate\n3. Profile before and after to measure impact\n        `\n      }\n    }\n  }\n}",...UseMemo.parameters?.docs?.source}}},UseRef.parameters={...UseRef.parameters,docs:{...UseRef.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'useref-demo\'),\n  name: "useRef",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nCreates mutable references that persist across renders without triggering re-renders.\n\n### DOM References\n\n\\`\\`\\`javascript\nconst inputRef = useRef();\n\nconst focusInput = () => {\n  inputRef.current?.focus();\n};\n\nreturn html\\`\n  <input ref="\\${inputRef}" />\n  <button @click="\\${focusInput}">Focus</button>\n\\`;\n\\`\\`\\`\n\n### Mutable Values\n\n\\`\\`\\`javascript\nconst countRef = useRef(0);\nconst timerRef = useRef(null);\n\nconst startTimer = () => {\n  timerRef.current = setInterval(() => {\n    countRef.current += 1;\n    console.log(countRef.current);\n  }, 1000);\n};\n\nconst stopTimer = () => {\n  clearInterval(timerRef.current);\n};\n\\`\\`\\`\n\n### Common Use Cases\n\n- **DOM element access** - focus, scroll, measure\n- **Instance variables** - timers, subscriptions  \n- **Previous values** - storing previous props/state\n- **Avoiding re-renders** - mutable values that don\'t affect UI\n\n### Key Differences from State\n\n- **No re-renders** when value changes\n- **Synchronous updates** - immediately available\n- **Persists** across renders like state\n- **Mutable** - can modify .current directly\n        `\n      }\n    }\n  }\n}',...UseRef.parameters?.docs?.source}}},UseStore.parameters={...UseStore.parameters,docs:{...UseStore.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('usestore-demo'),\n  name: \"useStore\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nManages global state that persists across page reloads and is shared between components.\n\n### Basic Usage\n\n\\`\\`\\`javascript\nconst {\n  user: [user, setUser],\n  settings: {\n    theme: [theme, setTheme],\n    language: [language, setLanguage]\n  }\n} = useStore({\n  user: null,\n  settings: {\n    theme: 'light',\n    language: 'en'\n  }\n});\n\n// Update store values\nsetUser({ id: 1, name: 'John' });\nsetTheme('dark');\n\\`\\`\\`\n\n### Nested State Structure\n\n\\`\\`\\`javascript\nconst store = useStore({\n  auth: {\n    user: null,\n    isLoggedIn: false\n  },\n  ui: {\n    sidebarOpen: false,\n    notifications: []\n  },\n  data: {\n    posts: [],\n    comments: {}\n  }\n});\n\n// Access nested values\nconst [user, setUser] = store.auth.user;\nconst [posts, setPosts] = store.data.posts;\n\\`\\`\\`\n\n### Persistence\n\n- **Automatic persistence** - survives page reloads\n- **localStorage integration** - works across browser sessions\n- **Shared state** - accessible from any component\n- **Type-safe** - maintains structure and types\n\n### Best Practices\n\n1. Use for truly global state (user auth, app settings)\n2. Keep local state in useState when possible  \n3. Structure store logically by feature/domain\n4. Don't store sensitive data (it's persisted to localStorage)\n        `\n      }\n    }\n  }\n}",...UseStore.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-02-APIReference-stories.57de513a.iframe.bundle.js.map