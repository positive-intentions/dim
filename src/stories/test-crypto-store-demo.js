import { define } from "../core/dim.ts";

const CryptoTestStoreDemo = (props, { useStore, useState, css, html, useEffect, useStyle }) => {
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
      cursor: pointer;
      background: #029cfd;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover {
      background: #0278c7;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .error {
      color: red;
      margin: 10px 0;
    }
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
    }
  `;

  useStyle(styles);

  // Create states first
  const [testData, setTestData] = useState("Initial encrypted data");
  const [counter, setCounter] = useState(0);
  const [objectData, setObjectData] = useState({ name: "test", value: 123 });
  
  // Then use them in store
  const store = useStore({
    testData: [testData, setTestData],
    counter: [counter, setCounter],
    objectData: [objectData, setObjectData]
  });
  
  // Simple loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Safe access to store values
  const getCurrentValue = (key) => {
    if (store[key] && Array.isArray(store[key]) && store[key].length > 0) {
      return store[key][0];
    }
    return null;
  };
  
  const getSetter = (key) => {
    if (store[key] && Array.isArray(store[key]) && store[key].length > 1) {
      return store[key][1];
    }
    return null;
  };

  const updateData = () => {
    try {
      const setter = getSetter('testData');
      if (!setter) {
        throw new Error('testData setter not available');
      }
      const newValue = `Updated at ${new Date().toISOString()}`;
      setter(newValue);
      console.log('Updated testData to:', newValue);
      setError(null);
    } catch (err) {
      console.error('Failed to update testData:', err);
      setError(err.message);
    }
  };

  const incrementCounter = () => {
    try {
      const setter = getSetter('counter');
      if (!setter) {
        throw new Error('counter setter not available');
      }
      const currentValue = getCurrentValue('counter') || 0;
      const newValue = currentValue + 1;
      setter(newValue);
      console.log('Incremented counter to:', newValue);
      setError(null);
    } catch (err) {
      console.error('Failed to increment counter:', err);
      setError(err.message);
    }
  };

  const updateObject = () => {
    try {
      const setter = getSetter('objectData');
      if (!setter) {
        throw new Error('objectData setter not available');
      }
      const currentCounter = getCurrentValue('counter') || 0;
      const newValue = { 
        name: `Object ${currentCounter}`, 
        value: Math.random() * 1000,
        timestamp: new Date().toISOString()
      };
      setter(newValue);
      console.log('Updated objectData to:', newValue);
      setError(null);
    } catch (err) {
      console.error('Failed to update objectData:', err);
      setError(err.message);
    }
  };
  
  // Simulate loading for 1 second on mount
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('Store demo ready');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return html`
    <div class="crypto-test">
      <h2>Crypto Test with Store (Demo)</h2>
      
      ${error ? html`<div class="error">Error: ${error}</div>` : ''}
      
      <div class="status">
        <h3>Current Values:</h3>
        <p>
          <strong>Test Data:</strong> 
          ${isLoading ? 'Loading...' : (getCurrentValue('testData') || 'No data')}
        </p>
        <p>
          <strong>Counter:</strong> 
          ${isLoading ? 'Loading...' : (getCurrentValue('counter') ?? 0)}
        </p>
        <p>
          <strong>Object Data:</strong>
          ${isLoading ? 'Loading...' : html`<pre>${JSON.stringify(getCurrentValue('objectData') || {}, null, 2)}</pre>`}
        </p>
      </div>
      
      <div>
        <button @click="${updateData}" ?disabled="${isLoading}">Update Test Data</button>
        <button @click="${incrementCounter}" ?disabled="${isLoading}">Increment Counter</button>
        <button @click="${updateObject}" ?disabled="${isLoading}">Update Object</button>
      </div>
      
      <div class="status">
        <p><strong>Store Status:</strong> ${isLoading ? 'Loading...' : 'Ready'}</p>
        <p><em>This demo uses encrypted store with safe error handling</em></p>
        <p><em>Check console and IndexedDB for encrypted values</em></p>
      </div>
    </div>
  `;
};

define({ tag: "crypto-test-store-demo", component: CryptoTestStoreDemo });