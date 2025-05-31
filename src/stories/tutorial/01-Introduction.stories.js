import React from "react";
import { html, css, define, useState, useEffect, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// Simple counter for the introduction
const SimpleCounter = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  
  useStyle(css`
    .simple-counter {
      text-align: center;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      font-family: Arial, sans-serif;
    }
    
    .count-display {
      font-size: 3rem;
      font-weight: bold;
      color: #029cfd;
      margin: 1rem 0;
    }
    
    .counter-button {
      background-color: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      margin: 0 0.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .counter-button:hover {
      background-color: #0278c7;
    }
    
    .counter-button:active {
      transform: scale(0.98);
    }
  `);
  
  return html`
    <div class="simple-counter">
      <h3>Your First Dim Component</h3>
      <div class="count-display">${count}</div>
      <button class="counter-button" @click="${() => setCount(count - 1)}">
        Decrement
      </button>
      <button class="counter-button" @click="${() => setCount(0)}">
        Reset
      </button>
      <button class="counter-button" @click="${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  `;
};

define({ tag: 'simple-counter', component: SimpleCounter });

export default {
  title: "Tutorial/01. Introduction",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# Welcome to Dim Framework

Dim is a lightweight, reactive web component framework that brings the best of React's component model to native web components.

## Key Features

- 🚀 **Familiar API** - If you know React, you already know most of Dim
- ⚡ **Lightning Fast** - Built on lit-html for optimal performance
- 🎨 **Scoped Styling** - CSS-in-JS with automatic scoping
- 🧩 **True Components** - Based on Web Components standard
- 📦 **Zero Config** - No build step required
- 🔄 **Reactive** - Automatic UI updates with state changes

## Philosophy

Modern JavaScript frameworks have popularized the functional programming paradigm and declarative approaches to web app development. Dim explores what functional reactive programming could look like for web components.

## Quick Start

\`\`\`bash
npm install @dim/core
\`\`\`

\`\`\`javascript
import { html, define, useState } from '@dim/core';

const MyComponent = (_, { useState, html }) => {
  const [count, setCount] = useState(0);
  
  return html\`
    <div>
      <h1>Count: \${count}</h1>
      <button @click="\${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  \`;
};

define({ tag: 'my-component', component: MyComponent });
\`\`\`

Then use it in your HTML:
\`\`\`html
<my-component></my-component>
\`\`\`
        `
      }
    }
  }
};

export const WhatIsDim = {
  render: () => {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #029cfd 0%, #0278c7 100%)',
          color: 'white',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>Dim Framework</h1>
          <p style={{ fontSize: '1.25rem', margin: '0', opacity: 0.9 }}>
            A lightweight, reactive web component framework inspired by React and lit-html
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Built on lit-html for optimal performance' },
            { icon: '🧩', title: 'Component-Based', desc: 'Create reusable, encapsulated components' },
            { icon: '🎨', title: 'Scoped Styling', desc: 'CSS-in-JS with automatic scoping' },
            { icon: '🔄', title: 'Reactive State', desc: 'Automatic UI updates with state changes' }
          ].map(feature => (
            <div key={feature.title} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#029cfd' }}>{feature.title}</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
        
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <strong style={{ color: '#856404' }}>🚨 Important Note:</strong>
          <span style={{ color: '#856404' }}> Dim is an experimental framework designed for learning and exploration. While it demonstrates innovative approaches to functional web components, it's not recommended for production applications.</span>
        </div>
      </div>
    );
  },
  name: "What is Dim?",
  parameters: {
    docs: {
      description: {
        story: "An overview of the Dim framework, its philosophy, and key features."
      }
    }
  }
};

export const FirstComponent = {
  render: wrapLitHtmlStory(() => html`<simple-counter></simple-counter>`),
  name: "Your First Component",
  parameters: {
    docs: {
      description: {
        story: `
This is your first Dim component! It demonstrates:

- **useState** for reactive state management
- **useStyle** for scoped CSS styling  
- **html** template literals for rendering
- **Event handling** with @click syntax

\`\`\`javascript
const SimpleCounter = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  
  useStyle(css\`
    .simple-counter {
      text-align: center;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }
    
    .count-display {
      font-size: 3rem;
      font-weight: bold;
      color: #029cfd;
      margin: 1rem 0;
    }
    
    .counter-button {
      background-color: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      margin: 0 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
  \`);
  
  return html\`
    <div class="simple-counter">
      <h3>Your First Dim Component</h3>
      <div class="count-display">\${count}</div>
      <button class="counter-button" @click="\${() => setCount(count - 1)}">
        Decrement
      </button>
      <button class="counter-button" @click="\${() => setCount(0)}">
        Reset
      </button>
      <button class="counter-button" @click="\${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  \`;
};

define({ tag: 'simple-counter', component: SimpleCounter });
\`\`\`

Try clicking the buttons to see reactive state updates in action!
        `
      }
    }
  }
};

export const ReactComparison = {
  render: () => {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h2>React vs Dim: Side by Side</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h3 style={{ color: '#61dafb' }}>React Component</h3>
            <pre style={{ 
              backgroundColor: '#1e1e1e', 
              color: '#d4d4d4', 
              padding: '1rem', 
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
{`const ReactCounter = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};`}
            </pre>
          </div>
          
          <div>
            <h3 style={{ color: '#029cfd' }}>Dim Component</h3>
            <pre style={{ 
              backgroundColor: '#1e1e1e', 
              color: '#d4d4d4', 
              padding: '1rem', 
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
{`const DimCounter = (_, { useState, useEffect, html }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return html\`
    <div class="counter">
      <h2>Count: \${count}</h2>
      <button @click="\${() => setCount(count + 1)}">
        Increment
      </button>
    </div>
  \`;
};`}
            </pre>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Key Differences</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Props & Hooks', desc: 'Passed as separate parameters in Dim' },
              { title: 'Templates', desc: 'html`` template literals instead of JSX' },
              { title: 'Events', desc: '@click instead of onClick' },
              { title: 'Styling', desc: 'useStyle for component-scoped CSS' },
              { title: 'Web Components', desc: 'Native web components under the hood' }
            ].map(diff => (
              <div key={diff.title} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#029cfd' }}>{diff.title}</h4>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
  name: "React vs Dim",
  parameters: {
    docs: {
      description: {
        story: "A side-by-side comparison of React and Dim component syntax, highlighting the similarities and key differences."
      }
    }
  }
};