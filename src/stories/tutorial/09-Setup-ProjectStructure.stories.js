import React from "react";
import { html, css, define, useState, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Enhanced CodeBlock component with proper language support
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

// Navigation component to link to other stories
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
      text-decoration: none;
      color: white;
      transition: all 0.3s;
      border: 1px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    // Navigate using Storybook's URL structure
    window.location.href = `${window.location.origin}${window.location.pathname}?path=/story/${storyId}`;
  };
  
  return html`
    <div class="tutorial-nav">
      <div class="nav-title">📚 Step-by-Step Tutorial Navigation</div>
      <div class="nav-links">
        <button 
          class="nav-link current"
          @click="${() => navigateToStory('tutorial-step-by-step--project-setup')}"
        >
          <span class="nav-number">1</span>
          Project Setup
        </button>
        <button 
          class="nav-link"
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

// Project Setup Demo
const ProjectSetupDemo = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'code-block': CodeBlock,
    'tutorial-nav': TutorialNav
  });
  
  useStyle(css`
    .setup-demo {
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
    <div class="setup-demo">
      <div class="demo-header">
        <h1 class="demo-title">🚀 Step 1: Project Setup</h1>
        <p class="demo-subtitle">
          Let's start by creating a new project and setting up the basic file structure
        </p>
      </div>
      
      <tutorial-nav></tutorial-nav>
      
      <div class="content-section">
        <h2 class="section-title">Creating Your Project Directory</h2>
        
        <div class="instruction-box">
          <div class="instruction-title">📋 What we'll create:</div>
          <p>A basic HTML file that loads the Dim framework and displays our first component.</p>
        </div>
        
        <p><strong>Step 1:</strong> Create a new directory for your project</p>
        
        <code-block
          title="Create project directory"
          language="bash"
          code="mkdir my-dim-app
cd my-dim-app"
        ></code-block>
        
        <p><strong>Step 2:</strong> Create the basic HTML file</p>
        
        <code-block
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
        
        <p><strong>Step 3:</strong> Create the initial JavaScript file</p>
        
        <code-block
          title="app.js (starter)"
          language="javascript"
          code="// Import Dim framework functions
import { html, css, define, useState, useStyle } from './path/to/dim.ts';

// We'll add our components here
console.log('Dim app starting...');"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">💡 Tip:</div>
          <p>This HTML file is minimal and focuses on loading our Dim application. Notice we're using ES modules with <code>type="module"</code>.</p>
        </div>
        
        <div class="instruction-box">
          <div class="instruction-title">🎯 Next Step:</div>
          <p>Now that we have our basic project structure, let's create our first Dim component! Click "First Component" in the navigation above to continue.</p>
        </div>
      </div>
    </div>
  `;
};

define({ tag: 'code-block', component: CodeBlock });
define({ tag: 'tutorial-nav', component: TutorialNav });
define({ tag: 'project-setup-demo', component: ProjectSetupDemo });

export default {
  title: "Tutorial/Step-by-Step",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Step 1: Project Setup

Learn how to set up a Dim project from scratch, creating the basic file structure and understanding the fundamental concepts.

## What You'll Learn

- Creating a new project directory
- Setting up the basic HTML structure
- Understanding ES modules and imports
- Preparing for component development

## Files We'll Create

- \`index.html\` - The main HTML file
- \`app.js\` - Our JavaScript application entry point

Perfect starting point for developers new to Dim!
        `
      }
    }
  }
};

export const ProjectSetup = {
  render: wrapLitHtmlStory(() => html`<project-setup-demo></project-setup-demo>`),
  name: "1. Project Setup",
  parameters: {
    docs: {
      description: {
        story: `
### Setting Up Your Dim Project

This is the first step in our comprehensive tutorial series. We'll start from absolutely nothing and build up a complete project structure.

**🎯 Learning Objectives:**
- Understand basic project structure
- Set up HTML boilerplate for Dim apps
- Configure ES module imports
- Prepare development environment

**📁 Project Structure:**
\`\`\`
my-dim-app/
├── index.html          # Main HTML file
├── app.js             # JavaScript entry point
└── (components later) # We'll add more files as we go
\`\`\`

**🔗 Navigation:**
Use the tutorial navigation at the top to move between steps. Each step builds on the previous one, so follow them in order for the best learning experience.

Ready to start building? Let's set up our project! 🚀
        `
      }
    }
  }
};