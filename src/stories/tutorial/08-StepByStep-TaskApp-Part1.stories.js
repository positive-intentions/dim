import React from "react";
import { html, css, define, useState, useEffect, useStore, useScope, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Reuse the CodeBlock component from the previous tutorial
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
  
  const highlightCode = (code) => {
    return code
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
      .replace(/(`[^`]*`)/g, '<span class="template-literal">$1</span>')
      .replace(/('[^']*'|"[^"]*")/g, '<span class="string">$1</span>')
      .replace(/(\$\{[^}]*\})/g, '<span class="template-expression">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
      .replace(/\b(const|let|var|function|class|if|else|for|while|do|switch|case|default|break|continue|return|import|export|from|as|async|await|try|catch|finally|throw|new|this|super|extends|static|get|set|typeof|instanceof|in|of|delete|void)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span>')
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '.<span class="property">$1</span>')
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/g, '$1<span class="tag">$2</span>')
      .replace(/\s([a-zA-Z-]+)(=)/g, ' <span class="attr-name">$1</span><span class="operator">$2</span>')
      .replace(/([+\-*/%=!<>&|?:;,])/g, '<span class="operator">$1</span>');
  };
  
  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
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
      background: #f8f9fa;
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

// Task App Tutorial Component
const TaskAppTutorial = (_, { useState, html, css, useStyle, useScope }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  useScope({
    'code-block': CodeBlock,
    'live-preview': LivePreview
  });
  
  useStyle(css`
    .task-tutorial {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .tutorial-header {
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
      color: #495057;
      padding: 3rem 2rem;
      border-radius: 16px;
    }
    
    .tutorial-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
    
    .tutorial-subtitle {
      font-size: 1.2rem;
      opacity: 0.8;
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
      min-width: 140px;
      text-align: center;
    }
    
    .step-button:hover {
      background: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .step-button.active {
      background: linear-gradient(135deg, #ff9a9e, #fecfef);
      color: #495057;
      border-color: #ff9a9e;
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
      background: linear-gradient(135deg, #ff9a9e, #fecfef);
      color: #495057;
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
    
    .nav-controls {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }
    
    .nav-btn {
      background: linear-gradient(135deg, #ff9a9e, #fecfef);
      color: #495057;
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
      box-shadow: 0 4px 12px rgba(255, 154, 158, 0.4);
    }
    
    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .nav-btn.secondary {
      background: #6c757d;
      color: white;
    }
    
    .nav-btn.secondary:hover {
      background: #5a6268;
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }
  `);
  
  const steps = [
    {
      title: "Setting Up the Task App",
      description: "Let's create a more sophisticated todo application that demonstrates real-world Dim usage patterns.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">🎯 What we'll build:</div>
          <p>A complete task management app with add, delete, toggle functionality, and data persistence using useStore.</p>
        </div>
        
        <p><strong>First, let's set up our project structure:</strong></p>
        
        <code-block
          step="1"
          title="Project Structure"
          language="bash"
          code="mkdir task-app
cd task-app

# Create our files
touch index.html
touch app.js
touch style.css"
        ></code-block>
        
        <p><strong>Let's start with a basic HTML setup:</strong></p>
        
        <code-block
          step="2"
          title="index.html"
          language="html"
          code="<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Task Manager - Dim App</title>
    <link rel=\"stylesheet\" href=\"style.css\">
</head>
<body>
    <div id=\"app\">
        <div class=\"loading\">
            <h2>Loading Task Manager...</h2>
        </div>
    </div>
    
    <script type=\"module\" src=\"app.js\"></script>
</body>
</html>"
        ></code-block>
        
        <p><strong>Add some basic global styles:</strong></p>
        
        <code-block
          step="3"
          title="style.css"
          language="css"
          code="/* Global styles */
* {
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

#app {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.loading {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">💡 Why this structure?</div>
          <ul>
            <li>Separate CSS file for global styles that don't need to be scoped</li>
            <li>Loading state while our JavaScript loads and initializes</li>
            <li>Flexbox layout for easy centering</li>
            <li>Beautiful gradient background to make our app stand out</li>
          </ul>
        </div>
      `
    },
    
    {
      title: "Creating the Task Item Component",
      description: "Let's start by building the individual task item component that will display each todo.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">🧩 Component Breakdown:</div>
          <p>We'll build our app component by component, starting with the smallest piece - a single task item.</p>
        </div>
        
        <p><strong>Start your app.js file with imports and the Task Item component:</strong></p>
        
        <code-block
          step="1"
          title="app.js - Task Item Component"
          language="javascript"
          code="// Import Dim framework functions
import { html, css, define, useState, useStore, useScope, useStyle } from './path/to/dim.ts';

// TaskItem Component - represents a single todo item
const TaskItem = ({ task, onToggle, onDelete }, { html, css, useStyle }) => {
  
  useStyle(css\`
    .task-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    }
    
    .task-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .task-checkbox {
      width: 20px;
      height: 20px;
      accent-color: #667eea;
    }
    
    .task-text {
      flex: 1;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .task-text.completed {
      text-decoration: line-through;
      color: #6c757d;
    }
    
    .task-delete {
      background: #ff4757;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      opacity: 0;
    }
    
    .task-item:hover .task-delete {
      opacity: 1;
    }
    
    .task-delete:hover {
      background: #ff3742;
      transform: scale(1.05);
    }
    
    .task-created {
      font-size: 0.75rem;
      color: #6c757d;
      margin-left: auto;
    }
  \`);
  
  return html\`
    <div class=\"task-item\">
      <input 
        type=\"checkbox\" 
        class=\"task-checkbox\"
        .checked=\"\${task.completed}\"
        @change=\"\${() => onToggle(task.id)}\"
      />
      <span class=\"task-text \${task.completed ? 'completed' : ''}\">
        \${task.text}
      </span>
      <span class=\"task-created\">
        \${new Date(task.createdAt).toLocaleDateString()}
      </span>
      <button 
        class=\"task-delete\"
        @click=\"\${() => onDelete(task.id)}\"
      >
        Delete
      </button>
    </div>
  \`;
};"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">🔍 What's happening here:</div>
          <ul>
            <li><strong>Props:</strong> The component receives task data and callback functions</li>
            <li><strong>Conditional styling:</strong> CSS classes change based on task completion</li>
            <li><strong>Event handlers:</strong> onToggle and onDelete are called with the task ID</li>
            <li><strong>Hover effects:</strong> Delete button appears on hover for better UX</li>
            <li><strong>Date formatting:</strong> Shows when the task was created</li>
          </ul>
        </div>
        
        <p><strong>Now let's create a simple test to see our component in action:</strong></p>
        
        <code-block
          step="2"
          title="app.js - Test the TaskItem"
          language="javascript"
          code="// Temporary test component to see TaskItem in action
const TaskItemTest = (_, { html, useScope }) => {
  useScope({
    'task-item': TaskItem
  });
  
  const sampleTask = {
    id: 1,
    text: 'Learn Dim framework',
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  const handleToggle = (id) => {
    console.log('Toggle task:', id);
  };
  
  const handleDelete = (id) => {
    console.log('Delete task:', id);
  };
  
  return html\`
    <div style=\"max-width: 400px; padding: 1rem;\">
      <h2 style=\"color: white; text-align: center; margin-bottom: 1rem;\">
        Task Item Preview
      </h2>
      <task-item 
        .props=\"\${{\n          task: sampleTask,
          onToggle: handleToggle,
          onDelete: handleDelete
        }}\"
      ></task-item>
    </div>
  \`;
};

// Register and display the test
define({ tag: 'task-item', component: TaskItem });
define({ tag: 'task-item-test', component: TaskItemTest });

// Replace the loading content
document.getElementById('app').innerHTML = '<task-item-test></task-item-test>';"
        ></code-block>
      `
    },
    
    {
      title: "Creating the Add Task Form",
      description: "Now let's build a form component that allows users to add new tasks to their list.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">📝 Form Component:</div>
          <p>We'll create a clean, user-friendly form that handles text input and form submission.</p>
        </div>
        
        <p><strong>Add the AddTaskForm component to your app.js:</strong></p>
        
        <code-block
          step="1"
          title="app.js - Add Task Form Component"
          language="javascript"
          code="// AddTaskForm Component - for adding new tasks
const AddTaskForm = ({ onAddTask }, { useState, html, css, useStyle }) => {
  const [inputValue, setInputValue] = useState('');
  
  useStyle(css\`
    .add-task-form {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .form-title {
      margin: 0 0 1rem 0;
      color: #495057;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
    }
    
    .task-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }
    
    .task-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .add-button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .add-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .add-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .char-counter {
      font-size: 0.75rem;
      color: #6c757d;
      margin-top: 0.5rem;
      text-align: right;
    }
    
    .char-counter.warning {
      color: #ffc107;
    }
    
    .char-counter.error {
      color: #dc3545;
    }
  \`);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue.length > 0 && trimmedValue.length <= 100) {
      onAddTask(trimmedValue);
      setInputValue(''); // Clear the input
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  
  const charCount = inputValue.length;
  const isOverLimit = charCount > 100;
  const isNearLimit = charCount > 80;
  
  return html\`
    <div class=\"add-task-form\">
      <h3 class=\"form-title\">Add New Task</h3>
      <form @submit=\"\${handleSubmit}\">
        <div class=\"form-row\">
          <input
            type=\"text\"
            class=\"task-input\"
            placeholder=\"What needs to be done?\"
            .value=\"\${inputValue}\"
            @input=\"\${(e) => setInputValue(e.target.value)}\"
            @keypress=\"\${handleKeyPress}\"
            maxlength=\"100\"
          />
          <button 
            type=\"submit\" 
            class=\"add-button\"
            ?disabled=\"\${inputValue.trim().length === 0 || isOverLimit}\"
          >
            Add Task
          </button>
        </div>
        <div class=\"char-counter \${isOverLimit ? 'error' : isNearLimit ? 'warning' : ''}\">
          \${charCount}/100 characters
        </div>
      </form>
    </div>
  \`;
};"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">🔍 Form Features:</div>
          <ul>
            <li><strong>Controlled input:</strong> Input value is managed by component state</li>
            <li><strong>Validation:</strong> Button disabled for empty or too-long input</li>
            <li><strong>Character counter:</strong> Visual feedback with color coding</li>
            <li><strong>Enter key support:</strong> Submit form by pressing Enter</li>
            <li><strong>Auto-clear:</strong> Input clears after successful submission</li>
          </ul>
        </div>
        
        <p><strong>Let's test the form component:</strong></p>
        
        <code-block
          step="2"
          title="app.js - Test the Form"
          language="javascript"
          code="// Update the test component to include the form
const ComponentTest = (_, { html, useScope }) => {
  useScope({
    'task-item': TaskItem,
    'add-task-form': AddTaskForm
  });
  
  const sampleTask = {
    id: 1,
    text: 'Learn Dim framework',
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  const handleAddTask = (taskText) => {
    console.log('Add task:', taskText);
    alert(\`Would add task: \"\${taskText}\"\`);
  };
  
  const handleToggle = (id) => {
    console.log('Toggle task:', id);
  };
  
  const handleDelete = (id) => {
    console.log('Delete task:', id);
  };
  
  return html\`
    <div style=\"max-width: 500px; width: 100%;\">
      <h2 style=\"color: white; text-align: center; margin-bottom: 2rem;\">
        Task Components Preview
      </h2>
      
      <add-task-form 
        .props=\"\${{\n          onAddTask: handleAddTask
        }}\"
      ></add-task-form>
      
      <div style=\"background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;\">
        <h3 style=\"color: white; margin-top: 0;\">Sample Task:</h3>
        <task-item 
          .props=\"\${{\n            task: sampleTask,
            onToggle: handleToggle,
            onDelete: handleDelete
          }}\"
        ></task-item>
      </div>
    </div>
  \`;
};

// Update registrations
define({ tag: 'add-task-form', component: AddTaskForm });
define({ tag: 'component-test', component: ComponentTest });

// Update the page
document.getElementById('app').innerHTML = '<component-test></component-test>';"
        ></code-block>
      `
    },
    
    {
      title: "Building the Complete Task App",
      description: "Now let's combine everything into a complete task management application with state management using useStore.",
      content: html`
        <div class="instruction-box">
          <div class="instruction-title">🏗️ Putting it all together:</div>
          <p>We'll create the main TaskApp component that manages all tasks and uses useStore for persistence.</p>
        </div>
        
        <p><strong>Create the main TaskApp component:</strong></p>
        
        <code-block
          step="1"
          title="app.js - Main Task App Component"
          language="javascript"
          code="// TaskApp Component - the main application
const TaskApp = (_, { useState, useStore, useScope, html, css, useStyle }) => {
  
  // Use Dim's store for persistent state
  const store = useStore({
    tasks: useState([]),
    stats: {
      total: useState(0),
      completed: useState(0),
      pending: useState(0)
    }
  });
  
  const [tasks, setTasks] = store.tasks;
  const [stats, setStats] = store.stats;
  
  // Register child components
  useScope({
    'add-task-form': AddTaskForm,
    'task-item': TaskItem
  });
  
  useStyle(css\`
    .task-app {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }
    
    .app-header {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
    }
    
    .app-title {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .app-subtitle {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
    }
    
    .task-list {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }
    
    .task-list-title {
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .task-count {
      font-size: 0.875rem;
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }
    
    .empty-state {
      text-align: center;
      color: white;
      padding: 3rem 1rem;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.7;
    }
    
    .empty-text {
      font-size: 1.125rem;
      opacity: 0.8;
    }
    
    .stats-bar {
      display: flex;
      justify-content: space-around;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }
    
    .stat-item {
      text-align: center;
      color: white;
    }
    
    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      display: block;
    }
    
    .stat-label {
      font-size: 0.75rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  \`);
  
  // Add a new task
  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(), // Simple ID generation
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };
  
  // Toggle task completion
  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    );
    
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };
  
  // Delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };
  
  // Update statistics
  const updateStats = (taskList) => {
    const total = taskList.length;
    const completed = taskList.filter(task => task.completed).length;
    const pending = total - completed;
    
    setStats({
      total: useState(total),
      completed: useState(completed),
      pending: useState(pending)
    });
  };
  
  const [totalCount] = stats.total;
  const [completedCount] = stats.completed;
  const [pendingCount] = stats.pending;
  
  return html\`
    <div class=\"task-app\">
      <header class=\"app-header\">
        <h1 class=\"app-title\">📋 Task Manager</h1>
        <p class=\"app-subtitle\">Stay organized and get things done!</p>
      </header>
      
      <add-task-form 
        .props=\"\${{\n          onAddTask: addTask
        }}\"
      ></add-task-form>
      
      <div class=\"task-list\">
        <h3 class=\"task-list-title\">
          My Tasks
          <span class=\"task-count\">\${totalCount} task\${totalCount !== 1 ? 's' : ''}</span>
        </h3>
        
        \${tasks.length === 0 ? html\`
          <div class=\"empty-state\">
            <div class=\"empty-icon\">✨</div>
            <div class=\"empty-text\">No tasks yet. Add one above to get started!</div>
          </div>
        \` : html\`
          \${tasks.map(task => html\`
            <task-item 
              .props=\"\${{\n                task,
                onToggle: toggleTask,
                onDelete: deleteTask
              }}\"
            ></task-item>
          \`)}
        \`}
        
        \${totalCount > 0 ? html\`
          <div class=\"stats-bar\">
            <div class=\"stat-item\">
              <span class=\"stat-number\">\${totalCount}</span>
              <span class=\"stat-label\">Total</span>
            </div>
            <div class=\"stat-item\">
              <span class=\"stat-number\">\${pendingCount}</span>
              <span class=\"stat-label\">Pending</span>
            </div>
            <div class=\"stat-item\">
              <span class=\"stat-number\">\${completedCount}</span>
              <span class=\"stat-label\">Completed</span>
            </div>
          </div>
        \` : ''}
      </div>
    </div>
  \`;
};"
        ></code-block>
        
        <p><strong>Now let's register and launch the complete app:</strong></p>
        
        <code-block
          step="2"
          title="app.js - Final Registration and Launch"
          language="javascript"
          code="// Register all components
define({ tag: 'task-item', component: TaskItem });
define({ tag: 'add-task-form', component: AddTaskForm });
define({ tag: 'task-app', component: TaskApp });

// Launch the complete application
document.getElementById('app').innerHTML = '<task-app></task-app>';

console.log('Task Manager app loaded successfully!');"
        ></code-block>
        
        <div class="tip-box">
          <div class="tip-title">🎉 Congratulations!</div>
          <p>You've built a complete task management application! Your app now includes:</p>
          <ul>
            <li>✅ Add new tasks with validation</li>
            <li>✅ Mark tasks as complete/incomplete</li>
            <li>✅ Delete tasks</li>
            <li>✅ Real-time statistics</li>
            <li>✅ Data persistence with useStore</li>
            <li>✅ Beautiful responsive design</li>
            <li>✅ Empty state handling</li>
          </ul>
        </div>
        
        <div class="instruction-box">
          <div class="instruction-title">🚀 Test Your App:</div>
          <ol>
            <li>Start your local server and open the app</li>
            <li>Add several tasks using the form</li>
            <li>Mark some tasks as complete</li>
            <li>Delete a few tasks</li>
            <li>Refresh the page - your data persists!</li>
            <li>Watch the statistics update in real-time</li>
          </ol>
        </div>
      `
    }
  ];
  
  const currentStepData = steps[currentStep - 1];
  
  return html`
    <div class="task-tutorial">
      <div class="tutorial-header">
        <h1 class="tutorial-title">📝 Build a Task Manager</h1>
        <p class="tutorial-subtitle">
          Learn Dim by building a complete, real-world task management application with persistent data
        </p>
      </div>
      
      <div class="step-navigation">
        <div class="step-nav-title">Tutorial Steps</div>
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
define({ tag: 'live-preview', component: LivePreview });
define({ tag: 'task-app-tutorial', component: TaskAppTutorial });

export default {
  title: "Tutorial/04. Step-by-Step Guide",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Build a Complete Task Manager

A comprehensive step-by-step tutorial that guides you through building a full-featured task management application from scratch using Dim.

## What You'll Learn

- **Component Architecture**: How to break down an app into reusable components
- **State Management**: Using useStore for persistent data across page reloads
- **Event Handling**: Managing user interactions and component communication
- **Form Validation**: Building robust forms with real-time feedback
- **Styling Patterns**: Creating beautiful, responsive designs with scoped CSS

## Features We'll Build

- ✅ Add new tasks with validation
- ✅ Mark tasks complete/incomplete
- ✅ Delete tasks with confirmation
- ✅ Real-time statistics and counts
- ✅ Data persistence using IndexedDB
- ✅ Responsive design for mobile and desktop
- ✅ Empty state handling
- ✅ Character counting and limits

## Tutorial Structure

Each step builds progressively on the previous one:
1. **Project Setup** - File structure and basic HTML
2. **Task Item Component** - Individual task display
3. **Add Task Form** - Form handling and validation  
4. **Complete App** - Putting it all together with state management

Perfect for learning real-world Dim development patterns!
        `
      }
    }
  }
};

export const TaskAppPart1 = {
  render: wrapLitHtmlStory(() => html`<task-app-tutorial></task-app-tutorial>`),
  name: "Build a Task Manager App",
  parameters: {
    docs: {
      description: {
        story: `
### Complete Task Management Application

This tutorial walks you through building a sophisticated task management application that demonstrates real-world Dim development patterns.

**🎯 Learning Objectives:**
- Master component composition and communication
- Understand useStore for persistent state management
- Practice form handling and validation
- Learn responsive design with scoped CSS
- Implement CRUD operations (Create, Read, Update, Delete)

**🏗️ Architecture Patterns:**
- **Component-based design** with single responsibility
- **Props-based communication** between parent and child components
- **Event-driven updates** for reactive UI changes
- **Persistent state** that survives page reloads
- **Conditional rendering** for dynamic content

**💡 Key Features Demonstrated:**
- Form validation with real-time feedback
- Character counting and input limits
- Empty state handling for better UX
- Statistics and data visualization
- Hover effects and micro-interactions
- Mobile-responsive design

**🔧 Technical Concepts:**
- useStore for automatic IndexedDB persistence
- Component registration with useScope
- Event handler patterns and data flow
- CSS-in-JS with dynamic styling
- Template literal interpolation
- Array manipulation and state updates

Follow along step-by-step to build a production-ready task management application that showcases the power and simplicity of the Dim framework!
        `
      }
    }
  }
};