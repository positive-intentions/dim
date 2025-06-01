import React from "react";
import { html, css, define, useState, useEffect, useMemo, useRef, useScope, useStore, useStyle, unsafeCSS } from "../core/dim.ts";
import { wrapLitHtmlStory } from "../core/storybook-utils.js";

// Tutorial Components
const CodeExample = ({ code, language = 'javascript' }, { html, css, useStyle }) => {
  useStyle(css`
    .code-example {
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      margin: 1rem 0;
    }
    
    .code-example pre {
      margin: 0;
    }
    
    .code-example code {
      white-space: pre;
    }
  `);
  
  return html`
    <div class="code-example">
      <pre><code>${code}</code></pre>
    </div>
  `;
};

const LiveDemo = ({ title, description, children }, { html, css, useStyle, renderChildren }) => {
  useStyle(css`
    .live-demo {
      border: 2px solid #029cfd;
      border-radius: 8px;
      margin: 2rem 0;
      overflow: hidden;
    }
    
    .demo-header {
      background-color: #029cfd;
      color: white;
      padding: 1rem;
    }
    
    .demo-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .demo-description {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    
    .demo-content {
      padding: 2rem;
      background-color: #f8f9fa;
    }
  `);
  
  return html`
    <div class="live-demo">
      <div class="demo-header">
        <div class="demo-title">${title}</div>
        ${description ? html`<div class="demo-description">${description}</div>` : ''}
      </div>
      <div class="demo-content">
        ${renderChildren(children)}
      </div>
    </div>
  `;
};

// Demo Components for Tutorial
const CounterDemo = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  
  useStyle(css`
    .counter-demo {
      text-align: center;
    }
    
    .count-display {
      font-size: 3rem;
      font-weight: bold;
      color: #029cfd;
      margin: 1rem 0;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    button {
      background-color: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    button:hover {
      background-color: #0278c7;
    }
    
    button:active {
      transform: scale(0.98);
    }
  `);
  
  return html`
    <div class="counter-demo">
      <div class="count-display">${count}</div>
      <div class="button-group">
        <button @click="${() => setCount(count - 1)}">Decrement</button>
        <button @click="${() => setCount(0)}">Reset</button>
        <button @click="${() => setCount(count + 1)}">Increment</button>
      </div>
    </div>
  `;
};

const InputDemo = (_, { useState, html, css, useStyle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  useStyle(css`
    .input-demo {
      max-width: 400px;
      margin: 0 auto;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #333;
    }
    
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input:focus {
      outline: none;
      border-color: #029cfd;
      box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
    }
    
    .preview {
      background-color: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
    
    .preview-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
  `);
  
  return html`
    <div class="input-demo">
      <div class="form-group">
        <label for="name">Name:</label>
        <input 
          id="name"
          type="text" 
          .value="${name}"
          @input="${(e) => setName(e.target.value)}"
          placeholder="Enter your name"
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          id="email"
          type="email" 
          .value="${email}"
          @input="${(e) => setEmail(e.target.value)}"
          placeholder="Enter your email"
        />
      </div>
      
      ${(name || email) ? html`
        <div class="preview">
          <div class="preview-title">Preview:</div>
          <div>Name: ${name || 'Not provided'}</div>
          <div>Email: ${email || 'Not provided'}</div>
        </div>
      ` : ''}
    </div>
  `;
};

const StyleDemo = (_, { useState, html, css, useStyle }) => {
  const [primaryColor, setPrimaryColor] = useState('#029cfd');
  const [borderRadius, setBorderRadius] = useState(8);
  
  useStyle(css`
    .style-demo {
      display: flex;
      gap: 2rem;
      align-items: start;
    }
    
    .controls {
      flex: 1;
    }
    
    .preview-box {
      flex: 1;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: all 0.3s;
    }
    
    .control-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    
    input[type="color"] {
      width: 100%;
      height: 40px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    input[type="range"] {
      width: 100%;
    }
    
    .value-display {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
    }
  `);
  
  return html`
    <div class="style-demo">
      <div class="controls">
        <div class="control-group">
          <label for="color">Primary Color:</label>
          <input 
            id="color"
            type="color" 
            .value="${primaryColor}"
            @input="${(e) => setPrimaryColor(e.target.value)}"
          />
          <div class="value-display">${primaryColor}</div>
        </div>
        
        <div class="control-group">
          <label for="radius">Border Radius:</label>
          <input 
            id="radius"
            type="range" 
            min="0" 
            max="50" 
            .value="${borderRadius}"
            @input="${(e) => setBorderRadius(e.target.value)}"
          />
          <div class="value-display">${borderRadius}px</div>
        </div>
      </div>
      
      <div 
        class="preview-box"
        style="background-color: ${primaryColor}; border-radius: ${borderRadius}px;"
      >
        Styled Component
      </div>
    </div>
  `;
};

const EffectDemo = (_, { useState, useEffect, html, css, useStyle }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);
  
  useStyle(css`
    .effect-demo {
      text-align: center;
    }
    
    .timer-display {
      font-size: 4rem;
      font-weight: bold;
      color: #029cfd;
      margin: 2rem 0;
      font-variant-numeric: tabular-nums;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    button {
      background-color: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    button:hover {
      background-color: #0278c7;
    }
    
    button.stop {
      background-color: #dc3545;
    }
    
    button.stop:hover {
      background-color: #c82333;
    }
    
    button.reset {
      background-color: #6c757d;
    }
    
    button.reset:hover {
      background-color: #5a6268;
    }
  `);
  
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return html`
    <div class="effect-demo">
      <div class="timer-display">${formatTime(seconds)}</div>
      <div class="button-group">
        ${!isRunning ? html`
          <button @click="${() => setIsRunning(true)}">Start</button>
        ` : html`
          <button class="stop" @click="${() => setIsRunning(false)}">Stop</button>
        `}
        <button class="reset" @click="${() => { setSeconds(0); setIsRunning(false); }}">Reset</button>
      </div>
    </div>
  `;
};

// Advanced Feature Demos

// useScope Demo - Parent/Child Component Composition
const ScopeDemo = (_, { useState, useScope, html, css, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn useScope', completed: false },
    { id: 2, text: 'Build nested components', completed: true }
  ]);
  
  // Register child components in scope
  useScope({
    'todo-item': TodoItem,
    'add-todo-form': AddTodoForm
  });
  
  const addTodo = (text) => {
    setTodos([...todos, {
      id: Date.now(),
      text,
      completed: false
    }]);
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
    .scope-demo {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .scope-header {
      background: linear-gradient(135deg, #029cfd, #0278c7);
      color: white;
      padding: 1.5rem;
      text-align: center;
    }
    
    .scope-content {
      padding: 1.5rem;
    }
    
    .scope-info {
      background: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #0056b3;
    }
  `);
  
  return html`
    <div class="scope-demo">
      <div class="scope-header">
        <h3>🔧 useScope Demo</h3>
        <p>Component Composition with Scoped Children</p>
      </div>
      <div class="scope-content">
        <div class="scope-info">
          ✨ The TodoItem and AddTodoForm components are registered using useScope, 
          creating clean component composition without global namespace pollution.
        </div>
        
        <add-todo-form .props="${{ onAdd: addTodo }}"></add-todo-form>
        
        ${todos.map(todo => html`
          <todo-item 
            .props="${{ 
              todo, 
              onToggle: () => toggleTodo(todo.id),
              onDelete: () => deleteTodo(todo.id)
            }}"
          ></todo-item>
        `)}
      </div>
    </div>
  `;
};

// Child components for useScope demo
const TodoItem = ({ todo, onToggle, onDelete }, { html, css, useStyle }) => {
  useStyle(css`
    .todo-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
    }
    
    .todo-item:hover {
      background: #f8f9fa;
    }
    
    .todo-checkbox {
      margin-right: 0.75rem;
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
    
    .delete-btn:hover {
      background: #c82333;
    }
  `);
  
  return html`
    <div class="todo-item">
      <input 
        type="checkbox" 
        class="todo-checkbox"
        .checked="${todo.completed}"
        @change="${onToggle}"
      />
      <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
      <button class="delete-btn" @click="${onDelete}">✕</button>
    </div>
  `;
};

const AddTodoForm = ({ onAdd }, { useState, html, css, useStyle }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };
  
  useStyle(css`
    .add-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .add-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .add-input:focus {
      outline: none;
      border-color: #029cfd;
      box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
    }
    
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .add-btn:hover {
      background: #218838;
    }
    
    .add-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  `);
  
  return html`
    <form class="add-form" @submit="${handleSubmit}">
      <input 
        type="text"
        class="add-input"
        .value="${text}"
        @input="${(e) => setText(e.target.value)}"
        placeholder="Add a new todo..."
      />
      <button type="submit" class="add-btn" ?disabled="${!text.trim()}">
        Add Todo
      </button>
    </form>
  `;
};

// useStore Demo - Global State Management
const StoreDemo = (_, { useStore, useState, html, css, useStyle, useScope }) => {
  // Create a global store
  const store = useStore({
    user: useState({ name: 'John Doe', email: 'john@example.com' }),
    settings: {
      theme: useState('light'),
      notifications: useState(true)
    },
    counter: useState(0),
    cart: {
      items: useState([]),
      total: useState(0)
    }
  });
  
  useScope({
    'user-profile': UserProfile,
    'settings-panel': SettingsPanel,
    'counter-widget': CounterWidget,
    'shopping-cart': ShoppingCart
  });
  
  useStyle(css`
    .store-demo {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .store-header {
      background: linear-gradient(135deg, #6f42c1, #e83e8c);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .components-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .components-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .store-info {
      background: #f8f4ff;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
      color: #6f42c1;
      font-size: 0.875rem;
    }
  `);
  
  return html`
    <div class="store-demo">
      <div class="store-header">
        <h3>💾 useStore Demo</h3>
        <p>Global State Management with Automatic Persistence</p>
      </div>
      
      <div class="store-info">
        🔄 All state changes are automatically shared between components and persisted to IndexedDB.
        Try refreshing the page to see persistence in action!
      </div>
      
      <div class="components-grid">
        <user-profile .props="${{ store }}"></user-profile>
        <settings-panel .props="${{ store }}"></settings-panel>
        <counter-widget .props="${{ store }}"></counter-widget>
        <shopping-cart .props="${{ store }}"></shopping-cart>
      </div>
    </div>
  `;
};

// Child components for useStore demo
const UserProfile = ({ store }, { html, css, useStyle }) => {
  const [user, setUser] = store.user;
  
  useStyle(css`
    .user-profile {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6f42c1, #e83e8c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.25rem;
    }
    
    .profile-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
  `);
  
  return html`
    <div class="user-profile">
      <h4>👤 User Profile</h4>
      <div class="profile-header">
        <div class="avatar">${user.name.charAt(0)}</div>
        <div>
          <div><strong>${user.name}</strong></div>
          <div>${user.email}</div>
        </div>
      </div>
      
      <input 
        type="text"
        class="profile-input"
        .value="${user.name}"
        @input="${(e) => setUser({ ...user, name: e.target.value })}"
        placeholder="Name"
      />
      <input 
        type="email"
        class="profile-input"
        .value="${user.email}"
        @input="${(e) => setUser({ ...user, email: e.target.value })}"
        placeholder="Email"
      />
    </div>
  `;
};

const SettingsPanel = ({ store }, { html, css, useStyle }) => {
  const [theme, setTheme] = store.settings.theme;
  const [notifications, setNotifications] = store.settings.notifications;
  
  useStyle(css`
    .settings-panel {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .setting-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .setting-checkbox {
      transform: scale(1.2);
    }
    
    .current-theme {
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      text-align: center;
      transition: all 0.3s;
    }
    
    .current-theme.light {
      background: #f8f9fa;
      color: #333;
    }
    
    .current-theme.dark {
      background: #2d3748;
      color: white;
    }
  `);
  
  return html`
    <div class="settings-panel">
      <h4>⚙️ Settings</h4>
      
      <div class="setting-item">
        <label>Theme:</label>
        <select 
          class="setting-select"
          .value="${theme}"
          @change="${(e) => setTheme(e.target.value)}"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      
      <div class="setting-item">
        <label>Notifications:</label>
        <input 
          type="checkbox"
          class="setting-checkbox"
          .checked="${notifications}"
          @change="${(e) => setNotifications(e.target.checked)}"
        />
      </div>
      
      <div class="current-theme ${theme}">
        Current theme: ${theme}
        ${notifications ? '🔔' : '🔕'}
      </div>
    </div>
  `;
};

const CounterWidget = ({ store }, { html, css, useStyle }) => {
  const [counter, setCounter] = store.counter;
  
  useStyle(css`
    .counter-widget {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .counter-display {
      font-size: 2.5rem;
      font-weight: bold;
      color: #6f42c1;
      margin: 1rem 0;
    }
    
    .counter-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .counter-btn {
      background: #6f42c1;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .counter-btn:hover {
      background: #5a359a;
    }
  `);
  
  return html`
    <div class="counter-widget">
      <h4>🔢 Shared Counter</h4>
      <div class="counter-display">${counter}</div>
      <div class="counter-buttons">
        <button class="counter-btn" @click="${() => setCounter(counter - 1)}">-</button>
        <button class="counter-btn" @click="${() => setCounter(0)}">Reset</button>
        <button class="counter-btn" @click="${() => setCounter(counter + 1)}">+</button>
      </div>
    </div>
  `;
};

const ShoppingCart = ({ store }, { html, css, useStyle }) => {
  const [cartItems, setCartItems] = store.cart.items;
  const [total, setTotal] = store.cart.total;
  
  const sampleProducts = [
    { id: 1, name: 'Widget A', price: 19.99 },
    { id: 2, name: 'Gadget B', price: 39.99 },
    { id: 3, name: 'Tool C', price: 29.99 }
  ];
  
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    updateTotal();
  };
  
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
    updateTotal();
  };
  
  const updateTotal = () => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };
  
  // Update total when cartItems changes
  const currentTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (currentTotal !== total) {
    setTotal(currentTotal);
  }
  
  useStyle(css`
    .shopping-cart {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .cart-total {
      font-weight: bold;
      color: #28a745;
      font-size: 1.125rem;
    }
    
    .products-section {
      margin-bottom: 1rem;
    }
    
    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }
    
    .product-name {
      flex: 1;
      font-size: 0.875rem;
    }
    
    .product-price {
      color: #666;
      margin-right: 0.5rem;
      font-size: 0.875rem;
    }
    
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .add-btn:hover {
      background: #218838;
    }
    
    .cart-items {
      margin-bottom: 1rem;
    }
    
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    .item-info {
      flex: 1;
      font-size: 0.875rem;
    }
    
    .remove-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .remove-btn:hover {
      background: #c82333;
    }
    
    .empty-cart {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 1rem 0;
    }
    
    .clear-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      margin-top: 0.5rem;
    }
    
    .clear-btn:hover {
      background: #545b62;
    }
  `);
  
  return html`
    <div class="shopping-cart">
      <div class="cart-header">
        <h4>🛒 Shopping Cart</h4>
        <div class="cart-total">$${total.toFixed(2)}</div>
      </div>
      
      <div class="products-section">
        <strong>Available Products:</strong>
        ${sampleProducts.map(product => html`
          <div class="product-item">
            <span class="product-name">${product.name}</span>
            <span class="product-price">$${product.price}</span>
            <button class="add-btn" @click="${() => addToCart(product)}">Add</button>
          </div>
        `)}
      </div>
      
      <div class="cart-items">
        <strong>Cart Items (${cartItems.length}):</strong>
        ${cartItems.length === 0 ? html`
          <div class="empty-cart">Cart is empty</div>
        ` : cartItems.map(item => html`
          <div class="cart-item">
            <div class="item-info">
              ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-btn" @click="${() => removeFromCart(item.id)}">Remove</button>
          </div>
        `)}
      </div>
      
      ${cartItems.length > 0 ? html`
        <button class="clear-btn" @click="${() => { setCartItems([]); setTotal(0); }}">
          Clear Cart
        </button>
      ` : ''}
    </div>
  `;
};

// useMemo Demo - Performance Optimization
const MemoDemo = (_, { useState, useMemo, html, css, useStyle }) => {
  const [items, setItems] = useState(
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Product ${i + 1}`,
      price: Math.floor(Math.random() * 100) + 10,
      category: ['Electronics', 'Clothing', 'Books', 'Home'][Math.floor(Math.random() * 4)]
    }))
  );
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [renderCount, setRenderCount] = useState(0);
  
  // Expensive computation - only recalculates when items, filter, or sortBy changes
  const processedItems = useMemo(() => {
    console.log('🔄 Processing items...');
    
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.category.toLowerCase().includes(filter.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });
    
    return filtered.slice(0, 50); // Show only first 50 for demo
  }, [items, filter, sortBy]);
  
  // Expensive stats calculation
  const stats = useMemo(() => {
    console.log('📊 Calculating stats...');
    return {
      total: processedItems.length,
      avgPrice: processedItems.length > 0 
        ? processedItems.reduce((sum, item) => sum + item.price, 0) / processedItems.length 
        : 0,
      categories: [...new Set(processedItems.map(item => item.category))]
    };
  }, [processedItems]);
  
  // This will cause re-render but NOT recalculate memoized values
  const forceRerender = () => {
    setRenderCount(renderCount + 1);
  };
  
  useStyle(css`
    .memo-demo {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .memo-header {
      background: linear-gradient(135deg, #ff6b6b, #ffa500);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .controls {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .control-input, .control-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .stats {
      background: #fff3cd;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #856404;
    }
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .item-card {
      background: white;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
      transition: transform 0.2s;
    }
    
    .item-card:hover {
      transform: translateY(-2px);
    }
    
    .performance-info {
      background: #d1ecf1;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      color: #0c5460;
      font-size: 0.875rem;
    }
    
    .rerender-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 1rem;
    }
  `);
  
  return html`
    <div class="memo-demo">
      <div class="memo-header">
        <h3>🚀 useMemo Demo</h3>
        <p>Performance Optimization with Memoization</p>
      </div>
      
      <div class="performance-info">
        💡 Open browser console to see when expensive calculations run. 
        useMemo prevents unnecessary recalculations when dependencies don't change.
        <br><br>
        <strong>Render count:</strong> ${renderCount}
        <button class="rerender-btn" @click="${forceRerender}">
          Force Re-render (won't recalculate memo)
        </button>
      </div>
      
      <div class="controls">
        <div class="control-group">
          <label><strong>Filter:</strong></label>
          <input 
            type="text"
            class="control-input"
            .value="${filter}"
            @input="${(e) => setFilter(e.target.value)}"
            placeholder="Search products..."
          />
        </div>
        
        <div class="control-group">
          <label><strong>Sort by:</strong></label>
          <select 
            class="control-select"
            .value="${sortBy}"
            @change="${(e) => setSortBy(e.target.value)}"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="category">Category</option>
          </select>
        </div>
        
        <div class="control-group">
          <label><strong>Actions:</strong></label>
          <button 
            class="control-input"
            @click="${() => setItems([...items].sort(() => Math.random() - 0.5))}"
            style="cursor: pointer; background: #28a745; color: white; border: none;"
          >
            Shuffle Items
          </button>
        </div>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${stats.total}</div>
          <div>Items Found</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${stats.avgPrice.toFixed(2)}</div>
          <div>Average Price</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.categories.length}</div>
          <div>Categories</div>
        </div>
      </div>
      
      <div class="items-grid">
        ${processedItems.map(item => html`
          <div class="item-card">
            <h4>${item.name}</h4>
            <p><strong>$${item.price}</strong></p>
            <p>${item.category}</p>
          </div>
        `)}
      </div>
    </div>
  `;
};

// useRef Demo - Imperative APIs
const RefDemo = (_, { useRef, useState, html, css, useStyle, useScope }) => {
  const [status, setStatus] = useState('Ready');
  const [playerState, setPlayerState] = useState({ volume: 50, currentTime: 0 });
  const playerRef = useRef();
  const formRef = useRef();
  
  useScope({
    'media-player': MediaPlayer,
    'form-validator': FormValidator
  });
  
  useStyle(css`
    .ref-demo {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .ref-header {
      background: linear-gradient(135deg, #20c997, #28a745);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .control-panel {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .control-btn {
      background: #20c997;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin: 0.25rem;
    }
    
    .control-btn:hover {
      background: #1ba085;
    }
    
    .status-display {
      background: #e7f6f1;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      color: #20c997;
      font-weight: bold;
    }
    
    .ref-info {
      background: #d4edda;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
      color: #155724;
      font-size: 0.875rem;
    }
  `);
  
  return html`
    <div class="ref-demo">
      <div class="ref-header">
        <h3>🎯 useRef Demo</h3>
        <p>Imperative APIs and Component References</p>
      </div>
      
      <div class="ref-info">
        🔗 useRef allows you to expose imperative APIs from components, 
        enabling parent components to call methods directly on child components.
      </div>
      
      <div class="demo-grid">
        <div class="control-panel">
          <h4>Media Player Controls</h4>
          <div class="status-display">Status: ${status}</div>
          
          <button class="control-btn" @click="${() => {
            if (playerRef.current?.play) {
              playerRef.current.play();
              setStatus('Playing...');
            }
          }}">▶️ Play</button>
          
          <button class="control-btn" @click="${() => {
            if (playerRef.current?.pause) {
              playerRef.current.pause();
              setStatus('Paused');
            }
          }}">⏸️ Pause</button>
          
          <button class="control-btn" @click="${() => {
            if (playerRef.current?.seek) {
              playerRef.current.seek(30);
              setStatus('Seeking to 30s');
            }
          }}">⏭️ Seek 30s</button>
          
          <button class="control-btn" @click="${() => {
            if (playerRef.current?.setVolume) {
              const newVolume = Math.floor(Math.random() * 100);
              playerRef.current.setVolume(newVolume);
              setPlayerState({ ...playerState, volume: newVolume });
              setStatus(`Volume: ${newVolume}%`);
            }
          }}">🔊 Random Volume</button>
        </div>
        
        <div class="control-panel">
          <h4>Form Validation</h4>
          
          <button class="control-btn" @click="${() => {
            if (formRef.current?.validate) {
              const result = formRef.current.validate();
              setStatus(`Valid: ${result.isValid}, Errors: ${result.errors.length}`);
            }
          }}">✅ Validate Form</button>
          
          <button class="control-btn" @click="${() => {
            if (formRef.current?.reset) {
              formRef.current.reset();
              setStatus('Form Reset');
            }
          }}">🔄 Reset Form</button>
          
          <button class="control-btn" @click="${() => {
            if (formRef.current?.fillSample) {
              formRef.current.fillSample();
              setStatus('Sample Data Filled');
            }
          }}">📝 Fill Sample</button>
        </div>
      </div>
      
      <div class="demo-grid">
        <media-player .props="${{ onStateChange: setPlayerState, ref: playerRef }}"></media-player>
        <form-validator .props="${{ ref: formRef }}"></form-validator>
      </div>
    </div>
  `;
};

// Media Player component for useRef demo
const MediaPlayer = ({ onStateChange, ref }, { useRef, useState, useEffect, html, css, useStyle }) => {
  const playerRef = ref || useRef();
  const [state, setState] = useState({
    isPlaying: false,
    volume: 50,
    currentTime: 0,
    duration: 180
  });
  
  // Timer effect for playing
  useEffect(() => {
    let interval;
    if (state.isPlaying && state.currentTime < state.duration) {
      interval = setInterval(() => {
        setState(prev => {
          const newTime = Math.min(prev.currentTime + 1, prev.duration);
          const newState = { ...prev, currentTime: newTime };
          
          // Auto-pause when reaching the end
          if (newTime >= prev.duration) {
            newState.isPlaying = false;
          }
          
          onStateChange?.(newState);
          return newState;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPlaying, state.currentTime, state.duration]);
  
  // Expose imperative API
  playerRef.current = {
    play: () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      onStateChange?.({ ...state, isPlaying: true });
    },
    pause: () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onStateChange?.({ ...state, isPlaying: false });
    },
    seek: (time) => {
      setState(prev => ({ ...prev, currentTime: time }));
      onStateChange?.({ ...state, currentTime: time });
    },
    setVolume: (volume) => {
      setState(prev => ({ ...prev, volume }));
      onStateChange?.({ ...state, volume });
    }
  };
  
  useStyle(css`
    .media-player {
      background: #1a1a1a;
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .player-display {
      background: #2d2d2d;
      padding: 2rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .time-info {
      font-family: monospace;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #555;
      border-radius: 2px;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .progress-fill {
      height: 100%;
      background: #20c997;
      transition: width 0.3s;
    }
    
    .volume-info {
      margin-top: 1rem;
      opacity: 0.8;
    }
  `);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return html`
    <div class="media-player">
      <h4>🎵 Media Player</h4>
      <div class="player-display">
        <div class="time-info">
          ${formatTime(state.currentTime)} / ${formatTime(state.duration)}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style="width: ${(state.currentTime / state.duration) * 100}%"
          ></div>
        </div>
        <div>Status: ${state.isPlaying ? '▶️ Playing' : '⏸️ Paused'}</div>
        <div class="volume-info">Volume: ${state.volume}%</div>
      </div>
      <div style="font-size: 0.875rem; opacity: 0.7;">
        Use the controls above to interact with this player
      </div>
    </div>
  `;
};

// Form Validator component for useRef demo
const FormValidator = ({ ref }, { useRef, useState, html, css, useStyle }) => {
  const formRef = ref || useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [errors, setErrors] = useState([]);
  
  // Expose imperative API
  formRef.current = {
    validate: () => {
      const newErrors = [];
      
      if (!formData.name.trim()) {
        newErrors.push('Name is required');
      }
      
      if (!formData.email.trim()) {
        newErrors.push('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.push('Invalid email format');
      }
      
      if (!formData.age) {
        newErrors.push('Age is required');
      } else if (isNaN(formData.age) || formData.age < 0 || formData.age > 120) {
        newErrors.push('Age must be between 0 and 120');
      }
      
      setErrors(newErrors);
      return {
        isValid: newErrors.length === 0,
        errors: newErrors,
        data: formData
      };
    },
    reset: () => {
      setFormData({ name: '', email: '', age: '' });
      setErrors([]);
    },
    fillSample: () => {
      setFormData({
        name: 'John Doe',
        email: 'john@example.com',
        age: '25'
      });
      setErrors([]);
    }
  };
  
  useStyle(css`
    .form-validator {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #333;
    }
    
    .form-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .form-input.error {
      border-color: #dc3545;
    }
    
    .errors-list {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
    
    .error-item {
      margin-bottom: 0.25rem;
    }
    
    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
  `);
  
  return html`
    <div class="form-validator">
      <h4>📋 Form Validator</h4>
      
      <div class="form-group">
        <label class="form-label">Name:</label>
        <input 
          type="text"
          class="form-input ${errors.some(e => e.includes('Name')) ? 'error' : ''}"
          .value="${formData.name}"
          @input="${(e) => setFormData({ ...formData, name: e.target.value })}"
          placeholder="Enter your name"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Email:</label>
        <input 
          type="email"
          class="form-input ${errors.some(e => e.includes('Email')) ? 'error' : ''}"
          .value="${formData.email}"
          @input="${(e) => setFormData({ ...formData, email: e.target.value })}"
          placeholder="Enter your email"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Age:</label>
        <input 
          type="number"
          class="form-input ${errors.some(e => e.includes('Age')) ? 'error' : ''}"
          .value="${formData.age}"
          @input="${(e) => setFormData({ ...formData, age: e.target.value })}"
          placeholder="Enter your age"
        />
      </div>
      
      ${errors.length > 0 ? html`
        <div class="errors-list">
          <strong>Validation Errors:</strong>
          ${errors.map(error => html`<div class="error-item">• ${error}</div>`)}
        </div>
      ` : ''}
      
      ${errors.length === 0 && (formData.name || formData.email || formData.age) ? html`
        <div class="success-message">
          ✅ Form is ready to validate!
        </div>
      ` : ''}
      
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 1rem;">
        Use the controls above to validate, reset, or fill sample data
      </div>
    </div>
  `;
};

// Main Tutorial Component
const DimTutorial = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'code-example': CodeExample,
    'live-demo': LiveDemo,
    'counter-demo': CounterDemo,
    'input-demo': InputDemo,
    'style-demo': StyleDemo,
    'effect-demo': EffectDemo,
    'scope-demo': ScopeDemo,
    'store-demo': StoreDemo,
    'memo-demo': MemoDemo,
    'ref-demo': RefDemo
  });
  
  useStyle(css`
    .tutorial-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .hero-section {
      text-align: center;
      padding: 4rem 0;
      background: linear-gradient(135deg, #029cfd 0%, #0278c7 100%);
      color: white;
      border-radius: 16px;
      margin-bottom: 3rem;
    }
    
    .hero-title {
      font-size: 4rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .hero-subtitle {
      font-size: 1.5rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto 2rem;
    }
    
    .hero-features {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-top: 3rem;
    }
    
    .feature {
      text-align: center;
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    
    .feature-text {
      font-size: 1rem;
    }
    
    .section {
      margin-bottom: 4rem;
    }
    
    .section-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
    }
    
    .section-description {
      font-size: 1.125rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .subsection {
      margin-bottom: 3rem;
    }
    
    .subsection-title {
      font-size: 1.75rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #029cfd;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .feature-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s;
    }
    
    .feature-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    
    .feature-card-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #029cfd;
    }
    
    .feature-card-description {
      color: #666;
      line-height: 1.5;
    }
    
    .note {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
    }
    
    .note-title {
      font-weight: bold;
      color: #856404;
      margin-bottom: 0.5rem;
    }
    
    .tip {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
    }
    
    .tip-title {
      font-weight: bold;
      color: #155724;
      margin-bottom: 0.5rem;
    }
    
    code.inline {
      background-color: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      color: #e83e8c;
    }
  `);
  
  return html`
    <div class="tutorial-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <h1 class="hero-title">Dim Framework</h1>
        <p class="hero-subtitle">
          A lightweight, reactive web component framework inspired by React and lit-html
        </p>
        <div class="hero-features">
          <div class="feature">
            <div class="feature-icon">⚡</div>
            <div class="feature-text">Lightning Fast</div>
          </div>
          <div class="feature">
            <div class="feature-icon">🧩</div>
            <div class="feature-text">Component-Based</div>
          </div>
          <div class="feature">
            <div class="feature-icon">🎨</div>
            <div class="feature-text">Scoped Styling</div>
          </div>
          <div class="feature">
            <div class="feature-icon">🔄</div>
            <div class="feature-text">Reactive State</div>
          </div>
        </div>
      </div>
      
      <!-- Introduction -->
      <section class="section">
        <h2 class="section-title">Introduction</h2>
        <p class="section-description">
          Dim is a modern web component framework that combines the best of React's component model with the simplicity and performance of lit-html. 
          It provides a familiar API for React developers while leveraging web standards and native browser capabilities.
        </p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <h3 class="feature-card-title">🚀 Easy to Learn</h3>
            <p class="feature-card-description">
              If you know React, you already know most of Dim. Use familiar hooks like useState, useEffect, and more.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🎯 Zero Build Step</h3>
            <p class="feature-card-description">
              Works directly in the browser with ES modules. No complex build configuration required.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🌐 Web Standards</h3>
            <p class="feature-card-description">
              Built on Web Components, making your components work everywhere and interoperable with any framework.
            </p>
          </div>
        </div>
      </section>
      
      <!-- Getting Started -->
      <section class="section">
        <h2 class="section-title">Getting Started</h2>
        <p class="section-description">
          Let's start with a simple counter component to understand the basics of Dim.
        </p>
        
        <div class="subsection">
          <h3 class="subsection-title">Your First Component</h3>
          
          <code-example code="${`import { html, css, define, useState } from 'dim';

const Counter = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  
  useStyle(css\`
    .counter {
      text-align: center;
      padding: 2rem;
    }
    
    button {
      font-size: 1rem;
      padding: 0.5rem 1rem;
      margin: 0 0.5rem;
    }
  \`);
  
  return html\`
    <div class="counter">
      <h2>Count: \${count}</h2>
      <button @click="\${() => setCount(count - 1)}">-</button>
      <button @click="\${() => setCount(count + 1)}">+</button>
    </div>
  \`;
};

// Register the component
define({ tag: 'my-counter', component: Counter });`}"></code-example>
          
          <live-demo 
            title="Counter Demo" 
            description="Click the buttons to increment or decrement the counter"
          >
            <counter-demo></counter-demo>
          </live-demo>
          
          <div class="note">
            <div class="note-title">📝 Note:</div>
            Components in Dim are functions that receive props and hooks as parameters. The second parameter provides access to all the framework's hooks and utilities.
          </div>
        </div>
      </section>
      
      <!-- Core Concepts -->
      <section class="section">
        <h2 class="section-title">Core Concepts</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">1. State Management with useState</h3>
          <p class="section-description">
            The <code class="inline">useState</code> hook works exactly like React's useState, allowing you to add reactive state to your components.
          </p>
          
          <code-example code="${`const [value, setValue] = useState(initialValue);

// Example: Form inputs
const [name, setName] = useState('');
const [email, setEmail] = useState('');

// Update state
setName('John Doe');
setEmail('john@example.com');`}"></code-example>
          
          <live-demo 
            title="Form Input Demo" 
            description="Type in the inputs to see two-way data binding in action"
          >
            <input-demo></input-demo>
          </live-demo>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">2. Styling with useStyle</h3>
          <p class="section-description">
            Dim provides scoped styling using the <code class="inline">useStyle</code> hook with CSS tagged templates. Styles are automatically scoped to your component.
          </p>
          
          <code-example code="${`useStyle(css\`
  .my-component {
    background-color: \${primaryColor};
    border-radius: \${borderRadius}px;
  }
  
  /* Styles are automatically scoped to this component */
  button {
    background: #029cfd;
    color: white;
  }
\`);`}"></code-example>
          
          <live-demo 
            title="Dynamic Styling Demo" 
            description="Change the color and border radius to see dynamic styles in action"
          >
            <style-demo></style-demo>
          </live-demo>
          
          <div class="tip">
            <div class="tip-title">💡 Tip:</div>
            Use <code class="inline">unsafeCSS()</code> when interpolating dynamic values in your styles to ensure they're properly processed.
          </div>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">3. Side Effects with useEffect</h3>
          <p class="section-description">
            The <code class="inline">useEffect</code> hook lets you perform side effects in your components, just like in React.
          </p>
          
          <code-example code="${`useEffect(() => {
  // Effect code
  console.log('Component mounted or updated');
  
  // Cleanup function (optional)
  return () => {
    console.log('Cleanup');
  };
}, [dependencies]);

// Common use cases:
// - Timers and intervals
// - API calls
// - Event listeners
// - Subscriptions`}"></code-example>
          
          <live-demo 
            title="Timer Demo with useEffect" 
            description="A stopwatch demonstrating useEffect for intervals"
          >
            <effect-demo></effect-demo>
          </live-demo>
        </div>
      </section>
      
      <!-- Advanced Features -->
      <section class="section">
        <h2 class="section-title">Advanced Features</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">Component Composition with useScope</h3>
          <p class="section-description">
            Dim supports powerful component composition patterns using <code class="inline">useScope</code> to register child components dynamically and avoid naming conflicts.
          </p>
          
          <code-example code="${`// Parent component registering child components
const TodoApp = (_, { useScope, html }) => {
  useScope({
    'todo-list': TodoList,
    'todo-item': TodoItem,
    'add-form': AddItemForm
  });
  
  return html\`
    <div class="app">
      <h1>My Todo App</h1>
      <add-form .props="\${{ onAdd: addTodo }}"></add-form>
      <todo-list .props="\${{ todos, onToggle, onDelete }}">
      </todo-list>
    </div>
  \`;
};

// Child components are scoped to this parent
// No global namespace pollution`}"></code-example>
          
          <live-demo 
            title="Component Composition Demo" 
            description="See how useScope enables clean component composition with TodoItem and AddTodoForm child components"
          >
            <scope-demo></scope-demo>
          </live-demo>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Store Pattern with useStore</h3>
          <p class="section-description">
            For complex state management across components, use the <code class="inline">useStore</code> hook to create a centralized store with automatic persistence to IndexedDB.
          </p>
          
          <code-example code="${`const store = useStore({
  user: useState(null),
  todos: useState([]),
  settings: {
    theme: useState('light'),
    language: useState('en')
  },
  cart: {
    items: useState([]),
    total: useState(0)
  }
});

// Access nested store values
const [user, setUser] = store.user;
const [theme, setTheme] = store.settings.theme;
const [cartItems, setCartItems] = store.cart.items;

// State automatically persists to IndexedDB
// Shared across all components using the store
setUser({ name: 'John', email: 'john@example.com' });
setTheme('dark');`}"></code-example>
          
          <live-demo 
            title="Global State Management Demo" 
            description="Multiple components sharing state through useStore with UserProfile, SettingsPanel, CounterWidget, and ShoppingCart - all with persistent storage"
          >
            <store-demo></store-demo>
          </live-demo>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Memoization with useMemo</h3>
          <p class="section-description">
            Optimize expensive computations with <code class="inline">useMemo</code> to prevent unnecessary recalculations and improve performance.
          </p>
          
          <code-example code="${`const ProductList = ({ products, filter }, { useMemo, html }) => {
  // Expensive filtering and sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => product.name.includes(filter))
      .sort((a, b) => a.price - b.price);
  }, [products, filter]);
  
  // Expensive calculation
  const totalValue = useMemo(() => {
    return filteredProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  }, [filteredProducts]);
  
  return html\`
    <div>
      <p>Total: \$\${totalValue}</p>
      \${filteredProducts.map(product => html\`
        <div class="product">\${product.name}</div>
      \`)}
    </div>
  \`;
};`}"></code-example>
          
          <live-demo 
            title="Performance Optimization Demo" 
            description="Watch how useMemo prevents expensive recalculations when filtering and sorting products"
          >
            <memo-demo></memo-demo>
          </live-demo>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Imperative APIs with useRef</h3>
          <p class="section-description">
            Use <code class="inline">useRef</code> to expose imperative APIs and interact with DOM elements directly when needed.
          </p>
          
          <code-example code="${`const MediaPlayer = (_, { useRef, html }) => {
  const playerRef = useRef();
  
  // Expose methods to parent components
  playerRef.current = {
    play: () => console.log('Playing...'),
    pause: () => console.log('Paused'),
    seek: (time) => console.log(\`Seeking to \${time}s\`),
    
    // Validation API example
    validate: () => {
      return { isValid: true, errors: [] };
    }
  };
  
  return html\`
    <div class="media-player">
      <button @click="\${playerRef.current.play}">Play</button>
      <button @click="\${playerRef.current.pause}">Pause</button>
    </div>
  \`;
};

// Parent can call: getRef('media-player').play()`}"></code-example>
          
          <live-demo 
            title="Imperative APIs Demo" 
            description="Interact with MediaPlayer and FormValidator components through exposed imperative methods"
          >
            <ref-demo></ref-demo>
          </live-demo>
        </div>
      </section>
      
      <!-- Real-World Patterns -->
      <section class="section">
        <h2 class="section-title">Real-World Patterns</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">Async Data Fetching</h3>
          <p class="section-description">
            Handle asynchronous operations like API calls with proper loading and error states.
          </p>
          
          <code-example code="${`const UserProfile = ({ userId }, { useState, useEffect, html }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) throw new Error('Failed to load user');
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  if (loading) return html\`<div class="loading">Loading...</div>\`;
  if (error) return html\`<div class="error">Error: \${error}</div>\`;
  if (!user) return html\`<div>User not found</div>\`;
  
  return html\`
    <div class="user-profile">
      <h2>\${user.name}</h2>
      <p>\${user.email}</p>
    </div>
  \`;
};`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Form Validation & Handling</h3>
          <p class="section-description">
            Build robust forms with validation, error handling, and submission logic.
          </p>
          
          <code-example code="${`const ContactForm = (_, { useState, html, css, useStyle }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // Reset form on success
      setFormData({ name: '', email: '', message: '' });
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return html\`
    <form @submit="\${handleSubmit}">
      <input 
        type="text" 
        placeholder="Name"
        .value="\${formData.name}"
        @input="\${(e) => setFormData({
          ...formData, 
          name: e.target.value
        })}"
      />
      \${errors.name ? html\`<span class="error">\${errors.name}</span>\` : ''}
      
      <button type="submit" ?disabled="\${isSubmitting}">
        \${isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  \`;
};`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Dynamic Theming System</h3>
          <p class="section-description">
            Create a flexible theming system using CSS custom properties and dynamic styling.
          </p>
          
          <code-example code="${`const ThemeProvider = ({ children }, { useState, useStyle, css, html, renderChildren }) => {
  const [theme, setTheme] = useState('light');
  
  const themes = {
    light: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f5f5f5',
      '--text-primary': '#333333',
      '--text-secondary': '#666666',
      '--accent': '#029cfd'
    },
    dark: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#2d2d2d',
      '--text-primary': '#ffffff',
      '--text-secondary': '#cccccc',
      '--accent': '#0ea5e9'
    }
  };
  
  useStyle(css\`
    :host {
      \${Object.entries(themes[theme]).map(([prop, value]) => 
        \`\${prop}: \${value};\`
      ).join('\\n')}
    }
    
    .theme-selector {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
  \`);
  
  return html\`
    <div class="theme-provider">
      <div class="theme-selector">
        <select 
          .value="\${theme}"
          @change="\${(e) => setTheme(e.target.value)}"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      \${renderChildren(children)}
    </div>
  \`;
};`}"></code-example>
        </div>
      </section>
      
      <!-- Architecture Patterns -->
      <section class="section">
        <h2 class="section-title">Architecture Patterns</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">Application Structure</h3>
          <p class="section-description">
            Organize your Dim application with a clear folder structure and separation of concerns.
          </p>
          
          <code-example code="${`my-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.js
│   │   ├── Modal.js
│   │   └── Form/
│   │       ├── Input.js
│   │       └── Validation.js
│   ├── pages/               # Page-level components
│   │   ├── HomePage.js
│   │   ├── AboutPage.js
│   │   └── ContactPage.js
│   ├── stores/              # Global state management
│   │   ├── userStore.js
│   │   ├── cartStore.js
│   │   └── themeStore.js
│   ├── hooks/               # Custom hooks
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   ├── utils/               # Helper functions
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   └── app.js               # Main application entry
└── public/
    ├── index.html
    └── assets/`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Custom Hooks Pattern</h3>
          <p class="section-description">
            Create reusable logic with custom hooks that encapsulate common functionality.
          </p>
          
          <code-example code="${`// Custom hook for API calls
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, refetch: fetchData };
};

// Custom hook for local storage
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });
  
  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, setStoredValue];
};

// Usage in components
const UserProfile = ({ userId }, { useEffect }) => {
  const { data: user, loading, error } = useApi(\`/api/users/\${userId}\`);
  const [preferences, setPreferences] = useLocalStorage('userPrefs', {});
  
  // Component logic...
};`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Error Handling Strategy</h3>
          <p class="section-description">
            Implement comprehensive error handling with error boundaries and graceful fallbacks.
          </p>
          
          <code-example code="${`// Error Boundary Component
const ErrorBoundary = ({ children }, { useState, useEffect, html, renderChildren }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  // Listen for uncaught errors
  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
  
  if (hasError) {
    return html\`
      <div class="error-boundary">
        <h2>Something went wrong</h2>
        <details>
          <summary>Error Details</summary>
          <pre>\${error?.stack || error?.message || 'Unknown error'}</pre>
        </details>
        <button @click="\${() => setHasError(false)}">
          Try Again
        </button>
      </div>
    \`;
  }
  
  return html\`\${renderChildren(children)}\`;
};

// Usage wrapper
const App = (_, { useScope, html }) => {
  useScope({
    'error-boundary': ErrorBoundary,
    'user-profile': UserProfile
  });
  
  return html\`
    <error-boundary>
      <user-profile user-id="123"></user-profile>
    </error-boundary>
  \`;
};`}"></code-example>
        </div>
      </section>
      
      <!-- Performance & Optimization -->
      <section class="section">
        <h2 class="section-title">Performance & Optimization</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">Optimizing Re-renders</h3>
          <p class="section-description">
            Use memoization and careful state design to minimize unnecessary re-renders and improve performance.
          </p>
          
          <code-example code="${`// Optimize expensive list rendering
const ProductGrid = ({ products, filters }, { useMemo, html }) => {
  // Memoize filtered and sorted products
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      return (!filters.category || product.category === filters.category) &&
             (!filters.minPrice || product.price >= filters.minPrice) &&
             (!filters.search || product.name.toLowerCase().includes(filters.search.toLowerCase()));
    });
    
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price': return a.price - b.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });
  }, [products, filters]);
  
  // Memoize aggregate calculations
  const stats = useMemo(() => ({
    total: processedProducts.length,
    avgPrice: processedProducts.reduce((sum, p) => sum + p.price, 0) / processedProducts.length,
    categories: [...new Set(processedProducts.map(p => p.category))]
  }), [processedProducts]);
  
  return html\`
    <div class="product-grid">
      <div class="stats">
        \${stats.total} products, Average: $\${stats.avgPrice.toFixed(2)}
      </div>
      \${processedProducts.map(product => html\`
        <product-card .props="\${{ product }}"></product-card>
      \`)}
    </div>
  \`;
};`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Lazy Loading & Code Splitting</h3>
          <p class="section-description">
            Implement lazy loading for components and routes to reduce initial bundle size.
          </p>
          
          <code-example code="${`// Lazy component loader
const useLazyComponent = (importFn) => {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(async () => {
    try {
      const module = await importFn();
      setComponent(module.default);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { component, loading, error };
};

// Router with lazy loading
const Router = ({ route }, { useScope, html }) => {
  const routes = {
    '/': () => import('./pages/HomePage.js'),
    '/about': () => import('./pages/AboutPage.js'),
    '/contact': () => import('./pages/ContactPage.js'),
    '/dashboard': () => import('./pages/DashboardPage.js')
  };
  
  const { component: PageComponent, loading, error } = useLazyComponent(
    routes[route] || routes['/']
  );
  
  if (loading) {
    return html\`<div class="loading-spinner">Loading page...</div>\`;
  }
  
  if (error) {
    return html\`<div class="error">Failed to load page</div>\`;
  }
  
  return html\`<\${PageComponent} route="\${route}"></\${PageComponent}>\`;
};`}"></code-example>
        </div>
      </section>
      
      <!-- Testing -->
      <section class="section">
        <h2 class="section-title">Testing Your Components</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">Unit Testing</h3>
          <p class="section-description">
            Test Dim components using standard testing frameworks and web component testing utilities.
          </p>
          
          <code-example code="${`// counter.test.js
import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './Counter.js';

describe('Counter Component', () => {
  it('renders with initial count of 0', async () => {
    const el = await fixture(html\`<my-counter></my-counter>\`);
    const display = el.shadowRoot.querySelector('.count-display');
    expect(display.textContent.trim()).to.equal('0');
  });
  
  it('increments count when button clicked', async () => {
    const el = await fixture(html\`<my-counter></my-counter>\`);
    const button = el.shadowRoot.querySelector('[data-testid="increment"]');
    const display = el.shadowRoot.querySelector('.count-display');
    
    button.click();
    await el.updateComplete;
    
    expect(display.textContent.trim()).to.equal('1');
  });
  
  it('accepts initial value prop', async () => {
    const el = await fixture(html\`
      <my-counter .props="\${{ initialValue: 5 }}"></my-counter>
    \`);
    const display = el.shadowRoot.querySelector('.count-display');
    expect(display.textContent.trim()).to.equal('5');
  });
});

// Integration test example
describe('TodoApp Integration', () => {
  it('adds and removes todos', async () => {
    const el = await fixture(html\`<todo-app></todo-app>\`);
    
    // Add a todo
    const input = el.shadowRoot.querySelector('input[type="text"]');
    const addButton = el.shadowRoot.querySelector('[data-testid="add-todo"]');
    
    input.value = 'Test todo';
    input.dispatchEvent(new Event('input'));
    addButton.click();
    
    await el.updateComplete;
    
    // Verify todo was added
    const todoItems = el.shadowRoot.querySelectorAll('.todo-item');
    expect(todoItems.length).to.equal(1);
    expect(todoItems[0].textContent).to.include('Test todo');
    
    // Remove the todo
    const deleteButton = todoItems[0].querySelector('[data-testid="delete"]');
    deleteButton.click();
    
    await el.updateComplete;
    
    // Verify todo was removed
    const remainingTodos = el.shadowRoot.querySelectorAll('.todo-item');
    expect(remainingTodos.length).to.equal(0);
  });
});`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Testing Hooks</h3>
          <p class="section-description">
            Test custom hooks and complex state logic in isolation.
          </p>
          
          <code-example code="${`// Test custom hooks with a test component
const createTestComponent = (hookFn) => {
  return (props, hooks) => {
    const result = hookFn(hooks);
    
    // Expose result for testing
    if (hooks.useRef) {
      const ref = hooks.useRef();
      ref.current = result;
    }
    
    return hooks.html\`<div data-testid="test-component"></div>\`;
  };
};

// Testing useApi hook
describe('useApi Hook', () => {
  it('handles successful API calls', async () => {
    // Mock fetch
    global.fetch = async () => ({
      json: async () => ({ id: 1, name: 'Test User' })
    });
    
    const TestComponent = createTestComponent(({ useState, useEffect }) => {
      return useApi('/api/users/1');
    });
    
    const el = await fixture(html\`<test-component></test-component>\`);
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    await el.updateComplete;
    
    const result = el._ref.current;
    expect(result.loading).to.be.false;
    expect(result.data).to.deep.equal({ id: 1, name: 'Test User' });
    expect(result.error).to.be.null;
  });
  
  it('handles API errors', async () => {
    global.fetch = async () => {
      throw new Error('Network error');
    };
    
    const TestComponent = createTestComponent(({ useState, useEffect }) => {
      return useApi('/api/users/1');
    });
    
    const el = await fixture(html\`<test-component></test-component>\`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    await el.updateComplete;
    
    const result = el._ref.current;
    expect(result.loading).to.be.false;
    expect(result.error).to.equal('Network error');
    expect(result.data).to.be.null;
  });
});`}"></code-example>
        </div>
      </section>
      
      <!-- Best Practices -->
      <section class="section">
        <h2 class="section-title">Best Practices</h2>
        
        <div class="feature-grid">
          <div class="feature-card">
            <h3 class="feature-card-title">📦 Component Organization</h3>
            <p class="feature-card-description">
              Keep components small and focused. Each component should have a single responsibility and clear props interface.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🎨 Styling Strategy</h3>
            <p class="feature-card-description">
              Use scoped styles with useStyle for component-specific styling. Share common styles through CSS custom properties and design tokens.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🔄 State Management</h3>
            <p class="feature-card-description">
              Use local state for component-specific data. Use useStore for shared state. Consider custom hooks for complex state logic.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">⚡ Performance</h3>
            <p class="feature-card-description">
              Use useMemo for expensive computations. Minimize prop changes and keep component trees shallow. Lazy load heavy components.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🧪 Testing</h3>
            <p class="feature-card-description">
              Components are functions, making them easy to test. Write unit tests for individual components and integration tests for workflows.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">📚 Documentation</h3>
            <p class="feature-card-description">
              Document component props, usage examples, and edge cases. Use TypeScript for better IDE support and compile-time type safety.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🔒 Error Handling</h3>
            <p class="feature-card-description">
              Implement error boundaries, validate props, and provide graceful fallbacks. Handle async operations with proper loading and error states.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">♿ Accessibility</h3>
            <p class="feature-card-description">
              Use semantic HTML, provide ARIA labels, ensure keyboard navigation, and test with screen readers for inclusive user experiences.
            </p>
          </div>
        </div>
      </section>
      
      <!-- TypeScript Integration -->
      <section class="section">
        <h2 class="section-title">TypeScript Integration</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">TypeScript Component Example</h3>
          <p class="section-description">
            Dim works seamlessly with TypeScript for enhanced developer experience and type safety.
          </p>
          
          <code-example code="${`// Button.ts - TypeScript component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children?: string;
  onClick?: () => void;
}

interface DimHooks {
  html: (strings: TemplateStringsArray, ...values: any[]) => any;
  css: (strings: TemplateStringsArray, ...values: any[]) => any;
  useStyle: (styles: any) => void;
  useState: <T>(initial: T) => [T, (value: T) => void];
}

const Button = (props: ButtonProps, hooks: DimHooks): any => {
  const { 
    variant = 'primary', 
    size = 'medium', 
    disabled = false, 
    children = '', 
    onClick 
  } = props;
  
  const { html, css, useStyle } = hooks;
  
  useStyle(css\`
    .button {
      padding: var(--padding-\${size});
      font-size: var(--font-size-\${size});
      border: none;
      border-radius: 4px;
      cursor: \${disabled ? 'not-allowed' : 'pointer'};
      opacity: \${disabled ? 0.6 : 1};
      transition: all 0.2s;
    }
    
    .button.primary {
      background-color: #029cfd;
      color: white;
    }
    
    .button.secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .button.danger {
      background-color: #dc3545;
      color: white;
    }
    
    .button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  \`);
  
  return html\`
    <button 
      class="button \${variant}"
      ?disabled="\${disabled}"
      @click="\${onClick}"
    >
      \${children}
    </button>
  \`;
};

export default Button;`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Type-Safe Custom Hooks</h3>
          <p class="section-description">
            Create type-safe custom hooks with proper TypeScript definitions.
          </p>
          
          <code-example code="${`// useApi.ts - Type-safe API hook
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiHook<T> extends ApiState<T> {
  refetch: () => Promise<void>;
}

function useApi<T = any>(url: string): ApiHook<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null
  });
  
  const fetchData = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data: T = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };
  
  return {
    ...state,
    refetch: fetchData
  };
}

// Usage with type safety
interface User {
  id: number;
  name: string;
  email: string;
}

const UserProfile = ({ userId }: { userId: number }, hooks: DimHooks) => {
  const { data: user, loading, error } = useApi<User>(\`/api/users/\${userId}\`);
  
  // TypeScript knows user is User | null
  if (user) {
    console.log(user.name); // ✅ Type-safe access
    // console.log(user.invalidProperty); // ❌ TypeScript error
  }
  
  return hooks.html\`
    <div class="user-profile">
      \${loading ? 'Loading...' : user?.name || 'User not found'}
    </div>
  \`;
};`}"></code-example>
        </div>
      </section>
      
      <!-- Migration Guide -->
      <section class="section">
        <h2 class="section-title">Migration from React</h2>
        
        <div class="subsection">
          <h3 class="subsection-title">React vs Dim Comparison</h3>
          <p class="section-description">
            If you're coming from React, here's how Dim concepts map to familiar React patterns.
          </p>
          
          <code-example code="${`// React Component
const ReactCounter = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

// Equivalent Dim Component
const DimCounter = (_, { useState, useEffect, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  useStyle(css\`
    .counter {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  \`);
  
  return html\`
    <div class="counter">
      <h2>Count: \${count}</h2>
      <button @click="\${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  \`;
};

// Key Differences:
// 1. Props and hooks passed as separate parameters
// 2. html template literals instead of JSX
// 3. @click instead of onClick
// 4. useStyle for component-scoped CSS
// 5. Native web components under the hood`}"></code-example>
        </div>
        
        <div class="subsection">
          <h3 class="subsection-title">Migration Checklist</h3>
          
          <div class="feature-grid">
            <div class="feature-card">
              <h3 class="feature-card-title">✅ Hooks API</h3>
              <p class="feature-card-description">
                useState, useEffect, useMemo work almost identically to React. Context and reducers use useStore instead.
              </p>
            </div>
            <div class="feature-card">
              <h3 class="feature-card-title">🔄 Event Handling</h3>
              <p class="feature-card-description">
                Change onClick to @click, onChange to @change. Event object structure remains the same.
              </p>
            </div>
            <div class="feature-card">
              <h3 class="feature-card-title">🎨 Styling</h3>
              <p class="feature-card-description">
                CSS-in-JS becomes useStyle. Styled-components patterns translate to scoped CSS with CSS custom properties.
              </p>
            </div>
            <div class="feature-card">
              <h3 class="feature-card-title">🏗️ Component Structure</h3>
              <p class="feature-card-description">
                Function components map directly. Class components need refactoring to functional style with hooks.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Next Steps -->
      <section class="section">
        <h2 class="section-title">Next Steps</h2>
        <p class="section-description">
          You now have a comprehensive understanding of the Dim framework! Here's what to explore next:
        </p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <h3 class="feature-card-title">🪝 Hooks Deep Dive</h3>
            <p class="feature-card-description">
              Explore all available hooks with interactive examples: useState, useEffect, useMemo, useRef, useScope, useStore, and useStyle.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🏗️ Advanced Patterns</h3>
            <p class="feature-card-description">
              Study complex component hierarchies, composition patterns, nested state management, and real-world application architecture.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🎯 Build a Project</h3>
            <p class="feature-card-description">
              Start building your own application! Try creating a todo app, dashboard, or e-commerce site using the patterns you've learned.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🔬 Experiment</h3>
            <p class="feature-card-description">
              Dim is experimental! Try pushing the boundaries, create custom hooks, explore web component integrations, and share your discoveries.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">🤝 Community</h3>
            <p class="feature-card-description">
              Join the community, contribute to the framework, report issues, suggest features, and help improve the documentation.
            </p>
          </div>
          <div class="feature-card">
            <h3 class="feature-card-title">📖 Documentation</h3>
            <p class="feature-card-description">
              Read the complete API documentation, study the source code, and understand the framework's internal architecture.
            </p>
          </div>
        </div>
        
        <div class="note">
          <div class="note-title">🚨 Important Note:</div>
          Dim is an experimental framework designed for learning and exploration. While it demonstrates innovative approaches to functional web components, it's not recommended for production applications. Use it to understand web component patterns, experiment with functional programming concepts, and inspire new ideas in your development work.
        </div>
      </section>
    </div>
  `;
};

// Define all demo components
define({ tag: 'dim-tutorial', component: DimTutorial });
define({ tag: 'code-example', component: CodeExample });
define({ tag: 'live-demo', component: LiveDemo });
define({ tag: 'counter-demo', component: CounterDemo });
define({ tag: 'input-demo', component: InputDemo });
define({ tag: 'style-demo', component: StyleDemo });
define({ tag: 'effect-demo', component: EffectDemo });

// Export stories
export default {
  title: "Getting Started/Tutorial",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Welcome to Dim Framework

Dim is a lightweight, reactive web component framework that brings the best of React's component model to native web components.

## Key Features
- 🚀 **Familiar API** - If you know React, you already know Dim
- ⚡ **Lightning Fast** - Built on lit-html for optimal performance
- 🎨 **Scoped Styling** - CSS-in-JS with automatic scoping
- 🧩 **True Components** - Based on Web Components standard
- 📦 **Zero Config** - No build step required
- 🔄 **Reactive** - Automatic UI updates with state changes

## Quick Start

\`\`\`bash
npm install @dim/core
\`\`\`

\`\`\`javascript
import { html, define, useState } from '@dim/core';

const MyComponent = (_, { useState, html }) => {
  const [count, setCount] = useState(0);
  
  return html\`
    <div>
      <h1>Count: \${count}</h1>
      <button @click="\${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  \`;
};

define({ tag: 'my-component', component: MyComponent });
\`\`\`

Then use it in your HTML:
\`\`\`html
<my-component></my-component>
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const InteractiveTutorial = {
  render: () => <dim-tutorial />,
  name: "📚 Interactive Tutorial",
  parameters: {
    docs: {
      description: {
        story: "A comprehensive, interactive tutorial covering all aspects of the Dim framework with live examples and code snippets."
      }
    }
  }
};