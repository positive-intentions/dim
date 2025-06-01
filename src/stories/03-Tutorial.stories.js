import React from "react";
import { html, css, define, useState, useEffect, useStyle, useScope, useStore } from "../core/dim.ts";
import { wrapLitHtmlStory } from "../core/storybook-utils.js";

// Tutorial Navigation Component
const TutorialNav = ({ currentStep, onStepChange }, { html, css, useStyle }) => {
  const steps = [
    { id: 'setup', title: '1. Setup', icon: '🚀' },
    { id: 'first-component', title: '2. First Component', icon: '🧩' },
    { id: 'adding-state', title: '3. Adding State', icon: '⚡' },
    { id: 'styling', title: '4. Styling', icon: '🎨' },
    { id: 'effects', title: '5. Side Effects', icon: '🔄' },
    { id: 'todo-app', title: '6. Todo App', icon: '📝' },
    { id: 'persistence', title: '7. Persistence', icon: '💾' },
    { id: 'deployment', title: '8. Deployment', icon: '🌐' }
  ];

  useStyle(css`
    .tutorial-nav {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .nav-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .nav-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    
    .nav-step {
      background: #f8f9fa;
      border: 2px solid transparent;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      font-size: 0.875rem;
    }
    
    .nav-step:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }
    
    .nav-step.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-color: #667eea;
    }
    
    .step-icon {
      display: block;
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
  `);

  return html`
    <div class="tutorial-nav">
      <div class="nav-title">📚 Tutorial Progress</div>
      <div class="nav-steps">
        ${steps.map(step => html`
          <button 
            class="nav-step ${currentStep === step.id ? 'active' : ''}"
            @click="${() => onStepChange(step.id)}"
          >
            <span class="step-icon">${step.icon}</span>
            ${step.title}
          </button>
        `)}
      </div>
    </div>
  `;
};

// Code Block Component
const CodeBlock = ({ code, language = 'javascript', title, fileName }, { html, css, useStyle }) => {
  useStyle(css`
    .code-block {
      margin: 1.5rem 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .code-header {
      background: linear-gradient(135deg, #495057, #6c757d);
      color: white;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .code-title {
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .file-name {
      font-family: 'Consolas', monospace;
      font-size: 0.75rem;
      background: rgba(255,255,255,0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .code-content {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.25rem;
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
    .tag { color: #569cd6; }
  `);

  const highlightCode = (code) => {
    return code
      .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
      .replace(/\b(const|let|var|function|return|import|export|from|if|else|class|extends|new)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(useState|useEffect|useMemo|useRef|useStyle|useScope|useStore|html|css|define)\b/g, '<span class="function">$1</span>')
      .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '<span class="string">$&</span>')
      .replace(/\b\d+\b/g, '<span class="number">$&</span>')
      .replace(/&lt;\/?\w+/g, '<span class="tag">$&</span>');
  };

  return html`
    <div class="code-block">
      <div class="code-header">
        <div class="code-title">${title || 'Code Example'}</div>
        ${fileName ? html`<div class="file-name">${fileName}</div>` : ''}
      </div>
      <div class="code-content">
        <pre .innerHTML="${highlightCode(code)}"></pre>
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
      border-radius: 8px;
      overflow: hidden;
      margin: 1.5rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .preview-header {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .preview-content {
      padding: 1.5rem;
      min-height: 120px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
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

// Step Content Components

// Step 1: Setup
const SetupStep = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'code-block': CodeBlock
  });

  useStyle(css`
    .step-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .step-intro {
      background: #e7f3ff;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #007bff;
      margin-bottom: 2rem;
    }
    
    .intro-title {
      font-weight: 600;
      color: #0056b3;
      margin-bottom: 0.5rem;
    }
  `);

  return html`
    <div class="step-content">
      <h2>🚀 Step 1: Project Setup</h2>
      
      <div class="step-intro">
        <div class="intro-title">What you'll learn:</div>
        <ul>
          <li>Setting up a new Dim project</li>
          <li>Understanding the project structure</li>
          <li>Creating your first HTML file</li>
        </ul>
      </div>

      <h3>Create Your Project</h3>
      <p>First, let's create a new directory for our project and set up the basic structure:</p>

      <code-block
        title="Terminal Commands"
        fileName="terminal"
        code="mkdir my-dim-app
cd my-dim-app
mkdir src
touch index.html src/app.js"
      ></code-block>

      <h3>HTML Setup</h3>
      <p>Create your main HTML file that will load your Dim application:</p>

      <code-block
        title="Main HTML File"
        fileName="index.html"
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
        
        #app {
            max-width: 800px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div id=\"app\">
        <h1>Loading...</h1>
    </div>
    
    <script type=\"module\" src=\"src/app.js\"></script>
</body>
</html>"
      ></code-block>

      <h3>Initial JavaScript Setup</h3>
      <p>Set up your main JavaScript file with the Dim imports:</p>

      <code-block
        title="Application Entry Point"
        fileName="src/app.js"
        code="// Import Dim framework functions
import { html, css, define, useState, useStyle } from './path/to/dim.ts';

console.log('Dim app starting...');

// We'll add our first component in the next step!"
      ></code-block>

      <p><strong>Next:</strong> Now that we have our project structure, let's create our first component!</p>
    </div>
  `;
};

// Step 2: First Component
const FirstComponentStep = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'code-block': CodeBlock,
    'live-preview': LivePreview
  });

  // Sample component for demo
  const HelloWorld = (_, { html, css, useStyle }) => {
    useStyle(css`
      .hello-world {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .hello-title {
        color: #667eea;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
    `);

    return html`
      <div class="hello-world">
        <h1 class="hello-title">Hello, Dim! 👋</h1>
        <p>This is my first component!</p>
      </div>
    `;
  };

  useStyle(css`
    .step-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  `);

  return html`
    <div class="step-content">
      <h2>🧩 Step 2: Your First Component</h2>
      
      <p>Let's create a simple "Hello World" component to understand the basics of Dim components.</p>

      <h3>Component Structure</h3>
      <p>Dim components are functions that return HTML templates using the <code>html</code> tagged template literal:</p>

      <code-block
        title="Basic Component"
        fileName="src/app.js"
        code="import { html, css, define, useStyle } from './path/to/dim.ts';

// Our first component
const HelloWorld = (_, { html, css, useStyle }) => {
  // Add scoped styles
  useStyle(css\`
    .hello-world {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .hello-title {
      color: #667eea;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .hello-subtitle {
      color: #6c757d;
    }
  \`);

  // Return the component template
  return html\`
    <div class=\"hello-world\">
      <h1 class=\"hello-title\">Hello, Dim! 👋</h1>
      <p class=\"hello-subtitle\">This is my first component!</p>
    </div>
  \`;
};"
      ></code-block>

      <h3>Register the Component</h3>
      <p>To use your component, you need to register it with a custom HTML tag:</p>

      <code-block
        title="Component Registration"
        fileName="src/app.js"
        code="// Register the component
define({ tag: 'hello-world', component: HelloWorld });

// Add it to the page
document.getElementById('app').innerHTML = '<hello-world></hello-world>';

console.log('Hello World component loaded!');"
      ></code-block>

      <h3>Live Example</h3>
      <p>Here's how your component will look:</p>

      <live-preview>
        ${html`<hello-world></hello-world>`}
      </live-preview>

      <h3>Key Concepts</h3>
      <ul>
        <li><strong>Function Components:</strong> Components are just functions</li>
        <li><strong>Template Literals:</strong> Use <code>html\`...\`</code> for templates</li>
        <li><strong>Scoped Styles:</strong> <code>useStyle(css\`...\`)</code> adds component-specific CSS</li>
        <li><strong>Registration:</strong> <code>define()</code> creates custom HTML elements</li>
      </ul>

      <p><strong>Next:</strong> Let's add interactive state to make our component dynamic!</p>
    </div>
  `;
};

// Tutorial Main Component
const Tutorial = (_, { useState, html, css, useStyle, useScope }) => {
  const [currentStep, setCurrentStep] = useState('setup');

  useScope({
    'tutorial-nav': TutorialNav,
    'setup-step': SetupStep,
    'first-component-step': FirstComponentStep,
    'hello-world': () => {
      const HelloWorld = (_, { html, css, useStyle }) => {
        useStyle(css`
          .hello-world {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .hello-title {
            color: #667eea;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
        `);

        return html`
          <div class="hello-world">
            <h1 class="hello-title">Hello, Dim! 👋</h1>
            <p>This is my first component!</p>
          </div>
        `;
      };
      return HelloWorld;
    }
  });

  useStyle(css`
    .tutorial {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .tutorial-header {
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 16px;
    }
    
    .tutorial-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .tutorial-subtitle {
      font-size: 1.125rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }
  `);

  const renderStep = () => {
    switch(currentStep) {
      case 'setup':
        return html`<setup-step></setup-step>`;
      case 'first-component':
        return html`<first-component-step></first-component-step>`;
      default:
        return html`<setup-step></setup-step>`;
    }
  };

  return html`
    <div class="tutorial">
      <div class="tutorial-header">
        <h1 class="tutorial-title">📚 Build a Todo App</h1>
        <p class="tutorial-subtitle">
          A comprehensive step-by-step tutorial to learn Dim by building a real application
        </p>
      </div>
      
      <tutorial-nav 
        currentStep="${currentStep}"
        onStepChange="${setCurrentStep}"
      ></tutorial-nav>
      
      ${renderStep()}
    </div>
  `;
};

// Register all components
define({ tag: 'tutorial-nav', component: TutorialNav });
define({ tag: 'code-block', component: CodeBlock });
define({ tag: 'live-preview', component: LivePreview });
define({ tag: 'setup-step', component: SetupStep });
define({ tag: 'first-component-step', component: FirstComponentStep });
define({ tag: 'hello-world', component: () => {
  const HelloWorld = (_, { html, css, useStyle }) => {
    useStyle(css`
      .hello-world {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .hello-title {
        color: #667eea;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
    `);

    return html`
      <div class="hello-world">
        <h1 class="hello-title">Hello, Dim! 👋</h1>
        <p>This is my first component!</p>
      </div>
    `;
  };
  return HelloWorld;
} });
define({ tag: 'tutorial', component: Tutorial });

export default {
  title: "Step-by-Step Tutorial",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Step-by-Step Tutorial: Build a Todo App

Learn Dim by building a complete todo application from scratch. This hands-on tutorial covers all the essential concepts through practical examples.

## What You'll Build

A fully functional todo application featuring:
- ✅ Add, edit, and delete todos
- 🎨 Beautiful responsive design
- 💾 Persistent data storage
- 🔄 Real-time updates
- 📱 Mobile-friendly interface

## Tutorial Structure

### Foundation (Steps 1-4)
1. **Setup**: Project structure and environment
2. **First Component**: Basic component creation
3. **Adding State**: Interactive state management
4. **Styling**: Scoped CSS and design systems

### Building Features (Steps 5-8)
5. **Side Effects**: useEffect and lifecycle management
6. **Todo App**: Core application functionality
7. **Persistence**: Data storage with useStore
8. **Deployment**: Publishing your application

## Learning Approach

- **Progressive**: Each step builds on the previous one
- **Interactive**: Live code examples and demos
- **Practical**: Real-world patterns and best practices
- **Complete**: From setup to deployment

Perfect for developers who learn best by building!
        `
      }
    }
  }
};

export const BuildTodoApp = {
  render: wrapLitHtmlStory(() => html`<tutorial></tutorial>`),
  name: "Build a Todo App",
  parameters: {
    docs: {
      description: {
        story: `
### Complete Step-by-Step Tutorial

This interactive tutorial guides you through building a complete todo application using Dim. Each step includes:

**📝 Clear Instructions**
- Step-by-step guidance with explanations
- Code examples with syntax highlighting
- Best practices and common patterns

**🎮 Interactive Elements**
- Live previews of each component
- Navigation between tutorial steps
- Hands-on coding exercises

**🎯 Progressive Learning**
- Starts with basic concepts
- Gradually introduces advanced features
- Builds a real, functional application

**🔧 Practical Skills**
- Component architecture
- State management patterns
- Styling best practices
- Data persistence
- Application deployment

Use the navigation at the top to jump between steps or follow along sequentially for the best learning experience!
        `
      }
    }
  }
};