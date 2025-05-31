import React from "react";
import { html, css, define, useState, useStore, useStyle, useScope, useEffect } from "../../core/dim.ts";

// Shopping cart component using useStore
const ShoppingCart = (props, { useStore, useState, html, css, useStyle }) => {
  const store = useStore({
    cart: {
      items: useState([]),
      total: useState(0)
    },
    user: {
      name: useState('Guest'),
      isLoggedIn: useState(false)
    },
    settings: {
      currency: useState('USD'),
      taxRate: useState(0.08)
    }
  });

  useStyle(css`
    .cart-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 700px;
    }

    .user-section {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .login-form {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .login-form input {
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .product-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: transform 0.2s;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .product-emoji {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .product-name {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .product-price {
      color: #028a0f;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    button:hover {
      background-color: #0278c7;
    }

    .cart-section {
      border-top: 2px solid #ddd;
      padding-top: 1.5rem;
    }

    .cart-items {
      margin: 1rem 0;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-info {
      flex: 1;
    }

    .item-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .quantity-button {
      width: 30px;
      height: 30px;
      padding: 0;
      font-size: 1rem;
    }

    .remove-button {
      background-color: #dc3545;
    }

    .remove-button:hover {
      background-color: #c82333;
    }

    .cart-summary {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .summary-row.total {
      font-weight: bold;
      font-size: 1.2rem;
      border-top: 2px solid #ddd;
      padding-top: 0.5rem;
      margin-bottom: 0;
    }

    .settings-row {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #e7f3ff;
      border-radius: 4px;
    }

    .empty-cart {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
  `);

  const products = [
    { id: 1, name: 'Apple', emoji: '🍎', price: 0.99 },
    { id: 2, name: 'Banana', emoji: '🍌', price: 0.59 },
    { id: 3, name: 'Orange', emoji: '🍊', price: 0.79 },
    { id: 4, name: 'Grapes', emoji: '🍇', price: 2.99 },
    { id: 5, name: 'Strawberry', emoji: '🍓', price: 3.99 },
    { id: 6, name: 'Watermelon', emoji: '🍉', price: 4.99 }
  ];

  const [tempName, setTempName] = useState('');

  const login = () => {
    if (tempName.trim()) {
      store.user.name[1](tempName);
      store.user.isLoggedIn[1](true);
      setTempName('');
    }
  };

  const logout = () => {
    store.user.name[1]('Guest');
    store.user.isLoggedIn[1](false);
  };

  const addToCart = (product) => {
    const [items, setItems] = store.cart.items;
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      setItems(items.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    const [items, setItems] = store.cart.items;
    setItems(items.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    const [items, setItems] = store.cart.items;
    setItems(items.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    const [items] = store.cart.items;
    const [taxRate] = store.settings.taxRate;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const totals = calculateTotal();

  // Update total in store
  useEffect(() => {
    store.cart.total[1](totals.total);
  }, [totals.total]);

  const formatCurrency = (amount) => {
    const [currency] = store.settings.currency;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  };

  return html`
    <div class="cart-container">
      <h3>useStore Shopping Cart</h3>
      
      <div class="user-section">
        <div>
          Welcome, <strong>${store.user.name[0]}</strong>!
          ${store.user.isLoggedIn[0] ? html`
            <button @click="${logout}" style="margin-left: 1rem;">Logout</button>
          ` : ''}
        </div>
        
        ${!store.user.isLoggedIn[0] ? html`
          <div class="login-form">
            <input 
              type="text" 
              placeholder="Enter your name"
              .value="${tempName}"
              @input="${(e) => setTempName(e.target.value)}"
              @keypress="${(e) => e.key === 'Enter' && login()}"
            />
            <button @click="${login}">Login</button>
          </div>
        ` : ''}
      </div>

      <h4>Products</h4>
      <div class="products-grid">
        ${products.map(product => html`
          <div class="product-card">
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatCurrency(product.price)}</div>
            <button @click="${() => addToCart(product)}">Add to Cart</button>
          </div>
        `)}
      </div>

      <div class="cart-section">
        <h4>Shopping Cart (${store.cart.items[0].length} items)</h4>
        
        ${store.cart.items[0].length > 0 ? html`
          <div class="cart-items">
            ${store.cart.items[0].map(item => html`
              <div class="cart-item">
                <div class="item-info">
                  ${item.emoji} ${item.name} - ${formatCurrency(item.price)} each
                </div>
                <div class="item-controls">
                  <button class="quantity-button" @click="${() => updateQuantity(item.id, -1)}">-</button>
                  <span>${item.quantity}</span>
                  <button class="quantity-button" @click="${() => updateQuantity(item.id, 1)}">+</button>
                  <button class="remove-button" @click="${() => removeFromCart(item.id)}">Remove</button>
                </div>
              </div>
            `)}
          </div>

          <div class="cart-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(totals.subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (${(store.settings.taxRate[0] * 100).toFixed(0)}%):</span>
              <span>${formatCurrency(totals.tax)}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatCurrency(totals.total)}</span>
            </div>
          </div>
        ` : html`
          <div class="empty-cart">Your cart is empty. Add some products!</div>
        `}
      </div>

      <div class="settings-row">
        <label>Currency:</label>
        <select 
          .value="${store.settings.currency[0]}"
          @change="${(e) => store.settings.currency[1](e.target.value)}"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
        
        <label>Tax Rate:</label>
        <select 
          .value="${store.settings.taxRate[0]}"
          @change="${(e) => store.settings.taxRate[1](parseFloat(e.target.value))}"
        >
          <option value="0">0%</option>
          <option value="0.05">5%</option>
          <option value="0.08">8%</option>
          <option value="0.10">10%</option>
        </select>
      </div>
    </div>
  `;
};

// Task manager demonstrating cross-component state sharing
const TaskList = ({ category }, { useStore, html, css, useStyle }) => {
  const store = useStore({
    tasks: useState([])
  });

  useStyle(css`
    .task-list {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-checkbox {
      margin-right: 0.5rem;
    }

    .task-text {
      flex: 1;
    }

    .task-text.completed {
      text-decoration: line-through;
      color: #999;
    }

    .delete-button {
      background-color: #dc3545;
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .delete-button:hover {
      background-color: #c82333;
    }
  `);

  const categoryTasks = store.tasks[0].filter(task => task.category === category);

  const toggleTask = (taskId) => {
    const [tasks, setTasks] = store.tasks;
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    const [tasks, setTasks] = store.tasks;
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return html`
    <div class="task-list">
      <div class="task-header">
        <h4>${category} Tasks (${categoryTasks.length})</h4>
      </div>
      
      ${categoryTasks.length > 0 ? categoryTasks.map(task => html`
        <div class="task-item">
          <input 
            type="checkbox" 
            class="task-checkbox"
            .checked="${task.completed}"
            @change="${() => toggleTask(task.id)}"
          />
          <span class="task-text ${task.completed ? 'completed' : ''}">
            ${task.text}
          </span>
          <button class="delete-button" @click="${() => deleteTask(task.id)}">
            Delete
          </button>
        </div>
      `) : html`
        <p style="color: #666; text-align: center;">No tasks in this category</p>
      `}
    </div>
  `;
};

const TaskManager = (props, { useStore, useState, useScope, html, css, useStyle }) => {
  const store = useStore({
    tasks: useState([
      { id: 1, text: 'Complete useStore documentation', category: 'Work', completed: false },
      { id: 2, text: 'Review pull requests', category: 'Work', completed: false },
      { id: 3, text: 'Buy groceries', category: 'Personal', completed: true },
      { id: 4, text: 'Call dentist', category: 'Personal', completed: false }
    ]),
    stats: {
      totalTasks: useState(4),
      completedTasks: useState(1)
    }
  });

  useScope({
    'task-list': TaskList
  });

  useStyle(css`
    .manager-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 600px;
    }

    .add-task-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .task-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .category-select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .add-button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 8px 16px;
      cursor: pointer;
    }

    .add-button:hover {
      background-color: #0278c7;
    }

    .stats-bar {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat-item {
      flex: 1;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #029cfd;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
  `);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');

  // Update stats when tasks change
  useEffect(() => {
    const [tasks] = store.tasks;
    store.stats.totalTasks[1](tasks.length);
    store.stats.completedTasks[1](tasks.filter(t => t.completed).length);
  }, [store.tasks[0]]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const [tasks, setTasks] = store.tasks;
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        category: newTaskCategory,
        completed: false
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const completionRate = store.stats.totalTasks[0] > 0 
    ? Math.round((store.stats.completedTasks[0] / store.stats.totalTasks[0]) * 100)
    : 0;

  return html`
    <div class="manager-container">
      <h3>useStore Task Manager</h3>
      
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">${store.stats.totalTasks[0]}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${store.stats.completedTasks[0]}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${completionRate}%</div>
          <div class="stat-label">Progress</div>
        </div>
      </div>

      <div class="add-task-form">
        <input 
          type="text" 
          class="task-input"
          placeholder="Add a new task..."
          .value="${newTaskText}"
          @input="${(e) => setNewTaskText(e.target.value)}"
          @keypress="${(e) => e.key === 'Enter' && addTask()}"
        />
        <select 
          class="category-select"
          .value="${newTaskCategory}"
          @change="${(e) => setNewTaskCategory(e.target.value)}"
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
        <button class="add-button" @click="${addTask}">Add Task</button>
      </div>

      <task-list .props="${{ category: 'Work' }}"></task-list>
      <task-list .props="${{ category: 'Personal' }}"></task-list>
    </div>
  `;
};

// Define components
define({ tag: 'use-store-cart', component: ShoppingCart });
define({ tag: 'use-store-tasks', component: TaskManager });

export default {
  title: "Hooks/useStore",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useStore\` hook provides global state management with automatic persistence to IndexedDB.

## Features
- Nested state structure support
- Automatic persistence to IndexedDB
- Cross-component state sharing
- Event-based state synchronization
- Works with useState hooks

## Usage
\`\`\`javascript
const store = useStore({
  user: {
    name: useState('Guest'),
    preferences: {
      theme: useState('light')
    }
  },
  cart: {
    items: useState([]),
    total: useState(0)
  }
});

// Access state
const [name, setName] = store.user.name;
const [items, setItems] = store.cart.items;

// Update state (automatically persists)
setName('John Doe');
setItems([...items, newItem]);
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const ShoppingCartDemo = {
  render: () => <use-store-cart />,
  name: "Shopping Cart",
  parameters: {
    docs: {
      description: {
        story: "Complete shopping cart with user state, cart items, and settings using useStore for state management."
      }
    }
  }
};

export const TaskManagerDemo = {
  render: () => <use-store-tasks />,
  name: "Task Manager",
  parameters: {
    docs: {
      description: {
        story: "Task manager demonstrating cross-component state sharing with multiple TaskList components using the same store."
      }
    }
  }
};