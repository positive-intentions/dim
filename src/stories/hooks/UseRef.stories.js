import React from "react";
import { html, css, define, useState, useRef, useStyle, useEffect } from "../../core/dim.ts";

// Form validation with useRef
const FormValidation = (props, { useState, useRef, html, css, useStyle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const ref = useRef();

  useStyle(css`
    .form-container {
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
      font-size: 1rem;
    }

    input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
    }

    .submit-button {
      background-color: #029cfd;
      color: white;
    }

    .submit-button:hover {
      background-color: #0278c7;
    }

    .validate-button {
      background-color: #6c757d;
      color: white;
    }

    .validate-button:hover {
      background-color: #5a6268;
    }

    .success-message {
      background-color: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .validation-info {
      background-color: #e7f3ff;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      font-size: 0.875rem;
    }
  `);

  // Custom validation methods exposed through ref
  ref.current = {
    validateEmail: () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        return { valid: false, error: 'Email is required' };
      }
      if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
      }
      return { valid: true };
    },
    
    validatePassword: () => {
      if (!password) {
        return { valid: false, error: 'Password is required' };
      }
      if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { valid: false, error: 'Password must contain uppercase, lowercase, and number' };
      }
      return { valid: true };
    },
    
    validateForm: () => {
      const emailValidation = ref.current.validateEmail();
      const passwordValidation = ref.current.validatePassword();
      
      const newErrors = {};
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error;
      }
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error;
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    
    resetForm: () => {
      setEmail('');
      setPassword('');
      setErrors({});
      setSubmitted(false);
    },
    
    getFormData: () => ({
      email,
      password,
      timestamp: new Date().toISOString()
    })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ref.current.validateForm()) {
      setSubmitted(true);
      console.log('Form data:', ref.current.getFormData());
    }
  };

  const handleValidateOnly = () => {
    ref.current.validateForm();
  };

  return html`
    <div class="form-container">
      <h3>useRef Form Validation</h3>
      
      ${!submitted ? html`
        <form @submit="${handleSubmit}">
          <div class="form-group">
            <label>Email:</label>
            <input 
              type="text"
              class="${errors.email ? 'error' : ''}"
              .value="${email}"
              @input="${(e) => setEmail(e.target.value)}"
              placeholder="user@example.com"
            />
            ${errors.email ? html`
              <div class="error-message">${errors.email}</div>
            ` : ''}
          </div>

          <div class="form-group">
            <label>Password:</label>
            <input 
              type="password"
              class="${errors.password ? 'error' : ''}"
              .value="${password}"
              @input="${(e) => setPassword(e.target.value)}"
              placeholder="Min 8 chars, mixed case, number"
            />
            ${errors.password ? html`
              <div class="error-message">${errors.password}</div>
            ` : ''}
          </div>

          <div class="button-group">
            <button type="submit" class="submit-button">Submit</button>
            <button type="button" class="validate-button" @click="${handleValidateOnly}">
              Validate Only
            </button>
          </div>
        </form>
      ` : html`
        <div class="success-message">
          ✅ Form submitted successfully!
          <br><br>
          <strong>Submitted Data:</strong>
          <pre>${JSON.stringify(ref.current.getFormData(), null, 2)}</pre>
          <br>
          <button @click="${() => ref.current.resetForm()}">Reset Form</button>
        </div>
      `}

      <div class="validation-info">
        <strong>Validation Rules:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
          <li>Email must be valid format</li>
          <li>Password minimum 8 characters</li>
          <li>Password must contain uppercase, lowercase, and number</li>
        </ul>
      </div>
    </div>
  `;
};

// Media player controls with useRef
const MediaPlayer = (props, { useState, useRef, useEffect, html, css, useStyle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(120); // 2 minutes mock duration
  const [volume, setVolume] = useState(50);

  const playerRef = useRef();
  
  useStyle(css`
    .player-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
      max-width: 500px;
    }

    .player-display {
      background-color: #1a1a1a;
      color: #00ff00;
      padding: 2rem;
      border-radius: 8px;
      font-family: monospace;
      text-align: center;
      margin-bottom: 1rem;
    }

    .time-display {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #333;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
    }

    .progress-fill {
      height: 100%;
      background-color: #00ff00;
      transition: width 0.1s;
    }

    .controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-top: 1rem;
    }

    .control-button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #029cfd;
      color: white;
      cursor: pointer;
      font-size: 1rem;
    }

    .control-button:hover {
      background-color: #0278c7;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;
    }

    .volume-slider {
      width: 100px;
    }

    .method-info {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .method-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .method-button {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .method-button:hover {
      background-color: #e7f3ff;
    }
  `);

  // Media player methods exposed through ref
  playerRef.current = {
    play: () => {
      setIsPlaying(true);
      console.log('Player: Playing');
    },
    
    pause: () => {
      setIsPlaying(false);
      console.log('Player: Paused');
    },
    
    seek: (time) => {
      const clampedTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(clampedTime);
      console.log(`Player: Seeking to ${clampedTime}s`);
    },
    
    skipForward: (seconds = 10) => {
      playerRef.current.seek(currentTime + seconds);
    },
    
    skipBackward: (seconds = 10) => {
      playerRef.current.seek(currentTime - seconds);
    },
    
    setVolume: (level) => {
      const clampedVolume = Math.max(0, Math.min(100, level));
      setVolume(clampedVolume);
      console.log(`Player: Volume set to ${clampedVolume}%`);
    },
    
    mute: () => {
      playerRef.current.setVolume(0);
    },
    
    getState: () => ({
      isPlaying,
      currentTime,
      duration,
      volume,
      progress: (currentTime / duration) * 100
    })
  };

  // Simulate playback
  useEffect(() => {
    let interval;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration - 1) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    playerRef.current.seek(percentage * duration);
  };

  return html`
    <div class="player-container">
      <h3>useRef Media Player Control</h3>
      
      <div class="player-display">
        <div class="time-display">
          ${formatTime(currentTime)} / ${formatTime(duration)}
        </div>
        <div class="progress-bar" @click="${handleProgressClick}">
          <div 
            class="progress-fill" 
            style="width: ${(currentTime / duration) * 100}%"
          ></div>
        </div>
      </div>

      <div class="controls">
        ${isPlaying ? html`
          <button class="control-button" @click="${() => playerRef.current.pause()}">
            ⏸️ Pause
          </button>
        ` : html`
          <button class="control-button" @click="${() => playerRef.current.play()}">
            ▶️ Play
          </button>
        `}
        
        <button class="control-button" @click="${() => playerRef.current.skipBackward()}">
          ⏪ -10s
        </button>
        
        <button class="control-button" @click="${() => playerRef.current.skipForward()}">
          ⏩ +10s
        </button>

        <div class="volume-control">
          <span>🔊</span>
          <input 
            type="range" 
            class="volume-slider"
            min="0" 
            max="100" 
            .value="${volume}"
            @input="${(e) => playerRef.current.setVolume(parseInt(e.target.value))}"
          />
          <span>${volume}%</span>
        </div>
      </div>

      <div class="method-info">
        <strong>Available Ref Methods:</strong>
        <div class="method-list">
          <button class="method-button" @click="${() => playerRef.current.seek(0)}">
            seek(0) - Start
          </button>
          <button class="method-button" @click="${() => playerRef.current.seek(60)}">
            seek(60) - 1 min
          </button>
          <button class="method-button" @click="${() => playerRef.current.mute()}">
            mute()
          </button>
          <button class="method-button" @click="${() => console.log(playerRef.current.getState())}">
            getState() → Console
          </button>
        </div>
      </div>
    </div>
  `;
};

// Focus management with useRef
const FocusManager = (props, { useState, useRef, html, css, useStyle }) => {
  const [inputs, setInputs] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  
  const containerRef = useRef();
  
  useStyle(css`
    .focus-container {
      padding: 2rem;
      border: 2px solid #029cfd;
      border-radius: 8px;
    }

    .input-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1rem 0;
    }

    .input-wrapper {
      position: relative;
    }

    .input-label {
      position: absolute;
      top: -10px;
      left: 10px;
      background-color: white;
      padding: 0 5px;
      font-size: 0.875rem;
      color: #666;
    }

    .focus-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .focus-input:focus {
      outline: none;
      border-color: #029cfd;
    }

    .focus-input.focused {
      border-color: #029cfd;
      box-shadow: 0 0 0 3px rgba(2, 156, 253, 0.1);
    }

    .button-row {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .focus-button {
      padding: 8px 16px;
      border: 1px solid #029cfd;
      border-radius: 4px;
      background-color: white;
      color: #029cfd;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .focus-button:hover {
      background-color: #e7f3ff;
    }

    .status-info {
      background-color: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
  `);

  // Focus management methods
  containerRef.current = {
    focusInput: (index) => {
      const inputs = containerRef.current.querySelectorAll('.focus-input');
      if (inputs[index]) {
        inputs[index].focus();
        setFocusedIndex(index);
      }
    },
    
    focusFirst: () => {
      containerRef.current.focusInput(0);
    },
    
    focusLast: () => {
      const inputs = containerRef.current.querySelectorAll('.focus-input');
      containerRef.current.focusInput(inputs.length - 1);
    },
    
    focusNext: () => {
      const currentIndex = focusedIndex ?? -1;
      const nextIndex = (currentIndex + 1) % inputs.length;
      containerRef.current.focusInput(nextIndex);
    },
    
    focusPrevious: () => {
      const currentIndex = focusedIndex ?? inputs.length;
      const prevIndex = (currentIndex - 1 + inputs.length) % inputs.length;
      containerRef.current.focusInput(prevIndex);
    },
    
    querySelectorAll: (selector) => {
      // Shadow DOM query selector access
      return containerRef.current.shadowRoot?.querySelectorAll(selector) || [];
    }
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  return html`
    <div class="focus-container">
      <h3>useRef Focus Management</h3>
      
      <div class="input-grid">
        ${inputs.map((value, index) => html`
          <div class="input-wrapper">
            <span class="input-label">Input ${index + 1}</span>
            <input 
              type="text"
              class="focus-input ${focusedIndex === index ? 'focused' : ''}"
              .value="${value}"
              @input="${(e) => handleInputChange(index, e.target.value)}"
              @focus="${() => setFocusedIndex(index)}"
              @blur="${() => setFocusedIndex(null)}"
              placeholder="Type here..."
            />
          </div>
        `)}
      </div>

      <div class="button-row">
        <button class="focus-button" @click="${() => containerRef.current.focusFirst()}">
          Focus First
        </button>
        <button class="focus-button" @click="${() => containerRef.current.focusLast()}">
          Focus Last
        </button>
        <button class="focus-button" @click="${() => containerRef.current.focusNext()}">
          Focus Next →
        </button>
        <button class="focus-button" @click="${() => containerRef.current.focusPrevious()}">
          ← Focus Previous
        </button>
      </div>

      <div class="status-info">
        <strong>Currently Focused:</strong> 
        ${focusedIndex !== null ? `Input ${focusedIndex + 1}` : 'None'}
        <br>
        <strong>Values:</strong> ${JSON.stringify(inputs)}
      </div>
    </div>
  `;
};

// Define components
define({ tag: 'use-ref-form', component: FormValidation });
define({ tag: 'use-ref-player', component: MediaPlayer });
define({ tag: 'use-ref-focus', component: FocusManager });

export default {
  title: "Hooks/useRef",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`useRef\` hook provides a way to expose component methods and access DOM elements.

## Features
- Expose custom methods to parent components
- Access shadow DOM elements
- Persist values across renders
- Create imperative APIs

## Usage
\`\`\`javascript
const ref = useRef();

// Expose methods
ref.current = {
  customMethod: () => {
    console.log('Called from parent!');
  },
  getValue: () => someValue
};

// Access from parent
const childRef = childComponent.getRef();
childRef.customMethod();
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const FormValidationRef = {
  render: () => <use-ref-form />,
  name: "Form Validation",
  parameters: {
    docs: {
      description: {
        story: "Form with validation methods exposed through useRef for imperative control."
      }
    }
  }
};

export const MediaPlayerRef = {
  render: () => <use-ref-player />,
  name: "Media Player Controls",
  parameters: {
    docs: {
      description: {
        story: "Media player simulation with playback control methods exposed via useRef."
      }
    }
  }
};

export const FocusManagementRef = {
  render: () => <use-ref-focus />,
  name: "Focus Management",
  parameters: {
    docs: {
      description: {
        story: "Focus management using useRef to control input focus programmatically."
      }
    }
  }
};