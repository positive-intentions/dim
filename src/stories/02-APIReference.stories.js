import React from "react";
import { define, html, css, useState, useEffect, useStyle, useScope, useMemo, useRef, useStore, unsafeCSS } from "../core/dim.ts";

// useState Demo
const UseStateDemo = (props, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [items, setItems] = useState(['Item 1', 'Item 2']);

  useStyle(css`
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
  `);

  const addItem = () => {
    const newItem = `Item ${items.length + 1}`;
    setItems([...items, newItem]);
  };

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return html`
    <div class="state-demo">
      <div class="demo-section">
        <div class="demo-label">Counter State</div>
        <div>Count: ${count}</div>
        <button @click="${() => setCount(count + 1)}">+</button>
        <button @click="${() => setCount(count - 1)}">-</button>
        <button @click="${() => setCount(0)}">Reset</button>
      </div>
      
      <div class="demo-section">
        <div class="demo-label">Text State</div>
        <input 
          .value="${text}"
          @input="${(e) => setText(e.target.value)}"
          placeholder="Type something..."
        />
        <div>You typed: ${text}</div>
      </div>
      
      <div class="demo-section">
        <div class="demo-label">Array State</div>
        ${items.map((item, index) => html`
          <div class="list-item">
            ${item}
            <button class="delete-btn" @click="${() => deleteItem(index)}">Delete</button>
          </div>
        `)}
        <button @click="${addItem}">Add Item</button>
      </div>
    </div>
  `;
};

// useEffect Demo
const UseEffectDemo = (props, { useState, useEffect, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);

  useStyle(css`
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
  `);

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `Effect ran at ${timestamp}`]);
    
    return () => {
      console.log('Cleanup function called');
    };
  }, [count]);

  return html`
    <div class="effect-demo">
      <div class="controls">
        <span>Count: ${count}</span>
        <button @click="${() => setCount(count + 1)}">Increment</button>
        <button @click="${() => setLogs([])}">Clear Logs</button>
      </div>
      
      <div class="log-viewer">
        ${logs.map(log => html`<div class="log-entry">${log}</div>`)}
      </div>
    </div>
  `;
};

// useStyle Demo
const UseStyleDemo = (props, { useState, html, css, useStyle, useEffect }) => {
  const [theme, setTheme] = useState('light');
  const [color, setColor] = useState('#029cfd');

  // Re-apply styles when theme or color changes
  useEffect(() => {
    console.log('updated color')
    useStyle(css`
      .style-demo {
        padding: 2rem;
        border: 2px solid ${unsafeCSS(color)};
        border-radius: 8px;
        background-color: ${unsafeCSS(theme === 'light' ? '#f5f5f5' : '#2a2a2a')};
        color: ${unsafeCSS(theme === 'light' ? '#333' : '#fff')};
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
    `);
  }, [theme, color]);

  return html`
    <div class="style-demo">
      <div class="controls">
        <button @click="${() => setTheme(theme === 'light' ? 'dark' : 'light')}">
          Toggle Theme: ${theme}
        </button>
        
        <label>
          Pick Color: 
          <input 
            type="color"
            .value="${color}"
            @input="${(e) => setColor(e.target.value)}"
            @change="${(e) => setColor(e.target.value)}"
          />
        </label>
      </div>

      <div class="demo-box"></div>
      
      <p>Styles update dynamically with state changes!</p>
    </div>
  `;
};

// useScope Demo
const UseScopeDemo = (props, { html, css, useStyle, useScope }) => {
  const ChildComponent = ({ name, color }, { html, css, useStyle }) => {
    useStyle(css`
      .child {
        padding: 0.75rem;
        background: ${unsafeCSS(color)};
        color: white;
        border-radius: 4px;
        margin: 0.25rem;
        text-align: center;
      }
    `);
    return html`<div class="child">Child: ${name}</div>`;
  };

  useScope({
    'demo-child': ChildComponent
  });

  useStyle(css`
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
  `);

  return html`
    <div class="scope-demo">
      <p>Parent component with scoped children:</p>
      <div class="children-container">
        <demo-child name="Component A" color="#029cfd"></demo-child>
        <demo-child name="Component B" color="#28a745"></demo-child>
        <demo-child name="Component C" color="#dc3545"></demo-child>
      </div>
    </div>
  `;
};

// useMemo Demo
const UseMemoDemo = (props, { useState, useMemo, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);

  const expensiveResult = useMemo(() => {
    console.log('Computing expensive result...');
    return count * multiplier * 100;
  }, [count, multiplier]);

  useStyle(css`
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
  `);

  return html`
    <div class="memo-demo">
      <div class="controls">
        <span>Count: ${count}</span>
        <button @click="${() => setCount(count + 1)}">+</button>
      </div>
      
      <div class="controls">
        <span>Multiplier: ${multiplier}</span>
        <button @click="${() => setMultiplier(multiplier + 1)}">+</button>
      </div>
      
      <div class="result">
        Memoized Result: ${expensiveResult}
      </div>
      <small>Check console to see when computation runs</small>
    </div>
  `;
};

// useRef Demo
const UseRefDemo = (props, { useRef, html, css, useStyle }) => {
  const inputRef = useRef();
  const countRef = useRef(0);

  useStyle(css`
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
  `);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const incrementRef = () => {
    countRef.current += 1;
    console.log('Ref count:', countRef.current);
  };

  return html`
    <div class="ref-demo">
      <div class="demo-section">
        <h4>DOM Reference</h4>
        <input ref="${inputRef}" placeholder="Click button to focus" />
        <button @click="${focusInput}">Focus Input</button>
      </div>
      
      <div class="demo-section">
        <h4>Mutable Reference</h4>
        <button @click="${incrementRef}">
          Increment Ref (check console)
        </button>
        <div class="info">
          Ref values persist without causing re-renders. Current ref count is logged to console.
        </div>
      </div>
    </div>
  `;
};

// useStore Demo
const UseStoreDemo = (props, { html, css, useStyle, useStore, useState }) => {
  const { 
    user: [user, setUser],
    theme: [theme, setTheme] 
  } = useStore({
    user: useState({ name: 'John Doe' }),
    theme: useState('light')
  });

  useStyle(css`
    .store-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: ${unsafeCSS(theme === 'light' ? '#f5f5f5' : '#2a2a2a')};
      color: ${unsafeCSS(theme === 'light' ? '#333' : '#fff')};
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
  `);

  return html`
    <div class="store-demo">
      <div class="info">
        <strong>Global State (persisted)</strong>
        <p>User: ${user?.name}</p>
        <p>Theme: ${theme}</p>
      </div>
      
      <input 
        .value="${user?.name || ''}"
        @input="${(e) => setUser({ ...user, name: e.target.value })}"
        placeholder="Change username"
      />
      
      <button @click="${() => setTheme(theme === 'light' ? 'dark' : 'light')}">
        Toggle Theme
      </button>
      
      <small>This state persists across page reloads!</small>
    </div>
  `;
};

// Define components
define({ tag: 'usestate-demo', component: UseStateDemo });
define({ tag: 'useeffect-demo', component: UseEffectDemo });
define({ tag: 'usestyle-demo', component: UseStyleDemo });
define({ tag: 'usescope-demo', component: UseScopeDemo });
define({ tag: 'usememo-demo', component: UseMemoDemo });
define({ tag: 'useref-demo', component: UseRefDemo });
define({ tag: 'usestore-demo', component: UseStoreDemo });

export default {
  title: "API Reference",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Complete API documentation for all Dim hooks with interactive examples.

## 🪝 Available Hooks

Dim provides React-like hooks for building functional web components:

- **useState** - Local component state management  
- **useEffect** - Side effects and lifecycle
- **useStyle** - Scoped CSS-in-JS styling
- **useScope** - Component composition
- **useMemo** - Memoized computations
- **useRef** - DOM references and mutable values
- **useStore** - Global persistent state

Each hook includes live examples and detailed documentation below.
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const UseState = {
  render: () => <usestate-demo />,
  name: "useState",
  parameters: {
    docs: {
      description: {
        story: `
Manages local component state with automatic re-rendering on updates.

### Basic Usage

\`\`\`javascript
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: 'John' });

// Update state
setCount(count + 1);
setCount(prev => prev + 1); // Functional update

// Update object state  
setUser({ ...user, age: 30 });
\`\`\`

### Key Features

- **Automatic re-rendering** when state changes
- **Functional updates** for state based on previous value
- **Any data type** - primitives, objects, arrays
- **Multiple state variables** per component

### Best Practices

1. Keep state as local as possible
2. Use functional updates for state that depends on previous value
3. Don't mutate state directly - always create new objects/arrays
        `
      }
    }
  }
};

export const UseEffect = {
  render: () => <useeffect-demo />,
  name: "useEffect", 
  parameters: {
    docs: {
      description: {
        story: `
Performs side effects in components like API calls, subscriptions, and DOM manipulation.

### Basic Usage

\`\`\`javascript
// Run once on mount
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);

// Run when dependencies change
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);

// Run on every render
useEffect(() => {
  console.log('Component rendered');
});
\`\`\`

### Cleanup Functions

Always clean up subscriptions, timers, and event listeners:

\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
\`\`\`

### Dependency Array

- **Empty array []**: Run once on mount/unmount
- **With dependencies [a, b]**: Run when dependencies change  
- **No array**: Run on every render
        `
      }
    }
  }
};

export const UseStyle = {
  render: () => <usestyle-demo />,
  name: "useStyle",
  parameters: {
    docs: {
      description: {
        story: `
Adds scoped CSS styles to components using CSS-in-JS with automatic isolation via Shadow DOM.

### Basic Usage

\`\`\`javascript
useStyle(css\`
  .my-component {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 2rem;
    border-radius: 8px;
  }
  
  /* Dynamic styles with interpolation */
  .theme {
    background: \${isDark ? '#333' : '#fff'};
    color: \${isDark ? '#fff' : '#333'};
  }
\`);
\`\`\`

### Advanced Features

\`\`\`javascript
// Media queries
useStyle(css\`
  @media (max-width: 768px) {
    .component { padding: 1rem; }
  }
\`);

// Animations
useStyle(css\`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .fade { animation: fadeIn 0.3s ease; }
\`);
\`\`\`

### Benefits

- **Automatic scoping** - no CSS conflicts
- **Dynamic styles** - update with component state
- **Full CSS support** - pseudo-selectors, media queries, animations
- **Performance** - styles are optimized and cached
        `
      }
    }
  }
};

export const UseScope = {
  render: () => <usescope-demo />,
  name: "useScope",
  parameters: {
    docs: {
      description: {
        story: `
Registers child components within the current component's scope for composition.

### Basic Usage

\`\`\`javascript
// Define child components
const Button = ({ label }, { html }) => {
  return html\`<button>\${label}</button>\`;
};

const Card = ({ title }, { html }) => {
  return html\`<div class="card">\${title}</div>\`;
};

// Register in parent scope
useScope({
  'my-button': Button,
  'my-card': Card
});

// Use in template
return html\`
  <div>
    <my-card title="Hello"></my-card>
    <my-button label="Click me"></my-button>
  </div>
\`;
\`\`\`

### Component Hierarchies

\`\`\`javascript
// Nested component structure
const App = (props, { useScope, html }) => {
  useScope({
    'header': Header,
    'sidebar': Sidebar, 
    'main-content': MainContent
  });
  
  return html\`
    <div class="app">
      <header></header>
      <div class="layout">
        <sidebar></sidebar>
        <main-content></main-content>
      </div>
    </div>
  \`;
};
\`\`\`

### Best Practices

1. Keep component hierarchies shallow when possible
2. Use descriptive component names
3. Group related components together
4. Avoid deeply nested scopes
        `
      }
    }
  }
};

export const UseMemo = {
  render: () => <usememo-demo />,
  name: "useMemo",
  parameters: {
    docs: {
      description: {
        story: `
Memoizes expensive computations and only recalculates when dependencies change.

### Basic Usage

\`\`\`javascript
const expensiveValue = useMemo(() => {
  // Expensive calculation
  return items.reduce((sum, item) => {
    return sum + complexCalculation(item);
  }, 0);
}, [items]); // Only recalculate when items change
\`\`\`

### Multiple Dependencies

\`\`\`javascript
const filteredData = useMemo(() => {
  return data
    .filter(item => item.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [data, category]);
\`\`\`

### When to Use

- **Expensive calculations** that run on every render
- **Complex data transformations** 
- **Object/array creation** that causes unnecessary re-renders
- **Derived state** based on multiple values

### When NOT to Use

- Simple calculations (may be slower than just computing)
- Values that change on every render anyway
- Premature optimization without measuring performance

### Performance Tips

1. Only memoize genuinely expensive operations
2. Ensure dependencies array is accurate
3. Profile before and after to measure impact
        `
      }
    }
  }
};

export const UseRef = {
  render: () => <useref-demo />,
  name: "useRef", 
  parameters: {
    docs: {
      description: {
        story: `
Creates mutable references that persist across renders without triggering re-renders.

### DOM References

\`\`\`javascript
const inputRef = useRef();

const focusInput = () => {
  inputRef.current?.focus();
};

return html\`
  <input ref="\${inputRef}" />
  <button @click="\${focusInput}">Focus</button>
\`;
\`\`\`

### Mutable Values

\`\`\`javascript
const countRef = useRef(0);
const timerRef = useRef(null);

const startTimer = () => {
  timerRef.current = setInterval(() => {
    countRef.current += 1;
    console.log(countRef.current);
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerRef.current);
};
\`\`\`

### Common Use Cases

- **DOM element access** - focus, scroll, measure
- **Instance variables** - timers, subscriptions  
- **Previous values** - storing previous props/state
- **Avoiding re-renders** - mutable values that don't affect UI

### Key Differences from State

- **No re-renders** when value changes
- **Synchronous updates** - immediately available
- **Persists** across renders like state
- **Mutable** - can modify .current directly
        `
      }
    }
  }
};

export const UseStore = {
  render: () => <usestore-demo />,
  name: "useStore",
  parameters: {
    docs: {
      description: {
        story: `
Manages global state that persists across page reloads and is shared between components.

### Basic Usage

\`\`\`javascript
const {
  user: [user, setUser],
  settings: {
    theme: [theme, setTheme],
    language: [language, setLanguage]
  }
} = useStore({
  user: null,
  settings: {
    theme: 'light',
    language: 'en'
  }
});

// Update store values
setUser({ id: 1, name: 'John' });
setTheme('dark');
\`\`\`

### Nested State Structure

\`\`\`javascript
const store = useStore({
  auth: {
    user: null,
    isLoggedIn: false
  },
  ui: {
    sidebarOpen: false,
    notifications: []
  },
  data: {
    posts: [],
    comments: {}
  }
});

// Access nested values
const [user, setUser] = store.auth.user;
const [posts, setPosts] = store.data.posts;
\`\`\`

### Persistence

- **Automatic persistence** - survives page reloads
- **localStorage integration** - works across browser sessions
- **Shared state** - accessible from any component
- **Type-safe** - maintains structure and types

### Best Practices

1. Use for truly global state (user auth, app settings)
2. Keep local state in useState when possible  
3. Structure store logically by feature/domain
4. Don't store sensitive data (it's persisted to localStorage)
        `
      }
    }
  }
};