import { define, html, css, useState, useEffect, useStyle } from "../../core/dim.ts";

const NavigationExample = (props, { useState, useEffect, useStyle, html, css }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  // Define all pages with their content and metadata
  const pages = {
    home: {
      id: 'home',
      title: 'Home',
      icon: '🏠',
      color: '#e3f2fd',
      content: {
        heading: 'Welcome Home',
        description: 'This is the main landing page of our application.',
        features: [
          'Beautiful design',
          'Smooth animations', 
          'Responsive layout',
          'Modern framework'
        ]
      }
    },
    about: {
      id: 'about',
      title: 'About',
      icon: '👋',
      color: '#f3e5f5',
      content: {
        heading: 'About Us',
        description: 'Learn more about our company and mission.',
        features: [
          'Founded in 2024',
          'Innovative solutions',
          'Customer focused',
          'Global reach'
        ]
      }
    },
    services: {
      id: 'services',
      title: 'Services',
      icon: '⚙️',
      color: '#e8f5e8',
      content: {
        heading: 'Our Services',
        description: 'Discover what we can do for you.',
        features: [
          'Web Development',
          'Mobile Apps',
          'UI/UX Design',
          'Consulting'
        ]
      }
    },
    portfolio: {
      id: 'portfolio',
      title: 'Portfolio',
      icon: '💼',
      color: '#fff3e0',
      content: {
        heading: 'Our Work',
        description: 'Check out our latest projects and achievements.',
        features: [
          'E-commerce sites',
          'SaaS platforms',
          'Mobile applications',
          'Design systems'
        ]
      }
    },
    contact: {
      id: 'contact',
      title: 'Contact',
      icon: '📧',
      color: '#ffebee',
      content: {
        heading: 'Get in Touch',
        description: 'Ready to start your project? Contact us today.',
        features: [
          'Free consultation',
          '24/7 support',
          'Quick response',
          'Flexible pricing'
        ]
      }
    }
  };

  const pageOrder = ['home', 'about', 'services', 'portfolio', 'contact'];

  useStyle(css`
    .navigation-app {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      overflow: hidden;
      min-height: 600px;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .navigation {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      padding: 0;
      display: flex;
      overflow-x: auto;
    }

    .nav-item {
      flex: 1;
      min-width: 120px;
      background: none;
      border: none;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6c757d;
    }

    .nav-item:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #495057;
    }

    .nav-item.active {
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
    }

    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #667eea;
    }

    .nav-icon {
      font-size: 1.5rem;
    }

    .page-container {
      position: relative;
      min-height: 500px;
      overflow: hidden;
    }

    .page-content {
      padding: 3rem 2rem;
      text-align: center;
    }

    .page-heading {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
    }

    .page-description {
      font-size: 1.125rem;
      color: #6c757d;
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .feature-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
      transition: transform 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-2px);
    }

    .feature-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .controls {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1rem;
    }

    .control-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-button:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .control-button:disabled {
      background: #adb5bd;
      cursor: not-allowed;
      transform: none;
    }

    .page-info {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #6c757d;
      backdrop-filter: blur(10px);
    }

    .transition-debug {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-family: 'Courier New', monospace;
      max-width: 300px;
    }

    .syntax-showcase {
      margin-top: 2rem;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #dee2e6;
    }

    .syntax-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
    }

    .code-block {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
      margin: 1rem 0;
    }

    @media (max-width: 768px) {
      .navigation {
        overflow-x: auto;
      }
      
      .nav-item {
        min-width: 100px;
        padding: 0.75rem 1rem;
        font-size: 0.75rem;
      }
      
      .nav-icon {
        font-size: 1.25rem;
      }
      
      .page-content {
        padding: 2rem 1rem;
      }
      
      .page-heading {
        font-size: 2rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .controls {
        flex-direction: column;
        width: 90%;
        max-width: 300px;
      }
    }
  `);

  const navigateToPage = (pageId) => {
    if (pageId === currentPage) return;
    
    // Add to navigation history
    setNavigationHistory(prev => [...prev, pageId]);
    setCurrentPage(pageId);
  };

  const goToPreviousPage = () => {
    const currentIndex = pageOrder.indexOf(currentPage);
    if (currentIndex > 0) {
      navigateToPage(pageOrder[currentIndex - 1]);
    }
  };

  const goToNextPage = () => {
    const currentIndex = pageOrder.indexOf(currentPage);
    if (currentIndex < pageOrder.length - 1) {
      navigateToPage(pageOrder[currentIndex + 1]);
    }
  };

  const getCurrentPageIndex = () => pageOrder.indexOf(currentPage);
  const isFirstPage = getCurrentPageIndex() === 0;
  const isLastPage = getCurrentPageIndex() === pageOrder.length - 1;

  // Auto-advance demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLastPage) {
        goToNextPage();
      } else {
        navigateToPage('home'); // Loop back to start
      }
    }, 6000); // Change page every 6 seconds

    return () => clearInterval(interval);
  }, [currentPage, isLastPage]);

  return html`
    <div class="navigation-app">
      <div class="app-header">
        <h1 class="app-title">🚀 Navigation Transitions Demo</h1>
        <div class="breadcrumb">
          ${navigationHistory.slice(-3).map((pageId, index, arr) => html`
            ${index > 0 ? html`<span>→</span>` : ''}
            <span>${pages[pageId].icon} ${pages[pageId].title}</span>
          `)}
        </div>
      </div>

      <nav class="navigation">
        ${pageOrder.map(pageId => html`
          <button 
            class="nav-item ${pageId === currentPage ? 'active' : ''}"
            @click="${() => navigateToPage(pageId)}"
          >
            <span class="nav-icon">${pages[pageId].icon}</span>
            <span>${pages[pageId].title}</span>
          </button>
        `)}
      </nav>

      <div class="page-container">
        <!-- This is where the magic happens - automatic view transitions! -->
        <page-content 
          transitionId="${currentPage}"
          transitionDuration="600"
          pageData="${JSON.stringify(pages[currentPage])}"
        ></page-content>

        <div class="controls">
          <button 
            class="control-button" 
            @click="${goToPreviousPage}"
            ?disabled="${isFirstPage}"
          >
            ⏮️ Previous
          </button>
          <button 
            class="control-button" 
            @click="${goToNextPage}"
            ?disabled="${isLastPage}"
          >
            Next ⏭️
          </button>
        </div>

        <div class="page-info">
          Page ${getCurrentPageIndex() + 1} of ${pageOrder.length}
        </div>
      </div>

      <div class="syntax-showcase">
        <div class="syntax-title">✨ Framework Magic - Page Navigation Transitions</div>
        
        <div class="code-block">
&lt;page-content 
  transitionId="\${currentPage}"
  transitionDuration="600"
  pageData="\${JSON.stringify(pages[currentPage])}"
&gt;&lt;/page-content&gt;
        </div>

        <p><strong>Automatic Features:</strong></p>
        <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
          <li>🎯 <strong>Smart Direction Detection:</strong> Left/right based on page order</li>
          <li>⚡ <strong>Smooth Transitions:</strong> 600ms sliding animations</li>
          <li>🔄 <strong>Navigation History:</strong> Breadcrumb tracking</li>
          <li>📱 <strong>Responsive Design:</strong> Mobile-friendly navigation</li>
          <li>🎨 <strong>Auto-styling:</strong> Framework handles all CSS classes</li>
        </ul>
      </div>
    </div>
  `;
};

// Page content component that will get automatic view transitions
const PageContent = (props, { html }) => {
  const pageData = JSON.parse(props.pageData || '{}');
  const { content, color } = pageData;
  
  return html`
    <div class="page-content" style="background: ${color};">
      <h2 class="page-heading">${content.heading}</h2>
      <p class="page-description">${content.description}</p>
      
      <div class="features-grid">
        ${content.features.map(feature => html`
          <div class="feature-card">
            <div class="feature-title">${feature}</div>
          </div>
        `)}
      </div>
    </div>
  `;
};

// Advanced navigation component with nested routes
const AdvancedNavigation = (props, { useState, useStyle, html, css }) => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [currentSubPage, setCurrentSubPage] = useState('overview');

  const sections = {
    dashboard: {
      title: 'Dashboard',
      icon: '📊',
      subPages: ['overview', 'analytics', 'reports']
    },
    users: {
      title: 'Users',
      icon: '👥',
      subPages: ['list', 'permissions', 'activity']
    },
    settings: {
      title: 'Settings',
      icon: '⚙️',
      subPages: ['general', 'security', 'billing']
    }
  };

  useStyle(css`
    .advanced-nav {
      display: flex;
      height: 400px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .sidebar {
      width: 200px;
      background: #2d3748;
      color: white;
      padding: 1rem 0;
    }

    .section-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
      border: none;
      background: none;
      color: inherit;
      width: 100%;
      text-align: left;
    }

    .section-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .section-item.active {
      background: rgba(102, 126, 234, 0.3);
    }

    .sub-nav {
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 1rem 0;
      min-width: 150px;
    }

    .sub-item {
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      color: #6c757d;
    }

    .sub-item:hover {
      background: #e9ecef;
    }

    .sub-item.active {
      background: #667eea;
      color: white;
    }

    .content-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
  `);

  return html`
    <div class="advanced-nav">
      <div class="sidebar">
        ${Object.entries(sections).map(([sectionId, section]) => html`
          <button 
            class="section-item ${sectionId === currentSection ? 'active' : ''}"
            @click="${() => {
              setCurrentSection(sectionId);
              setCurrentSubPage(section.subPages[0]);
            }}"
          >
            <span>${section.icon}</span>
            <span>${section.title}</span>
          </button>
        `)}
      </div>

      <div class="sub-nav">
        ${sections[currentSection].subPages.map(subPage => html`
          <button 
            class="sub-item ${subPage === currentSubPage ? 'active' : ''}"
            @click="${() => setCurrentSubPage(subPage)}"
          >
            ${subPage.charAt(0).toUpperCase() + subPage.slice(1)}
          </button>
        `)}
      </div>

      <div class="content-area">
        <!-- Nested view transitions with section-subpage ID -->
        <nested-content 
          transitionId="${currentSection}-${currentSubPage}"
          transitionDuration="400"
          section="${currentSection}"
          subPage="${currentSubPage}"
        ></nested-content>
      </div>
    </div>
  `;
};

const NestedContent = (props, { html }) => {
  const { section, subPage } = props;
  
  return html`
    <div style="padding: 2rem; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; height: 100%; display: flex; flex-direction: column; justify-content: center;">
      <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">${section.charAt(0).toUpperCase() + section.slice(1)}</h3>
      <p style="margin: 0; font-size: 1.125rem; opacity: 0.9;">${subPage.charAt(0).toUpperCase() + subPage.slice(1)} Content</p>
      <div style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.7;">
        Transition ID: ${section}-${subPage}
      </div>
    </div>
  `;
};

define({ tag: 'navigation-example', component: NavigationExample });
define({ tag: 'page-content', component: PageContent });
define({ tag: 'advanced-navigation', component: AdvancedNavigation });
define({ tag: 'nested-content', component: NestedContent });

export default NavigationExample;