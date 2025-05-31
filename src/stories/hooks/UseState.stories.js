import React from "react";
import { html, css, define, useState, useStyle } from "../../core/dim.ts";

// Simple counter component demonstrating useState
const Counter = (props, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(props.initialCount || 0);

  useStyle(css`
    .counter-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .count-display {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 8px 16px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0278c7;
    }

    button:active {
      transform: scale(0.95);
    }

    .reset-button {
      background-color: #dc3545;
    }

    .reset-button:hover {
      background-color: #c82333;
    }
  `);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  const double = () => setCount(prev => prev * 2);

  return html`
    <div class="counter-container">
      <h3>useState Hook Demo</h3>
      <div class="count-display">Count: ${count}</div>
      <div class="button-group">
        <button @click="${decrement}">-1</button>
        <button @click="${increment}">+1</button>
        <button @click="${double}">×2</button>
        <button class="reset-button" @click="${reset}">Reset</button>
      </div>
    </div>
  `;
};

// Multiple states example
const MultipleStates = (props, { useState, html, css, useStyle }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');

  useStyle(css`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 400px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label {
      font-weight: bold;
      color: #333;
    }

    input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .info-display {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f0f0f0;
      border-radius: 4px;
    }

    .info-display h4 {
      margin-top: 0;
    }
  `);

  return html`
    <div class="form-container">
      <h3>Multiple useState Example</h3>
      
      <div class="form-group">
        <label>Name:</label>
        <input 
          type="text" 
          .value="${name}" 
          @input="${(e) => setName(e.target.value)}"
          placeholder="Enter your name"
        />
      </div>

      <div class="form-group">
        <label>Age:</label>
        <input 
          type="number" 
          .value="${age}" 
          @input="${(e) => setAge(parseInt(e.target.value) || 0)}"
          placeholder="Enter your age"
        />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input 
          type="email" 
          .value="${email}" 
          @input="${(e) => setEmail(e.target.value)}"
          placeholder="Enter your email"
        />
      </div>

      ${(name || age || email) ? html`
        <div class="info-display">
          <h4>Current State:</h4>
          <p>Name: ${name || 'Not provided'}</p>
          <p>Age: ${age || 'Not provided'}</p>
          <p>Email: ${email || 'Not provided'}</p>
        </div>
      ` : ''}
    </div>
  `;
};

// Complex state example
const ComplexState = (props, { useState, html, css, useStyle }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    preferences: {
      theme: 'light',
      notifications: true
    }
  });

  useStyle(css`
    .complex-state-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }

    .preference-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1rem 0;
    }

    .theme-selector {
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .state-display {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
    }
  `);

  const updateTheme = (theme) => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        theme
      }
    }));
  };

  const toggleNotifications = () => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        notifications: !prevUser.preferences.notifications
      }
    }));
  };

  return html`
    <div class="complex-state-container">
      <h3>Complex State Management</h3>
      
      <div class="preference-item">
        <label>Theme:</label>
        <select 
          class="theme-selector"
          .value="${user.preferences.theme}"
          @change="${(e) => updateTheme(e.target.value)}"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div class="preference-item">
        <label>
          <input 
            type="checkbox" 
            .checked="${user.preferences.notifications}"
            @change="${toggleNotifications}"
          />
          Enable Notifications
        </label>
      </div>

      <div class="state-display">
        <strong>Current State:</strong>
        ${JSON.stringify(user, null, 2)}
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'use-state-counter', component: Counter });
define({ tag: 'use-state-multiple', component: MultipleStates });
define({ tag: 'use-state-complex', component: ComplexState });

export default {
  title: "Hooks/useState",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useState\` hook provides reactive state management for Dim components.

## Features
- Simple API similar to React's useState
- Supports functional updates
- Automatically triggers re-renders on state changes
- Works with primitive and complex data types

## Usage
\`\`\`javascript
const [state, setState] = useState(initialValue);

// Direct update
setState(newValue);

// Functional update
setState(prevState => prevState + 1);
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const SimpleCounter = {
  render: () => <use-state-counter initialCount={0} />,
  name: "Simple Counter",
  parameters: {
    docs: {
      description: {
        story: "Basic counter demonstrating useState with increment, decrement, double, and reset functionality."
      }
    }
  }
};

export const MultipleStatesForm = {
  render: () => <use-state-multiple />,
  name: "Multiple States",
  parameters: {
    docs: {
      description: {
        story: "Form demonstrating multiple independent useState hooks in a single component."
      }
    }
  }
};

export const ComplexStateManagement = {
  render: () => <use-state-complex />,
  name: "Complex State",
  parameters: {
    docs: {
      description: {
        story: "Example showing useState with complex objects and nested state updates."
      }
    }
  }
};