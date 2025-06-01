import React from "react";
import { html, css, define, useState, useEffect, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Reuse components from previous tutorials
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
    
    .code-title { font-weight: 600; }
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
    
    .code-text { color: #d4d4d4; white-space: pre; }
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
    
    .copy-button:hover { background: rgba(255,255,255,0.2); }
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
        <button class="copy-button" @click="${copyCode}" title="Copy code">📋 Copy</button>
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
        <button class="nav-link" @click="${() => navigateToStory('tutorial-step-by-step--project-setup')}">
          <span class="nav-number">1</span>Project Setup
        </button>
        <button class="nav-link" @click="${() => navigateToStory('tutorial-step-by-step--first-component')}">
          <span class="nav-number">2</span>First Component
        </button>
        <button class="nav-link current" @click="${() => navigateToStory('tutorial-step-by-step--adding-interactivity')}">
          <span class="nav-number">3</span>Adding Interactivity
        </button>
        <button class="nav-link" @click="${() => navigateToStory('tutorial-step-by-step--task-item')}">
          <span class="nav-number">4</span>Task Item Component
        </button>
        <button class="nav-link" @click="${() => navigateToStory('tutorial-step-by-step--task-form')}">
          <span class="nav-number">5</span>Task Form
        </button>
        <button class="nav-link" @click="${() => navigateToStory('tutorial-step-by-step--complete-app')}">
          <span class="nav-number">6</span>Complete App
        </button>
      </div>
    </div>
  `;
};

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
      min-height: 250px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `);
  
  return html`
    <div class="live-preview">
      <div class="preview-header">✨ Live Preview</div>
      <div class="preview-content">${renderChildren(children)}</div>
    </div>
  `;
};

// Enhanced Interactive Component
const InteractiveGreeting = (_, { useState, useEffect, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('Hello');
  
  useEffect(() => {
    document.title = `Count: ${count} - My Dim App`;
  }, [count]);
  
  useEffect(() => {
    if (count >= 10) {
      setGreeting('Wow! Amazing!');
    } else if (count >= 5) {
      setGreeting('Great job!');
    } else if (count < 0) {
      setGreeting('Going backwards?');
    } else {
      setGreeting('Hello');
    }
  }, [count]);
  
  useStyle(css`
    .interactive-greeting {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    
    .dynamic-greeting {
      font-size: 1.5rem;
      color: #667eea;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    
    .counter-display {
      font-size: 3rem;
      font-weight: bold;
      color: ${count >= 10 ? '#38ef7d' : count < 0 ? '#ff416c' : '#495057'};
      margin: 1rem 0;
      transition: color 0.3s ease;
    }
    
    .name-input {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      margin: 1rem;
      font-size: 1rem;
      width: 200px;
    }
    
    .name-input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .button-group {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    
    .btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: #6c757d;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }
  `);
  
  const displayName = name || 'Friend';
  
  return html`
    <div class="interactive-greeting">
      <h1 class="dynamic-greeting">${greeting}, ${displayName}!</h1>
      <div class="counter-display">${count}</div>
      
      <input
        type="text"
        class="name-input"
        placeholder="Enter your name"
        .value="${name}"
        @input="${(e) => setName(e.target.value)}"
      />
      
      <div class="button-group">
        <button class="btn" @click="${() => setCount(count - 1)}">
          Decrease (-1)
        </button>
        <button class="btn btn-secondary" @click="${() => setCount(0)}">
          Reset
        </button>
        <button class="btn" @click="${() => setCount(count + 1)}">
          Increase (+1)
        </button>
        <button class="btn" @click="${() => setCount(count + 5)}">
          Jump (+5)
        </button>
      </div>
      
      <p style="margin-top: 2rem; color: #6c757d; font-size: 0.875rem;">
        Watch the page title and greeting change as you interact!
      </p>
    </div>
  `;
};

// Adding Interactivity Demo
const AddingInteractivityDemo = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'code-block': CodeBlock,
    'tutorial-nav': TutorialNav,
    'live-preview': LivePreview,
    'interactive-greeting': InteractiveGreeting
  });
  
  useStyle(css`
    .interactivity-demo {
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
    <div class="interactivity-demo">
      <div class="demo-header">
        <h1 class="demo-title">⚡ Step 3: Adding Interactivity</h1>
        <p class="demo-subtitle">
          Let's enhance our component with more interactive features and learn about useEffect
        </p>
      </div>
      
      <tutorial-nav></tutorial-nav>
      
      <div class="content-section">
        <h2 class="section-title">Enhanced Interactive Component</h2>
        
        <div class="instruction-box">
          <div class="instruction-title">🎯 Learning Goals:</div>
          <ul>
            <li>Learn the useEffect hook for side effects</li>
            <li>Add more interactive state</li>
            <li>Practice event handling</li>
            <li>Implement dynamic styling</li>
          </ul>
        </div>
        
        <p><strong>Step 1:</strong> Add useEffect to the imports</p>
        
        <code-block
          title="app.js - Updated Imports"
          language="javascript"
          code="// Import useEffect along with other hooks
import { html, css, define, useState, useEffect, useStyle } from './path/to/dim.ts';"
        ></code-block>
        
        <p><strong>Step 2:</strong> Create an enhanced interactive component</p>
        
        <code-block
          title="app.js - Enhanced Component"
          language="javascript"
          code="const InteractiveGreeting = (_, { useState, useEffect, html, css, useStyle }) => {
  // Multiple pieces of state
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('Hello');
  
  // Side effect: update document title when count changes
  useEffect(() => {
    document.title = \`Count: \${count} - My Dim App\`;
  }, [count]);
  
  // Side effect: change greeting based on count
  useEffect(() => {
    if (count >= 10) {
      setGreeting('Wow! Amazing!');
    } else if (count >= 5) {
      setGreeting('Great job!');
    } else if (count < 0) {
      setGreeting('Going backwards?');
    } else {
      setGreeting('Hello');
    }
  }, [count]);
  
  useStyle(css\`
    .interactive-greeting {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
      margin: 2rem auto;
    }
    
    .dynamic-greeting {
      font-size: 1.5rem;
      color: #667eea;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    
    .counter-display {
      font-size: 3rem;
      font-weight: bold;
      color: \${count >= 10 ? '#38ef7d' : count < 0 ? '#ff416c' : '#495057'};
      margin: 1rem 0;
      transition: color 0.3s ease;
    }
    
    .name-input {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      margin: 1rem;
      font-size: 1rem;
      width: 200px;
    }
    
    .name-input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .button-group {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    
    .btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: #6c757d;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }
  \`);
  
  const displayName = name || 'Friend';
  
  return html\`
    <div class=\"interactive-greeting\">
      <h1 class=\"dynamic-greeting\">\${greeting}, \${displayName}!</h1>
      <div class=\"counter-display\">\${count}</div>
      
      <input
        type=\"text\"
        class=\"name-input\"
        placeholder=\"Enter your name\"
        .value=\"\${name}\"
        @input=\"\${(e) => setName(e.target.value)}\"
      />
      
      <div class=\"button-group\">
        <button class=\"btn\" @click=\"\${() => setCount(count - 1)}\">
          Decrease (-1)
        </button>
        <button class=\"btn btn-secondary\" @click=\"\${() => setCount(0)}\">
          Reset
        </button>
        <button class=\"btn\" @click=\"\${() => setCount(count + 1)}\">
          Increase (+1)
        </button>
        <button class=\"btn\" @click=\"\${() => setCount(count + 5)}\">
          Jump (+5)
        </button>
      </div>
      
      <p style=\"margin-top: 2rem; color: #6c757d; font-size: 0.875rem;\">
        Watch the page title and greeting change as you interact!
      </p>
    </div>
  \`;
};"
        ></code-block>
        
        <p><strong>Step 3:</strong> Update the component registration</p>
        
        <code-block
          title="app.js - Register Enhanced Component"
          language="javascript"
          code="// Register the enhanced component
define({ tag: 'interactive-greeting', component: InteractiveGreeting });

// Update the HTML to use the new component
document.getElementById('app').innerHTML = '<interactive-greeting></interactive-greeting>';"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">🔍 New concepts:</div>
          <ul>
            <li><code>useEffect</code> runs side effects when dependencies change</li>
            <li>Multiple useState hooks manage different pieces of state</li>
            <li>Template literals (\${}) embed dynamic values in templates</li>
            <li>Event handlers receive the event object as a parameter</li>
            <li>CSS can be dynamic using template literal interpolation</li>
          </ul>
        </div>
        
        <live-preview>
          <interactive-greeting></interactive-greeting>
        </live-preview>
        
        <div class="instruction-box">
          <div class="instruction-title">🎉 Features in Action!</div>
          <p>Try these interactions in the preview above:</p>
          <ul>
            <li>Enter your name to see the personalized greeting</li>
            <li>Change the counter and watch the browser tab title update</li>
            <li>Get the count above 10 to see the "Amazing!" message</li>
            <li>Go below 0 to see the "Going backwards?" message</li>
            <li>Notice how the counter color changes based on value</li>
          </ul>
        </div>
        
        <div class="instruction-box">
          <div class="instruction-title">🎯 Next Step:</div>
          <p>Great! Now you understand interactive components with multiple state and effects. Let's start building a real application by creating a task item component! Click "Task Item Component" in the navigation above to continue.</p>
        </div>
      </div>
    </div>
  `;
};

define({ tag: 'code-block', component: CodeBlock });
define({ tag: 'tutorial-nav', component: TutorialNav });
define({ tag: 'live-preview', component: LivePreview });
define({ tag: 'interactive-greeting', component: InteractiveGreeting });
define({ tag: 'adding-interactivity-demo', component: AddingInteractivityDemo });

export default {
  title: "Tutorial/Step-by-Step",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Step 3: Adding Interactivity

Learn how to create more sophisticated interactive components using useEffect and multiple state variables.

## What You'll Learn

- Using useEffect for side effects and lifecycle management
- Managing multiple pieces of state
- Dynamic styling based on state values
- Input handling and controlled components
- Browser API integration (document.title)

## Interactive Features

Our enhanced component demonstrates:
- Dynamic greetings based on user input and counter value
- Browser tab title updates using useEffect
- Color-changing counter based on value
- Multiple buttons with different increment amounts
- Input field with real-time state updates

Perfect for understanding real-world interactive patterns!
        `
      }
    }
  }
};

export const AddingInteractivity = {
  render: wrapLitHtmlStory(() => html`<adding-interactivity-demo></adding-interactivity-demo>`),
  name: "3. Adding Interactivity",
  parameters: {
    docs: {
      description: {
        story: `
### Enhanced Interactive Components

This step builds on the basic component from Step 2 and introduces advanced interactivity patterns using useEffect and multiple state variables.

**🎯 Learning Objectives:**
- Master the useEffect hook for side effects
- Manage complex component state with multiple useState hooks
- Implement dynamic styling based on state values
- Handle form inputs with controlled components
- Integrate with browser APIs like document.title

**🔄 useEffect Hook:**
useEffect allows you to perform side effects in your components:
\`\`\`javascript
useEffect(() => {
  // Effect code runs after render
  document.title = \`Count: \${count}\`;
}, [count]); // Dependency array - effect runs when count changes
\`\`\`

**🎨 Dynamic Styling:**
You can use state values directly in your CSS:
\`\`\`javascript
useStyle(css\`
  .counter {
    color: \${count >= 10 ? 'green' : count < 0 ? 'red' : 'blue'};
  }
\`);
\`\`\`

**📝 Controlled Components:**
Form inputs controlled by component state:
\`\`\`javascript
<input
  .value="\${name}"
  @input="\${(e) => setName(e.target.value)}"
/>
\`\`\`

Try all the interactive features in the live preview above!
        `
      }
    }
  }
};