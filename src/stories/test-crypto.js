
const CryptoTest = (props, { useStore, useState, css, html, useEffect, useStyle }) => {
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

  // Create state variables separately first
  const testDataState = useState("Initial unencrypted data");
  const counterState = useState(0);
  const objectDataState = useState({ name: "test", value: 123 });
  
  // Then pass them to useStore
  const store = useStore({
    testData: testDataState,
    counter: counterState,
    objectData: objectDataState
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
  // Use safe access in case the store isn't enhanced yet
  const isTestDataLoading = store.testData && store.testData[2] ? store.testData[2] : false;
  const isCounterLoading = store.counter && store.counter[2] ? store.counter[2] : false;
  const isObjectDataLoading = store.objectData && store.objectData[2] ? store.objectData[2] : false;
  
  // If the store hasn't been enhanced yet (no loading states), show loading
  const storeEnhanced = store.testData && store.testData.length > 2;
  const isAnyLoading = !storeEnhanced || isTestDataLoading || isCounterLoading || isObjectDataLoading;

  // Monitor loading state changes
  useEffect(() => {
    console.log('Loading states:', {
      testData: store.testData?.[2],
      counter: store.counter?.[2],
      objectData: store.objectData?.[2]
    });
  }, [isTestDataLoading, isCounterLoading, isObjectDataLoading]);
  
  // Use useStyle hook for CSS
  useStyle(styles);
  
  return html`
    <div class="crypto-test" style="position: relative;">
      ${isAnyLoading ? html`<div class="loading-overlay">Loading encrypted data...</div>` : ''}
      
      <h2>Crypto Test Component</h2>
      
      <div class="status">
        <h3>Current Values:</h3>
        <p>
          <strong>Test Data:</strong> 
          ${isTestDataLoading ? html`<span class="loading">Loading...</span>` : (store.testData && store.testData[0] ? store.testData[0] : 'No data')}
        </p>
        <p>
          <strong>Counter:</strong> 
          ${isCounterLoading ? html`<span class="loading">Loading...</span>` : (store.counter && store.counter[0] !== undefined ? store.counter[0] : 0)}
        </p>
        <p>
          <strong>Object Data:</strong> 
          ${isObjectDataLoading ? html`<span class="loading">Loading...</span>` : (store.objectData && store.objectData[0] ? html`<pre>${JSON.stringify(store.objectData[0], null, 2)}</pre>` : html`<pre>{}</pre>`)}
        </p>
      </div>
      
      <div>
        <button @click="${updateData}" ?disabled="${isAnyLoading}">Update Test Data</button>
        <button @click="${incrementCounter}" ?disabled="${isAnyLoading}">Increment Counter</button>
        <button @click="${updateObject}" ?disabled="${isAnyLoading}">Update Object</button>
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

// define({ tag: "crypto-test", component: CryptoTest });