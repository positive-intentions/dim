import React from "react";
import { html, css, define, useState, useMemo, useStyle } from "../../core/dim.ts";

// Expensive calculation example
const ExpensiveCalculation = (props, { useState, useMemo, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [renderCount, setRenderCount] = useState(0);

  useStyle(css`
    .calculation-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 500px;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    label {
      font-weight: bold;
      min-width: 100px;
    }

    input[type="number"] {
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 100px;
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

    .results {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ddd;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .calculation-indicator {
      color: #28a745;
      font-weight: bold;
      animation: flash 0.5s;
    }

    @keyframes flash {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 1; }
    }

    .render-count {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #ffc107;
      color: #000;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: bold;
    }
  `);

  // Increment render count on each render
  setTimeout(() => setRenderCount(r => r + 1), 0);

  // Expensive calculation that only runs when 'count' changes
  const expensiveResult = useMemo(() => {
    console.log('Running expensive calculation...');
    // Simulate expensive operation
    let result = 0;
    for (let i = 0; i < count * 1000000; i++) {
      result += Math.random();
    }
    return Math.floor(result);
  }, [count]);

  // Another memoized value that depends on both count and multiplier
  const multipliedResult = useMemo(() => {
    console.log('Calculating multiplied result...');
    return expensiveResult * multiplier;
  }, [expensiveResult, multiplier]);

  return html`
    <div class="calculation-container" style="position: relative;">
      <div class="render-count">Renders: ${renderCount}</div>
      
      <h3>useMemo Expensive Calculation</h3>
      
      <div class="controls">
        <div class="control-group">
          <label>Count:</label>
          <input 
            type="number" 
            .value="${count}" 
            @input="${(e) => setCount(parseInt(e.target.value) || 0)}"
            min="0"
            max="100"
          />
          <button @click="${() => setCount(c => c + 1)}">+1</button>
        </div>
        
        <div class="control-group">
          <label>Multiplier:</label>
          <input 
            type="number" 
            .value="${multiplier}" 
            @input="${(e) => setMultiplier(parseInt(e.target.value) || 1)}"
            min="1"
            max="10"
          />
          <button @click="${() => setMultiplier(m => m + 1)}">+1</button>
        </div>
      </div>

      <div class="results">
        <div class="result-item">
          <span>Expensive Result:</span>
          <span class="calculation-indicator">${expensiveResult}</span>
        </div>
        <div class="result-item">
          <span>Multiplied Result:</span>
          <span>${multipliedResult}</span>
        </div>
        <div class="result-item">
          <span>Calculation Complexity:</span>
          <span>${count} × 1,000,000 iterations</span>
        </div>
      </div>

      <p style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
        Notice: The expensive calculation only runs when 'count' changes, not when 'multiplier' changes!
      </p>
    </div>
  `;
};

// Filtered list example
const FilteredList = (props, { useState, useMemo, html, css, useStyle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Large dataset
  const [items] = useState(() => {
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: names[i % names.length] + ' ' + Math.floor(i / names.length),
      department: departments[i % departments.length],
      salary: Math.floor(50000 + Math.random() * 100000),
      email: `user${i + 1}@example.com`
    }));
  });

  useStyle(css`
    .list-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 600px;
    }

    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: center;
    }

    input[type="text"] {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .stats {
      background-color: #e7f3ff;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .list-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .list-item:hover {
      background-color: #f5f5f5;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .item-details {
      font-size: 0.875rem;
      color: #666;
    }

    .item-salary {
      font-weight: bold;
      color: #028a0f;
    }
  `);

  // Memoized filtered and sorted list
  const filteredAndSortedItems = useMemo(() => {
    console.log('Filtering and sorting items...');
    
    let result = items;
    
    // Filter
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return (a.salary - b.salary) * multiplier;
    });
    
    return result;
  }, [items, searchTerm, sortOrder]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const total = filteredAndSortedItems.length;
    const avgSalary = total > 0 
      ? Math.round(filteredAndSortedItems.reduce((sum, item) => sum + item.salary, 0) / total)
      : 0;
    
    return { total, avgSalary };
  }, [filteredAndSortedItems]);

  return html`
    <div class="list-container">
      <h3>useMemo Filtered List</h3>
      
      <div class="controls">
        <input 
          type="text" 
          placeholder="Search by name, department, or email..."
          .value="${searchTerm}"
          @input="${(e) => setSearchTerm(e.target.value)}"
        />
        <select .value="${sortOrder}" @change="${(e) => setSortOrder(e.target.value)}">
          <option value="asc">Salary: Low to High</option>
          <option value="desc">Salary: High to Low</option>
        </select>
      </div>

      <div class="stats">
        Showing ${statistics.total} of ${items.length} employees | 
        Average salary: $${statistics.avgSalary.toLocaleString()}
      </div>

      <div class="list">
        ${filteredAndSortedItems.map(item => html`
          <div class="list-item">
            <div class="item-info">
              <div class="item-name">${item.name}</div>
              <div class="item-details">${item.department} • ${item.email}</div>
            </div>
            <div class="item-salary">$${item.salary.toLocaleString()}</div>
          </div>
        `)}
      </div>
    </div>
  `;
};

// Derived state example
const DerivedState = (props, { useState, useMemo, html, css, useStyle }) => {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [birthYear, setBirthYear] = useState(1990);

  useStyle(css`
    .derived-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 400px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .derived-values {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: #f0f0f0;
      border-radius: 4px;
    }

    .derived-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ddd;
    }

    .derived-item:last-child {
      border-bottom: none;
    }

    .derived-label {
      font-weight: bold;
      color: #666;
    }

    .derived-value {
      color: #333;
    }
  `);

  // Multiple derived values using useMemo
  const fullName = useMemo(() => {
    console.log('Computing full name...');
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const age = useMemo(() => {
    console.log('Computing age...');
    return new Date().getFullYear() - birthYear;
  }, [birthYear]);

  const initials = useMemo(() => {
    console.log('Computing initials...');
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  }, [firstName, lastName]);

  const emailSuggestion = useMemo(() => {
    console.log('Computing email suggestion...');
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  }, [firstName, lastName]);

  return html`
    <div class="derived-container">
      <h3>useMemo Derived State</h3>
      
      <div class="form-group">
        <label>First Name:</label>
        <input 
          type="text" 
          .value="${firstName}"
          @input="${(e) => setFirstName(e.target.value)}"
        />
      </div>

      <div class="form-group">
        <label>Last Name:</label>
        <input 
          type="text" 
          .value="${lastName}"
          @input="${(e) => setLastName(e.target.value)}"
        />
      </div>

      <div class="form-group">
        <label>Birth Year:</label>
        <input 
          type="number" 
          .value="${birthYear}"
          @input="${(e) => setBirthYear(parseInt(e.target.value) || 1990)}"
          min="1900"
          max="${new Date().getFullYear()}"
        />
      </div>

      <div class="derived-values">
        <h4 style="margin-top: 0;">Derived Values (Memoized)</h4>
        <div class="derived-item">
          <span class="derived-label">Full Name:</span>
          <span class="derived-value">${fullName}</span>
        </div>
        <div class="derived-item">
          <span class="derived-label">Age:</span>
          <span class="derived-value">${age} years</span>
        </div>
        <div class="derived-item">
          <span class="derived-label">Initials:</span>
          <span class="derived-value">${initials}</span>
        </div>
        <div class="derived-item">
          <span class="derived-label">Email:</span>
          <span class="derived-value">${emailSuggestion}</span>
        </div>
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'use-memo-calculation', component: ExpensiveCalculation });
define({ tag: 'use-memo-list', component: FilteredList });
define({ tag: 'use-memo-derived', component: DerivedState });

export default {
  title: "Hooks/useMemo",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useMemo\` hook optimizes performance by memoizing expensive computations.

## Features
- Caches computed values between renders
- Only recalculates when dependencies change
- Prevents unnecessary expensive operations
- Useful for derived state and filtered lists

## Usage
\`\`\`javascript
const memoizedValue = useMemo(() => {
  // Expensive computation
  return computeExpensiveValue(a, b);
}, [a, b]); // Only re-runs when a or b changes

// For derived state
const fullName = useMemo(() => {
  return \`\${firstName} \${lastName}\`;
}, [firstName, lastName]);
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const ExpensiveCalculationDemo = {
  render: () => <use-memo-calculation />,
  name: "Expensive Calculation",
  parameters: {
    docs: {
      description: {
        story: "Demonstrates how useMemo prevents expensive calculations from running on every render."
      }
    }
  }
};

export const FilteredListDemo = {
  render: () => <use-memo-list />,
  name: "Filtered & Sorted List",
  parameters: {
    docs: {
      description: {
        story: "Shows useMemo optimizing list filtering and sorting operations with large datasets."
      }
    }
  }
};

export const DerivedStateDemo = {
  render: () => <use-memo-derived />,
  name: "Derived State Values",
  parameters: {
    docs: {
      description: {
        story: "Examples of using useMemo for computing derived values from component state."
      }
    }
  }
};