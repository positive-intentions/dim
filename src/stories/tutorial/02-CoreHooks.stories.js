import React from "react";
import { html, css, define, useState, useEffect, useMemo, useRef, useStyle } from "../../core/dim.ts";
import { wrapLitHtmlStory } from "../../core/storybook-utils.js";

// useState Hook Demo Component
const UseStateDemo = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  useStyle(css`
    .usestate-demo {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 500px;
    }
    
    .demo-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .demo-section h4 {
      margin-top: 0;
      color: #029cfd;
    }
    
    .controls {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
      flex-wrap: wrap;
    }
    
    button {
      background-color: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    button:hover {
      background-color: #0278c7;
    }
    
    button.secondary {
      background-color: #6c757d;
    }
    
    button.secondary:hover {
      background-color: #5a6268;
    }
    
    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 0.5rem;
    }
    
    .state-display {
      background-color: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
    
    .animated-box {
      width: 100px;
      height: 100px;
      background-color: #029cfd;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: all 0.3s;
      margin: 1rem 0;
    }
    
    .animated-box.hidden {
      opacity: 0;
      transform: scale(0.8);
    }
  `);
  
  return html`
    <div class="usestate-demo">
      <h3>useState Hook Demonstrations</h3>
      
      <div class="demo-section">
        <h4>🔢 Counter State</h4>
        <p>Basic number state with increment/decrement</p>
        <div class="state-display">Count: ${count}</div>
        <div class="controls">
          <button @click="${() => setCount(count - 1)}">Decrement</button>
          <button @click="${() => setCount(0)}">Reset</button>
          <button @click="${() => setCount(count + 1)}">Increment</button>
          <button @click="${() => setCount(count * 2)}">Double</button>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>📝 String State</h4>
        <p>Text input with controlled component pattern</p>
        <div class="state-display">Name: "${name}"</div>
        <div class="controls">
          <input 
            type="text" 
            placeholder="Enter your name"
            .value="${name}"
            @input="${(e) => setName(e.target.value)}"
          />
          <button class="secondary" @click="${() => setName('')}">Clear</button>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>✨ Boolean State</h4>
        <p>Toggle visibility with boolean state</p>
        <div class="state-display">Visible: ${isVisible}</div>
        <div class="animated-box ${isVisible ? '' : 'hidden'}">
          ${isVisible ? 'Visible!' : 'Hidden'}
        </div>
        <div class="controls">
          <button @click="${() => setIsVisible(!isVisible)}">Toggle Visibility</button>
          <button class="secondary" @click="${() => setIsVisible(true)}">Show</button>
          <button class="secondary" @click="${() => setIsVisible(false)}">Hide</button>
        </div>
      </div>
    </div>
  `;
};

// useEffect Hook Demo Component
const UseEffectDemo = (_, { useState, useEffect, html, css, useStyle }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // Timer effect
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);
  
  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Window resize effect
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    
    updateWindowSize(); // Set initial size
    window.addEventListener('resize', updateWindowSize);
    
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);
  
  // Document title effect
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Timer: ${seconds}s`;
    
    return () => {
      document.title = originalTitle;
    };
  }, [seconds]);
  
  useStyle(css`
    .useeffect-demo {
      padding: 2rem;
      border: 2px solid #28a745;
      border-radius: 8px;
      max-width: 600px;
    }
    
    .demo-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .demo-section h4 {
      margin-top: 0;
      color: #28a745;
    }
    
    .timer-display {
      font-size: 3rem;
      font-weight: bold;
      color: #28a745;
      text-align: center;
      margin: 1rem 0;
      font-variant-numeric: tabular-nums;
    }
    
    .controls {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin: 1rem 0;
    }
    
    button {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background-color: #218838;
    }
    
    button.stop {
      background-color: #dc3545;
    }
    
    button.stop:hover {
      background-color: #c82333;
    }
    
    button.secondary {
      background-color: #6c757d;
    }
    
    button.secondary:hover {
      background-color: #5a6268;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .info-card {
      background-color: #fff;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 0.875rem;
    }
    
    .info-value {
      font-size: 1.125rem;
      color: #333;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
  `);
  
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return html`
    <div class="useeffect-demo">
      <h3>useEffect Hook Demonstrations</h3>
      
      <div class="demo-section">
        <h4>⏱️ Timer with Cleanup</h4>
        <p>Demonstrates useEffect with cleanup function for intervals</p>
        <div class="timer-display">${formatTime(seconds)}</div>
        <div class="controls">
          ${!isRunning ? html`
            <button @click="${() => setIsRunning(true)}">Start Timer</button>
          ` : html`
            <button class="stop" @click="${() => setIsRunning(false)}">Stop Timer</button>
          `}
          <button class="secondary" @click="${() => { setSeconds(0); setIsRunning(false); }}">Reset</button>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>🖱️ Event Listeners</h4>
        <p>Mouse position and window size tracking with event cleanup</p>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Mouse Position</div>
            <div class="info-value">X: ${mousePosition.x}, Y: ${mousePosition.y}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Window Size</div>
            <div class="info-value">${windowSize.width} × ${windowSize.height}</div>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>📄 Document Title</h4>
        <p>Watch the browser tab title update with the timer!</p>
        <div style="text-align: center; color: #666; font-style: italic;">
          The document title is being updated with the current timer value
        </div>
      </div>
    </div>
  `;
};

// useMemo Hook Demo Component
const UseMemoDemo = (_, { useState, useMemo, html, css, useStyle }) => {
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [filter, setFilter] = useState('');
  const [expensiveCount, setExpensiveCount] = useState(0);
  
  // Expensive calculation that we want to memoize
  const expensiveCalculation = useMemo(() => {
    console.log('🔄 Running expensive calculation...');
    
    // Simulate expensive operation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    
    return {
      value: Math.round(result),
      timestamp: new Date().toLocaleTimeString(),
      iterationCount: expensiveCount
    };
  }, [expensiveCount]);
  
  // Memoized filtered and sorted numbers
  const processedNumbers = useMemo(() => {
    console.log('🔄 Processing numbers...');
    
    let filtered = numbers.filter(num => 
      num.toString().includes(filter)
    );
    
    return {
      filtered,
      sum: filtered.reduce((acc, num) => acc + num, 0),
      average: filtered.length > 0 ? filtered.reduce((acc, num) => acc + num, 0) / filtered.length : 0,
      max: Math.max(...filtered),
      min: Math.min(...filtered)
    };
  }, [numbers, filter]);
  
  // Non-memoized calculation for comparison
  const nonMemoizedSum = (() => {
    console.log('⚠️ Running non-memoized calculation every render...');
    return numbers.reduce((acc, num) => acc + num, 0);
  })();
  
  useStyle(css`
    .usememo-demo {
      padding: 2rem;
      border: 2px solid #fd7e14;
      border-radius: 8px;
      max-width: 700px;
    }
    
    .demo-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .demo-section h4 {
      margin-top: 0;
      color: #fd7e14;
    }
    
    .controls {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
      flex-wrap: wrap;
      align-items: center;
    }
    
    button {
      background-color: #fd7e14;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    button:hover {
      background-color: #e96500;
    }
    
    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .result-card {
      background-color: #fff;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #ddd;
      text-align: center;
    }
    
    .result-label {
      font-weight: bold;
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    
    .result-value {
      font-size: 1.5rem;
      color: #fd7e14;
      font-weight: bold;
    }
    
    .numbers-display {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin: 1rem 0;
    }
    
    .number-chip {
      background-color: #fd7e14;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
    }
    
    .memoized {
      border-left: 4px solid #28a745;
      background-color: #d4edda;
    }
    
    .non-memoized {
      border-left: 4px solid #dc3545;
      background-color: #f8d7da;
    }
    
    .console-note {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
      font-size: 0.875rem;
    }
  `);
  
  const addRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 100) + 1;
    setNumbers([...numbers, newNumber]);
  };
  
  const removeLastNumber = () => {
    setNumbers(numbers.slice(0, -1));
  };
  
  return html`
    <div class="usememo-demo">
      <h3>useMemo Hook Demonstrations</h3>
      
      <div class="console-note">
        <strong>💡 Tip:</strong> Open your browser's console to see when calculations run!
      </div>
      
      <div class="demo-section">
        <h4>🔢 Number Processing</h4>
        <p>Memoized filtering and calculations on an array of numbers</p>
        
        <div class="controls">
          <input 
            type="text" 
            placeholder="Filter numbers..."
            .value="${filter}"
            @input="${(e) => setFilter(e.target.value)}"
          />
          <button @click="${addRandomNumber}">Add Random Number</button>
          <button @click="${removeLastNumber}">Remove Last</button>
          <button @click="${() => setNumbers([1, 2, 3, 4, 5])}">Reset</button>
        </div>
        
        <div class="numbers-display">
          ${numbers.map(num => html`
            <span class="number-chip">${num}</span>
          `)}
        </div>
        
        <div class="results-grid">
          <div class="result-card memoized">
            <div class="result-label">Filtered Count</div>
            <div class="result-value">${processedNumbers.filtered.length}</div>
          </div>
          <div class="result-card memoized">
            <div class="result-label">Sum</div>
            <div class="result-value">${processedNumbers.sum}</div>
          </div>
          <div class="result-card memoized">
            <div class="result-label">Average</div>
            <div class="result-value">${processedNumbers.average.toFixed(1)}</div>
          </div>
          <div class="result-card memoized">
            <div class="result-label">Max</div>
            <div class="result-value">${isFinite(processedNumbers.max) ? processedNumbers.max : 'N/A'}</div>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>⚡ Expensive Calculation</h4>
        <p>Demonstrates memoization preventing unnecessary recalculation</p>
        
        <div class="controls">
          <button @click="${() => setExpensiveCount(expensiveCount + 1)}">
            Trigger Expensive Calculation
          </button>
          <span style="margin-left: 1rem; color: #666;">
            Count: ${expensiveCount}
          </span>
        </div>
        
        <div class="results-grid">
          <div class="result-card memoized">
            <div class="result-label">Result</div>
            <div class="result-value">${expensiveCalculation.value}</div>
          </div>
          <div class="result-card memoized">
            <div class="result-label">Last Calculated</div>
            <div class="result-value" style="font-size: 1rem;">${expensiveCalculation.timestamp}</div>
          </div>
          <div class="result-card non-memoized">
            <div class="result-label">Non-Memoized Sum</div>
            <div class="result-value">${nonMemoizedSum}</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// useRef Hook Demo Component
const UseRefDemo = (_, { useRef, useState, html, css, useStyle }) => {
  const inputRef = useRef();
  const counterRef = useRef();
  const [focusCount, setFocusCount] = useState(0);
  const [value, setValue] = useState('');
  
  // Expose methods through ref
  counterRef.current = {
    getValue: () => value,
    setValue: setValue,
    clear: () => setValue(''),
    focus: () => inputRef.current?.focus(),
    getStats: () => ({
      length: value.length,
      wordCount: value.split(' ').filter(word => word.length > 0).length,
      focusCount
    })
  };
  
  useStyle(css`
    .useref-demo {
      padding: 2rem;
      border: 2px solid #6f42c1;
      border-radius: 8px;
      max-width: 600px;
    }
    
    .demo-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .demo-section h4 {
      margin-top: 0;
      color: #6f42c1;
    }
    
    .controls {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
      flex-wrap: wrap;
    }
    
    button {
      background-color: #6f42c1;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    button:hover {
      background-color: #5a359a;
    }
    
    input, textarea {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    textarea {
      width: 100%;
      min-height: 100px;
      resize: vertical;
      font-family: inherit;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .stat-card {
      background-color: #fff;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #ddd;
      text-align: center;
    }
    
    .stat-label {
      font-weight: bold;
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    
    .stat-value {
      font-size: 1.5rem;
      color: #6f42c1;
      font-weight: bold;
    }
    
    .api-demo {
      background-color: #e9ecef;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
    }
    
    .api-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #495057;
    }
    
    .api-code {
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 0.5rem;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
    }
  `);
  
  const focusInput = () => {
    inputRef.current?.focus();
    setFocusCount(prev => prev + 1);
  };
  
  const selectAllText = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };
  
  const clearAndFocus = () => {
    setValue('');
    inputRef.current?.focus();
  };
  
  const stats = counterRef.current?.getStats() || { length: 0, wordCount: 0, focusCount: 0 };
  
  return html`
    <div class="useref-demo">
      <h3>useRef Hook Demonstrations</h3>
      
      <div class="demo-section">
        <h4>🎯 DOM Element Access</h4>
        <p>Direct access to DOM elements for imperative operations</p>
        
        <textarea
          ref="${inputRef}"
          placeholder="Type something here..."
          .value="${value}"
          @input="${(e) => setValue(e.target.value)}"
          @focus="${() => setFocusCount(prev => prev + 1)}"
        ></textarea>
        
        <div class="controls">
          <button @click="${focusInput}">Focus Input</button>
          <button @click="${selectAllText}">Select All</button>
          <button @click="${clearAndFocus}">Clear & Focus</button>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Characters</div>
            <div class="stat-value">${stats.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Words</div>
            <div class="stat-value">${stats.wordCount}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Focus Count</div>
            <div class="stat-value">${stats.focusCount}</div>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>🔌 Imperative API</h4>
        <p>useRef can expose imperative APIs for parent components</p>
        
        <div class="api-demo">
          <div class="api-title">Available API Methods:</div>
          <div class="api-code">
counterRef.current = {
  getValue: () => value,
  setValue: (newValue) => setValue(newValue),
  clear: () => setValue(''),
  focus: () => inputRef.current?.focus(),
  getStats: () => ({ length, wordCount, focusCount })
}</div>
        </div>
        
        <div class="controls">
          <button @click="${() => counterRef.current?.setValue('Hello from API!')}">
            Set Value via API
          </button>
          <button @click="${() => counterRef.current?.clear()}">
            Clear via API
          </button>
          <button @click="${() => console.log(counterRef.current?.getStats())}">
            Log Stats to Console
          </button>
        </div>
      </div>
    </div>
  `;
};

// Register components
define({ tag: 'usestate-demo', component: UseStateDemo });
define({ tag: 'useeffect-demo', component: UseEffectDemo });
define({ tag: 'usememo-demo', component: UseMemoDemo });
define({ tag: 'useref-demo', component: UseRefDemo });

export default {
  title: "Tutorial/02. Core Hooks",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# Core Hooks in Dim

Learn the fundamental hooks that power Dim components: useState, useEffect, useMemo, and useRef.

## useState
The \`useState\` hook adds reactive state to your components. When state changes, your component automatically re-renders.

## useEffect
The \`useEffect\` hook lets you perform side effects like API calls, timers, and event listeners with proper cleanup.

## useMemo
The \`useMemo\` hook memoizes expensive calculations to prevent unnecessary recomputation on every render.

## useRef
The \`useRef\` hook provides access to DOM elements and allows you to expose imperative APIs from your components.

Each hook works exactly like its React counterpart, making it easy to transfer your React knowledge to Dim.
        `
      }
    }
  }
};

export const UseStateExamples = {
  render: wrapLitHtmlStory(() => html`<usestate-demo></usestate-demo>`),
  name: "useState Hook",
  parameters: {
    docs: {
      description: {
        story: `
### useState Hook

The \`useState\` hook is the foundation of reactive state in Dim. It works identically to React's useState:

\`\`\`javascript
const [state, setState] = useState(initialValue);
\`\`\`

**Key Features:**
- **Reactive Updates**: When state changes, the component re-renders automatically
- **Immutable Updates**: Always replace state, don't mutate it
- **Type Flexibility**: Can hold any type of data (numbers, strings, objects, arrays)

**Best Practices:**
- Keep state as simple as possible
- Use multiple state variables instead of one complex object when appropriate
- Always use the setter function, never mutate state directly

Try the interactive examples above to see useState in action with different data types!
        `
      }
    }
  }
};

export const UseEffectExamples = {
  render: wrapLitHtmlStory(() => html`<useeffect-demo></useeffect-demo>`),
  name: "useEffect Hook",
  parameters: {
    docs: {
      description: {
        story: `
### useEffect Hook

The \`useEffect\` hook handles side effects in your components. It combines the functionality of componentDidMount, componentDidUpdate, and componentWillUnmount from class components.

\`\`\`javascript
useEffect(() => {
  // Effect code
  
  return () => {
    // Cleanup code (optional)
  };
}, [dependencies]);
\`\`\`

**Common Use Cases:**
- **Timers & Intervals**: Set up and clean up timers
- **Event Listeners**: Add and remove DOM event listeners  
- **API Calls**: Fetch data when component mounts or dependencies change
- **Document Updates**: Update page title, meta tags, etc.
- **Subscriptions**: Subscribe to external data sources

**Cleanup Functions:**
Always return a cleanup function when:
- Setting up intervals or timeouts
- Adding event listeners
- Creating subscriptions
- Opening connections

The examples above demonstrate real-world useEffect patterns with proper cleanup!
        `
      }
    }
  }
};

export const UseMemoExamples = {
  render: wrapLitHtmlStory(() => html`<usememo-demo></usememo-demo>`),
  name: "useMemo Hook",
  parameters: {
    docs: {
      description: {
        story: `
### useMemo Hook

The \`useMemo\` hook memoizes expensive calculations to prevent unnecessary recomputation. It only recalculates when its dependencies change.

\`\`\`javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
\`\`\`

**When to Use useMemo:**
- **Expensive Calculations**: Complex mathematical operations, sorting large arrays
- **Derived State**: Computing values based on props or state
- **Reference Equality**: Preventing child re-renders due to object recreation
- **Performance Optimization**: When profiling shows performance bottlenecks

**Performance Impact:**
- ✅ **Good**: Expensive operations, large data processing
- ❌ **Avoid**: Simple calculations, primitive values
- ⚠️ **Consider**: Always measure performance before optimizing

Open your browser console while interacting with the demos to see when calculations run!
        `
      }
    }
  }
};

export const UseRefExamples = {
  render: wrapLitHtmlStory(() => html`<useref-demo></useref-demo>`),
  name: "useRef Hook",
  parameters: {
    docs: {
      description: {
        story: `
### useRef Hook

The \`useRef\` hook provides direct access to DOM elements and allows you to store mutable values that persist across renders without causing re-renders.

\`\`\`javascript
const myRef = useRef(initialValue);

// Access DOM element
myRef.current.focus();

// Store mutable value
myRef.current = { some: 'data' };
\`\`\`

**Common Use Cases:**
- **DOM Access**: Focus inputs, scroll to elements, measure dimensions
- **Imperative APIs**: Expose methods to parent components
- **Mutable Storage**: Store values that don't trigger re-renders
- **Previous Values**: Keep reference to previous props or state

**Imperative APIs:**
useRef is perfect for exposing imperative APIs from your components:

\`\`\`javascript
// In your component
myRef.current = {
  focus: () => inputRef.current?.focus(),
  getValue: () => currentValue,
  reset: () => setValue('')
};

// Parent can call: getRef('my-component').focus()
\`\`\`

Try the interactive examples to see DOM manipulation and API exposure in action!
        `
      }
    }
  }
};