import React from "react";
import { html, css, define, useState, useEffect, useStyle } from "../../core/dim.ts";

// Timer component demonstrating useEffect
const Timer = (props, { useState, useEffect, html, css, useStyle }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useStyle(css`
    .timer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .time-display {
      font-size: 3rem;
      font-weight: bold;
      font-family: monospace;
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

    .stop-button {
      background-color: #dc3545;
    }

    .stop-button:hover {
      background-color: #c82333;
    }

    .reset-button {
      background-color: #6c757d;
    }

    .reset-button:hover {
      background-color: #5a6268;
    }
  `);

  useEffect(() => {
    let interval;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return html`
    <div class="timer-container">
      <h3>useEffect Timer Demo</h3>
      <div class="time-display">${formatTime(seconds)}</div>
      <div class="button-group">
        ${!isRunning ? html`
          <button @click="${() => setIsRunning(true)}">Start</button>
        ` : html`
          <button class="stop-button" @click="${() => setIsRunning(false)}">Stop</button>
        `}
        <button class="reset-button" @click="${() => { setSeconds(0); setIsRunning(false); }}">Reset</button>
      </div>
    </div>
  `;
};

// Data fetcher demonstrating async effects
const DataFetcher = (props, { useState, useEffect, html, css, useStyle }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(1);

  useStyle(css`
    .fetcher-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 500px;
    }

    .controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    input[type="number"] {
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 80px;
    }

    button {
      background-color: #029cfd;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 6px 12px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0278c7;
    }

    .loading {
      color: #029cfd;
      font-style: italic;
    }

    .error {
      color: #dc3545;
      padding: 1rem;
      background-color: #f8d7da;
      border-radius: 4px;
    }

    .data-display {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }
  `);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!cancelled) {
          // Mock data
          const mockData = {
            id: userId,
            name: `User ${userId}`,
            email: `user${userId}@example.com`,
            company: 'Acme Corp',
            timestamp: new Date().toISOString()
          };
          setData(mockData);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to fetch data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return html`
    <div class="fetcher-container">
      <h3>useEffect Async Demo</h3>
      
      <div class="controls">
        <label>User ID:</label>
        <input 
          type="number" 
          .value="${userId}" 
          @input="${(e) => setUserId(parseInt(e.target.value) || 1)}"
          min="1"
          max="10"
        />
        <button @click="${() => setUserId(userId + 1)}">Next User</button>
      </div>

      ${loading ? html`
        <div class="loading">Loading...</div>
      ` : error ? html`
        <div class="error">${error}</div>
      ` : data ? html`
        <div class="data-display">${JSON.stringify(data, null, 2)}</div>
      ` : ''}
    </div>
  `;
};

// Window event listener example
const WindowListener = (props, { useState, useEffect, html, css, useStyle }) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  useStyle(css`
    .listener-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .metric:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: bold;
      color: #666;
    }

    .value {
      font-family: monospace;
      color: #333;
    }

    .hint {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #e7f3ff;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #0066cc;
    }
  `);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    // Set initial values
    handleResize();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return html`
    <div class="listener-container">
      <h3>useEffect Event Listeners</h3>
      
      <div class="metric">
        <span class="label">Window Size:</span>
        <span class="value">${windowSize.width} × ${windowSize.height}</span>
      </div>
      
      <div class="metric">
        <span class="label">Mouse Position:</span>
        <span class="value">(${mousePosition.x}, ${mousePosition.y})</span>
      </div>
      
      <div class="metric">
        <span class="label">Scroll Position:</span>
        <span class="value">${scrollPosition}px</span>
      </div>

      <div class="hint">
        Try resizing the window, moving your mouse, or scrolling to see the values update!
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'use-effect-timer', component: Timer });
define({ tag: 'use-effect-fetcher', component: DataFetcher });
define({ tag: 'use-effect-listener', component: WindowListener });

export default {
  title: "Hooks/useEffect",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useEffect\` hook manages side effects in Dim components.

## Features
- Runs after component renders
- Supports cleanup functions
- Dependency array for conditional execution
- Handles async operations properly

## Usage
\`\`\`javascript
// Run once on mount
useEffect(() => {
  console.log('Component mounted');
  
  return () => {
    console.log('Component unmounted');
  };
}, []);

// Run when dependencies change
useEffect(() => {
  console.log('Dependencies changed');
}, [dep1, dep2]);

// Run on every render
useEffect(() => {
  console.log('Component rendered');
});
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const TimerWithCleanup = {
  render: () => <use-effect-timer />,
  name: "Timer with Cleanup",
  parameters: {
    docs: {
      description: {
        story: "Timer demonstrating useEffect with interval setup and cleanup on unmount."
      }
    }
  }
};

export const AsyncDataFetching = {
  render: () => <use-effect-fetcher />,
  name: "Async Data Fetching",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates async operations in useEffect with proper cleanup to prevent memory leaks."
      }
    }
  }
};

export const EventListeners = {
  render: () => <use-effect-listener />,
  name: "Window Event Listeners",
  parameters: {
    docs: {
      description: {
        story: "Shows how to properly add and remove event listeners using useEffect."
      }
    }
  }
};