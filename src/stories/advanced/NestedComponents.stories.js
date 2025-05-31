import React from "react";
import { html, css, define, useState, useScope, useStyle, useStore, useEffect, renderChildren } from "../../core/dim.ts";
import { 
  NestedTodoAppWithChildren, 
  TodoCategoryWithChildren, 
  TodoItemWithChildren,
  NestedDashboardWithChildren,
  DashboardWidgetWithChildren 
} from "../components/NestedComponents.js";

// Level 3: Leaf component
const TodoItem = ({ todo, onToggle, onDelete, children }, { html, css, useStyle, renderChildren }) => {
  useStyle(css`
    .todo-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
    }

    .todo-item:hover {
      background-color: #f5f5f5;
      transform: translateX(4px);
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
      color: #999;
    }

    .todo-priority {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
      margin-right: 0.5rem;
    }

    .priority-high {
      background-color: #fee;
      color: #c00;
    }

    .priority-medium {
      background-color: #fef3cd;
      color: #856404;
    }

    .priority-low {
      background-color: #d4edda;
      color: #155724;
    }

    .delete-button {
      background-color: #dc3545;
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .todo-item:hover .delete-button {
      opacity: 1;
    }

    .delete-button:hover {
      background-color: #c82333;
    }

    .todo-children {
      margin-left: 2rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #666;
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
      <div style="flex: 1;">
        <span class="todo-text ${todo.completed ? 'completed' : ''}">
          ${todo.text}
        </span>
        ${children ? html`<div class="todo-children">${renderChildren(children)}</div>` : ''}
      </div>
      <span class="todo-priority priority-${todo.priority}">
        ${todo.priority}
      </span>
      <button class="delete-button" @click="${onDelete}">×</button>
    </div>
  `;
};

// Level 2: Category component
const TodoCategory = ({ category, todos, onToggleTodo, onDeleteTodo, children }, { useState, useScope, html, css, useStyle, renderChildren }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  useScope({
    'todo-item': TodoItem
  });

  useStyle(css`
    .category-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      cursor: pointer;
      user-select: none;
    }

    .category-header:hover {
      background-color: #e9ecef;
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: bold;
    }

    .expand-icon {
      transition: transform 0.2s;
    }

    .expand-icon.collapsed {
      transform: rotate(-90deg);
    }

    .category-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #666;
    }

    .category-content {
      padding: 1rem;
      max-height: 500px;
      overflow-y: auto;
      transition: max-height 0.3s, padding 0.3s;
    }

    .category-content.collapsed {
      max-height: 0;
      padding: 0 1rem;
    }

    .empty-message {
      text-align: center;
      color: #999;
      padding: 2rem;
    }
  `);

  const categoryTodos = todos ? todos.filter(todo => todo.category === category) : [];
  const completedCount = categoryTodos.filter(todo => todo.completed).length;

  return html`
    <div class="category-container">
      <div class="category-header" @click="${() => setIsExpanded(!isExpanded)}">
        <div class="category-title">
          <span class="expand-icon ${!isExpanded ? 'collapsed' : ''}">▼</span>
          ${category}
        </div>
        ${todos ? html`
          <div class="category-stats">
            <span>${completedCount}/${categoryTodos.length} completed</span>
          </div>
        ` : ''}
      
      <div class="category-content ${!isExpanded ? 'collapsed' : ''}">
        ${children ? renderChildren(children) : 
          categoryTodos && categoryTodos.length > 0 ? categoryTodos.map(todo => html`
            <todo-item 
              .props="${{
                todo,
                onToggle: () => onToggleTodo(todo.id),
                onDelete: () => onDeleteTodo(todo.id)
              }}"
            ></todo-item>
          `) : html`
            <div class="empty-message">No tasks in this category</div>
          `
        }
      </div>
    </div>
  `;
};

// Level 1: Main todo app
const NestedTodoApp = ({ children }, { useState, useScope, useStore, useEffect, html, css, useStyle, renderChildren }) => {
  const store = useStore({
    todos: useState([
      { id: 1, text: 'Build nested component demo', category: 'Development', priority: 'high', completed: false },
      { id: 2, text: 'Write tests for components', category: 'Development', priority: 'medium', completed: false },
      { id: 3, text: 'Update documentation', category: 'Documentation', priority: 'low', completed: true },
      { id: 4, text: 'Review pull requests', category: 'Development', priority: 'high', completed: false },
      { id: 5, text: 'Create API examples', category: 'Documentation', priority: 'medium', completed: false },
      { id: 6, text: 'Set up CI/CD pipeline', category: 'DevOps', priority: 'high', completed: false },
      { id: 7, text: 'Configure monitoring', category: 'DevOps', priority: 'medium', completed: true }
    ]),
    stats: {
      totalCount: useState(7),
      completedCount: useState(2),
      categories: useState(['Development', 'Documentation', 'DevOps'])
    }
  });

  useScope({
    'todo-category': TodoCategory,
    'todo-item': TodoItem
  });

  useStyle(css`
    .app-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 800px;
    }

    .app-header {
      margin-bottom: 2rem;
    }

    .app-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .app-description {
      color: #666;
      margin-bottom: 1rem;
    }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #029cfd;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }

    .add-todo-form {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 0.5rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #e7f3ff;
      border-radius: 8px;
    }

    input, select {
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

    .component-tree {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 2rem;
      font-family: monospace;
      font-size: 0.875rem;
    }

    .tree-level {
      margin-left: 1.5rem;
    }

    .tree-component {
      margin: 0.25rem 0;
    }
  `);

  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('Development');
  const [newTodoPriority, setNewTodoPriority] = useState('medium');

  // Update stats when todos change
  useEffect(() => {
    const [todos] = store.todos;
    store.stats.totalCount[1](todos.length);
    store.stats.completedCount[1](todos.filter(t => t.completed).length);
  }, [store.todos[0]]);

  const addTodo = () => {
    if (newTodoText.trim()) {
      const [todos, setTodos] = store.todos;
      const newTodo = {
        id: Date.now(),
        text: newTodoText,
        category: newTodoCategory,
        priority: newTodoPriority,
        completed: false
      };
      setTodos([...todos, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (todoId) => {
    const [todos, setTodos] = store.todos;
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (todoId) => {
    const [todos, setTodos] = store.todos;
    setTodos(todos.filter(todo => todo.id !== todoId));
  };

  const completionRate = store.stats.totalCount[0] > 0 
    ? Math.round((store.stats.completedCount[0] / store.stats.totalCount[0]) * 100)
    : 0;

  return html`
    <div class="app-container">
      <div class="app-header">
        <h2 class="app-title">Nested Components Demo</h2>
        <p class="app-description">
          This demonstrates a 3-level component hierarchy with state management:
          NestedTodoApp → TodoCategory → TodoItem
        </p>
      </div>

      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-value">${store.stats.totalCount[0]}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${store.stats.completedCount[0]}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${completionRate}%</div>
          <div class="stat-label">Progress</div>
        </div>
      </div>

      <div class="add-todo-form">
        <input 
          type="text" 
          placeholder="Add a new task..."
          .value="${newTodoText}"
          @input="${(e) => setNewTodoText(e.target.value)}"
          @keypress="${(e) => e.key === 'Enter' && addTodo()}"
        />
        <select 
          .value="${newTodoCategory}"
          @change="${(e) => setNewTodoCategory(e.target.value)}"
        >
          ${store.stats.categories[0].map(cat => html`
            <option value="${cat}">${cat}</option>
          `)}
        </select>
        <select 
          .value="${newTodoPriority}"
          @change="${(e) => setNewTodoPriority(e.target.value)}"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button class="add-button" @click="${addTodo}">Add Task</button>
      </div>

      ${children ? renderChildren(children) : 
        store.stats.categories[0].map(category => html`
          <todo-category 
            .props="${{
              category,
              todos: store.todos[0],
              onToggleTodo: toggleTodo,
              onDeleteTodo: deleteTodo
            }}"
          ></todo-category>
        `)
      }

      <div class="component-tree">
        <strong>Component Hierarchy:</strong>
        <div class="tree-component">📦 NestedTodoApp (Level 1)</div>
        <div class="tree-level">
          <div class="tree-component">📁 TodoCategory (Level 2) × ${store.stats.categories[0].length}</div>
          <div class="tree-level">
            <div class="tree-component">📄 TodoItem (Level 3) × ${store.todos[0].length}</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Dashboard with multiple widget types
const Widget = ({ type, data }, { html, css, useStyle }) => {
  useStyle(css`
    .widget {
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .widget-header {
      font-weight: bold;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .widget-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-value {
      font-size: 3rem;
      font-weight: bold;
      color: #029cfd;
    }

    .chart-bar {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      height: 100px;
    }

    .bar {
      flex: 1;
      background-color: #029cfd;
      border-radius: 4px 4px 0 0;
      position: relative;
    }

    .bar-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      white-space: nowrap;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .list-item:last-child {
      border-bottom: none;
    }
  `);

  const renderContent = () => {
    switch (type) {
      case 'metric':
        return html`
          <div class="metric-value">${data.value}</div>
        `;
      
      case 'chart':
        const maxValue = Math.max(...data.values);
        return html`
          <div class="chart-bar">
            ${data.values.map((value, index) => html`
              <div 
                class="bar" 
                style="height: ${(value / maxValue) * 100}%"
              >
                <span class="bar-label">${data.labels[index]}</span>
              </div>
            `)}
          </div>
        `;
      
      case 'list':
        return html`
          <div style="width: 100%;">
            ${data.items.map(item => html`
              <div class="list-item">
                <span>${item.name}</span>
                <span>${item.value}</span>
              </div>
            `)}
          </div>
        `;
      
      default:
        return html`<div>Unknown widget type</div>`;
    }
  };

  return html`
    <div class="widget">
      <div class="widget-header">${data.title}</div>
      <div class="widget-content">
        ${renderContent()}
      </div>
    </div>
  `;
};

const Dashboard = (props, { useState, useScope, html, css, useStyle }) => {
  const [widgets] = useState([
    {
      id: 1,
      type: 'metric',
      data: { title: 'Total Users', value: '1,234' }
    },
    {
      id: 2,
      type: 'chart',
      data: {
        title: 'Weekly Activity',
        values: [65, 80, 45, 90, 75],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      }
    },
    {
      id: 3,
      type: 'list',
      data: {
        title: 'Top Products',
        items: [
          { name: 'Product A', value: '$1,200' },
          { name: 'Product B', value: '$980' },
          { name: 'Product C', value: '$750' }
        ]
      }
    },
    {
      id: 4,
      type: 'metric',
      data: { title: 'Revenue', value: '$45.2K' }
    }
  ]);

  useScope({
    'dashboard-widget': Widget
  });

  useStyle(css`
    .dashboard-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f8f9fa;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .widget-wrapper {
      min-height: 200px;
    }
  `);

  return html`
    <div class="dashboard-container">
      <h3>Dashboard with Dynamic Widgets</h3>
      <p>Each widget is a nested component with its own rendering logic</p>
      
      <div class="dashboard-grid">
        ${widgets.map(widget => html`
          <div class="widget-wrapper">
            <dashboard-widget 
              .props="${{
                type: widget.type,
                data: widget.data
              }}"
            ></dashboard-widget>
          </div>
        `)}
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'nested-todo-app', component: NestedTodoApp });
define({ tag: 'nested-dashboard', component: Dashboard });

export default {
  title: "Advanced/Nested Components",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Demonstrates complex component hierarchies and composition patterns in Dim.

## Features
- Multi-level component nesting
- Props passing between parent and child components
- Scoped component registration with useScope
- State management across component boundaries
- Independent component styling

## Component Communication
- Parent → Child: Props passing
- Child → Parent: Callback functions
- Sibling → Sibling: Shared state via useStore

## Best Practices
- Keep components focused and single-purpose
- Use useScope to register child components
- Pass callbacks for child-to-parent communication
- Use useStore for cross-component state
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const TodoAppHierarchy = {
  render: () => <nested-todo-app />,
  name: "3-Level Todo App",
  parameters: {
    docs: {
      description: {
        story: "A todo application with 3 levels of nested components demonstrating props passing and event handling."
      }
    }
  }
};

export const DynamicDashboard = {
  render: () => <nested-dashboard />,
  name: "Dynamic Widget Dashboard",
  parameters: {
    docs: {
      description: {
        story: "Dashboard with dynamically rendered widgets showing polymorphic component patterns."
      }
    }
  }
};

export const ReactLikeNesting = {
  render: () => {
    // Use useEffect to render lit-html template after React mounts
    const containerRef = React.useRef(null);
    
    React.useEffect(() => {
      if (containerRef.current) {
        // Import lit render function and render our template
        import('lit').then(({ render }) => {
          // Create simple toggle and delete handlers for demo
          const handleToggle = (id) => {
            console.log('Toggle todo:', id);
          };
          
          const handleDelete = (id) => {
            console.log('Delete todo:', id);
          };
          
          const template = html`
            <nested-todo-app>
              <todo-category 
                category="Development" 
                onToggleTodo=${handleToggle} 
                onDeleteTodo=${handleDelete}
              >
                <todo-item 
                  todo={{ id: 1, text: 'Learn React', completed: false, priority: 'high' }}
                  onToggle=${() => handleToggle(1)}
                  onDelete=${() => handleDelete(1)}
                />
                <todo-item 
                  todo={{ id: 2, text: 'Build Components', completed: true, priority: 'medium' }}
                  onToggle=${() => handleToggle(2)}
                  onDelete=${() => handleDelete(2)}
                />
              </todo-category>
              <todo-category 
                category="Design"
                onToggleTodo=${handleToggle} 
                onDeleteTodo=${handleDelete}
              >
                <todo-item 
                  todo={{ id: 3, text: 'Create Mockups', completed: false, priority: 'low' }}
                  onToggle=${() => handleToggle(3)}
                  onDelete=${() => handleDelete(3)}
                />
              </todo-category>
            </nested-todo-app>
          `;
          render(template, containerRef.current);
        });
      }
    }, []);
    
    return React.createElement('div', { ref: containerRef });
  },
  name: "React-like Nesting",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates React-like nested component structure with children components."
      }
    }
  }
};

// export const NestedWidgets = {
//   render: () => html`
//     <nested-dashboard>
//       <dashboard-widget type="metric" data={{ title: 'Active Users', value: '2,500' }}>
//         <div class="trend-indicator">↑ 12%</div>
//       </dashboard-widget>
//       <dashboard-widget type="chart" data={{ title: 'Monthly Stats', values: [30, 45, 60, 75, 90], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] }}>
//         <div class="chart-legend">
//           <span class="legend-item">2023</span>
//           <span class="legend-item">2024</span>
//         </div>
//       </dashboard-widget>
//     </nested-dashboard>
//   `,
//   name: "Nested Widgets with Children",
//   parameters: {
//     docs: {
//       description: {
//         story: "Shows how widgets can contain child elements for additional customization."
//       }
//     }
//   }
// };

// export const ComplexNesting = {
//   render: () => html`
//     <nested-todo-app>
//       <todo-category category="Frontend">
//         <todo-item todo={{ id: 1, text: 'Setup React', completed: true }}>
//           <div class="subtasks">
//             <span>Create project</span>
//             <span>Install dependencies</span>
//           </div>
//         </todo-item>
//         <todo-item todo={{ id: 2, text: 'Build Components', completed: false }}>
//           <div class="priority-badge">High Priority</div>
//         </todo-item>
//       </todo-category>
//       <todo-category category="Backend">
//         <todo-item todo={{ id: 3, text: 'API Development', completed: false }}>
//           <div class="tech-stack">
//             <span>Node.js</span>
//             <span>Express</span>
//           </div>
//         </todo-item>
//       </todo-category>
//     </nested-todo-app>
//   `,
//   name: "Complex Component Nesting",
//   parameters: {
//     docs: {
//       description: {
//         story: "Demonstrates complex nesting patterns with multiple levels of children and custom content."
//       }
//     }
//   }
// };

