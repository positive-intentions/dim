import React from "react";
import { html, css, define, useState, useScope, useStyle } from "../../core/dim.ts";

// Card component to be used as a child
const Card = ({ title, content }, { html, css, useStyle }) => {
  useStyle(css`
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      margin: 0.5rem 0;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: box-shadow 0.2s;
    }

    .card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .card-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .card-content {
      color: #666;
    }
  `);

  return html`
    <div class="card">
      <div class="card-title">${title}</div>
      <div class="card-content">${content}</div>
    </div>
  `;
};

// Button component to be used as a child
const IconButton = ({ icon, onClick, variant = 'primary' }, { html, css, useStyle }) => {
  useStyle(css`
    .icon-button {
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      font-size: 24px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .icon-button.primary {
      background-color: #029cfd;
      color: white;
    }

    .icon-button.primary:hover {
      background-color: #0278c7;
      transform: scale(1.1);
    }

    .icon-button.danger {
      background-color: #dc3545;
      color: white;
    }

    .icon-button.danger:hover {
      background-color: #c82333;
      transform: scale(1.1);
    }

    .icon-button.success {
      background-color: #28a745;
      color: white;
    }

    .icon-button.success:hover {
      background-color: #218838;
      transform: scale(1.1);
    }
  `);

  return html`
    <button 
      class="icon-button ${variant}" 
      @click="${onClick}"
      title="${icon}"
    >
      ${icon}
    </button>
  `;
};

// Badge component
const Badge = ({ text, color = 'blue' }, { html, css, useStyle }) => {
  useStyle(css`
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .badge.blue {
      background-color: #e7f3ff;
      color: #0066cc;
    }

    .badge.green {
      background-color: #d4edda;
      color: #155724;
    }

    .badge.red {
      background-color: #f8d7da;
      color: #721c24;
    }

    .badge.yellow {
      background-color: #fff3cd;
      color: #856404;
    }
  `);

  return html`
    <span class="badge ${color}">${text}</span>
  `;
};

// Parent component demonstrating useScope
const ScopeDemo = (props, { useState, useScope, html, css, useStyle }) => {
  const [cards, setCards] = useState([
    { id: 1, title: 'First Card', content: 'This is the first card content' },
    { id: 2, title: 'Second Card', content: 'This is the second card content' },
    { id: 3, title: 'Third Card', content: 'This is the third card content' }
  ]);

  // Register child components with useScope
  useScope({
    'custom-card': Card,
    'icon-button': IconButton,
    'status-badge': Badge
  });

  useStyle(css`
    .scope-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 600px;
    }

    .description {
      background-color: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .cards-section {
      margin-top: 1.5rem;
    }

    .add-form {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .add-form input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .badges-demo {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `);

  const addCard = () => {
    const newCard = {
      id: Date.now(),
      title: `Card ${cards.length + 1}`,
      content: `This is card number ${cards.length + 1}`
    };
    setCards([...cards, newCard]);
  };

  const removeLastCard = () => {
    setCards(cards.slice(0, -1));
  };

  const clearAll = () => {
    setCards([]);
  };

  return html`
    <div class="scope-container">
      <h3>useScope Component Registration</h3>
      
      <div class="description">
        <p>
          This demo shows how <strong>useScope</strong> registers child components 
          within a parent component's scope. The components defined here are only 
          available within this component tree.
        </p>
      </div>

      <div class="toolbar">
        <icon-button 
          .props="${{ icon: '➕', onClick: addCard, variant: 'success' }}"
        ></icon-button>
        
        <icon-button 
          .props="${{ icon: '➖', onClick: removeLastCard, variant: 'danger' }}"
        ></icon-button>
        
        <icon-button 
          .props="${{ icon: '🗑️', onClick: clearAll, variant: 'danger' }}"
        ></icon-button>

        <status-badge .props="${{ text: `${cards.length} cards`, color: 'blue' }}"></status-badge>
      </div>

      <div class="cards-section">
        ${cards.map(card => html`
          <custom-card .props="${card}"></custom-card>
        `)}
        
        ${cards.length === 0 ? html`
          <p style="text-align: center; color: #666;">
            No cards to display. Click the ➕ button to add some!
          </p>
        ` : ''}
      </div>

      <div class="badges-demo">
        <h4>Status Badges:</h4>
        <status-badge .props="${{ text: 'new', color: 'green' }}"></status-badge>
        <status-badge .props="${{ text: 'pending', color: 'yellow' }}"></status-badge>
        <status-badge .props="${{ text: 'active', color: 'blue' }}"></status-badge>
        <status-badge .props="${{ text: 'error', color: 'red' }}"></status-badge>
      </div>
    </div>
  `;
};

// Dynamic component loading example
const DynamicLoading = (props, { useState, useScope, html, css, useStyle }) => {
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useStyle(css`
    .dynamic-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }

    .load-button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    .load-button:hover {
      background-color: #0278c7;
    }

    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .demo-box {
      border: 2px dashed #ddd;
      padding: 1rem;
      text-align: center;
      border-radius: 4px;
    }
  `);

  const loadComponents = () => {
    // Dynamically define components
    const ColorBox = ({ color }, { html, css, useStyle }) => {
      useStyle(css`
        .color-box {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border-radius: 4px;
        }
      `);
      
      return html`
        <div class="color-box" style="background-color: ${color}">
          ${color}
        </div>
      `;
    };

    const InfoPanel = ({ title, info }, { html, css, useStyle }) => {
      useStyle(css`
        .info-panel {
          background-color: #f0f0f0;
          padding: 1rem;
          border-radius: 4px;
          text-align: left;
        }

        .info-title {
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
      `);

      return html`
        <div class="info-panel">
          <div class="info-title">${title}</div>
          <div>${info}</div>
        </div>
      `;
    };

    // Register the components
    useScope({
      'color-box': ColorBox,
      'info-panel': InfoPanel
    });

    setComponentsLoaded(true);
  };

  return html`
    <div class="dynamic-container">
      <h3>Dynamic Component Loading</h3>
      
      ${!componentsLoaded ? html`
        <button class="load-button" @click="${loadComponents}">
          Load Components
        </button>
        <p>Click the button to dynamically load and register components using useScope.</p>
      ` : html`
        <p>Components loaded! They are now available in this scope:</p>
        
        <div class="component-grid">
          <color-box .props="${{ color: '#029cfd' }}"></color-box>
          <color-box .props="${{ color: '#28a745' }}"></color-box>
          <color-box .props="${{ color: '#dc3545' }}"></color-box>
          <color-box .props="${{ color: '#ffc107' }}"></color-box>
        </div>

        <info-panel .props="${{
          title: 'Dynamic Registration',
          info: 'These components were registered after the parent component rendered!'
        }}"></info-panel>
      `}
    </div>
  `;
};

// Define components
define({ tag: 'use-scope-demo', component: ScopeDemo });
define({ tag: 'use-scope-dynamic', component: DynamicLoading });

export default {
  title: "Hooks/useScope",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useScope\` hook registers child components within a parent component's scope.

## Features
- Local component registration
- Prevents global namespace pollution
- Enables component composition
- Supports dynamic component loading

## Usage
\`\`\`javascript
// Register child components
useScope({
  'my-button': ButtonComponent,
  'my-card': CardComponent,
  'my-modal': ModalComponent
});

// Use in template
return html\`
  <my-button></my-button>
  <my-card .props="\${cardProps}"></my-card>
\`;
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const ComponentRegistration = {
  render: () => <use-scope-demo />,
  name: "Component Registration",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates registering multiple child components using useScope and composing them together."
      }
    }
  }
};

export const DynamicComponentLoading = {
  render: () => <use-scope-dynamic />,
  name: "Dynamic Loading",
  parameters: {
    docs: {
      description: {
        story: "Shows how components can be dynamically loaded and registered at runtime using useScope."
      }
    }
  }
};