import React from "react";
import { html, css, define, useState, useStyle, unsafeCSS } from "../../core/dim.ts";

// Theme switcher component
const ThemeSwitcher = (props, { useState, html, css, useStyle }) => {
  const [theme, setTheme] = useState('light');

  // Dynamic styles based on theme
  useStyle(css`
    .theme-container {
      padding: 2rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .theme-container.light {
      background-color: #ffffff;
      color: #333333;
      border: 2px solid #029cfd;
    }

    .theme-container.dark {
      background-color: #1a1a1a;
      color: #ffffff;
      border: 2px solid #4db8ff;
    }

    .theme-container.colorful {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border: 2px solid #764ba2;
    }

    .theme-selector {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .theme-button {
      padding: 8px 16px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }

    .theme-button:hover {
      transform: scale(1.05);
    }

    .theme-button.active {
      box-shadow: 0 0 0 3px rgba(2, 156, 253, 0.3);
    }

    .theme-button.light-btn {
      background-color: #f0f0f0;
      color: #333;
    }

    .theme-button.dark-btn {
      background-color: #333;
      color: #fff;
    }

    .theme-button.colorful-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .content-section {
      margin-top: 1rem;
    }

    .content-section h4 {
      margin-bottom: 0.5rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }

    .demo-card {
      padding: 1rem;
      border-radius: 4px;
      text-align: center;
    }

    .theme-container.light .demo-card {
      background-color: #f5f5f5;
    }

    .theme-container.dark .demo-card {
      background-color: #2a2a2a;
    }

    .theme-container.colorful .demo-card {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `);

  return html`
    <div class="theme-container ${theme}">
      <h3>useStyle Dynamic Theming</h3>
      
      <div class="theme-selector">
        <button 
          class="theme-button light-btn ${theme === 'light' ? 'active' : ''}"
          @click="${() => setTheme('light')}"
        >
          Light Theme
        </button>
        <button 
          class="theme-button dark-btn ${theme === 'dark' ? 'active' : ''}"
          @click="${() => setTheme('dark')}"
        >
          Dark Theme
        </button>
        <button 
          class="theme-button colorful-btn ${theme === 'colorful' ? 'active' : ''}"
          @click="${() => setTheme('colorful')}"
        >
          Colorful Theme
        </button>
      </div>

      <div class="content-section">
        <h4>Theme: ${theme}</h4>
        <p>The useStyle hook injects CSS into the component's shadow DOM, providing perfect style encapsulation.</p>
        
        <div class="demo-grid">
          <div class="demo-card">Card 1</div>
          <div class="demo-card">Card 2</div>
          <div class="demo-card">Card 3</div>
        </div>
      </div>
    </div>
  `;
};

// CSS Animation component
const AnimatedElements = (props, { useState, html, css, useStyle }) => {
  const [animationSpeed, setAnimationSpeed] = useState('normal');

  useStyle(css`
    .animation-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }

    .controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 2rem;
    }

    .speed-selector {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .animation-stage {
      height: 200px;
      position: relative;
      background: linear-gradient(to bottom, #e7f3ff 0%, #ffffff 100%);
      border-radius: 8px;
      overflow: hidden;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .animated-element {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .element-1 {
      background-color: #029cfd;
      left: 20%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: float var(--animation-duration) ease-in-out infinite;
    }

    .element-2 {
      background-color: #28a745;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: rotate var(--animation-duration) linear infinite;
    }

    .element-3 {
      background-color: #dc3545;
      left: 80%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: pulse var(--animation-duration) ease-in-out infinite;
    }

    .animation-container[data-speed="slow"] {
      --animation-duration: 3s;
    }

    .animation-container[data-speed="normal"] {
      --animation-duration: 1.5s;
    }

    .animation-container[data-speed="fast"] {
      --animation-duration: 0.5s;
    }
  `);

  return html`
    <div class="animation-container" data-speed="${animationSpeed}">
      <h3>useStyle CSS Animations</h3>
      
      <div class="controls">
        <label>Animation Speed:</label>
        <select 
          class="speed-selector"
          .value="${animationSpeed}"
          @change="${(e) => setAnimationSpeed(e.target.value)}"
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      <div class="animation-stage">
        <div class="animated-element element-1">🎈</div>
        <div class="animated-element element-2">⚙️</div>
        <div class="animated-element element-3">❤️</div>
      </div>
    </div>
  `;
};

// Responsive layout component
const ResponsiveLayout = (props, { html, css, useStyle }) => {
  useStyle(css`
    .responsive-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }

    .responsive-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    /* Mobile first approach */
    .responsive-grid {
      grid-template-columns: 1fr;
    }

    /* Tablet */
    @media (min-width: 768px) {
      .responsive-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Desktop */
    @media (min-width: 1024px) {
      .responsive-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Large Desktop */
    @media (min-width: 1440px) {
      .responsive-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .responsive-card {
      background-color: #f0f0f0;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      transition: transform 0.2s;
    }

    .responsive-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .card-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .card-description {
      font-size: 0.875rem;
      color: #666;
    }

    .viewport-info {
      background-color: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    /* Utility classes with media queries */
    .mobile-only { display: block; }
    .tablet-up { display: none; }
    .desktop-up { display: none; }

    @media (min-width: 768px) {
      .mobile-only { display: none; }
      .tablet-up { display: block; }
    }

    @media (min-width: 1024px) {
      .desktop-up { display: block; }
    }
  `);

  const cards = [
    { icon: '🎨', title: 'Design', description: 'Beautiful and responsive' },
    { icon: '🚀', title: 'Performance', description: 'Lightning fast rendering' },
    { icon: '🔧', title: 'Flexible', description: 'Highly customizable' },
    { icon: '📱', title: 'Mobile First', description: 'Works on all devices' },
    { icon: '🎯', title: 'Focused', description: 'Simple and effective' },
    { icon: '🌟', title: 'Modern', description: 'Latest web standards' }
  ];

  return html`
    <div class="responsive-container">
      <h3>useStyle Responsive Design</h3>
      
      <div class="viewport-info">
        <span class="mobile-only">📱 Mobile View (< 768px)</span>
        <span class="tablet-up desktop-up">📱 Tablet View (768px - 1023px)</span>
        <span class="desktop-up">💻 Desktop View (≥ 1024px)</span>
      </div>

      <p>Resize your window to see the responsive grid in action!</p>

      <div class="responsive-grid">
        ${cards.map(card => html`
          <div class="responsive-card">
            <div class="card-icon">${card.icon}</div>
            <div class="card-title">${card.title}</div>
            <div class="card-description">${card.description}</div>
          </div>
        `)}
      </div>
    </div>
  `;
};

// Multiple style injections
const StyleLayering = (props, { useState, html, css, useStyle, unsafeCSS }) => {
  const [baseColor, setBaseColor] = useState('#029cfd');
  
  // Base styles
  useStyle(css`
    .layered-container {
      padding: 2rem;
      border: 2px solid ${unsafeCSS(baseColor)};
      border-radius: 8px;
    }

    .color-picker {
      margin-bottom: 1rem;
    }

    .style-demo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
  `);

  // Additional component styles
  useStyle(css`
    .style-box {
      padding: 1rem;
      text-align: center;
      border-radius: 4px;
      color: white;
      font-weight: bold;
    }

    .box-primary {
      background-color: ${unsafeCSS(baseColor)};
    }

    .box-secondary {
      background-color: color-mix(in srgb, ${unsafeCSS(baseColor)} 80%, white);
    }

    .box-tertiary {
      background-color: color-mix(in srgb, ${unsafeCSS(baseColor)} 60%, white);
    }

    .box-quaternary {
      background-color: color-mix(in srgb, ${unsafeCSS(baseColor)} 40%, white);
    }
  `);

  return html`
    <div class="layered-container">
      <h3>useStyle Multiple Injections</h3>
      
      <div class="color-picker">
        <label>Base Color: </label>
        <input 
          type="color" 
          .value="${baseColor}"
          @input="${(e) => setBaseColor(e.target.value)}"
        />
        <span style="margin-left: 1rem;">${baseColor}</span>
      </div>

      <p>Multiple useStyle calls can be used to organize and layer styles:</p>

      <div class="style-demo">
        <div class="style-box box-primary">100%</div>
        <div class="style-box box-secondary">80%</div>
        <div class="style-box box-tertiary">60%</div>
        <div class="style-box box-quaternary">40%</div>
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'use-style-theme', component: ThemeSwitcher });
define({ tag: 'use-style-animations', component: AnimatedElements });
define({ tag: 'use-style-responsive', component: ResponsiveLayout });
define({ tag: 'use-style-layering', component: StyleLayering });

export default {
  title: "Hooks/useStyle",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useStyle\` hook injects CSS into the component's shadow DOM.

## Features
- Shadow DOM style encapsulation
- Dynamic CSS with template literals
- CSS-in-JS with full CSS support
- Multiple style injections per component
- Media queries and animations

## Usage
\`\`\`javascript
// Static styles
useStyle(css\`
  .my-class {
    color: red;
    padding: 1rem;
  }
\`);

// Dynamic styles
const color = 'blue';
useStyle(css\`
  .dynamic {
    background-color: \${color};
  }
\`);
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const DynamicTheming = {
  render: () => <use-style-theme />,
  name: "Dynamic Theming",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates dynamic theme switching using useStyle with CSS classes."
      }
    }
  }
};

export const CSSAnimations = {
  render: () => <use-style-animations />,
  name: "CSS Animations",
  parameters: {
    docs: {
      description: {
        story: "Shows CSS animations and custom properties with useStyle."
      }
    }
  }
};

export const ResponsiveDesign = {
  render: () => <use-style-responsive />,
  name: "Responsive Layout",
  parameters: {
    docs: {
      description: {
        story: "Responsive grid layout using media queries in useStyle."
      }
    }
  }
};

export const MultipleStyles = {
  render: () => <use-style-layering />,
  name: "Style Layering",
  parameters: {
    docs: {
      description: {
        story: "Multiple useStyle calls with dynamic color generation."
      }
    }
  }
};