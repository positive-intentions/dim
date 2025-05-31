import React from 'react';
import { define } from "../core/dim.js";
import Todo from './components/todo.js';
import NestedExample from './components/NestedExample.js';
import DeepParent from './components/DeepParent.js';
import { WebComponent } from './utils/StoryWrapper.js';

// Define all web components
define({ tag: 'todo-app', component: Todo });
define({ tag: 'nested-example-story', component: NestedExample });
define({ tag: 'deep-parent-story', component: DeepParent });

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Components/Todo",
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic = () => <WebComponent tag="todo-app" />;

export const WithNestedComponents = () => <WebComponent tag="nested-example-story" />;

export const DeepNesting = () => <WebComponent tag="deep-parent-story" />;