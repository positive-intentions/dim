import React from "react";
import { define, html, css, useState, useEffect, useStyle, useScope } from "../core/dim.ts";

// Tutorial Step Component - Shows code examples
const TutorialStep = ({ title, description, codeExample, liveDemo }, { html, css, useStyle }) => {
  useStyle(css`
    .tutorial-step {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .step-header {
      margin-bottom: 1.5rem;
    }

    .step-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .step-description {
      color: #666;
      line-height: 1.6;
    }

    .code-section {
      margin: 1.5rem 0;
    }

    .code-header {
      background: linear-gradient(135deg, #495057, #6c757d);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px 8px 0 0;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5rem;
      border-radius: 0 0 8px 8px;
      font-family: 'Consolas', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      overflow-x: auto;
    }

    .demo-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px solid #e9ecef;
    }

    .demo-header {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
    }
  `);

  return html`
    <div class="tutorial-step">
      <div class="step-header">
        <h2 class="step-title">${title}</h2>
        <p class="step-description">${description}</p>
      </div>

      ${codeExample ? html`
        <div class="code-section">
          <div class="code-header">📝 Code Example</div>
          <div class="code-block">
            <pre>${codeExample}</pre>
          </div>
        </div>
      ` : ''}

      ${liveDemo ? html`
        <div class="demo-section">
          <div class="demo-header">
            <span>✨</span>
            <span>Live Demo</span>
          </div>
          ${liveDemo}
        </div>
      ` : ''}
    </div>
  `;
};

// Counter Demo Component
const CounterDemo = (props, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);

  useStyle(css`
    .counter-demo {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .count-display {
      font-size: 3rem;
      font-weight: bold;
      color: #029cfd;
      margin-bottom: 1rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 10px 20px;
      font-size: 1rem;
      margin: 0 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0278c7;
    }
  `);

  return html`
    <div class="counter-demo">
      <div class="count-display">${count}</div>
      <button @click="${() => setCount(count + 1)}">Increment</button>
      <button @click="${() => setCount(count - 1)}">Decrement</button>
      <button @click="${() => setCount(0)}">Reset</button>
    </div>
  `;
};

// Todo List Demo Component
const TodoDemo = (props, { useState, html, css, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Dim basics', done: true },
    { id: 2, text: 'Build a todo app', done: false }
  ]);
  const [inputText, setInputText] = useState('');

  useStyle(css`
    .todo-demo {
      max-width: 400px;
      margin: 0 auto;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .todo-header {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .todo-input-group {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 4px;
      color: white;
      padding: 0.75rem 1.25rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0278c7;
    }

    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .todo-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
      gap: 0.75rem;
    }

    .todo-item:last-child {
      border-bottom: none;
    }

    .todo-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .todo-text {
      flex: 1;
      color: #333;
    }

    .todo-text.done {
      text-decoration: line-through;
      color: #999;
    }

    .delete-btn {
      background-color: #dc3545;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    }

    .delete-btn:hover {
      background-color: #c82333;
    }

    .todo-stats {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 0.875rem;
    }
  `);

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText,
        done: false
      }]);
      setInputText('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(todo => todo.done).length;

  return html`
    <div class="todo-demo">
      <h3 class="todo-header">📝 My Todo List</h3>
      
      <div class="todo-input-group">
        <input 
          type="text"
          placeholder="What needs to be done?"
          .value="${inputText}"
          @input="${(e) => setInputText(e.target.value)}"
          @keydown="${(e) => e.key === 'Enter' && addTodo()}"
        />
        <button @click="${addTodo}">Add</button>
      </div>

      <ul class="todo-list">
        ${todos.map(todo => html`
          <li class="todo-item">
            <input 
              type="checkbox"
              class="todo-checkbox"
              .checked="${todo.done}"
              @change="${() => toggleTodo(todo.id)}"
            />
            <span class="todo-text ${todo.done ? 'done' : ''}">${todo.text}</span>
            <button class="delete-btn" @click="${() => deleteTodo(todo.id)}">Delete</button>
          </li>
        `)}
      </ul>

      <div class="todo-stats">
        ${completedCount} of ${todos.length} completed
      </div>
    </div>
  `;
};

// Interactive Tutorial Component
const InteractiveTutorial = (props, { useState, html, css, useStyle, useScope }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useScope({
    'tutorial-step': TutorialStep,
    'counter-demo': CounterDemo,
    'todo-demo': TodoDemo
  });

  useStyle(css`
    .interactive-tutorial {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .tutorial-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
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
    }

    .step-navigation {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .nav-button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-button:hover {
      background-color: #0278c7;
    }

    .nav-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .step-indicator {
      text-align: center;
      margin-bottom: 2rem;
      color: #666;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      margin: 1rem 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }
  `);

  const tutorialSteps = [
    {
      title: "Step 1: Creating Your First Component",
      description: "Learn how to create a basic Dim component with the html template literal.",
      codeExample: `const HelloWorld = (props, { html }) => {
  return html\`
    <div>
      <h1>Hello, Dim!</h1>
      <p>Welcome to the framework</p>
    </div>
  \`;
};

// Register the component
define({ tag: 'hello-world', component: HelloWorld });`,
      liveDemo: null
    },
    {
      title: "Step 2: Adding State with useState",
      description: "Make your components interactive by managing state with the useState hook.",
      codeExample: `const Counter = (props, { useState, html }) => {
  const [count, setCount] = useState(0);
  
  return html\`
    <div>
      <h2>Count: \${count}</h2>
      <button @click="\${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  \`;
};`,
      liveDemo: html`<counter-demo></counter-demo>`
    },
    {
      title: "Step 3: Building a Todo List",
      description: "Combine multiple concepts to build a functional todo list application.",
      codeExample: `const TodoList = (props, { useState, html }) => {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText,
        done: false
      }]);
      setInputText('');
    }
  };
  
  return html\`
    <div>
      <input 
        .value="\${inputText}"
        @input="\${(e) => setInputText(e.target.value)}"
      />
      <button @click="\${addTodo}">Add Todo</button>
      
      <ul>
        \${todos.map(todo => html\`
          <li>\${todo.text}</li>
        \`)}
      </ul>
    </div>
  \`;
};`,
      liveDemo: html`<todo-demo></todo-demo>`
    }
  ];

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return html`
    <div class="interactive-tutorial">
      <div class="tutorial-header">
        <h1 class="tutorial-title">🎓 Interactive Dim Tutorial</h1>
        <p class="tutorial-subtitle">Learn by building - from basics to a complete application</p>
      </div>

      <div class="step-indicator">
        Step ${currentStep + 1} of ${tutorialSteps.length}
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>

      <div class="step-navigation">
        <button 
          class="nav-button" 
          @click="${() => setCurrentStep(currentStep - 1)}"
          ?disabled="${currentStep === 0}"
        >
          ← Previous
        </button>
        <button 
          class="nav-button" 
          @click="${() => setCurrentStep(currentStep + 1)}"
          ?disabled="${currentStep === tutorialSteps.length - 1}"
        >
          Next →
        </button>
      </div>

      <tutorial-step
        title="${tutorialSteps[currentStep].title}"
        description="${tutorialSteps[currentStep].description}"
        codeExample="${tutorialSteps[currentStep].codeExample}"
        liveDemo="${tutorialSteps[currentStep].liveDemo}"
      ></tutorial-step>
    </div>
  `;
};

// Quick Start Guide Component
const QuickStartGuide = (props, { html, css, useStyle }) => {
  useStyle(css`
    .quick-start {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .guide-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .code-snippet {
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.875rem;
      margin: 1rem 0;
      overflow-x: auto;
    }

    .highlight {
      background-color: #fff3cd;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-weight: 600;
    }

    ul {
      padding-left: 1.5rem;
      line-height: 1.8;
    }

    .tip-box {
      background: #e7f3ff;
      border-left: 4px solid #029cfd;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }

    .tip-title {
      font-weight: 600;
      color: #0056b3;
      margin-bottom: 0.5rem;
    }
  `);

  return html`
    <div class="quick-start">
      <div class="guide-section">
        <h2 class="section-title">
          <span>🚀</span>
          <span>Quick Start with Dim</span>
        </h2>
        
        <p>Get up and running with Dim in under 5 minutes!</p>

        <h3>1. Installation</h3>
        <div class="code-snippet">
npm install @dim/core
# or include directly in your HTML
&lt;script type="module" src="path/to/dim.js"&gt;&lt;/script&gt;
        </div>

        <h3>2. Create Your First Component</h3>
        <div class="code-snippet">
import { html, define } from '@dim/core';

const App = (props, { html }) => {
  return html\`&lt;h1&gt;Hello Dim!&lt;/h1&gt;\`;
};

define({ tag: 'my-app', component: App });
        </div>

        <h3>3. Use It</h3>
        <div class="code-snippet">
&lt;my-app&gt;&lt;/my-app&gt;
        </div>

        <div class="tip-box">
          <div class="tip-title">💡 Pro Tip</div>
          <p>Dim components are Web Components under the hood, so they work everywhere HTML works!</p>
        </div>
      </div>

      <div class="guide-section">
        <h2 class="section-title">
          <span>📚</span>
          <span>Core Concepts</span>
        </h2>
        
        <ul>
          <li><span class="highlight">Components</span> - Functions that return HTML templates</li>
          <li><span class="highlight">Hooks</span> - Add state and effects to components</li>
          <li><span class="highlight">Scoped Styles</span> - CSS that's automatically isolated</li>
          <li><span class="highlight">Web Standards</span> - Built on native Web Components</li>
        </ul>
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'tutorial-step', component: TutorialStep });
define({ tag: 'counter-demo', component: CounterDemo });
define({ tag: 'todo-demo', component: TodoDemo });
define({ tag: 'interactive-tutorial', component: InteractiveTutorial });
define({ tag: 'quick-start-guide', component: QuickStartGuide });

export default {
  title: "Tutorial",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Learn Dim through hands-on tutorials and interactive examples.

## 🎯 Learning Paths

### Quick Start (5 minutes)
Perfect for getting a taste of Dim. Learn the basics and build your first component.

### Interactive Tutorial (30 minutes)
Step-by-step guide that teaches core concepts through building progressively complex components.

### Build a Todo App (2 hours)
Comprehensive tutorial that covers all aspects of Dim by building a complete application.

## 📚 What You'll Learn

### Fundamentals
\`\`\`javascript
// Creating components
const MyComponent = (props, { html }) => {
  return html\`<div>Hello!</div>\`;
};

// Using hooks for state
const [value, setValue] = useState(0);

// Adding scoped styles
useStyle(css\`
  .my-class { color: blue; }
\`);
\`\`\`

### Advanced Concepts
- Component composition with \`useScope\`
- Side effects with \`useEffect\`
- Performance optimization with \`useMemo\`
- Global state with \`useStore\`

## 🛠️ Prerequisites

- Basic HTML/CSS/JavaScript knowledge
- Familiarity with ES6+ syntax
- Understanding of component-based architecture (helpful but not required)

## 🚀 Getting Started

Choose your learning path above and start building with Dim today!
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const QuickStart = {
  render: () => <quick-start-guide />,
  name: "Quick Start Guide",
  parameters: {
    docs: {
      description: {
        story: "Get up and running with Dim in under 5 minutes. Perfect for developers who want to quickly try out the framework."
      }
    }
  }
};

export const StepByStep = {
  render: () => <interactive-tutorial />,
  name: "Interactive Tutorial",
  parameters: {
    docs: {
      description: {
        story: "Learn Dim concepts step-by-step with live code examples and interactive demos. Great for understanding core concepts."
      }
    }
  }
};