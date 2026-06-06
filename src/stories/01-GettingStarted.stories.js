import React from "react";
import "./test-crypto-store-demo.js";

export default {
  title: "Getting Started",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Getting Started with Dim

Dim is a web components framework with a React-like API — \`useState\`, \`useEffect\`, \`useStyle\`, \`useStore\`, and more.

## Where to go next

- **Demo/Shopping App** — Full navigable e-commerce demo with view transitions, persistent cart, and checkout flow
- **Demo/Messaging App** — Navigable messaging UI with shared-element transitions
- **API Reference** — Complete hook and component documentation
- **useTransition()** — View transition gallery and examples

## useStore demo

The story below demonstrates encrypted, persistent global state with \`useStore\`.
For a complete application walkthrough, start with **Demo/Shopping App**.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const UseStoreDemo = {
  render: () => React.createElement("crypto-test-store-demo"),
  name: "useStore - Encrypted State Management",
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the useStore hook for global state management with automatic encryption and persistence.

The store encrypts data at rest in IndexedDB and provides reactive state updates across components.
Check the console and IndexedDB in DevTools to see the encrypted values.`,
      },
    },
  },
};
