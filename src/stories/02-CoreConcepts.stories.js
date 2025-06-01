import React from "react";
import { define, html, css, useState, useEffect, useStyle, useScope } from "../core/dim.ts";

// useState Demo Component
const UseStateDemo = (props, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [items, setItems] = useState(['Item 1', 'Item 2']);

  useStyle(css`
    .state-demo-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .demo-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .demo-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .counter-display {
      font-size: 2rem;
      font-weight: bold;
      color: #029cfd;
      margin-bottom: 1rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 8px 16px;
      margin: 0.25rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0278c7;
    }

    .danger-button {
      background-color: #dc3545;
    }

    .danger-button:hover {
      background-color: #c82333;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .text-preview {
      background-color: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      min-height: 2rem;
    }

    .items-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .list-item {
      background-color: #f0f0f0;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .add-item-form {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .add-item-form input {
      flex: 1;
      margin-bottom: 0;
    }
  `);

  const addItem = () => {
    const input = document.querySelector('.new-item-input');
    if (input.value.trim()) {
      setItems([...items, input.value]);
      input.value = '';
    }
  };

  return html`
    <div class="state-demo-container">
      <h3>useState Hook Demonstration</h3>
      
      <div class="demo-section">
        <div class="demo-title">Counter Example</div>
        <div class="counter-display">${count}</div>
        <div>
          <button @click="${() => setCount(count + 1)}">Increment</button>
          <button @click="${() => setCount(count - 1)}">Decrement</button>
          <button @click="${() => setCount(0)}">Reset</button>
          <button @click="${() => setCount(prev => prev * 2)}">Double</button>
        </div>
      </div>

      <div class="demo-section">
        <div class="demo-title">Text Input Example</div>
        <input 
          type="text"
          .value="${text}"
          @input="${(e) => setText(e.target.value)}"
          placeholder="Type something..."
        />
        <div class="text-preview">${text || 'Your text will appear here...'}</div>
        <button @click="${() => setText('')}">Clear Text</button>
      </div>

      <div class="demo-section">
        <div class="demo-title">Array State Example</div>
        <ul class="items-list">
          ${items.map((item, index) => html`
            <li class="list-item">
              ${item}
              <button 
                class="danger-button" 
                @click="${() => setItems(items.filter((_, i) => i !== index))}"
              >
                Remove
              </button>
            </li>
          `)}
        </ul>
        <div class="add-item-form">
          <input 
            class="new-item-input" 
            placeholder="New item..."
            @keydown="${(e) => e.key === 'Enter' && addItem()}"
          />
          <button @click="${addItem}">Add Item</button>
        </div>
      </div>
    </div>
  `;
};

// useEffect Demo Component
const UseEffectDemo = (props, { useState, useEffect, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [mounted, setMounted] = useState(true);

  useStyle(css`
    .effect-demo-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .effect-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 2rem;
    }

    .count-display {
      font-size: 1.5rem;
      font-weight: bold;
      color: #029cfd;
    }

    .log-viewer {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .log-entry {
      margin-bottom: 0.25rem;
      padding: 0.25rem;
    }

    .log-mount { color: #4ec9b0; }
    .log-update { color: #dcdcaa; }
    .log-cleanup { color: #f48771; }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 8px 16px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0278c7;
    }

    .mount-status {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .mounted {
      background-color: #d4edda;
      color: #155724;
    }

    .unmounted {
      background-color: #f8d7da;
      color: #721c24;
    }
  `);

  const addLog = (message, type = 'update') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Effect with no dependencies - runs on every render
  useEffect(() => {
    addLog('Effect without deps ran');
  });

  // Effect with empty dependencies - runs only on mount/unmount
  useEffect(() => {
    addLog('Component mounted', 'mount');
    
    return () => {
      addLog('Component will unmount', 'cleanup');
    };
  }, []);

  // Effect with dependencies - runs when count changes
  useEffect(() => {
    addLog(`Count changed to: ${count}`, 'update');
    document.title = `Count: ${count}`;

    return () => {
      document.title = 'Dim Framework';
    };
  }, [count]);

  return html`
    <div class="effect-demo-container">
      <h3>useEffect Hook Demonstration</h3>
      
      <div class="mount-status ${mounted ? 'mounted' : 'unmounted'}">
        Component is: ${mounted ? 'MOUNTED' : 'UNMOUNTED'}
      </div>

      <div class="effect-controls">
        <div class="count-display">Count: ${count}</div>
        <button @click="${() => setCount(count + 1)}">Increment</button>
        <button @click="${() => setCount(0)}">Reset</button>
        <button @click="${() => setLogs([])}">Clear Logs</button>
      </div>

      <h4>Effect Log:</h4>
      <div class="log-viewer">
        ${logs.map(log => html`
          <div class="log-entry log-${log.type}">
            [${log.timestamp}] ${log.message}
          </div>
        `)}
      </div>
    </div>
  `;
};

// useStyle Demo Component
const UseStyleDemo = (props, { useState, html, css, useStyle }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#029cfd');

  useStyle(css`
    .style-demo-container {
      padding: 2rem;
      border: 2px solid ${primaryColor};
      border-radius: 8px;
      background-color: ${theme === 'light' ? '#f5f5f5' : '#2a2a2a'};
      color: ${theme === 'light' ? '#333' : '#fff'};
      transition: all 0.3s ease;
    }

    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .themed-card {
      background: ${theme === 'light' ? 'white' : '#3a3a3a'};
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)'};
    }

    .color-input {
      padding: 0.5rem;
      border: 1px solid ${theme === 'light' ? '#ddd' : '#555'};
      border-radius: 4px;
      background: ${theme === 'light' ? 'white' : '#444'};
      color: ${theme === 'light' ? '#333' : '#fff'};
    }

    .theme-button {
      background-color: ${primaryColor};
      border: none;
      border-radius: 5px;
      color: white;
      padding: 8px 16px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-button:hover {
      filter: brightness(0.9);
      transform: translateY(-2px);
    }

    .animated-box {
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, ${primaryColor}, ${theme === 'light' ? '#764ba2' : '#a855f7'});
      border-radius: 8px;
      animation: pulse 2s infinite;
      margin: 2rem auto;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .feature-card {
      padding: 1rem;
      background: ${theme === 'light' ? '#e7f3ff' : '#1e3a5f'};
      border-radius: 4px;
      text-align: center;
    }
  `);

  return html`
    <div class="style-demo-container">
      <h3>useStyle Hook Demonstration</h3>
      
      <div class="controls">
        <button 
          class="theme-button" 
          @click="${() => setTheme(theme === 'light' ? 'dark' : 'light')}"
        >
          Toggle Theme: ${theme}
        </button>
        
        <label>
          Primary Color: 
          <input 
            type="color" 
            class="color-input"
            .value="${primaryColor}"
            @input="${(e) => setPrimaryColor(e.target.value)}"
          />
        </label>
      </div>

      <div class="themed-card">
        <h4>Dynamic Styling with useStyle</h4>
        <p>This component demonstrates how styles can be dynamic and reactive.</p>
        <p>Try changing the theme or primary color to see the styles update!</p>
      </div>

      <div class="animated-box"></div>

      <div class="feature-grid">
        <div class="feature-card">
          <strong>🎨 Dynamic</strong>
          <p>Styles update with state</p>
        </div>
        <div class="feature-card">
          <strong>🔒 Scoped</strong>
          <p>No global conflicts</p>
        </div>
        <div class="feature-card">
          <strong>⚡ Fast</strong>
          <p>Optimized updates</p>
        </div>
      </div>
    </div>
  `;
};

// useScope Demo Component
const ChildComponent = ({ name, color }, { html, css, useStyle }) => {
  useStyle(css`
    .child {
      background-color: ${color};
      color: white;
      padding: 1rem;
      border-radius: 4px;
      margin: 0.5rem;
      text-align: center;
    }
  `);

  return html`<div class="child">Child: ${name}</div>`;
};

const UseScopeDemo = (props, { useState, html, css, useStyle, useScope }) => {
  const [children, setChildren] = useState([
    { id: 1, name: 'Component A', color: '#029cfd' },
    { id: 2, name: 'Component B', color: '#28a745' },
    { id: 3, name: 'Component C', color: '#dc3545' }
  ]);

  useScope({
    'child-component': ChildComponent
  });

  useStyle(css`
    .scope-demo-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .children-container {
      display: flex;
      flex-wrap: wrap;
      margin: 1rem 0;
    }

    .controls {
      margin-bottom: 1rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 8px 16px;
      margin: 0.25rem;
      font-size: 1rem;
      cursor: pointer;
    }

    button:hover {
      background-color: #0278c7;
    }

    .info-box {
      background: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
  `);

  const addChild = () => {
    const colors = ['#029cfd', '#28a745', '#dc3545', '#ffc107', '#6f42c1'];
    const newChild = {
      id: Date.now(),
      name: `Component ${String.fromCharCode(65 + children.length)}`,
      color: colors[children.length % colors.length]
    };
    setChildren([...children, newChild]);
  };

  return html`
    <div class="scope-demo-container">
      <h3>useScope Hook Demonstration</h3>
      
      <div class="controls">
        <button @click="${addChild}">Add Child Component</button>
        <button @click="${() => setChildren([])}">Clear All</button>
      </div>

      <div class="children-container">
        ${children.map(child => html`
          <child-component 
            name="${child.name}" 
            color="${child.color}"
          ></child-component>
        `)}
      </div>

      <div class="info-box">
        <p><strong>useScope</strong> allows you to register child components within the parent's scope.</p>
        <p>Current children count: ${children.length}</p>
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'use-state-demo', component: UseStateDemo });
define({ tag: 'use-effect-demo', component: UseEffectDemo });
define({ tag: 'use-style-demo', component: UseStyleDemo });
define({ tag: 'use-scope-demo', component: UseScopeDemo });

export default {
  title: "Core Concepts",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The core hooks in Dim provide the essential building blocks for creating reactive, stateful components.

## Overview

Dim's hook system is inspired by React but built on Web Components, giving you the best of both worlds:
- **Familiar API**: If you know React, you already know Dim
- **True encapsulation**: Shadow DOM provides real style isolation
- **No build step required**: Works directly in the browser
- **Lightweight**: Under 10KB gzipped

## Core Hooks

### useState
Manages local component state with automatic re-rendering on updates.

\`\`\`javascript
const [count, setCount] = useState(0);

// Direct update
setCount(5);

// Functional update
setCount(prev => prev + 1);
\`\`\`

### useEffect
Handles side effects like API calls, subscriptions, and DOM manipulation.

\`\`\`javascript
// Run on every render
useEffect(() => {
  console.log('Component rendered');
});

// Run once on mount
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);

// Run when dependencies change
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
\`\`\`

### useStyle
Adds scoped CSS to your component using CSS-in-JS syntax.

\`\`\`javascript
useStyle(css\`
  .my-component {
    background: linear-gradient(45deg, #029cfd, #764ba2);
    padding: 2rem;
    border-radius: 8px;
  }
  
  /* Supports all CSS features */
  @media (max-width: 768px) {
    .my-component {
      padding: 1rem;
    }
  }
\`);
\`\`\`

### useScope
Registers child components for use within the current component.

\`\`\`javascript
useScope({
  'my-button': ButtonComponent,
  'my-card': CardComponent
});

// Now use in your template
return html\`
  <my-card>
    <my-button>Click me</my-button>
  </my-card>
\`;
\`\`\`

## Best Practices

1. **State Management**: Keep state as local as possible
2. **Effects**: Always clean up subscriptions and timers
3. **Styling**: Leverage scoped styles for true component isolation
4. **Composition**: Use useScope to build complex UIs from simple parts
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const StateManagement = {
  render: () => <use-state-demo />,
  name: "useState Hook",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates various patterns for managing component state including primitives, objects, and arrays."
      }
    }
  }
};

export const SideEffects = {
  render: () => <use-effect-demo />,
  name: "useEffect Hook",
  parameters: {
    docs: {
      description: {
        story: "Shows how to handle side effects, cleanup functions, and dependency arrays for optimal performance."
      }
    }
  }
};

export const ScopedStyling = {
  render: () => <use-style-demo />,
  name: "useStyle Hook",
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing dynamic styling with CSS-in-JS and automatic scoping via Shadow DOM."
      }
    }
  }
};

export const ComponentComposition = {
  render: () => <use-scope-demo />,
  name: "useScope Hook",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates how to compose complex UIs by registering and using child components dynamically."
      }
    }
  }
};