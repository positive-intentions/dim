import React from "react";
import { html, css, define, useState, useEffect, useStyle, useScope } from "../core/dim.ts";
import { wrapLitHtmlStory } from "../core/storybook-utils.js";

// Hero Section Component
const HeroSection = (_, { html, css, useStyle }) => {
  useStyle(css`
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
      border-radius: 16px;
      margin-bottom: 3rem;
    }
    
    .hero-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .feature-card {
      background: rgba(255,255,255,0.1);
      padding: 1.5rem;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .feature-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .feature-desc {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  `);

  return html`
    <div class="hero">
      <h1 class="hero-title">🔥 Dim Framework</h1>
      <p class="hero-subtitle">
        A thin wrapper around lit-elements to create functional web components with React-like hooks and syntax
      </p>
      
      <div class="hero-features">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">React-like Hooks</div>
          <div class="feature-desc">useState, useEffect, useMemo, useRef and more</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🧩</div>
          <div class="feature-title">Web Components</div>
          <div class="feature-desc">Native browser support, framework agnostic</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <div class="feature-title">Scoped Styling</div>
          <div class="feature-desc">CSS-in-JS with automatic scoping via Shadow DOM</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <div class="feature-title">Built-in Persistence</div>
          <div class="feature-desc">Automatic IndexedDB storage with useStore</div>
        </div>
      </div>
    </div>
  `;
};

// Quick Start Code Component
const QuickStartCode = (_, { html, css, useStyle }) => {
  useStyle(css`
    .quick-start {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5rem;
      border-radius: 8px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .comment { color: #6a9955; }
    .function { color: #dcdcaa; }
    .property { color: #9cdcfe; }
    
    .install-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }
    
    .step-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .step-number {
      background: #667eea;
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .step-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #495057;
    }
  `);

  return html`
    <div class="quick-start">
      <h2 class="section-title">🚀 Quick Start</h2>
      
      <div class="install-steps">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-title">Installation</div>
          <p>Clone or download the Dim framework</p>
          <div class="code-block">
<span class="comment"># Clone the repository</span>
<span class="keyword">git clone</span> https://github.com/positive-intentions/dim.git
<span class="keyword">cd</span> dim
<span class="keyword">npm install</span>
          </div>
        </div>
        
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-title">Create Component</div>
          <p>Write your first functional component</p>
          <div class="code-block">
<span class="keyword">import</span> { <span class="property">html</span>, <span class="property">css</span>, <span class="property">useState</span> } <span class="keyword">from</span> <span class="string">'./dim.ts'</span>;

<span class="keyword">const</span> <span class="function">MyComponent</span> = <span class="keyword">function</span>() {
  <span class="keyword">const</span> [<span class="property">count</span>, <span class="property">setCount</span>] = <span class="function">useState</span>(<span class="number">0</span>);
  
  <span class="keyword">return</span> <span class="property">html</span><span class="template-literal">\`
    &lt;button @click="\${() => setCount(count + 1)}"&gt;
      Count: \${count}
    &lt;/button&gt;
  \`</span>;
};
          </div>
        </div>
        
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-title">Register & Use</div>
          <p>Register and use your component</p>
          <div class="code-block">
<span class="keyword">import</span> { <span class="property">define</span> } <span class="keyword">from</span> <span class="string">'./dim.ts'</span>;

<span class="comment">// Register component</span>
<span class="function">define</span>({ 
  <span class="property">tag</span>: <span class="string">'my-component'</span>, 
  <span class="property">component</span>: MyComponent 
});

<span class="comment">// Use in HTML</span>
<span class="string">'&lt;my-component&gt;&lt;/my-component&gt;'</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Code Examples Component
const CodeExamples = (_, { useState, html, css, useStyle, useScope }) => {
  const [selectedExample, setSelectedExample] = useState('counter');
  
  useScope({
    'example-preview': ExamplePreview
  });

  const examples = {
    counter: {
      title: '🔢 Interactive Counter',
      description: 'Basic state management with useState',
      code: `import { html, css, useState, useStyle, define } from './dim.ts';

const Counter = (_, { html, css, useState, useStyle }) => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useStyle(css\`
    .counter {
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 8px;
    }
    
    .count-display {
      font-size: 3rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
    }
  \`);

  return html\`
    <div class="counter">
      <div class="count-display">\${count}</div>
      <div class="controls">
        <button class="btn" @click="\${() => setCount(count - step)}">
          -\${step}
        </button>
        <input 
          type="number" 
          .value="\${step}"
          @input="\${(e) => setStep(parseInt(e.target.value) || 1)}"
          style="width: 60px; text-align: center;"
        />
        <button class="btn" @click="\${() => setCount(count + step)}">
          +\${step}
        </button>
        <button class="btn" @click="\${() => setCount(0)}">
          Reset
        </button>
      </div>
    </div>
  \`;
};

define({ tag: 'my-counter', component: Counter });`
    },
    todo: {
      title: '📝 Todo List',
      description: 'Array state management and form handling',
      code: `import { html, css, useState, useStyle, define } from './dim.ts';

const TodoList = (_, { html, css, useState, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Dim framework', completed: false },
    { id: 2, text: 'Build awesome components', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  useStyle(css\`
    .todo-app {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .todo-header {
      background: #667eea;
      color: white;
      padding: 1.5rem;
      text-align: center;
    }
    
    .todo-form {
      padding: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    
    .todo-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .todo-item.completed {
      opacity: 0.6;
      text-decoration: line-through;
    }
    
    .todo-text {
      flex: 1;
      margin-left: 0.5rem;
    }
    
    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
  \`);

  return html\`
    <div class="todo-app">
      <div class="todo-header">
        <h2>My Todo List</h2>
        <p>\${todos.filter(t => !t.completed).length} of \${todos.length} remaining</p>
      </div>
      
      <div class="todo-form">
        <input 
          class="todo-input"
          .value="\${newTodo}"
          @input="\${(e) => setNewTodo(e.target.value)}"
          @keypress="\${(e) => e.key === 'Enter' && addTodo()}"
          placeholder="Add a new todo..."
        />
        <button class="add-btn" @click="\${addTodo}">Add</button>
      </div>
      
      \${todos.map(todo => html\`
        <div class="todo-item \${todo.completed ? 'completed' : ''}">
          <input 
            type="checkbox"
            .checked="\${todo.completed}"
            @change="\${() => toggleTodo(todo.id)}"
          />
          <span class="todo-text">\${todo.text}</span>
          <button class="delete-btn" @click="\${() => deleteTodo(todo.id)}">
            Delete
          </button>
        </div>
      \`)}
    </div>
  \`;
};

define({ tag: 'todo-list', component: TodoList });`
    },
    form: {
      title: '📋 Contact Form',
      description: 'Form validation and controlled inputs',
      code: `import { html, css, useState, useStyle, define } from './dim.ts';

const ContactForm = (_, { html, css, useState, useStyle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      console.log('Form submitted:', formData);
    }
  };

  useStyle(css\`
    .contact-form {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }
    
    .form-input, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .form-input.error, .form-textarea.error {
      border-color: #dc3545;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .submit-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      width: 100%;
    }
    
    .submit-btn:hover {
      background: #5a6fd8;
    }
    
    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      text-align: center;
    }
  \`);

  if (submitted) {
    return html\`
      <div class="contact-form">
        <div class="success-message">
          <h3>Thank you, \${formData.name}!</h3>
          <p>Your message has been sent successfully.</p>
          <button 
            class="submit-btn" 
            @click="\${() => { setSubmitted(false); setFormData({ name: '', email: '', message: '', subscribe: false }); }}"
          >
            Send Another Message
          </button>
        </div>
      </div>
    \`;
  }

  return html\`
    <div class="contact-form">
      <h2>Contact Us</h2>
      <form @submit="\${handleSubmit}">
        <div class="form-group">
          <label class="form-label">Name *</label>
          <input 
            class="form-input \${errors.name ? 'error' : ''}"
            type="text"
            .value="\${formData.name}"
            @input="\${(e) => updateField('name', e.target.value)}"
            placeholder="Your full name"
          />
          \${errors.name ? html\`<div class="error-message">\${errors.name}</div>\` : ''}
        </div>

        <div class="form-group">
          <label class="form-label">Email *</label>
          <input 
            class="form-input \${errors.email ? 'error' : ''}"
            type="email"
            .value="\${formData.email}"
            @input="\${(e) => updateField('email', e.target.value)}"
            placeholder="your.email@example.com"
          />
          \${errors.email ? html\`<div class="error-message">\${errors.email}</div>\` : ''}
        </div>

        <div class="form-group">
          <label class="form-label">Message *</label>
          <textarea 
            class="form-textarea \${errors.message ? 'error' : ''}"
            .value="\${formData.message}"
            @input="\${(e) => updateField('message', e.target.value)}"
            rows="4"
            placeholder="Tell us how we can help you..."
          ></textarea>
          \${errors.message ? html\`<div class="error-message">\${errors.message}</div>\` : ''}
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <input 
              type="checkbox"
              .checked="\${formData.subscribe}"
              @change="\${(e) => updateField('subscribe', e.target.checked)}"
            />
            <label>Subscribe to our newsletter</label>
          </div>
        </div>

        <button type="submit" class="submit-btn">
          Send Message
        </button>
      </form>
    </div>
  \`;
};

define({ tag: 'contact-form', component: ContactForm });`
    },
    theme: {
      title: '🎨 Theme Switcher',
      description: 'Dynamic styling and useEffect examples',
      code: `import { html, css, useState, useEffect, useStyle, define } from './dim.ts';

const ThemeSwitcher = (_, { html, css, useState, useEffect, useStyle }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [animation, setAnimation] = useState(true);

  const themes = {
    light: {
      background: '#ffffff',
      color: '#333333',
      cardBg: '#f8f9fa',
      primary: '#667eea'
    },
    dark: {
      background: '#1a1a1a',
      color: '#ffffff',
      cardBg: '#2d2d2d',
      primary: '#764ba2'
    },
    ocean: {
      background: '#0c4a6e',
      color: '#e0f2fe',
      cardBg: '#075985',
      primary: '#38bdf8'
    },
    forest: {
      background: '#14532d',
      color: '#dcfce7',
      cardBg: '#166534',
      primary: '#4ade80'
    }
  };

  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px'
  };

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('theme-preferences', JSON.stringify({
      theme,
      fontSize,
      animation
    }));
  }, [theme, fontSize, animation]);

  // Load preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme-preferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      setTheme(prefs.theme || 'light');
      setFontSize(prefs.fontSize || 'medium');
      setAnimation(prefs.animation !== false);
    }
  }, []);

  const currentTheme = themes[theme];

  useStyle(css\`
    .theme-app {
      background: \${currentTheme.background};
      color: \${currentTheme.color};
      min-height: 400px;
      padding: 2rem;
      border-radius: 8px;
      font-size: \${fontSizes[fontSize]};
      transition: \${animation ? 'all 0.3s ease' : 'none'};
    }
    
    .theme-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .theme-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, \${currentTheme.primary}, \${currentTheme.color});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .control-group {
      background: \${currentTheme.cardBg};
      padding: 1.5rem;
      border-radius: 8px;
      transition: \${animation ? 'transform 0.2s' : 'none'};
    }
    
    .control-group:hover {
      transform: \${animation ? 'translateY(-2px)' : 'none'};
    }
    
    .control-label {
      display: block;
      font-weight: 600;
      margin-bottom: 1rem;
      color: \${currentTheme.primary};
    }
    
    .control-select, .control-button {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid \${currentTheme.primary};
      border-radius: 4px;
      background: \${currentTheme.background};
      color: \${currentTheme.color};
      cursor: pointer;
    }
    
    .control-button {
      background: \${currentTheme.primary};
      color: white;
      border: none;
      margin-top: 0.5rem;
    }
    
    .control-button:hover {
      opacity: 0.9;
    }
    
    .demo-content {
      background: \${currentTheme.cardBg};
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .demo-card {
      background: \${currentTheme.primary};
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1rem auto;
      max-width: 300px;
      transform: \${animation ? 'scale(1)' : 'none'};
      transition: \${animation ? 'transform 0.2s' : 'none'};
    }
    
    .demo-card:hover {
      transform: \${animation ? 'scale(1.05)' : 'none'};
    }
    
    .checkbox-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  \`);

  return html\`
    <div class="theme-app">
      <div class="theme-header">
        <h1 class="theme-title">Theme Switcher Demo</h1>
        <p>Customize the appearance and save your preferences!</p>
      </div>

      <div class="controls-grid">
        <div class="control-group">
          <label class="control-label">🎨 Theme</label>
          <select 
            class="control-select"
            .value="\${theme}"
            @change="\${(e) => setTheme(e.target.value)}"
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="ocean">🌊 Ocean</option>
            <option value="forest">🌲 Forest</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">📏 Font Size</label>
          <select 
            class="control-select"
            .value="\${fontSize}"
            @change="\${(e) => setFontSize(e.target.value)}"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">✨ Settings</label>
          <div class="checkbox-control">
            <input 
              type="checkbox"
              .checked="\${animation}"
              @change="\${(e) => setAnimation(e.target.checked)}"
            />
            <span>Enable animations</span>
          </div>
          <button 
            class="control-button"
            @click="\${() => {
              setTheme('light');
              setFontSize('medium');
              setAnimation(true);
            }}"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <div class="demo-content">
        <div class="demo-card">
          <h3>Sample Content</h3>
          <p>This card adapts to your theme selection!</p>
          <p>Current theme: <strong>\${theme}</strong></p>
          <p>Font size: <strong>\${fontSize}</strong></p>
        </div>
        <p>Your preferences are automatically saved to localStorage!</p>
      </div>
    </div>
  \`;
};

define({ tag: 'theme-switcher', component: ThemeSwitcher });`
    }
  };

  useStyle(css`
    .code-examples {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .example-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 1rem;
    }
    
    .tab-button {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }
    
    .tab-button.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .tab-button:hover:not(.active) {
      background: #e9ecef;
    }
    
    .example-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    @media (max-width: 768px) {
      .example-content {
        grid-template-columns: 1fr;
      }
    }
    
    .code-section {
      background: #1e1e1e;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .code-header {
      background: #333;
      color: white;
      padding: 1rem;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .copy-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .copy-btn:hover {
      background: #5a6fd8;
    }
    
    .code-content {
      padding: 1.5rem;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .comment { color: #6a9955; }
    .function { color: #dcdcaa; }
    .property { color: #9cdcfe; }
    .number { color: #b5cea8; }
    
    .preview-section {
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .preview-header {
      background: #28a745;
      color: white;
      padding: 1rem;
      font-weight: 600;
    }
    
    .preview-content {
      padding: 1.5rem;
      min-height: 300px;
    }
    
    .example-description {
      background: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      color: #0056b3;
    }
  `);

  const highlightCode = (code) => {
    return code
      .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
      .replace(/\b(const|let|var|function|return|import|export|from|if|else|class|extends|new)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(useState|useEffect|useMemo|useRef|useStyle|useScope|useStore|html|css|define)\b/g, '<span class="function">$1</span>')
      .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '<span class="string">$&</span>')
      .replace(/\b\d+\b/g, '<span class="number">$&</span>');
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const currentExample = examples[selectedExample];

  return html`
    <div class="code-examples">
      <h2 class="section-title">💻 Complete Code Examples</h2>
      <p>Explore these full-featured components to understand Dim patterns and best practices!</p>
      
      <div class="example-tabs">
        ${Object.entries(examples).map(([key, example]) => html`
          <button 
            class="tab-button ${selectedExample === key ? 'active' : ''}"
            @click="${() => setSelectedExample(key)}"
          >
            ${example.title}
          </button>
        `)}
      </div>
      
      <div class="example-description">
        <strong>${currentExample.title}:</strong> ${currentExample.description}
      </div>
      
      <div class="example-content">
        <div class="code-section">
          <div class="code-header">
            <span>📝 Source Code</span>
            <button class="copy-btn" @click="${() => copyToClipboard(currentExample.code)}">
              Copy Code
            </button>
          </div>
          <div class="code-content">
            <pre .innerHTML="${highlightCode(currentExample.code)}"></pre>
          </div>
        </div>
        
        <div class="preview-section">
          <div class="preview-header">
            <span>🎮 Live Preview</span>
          </div>
          <div class="preview-content">
            <example-preview exampleType="${selectedExample}"></example-preview>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Example Preview Component
const ExamplePreview = ({ exampleType }, { html, useScope }) => {
  useScope({
    'counter-example': CounterExample,
    'todo-example': TodoExample,
    'form-example': FormExample,
    'theme-example': ThemeExample
  });

  const renderPreview = () => {
    switch(exampleType) {
      case 'counter':
        return html`<counter-example></counter-example>`;
      case 'todo':
        return html`<todo-example></todo-example>`;
      case 'form':
        return html`<form-example></form-example>`;
      case 'theme':
        return html`<theme-example></theme-example>`;
      default:
        return html`<p>Select an example to see the preview</p>`;
    }
  };

  return html`
    <div class="example-preview">
      ${renderPreview()}
    </div>
  `;
};

// Preview implementations (simplified versions)
const CounterExample = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useStyle(css`
    .counter-preview {
      text-align: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 8px;
    }
    
    .count-display {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .controls {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      background: rgba(255,255,255,0.2);
      color: white;
      transition: background 0.2s;
    }
    
    .btn:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .step-input {
      width: 50px;
      text-align: center;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
    }
  `);

  return html`
    <div class="counter-preview">
      <div class="count-display">${count}</div>
      <div class="controls">
        <button class="btn" @click="${() => setCount(count - step)}">-${step}</button>
        <input 
          class="step-input"
          type="number" 
          .value="${step}"
          @input="${(e) => setStep(parseInt(e.target.value) || 1)}"
        />
        <button class="btn" @click="${() => setCount(count + step)}">+${step}</button>
        <button class="btn" @click="${() => setCount(0)}">Reset</button>
      </div>
    </div>
  `;
};

const TodoExample = (_, { useState, html, css, useStyle }) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn Dim framework', completed: false },
    { id: 2, text: 'Build awesome components', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  useStyle(css`
    .todo-preview {
      max-width: 350px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .todo-header {
      background: #667eea;
      color: white;
      padding: 1rem;
      text-align: center;
    }
    
    .todo-form {
      padding: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    
    .todo-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .todo-item.completed {
      opacity: 0.6;
      text-decoration: line-through;
    }
    
    .todo-text {
      flex: 1;
      margin-left: 0.5rem;
    }
    
    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
  `);

  return html`
    <div class="todo-preview">
      <div class="todo-header">
        <h3>My Todo List</h3>
        <p>${todos.filter(t => !t.completed).length} of ${todos.length} remaining</p>
      </div>
      
      <div class="todo-form">
        <input 
          class="todo-input"
          .value="${newTodo}"
          @input="${(e) => setNewTodo(e.target.value)}"
          @keypress="${(e) => e.key === 'Enter' && addTodo()}"
          placeholder="Add a new todo..."
        />
        <button class="add-btn" @click="${addTodo}">Add</button>
      </div>
      
      ${todos.map(todo => html`
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
          <input 
            type="checkbox"
            .checked="${todo.completed}"
            @change="${() => toggleTodo(todo.id)}"
          />
          <span class="todo-text">${todo.text}</span>
          <button class="delete-btn" @click="${() => deleteTodo(todo.id)}">
            ✕
          </button>
        </div>
      `)}
    </div>
  `;
};

const FormExample = (_, { useState, html, css, useStyle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 2000);
  };

  useStyle(css`
    .form-preview {
      max-width: 350px;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }
    
    .form-input, .form-textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .submit-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    }
    
    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      text-align: center;
    }
  `);

  if (submitted) {
    return html`
      <div class="form-preview">
        <div class="success-message">
          <h3>Thank you!</h3>
          <p>Message sent successfully.</p>
        </div>
      </div>
    `;
  }

  return html`
    <div class="form-preview">
      <h3>Contact Form</h3>
      <form @submit="${handleSubmit}">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input 
            class="form-input"
            type="text"
            .value="${formData.name}"
            @input="${(e) => updateField('name', e.target.value)}"
            placeholder="Your name"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input 
            class="form-input"
            type="email"
            .value="${formData.email}"
            @input="${(e) => updateField('email', e.target.value)}"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea 
            class="form-textarea"
            .value="${formData.message}"
            @input="${(e) => updateField('message', e.target.value)}"
            rows="3"
            placeholder="Your message..."
            required
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">
          Send Message
        </button>
      </form>
    </div>
  `;
};

const ThemeExample = (_, { useState, html, css, useStyle }) => {
  const [theme, setTheme] = useState('blue');
  const [size, setSize] = useState('medium');

  const themes = {
    blue: { bg: '#667eea', color: '#764ba2' },
    green: { bg: '#28a745', color: '#20c997' },
    purple: { bg: '#6f42c1', color: '#e83e8c' }
  };

  const sizes = {
    small: '0.875rem',
    medium: '1rem', 
    large: '1.125rem'
  };

  useStyle(css`
    .theme-preview {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
    }
    
    .demo-box {
      background: linear-gradient(135deg, ${themes[theme].bg}, ${themes[theme].color});
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-size: ${sizes[size]};
      transition: all 0.3s ease;
    }
    
    .controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .control-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }
  `);

  return html`
    <div class="theme-preview">
      <div class="demo-box">
        Dynamic Theme Demo
      </div>
      
      <div class="controls">
        <select class="control-select" .value="${theme}" @change="${(e) => setTheme(e.target.value)}">
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
        </select>
        
        <select class="control-select" .value="${size}" @change="${(e) => setSize(e.target.value)}">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  `;
};

// Interactive Hook Demos Component
const InteractiveDemos = (_, { useState, useEffect, html, css, useStyle, useScope }) => {
  useScope({
    'counter-demo': CounterDemo,
    'todo-demo': TodoMiniDemo,
    'timer-demo': TimerDemo,
    'theme-demo': ThemeDemo
  });

  useStyle(css`
    .interactive-demos {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .demos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .demo-card {
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .demo-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem;
      font-weight: 600;
    }
    
    .demo-content {
      padding: 1.5rem;
    }
    
    .demo-description {
      color: #6c757d;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
  `);

  return html`
    <div class="interactive-demos">
      <h2 class="section-title">🎮 Interactive Hook Demos</h2>
      <p>Try these hands-on examples to understand how Dim hooks work in practice!</p>
      
      <div class="demos-grid">
        <div class="demo-card">
          <div class="demo-header">🔢 useState Demo</div>
          <div class="demo-content">
            <div class="demo-description">
              Interactive counter showing useState hook with multiple state variables
            </div>
            <counter-demo></counter-demo>
          </div>
        </div>
        
        <div class="demo-card">
          <div class="demo-header">📝 Mini Todo List</div>
          <div class="demo-content">
            <div class="demo-description">
              Add and remove items to see array state management in action
            </div>
            <todo-demo></todo-demo>
          </div>
        </div>
        
        <div class="demo-card">
          <div class="demo-header">⏱️ useEffect Timer</div>
          <div class="demo-content">
            <div class="demo-description">
              Watch useEffect manage side effects with automatic cleanup
            </div>
            <timer-demo></timer-demo>
          </div>
        </div>
        
        <div class="demo-card">
          <div class="demo-header">🎨 Dynamic Styling</div>
          <div class="demo-content">
            <div class="demo-description">
              See how useStyle creates scoped CSS that changes dynamically
            </div>
            <theme-demo></theme-demo>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Counter Demo
const CounterDemo = (_, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useStyle(css`
    .counter-demo {
      text-align: center;
    }
    
    .count-display {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin: 1rem 0;
    }
    
    .step-control {
      margin: 1rem 0;
    }
    
    .step-input {
      width: 60px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-align: center;
      margin: 0 0.5rem;
    }
    
    .demo-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin: 0.25rem;
      transition: background 0.2s;
    }
    
    .demo-btn:hover {
      background: #5a6fd8;
    }
    
    .demo-btn.reset {
      background: #dc3545;
    }
    
    .demo-btn.reset:hover {
      background: #c82333;
    }
  `);

  return html`
    <div class="counter-demo">
      <div class="count-display">${count}</div>
      
      <div class="step-control">
        Step: 
        <input 
          class="step-input"
          type="number" 
          .value="${step}"
          @input="${(e) => setStep(parseInt(e.target.value) || 1)}"
        />
      </div>
      
      <button class="demo-btn" @click="${() => setCount(count - step)}">-${step}</button>
      <button class="demo-btn reset" @click="${() => setCount(0)}">Reset</button>
      <button class="demo-btn" @click="${() => setCount(count + step)}">+${step}</button>
    </div>
  `;
};

// Mini Todo Demo
const TodoMiniDemo = (_, { useState, html, css, useStyle }) => {
  const [todos, setTodos] = useState(['Learn Dim', 'Build something cool']);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  useStyle(css`
    .todo-demo {
      max-height: 250px;
      overflow-y: auto;
    }
    
    .todo-input-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .todo-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .add-btn:hover {
      background: #218838;
    }
    
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }
    
    .remove-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .remove-btn:hover {
      background: #c82333;
    }
    
    .todo-count {
      text-align: center;
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  `);

  return html`
    <div class="todo-demo">
      <div class="todo-input-row">
        <input 
          class="todo-input"
          .value="${newTodo}"
          @input="${(e) => setNewTodo(e.target.value)}"
          @keypress="${(e) => e.key === 'Enter' && addTodo()}"
          placeholder="Add new item..."
        />
        <button class="add-btn" @click="${addTodo}">Add</button>
      </div>
      
      ${todos.map((todo, index) => html`
        <div class="todo-item">
          <span>${todo}</span>
          <button class="remove-btn" @click="${() => removeTodo(index)}">✕</button>
        </div>
      `)}
      
      <div class="todo-count">${todos.length} items</div>
    </div>
  `;
};

// Timer Demo
const TimerDemo = (_, { useState, useEffect, html, css, useStyle }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useStyle(css`
    .timer-demo {
      text-align: center;
    }
    
    .timer-display {
      font-size: 2rem;
      font-weight: bold;
      color: ${isRunning ? '#28a745' : '#6c757d'};
      margin: 1rem 0;
      font-family: monospace;
    }
    
    .timer-btn {
      background: ${isRunning ? '#dc3545' : '#28a745'};
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      margin: 0.25rem;
      transition: background 0.2s;
    }
    
    .timer-btn:hover {
      opacity: 0.9;
    }
    
    .reset-btn {
      background: #6c757d;
    }
    
    .timer-status {
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  `);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return html`
    <div class="timer-demo">
      <div class="timer-display">${formatTime(seconds)}</div>
      
      <button class="timer-btn" @click="${() => setIsRunning(!isRunning)}">
        ${isRunning ? 'Stop' : 'Start'}
      </button>
      <button class="timer-btn reset-btn" @click="${() => setSeconds(0)}">
        Reset
      </button>
      
      <div class="timer-status">
        Timer is ${isRunning ? 'running' : 'stopped'}
      </div>
    </div>
  `;
};

// Theme Demo
const ThemeDemo = (_, { useState, html, css, useStyle }) => {
  const [theme, setTheme] = useState('blue');
  const [size, setSize] = useState('medium');

  const themes = {
    blue: { primary: '#667eea', secondary: '#764ba2' },
    green: { primary: '#28a745', secondary: '#20c997' },
    purple: { primary: '#6f42c1', secondary: '#e83e8c' },
    orange: { primary: '#fd7e14', secondary: '#ffc107' }
  };

  const sizes = {
    small: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    medium: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    large: { padding: '1rem 2rem', fontSize: '1.125rem' }
  };

  useStyle(css`
    .theme-demo {
      text-align: center;
    }
    
    .demo-box {
      background: linear-gradient(135deg, ${themes[theme].primary}, ${themes[theme].secondary});
      color: white;
      padding: ${sizes[size].padding};
      font-size: ${sizes[size].fontSize};
      border-radius: 8px;
      margin: 1rem 0;
      transition: all 0.3s ease;
    }
    
    .controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .control-group {
      text-align: left;
    }
    
    .control-label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #495057;
    }
    
    .control-select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }
  `);

  return html`
    <div class="theme-demo">
      <div class="demo-box">
        Dynamic Styling Demo
      </div>
      
      <div class="controls">
        <div class="control-group">
          <label class="control-label">Theme:</label>
          <select class="control-select" .value="${theme}" @change="${(e) => setTheme(e.target.value)}">
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
          </select>
        </div>
        
        <div class="control-group">
          <label class="control-label">Size:</label>
          <select class="control-select" .value="${size}" @change="${(e) => setSize(e.target.value)}">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  `;
};

// Live Example Component (simplified to focus on basics)
const LiveExample = (_, { useState, html, css, useStyle }) => {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  useStyle(css`
    .live-example {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .demo-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      margin: 1rem 0;
    }
    
    .demo-input {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      margin: 0.5rem;
      font-size: 1rem;
      width: 200px;
    }
    
    .demo-input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .demo-button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem;
      transition: transform 0.2s;
    }
    
    .demo-button:hover {
      transform: translateY(-2px);
    }
    
    .demo-output {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-size: 1.125rem;
      color: #495057;
    }
  `);

  return html`
    <div class="live-example">
      <h2 class="section-title">✨ Your First Dim Component</h2>
      <p>This simple example shows the core concepts of Dim in action!</p>
      
      <div class="demo-container">
        <input 
          type="text" 
          class="demo-input"
          placeholder="Enter your name"
          .value="${name}"
          @input="${(e) => setName(e.target.value)}"
        />
        <br>
        <button class="demo-button" @click="${() => setCount(count + 1)}">
          Click Me! (${count})
        </button>
        <button class="demo-button" @click="${() => setCount(0)}">
          Reset
        </button>
        
        <div class="demo-output">
          ${name ? html`Hello, ${name}! ` : 'Hello, stranger! '}
          You've clicked ${count} times.
        </div>
      </div>
      
      <p><strong>What's happening:</strong></p>
      <ul>
        <li>🔄 <code>useState</code> manages reactive state</li>
        <li>📝 Input binding with <code>@input</code> event handler</li>
        <li>🎨 Scoped CSS with <code>useStyle</code></li>
        <li>⚡ Automatic re-rendering on state changes</li>
      </ul>
    </div>
  `;
};

// Navigation Component
const NavigationSection = (_, { html, css, useStyle }) => {
  useStyle(css`
    .navigation {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .nav-card {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
      border: 1px solid #e9ecef;
    }
    
    .nav-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .nav-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .nav-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .nav-desc {
      color: #6c757d;
      font-size: 0.9rem;
    }
  `);

  return html`
    <div class="navigation">
      <h2 class="section-title">📚 Continue Learning</h2>
      <p>Choose your learning path based on your experience level:</p>
      
      <div class="nav-grid">
        <div class="nav-card">
          <div class="nav-icon">🎓</div>
          <div class="nav-title">Core Concepts</div>
          <div class="nav-desc">Learn about hooks, components, and fundamental patterns</div>
        </div>
        
        <div class="nav-card">
          <div class="nav-icon">🛠️</div>
          <div class="nav-title">Step-by-Step Tutorial</div>
          <div class="nav-desc">Build a complete todo app from scratch</div>
        </div>
        
        <div class="nav-card">
          <div class="nav-icon">📖</div>
          <div class="nav-title">API Reference</div>
          <div class="nav-desc">Complete documentation of all hooks and functions</div>
        </div>
        
        <div class="nav-card">
          <div class="nav-icon">🎯</div>
          <div class="nav-title">Examples</div>
          <div class="nav-desc">Live demos and code examples for common patterns</div>
        </div>
      </div>
    </div>
  `;
};

// Main Getting Started Component
const GettingStarted = (_, { html, css, useStyle, useScope }) => {
  useScope({
    'hero-section': HeroSection,
    'quick-start-code': QuickStartCode,
    'live-example': LiveExample,
    'code-examples': CodeExamples,
    'interactive-demos': InteractiveDemos,
    'navigation-section': NavigationSection
  });

  useStyle(css`
    .getting-started {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `);

  return html`
    <div class="getting-started">
      <hero-section></hero-section>
      <quick-start-code></quick-start-code>
      <live-example></live-example>
      <code-examples></code-examples>
      <interactive-demos></interactive-demos>
      <navigation-section></navigation-section>
    </div>
  `;
};

// Register components
define({ tag: 'hero-section', component: HeroSection });
define({ tag: 'quick-start-code', component: QuickStartCode });
define({ tag: 'live-example', component: LiveExample });
define({ tag: 'code-examples', component: CodeExamples });
define({ tag: 'example-preview', component: ExamplePreview });
define({ tag: 'counter-example', component: CounterExample });
define({ tag: 'todo-example', component: TodoExample });
define({ tag: 'form-example', component: FormExample });
define({ tag: 'theme-example', component: ThemeExample });
define({ tag: 'interactive-demos', component: InteractiveDemos });
define({ tag: 'counter-demo', component: CounterDemo });
define({ tag: 'todo-demo', component: TodoMiniDemo });
define({ tag: 'timer-demo', component: TimerDemo });
define({ tag: 'theme-demo', component: ThemeDemo });
define({ tag: 'navigation-section', component: NavigationSection });
define({ tag: 'getting-started', component: GettingStarted });

export default {
  title: "Getting Started",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Welcome to Dim Framework

Dim is a thin wrapper around lit-elements that brings React-like functional programming patterns to web components. It provides familiar hooks like useState, useEffect, and more, while leveraging the power of native web components.

## Why Dim?

- **Familiar API**: If you know React hooks, you know Dim
- **Web Standards**: Built on native web components for maximum compatibility
- **Lightweight**: Minimal footprint with powerful features
- **Scoped Styling**: CSS-in-JS with automatic scoping via Shadow DOM
- **Built-in Persistence**: Automatic state persistence with IndexedDB

## Quick Example

\`\`\`javascript
import { html, css, useState, useStyle, define } from './dim.ts';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  useStyle(css\`
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      cursor: pointer;
    }
  \`);

  return html\`
    <button @click="\${() => setCount(count + 1)}">
      Count: \${count}
    </button>
  \`;
};

define({ tag: 'my-counter', component: Counter });
\`\`\`

Get started by exploring the sections below!
        `
      }
    }
  }
};

export const Overview = {
  render: wrapLitHtmlStory(() => html`<getting-started></getting-started>`),
  name: "Overview & Installation",
  parameters: {
    docs: {
      description: {
        story: `
### Welcome to Dim Framework

This page provides a comprehensive introduction to Dim, including installation instructions, your first component, and a live interactive example.

**What you'll find here:**
- 🔥 **Hero Section**: Overview of Dim's key features
- 🚀 **Quick Start**: Step-by-step installation and setup
- ✨ **Live Example**: Interactive demo to try Dim immediately
- 📚 **Navigation**: Links to continue your learning journey

**Perfect for:**
- Developers new to Dim
- Getting a quick overview of capabilities
- Understanding the development workflow

Try the interactive example above to see how useState and event handling work in Dim!
        `
      }
    }
  }
};