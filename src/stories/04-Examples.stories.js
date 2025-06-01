import React from "react";
import { define, html, css, useState, useEffect, useStyle, useScope } from "../core/dim.ts";

// Counter Example Component
const CounterExample = (props, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useStyle(css`
    .counter-example {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
      margin: 0 auto;
    }

    .counter-display {
      text-align: center;
      margin-bottom: 2rem;
    }

    .count-value {
      font-size: 4rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 1rem 0;
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 8px;
      color: white;
      padding: 12px 24px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    button:hover {
      background-color: #0278c7;
      transform: translateY(-2px);
    }

    button:active {
      transform: translateY(0);
    }

    .reset-button {
      background-color: #6c757d;
    }

    .reset-button:hover {
      background-color: #5a6268;
    }

    .step-control {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .step-label {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .step-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin-top: 0.25rem;
    }
  `);

  return html`
    <div class="counter-example">
      <div class="counter-display">
        <h3>Advanced Counter</h3>
        <div class="count-value">${count}</div>
      </div>

      <div class="controls">
        <button @click="${() => setCount(count - step)}">
          <span>−</span>
          <span>Decrease</span>
        </button>
        <button class="reset-button" @click="${() => setCount(0)}">
          <span>⟲</span>
          <span>Reset</span>
        </button>
        <button @click="${() => setCount(count + step)}">
          <span>+</span>
          <span>Increase</span>
        </button>
      </div>

      <div class="step-control">
        <div class="step-label">Step Size</div>
        <input 
          type="number"
          class="step-input"
          .value="${step}"
          @input="${(e) => setStep(parseInt(e.target.value) || 1)}"
          min="1"
          max="100"
        />
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Current</div>
          <div class="stat-value">${count}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Step</div>
          <div class="stat-value">${step}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Next</div>
          <div class="stat-value">${count + step}</div>
        </div>
      </div>
    </div>
  `;
};

// Todo List Example Component
const TodoListExample = (props, { useState, useEffect, html, css, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Dim basics', completed: true },
    { id: 2, text: 'Build a component', completed: false },
    { id: 3, text: 'Master hooks', completed: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    setStats({ total, completed, pending });
  }, [todos]);

  useStyle(css`
    .todo-example {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 0 auto;
    }

    .todo-header {
      margin-bottom: 2rem;
    }

    .todo-title {
      font-size: 1.5rem;
      color: #333;
      margin-bottom: 1rem;
    }

    .todo-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat {
      flex: 1;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #029cfd;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #6c757d;
      text-transform: uppercase;
    }

    .todo-input-group {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .todo-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .todo-input:focus {
      outline: none;
      border-color: #029cfd;
    }

    .add-button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }

    .add-button:hover {
      background: #0278c7;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .filter-button {
      flex: 1;
      padding: 0.5rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .filter-button.active {
      background: #029cfd;
      color: white;
      border-color: #029cfd;
    }

    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
    }

    .todo-item:hover {
      background: #e9ecef;
    }

    .todo-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .todo-text {
      flex: 1;
      color: #333;
      transition: all 0.2s;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: #6c757d;
    }

    .delete-button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      opacity: 0;
      transition: all 0.2s;
    }

    .todo-item:hover .delete-button {
      opacity: 1;
    }

    .delete-button:hover {
      background: #c82333;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  `);

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText.trim(),
        completed: false
      }]);
      setInputText('');
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

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return html`
    <div class="todo-example">
      <div class="todo-header">
        <h3 class="todo-title">📝 Task Manager</h3>
        
        <div class="todo-stats">
          <div class="stat">
            <div class="stat-number">${stats.total}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat">
            <div class="stat-number">${stats.completed}</div>
            <div class="stat-label">Done</div>
          </div>
          <div class="stat">
            <div class="stat-number">${stats.pending}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>

      <div class="todo-input-group">
        <input 
          type="text"
          class="todo-input"
          placeholder="What needs to be done?"
          .value="${inputText}"
          @input="${(e) => setInputText(e.target.value)}"
          @keydown="${(e) => e.key === 'Enter' && addTodo()}"
        />
        <button class="add-button" @click="${addTodo}">Add Task</button>
      </div>

      <div class="filter-buttons">
        <button 
          class="filter-button ${filter === 'all' ? 'active' : ''}"
          @click="${() => setFilter('all')}"
        >
          All (${todos.length})
        </button>
        <button 
          class="filter-button ${filter === 'active' ? 'active' : ''}"
          @click="${() => setFilter('active')}"
        >
          Active (${stats.pending})
        </button>
        <button 
          class="filter-button ${filter === 'completed' ? 'active' : ''}"
          @click="${() => setFilter('completed')}"
        >
          Completed (${stats.completed})
        </button>
      </div>

      ${filteredTodos.length === 0 ? html`
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No tasks found</p>
        </div>
      ` : html`
        <ul class="todo-list">
          ${filteredTodos.map(todo => html`
            <li class="todo-item">
              <input 
                type="checkbox"
                class="todo-checkbox"
                .checked="${todo.completed}"
                @change="${() => toggleTodo(todo.id)}"
              />
              <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
              <button class="delete-button" @click="${() => deleteTodo(todo.id)}">Delete</button>
            </li>
          `)}
        </ul>
      `}
    </div>
  `;
};

// Form Example Component
const FormExample = (props, { useState, html, css, useStyle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useStyle(css`
    .form-example {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
      margin: 0 auto;
    }

    .form-title {
      font-size: 1.5rem;
      color: #333;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
      font-weight: 500;
    }

    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #029cfd;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .submit-button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      width: 100%;
    }

    .submit-button:hover {
      background: #0278c7;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .form-preview {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .preview-title {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    .preview-content {
      font-family: monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
    }
  `);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return html`
    <div class="form-example">
      <h3 class="form-title">📬 Contact Form</h3>
      
      ${submitted ? html`
        <div class="success-message">
          ✓ Form submitted successfully!
        </div>
      ` : ''}

      <form @submit="${handleSubmit}">
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text"
            id="name"
            .value="${formData.name}"
            @input="${(e) => handleInputChange('name', e.target.value)}"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email"
            id="email"
            .value="${formData.email}"
            @input="${(e) => handleInputChange('email', e.target.value)}"
            required
          />
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea 
            id="message"
            .value="${formData.message}"
            @input="${(e) => handleInputChange('message', e.target.value)}"
            required
          ></textarea>
        </div>

        <button type="submit" class="submit-button">Send Message</button>
      </form>

      <div class="form-preview">
        <div class="preview-title">Form Data Preview</div>
        <div class="preview-content">${JSON.stringify(formData, null, 2)}</div>
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'counter-example', component: CounterExample });
define({ tag: 'todo-list-example', component: TodoListExample });
define({ tag: 'form-example', component: FormExample });

export default {
  title: "Examples",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Interactive examples demonstrating real-world Dim patterns and best practices.

## 🎯 Example Categories

### Basic Examples
Learn fundamental concepts through simple, focused examples:
- **Counter**: State management and event handling
- **Forms**: Controlled inputs and form submission
- **Toggle**: Conditional rendering patterns

### Intermediate Examples
Build more complex interactions:
- **Todo List**: CRUD operations with arrays
- **Shopping Cart**: Complex state management
- **Data Tables**: Sorting and filtering

### Advanced Examples
Master advanced patterns:
- **Real-time Updates**: WebSocket integration
- **State Persistence**: Using useStore
- **Component Composition**: Building complex UIs

## 💡 Learning Tips

### For Each Example:
1. **Try It**: Interact with the live demo
2. **Read Code**: Study the implementation
3. **Modify**: Try changing the code
4. **Apply**: Use patterns in your projects

### Code Patterns

\`\`\`javascript
// State Management
const [value, setValue] = useState(initialValue);

// Event Handling
@click="\${() => handleClick()}"

// Conditional Rendering
\${condition ? html\`<div>True</div>\` : html\`<div>False</div>\`}

// List Rendering
\${items.map(item => html\`<li>\${item}</li>\`)}
\`\`\`

## 🚀 Best Practices

1. **Keep State Local**: Only lift state when needed
2. **Use Semantic HTML**: Accessibility matters
3. **Optimize Renders**: Use keys in lists
4. **Handle Edge Cases**: Empty states, loading, errors
5. **Style Scoping**: Leverage Shadow DOM isolation
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const Counter = {
  render: () => <counter-example />,
  name: "Counter with Step Control",
  parameters: {
    docs: {
      description: {
        story: "An advanced counter demonstrating state management, computed values, and dynamic step control."
      }
    }
  }
};

export const TodoList = {
  render: () => <todo-list-example />,
  name: "Todo List with Filters",
  parameters: {
    docs: {
      description: {
        story: "A feature-rich todo list with add, toggle, delete, and filtering capabilities. Shows array state management and computed statistics."
      }
    }
  }
};

export const ContactForm = {
  render: () => <form-example />,
  name: "Controlled Form",
  parameters: {
    docs: {
      description: {
        story: "A contact form demonstrating controlled inputs, form submission, and real-time data preview."
      }
    }
  }
};