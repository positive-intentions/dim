import React from "react";
import { createRoot } from "react-dom/client";
import { define } from "./stories/components/dim.ts";
import Button from './stories/components/Button.ts';

define({
    tag: 'my-button',
    component: Button,
});

const App = () => {
  return (
    <div>
      <my-button id="aaa" initialstate="33">positive-intentions</my-button>
    </div>
  );
};

const container = document.getElementById("app");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
