import { define, html, css, useState, useEffect, useStyle, useScope, useMemo, useRef, useStore } from "../core/dim.ts";

// Test component to check loading state and infinite loop
const TestLoadingState = (props, { useState, useEffect, useStyle, useScope, useMemo, useRef, useStore, html, css }) => {
  // Global store with loading state
  const store = useStore({
    testData: useState({ count: 0, message: 'Hello' })
  });

  // Destructure with loading state
  const [testData, setTestData, isLoading, setIsLoading] = store.testData;

  // Log render to check for infinite loop
  console.log('TestLoadingState render:', { isLoading, testData });

  // Button to update data
  const updateData = () => {
    setTestData({ 
      count: testData.count + 1, 
      message: `Updated ${testData.count + 1} times` 
    });
  };

  useStyle(css`
    .container {
      padding: 2rem;
      font-family: Arial, sans-serif;
    }
    .loading {
      color: blue;
      font-weight: bold;
    }
    .data {
      margin: 1rem 0;
      padding: 1rem;
      background: #f0f0f0;
      border-radius: 8px;
    }
    button {
      padding: 0.5rem 1rem;
      background: #029cfd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #0278c7;
    }
  `);

  return html`
    <div class="container">
      <h2>Loading State Test</h2>
      ${isLoading 
        ? html`<div class="loading">Loading data from IndexedDB...</div>`
        : html`
          <div class="data">
            <p>Count: ${testData.count}</p>
            <p>Message: ${testData.message}</p>
          </div>
          <button @click=${updateData}>Update Data</button>
        `
      }
    </div>
  `;
};

// Define the custom element
define({ tag: 'test-loading-state', component: TestLoadingState });

export default {
  title: 'Core/Loading State Test',
  parameters: {
    docs: {
      description: {
        component: 'Test component to verify loading state and infinite loop fix'
      }
    }
  }
};

export const Default = {
  render: () => '<test-loading-state></test-loading-state>',
  name: 'Loading State Test'
};