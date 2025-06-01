import React from "react";
import { html, css, define, useState, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Reuse components from previous tutorial
const CodeBlock = ({ code, language = 'javascript', title }, { html, css, useStyle }) => {
  useStyle(css`
    .code-block {
      margin: 1.5rem 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
    }
    
    .code-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .code-title {
      font-weight: 600;
    }
    
    .language-badge {
      background: rgba(255,255,255,0.15);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .code-content {
      background: #1e1e1e;
      padding: 1.5rem;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      position: relative;
    }
    
    .code-text {
      color: #d4d4d4;
      white-space: pre;
    }
    
    /* Syntax highlighting */
    .keyword { color: #569cd6; font-weight: 500; }
    .string { color: #ce9178; }
    .number { color: #b5cea8; }
    .comment { color: #6a9955; font-style: italic; }
    .function { color: #dcdcaa; }
    .property { color: #9cdcfe; }
    .operator { color: #d4d4d4; }
    .template-literal { color: #ce9178; }
    .template-expression { color: #ffd700; background: rgba(255,215,0,0.1); }
    
    .copy-button {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }
    
    .copy-button:hover {
      background: rgba(255,255,255,0.2);
    }
  `);
  
  const highlightCode = (code) => {
    // First escape HTML to prevent injection
    let escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    if (language === 'html') {
      return escapedCode
        .replace(/(&lt;!DOCTYPE[^&]*&gt;)/g, '<span class="keyword">$1</span>')
        .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/g, '$1<span class="tag">$2</span>')
        .replace(/\s([a-zA-Z-]+)(=)/g, ' <span class="attr-name">$1</span><span class="operator">$2</span>')
        .replace(/=(&quot;[^&]*&quot;|&#039;[^&]*&#039;)/g, '=<span class="string">$1</span>')
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>');
    }
    
    if (language === 'css') {
      return escapedCode
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
        .replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="property">$1</span>$2')
        .replace(/(:)([^;{]+)/g, '$1<span class="string">$2</span>')
        .replace(/(\{|\}|;)/g, '<span class="punctuation">$1</span>')
        .replace(/([.#][a-zA-Z-]+)/g, '<span class="keyword">$1</span>');
    }
    
    if (language === 'bash') {
      return escapedCode
        .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
        .replace(/\b(mkdir|cd|touch|npm|npx|python|serve|ls|pwd|cp|mv|rm)\b/g, '<span class="keyword">$1</span>')
        .replace(/(-[a-zA-Z-]+)/g, '<span class="operator">$1</span>');
    }
    
    // JavaScript highlighting
    return escapedCode
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
      .replace(/(`[^`]*`)/g, '<span class="template-literal">$1</span>')
      .replace(/(&#039;[^&#039;]*&#039;|&quot;[^&]*&quot;)/g, '<span class="string">$1</span>')
      .replace(/(\$\{[^}]*\})/g, '<span class="template-expression">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
      .replace(/\b(const|let|var|function|class|if|else|for|while|do|switch|case|default|break|continue|return|import|export|from|as|async|await|try|catch|finally|throw|new|this|super|extends|static|get|set|typeof|instanceof|in|of|delete|void)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span>')
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '.<span class="property">$1</span>')
      .replace(/([+\-*/%=!&lt;&gt;&amp;|?:;,])/g, '<span class="operator">$1</span>');
  };
  
  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Code copied to clipboard');
    });
  };
  
  return html`
    <div class="code-block">
      <div class="code-header">
        <div class="code-title">${title || 'Code Example'}</div>
        <span class="language-badge">${language}</span>
      </div>
      <div class="code-content">
        <button class="copy-button" @click="${copyCode}" title="Copy code">
          📋 Copy
        </button>
        <div class="code-text" .innerHTML="${highlightCode(code)}"></div>
      </div>
    </div>
  `;
};

const TutorialNav = (_, { html, css, useStyle }) => {
  useStyle(css`
    .tutorial-nav {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    
    .nav-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .nav-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .nav-link {
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 8px;
      color: white;
      transition: all 0.3s;
      border: 1px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    
    .nav-link:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .nav-link.current {
      background: rgba(255,255,255,0.3);
      border-color: rgba(255,255,255,0.5);
    }
    
    .nav-number {
      background: rgba(255,255,255,0.2);
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: bold;
    }
  `);
  
  const navigateToStory = (storyId) => {
    window.location.href = `${window.location.origin}${window.location.pathname}?path=/story/${storyId}`;
  };
  
  return html`
    <div class="tutorial-nav">
      <div class="nav-title">📚 Step-by-Step Tutorial Navigation</div>
      <div class="nav-links">
        <button 
          class="nav-link"
          @click="${() => navigateToStory('tutorial-step-by-step--project-setup')}"
        >
          <span class="nav-number">1</span>
          Project Setup
        </button>
        <button 
          class="nav-link current"
          @click="${() => navigateToStory('tutorial-step-by-step--first-component')}"
        >
          <span class="nav-number">2</span>
          First Component
        </button>
        <button 
          class="nav-link"
          @click="${() => navigateToStory('tutorial-step-by-step--adding-interactivity')}"
        >
          <span class="nav-number">3</span>
          Adding Interactivity
        </button>
        <button 
          class="nav-link"
          @click="${() => navigateToStory('tutorial-step-by-step--task-item')}"
        >
          <span class="nav-number">4</span>
          Task Item Component
        </button>
        <button 
          class="nav-link"
          @click="${() => navigateToStory('tutorial-step-by-step--task-form')}"
        >
          <span class="nav-number">5</span>
          Task Form
        </button>
        <button 
          class="nav-link"
          @click="${() => navigateToStory('tutorial-step-by-step--complete-app')}"
        >
          <span class="nav-number">6</span>
          Complete App
        </button>
      </div>
    </div>
  `;
};

// Live Preview Component
const LivePreview = ({ children }, { html, css, useStyle, renderChildren }) => {
  useStyle(css`
    .live-preview {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      margin: 2rem 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .preview-header {
      background: linear-gradient(135deg, #11998e, #38ef7d);
      color: white;
      padding: 1rem 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .preview-content {
      padding: 2rem;
      min-height: 200px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `);
  
  return html`
    <div class="live-preview">
      <div class="preview-header">
        ✨ Live Preview
      </div>
      <div class="preview-content">
        ${renderChildren(children)}
      </div>
    </div>
  `;
};

// Sample component for the preview
const GreetingComponent = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  
  useStyle(css`
    .greeting {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    
    .greeting h1 {
      color: #667eea;
      margin-bottom: 1rem;
    }
    
    .counter {
      font-size: 2rem;
      font-weight: bold;
      color: #495057;
      margin: 1rem 0;
    }
    
    .button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0 0.5rem;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
  `);
  
  return html`
    <div class="greeting">
      <h1>Welcome to Dim!</h1>
      <p>This is your first component.</p>
      <div class="counter">Count: ${count}</div>
      <button class="button" @click="${() => setCount(count - 1)}">
        -
      </button>
      <button class="button" @click="${() => setCount(count + 1)}">
        +
      </button>
    </div>
  `;
};

// First Component Demo
const FirstComponentDemo = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'code-block': CodeBlock,
    'tutorial-nav': TutorialNav,
    'live-preview': LivePreview,
    'greeting-component': GreetingComponent
  });
  
  useStyle(css`
    .component-demo {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .demo-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .demo-title {
      font-size: 2.5rem;
      color: #495057;
      margin-bottom: 1rem;
    }
    
    .demo-subtitle {
      font-size: 1.2rem;
      color: #6c757d;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .content-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .instruction-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1rem 1.5rem;
      border-radius: 0 8px 8px 0;
      margin: 1.5rem 0;
    }
    
    .instruction-title {
      font-weight: 600;
      color: #856404;
      margin-bottom: 0.5rem;
    }
    
    .tip-box {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
    }
    
    .tip-title {
      font-weight: 600;
      color: #0c5460;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `);
  
  return html`
    <div class="component-demo">
      <div class="demo-header">
        <h1 class="demo-title">🧩 Step 2: Your First Component</h1>
        <p class="demo-subtitle">
          Now let's create our first Dim component - a simple greeting component that demonstrates basic concepts
        </p>
      </div>
      
      <tutorial-nav></tutorial-nav>
      
      <div class="content-section">
        <h2 class="section-title">Understanding Dim Components</h2>
        
        <div class="instruction-box">
          <div class="instruction-title">🎯 Learning Goals:</div>
          <ul>
            <li>Understand Dim component structure</li>
            <li>Learn the useState hook</li>
            <li>See how to register and use components</li>
            <li>Practice event handling</li>
          </ul>
        </div>
        
        <p><strong>Step 1:</strong> Update your app.js file with the component import</p>
        
        <code-block
          title="app.js - Import Dim"
          language="javascript"
          code="// Import Dim framework functions
import { html, css, define, useState, useStyle } from './path/to/dim.ts';

// We'll add our components here"
        ></code-block>
        
        <p><strong>Step 2:</strong> Create a simple greeting component</p>
        
        <code-block
          title="app.js - First Component"
          language="javascript"
          code="// Our first component: a greeting with a counter
const GreetingComponent = (_, { useState, html, css, useStyle }) => {
  // State: current count value
  const [count, setCount] = useState(0);
  
  // Styles: scoped to this component
  useStyle(css\`
    .greeting {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 2rem auto;
    }
    
    .greeting h1 {
      color: #667eea;
      margin-bottom: 1rem;
    }
    
    .counter {
      font-size: 2rem;
      font-weight: bold;
      color: #495057;
      margin: 1rem 0;
    }
    
    .button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0 0.5rem;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
  \`);
  
  // Template: what gets rendered
  return html\`
    <div class=\"greeting\">
      <h1>Welcome to Dim!</h1>
      <p>This is your first component.</p>
      <div class=\"counter\">Count: \${count}</div>
      <button class=\"button\" @click=\"\${() => setCount(count - 1)}\">
        -
      </button>
      <button class=\"button\" @click=\"\${() => setCount(count + 1)}\">
        +
      </button>
    </div>
  \`;
};"
        ></code-block>
        
        <p><strong>Step 3:</strong> Register and use the component</p>
        
        <code-block
          title="app.js - Register Component"
          language="javascript"
          code="// Register the component with a custom HTML tag
define({ tag: 'greeting-component', component: GreetingComponent });

// Add the component to the page
document.getElementById('app').innerHTML = '<greeting-component></greeting-component>';"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">🔍 What's happening:</div>
          <ul>
            <li><code>useState(0)</code> creates reactive state that starts at 0</li>
            <li><code>useStyle(css\`...\`)</code> adds scoped CSS to this component</li>
            <li><code>@click</code> is how we handle events in Dim templates</li>
            <li><code>define()</code> registers our component as a custom HTML element</li>
          </ul>
        </div>
        
        <live-preview>
          <greeting-component></greeting-component>
        </live-preview>
        
        <div class="instruction-box">
          <div class="instruction-title">🎉 Congratulations!</div>
          <p>You've created your first Dim component! Try clicking the buttons in the preview above to see the reactive state in action.</p>
        </div>
        
        <div class="instruction-box">
          <div class="instruction-title">🎯 Next Step:</div>
          <p>Now let's add more interactivity to our component with useEffect and more complex state! Click "Adding Interactivity" in the navigation above to continue.</p>
        </div>
      </div>
    </div>
  `;
};

define({ tag: 'code-block', component: CodeBlock });
define({ tag: 'tutorial-nav', component: TutorialNav });
define({ tag: 'live-preview', component: LivePreview });
define({ tag: 'greeting-component', component: GreetingComponent });
define({ tag: 'first-component-demo', component: FirstComponentDemo });

export default {
  title: "Tutorial/Step-by-Step",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Step 2: Your First Component

Learn how to create your first Dim component with state management and event handling.

## What You'll Learn

- Component structure and syntax
- Using the useState hook for reactive state
- Scoped styling with useStyle
- Event handling with @click
- Component registration and usage

## Component Features

The greeting component we'll build includes:
- Interactive counter with buttons
- Beautiful styling with CSS-in-JS
- Reactive state updates
- Hover effects and animations

Perfect for understanding the fundamentals of Dim components!
        `
      }
    }
  }
};

export const FirstComponent = {
  render: wrapLitHtmlStory(() => html`<first-component-demo></first-component-demo>`),
  name: "2. First Component",
  parameters: {
    docs: {
      description: {
        story: `
### Creating Your First Dim Component

This step builds on the project setup from Step 1 and introduces you to the core concepts of Dim components.

**🎯 Learning Objectives:**
- Understand the anatomy of a Dim component
- Learn useState for reactive state management
- Practice scoped CSS styling with useStyle
- Handle user interactions with event handlers
- Register components for use in HTML

**🧩 Component Architecture:**
Dim components are functions that receive props and hooks as parameters:
\`\`\`javascript
const MyComponent = (props, hooks) => {
  // Component logic here
  return html\`<div>Component template</div>\`;
};
\`\`\`

**🔄 Reactive State:**
The useState hook provides reactive state that automatically updates the UI when changed:
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

**🎨 Scoped Styling:**
useStyle provides component-scoped CSS that doesn't affect other components:
\`\`\`javascript
useStyle(css\`
  .my-class { color: blue; }
\`);
\`\`\`

Try interacting with the live preview above to see reactive state in action!
        `
      }
    }
  }
};