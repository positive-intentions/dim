import React from "react";
import {
  css,
  define,
  html,
  useEffect,
  useMemo,
  useRef,
  useScope,
  useState,
  useStore,
  useStyle,
} from "./components/dim.ts";
import Todo from './components/todo.js';

define({
  tag: 'todo-app',
  component: Todo,
  sharedDependencies: [
    useState,
    useEffect,
    useMemo,
    useScope,
    useStyle,
    useStore,
    useRef,
    html,
    css
  ]
});

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Components/Todo",
  component: () => {
    return (
      <todo-app>positive-intentions</todo-app>
    )
  },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  //   argTypes: {
  //     backgroundColor: { control: 'color' },
  //   },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic = {
  args: {
    children: "positive-intentions",
    onClick: () => alert("positive-intentions"),
  },
};