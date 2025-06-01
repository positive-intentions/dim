import React from "react";
import { html, css, define, useState, useEffect, useMemo, useRef, useStyle, useScope, useStore } from "../core/dim.ts";
import { wrapLitHtmlStory } from "../core/storybook-utils.js";

// Example Card Component
const ExampleCard = ({ title, description, difficulty, tags, demoComponent, codeComponent }, { html, css, useStyle, useScope }) => {
  useScope({
    'demo-component': demoComponent,
    'code-component': codeComponent
  });

  useStyle(css`
    .example-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.2s;
    }
    
    .example-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }
    
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .card-description {
      color: #6c757d;
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .card-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    
    .difficulty {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .difficulty.beginner {
      background: #d4edda;
      color: #155724;
    }
    
    .difficulty.intermediate {
      background: #fff3cd;
      color: #856404;
    }
    
    .difficulty.advanced {
      background: #f8d7da;
      color: #721c24;
    }
    
    .tags {
      display: flex;
      gap: 0.5rem;
    }
    
    .tag {
      background: #e7f3ff;
      color: #0056b3;
      padding: 0.2rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .demo-section {
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }
  `);

  return html`
    <div class="example-card">
      <div class="card-header">
        <h3 class="card-title">${title}</h3>
        <p class="card-description">${description}</p>
        <div class="card-meta">
          <span class="difficulty ${difficulty}">${difficulty}</span>
          <div class="tags">
            ${tags.map(tag => html`<span class="tag">${tag}</span>`)}
          </div>
        </div>
      </div>
      <div class="card-content">
        <div class="demo-section">
          <h4 class="section-title">🎮 Interactive Demo</h4>
          <demo-component></demo-component>
        </div>
        <div class="code-section">
          <h4 class="section-title">💻 Source Code</h4>
          <code-component></code-component>
        </div>
      </div>
    </div>
  `;
};

// Code Display Component
const CodeDisplay = ({ code, fileName }, { html, css, useStyle }) => {
  useStyle(css`
    .code-display {
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .code-header {
      background: #2d2d30;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #3e3e42;
      font-size: 0.875rem;
      font-family: 'Consolas', monospace;
    }
    
    .code-content {
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
      .replace(/\b(const|let|var|function|return|import|export|from)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(useState|useEffect|useStyle|html|css)\b/g, '<span class="function">$1</span>')
      .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '<span class="string">$&</span>')
      .replace(/\b\d+\b/g, '<span class="number">$&</span>');
  };

  return html`
    <div class="code-display">
      <div class="code-header">${fileName}</div>
      <div class="code-content">
        <pre .innerHTML="${highlightCode(code)}"></pre>
      </div>
    </div>
  `;
};

// Example 1: Interactive Counter
const CounterDemo = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);

  useStyle(css`
    .counter-demo {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .count-display {
      font-size: 3rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .counter-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    .counter-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }
  `);

  return html`
    <div class="counter-demo">
      <h3>Interactive Counter</h3>
      <div class="count-display">${count}</div>
      <button class="counter-btn" @click="${() => setCount(count - 1)}">-</button>
      <button class="counter-btn" @click="${() => setCount(0)}">Reset</button>
      <button class="counter-btn" @click="${() => setCount(count + 1)}">+</button>
    </div>
  `;
};

const CounterCode = (_, { useScope }) => {
  useScope({ 'code-display': CodeDisplay });

  return html`
    <code-display
      fileName="counter.js"
      code="const Counter = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);

  useStyle(css\`
    .counter-demo {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .count-display {
      font-size: 3rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .counter-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin: 0.5rem;
      transition: all 0.2s;
    }
  \`);

  return html\`
    <div class=\"counter-demo\">
      <h3>Interactive Counter</h3>
      <div class=\"count-display\">\${count}</div>
      <button class=\"counter-btn\" @click=\"\${() => setCount(count - 1)}\">-</button>
      <button class=\"counter-btn\" @click=\"\${() => setCount(0)}\">Reset</button>
      <button class=\"counter-btn\" @click=\"\${() => setCount(count + 1)}\">+</button>
    </div>
  \`;
};"
    ></code-display>
  `;
};

// Example 2: Todo List
const TodoDemo = (_, { useState, html, css, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Dim framework', completed: false },
    { id: 2, text: 'Build a todo app', completed: true }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  useStyle(css`
    .todo-demo {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .todo-input-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .todo-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    .todo-text {
      flex: 1;
      transition: all 0.2s;
    }
    
    .todo-text.completed {
      text-decoration: line-through;
      opacity: 0.6;
    }
    
    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
  `);

  return html`
    <div class="todo-demo">
      <h3>Todo List</h3>
      <div class="todo-input-row">
        <input 
          class="todo-input"
          .value="${newTodo}"
          @input="${(e) => setNewTodo(e.target.value)}"
          @keypress="${(e) => e.key === 'Enter' && addTodo()}"
          placeholder="Add a new todo..."
        />
        <button class="add-btn" @click="${addTodo}">Add</button>
      </div>
      
      ${todos.map(todo => html`
        <div class="todo-item">
          <input 
            type="checkbox"
            .checked="${todo.completed}"
            @change="${() => toggleTodo(todo.id)}"
          />
          <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
          <button class="delete-btn" @click="${() => deleteTodo(todo.id)}">Delete</button>
        </div>
      `)}
    </div>
  `;
};

const TodoCode = (_, { useScope }) => {
  useScope({ 'code-display': CodeDisplay });

  return html`
    <code-display
      fileName="todo-list.js"
      code="const TodoList = (_, { useState, html, css, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Dim framework', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  useStyle(css\`
    .todo-demo {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .todo-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
  \`);

  return html\`
    <div class=\"todo-demo\">
      <div class=\"todo-input-row\">
        <input 
          class=\"todo-input\"
          .value=\"\${newTodo}\"
          @input=\"\${(e) => setNewTodo(e.target.value)}\"
          placeholder=\"Add a new todo...\"
        />
        <button @click=\"\${addTodo}\">Add</button>
      </div>
      
      \${todos.map(todo => html\`
        <div class=\"todo-item\">
          <input 
            type=\"checkbox\"
            .checked=\"\${todo.completed}\"
            @change=\"\${() => toggleTodo(todo.id)}\"
          />
          <span class=\"todo-text\">\${todo.text}</span>
        </div>
      \`)}
    </div>
  \`;
};"
    ></code-display>
  `;
};

// Main Examples Component
const Examples = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'example-card': ExampleCard,
    'counter-demo': CounterDemo,
    'counter-code': CounterCode,
    'todo-demo': TodoDemo,
    'todo-code': TodoCode
  });

  useStyle(css`
    .examples {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .examples-header {
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 16px;
    }
    
    .examples-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .examples-subtitle {
      font-size: 1.125rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }
  `);

  return html`
    <div class="examples">
      <div class="examples-header">
        <h1 class="examples-title">🎯 Live Examples</h1>
        <p class="examples-subtitle">
          Interactive code examples showcasing real-world Dim patterns and techniques
        </p>
      </div>
      
      <example-card
        title="Interactive Counter"
        description="A simple counter demonstrating useState hook and event handling. Perfect for understanding reactive state management."
        difficulty="beginner"
        tags="${['useState', 'events', 'styling']}"
        demoComponent="${CounterDemo}"
        codeComponent="${CounterCode}"
      ></example-card>
      
      <example-card
        title="Todo List Application"
        description="A fully functional todo list with add, toggle, and delete operations. Shows array state management and list rendering."
        difficulty="intermediate"
        tags="${['useState', 'arrays', 'forms', 'events']}"
        demoComponent="${TodoDemo}"
        codeComponent="${TodoCode}"
      ></example-card>
    </div>
  `;
};

// Register components
define({ tag: 'example-card', component: ExampleCard });
define({ tag: 'code-display', component: CodeDisplay });
define({ tag: 'counter-demo', component: CounterDemo });
define({ tag: 'counter-code', component: CounterCode });
define({ tag: 'todo-demo', component: TodoDemo });
define({ tag: 'todo-code', component: TodoCode });
define({ tag: 'examples', component: Examples });

export default {
  title: "Examples",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Live Examples

Explore real-world Dim patterns through interactive examples. Each example includes a live demo and complete source code.

## Example Categories

### 🟢 Beginner Examples
- **Counter**: Basic state management and events
- **Form Input**: Controlled components and user input
- **Toggle Components**: Conditional rendering patterns

### 🟡 Intermediate Examples  
- **Todo List**: CRUD operations and array state
- **Shopping Cart**: Complex state management
- **Data Fetching**: API integration with useEffect

### 🔴 Advanced Examples
- **Real-time Chat**: WebSocket integration
- **Dashboard**: Complex component composition
- **State Management**: Advanced patterns with useStore

## Learning Benefits

- **Interactive**: Try the code immediately
- **Complete**: Full source code included
- **Progressive**: Examples build in complexity
- **Practical**: Real-world application patterns

Each example is self-contained and can be copied directly into your projects!
        `
      }
    }
  }
};

export const LiveDemos = {
  render: wrapLitHtmlStory(() => html`<examples></examples>`),
  name: "Interactive Demos",
  parameters: {
    docs: {
      description: {
        story: `
### Interactive Code Examples

Explore Dim through hands-on examples that you can interact with immediately. Each example demonstrates key concepts:

**🎮 Live Interaction**
- Try the examples directly in your browser
- See how state changes affect the UI in real-time
- Experiment with different inputs and interactions

**💻 Complete Source Code**
- Full, runnable code for each example
- Syntax highlighting for better readability
- Copy-paste ready for your own projects

**📚 Progressive Learning**
- Examples range from beginner to advanced
- Each builds on concepts from previous examples
- Clear categorization by difficulty level

**🏷️ Organized by Concepts**
- Tagged by the hooks and patterns they demonstrate
- Easy to find examples for specific techniques
- Perfect for reference during development

Start with the Counter example to understand basic state management, then progress to the Todo List for more complex interactions!
        `
      }
    }
  }
};