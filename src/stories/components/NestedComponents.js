import { html, css, define, useState, useScope, useStyle, useStore, useEffect, renderChildren } from "../../core/dim.ts";

// Updated TodoItem that supports children
export const TodoItemWithChildren = ({ todo, onToggle, onDelete, children }, { html, css, useStyle, renderChildren }) => {
  useStyle(css`
    .todo-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
      position: relative;
    }

    .todo-item:hover {
      background-color: #f5f5f5;
      transform: translateX(4px);
    }

    .todo-checkbox {
      margin-right: 0.75rem;
    }

    .todo-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .todo-text {
      transition: all 0.2s;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: #999;
    }

    .todo-children {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
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

    ::slotted(*) {
      margin-top: 0.5rem;
    }
  `);

  // If todo is provided via props, use it; otherwise try to get from attributes
  const todoData = todo || {
    id: Date.now(),
    text: 'Task',
    completed: false,
    priority: 'medium'
  };

  return html`
    <div class="todo-item">
      <input 
        type="checkbox" 
        class="todo-checkbox"
        .checked="${todoData.completed}"
        @change="${onToggle || (() => {})}"
      />
      <div class="todo-content">
        <span class="todo-text ${todoData.completed ? 'completed' : ''}">
          ${todoData.text}
        </span>
        ${children ? html`
          <div class="todo-children">
            ${renderChildren(children)}
          </div>
        ` : ''}
      </div>
      ${todoData.priority ? html`
        <span class="todo-priority priority-${todoData.priority}">
          ${todoData.priority}
        </span>
      ` : ''}
      ${onDelete ? html`
        <button class="delete-button" @click="${onDelete}">×</button>
      ` : ''}
    </div>
  `;
};

// Updated TodoCategory that supports children
export const TodoCategoryWithChildren = ({ category, todos, onToggleTodo, onDeleteTodo, children }, 
  { useState, useScope, html, css, useStyle, renderChildren }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  useScope({
    'todo-item': TodoItemWithChildren
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

    ::slotted(todo-item) {
      display: block;
      margin-bottom: 0.5rem;
    }
  `);

  // Handle both prop-based todos and children
  const hasTodos = todos && todos.length > 0;
  const hasChildren = children && children.trim() !== '';

  const categoryTodos = todos?.filter(todo => todo.category === category) || [];
  const completedCount = categoryTodos.filter(todo => todo.completed).length;

  return html`
    <div class="category-container">
      <div class="category-header" @click="${() => setIsExpanded(!isExpanded)}">
        <div class="category-title">
          <span class="expand-icon ${!isExpanded ? 'collapsed' : ''}">▼</span>
          ${category || 'Tasks'}
        </div>
        ${hasTodos ? html`
          <div class="category-stats">
            <span>${completedCount}/${categoryTodos.length} completed</span>
          </div>
        ` : ''}
      </div>
      
      <div class="category-content ${!isExpanded ? 'collapsed' : ''}">
        ${hasChildren ? renderChildren(children) : 
          hasTodos ? categoryTodos.map(todo => html`
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

// Updated main app that supports children
export const NestedTodoAppWithChildren = ({ children }, 
  { useState, useScope, useStore, useEffect, html, css, useStyle, renderChildren }) => {
  const store = useStore({
    todos: useState([]),
    stats: {
      totalCount: useState(0),
      completedCount: useState(0),
      categories: useState(['Development', 'Documentation', 'DevOps'])
    }
  });

  useScope({
    'todo-category': TodoCategoryWithChildren
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

    .app-content {
      margin-top: 1rem;
    }

    ::slotted(todo-category) {
      display: block;
      margin-bottom: 1rem;
    }
  `);

  const hasChildren = children && children.trim() !== '';

  return html`
    <div class="app-container">
      <div class="app-header">
        <h2 class="app-title">Nested Todo App with Children Support</h2>
        <p class="app-description">
          This component supports React-like nesting of child components
        </p>
      </div>

      <div class="app-content">
        ${hasChildren ? renderChildren(children) : html`
          <p style="text-align: center; color: #666;">
            Add todo-category elements as children to see them rendered here
          </p>
        `}
      </div>
    </div>
  `;
};

// Updated Dashboard Widget that supports children
export const DashboardWidgetWithChildren = ({ type, data, children }, { html, css, useStyle, renderChildren }) => {
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
      flex-direction: column;
    }

    .widget-children {
      margin-top: 1rem;
      width: 100%;
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

    ::slotted(*) {
      font-size: 0.875rem;
      color: #666;
    }

    ::slotted(.trend-indicator) {
      color: #28a745;
      font-weight: bold;
    }

    ::slotted(.chart-legend) {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 0.5rem;
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
      
      default:
        return html`<div>Widget type: ${type}</div>`;
    }
  };

  return html`
    <div class="widget">
      <div class="widget-header">${data.title}</div>
      <div class="widget-content">
        ${renderContent()}
        ${children ? html`
          <div class="widget-children">
            ${renderChildren(children)}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

// Updated Dashboard that supports children
export const NestedDashboardWithChildren = ({ children }, { useState, useScope, html, css, useStyle, renderChildren }) => {
  useScope({
    'dashboard-widget': DashboardWidgetWithChildren
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

    ::slotted(dashboard-widget) {
      min-height: 200px;
    }
  `);

  const hasChildren = children && children.trim() !== '';

  return html`
    <div class="dashboard-container">
      <h3>Dashboard with Nested Widgets</h3>
      <p>This dashboard supports nested widget components</p>
      
      <div class="dashboard-grid">
        ${hasChildren ? renderChildren(children) : html`
          <p style="grid-column: 1 / -1; text-align: center; color: #666;">
            Add dashboard-widget elements as children to populate the dashboard
          </p>
        `}
      </div>
    </div>
  `;
};

// Register the new components
define({ tag: 'nested-todo-app-v2', component: NestedTodoAppWithChildren });
define({ tag: 'todo-category-v2', component: TodoCategoryWithChildren });
define({ tag: 'todo-item-v2', component: TodoItemWithChildren });
define({ tag: 'nested-dashboard-v2', component: NestedDashboardWithChildren });
define({ tag: 'dashboard-widget-v2', component: DashboardWidgetWithChildren });