import React from "react";
import { html, css, define, useState, useEffect, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Syntax Highlighter Component
const CodeBlock = ({ code, language = 'javascript', title, step }, { html, css, useStyle }) => {
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .step-badge {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
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
    }
    
    .code-text {
      color: #d4d4d4;
      white-space: pre;
    }
    
    /* JavaScript Syntax Highlighting */
    .keyword { color: #569cd6; font-weight: 500; }
    .string { color: #ce9178; }
    .number { color: #b5cea8; }
    .comment { color: #6a9955; font-style: italic; }
    .function { color: #dcdcaa; }
    .variable { color: #9cdcfe; }
    .property { color: #9cdcfe; }
    .operator { color: #d4d4d4; }
    .punctuation { color: #d4d4d4; }
    .tag { color: #569cd6; }
    .attr-name { color: #92c5f8; }
    .attr-value { color: #ce9178; }
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
  
  // Simple syntax highlighting for JavaScript
  const highlightCode = (code) => {
    return code
      // Comments
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
      // Strings (including template literals)
      .replace(/(`[^`]*`)/g, '<span class="template-literal">$1</span>')
      .replace(/('[^']*'|"[^"]*")/g, '<span class="string">$1</span>')
      // Template expressions
      .replace(/(\$\{[^}]*\})/g, '<span class="template-expression">$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
      // Keywords
      .replace(/\b(const|let|var|function|class|if|else|for|while|do|switch|case|default|break|continue|return|import|export|from|as|async|await|try|catch|finally|throw|new|this|super|extends|static|get|set|typeof|instanceof|in|of|delete|void)\b/g, '<span class="keyword">$1</span>')
      // Function names
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span>')
      // Properties and methods
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '.<span class="property">$1</span>')
      // HTML tags
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/g, '$1<span class="tag">$2</span>')
      // HTML attributes
      .replace(/\s([a-zA-Z-]+)(=)/g, ' <span class="attr-name">$1</span><span class="operator">$2</span>')
      // Operators
      .replace(/([+\-*/%=!<>&|?:;,])/g, '<span class="operator">$1</span>');
  };
  
  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      // Could add a toast notification here
      console.log('Code copied to clipboard');
    });
  };
  
  return html`
    <div class="code-block">
      <div class="code-header">
        <div class="code-title">
          ${step ? html`<span class="step-badge">Step ${step}</span>` : ''}
          ${title || 'Code Example'}
        </div>
        <span class="language-badge">${language}</span>
      </div>
      <div class="code-content" style="position: relative;">
        <button class="copy-button" @click="${copyCode}" title="Copy code">
          📋 Copy
        </button>
        <div class="code-text" .innerHTML="${highlightCode(code.replace(/</g, '&lt;').replace(/>/g, '&gt;'))}"></div>
      </div>
    </div>
  `;
};

// Step-by-step demo component
const StepByStepDemo = (_, { useState, html, css, useStyle, useScope }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  useScope({
    'code-block': CodeBlock
  });
  
  useStyle(css`
    .step-demo {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .demo-header {
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 16px;
    }
    
    .demo-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .demo-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .step-navigation {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .step-nav-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .step-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .step-button {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      color: #495057;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      min-width: 120px;
    }
    
    .step-button:hover {
      background: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .step-button.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-color: #667eea;
    }
    
    .step-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
    }
    
    .step-number {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.25rem;
    }
    
    .step-title {
      font-size: 1.5rem;
      color: #495057;
      margin: 0;
    }
    
    .step-description {
      color: #6c757d;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .instruction-box {
      background: #e7f3ff;
      border-left: 4px solid #0ea5e9;
      padding: 1rem 1.5rem;
      border-radius: 0 8px 8px 0;
      margin: 1.5rem 0;
    }
    
    .instruction-title {
      font-weight: 600;
      color: #0ea5e9;
      margin-bottom: 0.5rem;
    }
    
    .tip-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
    }
    
    .tip-title {
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .nav-controls {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }
    
    .nav-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .nav-btn.secondary {
      background: #6c757d;
    }
    
    .nav-btn.secondary:hover {
      background: #5a6268;
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }
  `);
  
  const steps = [
    {
      title: "Project Setup",
      description: "Let's start by creating a new project and setting up the basic file structure.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">📋 What we'll create:</div>
          <p>A basic HTML file that loads the Dim framework and displays our first component.</p>
        </div>
        
        <p><strong>Step 1:</strong> Create a new directory for your project</p>
        
        <code-block
          step="1"
          title="Create project directory"
          language="bash"
          code="mkdir my-dim-app
cd my-dim-app"
        ></code-block>
        
        <p><strong>Step 2:</strong> Create the basic HTML file</p>
        
        <code-block
          step="2"
          title="index.html"
          language="html"
          code="<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>My Dim App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id=\"app\">
        <!-- Our Dim components will go here -->
    </div>
    
    <!-- Load Dim framework -->
    <script type=\"module\" src=\"./app.js\"></script>
</body>
</html>"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">💡 Tip:</div>
          <p>This HTML file is minimal and focuses on loading our Dim application. Notice we're using ES modules with <code>type="module"</code>.</p>
        </div>
      `
    },
    
    {
      title: "Your First Component",
      description: "Now let's create our first Dim component - a simple greeting component that demonstrates basic concepts.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">🎯 Learning Goals:</div>
          <ul>
            <li>Understand Dim component structure</li>
            <li>Learn the useState hook</li>
            <li>See how to register and use components</li>
          </ul>
        </div>
        
        <p><strong>Step 1:</strong> Create your app.js file</p>
        
        <code-block
          step="1"
          title="app.js - Import Dim"
          language="javascript"
          code="// Import Dim framework functions
import { html, css, define, useState, useStyle } from './path/to/dim.ts';

// We'll add our components here"
        ></code-block>
        
        <p><strong>Step 2:</strong> Create a simple greeting component</p>
        
        <code-block
          step="2"
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
          step="3"
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
      `
    },
    
    {
      title: "Adding Interactivity",
      description: "Let's enhance our component with more interactive features and learn about useEffect.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">🎯 Learning Goals:</div>
          <ul>
            <li>Learn the useEffect hook for side effects</li>
            <li>Add more interactive state</li>
            <li>Practice event handling</li>
          </ul>
        </div>
        
        <p><strong>Step 1:</strong> Add useEffect to the imports</p>
        
        <code-block
          step="1"
          title="app.js - Updated Imports"
          language="javascript"
          code="// Import useEffect along with other hooks
import { html, css, define, useState, useEffect, useStyle } from './path/to/dim.ts';"
        ></code-block>
        
        <p><strong>Step 2:</strong> Create an enhanced interactive component</p>
        
        <code-block
          step="2"
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
          step="3"
          title="app.js - Register New Component"
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
      `
    },
    
    {
      title: "Testing Your App",
      description: "Let's test what we've built and see it in action!",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">🚀 Ready to test!</div>
          <p>Your app should now be fully functional. Let's test all the features we've built.</p>
        </div>
        
        <p><strong>Step 1:</strong> Serve your app locally</p>
        
        <code-block
          step="1"
          title="Start a local server"
          language="bash"
          code="# Option 1: Using Python (if installed)
python -m http.server 8000

# Option 2: Using Node.js serve package
npx serve .

# Option 3: Using any other static server
# Then open http://localhost:8000 in your browser"
        ></code-block>
        
        <p><strong>Step 2:</strong> Complete app.js file for reference</p>
        
        <code-block
          step="2"
          title="Complete app.js"
          language="javascript"
          code="// Complete app.js file
import { html, css, define, useState, useEffect, useStyle } from './path/to/dim.ts';

const InteractiveGreeting = (_, { useState, useEffect, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('Hello');
  
  useEffect(() => {
    document.title = \`Count: \${count} - My Dim App\`;
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
};

define({ tag: 'interactive-greeting', component: InteractiveGreeting });

document.getElementById('app').innerHTML = '<interactive-greeting></interactive-greeting>';"
        ></code-block>
        
        <p><strong>Step 3:</strong> Test these features</p>
        
        <div class="tip-box">
          <div class="tip-title">✅ Testing Checklist:</div>
          <ul>
            <li>Enter your name and see it appear in the greeting</li>
            <li>Click the buttons to change the counter</li>
            <li>Notice how the greeting changes at different count values</li>
            <li>Watch the browser tab title update with the count</li>
            <li>See the counter color change based on the value</li>
            <li>Try getting the count above 10 to see the "Amazing!" message</li>
          </ul>
        </div>
        
        <div class="instruction-box">
          <div class="instruction-title">🎉 Congratulations!</div>
          <p>You've successfully created your first Dim application! You've learned:</p>
          <ul>
            <li>How to set up a basic Dim project</li>
            <li>Creating components with useState and useEffect</li>
            <li>Handling events and user input</li>
            <li>Using scoped CSS with useStyle</li>
            <li>Registering and using custom components</li>
          </ul>
        </div>
      `
    }
  ];
  
  const currentStepData = steps[currentStep - 1];
  
  return html`
    <div class="step-demo">
      <div class="demo-header">
        <h1 class="demo-title">🚀 Getting Started with Dim</h1>
        <p class="demo-subtitle">
          Follow this step-by-step tutorial to build your first Dim application from scratch
        </p>
      </div>
      
      <div class="step-navigation">
        <div class="step-nav-title">Choose Your Step</div>
        <div class="step-buttons">
          ${steps.map((step, index) => html`
            <button 
              class="step-button ${currentStep === index + 1 ? 'active' : ''}"
              @click="${() => setCurrentStep(index + 1)}"
            >
              ${index + 1}. ${step.title}
            </button>
          `)}
        </div>
      </div>
      
      <div class="step-content">
        <div class="step-header">
          <div class="step-number">${currentStep}</div>
          <h2 class="step-title">${currentStepData.title}</h2>
        </div>
        
        <p class="step-description">${currentStepData.description}</p>
        
        ${currentStepData.content}
        
        <div class="nav-controls">
          <button 
            class="nav-btn secondary"
            ?disabled="${currentStep === 1}"
            @click="${() => setCurrentStep(currentStep - 1)}"
          >
            ← Previous
          </button>
          
          <button 
            class="nav-btn"
            ?disabled="${currentStep === steps.length}"
            @click="${() => setCurrentStep(currentStep + 1)}"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  `;
};

// Register components
define({ tag: 'code-block', component: CodeBlock });
define({ tag: 'step-by-step-demo', component: StepByStepDemo });

export default {
  title: "Tutorial/04. Step-by-Step Guide",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Step-by-Step Getting Started Guide

A comprehensive, beginner-friendly tutorial that walks you through creating your first Dim application from absolute scratch.

## What You'll Learn

- **Project Setup**: How to create a new Dim project from nothing
- **First Component**: Building your first interactive component
- **Core Hooks**: Using useState and useEffect in practice
- **Event Handling**: Responding to user interactions
- **Styling**: Adding beautiful, scoped CSS to components

## Tutorial Features

- **Progressive Learning**: Each step builds on the previous one
- **Copy-Paste Ready**: All code examples are ready to copy and use
- **Syntax Highlighting**: JavaScript code with proper syntax highlighting
- **Interactive Navigation**: Jump between steps as needed
- **Testing Guide**: Learn how to test and run your app

## What We'll Build

By the end of this tutorial, you'll have created an interactive greeting component that:
- Displays a personalized greeting based on user input
- Has a counter with multiple increment/decrement options
- Changes behavior based on the counter value
- Updates the browser tab title dynamically
- Uses beautiful, responsive styling

Perfect for developers new to Dim or those who want a refresher on the basics!
        `
      }
    }
  }
};

export const GettingStarted = {
  render: wrapLitHtmlStory(() => html`<step-by-step-demo></step-by-step-demo>`),
  name: "Getting Started from Scratch",
  parameters: {
    docs: {
      description: {
        story: `
### Complete Beginner's Guide

This tutorial assumes no prior knowledge of Dim and walks you through every single step needed to create your first application.

**🎯 Perfect For:**
- Developers new to Dim framework
- Those who prefer step-by-step learning
- Anyone wanting a quick refresher on the basics

**📚 What's Included:**
- Complete project setup from scratch
- Detailed explanations of every code line
- Copy-paste ready code examples with syntax highlighting
- Interactive step navigation
- Testing and deployment guidance

**⚡ Key Learning Outcomes:**
- Understand Dim's component structure
- Master useState and useEffect hooks
- Learn event handling patterns
- Practice scoped CSS styling
- Build confidence with hands-on coding

**🔧 Requirements:**
- Basic knowledge of HTML, CSS, and JavaScript
- A code editor (VS Code recommended)
- A web browser
- A local development server (instructions provided)

Start with Step 1 and follow along at your own pace. Each step includes explanations, code examples, and tips to help you understand not just what to do, but why you're doing it.

Ready to build something awesome? Let's get started! 🚀
        `
      }
    }
  }
};