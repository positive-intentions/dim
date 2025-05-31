import React from 'react';
import { define } from '../core/dim.js';
import Button from './components/Button.ts';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';

// Define the button component
define({ tag: 'dim-button', component: Button });

export default {
  title: 'Components/Button',
  parameters: {
    layout: 'centered',
  },
};

export const Default = () => <WebComponent tag="dim-button">Click Me</WebComponent>;

export const WithInitialState = () => (
  <WebComponent tag="dim-button" props={{ initialstate: 5 }}>
    Count from 5
  </WebComponent>
);

export const MultipleButtons = () => (
  <HTMLStory html={`
    <div style="display: flex; gap: 20px; flex-direction: column;">
      <h2>Multiple Button Examples</h2>
      <div style="display: flex; gap: 10px;">
        <dim-button>Default Button</dim-button>
        <dim-button initialstate="10">Start at 10</dim-button>
        <dim-button initialstate="100">Start at 100</dim-button>
      </div>
    </div>
  `} />
);