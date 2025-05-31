import React from "react";
import { html, css, define, useState, useEffect, useStore, useScope, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Basic Button Component
const AppButton = ({ variant = 'primary', size = 'medium', disabled = false, children, onClick }, { html, css, useStyle }) => {
  useStyle(css`
    .app-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      text-decoration: none;
      white-space: nowrap;
    }
    
    .app-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .app-button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .app-button:not(:disabled):active {
      transform: translateY(0);
    }
    
    /* Sizes */
    .size-small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    
    .size-medium {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
    
    .size-large {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }
    
    /* Variants */
    .variant-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .variant-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .variant-success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
    }
    
    .variant-danger {
      background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
      color: white;
    }
    
    .variant-outline {
      background-color: transparent;
      border: 2px solid #667eea;
      color: #667eea;
    }
    
    .variant-ghost {
      background-color: transparent;
      color: #495057;
      padding: 0.5rem;
    }
  `);
  
  return html`
    <button 
      class="app-button variant-${variant} size-${size}"
      ?disabled="${disabled}"
      @click="${onClick}"
    >
      ${children}
    </button>
  `;
};

// Modal Component
const AppModal = ({ isOpen = false, onClose, title, children }, { html, css, useStyle, renderChildren }) => {
  useStyle(css`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      transform: scale(0.9) translateY(-50px);
      transition: all 0.3s ease;
    }
    
    .modal-overlay.open .modal-content {
      transform: scale(1) translateY(0);
    }
    
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #495057;
      margin: 0;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .modal-close:hover {
      background-color: #f8f9fa;
      color: #495057;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
  `);
  
  return html`
    <div class="modal-overlay ${isOpen ? 'open' : ''}" @click="${(e) => e.target === e.currentTarget && onClose?.()}">
      <div class="modal-content" @click="${(e) => e.stopPropagation()}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" @click="${onClose}">&times;</button>
        </div>
        <div class="modal-body">
          ${renderChildren(children)}
        </div>
      </div>
    </div>
  `;
};

// Loading Spinner Component
const LoadingSpinner = ({ size = 'medium', color = 'primary' }, { html, css, useStyle }) => {
  useStyle(css`
    .spinner {
      display: inline-block;
      border-radius: 50%;
      border: 3px solid #f3f3f3;
      border-top: 3px solid var(--spinner-color);
      animation: spin 1s linear infinite;
    }
    
    .size-small {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }
    
    .size-medium {
      width: 40px;
      height: 40px;
    }
    
    .size-large {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }
    
    .color-primary {
      --spinner-color: #667eea;
    }
    
    .color-success {
      --spinner-color: #38ef7d;
    }
    
    .color-danger {
      --spinner-color: #ff416c;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `);
  
  return html`
    <div class="spinner size-${size} color-${color}"></div>
  `;
};

// App Layout Component
const AppLayout = ({ children }, { html, css, useStyle, useScope, renderChildren }) => {
  useScope({
    'app-button': AppButton,
    'app-modal': AppModal,
    'loading-spinner': LoadingSpinner
  });
  
  useStyle(css`
    .app-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .app-header {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .app-logo {
      font-size: 1.5rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .app-nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    
    .app-main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .app-footer {
      background: white;
      padding: 2rem;
      text-align: center;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
      margin-top: auto;
    }
  `);
  
  return html`
    <div class="app-layout">
      <header class="app-header">
        <div class="app-logo">📋 TaskFlow</div>
        <nav class="app-nav">
          <app-button variant="ghost" size="small">Dashboard</app-button>
          <app-button variant="ghost" size="small">Tasks</app-button>
          <app-button variant="ghost" size="small">Projects</app-button>
          <app-button variant="primary" size="small">+ New Task</app-button>
        </nav>
      </header>
      
      <main class="app-main">
        ${renderChildren(children)}
      </main>
      
      <footer class="app-footer">
        <p>Built with Dim Framework • TaskFlow Demo App</p>
      </footer>
    </div>
  `;
};

// Basic Task Item Component
const TaskItem = ({ task, onToggle, onEdit, onDelete }, { html, css, useStyle }) => {
  useStyle(css`
    .task-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      border-left: 4px solid var(--priority-color);
    }
    
    .task-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .task-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .task-checkbox {
      width: 20px;
      height: 20px;
      accent-color: #667eea;
    }
    
    .task-text {
      flex: 1;
      font-size: 1rem;
      color: #495057;
      transition: all 0.2s;
    }
    
    .task-text.completed {
      text-decoration: line-through;
      color: #6c757d;
    }
    
    .task-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .task-item:hover .task-actions {
      opacity: 1;
    }
    
    .action-button {
      background: none;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    
    .action-button.edit {
      color: #667eea;
    }
    
    .action-button.edit:hover {
      background-color: #e7f3ff;
    }
    
    .action-button.delete {
      color: #ff416c;
    }
    
    .action-button.delete:hover {
      background-color: #ffebee;
    }
    
    .task-meta {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #6c757d;
    }
    
    .priority-high {
      --priority-color: #ff416c;
    }
    
    .priority-medium {
      --priority-color: #ffa726;
    }
    
    .priority-low {
      --priority-color: #66bb6a;
    }
  `);
  
  const priorityColors = {
    high: '#ff416c',
    medium: '#ffa726', 
    low: '#66bb6a'
  };
  
  return html`
    <div class="task-item priority-${task.priority || 'medium'}">
      <div class="task-content">
        <input 
          type="checkbox" 
          class="task-checkbox"
          .checked="${task.completed}"
          @change="${onToggle}"
        />
        <span class="task-text ${task.completed ? 'completed' : ''}">
          ${task.text}
        </span>
        <div class="task-actions">
          <button class="action-button edit" @click="${onEdit}">✏️</button>
          <button class="action-button delete" @click="${onDelete}">🗑️</button>
        </div>
      </div>
      ${task.dueDate || task.category ? html`
        <div class="task-meta">
          ${task.category ? html`<span>📁 ${task.category}</span>` : ''}
          ${task.dueDate ? html`<span>📅 ${task.dueDate}</span>` : ''}
        </div>
      ` : ''}
    </div>
  `;
};

// Basic App Store Setup
const createAppStore = () => {
  return useStore({
    // User preferences
    user: {
      name: useState('Demo User'),
      email: useState('demo@taskflow.com'),
      avatar: useState('👤')
    },
    
    // Application settings
    settings: {
      theme: useState('light'),
      language: useState('en'),
      notifications: useState(true)
    },
    
    // Task management
    tasks: {
      items: useState([
        { id: 1, text: 'Set up project structure', completed: true, priority: 'high', category: 'Development', dueDate: '2024-01-15' },
        { id: 2, text: 'Create basic components', completed: false, priority: 'high', category: 'Development', dueDate: '2024-01-16' },
        { id: 3, text: 'Implement state management', completed: false, priority: 'medium', category: 'Development', dueDate: '2024-01-17' },
        { id: 4, text: 'Design user interface', completed: false, priority: 'low', category: 'Design', dueDate: '2024-01-18' }
      ]),
      categories: useState(['Development', 'Design', 'Testing', 'Documentation']),
      filter: useState('all')
    },
    
    // UI state
    ui: {
      loading: useState(false),
      activeModal: useState(null),
      selectedTask: useState(null)
    }
  });
};

// Foundation Demo Component
const FoundationDemo = (_, { useState, useEffect, html, css, useStyle, useScope }) => {
  const [demoStep, setDemoStep] = useState('layout');
  const store = createAppStore();
  
  useScope({
    'app-layout': AppLayout,
    'app-button': AppButton,
    'app-modal': AppModal,
    'loading-spinner': LoadingSpinner,
    'task-item': TaskItem
  });
  
  useStyle(css`
    .foundation-demo {
      width: 100%;
    }
    
    .demo-nav {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .nav-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .demo-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .step-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .component-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .showcase-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .showcase-title {
      font-weight: bold;
      margin-bottom: 1rem;
      color: #495057;
    }
    
    .task-list-demo {
      max-width: 600px;
      margin: 2rem auto;
    }
    
    .store-visualization {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5rem;
      border-radius: 8px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    .key { color: #9cdcfe; }
    .string { color: #ce9178; }
    .number { color: #b5cea8; }
    .boolean { color: #569cd6; }
  `);
  
  const [tasks] = store.tasks.items;
  const [modalOpen, setModalOpen] = useState(false);
  
  const demos = {
    layout: {
      title: "🏗️ App Layout & Structure",
      content: html`
        <p>The foundation starts with a clean, responsive layout that will house our entire application.</p>
        
        <app-layout>
          <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px;">
            <h2>Welcome to TaskFlow!</h2>
            <p>This is our main application layout with header, navigation, and footer.</p>
            <app-button variant="primary" @click="${() => setModalOpen(true)}">
              Open Sample Modal
            </app-button>
          </div>
        </app-layout>
        
        <app-modal 
          ?isOpen="${modalOpen}" 
          title="Sample Modal"
          onClose="${() => setModalOpen(false)}"
        >
          <div style="text-align: center; padding: 2rem;">
            <p>This modal demonstrates our reusable UI components in action!</p>
            <app-button variant="success" @click="${() => setModalOpen(false)}">
              Great, got it!
            </app-button>
          </div>
        </app-modal>
      `
    },
    
    components: {
      title: "🧩 Foundation Components",
      content: html`
        <p>Reusable UI components form the building blocks of our application.</p>
        
        <div class="component-showcase">
          <div class="showcase-item">
            <div class="showcase-title">Buttons</div>
            <app-button variant="primary" size="small">Primary</app-button>
            <br><br>
            <app-button variant="secondary" size="small">Secondary</app-button>
            <br><br>
            <app-button variant="outline" size="small">Outline</app-button>
          </div>
          
          <div class="showcase-item">
            <div class="showcase-title">Variants</div>
            <app-button variant="success" size="small">Success</app-button>
            <br><br>
            <app-button variant="danger" size="small">Danger</app-button>
            <br><br>
            <app-button variant="ghost" size="small">Ghost</app-button>
          </div>
          
          <div class="showcase-item">
            <div class="showcase-title">Loading States</div>
            <loading-spinner size="small"></loading-spinner>
            <br><br>
            <loading-spinner size="medium" color="success"></loading-spinner>
            <br><br>
            <loading-spinner size="large" color="danger"></loading-spinner>
          </div>
          
          <div class="showcase-item">
            <div class="showcase-title">Interactive</div>
            <app-button variant="primary" size="small" @click="${() => alert('Button clicked!')}">
              Click me!
            </app-button>
            <br><br>
            <app-button variant="secondary" size="small" disabled="true">
              Disabled
            </app-button>
          </div>
        </div>
      `
    },
    
    tasks: {
      title: "📋 Basic Task Components",
      content: html`
        <p>Task management components that will form the core of our application.</p>
        
        <div class="task-list-demo">
          ${tasks.map(task => html`
            <task-item 
              .props="${{
                task,
                onToggle: () => console.log('Toggle task:', task.id),
                onEdit: () => console.log('Edit task:', task.id),
                onDelete: () => console.log('Delete task:', task.id)
              }}"
            ></task-item>
          `)}
        </div>
      `
    },
    
    store: {
      title: "🏪 State Management Setup",
      content: html`
        <p>Centralized state management using useStore with automatic IndexedDB persistence.</p>
        
        <div class="store-visualization">
<span class="key">store</span> = {
  <span class="key">user</span>: {
    <span class="key">name</span>: <span class="string">"Demo User"</span>,
    <span class="key">email</span>: <span class="string">"demo@taskflow.com"</span>,
    <span class="key">avatar</span>: <span class="string">"👤"</span>
  },
  <span class="key">settings</span>: {
    <span class="key">theme</span>: <span class="string">"light"</span>,
    <span class="key">language</span>: <span class="string">"en"</span>,
    <span class="key">notifications</span>: <span class="boolean">true</span>
  },
  <span class="key">tasks</span>: {
    <span class="key">items</span>: [<span class="number">${tasks.length}</span> tasks],
    <span class="key">categories</span>: [<span class="string">"Development"</span>, <span class="string">"Design"</span>, ...],
    <span class="key">filter</span>: <span class="string">"all"</span>
  },
  <span class="key">ui</span>: {
    <span class="key">loading</span>: <span class="boolean">false</span>,
    <span class="key">activeModal</span>: <span class="boolean">null</span>,
    <span class="key">selectedTask</span>: <span class="boolean">null</span>
  }
}
        </div>
        
        <p><strong>Key Benefits:</strong></p>
        <ul>
          <li>✅ Automatic persistence to IndexedDB</li>
          <li>✅ Reactive updates across components</li>
          <li>✅ Nested state organization</li>
          <li>✅ Type-safe state access</li>
        </ul>
      `
    }
  };
  
  return html`
    <div class="foundation-demo">
      <div class="demo-nav">
        <div class="nav-buttons">
          ${Object.keys(demos).map(key => html`
            <app-button 
              variant="${demoStep === key ? 'primary' : 'outline'}" 
              size="small"
              @click="${() => setDemoStep(key)}"
            >
              ${demos[key].title}
            </app-button>
          `)}
        </div>
      </div>
      
      <div class="demo-content">
        <h2 class="step-title">${demos[demoStep].title}</h2>
        ${demos[demoStep].content}
      </div>
    </div>
  `;
};

// Register components
define({ tag: 'app-button', component: AppButton });
define({ tag: 'app-modal', component: AppModal });
define({ tag: 'loading-spinner', component: LoadingSpinner });
define({ tag: 'app-layout', component: AppLayout });
define({ tag: 'task-item', component: TaskItem });
define({ tag: 'foundation-demo', component: FoundationDemo });

export default {
  title: "Tutorial/03. Building an App",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Building the Foundation

The second part of our task management app tutorial focuses on creating the foundational components and basic state management structure.

## What We're Building

- **Layout Components**: App shell with header, navigation, and responsive design
- **UI Components**: Reusable buttons, modals, loading spinners, and form elements  
- **Task Components**: Basic task items and list structures
- **State Management**: Centralized store setup with useStore and IndexedDB persistence

## Key Concepts Demonstrated

- **Component Composition**: Using useScope for organizing component hierarchies
- **Styling Patterns**: CSS-in-JS with useStyle for scoped, maintainable styles
- **State Architecture**: Store design patterns for scalable state management
- **Reusability**: Creating flexible, reusable components with props and variants

## Reference Links

- **Core Hooks**: See "Tutorial/02. Core Hooks" for useState, useEffect details
- **Advanced Hooks**: Check "Advanced/Hooks" for useStore and useScope patterns
- **Styling Guide**: View "Advanced/Styling" for CSS-in-JS best practices
        `
      }
    }
  }
};

export const FoundationComponents = {
  render: wrapLitHtmlStory(() => html`<foundation-demo></foundation-demo>`),
  name: "02. Foundation & Components",
  parameters: {
    docs: {
      description: {
        story: `
### Building the Application Foundation

This section establishes the core building blocks of our task management application:

**🏗️ Layout System**
- Responsive app shell with header, navigation, and content areas
- Consistent spacing and typography throughout the application
- Mobile-first responsive design patterns

**🧩 Component Library**
- Reusable UI components with multiple variants and sizes
- Consistent styling system using CSS-in-JS with useStyle
- Interactive components with hover effects and animations

**📋 Task Management Basics**
- Task item components with priority indicators and actions
- Basic CRUD operation structure for task management
- Visual feedback and micro-interactions

**🏪 State Management Foundation**
- Centralized store using useStore with nested organization
- Automatic persistence to IndexedDB for offline capability
- Reactive state updates across component boundaries

**Code Patterns Demonstrated:**
- Component composition with useScope
- Props-based component configuration
- CSS-in-JS with dynamic styling
- Store design for scalable state management

**Next Steps:**
Part 3 will build upon this foundation to add advanced task features, filtering, and more complex interactions.
        `
      }
    }
  }
};