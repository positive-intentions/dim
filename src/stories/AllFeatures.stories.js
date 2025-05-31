import React from 'react';
import { HTMLStory } from './utils/StoryWrapper.js';
import { define } from '../core/dim.js';
import Todo from './components/todo.js';
import NestedExample from './components/NestedExample.js';
import DeepParent from './components/DeepParent.js';
import Button from './components/Button.ts';
import AddItemForm from './components/AddItemForm.js';
import TodoList from './components/TodoList.js';
import ListItem from './components/ListItem.js';

// Define all components
define({ tag: 'all-todo', component: Todo });
define({ tag: 'all-nested', component: NestedExample });
define({ tag: 'all-deep', component: DeepParent });
define({ tag: 'all-button', component: Button });
define({ tag: 'all-add-form', component: AddItemForm });
define({ tag: 'all-todo-list', component: TodoList });
define({ tag: 'all-list-item', component: ListItem });

export default {
  title: 'Dim Framework/All Features',
  parameters: {
    layout: 'fullscreen',
  },
};

export const CompleteShowcase = () => {
  return <HTMLStory html={`
    <div style="padding: 40px; max-width: 1200px; margin: 0 auto;">
      <h1 style="text-align: center; margin-bottom: 40px;">
        Dim Framework - Complete Feature Showcase
      </h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <!-- Todo Application -->
          <div style="border: 2px solid #e0e0e0; border-radius: 12px; padding: 24px; background: #f8f9fa;">
            <h2>📝 Todo Application</h2>
            <p>Full todo app with state management, nested components, and event handling</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <all-todo></all-todo>
            </div>
          </div>

          <!-- Nested Components -->
          <div style="border: 2px solid #e0e0e0; border-radius: 12px; padding: 24px; background: #f8f9fa;">
            <h2>🎯 Nested Components (A→B→C)</h2>
            <p>Components defined inline, demonstrating the &lt;a&gt;&lt;b&gt;&lt;c&gt;&lt;/c&gt;&lt;/b&gt;&lt;/a&gt; pattern</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <all-nested></all-nested>
            </div>
          </div>

          <!-- Deep Parent-Child -->
          <div style="border: 2px solid #e0e0e0; border-radius: 12px; padding: 24px; background: #f8f9fa;">
            <h2>👨‍👧‍👦 Deep Parent-Child-Grandchild</h2>
            <p>Props passing through multiple levels with state updates</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <all-deep></all-deep>
            </div>
          </div>

          <!-- Interactive Buttons -->
          <div style="border: 2px solid #e0e0e0; border-radius: 12px; padding: 24px; background: #f8f9fa;">
            <h2>🔘 Interactive Buttons</h2>
            <p>useState, useEffect, and useMemo hooks in action</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <all-button>Default</all-button>
                <all-button initialstate="5">From 5</all-button>
                <all-button initialstate="10">From 10</all-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Features Overview -->
        <div style="margin-top: 40px; padding: 24px; background: #e3f2fd; border-radius: 12px;">
          <h2>✨ Framework Features</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
            <div>
              <h4>🎣 React-like Hooks</h4>
              <ul>
                <li>useState</li>
                <li>useEffect</li>
                <li>useMemo</li>
                <li>useRef</li>
                <li>useScope</li>
                <li>useStore</li>
              </ul>
            </div>
            <div>
              <h4>🧩 Component Features</h4>
              <ul>
                <li>Functional components</li>
                <li>Props passing</li>
                <li>Nested rendering</li>
                <li>Shadow DOM isolation</li>
                <li>Event handling</li>
                <li>Re-rendering on state change</li>
              </ul>
            </div>
            <div>
              <h4>📦 State Management</h4>
              <ul>
                <li>Local component state</li>
                <li>Shared store state</li>
                <li>Async storage support</li>
                <li>State persistence</li>
                <li>Props flow</li>
                <li>Top-down data flow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  `} />;
};