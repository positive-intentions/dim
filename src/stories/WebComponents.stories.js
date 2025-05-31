import React from 'react';
import { define } from '../core/dim.js';
import Todo from './components/todo.js';
import NestedExample from './components/NestedExample.js';
import DeepParent from './components/DeepParent.js';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';

// Define all components upfront
define({ tag: 'dim-todo', component: Todo });
define({ tag: 'dim-nested', component: NestedExample });
define({ tag: 'dim-deep-parent', component: DeepParent });

export default {
  title: 'Dim Framework/Components',
  parameters: {
    layout: 'centered',
  },
};

// Todo App Story
export const TodoApp = () => <WebComponent tag="dim-todo" />;

// Nested Example Story
export const NestedComponents = () => <WebComponent tag="dim-nested" />;

// Deep Parent-Child-Grandchild Story
export const DeepNesting = () => <WebComponent tag="dim-deep-parent" />;

// Combined Demo Story
export const AllComponents = () => (
  <HTMLStory html={`
    <div style="display: flex; flex-direction: column; gap: 40px; width: 100%;">
      <h1>Dim Framework - All Components Demo</h1>
      
      <div>
        <h2>Todo App</h2>
        <dim-todo></dim-todo>
      </div>
      
      <div>
        <h2>Nested Components (A→B→C)</h2>
        <dim-nested></dim-nested>
      </div>
      
      <div>
        <h2>Deep Parent-Child-Grandchild</h2>
        <dim-deep-parent></dim-deep-parent>
      </div>
    </div>
  `} />
);