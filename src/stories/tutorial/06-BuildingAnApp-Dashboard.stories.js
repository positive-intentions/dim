import React from "react";
import { html, css, define, useState, useEffect, useMemo, useStore, useScope, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Chart Component (Simple implementation)
const SimpleChart = ({ data, type = 'bar', width = 300, height = 200 }, { html, css, useStyle }) => {
  useStyle(css`
    .chart-container {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      flex-direction: column;
    }
    
    .chart-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 100%;
      gap: 0.5rem;
      padding: 0 1rem;
    }
    
    .bar {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 4px 4px 0 0;
      min-width: 20px;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .bar:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
    
    .bar-label {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: #6c757d;
      white-space: nowrap;
    }
    
    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: #495057;
    }
    
    .pie-chart {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto;
      border-radius: 50%;
      background: conic-gradient(
        #667eea 0deg ${data[0]?.angle || 0}deg,
        #11998e ${data[0]?.angle || 0}deg ${(data[0]?.angle || 0) + (data[1]?.angle || 0)}deg,
        #ff416c ${(data[0]?.angle || 0) + (data[1]?.angle || 0)}deg 360deg
      );
    }
    
    .pie-legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    
    .line-chart {
      position: relative;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 1rem;
    }
    
    .line-point {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      position: relative;
    }
    
    .line-point::before {
      content: attr(data-value);
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: #495057;
      font-weight: 600;
    }
  `);
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithAngles = data.map(item => ({
      ...item,
      angle: (item.value / total) * 360
    }));
    
    const colors = ['#667eea', '#11998e', '#ff416c', '#ffa726'];
    
    return html`
      <div class="chart-container">
        <div class="chart-title">${data.title || 'Chart'}</div>
        <div class="pie-chart"></div>
        <div class="pie-legend">
          ${dataWithAngles.map((item, index) => html`
            <div class="legend-item">
              <div class="legend-color" style="background-color: ${colors[index]}"></div>
              <span>${item.label}: ${item.value}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
  
  if (type === 'line') {
    return html`
      <div class="chart-container">
        <div class="chart-title">${data.title || 'Chart'}</div>
        <div class="line-chart">
          ${data.map(item => html`
            <div 
              class="line-point" 
              data-value="${item.value}"
              style="bottom: ${(item.value / maxValue) * 80}%"
            ></div>
          `)}
        </div>
      </div>
    `;
  }
  
  return html`
    <div class="chart-container">
      <div class="chart-title">${data.title || 'Chart'}</div>
      <div class="bar-chart">
        ${data.map(item => html`
          <div 
            class="bar" 
            style="height: ${(item.value / maxValue) * 80}%; flex: 1;"
          >
            <div class="bar-value">${item.value}</div>
            <div class="bar-label">${item.label}</div>
          </div>
        `)}
      </div>
    </div>
  `;
};

// Widget Component
const DashboardWidget = ({ title, icon, children, className = '' }, { html, css, useStyle, renderChildren }) => {
  useStyle(css`
    .dashboard-widget {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .dashboard-widget:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .widget-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }
    
    .widget-icon {
      font-size: 1.5rem;
    }
    
    .widget-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #495057;
      margin: 0;
    }
    
    .widget-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      color: #6c757d;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .metric-change {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .change-positive {
      color: #38ef7d;
    }
    
    .change-negative {
      color: #ff416c;
    }
    
    .widget-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .widget-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .widget-list-item:last-child {
      border-bottom: none;
    }
    
    .list-item-text {
      color: #495057;
      font-size: 0.875rem;
    }
    
    .list-item-value {
      font-weight: 600;
      color: #667eea;
    }
    
    .progress-bar {
      background: #e9ecef;
      border-radius: 10px;
      height: 8px;
      margin-top: 0.5rem;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px;
      transition: width 0.3s ease;
    }
  `);
  
  return html`
    <div class="dashboard-widget ${className}">
      <div class="widget-header">
        <span class="widget-icon">${icon}</span>
        <h3 class="widget-title">${title}</h3>
      </div>
      <div class="widget-content">
        ${renderChildren(children)}
      </div>
    </div>
  `;
};

// Activity Feed Component
const ActivityFeed = ({ activities }, { html, css, useStyle }) => {
  useStyle(css`
    .activity-feed {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-text {
      color: #495057;
      font-size: 0.875rem;
      line-height: 1.4;
      margin-bottom: 0.25rem;
    }
    
    .activity-time {
      color: #6c757d;
      font-size: 0.75rem;
    }
    
    .activity-highlight {
      font-weight: 600;
      color: #667eea;
    }
  `);
  
  return html`
    <div class="activity-feed">
      ${activities.map(activity => html`
        <div class="activity-item">
          <div class="activity-icon">${activity.icon}</div>
          <div class="activity-content">
            <div class="activity-text">
              ${activity.text}
              ${activity.highlight ? html`<span class="activity-highlight">${activity.highlight}</span>` : ''}
            </div>
            <div class="activity-time">${activity.time}</div>
          </div>
        </div>
      `)}
    </div>
  `;
};

// Quick Actions Component
const QuickActions = ({ actions, onAction }, { html, css, useStyle }) => {
  useStyle(css`
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }
    
    .action-button {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 1.5rem 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4);
    }
    
    .action-icon {
      font-size: 1.5rem;
    }
    
    .action-label {
      font-size: 0.875rem;
      font-weight: 500;
    }
  `);
  
  return html`
    <div class="quick-actions">
      ${actions.map(action => html`
        <button 
          class="action-button"
          @click="${() => onAction(action.id)}"
        >
          <span class="action-icon">${action.icon}</span>
          <span class="action-label">${action.label}</span>
        </button>
      `)}
    </div>
  `;
};

// Main Dashboard Component
const TaskDashboard = (_, { useState, useEffect, useMemo, useStore, useScope, html, css, useStyle }) => {
  // Enhanced store with sample data
  const store = useStore({
    tasks: useState([
      {
        id: 1,
        text: 'Implement user authentication',
        category: 'Development',
        priority: 'high',
        dueDate: '2024-01-20',
        completed: false,
        createdAt: '2024-01-15T10:00:00Z',
        timeSpent: 120 // minutes
      },
      {
        id: 2,
        text: 'Design dashboard wireframes',
        category: 'Design',
        priority: 'medium',
        dueDate: '2024-01-18',
        completed: true,
        createdAt: '2024-01-14T09:30:00Z',
        completedAt: '2024-01-16T14:20:00Z',
        timeSpent: 180
      },
      {
        id: 3,
        text: 'Write API documentation',
        category: 'Documentation',
        priority: 'low',
        dueDate: '2024-01-25',
        completed: false,
        createdAt: '2024-01-16T14:20:00Z',
        timeSpent: 45
      },
      {
        id: 4,
        text: 'Setup CI/CD pipeline',
        category: 'Development',
        priority: 'high',
        dueDate: '2024-01-17',
        completed: true,
        createdAt: '2024-01-15T16:45:00Z',
        completedAt: '2024-01-17T10:30:00Z',
        timeSpent: 240
      },
      {
        id: 5,
        text: 'Team standup meeting',
        category: 'Meeting',
        priority: 'medium',
        dueDate: '2024-01-19',
        completed: false,
        createdAt: '2024-01-16T11:10:00Z',
        timeSpent: 30
      },
      {
        id: 6,
        text: 'Code review session',
        category: 'Development',
        priority: 'medium',
        dueDate: '2024-01-21',
        completed: true,
        createdAt: '2024-01-17T09:00:00Z',
        completedAt: '2024-01-18T11:45:00Z',
        timeSpent: 90
      }
    ]),
    
    activities: useState([
      {
        id: 1,
        icon: '✅',
        text: 'Completed task:',
        highlight: 'Setup CI/CD pipeline',
        time: '2 hours ago'
      },
      {
        id: 2,
        icon: '📝',
        text: 'Created new task:',
        highlight: 'Write API documentation',
        time: '4 hours ago'
      },
      {
        id: 3,
        icon: '🎯',
        text: 'Updated priority for:',
        highlight: 'User authentication',
        time: '6 hours ago'
      },
      {
        id: 4,
        icon: '💬',
        text: 'Added comment to:',
        highlight: 'Dashboard wireframes',
        time: '1 day ago'
      },
      {
        id: 5,
        icon: '📊',
        text: 'Generated weekly report',
        highlight: '',
        time: '2 days ago'
      }
    ]),
    
    settings: useState({
      theme: 'light',
      showCompletedTasks: true,
      defaultView: 'dashboard'
    })
  });
  
  const [tasks] = store.tasks;
  const [activities] = store.activities;
  
  useScope({
    'dashboard-widget': DashboardWidget,
    'simple-chart': SimpleChart,
    'activity-feed': ActivityFeed,
    'quick-actions': QuickActions
  });
  
  useStyle(css`
    .task-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
    
    .dashboard-header {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .dashboard-title {
      font-size: 2.5rem;
      color: #495057;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .dashboard-subtitle {
      color: #6c757d;
      font-size: 1.125rem;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .widget-large {
      grid-column: span 2;
    }
    
    .widget-full {
      grid-column: 1 / -1;
    }
    
    @media (max-width: 768px) {
      .widget-large {
        grid-column: span 1;
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .productivity-trends {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .trend-item {
      text-align: center;
    }
    
    .trend-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }
    
    .trend-label {
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .upcoming-tasks {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .upcoming-task {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .upcoming-task:last-child {
      border-bottom: none;
    }
    
    .task-info {
      flex: 1;
    }
    
    .task-name {
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.25rem;
    }
    
    .task-meta {
      font-size: 0.75rem;
      color: #6c757d;
    }
    
    .task-priority {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .priority-high {
      background: #fee;
      color: #c53030;
    }
    
    .priority-medium {
      background: #fffbeb;
      color: #d69e2e;
    }
    
    .priority-low {
      background: #f0fff4;
      color: #38a169;
    }
  `);
  
  // Dashboard analytics
  const dashboardStats = useMemo(() => {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const overdue = tasks.filter(task => 
      !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
    ).length;
    
    const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    const avgTimePerTask = tasks.length > 0 ? Math.round(totalTimeSpent / tasks.length) : 0;
    
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    
    const categoryStats = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});
    
    const priorityStats = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    const weeklyProgress = [
      { label: 'Mon', value: 3 },
      { label: 'Tue', value: 5 },
      { label: 'Wed', value: 2 },
      { label: 'Thu', value: 4 },
      { label: 'Fri', value: 6 },
      { label: 'Sat', value: 1 },
      { label: 'Sun', value: 2 }
    ];
    
    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      completionRate,
      totalTimeSpent,
      avgTimePerTask,
      categoryStats,
      priorityStats,
      weeklyProgress
    };
  }, [tasks]);
  
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(task => !task.completed && task.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);
  
  const chartData = {
    categories: Object.entries(dashboardStats.categoryStats).map(([label, value]) => ({
      label,
      value
    })),
    priorities: Object.entries(dashboardStats.priorityStats).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value
    })),
    weekly: dashboardStats.weeklyProgress
  };
  
  const quickActions = [
    { id: 'new-task', icon: '➕', label: 'New Task' },
    { id: 'new-project', icon: '📋', label: 'New Project' },
    { id: 'time-tracker', icon: '⏱️', label: 'Time Tracker' },
    { id: 'reports', icon: '📊', label: 'Reports' }
  ];
  
  const handleQuickAction = (actionId) => {
    console.log('Quick action:', actionId);
    // In a real app, this would navigate or open modals
    alert(`Quick action: ${actionId}`);
  };
  
  return html`
    <div class="task-dashboard">
      <div class="dashboard-header">
        <h1 class="dashboard-title">📊 TaskFlow Dashboard</h1>
        <p class="dashboard-subtitle">Your productivity insights and task overview</p>
      </div>
      
      <div class="stats-grid">
        <dashboard-widget title="Total Tasks" icon="📋">
          <div class="metric-value">${dashboardStats.total}</div>
          <div class="metric-label">All Tasks</div>
          <div class="metric-change change-positive">
            +2 this week
          </div>
        </dashboard-widget>
        
        <dashboard-widget title="Completion Rate" icon="✅">
          <div class="metric-value">${dashboardStats.completionRate}%</div>
          <div class="metric-label">Completed</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${dashboardStats.completionRate}%"></div>
          </div>
        </dashboard-widget>
        
        <dashboard-widget title="Pending Tasks" icon="⏳">
          <div class="metric-value">${dashboardStats.pending}</div>
          <div class="metric-label">In Progress</div>
          <div class="metric-change ${dashboardStats.overdue > 0 ? 'change-negative' : 'change-positive'}">
            ${dashboardStats.overdue} overdue
          </div>
        </dashboard-widget>
        
        <dashboard-widget title="Time Spent" icon="⏱️">
          <div class="metric-value">${Math.round(dashboardStats.totalTimeSpent / 60)}h</div>
          <div class="metric-label">Total Hours</div>
          <div class="metric-change change-positive">
            ${dashboardStats.avgTimePerTask}m avg/task
          </div>
        </dashboard-widget>
      </div>
      
      <div class="dashboard-grid">
        <dashboard-widget title="Weekly Progress" icon="📈">
          <simple-chart 
            .props="${{
              data: chartData.weekly,
              type: 'bar',
              width: 280,
              height: 150
            }}"
          ></simple-chart>
        </dashboard-widget>
        
        <dashboard-widget title="Tasks by Category" icon="📊">
          <simple-chart 
            .props="${{
              data: chartData.categories,
              type: 'pie',
              width: 280,
              height: 200
            }}"
          ></simple-chart>
        </dashboard-widget>
        
        <dashboard-widget title="Upcoming Tasks" icon="🔜" className="widget-large">
          <ul class="upcoming-tasks">
            ${upcomingTasks.map(task => html`
              <li class="upcoming-task">
                <div class="task-info">
                  <div class="task-name">${task.text}</div>
                  <div class="task-meta">
                    Due: ${new Date(task.dueDate).toLocaleDateString()} • ${task.category}
                  </div>
                </div>
                <span class="task-priority priority-${task.priority}">
                  ${task.priority}
                </span>
              </li>
            `)}
          </ul>
        </dashboard-widget>
        
        <dashboard-widget title="Recent Activity" icon="🔔">
          <activity-feed .props="${{ activities }}"></activity-feed>
        </dashboard-widget>
        
        <dashboard-widget title="Quick Actions" icon="⚡">
          <quick-actions 
            .props="${{
              actions: quickActions,
              onAction: handleQuickAction
            }}"
          ></quick-actions>
        </dashboard-widget>
        
        <dashboard-widget title="Productivity Trends" icon="📈" className="widget-full">
          <div class="productivity-trends">
            <div class="trend-item">
              <div class="trend-value">23%</div>
              <div class="trend-label">Improvement</div>
            </div>
            <div class="trend-item">
              <div class="trend-value">4.2</div>
              <div class="trend-label">Avg Daily Tasks</div>
            </div>
            <div class="trend-item">
              <div class="trend-value">2.5h</div>
              <div class="trend-label">Focus Time</div>
            </div>
            <div class="trend-item">
              <div class="trend-value">89%</div>
              <div class="trend-label">On-time Delivery</div>
            </div>
            <div class="trend-item">
              <div class="trend-value">12</div>
              <div class="trend-label">Streak Days</div>
            </div>
          </div>
          <simple-chart 
            .props="${{
              data: [
                { label: 'Week 1', value: 15 },
                { label: 'Week 2', value: 22 },
                { label: 'Week 3', value: 18 },
                { label: 'Week 4', value: 28 },
                { label: 'Week 5', value: 24 }
              ],
              type: 'line',
              width: '100%',
              height: 120
            }}"
          ></simple-chart>
        </dashboard-widget>
      </div>
    </div>
  `;
};

// Register components
define({ tag: 'simple-chart', component: SimpleChart });
define({ tag: 'dashboard-widget', component: DashboardWidget });
define({ tag: 'activity-feed', component: ActivityFeed });
define({ tag: 'quick-actions', component: QuickActions });
define({ tag: 'task-dashboard', component: TaskDashboard });

export default {
  title: "Tutorial/03. Building an App",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Analytics Dashboard

The fourth part of our tutorial demonstrates building a comprehensive analytics dashboard with data visualization, metrics, and real-time insights.

## Features Demonstrated

- **Data Visualization**: Custom chart components with multiple chart types
- **Widget System**: Reusable dashboard widgets with consistent styling
- **Analytics Calculations**: Complex data analysis with useMemo for performance
- **Activity Feeds**: Real-time activity tracking and display
- **Responsive Grid**: Flexible grid layout that adapts to different screen sizes

## Key Concepts Covered

- **Data Processing**: Advanced useMemo patterns for analytics calculations
- **Component Composition**: Widget-based architecture with useScope
- **Visualization**: Custom chart implementations using CSS and math
- **Performance**: Efficient rendering of large datasets and frequent updates
- **UX Patterns**: Dashboard layouts, quick actions, and data presentation

## Reference Links

- **Performance**: See "Advanced/Performance" for useMemo optimization patterns
- **Component Architecture**: Check "Advanced/Components" for widget composition
- **Data Visualization**: View "Advanced/Charts" for chart implementation details
        `
      }
    }
  }
};

export const AnalyticsDashboard = {
  render: wrapLitHtmlStory(() => html`<task-dashboard></task-dashboard>`),
  name: "04. Analytics & Dashboard",
  parameters: {
    docs: {
      description: {
        story: `
### Comprehensive Analytics Dashboard

This section builds a powerful analytics dashboard that transforms raw task data into actionable insights:

**📊 Data Visualization**
- Custom chart components for bars, lines, and pie charts
- CSS-based chart rendering with smooth animations
- Interactive hover effects and tooltips
- Responsive chart sizing for different screen sizes

**📈 Key Metrics & KPIs**
- Task completion rates and productivity trends
- Time tracking and average time per task
- Overdue task monitoring and alerts
- Category and priority distribution analysis

**🎛️ Widget-Based Architecture**
- Reusable dashboard widget components
- Flexible grid layout with responsive breakpoints
- Consistent styling and hover effects across widgets
- Easy addition of new widget types

**🔔 Activity Monitoring**
- Real-time activity feed with recent actions
- Icon-based activity categorization
- Timestamp formatting and relative time display
- Scrollable feed for extensive activity history

**⚡ Quick Actions**
- One-click access to common operations
- Visual action buttons with gradients and animations
- Extensible action system for new features
- Responsive grid layout for different screen sizes

**📱 Responsive Design**
- Mobile-first responsive grid system
- Adaptive widget sizing and layout
- Touch-friendly interactive elements
- Optimized for tablets and mobile devices

**🔧 Performance Optimizations**
- useMemo for expensive analytics calculations
- Efficient data processing and filtering
- Optimized re-rendering with proper dependencies
- Lazy loading for large datasets

**Advanced Features:**
- **Trend Analysis**: Week-over-week progress tracking
- **Productivity Metrics**: Focus time and delivery rates
- **Goal Tracking**: Streak counters and achievement indicators
- **Data Export**: Preparation for report generation

The dashboard demonstrates how to create a professional-grade analytics interface using Dim's component system and hooks.
        `
      }
    }
  }
};