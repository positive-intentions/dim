import React from "react";
import { html, css, define, useState, useEffect, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// App Planning Demo Component
const AppPlanningDemo = (_, { useState, html, css, useStyle }) => {
  const [selectedFeature, setSelectedFeature] = useState('overview');
  
  useStyle(css`
    .planning-demo {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .hero-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .hero-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .feature-nav {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .nav-button {
      background-color: #f8f9fa;
      border: 2px solid #dee2e6;
      color: #495057;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }
    
    .nav-button:hover {
      background-color: #e9ecef;
      transform: translateY(-2px);
    }
    
    .nav-button.active {
      background-color: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .content-section {
      background-color: #fff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
    }
    
    .section-title {
      font-size: 1.8rem;
      color: #495057;
      margin-bottom: 1.5rem;
      border-bottom: 3px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }
    
    .feature-card {
      background: linear-gradient(145deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #dee2e6;
      transition: all 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .feature-title {
      font-size: 1.25rem;
      font-weight: bold;
      color: #495057;
      margin-bottom: 0.75rem;
    }
    
    .feature-description {
      color: #6c757d;
      line-height: 1.6;
    }
    
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .tech-item {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .architecture-diagram {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 2rem;
      margin: 2rem 0;
      text-align: center;
    }
    
    .layer {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem;
      margin: 0.5rem;
      border-radius: 8px;
      font-weight: bold;
    }
    
    .flow-arrow {
      font-size: 1.5rem;
      color: #667eea;
      margin: 0.5rem;
    }
    
    .file-structure {
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5rem;
      border-radius: 8px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    
    .folder {
      color: #4fc3f7;
    }
    
    .file {
      color: #a5d6a7;
    }
    
    .comment {
      color: #9e9e9e;
    }
    
    .roadmap {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin: 2rem 0;
    }
    
    .roadmap-step {
      background-color: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      border: 1px solid rgba(255,255,255,0.3);
    }
    
    .step-number {
      background-color: rgba(255,255,255,0.3);
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 1rem;
    }
  `);
  
  const features = {
    overview: {
      title: "📱 Task Management App Overview",
      content: html`
        <p>We'll build a comprehensive task management application that showcases all of Dim's capabilities. This isn't just a simple todo list - it's a full-featured productivity app!</p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <div class="feature-title">Smart Task Organization</div>
            <div class="feature-description">
              Categories, priorities, due dates, tags, and advanced filtering. Tasks that adapt to your workflow.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <div class="feature-title">Team Collaboration</div>
            <div class="feature-description">
              Share projects, assign tasks, real-time updates, and team activity feeds.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <div class="feature-title">Analytics Dashboard</div>
            <div class="feature-description">
              Productivity insights, completion rates, time tracking, and progress visualization.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <div class="feature-title">Customizable Interface</div>
            <div class="feature-description">
              Dark/light themes, custom layouts, personalized dashboards, and accessibility options.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <div class="feature-title">Offline Capability</div>
            <div class="feature-description">
              Works offline, syncs when online, local storage, and conflict resolution.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <div class="feature-title">Performance Optimized</div>
            <div class="feature-description">
              Lazy loading, virtualization, memoization, and smooth animations throughout.
            </div>
          </div>
        </div>
      `
    },
    
    architecture: {
      title: "🏗️ Application Architecture",
      content: html`
        <p>Our app follows a modern, scalable architecture using Dim's component system and advanced patterns.</p>
        
        <div class="architecture-diagram">
          <div class="layer">🖥️ Presentation Layer (Components)</div>
          <div class="flow-arrow">↓</div>
          <div class="layer">🎯 Business Logic Layer (Custom Hooks)</div>
          <div class="flow-arrow">↓</div>
          <div class="layer">💾 State Management Layer (useStore)</div>
          <div class="flow-arrow">↓</div>
          <div class="layer">🔄 Data Layer (API + IndexedDB)</div>
        </div>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🧩</div>
            <div class="feature-title">Component Composition</div>
            <div class="feature-description">
              Nested components with useScope for clean organization and reusability.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <div class="feature-title">State Management</div>
            <div class="feature-description">
              Centralized store with useStore, automatic persistence, and reactive updates.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎪</div>
            <div class="feature-title">Custom Hooks</div>
            <div class="feature-description">
              Reusable business logic encapsulated in custom hooks for API calls, validation, etc.
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <div class="feature-title">Styling System</div>
            <div class="feature-description">
              Scoped CSS with useStyle, theme system, and responsive design patterns.
            </div>
          </div>
        </div>
      `
    },
    
    structure: {
      title: "📁 Project Structure",
      content: html`
        <p>A well-organized file structure is crucial for maintainability. Here's how we'll structure our task management app:</p>
        
        <div class="file-structure">
<span class="folder">task-manager-app/</span>
├── <span class="folder">src/</span>
│   ├── <span class="folder">components/</span>          <span class="comment"># Reusable UI components</span>
│   │   ├── <span class="folder">common/</span>
│   │   │   ├── <span class="file">Button.js</span>
│   │   │   ├── <span class="file">Modal.js</span>
│   │   │   ├── <span class="file">LoadingSpinner.js</span>
│   │   │   └── <span class="file">ErrorBoundary.js</span>
│   │   ├── <span class="folder">forms/</span>
│   │   │   ├── <span class="file">TaskForm.js</span>
│   │   │   ├── <span class="file">ProjectForm.js</span>
│   │   │   └── <span class="file">UserProfileForm.js</span>
│   │   └── <span class="folder">layout/</span>
│   │       ├── <span class="file">Header.js</span>
│   │       ├── <span class="file">Sidebar.js</span>
│   │       └── <span class="file">Footer.js</span>
│   ├── <span class="folder">features/</span>           <span class="comment"># Feature-specific components</span>
│   │   ├── <span class="folder">tasks/</span>
│   │   │   ├── <span class="file">TaskList.js</span>
│   │   │   ├── <span class="file">TaskItem.js</span>
│   │   │   ├── <span class="file">TaskFilter.js</span>
│   │   │   └── <span class="file">TaskStats.js</span>
│   │   ├── <span class="folder">projects/</span>
│   │   │   ├── <span class="file">ProjectBoard.js</span>
│   │   │   ├── <span class="file">ProjectCard.js</span>
│   │   │   └── <span class="file">ProjectSettings.js</span>
│   │   ├── <span class="folder">dashboard/</span>
│   │   │   ├── <span class="file">DashboardHome.js</span>
│   │   │   ├── <span class="file">AnalyticsWidget.js</span>
│   │   │   └── <span class="file">ActivityFeed.js</span>
│   │   └── <span class="folder">teams/</span>
│   │       ├── <span class="file">TeamList.js</span>
│   │       ├── <span class="file">TeamMember.js</span>
│   │       └── <span class="file">InviteModal.js</span>
│   ├── <span class="folder">hooks/</span>              <span class="comment"># Custom hooks</span>
│   │   ├── <span class="file">useApi.js</span>         <span class="comment"># API operations</span>
│   │   ├── <span class="file">useAuth.js</span>        <span class="comment"># Authentication</span>
│   │   ├── <span class="file">useLocalStorage.js</span> <span class="comment"># Local storage</span>
│   │   ├── <span class="file">useDebounce.js</span>    <span class="comment"># Debounced operations</span>
│   │   ├── <span class="file">useNotifications.js</span> <span class="comment"># Toast/notifications</span>
│   │   └── <span class="file">useTheme.js</span>       <span class="comment"># Theme switching</span>
│   ├── <span class="folder">stores/</span>             <span class="comment"># Global state management</span>
│   │   ├── <span class="file">appStore.js</span>       <span class="comment"># Main application store</span>
│   │   ├── <span class="file">taskStore.js</span>      <span class="comment"># Task-specific state</span>
│   │   ├── <span class="file">userStore.js</span>      <span class="comment"># User preferences</span>
│   │   └── <span class="file">themeStore.js</span>     <span class="comment"># Theme configuration</span>
│   ├── <span class="folder">utils/</span>              <span class="comment"># Helper functions</span>
│   │   ├── <span class="file">validation.js</span>     <span class="comment"># Form validation</span>
│   │   ├── <span class="file">dateHelpers.js</span>    <span class="comment"># Date manipulation</span>
│   │   ├── <span class="file">formatters.js</span>     <span class="comment"># Data formatting</span>
│   │   └── <span class="file">constants.js</span>      <span class="comment"># App constants</span>
│   ├── <span class="folder">styles/</span>             <span class="comment"># Global styles & themes</span>
│   │   ├── <span class="file">themes.js</span>         <span class="comment"># Theme definitions</span>
│   │   ├── <span class="file">globals.css</span>       <span class="comment"># Global CSS</span>
│   │   └── <span class="file">animations.css</span>    <span class="comment"># Shared animations</span>
│   └── <span class="file">app.js</span>                <span class="comment"># Main application entry</span>
├── <span class="folder">stories/</span>               <span class="comment"># Storybook stories</span>
│   ├── <span class="file">TaskList.stories.js</span>
│   ├── <span class="file">Dashboard.stories.js</span>
│   └── <span class="file">ThemeDemo.stories.js</span>
└── <span class="folder">public/</span>
    ├── <span class="file">index.html</span>
    ├── <span class="file">manifest.json</span>
    └── <span class="folder">assets/</span>
        ├── <span class="file">icons/</span>
        └── <span class="file">images/</span>
        </div>
      `
    },
    
    features: {
      title: "⚡ Technical Features We'll Implement",
      content: html`
        <p>Our app will demonstrate every major Dim framework feature through practical, real-world implementations:</p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🪝</div>
            <div class="feature-title">All Core Hooks</div>
            <div class="feature-description">
              <strong>useState:</strong> Component state<br>
              <strong>useEffect:</strong> Side effects, API calls<br>
              <strong>useMemo:</strong> Performance optimization<br>
              <strong>useRef:</strong> DOM access, imperative APIs
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🏪</div>
            <div class="feature-title">Advanced State Management</div>
            <div class="feature-description">
              <strong>useStore:</strong> Global state with IndexedDB persistence<br>
              <strong>useScope:</strong> Component composition<br>
              Nested stores, reactive updates, conflict resolution
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <div class="feature-title">Advanced Styling</div>
            <div class="feature-description">
              <strong>useStyle:</strong> Scoped CSS-in-JS<br>
              Dynamic theming, responsive design, animations<br>
              CSS custom properties, design tokens
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <div class="feature-title">Custom Hooks</div>
            <div class="feature-description">
              API integration, authentication, local storage<br>
              Debouncing, notifications, form validation<br>
              Reusable business logic patterns
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <div class="feature-title">Performance Patterns</div>
            <div class="feature-description">
              Virtual scrolling, lazy loading, code splitting<br>
              Memoization strategies, optimal re-rendering<br>
              Bundle optimization techniques
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🧪</div>
            <div class="feature-title">Testing Strategies</div>
            <div class="feature-description">
              Component testing, hook testing, integration tests<br>
              Mock implementations, test utilities<br>
              Accessibility testing
            </div>
          </div>
        </div>
      `
    },
    
    roadmap: {
      title: "🗺️ Development Roadmap",
      content: html`
        <div class="roadmap">
          <h3 style="margin-top: 0;">🚀 Our Journey to Building the Task Manager</h3>
          <p>Follow along as we build this app step by step, learning Dim's features through practical implementation:</p>
          
          <div class="roadmap-step">
            <span class="step-number">1</span>
            <strong>Foundation Setup</strong><br>
            Project structure, basic components, routing, and initial state management
          </div>
          
          <div class="roadmap-step">
            <span class="step-number">2</span>
            <strong>Core Task Management</strong><br>
            Task CRUD operations, categories, priorities, and basic filtering
          </div>
          
          <div class="roadmap-step">
            <span class="step-number">3</span>
            <strong>Advanced Features</strong><br>
            Due dates, attachments, subtasks, and advanced search
          </div>
          
          <div class="roadmap-step">
            <span class="step-number">4</span>
            <strong>Project Management</strong><br>
            Project boards, team collaboration, and assignment features
          </div>
          
          <div class="roadmap-step">
            <span class="step-number">5</span>
            <strong>Dashboard & Analytics</strong><br>
            Productivity insights, charts, reports, and goal tracking
          </div>
          
          <div class="roadmap-step">
            <span class="step-number">6</span>
            <strong>Theming & Customization</strong><br>
            Dark/light modes, custom themes, and user preferences
          </div>
          
          <div class="roadmap-step">
            <span class="step-number">7</span>
            <strong>Performance & Polish</strong><br>
            Optimization, animations, accessibility, and final touches
          </div>
        </div>
      `
    }
  };
  
  return html`
    <div class="planning-demo">
      <div class="hero-section">
        <h1 class="hero-title">Building a Task Management App</h1>
        <p class="hero-subtitle">
          A comprehensive tutorial series demonstrating all Dim framework features through a real-world application
        </p>
      </div>
      
      <div class="feature-nav">
        ${Object.keys(features).map(key => html`
          <button 
            class="nav-button ${selectedFeature === key ? 'active' : ''}"
            @click="${() => setSelectedFeature(key)}"
          >
            ${features[key].title.split(' ').slice(1).join(' ')}
          </button>
        `)}
      </div>
      
      <div class="content-section">
        <h2 class="section-title">${features[selectedFeature].title}</h2>
        ${features[selectedFeature].content}
      </div>
      
      <div class="tech-stack">
        <div class="tech-item">🎯 Dim Framework</div>
        <div class="tech-item">🔄 IndexedDB</div>
        <div class="tech-item">🎨 CSS-in-JS</div>
        <div class="tech-item">📊 Charts.js</div>
        <div class="tech-item">🧪 Web Components</div>
        <div class="tech-item">⚡ lit-html</div>
        <div class="tech-item">🎪 Storybook</div>
      </div>
    </div>
  `;
};

define({ tag: 'app-planning-demo', component: AppPlanningDemo });

export default {
  title: "Tutorial/03. Building an App",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Building a Complete Task Management App

Learn Dim by building a real-world application! This comprehensive tutorial series walks you through creating a full-featured task management app that demonstrates every aspect of the Dim framework.

## What You'll Learn

- **Component Architecture**: How to structure a complex application
- **State Management**: Advanced patterns with useStore and IndexedDB
- **Performance Optimization**: Memoization, lazy loading, and optimization techniques
- **Styling Systems**: Theming, responsive design, and CSS-in-JS patterns
- **Testing Strategies**: Component and integration testing approaches
- **Real-world Patterns**: Authentication, API integration, and data persistence

## Tutorial Structure

Each part of this tutorial builds upon the previous sections, gradually introducing more complex concepts and patterns. You'll see how all the hooks and features work together in a cohesive application.

## Reference Materials

Throughout the tutorial, we'll reference other Storybook sections for detailed information:
- **Core Hooks**: See "Tutorial/02. Core Hooks" for useState, useEffect, useMemo, useRef
- **Advanced Hooks**: Check "Advanced/Hooks" for useStore, useScope, useStyle
- **Component Patterns**: View "Advanced/Components" for composition patterns
- **Performance**: See "Advanced/Performance" for optimization techniques
        `
      }
    }
  }
};

export const PlanningPhase = {
  render: wrapLitHtmlStory(() => html`<app-planning-demo></app-planning-demo>`),
  name: "01. Planning & Architecture",
  parameters: {
    docs: {
      description: {
        story: `
### Planning Your Dim Application

Before diving into code, proper planning ensures a maintainable and scalable application. This section covers:

**📋 Feature Planning**
- Define core functionality and user workflows
- Identify component boundaries and responsibilities
- Plan state management strategy and data flow

**🏗️ Architecture Design**
- Component hierarchy and composition patterns
- State management with useStore and IndexedDB
- Custom hooks for business logic separation

**📁 Project Organization**
- File and folder structure for scalability
- Component categorization and naming conventions
- Separation of concerns between features

**🛣️ Development Roadmap**
- Incremental development approach
- Feature prioritization and milestones
- Testing and optimization phases

This planning phase sets the foundation for the entire tutorial series. Each subsequent part will implement the features and patterns outlined here.

**Next Steps:**
Continue to Part 2 where we'll start building the foundation components and basic state management.
        `
      }
    }
  }
};