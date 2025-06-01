import React from "react";
import { html, css, define, useState, useEffect, useMemo, useRef, useStyle, useScope, useStore } from "../core/dim.ts";
import { wrapLitHtmlStory } from "../core/storybook-utils.js";

// Code Block Component for examples
const CodeBlock = ({ code, language = 'javascript', title }, { html, css, useStyle }) => {
  useStyle(css`
    .code-block {
      margin: 1.5rem 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .code-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .code-content {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      overflow-x: auto;
    }
    
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .comment { color: #6a9955; }
    .function { color: #dcdcaa; }
    .property { color: #9cdcfe; }
    .number { color: #b5cea8; }
  `);

  const highlightCode = (code) => {
    return code
      .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
      .replace(/\b(const|let|var|function|return|import|export|from|if|else)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(useState|useEffect|useMemo|useRef|useStyle|useScope|useStore|html|css|define)\b/g, '<span class="function">$1</span>')
      .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '<span class="string">$&</span>')
      .replace(/\b\d+\b/g, '<span class="number">$&</span>');
  };

  return html`
    <div class="code-block">
      <div class="code-header">${title || 'Code Example'}</div>
      <div class="code-content">
        <pre .innerHTML="${highlightCode(code)}"></pre>
      </div>
    </div>
  `;
};

// Hook Demo Component
const HookDemo = ({ hookName, description, example, demoComponent }, { html, css, useStyle, useScope }) => {
  useScope({
    'code-block': CodeBlock,
  });

  useStyle(css`
    .hook-demo {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .hook-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .hook-name {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: 'Consolas', monospace;
    }
    
    .hook-description {
      color: #6c757d;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .demo-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }
    
    .demo-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
    }
  `);

  return html`
    <div class="hook-demo">
      <h3 class="hook-title">
        <span class="hook-name">${hookName}</span>
        Hook
      </h3>
      <p class="hook-description">${description}</p>
      
      <code-block 
        title="Example Usage"
        code="${example}"
      ></code-block>
      
      <div class="demo-section">
        <div class="demo-title">🎮 Interactive Demo</div>
        ${demoComponent}
      </div>
    </div>
  `;
};

// useState Demo
const UseStateDemo = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  useStyle(css`
    .useState-demo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .demo-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .demo-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin: 0.25rem;
    }
    
    .demo-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    
    .state-display {
      background: #e7f3ff;
      padding: 0.75rem;
      border-radius: 4px;
      margin: 0.5rem 0;
      font-family: monospace;
    }
  `);

  return html`
    <div class="useState-demo">
      <div class="demo-card">
        <h4>Counter State</h4>
        <div class="state-display">count: ${count}</div>
        <button class="demo-button" @click="${() => setCount(count + 1)}">+</button>
        <button class="demo-button" @click="${() => setCount(count - 1)}">-</button>
        <button class="demo-button" @click="${() => setCount(0)}">Reset</button>
      </div>
      
      <div class="demo-card">
        <h4>Text State</h4>
        <input 
          class="demo-input"
          .value="${text}"
          @input="${(e) => setText(e.target.value)}"
          placeholder="Type something..."
        />
        <div class="state-display">text: "${text}"</div>
      </div>
    </div>
  `;
};

// useEffect Demo
const UseEffectDemo = (_, { useState, useEffect, html, css, useStyle }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    document.title = `Timer: ${seconds}s`;
    return () => {
      document.title = 'Dim Framework';
    };
  }, [seconds]);

  useStyle(css`
    .useEffect-demo {
      text-align: center;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .timer-display {
      font-size: 2rem;
      font-weight: bold;
      color: #495057;
      margin: 1rem 0;
    }
    
    .demo-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      margin: 0.5rem;
    }
    
    .stop-button {
      background: #dc3545;
    }
  `);

  return html`
    <div class="useEffect-demo">
      <div class="timer-display">${seconds}s</div>
      <p>Check your browser tab title!</p>
      <button 
        class="demo-button ${isRunning ? 'stop-button' : ''}"
        @click="${() => setIsRunning(!isRunning)}"
      >
        ${isRunning ? 'Stop' : 'Start'}
      </button>
      <button class="demo-button" @click="${() => setSeconds(0)}">Reset</button>
    </div>
  `;
};

// Component Concepts Demo
const ComponentDemo = (_, { useState, html, css, useStyle }) => {
  const [message, setMessage] = useState('Hello from Dim!');

  useStyle(css`
    .component-demo {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .demo-component {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      margin: 1rem 0;
    }
    
    .demo-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    
    .concept-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .concept-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .concept-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
  `);

  return html`
    <div class="component-demo">
      <h3>🧩 Component Architecture</h3>
      <p>Dim components are functions that return HTML templates using the <code>html</code> tagged template literal.</p>
      
      <div class="demo-component">
        <h2>${message}</h2>
        <p>This is a functional component with scoped styles!</p>
      </div>
      
      <input 
        class="demo-input"
        .value="${message}"
        @input="${(e) => setMessage(e.target.value)}"
        placeholder="Change the message..."
      />
      
      <div class="concept-grid">
        <div class="concept-card">
          <div class="concept-title">🎯 Functional</div>
          <p>Components are just functions that return HTML templates</p>
        </div>
        <div class="concept-card">
          <div class="concept-title">🔒 Scoped</div>
          <p>CSS styles are automatically scoped using Shadow DOM</p>
        </div>
        <div class="concept-card">
          <div class="concept-title">⚡ Reactive</div>
          <p>State changes automatically trigger re-renders</p>
        </div>
        <div class="concept-card">
          <div class="concept-title">🌐 Native</div>
          <p>Built on web components for maximum compatibility</p>
        </div>
      </div>
    </div>
  `;
};

// Main Core Concepts Component
const CoreConcepts = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'hook-demo': HookDemo,
    'useState-demo': UseStateDemo,
    'useEffect-demo': UseEffectDemo,
    'component-demo': ComponentDemo,
    'code-block': CodeBlock
  });

  useStyle(css`
    .core-concepts {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 16px;
    }
    
    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .page-subtitle {
      font-size: 1.125rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }
  `);

  return html`
    <div class="core-concepts">
      <div class="page-header">
        <h1 class="page-title">🎓 Core Concepts</h1>
        <p class="page-subtitle">
          Learn the fundamental building blocks of Dim: hooks, components, and reactive patterns
        </p>
      </div>
      
      <component-demo></component-demo>
      
      <hook-demo
        hookName="useState"
        description="Manages local component state. When state changes, the component automatically re-renders. Works exactly like React's useState hook."
        example="const [count, setCount] = useState(0);

// Update state
setCount(count + 1);
setCount(prev => prev + 1); // Functional update"
        demoComponent="${html`<useState-demo></useState-demo>`}"
      ></hook-demo>
      
      <hook-demo
        hookName="useEffect"
        description="Performs side effects like API calls, timers, and event listeners. Supports cleanup functions and dependency arrays for optimization."
        example="// Run once on mount
useEffect(() => {
  console.log('Component mounted');
}, []);

// Run when count changes
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);

// With cleanup
useEffect(() => {
  const timer = setInterval(() => {
    setSeconds(s => s + 1);
  }, 1000);
  
  return () => clearInterval(timer);
}, []);"
        demoComponent="${html`<useEffect-demo></useEffect-demo>`}"
      ></hook-demo>
      
      <hook-demo
        hookName="useStyle"
        description="Adds scoped CSS styles to your component using CSS-in-JS. Styles are automatically scoped to the component using Shadow DOM."
        example="useStyle(css\`
  .my-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .my-button:hover {
    transform: translateY(-2px);
  }
\`);"
        demoComponent="${html`
          <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
            <p>✨ CSS is automatically scoped to each component</p>
            <p>🎨 Use any CSS features: flexbox, grid, animations, etc.</p>
            <p>🔒 No style conflicts between components</p>
          </div>
        `}"
      ></hook-demo>
      
      <hook-demo
        hookName="useScope"
        description="Registers child components within the current component's scope. Essential for component composition and building component hierarchies."
        example="// Register child components
useScope({
  'child-component': ChildComponent,
  'another-component': AnotherComponent
});

// Now you can use them in your template
return html\`
  <div>
    <child-component></child-component>
    <another-component></another-component>
  </div>
\`;"
        demoComponent="${html`
          <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
            <p>🧩 Build complex UIs by composing smaller components</p>
            <p>📦 Keep components organized and reusable</p>
            <p>🏗️ Essential for large applications</p>
          </div>
        `}"
      ></hook-demo>
    </div>
  `;
};

// Register components
define({ tag: 'code-block', component: CodeBlock });
define({ tag: 'hook-demo', component: HookDemo });
define({ tag: 'useState-demo', component: UseStateDemo });
define({ tag: 'useEffect-demo', component: UseEffectDemo });
define({ tag: 'component-demo', component: ComponentDemo });
define({ tag: 'core-concepts', component: CoreConcepts });

export default {
  title: "Core Concepts",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Core Concepts

Understanding the fundamental building blocks of Dim is essential for building modern web applications. This section covers:

## Components
- **Functional Components**: Pure functions that return HTML templates
- **Scoped Styling**: CSS that's automatically isolated to each component
- **Reactive Rendering**: Automatic updates when state changes

## Hooks
- **useState**: Manage local component state
- **useEffect**: Handle side effects and lifecycle events
- **useStyle**: Add scoped CSS styles
- **useScope**: Register child components
- **useMemo**: Optimize expensive calculations
- **useRef**: Access DOM elements directly
- **useStore**: Persistent global state management

## Key Principles
1. **Declarative**: Describe what the UI should look like
2. **Reactive**: State changes automatically update the UI
3. **Composable**: Build complex UIs from simple components
4. **Scoped**: Styles and behavior are isolated to each component

Each concept includes interactive examples you can experiment with!
        `
      }
    }
  }
};

export const Fundamentals = {
  render: wrapLitHtmlStory(() => html`<core-concepts></core-concepts>`),
  name: "Hooks & Components",
  parameters: {
    docs: {
      description: {
        story: `
### Understanding Dim's Core Concepts

This comprehensive guide covers the essential concepts you need to master Dim development:

**🧩 Component Architecture**
- Functional components as the building blocks
- How Shadow DOM provides automatic scoping
- Component lifecycle and re-rendering

**🪝 Hook System**
- useState for reactive state management
- useEffect for side effects and cleanup
- useStyle for scoped CSS-in-JS styling
- useScope for component composition

**🎮 Interactive Learning**
- Live demos for each concept
- Code examples with syntax highlighting
- Hands-on experiments to solidify understanding

**Perfect for:**
- Developers learning Dim fundamentals
- Understanding how hooks work in practice
- Seeing the relationship between state and UI updates

Try all the interactive demos to get a feel for how each hook works!
        `
      }
    }
  }
};