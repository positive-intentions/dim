import { define, css, useStore, useState } from "../core/dim.ts";

const CryptoTest = ({ }, { useStore, useState, css }) => {
  const styles = css`
    .crypto-test {
      padding: 20px;
      border: 1px solid #ccc;
      margin: 20px;
    }
    .status {
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
    }
    .loading {
      color: #666;
      font-style: italic;
      padding: 5px;
      background: #ffffcc;
      border-radius: 4px;
      display: inline-block;
      margin: 5px 0;
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
  `;

  const store = useStore({
    testData: useState("Initial unencrypted data"),
    counter: useState(0),
    objectData: useState({ name: "test", value: 123 })
  });

  const updateData = () => {
    const newValue = `Updated at ${new Date().toISOString()}`;
    store.testData[1](newValue);
    console.log('Updated testData to:', newValue);
  };

  const incrementCounter = () => {
    const newValue = store.counter[0] + 1;
    store.counter[1](newValue);
    console.log('Incremented counter to:', newValue);
  };

  const updateObject = () => {
    const newValue = { 
      name: `Object ${store.counter[0]}`, 
      value: Math.random() * 1000,
      timestamp: new Date().toISOString()
    };
    store.objectData[1](newValue);
    console.log('Updated objectData to:', newValue);
  };

  // Access loading states from the enhanced store (index 2)
  const isTestDataLoading = store.testData[2];
  const isCounterLoading = store.counter[2];
  const isObjectDataLoading = store.objectData[2];
  
  const isAnyLoading = isTestDataLoading || isCounterLoading || isObjectDataLoading;
  
  return `
    <style>${styles}</style>
    <div class="crypto-test" style="position: relative;">
      ${isAnyLoading ? `<div class="loading-overlay">Loading encrypted data...</div>` : ''}
      
      <h2>Crypto Test Component</h2>
      
      <div class="status">
        <h3>Current Values:</h3>
        <p>
          <strong>Test Data:</strong> 
          ${isTestDataLoading ? '<span class="loading">Loading...</span>' : store.testData[0]}
        </p>
        <p>
          <strong>Counter:</strong> 
          ${isCounterLoading ? '<span class="loading">Loading...</span>' : store.counter[0]}
        </p>
        <p>
          <strong>Object Data:</strong> 
          ${isObjectDataLoading ? '<span class="loading">Loading...</span>' : `<pre>${JSON.stringify(store.objectData[0], null, 2)}</pre>`}
        </p>
      </div>
      
      <div>
        <button onclick="${updateData}" ${isAnyLoading ? 'disabled' : ''}>Update Test Data</button>
        <button onclick="${incrementCounter}" ${isAnyLoading ? 'disabled' : ''}>Increment Counter</button>
        <button onclick="${updateObject}" ${isAnyLoading ? 'disabled' : ''}>Update Object</button>
      </div>
      
      <div class="status">
        <p><em>Check console for encryption/decryption logs</em></p>
        <p><em>Check IndexedDB in DevTools to see encrypted values</em></p>
        <p><strong>Loading States:</strong></p>
        <ul>
          <li>Test Data: ${isTestDataLoading ? 'Loading...' : 'Ready'}</li>
          <li>Counter: ${isCounterLoading ? 'Loading...' : 'Ready'}</li>
          <li>Object Data: ${isObjectDataLoading ? 'Loading...' : 'Ready'}</li>
        </ul>
      </div>
    </div>
  `;
};

define({ tag: "crypto-test", component: CryptoTest });