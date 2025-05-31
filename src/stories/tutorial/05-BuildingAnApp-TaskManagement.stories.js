import React from "react";
import { html, css, define, useState, useEffect, useMemo, useStore, useScope, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Task Form Component
const TaskForm = ({ task = null, onSave, onCancel }, { useState, html, css, useStyle }) => {
  const [formData, setFormData] = useState({
    text: task?.text || '',
    category: task?.category || 'Development',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate || '',
    description: task?.description || '',
    tags: task?.tags || []
  });
  
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  
  useStyle(css`
    .task-form {
      max-width: 600px;
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .form-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .form-grid {
      display: grid;
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    label {
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
    }
    
    input, select, textarea {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
      font-family: inherit;
    }
    
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    .error {
      color: #ff416c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .input-error {
      border-color: #ff416c;
    }
    
    .priority-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .priority-btn {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      text-align: center;
    }
    
    .priority-btn.active {
      border-color: var(--priority-color);
      background-color: var(--priority-color);
      color: white;
    }
    
    .priority-btn:hover:not(.active) {
      border-color: var(--priority-color);
      color: var(--priority-color);
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
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      min-height: 2.5rem;
    }
    
    .tag {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .tag-remove {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    
    .tag-input {
      border: none;
      outline: none;
      background: transparent;
      min-width: 100px;
      flex: 1;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    
    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
    }
  `);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.text.trim()) {
      newErrors.text = 'Task title is required';
    }
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date().setHours(0,0,0,0)) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        id: task?.id || Date.now(),
        completed: task?.completed || false,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };
  
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  return html`
    <form class="task-form" @submit="${handleSubmit}">
      <h2 class="form-title">${task ? 'Edit Task' : 'Create New Task'}</h2>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="task-text">Task Title *</label>
          <input
            id="task-text"
            type="text"
            class="${errors.text ? 'input-error' : ''}"
            .value="${formData.text}"
            @input="${(e) => setFormData({...formData, text: e.target.value})}"
            placeholder="Enter task title..."
          />
          ${errors.text ? html`<div class="error">${errors.text}</div>` : ''}
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="task-category">Category</label>
            <select
              id="task-category"
              .value="${formData.category}"
              @change="${(e) => setFormData({...formData, category: e.target.value})}"
            >
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Testing">Testing</option>
              <option value="Documentation">Documentation</option>
              <option value="Meeting">Meeting</option>
              <option value="Research">Research</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              class="${errors.dueDate ? 'input-error' : ''}"
              .value="${formData.dueDate}"
              @input="${(e) => setFormData({...formData, dueDate: e.target.value})}"
            />
            ${errors.dueDate ? html`<div class="error">${errors.dueDate}</div>` : ''}
          </div>
        </div>
        
        <div class="form-group">
          <label>Priority Level</label>
          <div class="priority-buttons">
            <button
              type="button"
              class="priority-btn priority-low ${formData.priority === 'low' ? 'active' : ''}"
              @click="${() => setFormData({...formData, priority: 'low'})}"
            >
              🟢 Low
            </button>
            <button
              type="button"
              class="priority-btn priority-medium ${formData.priority === 'medium' ? 'active' : ''}"
              @click="${() => setFormData({...formData, priority: 'medium'})}"
            >
              🟡 Medium
            </button>
            <button
              type="button"
              class="priority-btn priority-high ${formData.priority === 'high' ? 'active' : ''}"
              @click="${() => setFormData({...formData, priority: 'high'})}"
            >
              🔴 High
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Tags</label>
          <div class="tags-container" style="border: 2px solid #e9ecef; border-radius: 8px; padding: 0.5rem;">
            ${formData.tags.map(tag => html`
              <span class="tag">
                ${tag}
                <button type="button" class="tag-remove" @click="${() => removeTag(tag)}">×</button>
              </span>
            `)}
            <input
              type="text"
              class="tag-input"
              placeholder="Add tag..."
              .value="${tagInput}"
              @input="${(e) => setTagInput(e.target.value)}"
              @keypress="${(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="task-description">Description</label>
          <textarea
            id="task-description"
            .value="${formData.description}"
            @input="${(e) => setFormData({...formData, description: e.target.value})}"
            placeholder="Add task description..."
          ></textarea>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="${onCancel}">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          ${task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  `;
};

// Task Filter Component
const TaskFilter = ({ filters, onFilterChange }, { html, css, useStyle }) => {
  useStyle(css`
    .task-filter {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    
    .filter-section {
      margin-bottom: 1.5rem;
    }
    
    .filter-section:last-child {
      margin-bottom: 0;
    }
    
    .filter-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }
    
    .filter-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: #667eea;
      color: white;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }
    }
  `);
  
  const statusOptions = [
    { value: 'all', label: 'All Tasks', count: filters.totalCount },
    { value: 'pending', label: 'Pending', count: filters.pendingCount },
    { value: 'completed', label: 'Completed', count: filters.completedCount }
  ];
  
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: '🔴 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🟢 Low' }
  ];
  
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Development', label: '💻 Development' },
    { value: 'Design', label: '🎨 Design' },
    { value: 'Testing', label: '🧪 Testing' },
    { value: 'Documentation', label: '📚 Documentation' },
    { value: 'Meeting', label: '👥 Meeting' },
    { value: 'Research', label: '🔍 Research' }
  ];
  
  return html`
    <div class="task-filter">
      <div class="filter-section">
        <div class="filter-title">Search</div>
        <input
          type="text"
          class="search-input"
          placeholder="Search tasks..."
          .value="${filters.search}"
          @input="${(e) => onFilterChange({ search: e.target.value })}"
        />
      </div>
      
      <div class="filter-section">
        <div class="filter-title">Status</div>
        <div class="filter-buttons">
          ${statusOptions.map(option => html`
            <button
              class="filter-btn ${filters.status === option.value ? 'active' : ''}"
              @click="${() => onFilterChange({ status: option.value })}"
            >
              ${option.label} ${option.count !== undefined ? `(${option.count})` : ''}
            </button>
          `)}
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-section">
          <div class="filter-title">Priority</div>
          <div class="filter-buttons">
            ${priorityOptions.map(option => html`
              <button
                class="filter-btn ${filters.priority === option.value ? 'active' : ''}"
                @click="${() => onFilterChange({ priority: option.value })}"
              >
                ${option.label}
              </button>
            `)}
          </div>
        </div>
        
        <div class="filter-section">
          <div class="filter-title">Category</div>
          <div class="filter-buttons">
            ${categoryOptions.map(option => html`
              <button
                class="filter-btn ${filters.category === option.value ? 'active' : ''}"
                @click="${() => onFilterChange({ category: option.value })}"
              >
                ${option.label}
              </button>
            `)}
          </div>
        </div>
      </div>
    </div>
  `;
};

// Enhanced Task Item
const EnhancedTaskItem = ({ task, onToggle, onEdit, onDelete }, { html, css, useStyle }) => {
  useStyle(css`
    .enhanced-task-item {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border-left: 4px solid var(--priority-color);
      position: relative;
      overflow: hidden;
    }
    
    .enhanced-task-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .enhanced-task-item.completed {
      opacity: 0.8;
      background: #f8f9fa;
    }
    
    .task-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .task-checkbox {
      width: 20px;
      height: 20px;
      accent-color: #667eea;
      margin-top: 0.125rem;
    }
    
    .task-content {
      flex: 1;
    }
    
    .task-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
      line-height: 1.4;
    }
    
    .task-title.completed {
      text-decoration: line-through;
      color: #6c757d;
    }
    
    .task-description {
      color: #6c757d;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .priority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .priority-high {
      background: #fee;
      color: #c53030;
      --priority-color: #ff416c;
    }
    
    .priority-medium {
      background: #fffbeb;
      color: #d69e2e;
      --priority-color: #ffa726;
    }
    
    .priority-low {
      background: #f0fff4;
      color: #38a169;
      --priority-color: #66bb6a;
    }
    
    .task-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    
    .task-tag {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .task-actions {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .enhanced-task-item:hover .task-actions {
      opacity: 1;
    }
    
    .action-btn {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .action-btn.edit {
      color: #667eea;
    }
    
    .action-btn.delete {
      color: #ff416c;
    }
    
    .due-date-warning {
      color: #ff416c;
      font-weight: 600;
    }
    
    .due-date-today {
      color: #ffa726;
      font-weight: 600;
    }
  `);
  
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date().setHours(0,0,0,0);
    const taskDate = new Date(dueDate).setHours(0,0,0,0);
    
    if (taskDate < today) return 'overdue';
    if (taskDate === today) return 'today';
    return 'upcoming';
  };
  
  const formatDueDate = (dueDate) => {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    if (diffDays <= 7) return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString();
  };
  
  const dueDateStatus = getDueDateStatus(task.dueDate);
  
  return html`
    <div class="enhanced-task-item priority-${task.priority} ${task.completed ? 'completed' : ''}">
      <div class="task-header">
        <input
          type="checkbox"
          class="task-checkbox"
          .checked="${task.completed}"
          @change="${onToggle}"
        />
        <div class="task-content">
          <h3 class="task-title ${task.completed ? 'completed' : ''}">${task.text}</h3>
          
          ${task.description ? html`
            <p class="task-description">${task.description}</p>
          ` : ''}
          
          <div class="task-meta">
            <span class="priority-badge priority-${task.priority}">
              ${task.priority} priority
            </span>
            
            <div class="meta-item">
              <span>📁</span>
              <span>${task.category}</span>
            </div>
            
            ${task.dueDate ? html`
              <div class="meta-item ${dueDateStatus === 'overdue' ? 'due-date-warning' : dueDateStatus === 'today' ? 'due-date-today' : ''}">
                <span>📅</span>
                <span>${formatDueDate(task.dueDate)}</span>
              </div>
            ` : ''}
            
            <div class="meta-item">
              <span>⏰</span>
              <span>Created ${new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          
          ${task.tags && task.tags.length > 0 ? html`
            <div class="task-tags">
              ${task.tags.map(tag => html`
                <span class="task-tag">${tag}</span>
              `)}
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="task-actions">
        <button class="action-btn edit" @click="${onEdit}" title="Edit task">
          ✏️
        </button>
        <button class="action-btn delete" @click="${onDelete}" title="Delete task">
          🗑️
        </button>
      </div>
    </div>
  `;
};

// Task Management Demo
const TaskManagementDemo = (_, { useState, useEffect, useMemo, useStore, useScope, html, css, useStyle }) => {
  // Enhanced store with more sample data
  const store = useStore({
    tasks: useState([
      {
        id: 1,
        text: 'Implement user authentication system',
        description: 'Set up JWT authentication with login, logout, and password reset functionality',
        category: 'Development',
        priority: 'high',
        dueDate: '2024-01-20',
        completed: false,
        tags: ['authentication', 'security', 'backend'],
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        text: 'Design dashboard wireframes',
        description: 'Create detailed wireframes for the main dashboard including all widgets and layouts',
        category: 'Design',
        priority: 'medium',
        dueDate: '2024-01-18',
        completed: true,
        tags: ['wireframes', 'ux', 'dashboard'],
        createdAt: '2024-01-14T09:30:00Z'
      },
      {
        id: 3,
        text: 'Write API documentation',
        description: 'Document all REST endpoints with examples and parameter descriptions',
        category: 'Documentation',
        priority: 'low',
        dueDate: '2024-01-25',
        completed: false,
        tags: ['documentation', 'api'],
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 4,
        text: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        category: 'Development',
        priority: 'high',
        dueDate: '2024-01-17',
        completed: false,
        tags: ['devops', 'automation', 'testing'],
        createdAt: '2024-01-15T16:45:00Z'
      },
      {
        id: 5,
        text: 'Team standup meeting',
        description: 'Weekly team sync to discuss progress and blockers',
        category: 'Meeting',
        priority: 'medium',
        dueDate: '2024-01-19',
        completed: false,
        tags: ['meeting', 'team'],
        createdAt: '2024-01-16T11:10:00Z'
      }
    ]),
    
    filters: useState({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all'
    }),
    
    ui: useState({
      showForm: false,
      editingTask: null,
      sortBy: 'dueDate',
      sortOrder: 'asc'
    })
  });
  
  const [tasks, setTasks] = store.tasks;
  const [filters, setFilters] = store.filters;
  const [ui, setUi] = store.ui;
  
  useScope({
    'task-form': TaskForm,
    'task-filter': TaskFilter,
    'enhanced-task-item': EnhancedTaskItem
  });
  
  useStyle(css`
    .task-management-demo {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .demo-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .demo-title {
      font-size: 2rem;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .demo-subtitle {
      color: #6c757d;
      font-size: 1.125rem;
    }
    
    .action-bar {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .task-stats {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .add-task-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .add-task-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .task-list {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 2rem;
      min-height: 400px;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }
    
    .sort-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .sort-btn {
      background: white;
      border: 1px solid #e9ecef;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }
    
    .sort-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }
    
    .sort-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
  `);
  
  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(filters.search.toLowerCase()) ||
                           task.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
                           task.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' ||
                           (filters.status === 'completed' && task.completed) ||
                           (filters.status === 'pending' && !task.completed);
      
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || task.category === filters.category;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
    
    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (ui.sortBy) {
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          const bDate = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'created':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'alphabetical':
          comparison = a.text.localeCompare(b.text);
          break;
      }
      
      return ui.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [tasks, filters, ui.sortBy, ui.sortOrder]);
  
  // Task statistics
  const taskStats = useMemo(() => {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    const overdue = tasks.filter(task => 
      !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
    ).length;
    
    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      completedCount: completed,
      pendingCount: pending,
      totalCount: tasks.length
    };
  }, [tasks]);
  
  const handleSaveTask = (taskData) => {
    if (ui.editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === ui.editingTask.id ? taskData : task
      ));
    } else {
      // Add new task
      setTasks([...tasks, taskData]);
    }
    
    setUi({ ...ui, showForm: false, editingTask: null });
  };
  
  const handleEditTask = (task) => {
    setUi({ ...ui, showForm: true, editingTask: task });
  };
  
  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };
  
  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId 
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        : task
    ));
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  return html`
    <div class="task-management-demo">
      <div class="demo-header">
        <h1 class="demo-title">📋 Advanced Task Management</h1>
        <p class="demo-subtitle">Complete CRUD operations with filtering, sorting, and rich task data</p>
      </div>
      
      <div class="action-bar">
        <div class="task-stats">
          <div class="stat-item">
            <div class="stat-number">${taskStats.total}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${taskStats.pending}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${taskStats.completed}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${taskStats.overdue}</div>
            <div class="stat-label">Overdue</div>
          </div>
        </div>
        
        <button class="add-task-btn" @click="${() => setUi({ ...ui, showForm: true, editingTask: null })}">
          <span>➕</span>
          <span>Add New Task</span>
        </button>
      </div>
      
      <task-filter 
        .props="${{ 
          filters: { ...filters, ...taskStats }, 
          onFilterChange: handleFilterChange 
        }}"
      ></task-filter>
      
      <div class="task-list">
        <div class="sort-controls">
          <span style="font-weight: 600; color: #495057;">Sort by:</span>
          <button 
            class="sort-btn ${ui.sortBy === 'dueDate' ? 'active' : ''}"
            @click="${() => setUi({ ...ui, sortBy: 'dueDate' })}"
          >
            Due Date
          </button>
          <button 
            class="sort-btn ${ui.sortBy === 'priority' ? 'active' : ''}"
            @click="${() => setUi({ ...ui, sortBy: 'priority' })}"
          >
            Priority
          </button>
          <button 
            class="sort-btn ${ui.sortBy === 'created' ? 'active' : ''}"
            @click="${() => setUi({ ...ui, sortBy: 'created' })}"
          >
            Created
          </button>
          <button 
            class="sort-btn ${ui.sortBy === 'alphabetical' ? 'active' : ''}"
            @click="${() => setUi({ ...ui, sortBy: 'alphabetical' })}"
          >
            A-Z
          </button>
          <button 
            class="sort-btn"
            @click="${() => setUi({ ...ui, sortOrder: ui.sortOrder === 'asc' ? 'desc' : 'asc' })}"
          >
            ${ui.sortOrder === 'asc' ? '⬆️' : '⬇️'}
          </button>
        </div>
        
        ${filteredTasks.length > 0 ? filteredTasks.map(task => html`
          <enhanced-task-item
            .props="${{
              task,
              onToggle: () => handleToggleTask(task.id),
              onEdit: () => handleEditTask(task),
              onDelete: () => handleDeleteTask(task.id)
            }}"
          ></enhanced-task-item>
        `) : html`
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or create a new task to get started.</p>
          </div>
        `}
      </div>
      
      ${ui.showForm ? html`
        <div class="modal-overlay" @click="${(e) => e.target === e.currentTarget && setUi({ ...ui, showForm: false, editingTask: null })}">
          <task-form
            .props="${{
              task: ui.editingTask,
              onSave: handleSaveTask,
              onCancel: () => setUi({ ...ui, showForm: false, editingTask: null })
            }}"
          ></task-form>
        </div>
      ` : ''}
    </div>
  `;
};

// Register components
define({ tag: 'task-form', component: TaskForm });
define({ tag: 'task-filter', component: TaskFilter });
define({ tag: 'enhanced-task-item', component: EnhancedTaskItem });
define({ tag: 'task-management-demo', component: TaskManagementDemo });

export default {
  title: "Tutorial/03. Building an App",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Advanced Task Management Features

The third part of our tutorial demonstrates sophisticated task management with full CRUD operations, advanced filtering, and rich data handling.

## Features Demonstrated

- **Rich Task Forms**: Complex forms with validation, tags, priorities, and dates
- **Advanced Filtering**: Multi-dimensional filtering by status, priority, category, and search
- **Smart Sorting**: Sort by due date, priority, creation date, or alphabetical order
- **Enhanced UI**: Rich task cards with metadata, status indicators, and actions
- **Data Persistence**: All changes automatically saved to IndexedDB via useStore

## Key Concepts Covered

- **Form Handling**: Complex form state management and validation patterns
- **Performance**: useMemo for expensive filtering and sorting operations
- **UX Patterns**: Modal overlays, hover states, and intuitive interactions
- **Data Modeling**: Rich task objects with relationships and metadata

## Reference Links

- **Core Hooks**: See "Tutorial/02. Core Hooks" for useMemo performance patterns
- **Form Patterns**: Check "Advanced/Forms" for validation and handling techniques
- **State Management**: View "Advanced/State" for complex store patterns
        `
      }
    }
  }
};

export const TaskManagementFeatures = {
  render: wrapLitHtmlStory(() => html`<task-management-demo></task-management-demo>`),
  name: "03. Task Management & CRUD",
  parameters: {
    docs: {
      description: {
        story: `
### Advanced Task Management System

This section builds a comprehensive task management system with all the features you'd expect in a modern productivity app:

**📝 Rich Task Creation**
- Complex form with validation and error handling
- Multiple data types: text, dates, priorities, categories, tags
- Dynamic tag system with add/remove functionality
- Real-time validation with user feedback

**🔍 Advanced Filtering & Search**
- Multi-dimensional filtering by status, priority, category
- Real-time text search across task content and tags
- Filter combinations with live count updates
- Responsive filter interface for mobile devices

**📊 Smart Sorting & Organization**
- Sort by due date, priority, creation date, or alphabetical
- Ascending/descending toggle for all sort methods
- Visual indicators for overdue and urgent tasks
- Organized task metadata with status badges

**⚡ Performance Optimizations**
- useMemo for expensive filtering operations
- Efficient re-rendering with proper dependency arrays
- Optimized list rendering for large task sets
- Smooth animations and micro-interactions

**💾 Persistent State Management**
- Automatic saving to IndexedDB with useStore
- Real-time updates across all components
- Conflict-free state updates with proper immutability
- Nested store organization for scalability

**🎨 Enhanced User Experience**
- Modal overlays for task creation and editing
- Hover effects and smooth transitions
- Visual feedback for all user actions
- Responsive design for all screen sizes

Try creating, editing, filtering, and sorting tasks to see all the features in action!
        `
      }
    }
  }
};