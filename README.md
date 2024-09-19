<p align="center">
  <img src="public/dim.png" alt="App Logo" />
</p>

<div align="center">
  
[Live App](https://dim.positive-intentions.com) | [Reddit](https://www.reddit.com/r/positive_intentions) | [Medium](https://medium.com/@positive.intentions.com) | [Discord](https://discord.gg/unnQnR67nR)
</div>

<div align="center">
  
![GitHub stars](https://img.shields.io/github/stars/positive-intentions/dim?style=social) 
![GitHub forks](https://img.shields.io/github/forks/positive-intentions/dim?style=social) 
![GitHub issues](https://img.shields.io/github/issues/positive-intentions/dim) 
![GitHub license](https://img.shields.io/github/license/positive-intentions/dim) 
![Staging](https://github.com/positive-intentions/dim/actions/workflows/main_workflow.yaml/badge.svg) 
[![gh-pages-build-deployment](https://github.com/positive-intentions/dim/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/positive-intentions/dim/actions/workflows/pages/pages-build-deployment)
[![CodeQL](https://github.com/positive-intentions/dim/actions/workflows/codeql.yml/badge.svg)](https://github.com/positive-intentions/dim/actions/workflows/codeql.yml)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
</div>

# Dim

a thin wrapper around lit-elements to create functional webcomponents.

this is early development on this and it’s missing all the bells-and-whistles needed in a proper app. It’s an unstable experimental work-in-progress. it may contain bugs and/or incomplete features. provided for demo and educational purposes only. nobody should be using this in production.

## Example

```javascript
import {
  useState,
  useEffect,
  useMemo,
  useStyle,
  useScope,
  useStore,
  html,
  css,
} from "./dim.ts";

const Button = function ({ children, initialstate = 0 }) {
  const [count, setCount] = useState(parseInt(initialstate), "test-state");

  useStyle(css`
    button {
      background-color: #4caf50;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    }
  `);

  useScope({
    // 'dim-span': DimSpan
  });

  useEffect(() => {
    console.log("Button mounted");
    return () => {
      console.log("Button unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("count effect triggered");
  }, [count]);

  const someCalculation = useMemo(() => {
    const result = count() * 2;
    console.log("memo calculation triggered:", result);
    return result;
  }, [count]);

  const {
    settings: {
      username: [username, setUsername],
    },
    config: {
      button: {
        label: [label, setLabel],
      },
    },
  } = useStore({
    settings: {
      username: true,
    },
    config: {
      button: {
        label: true,
      },
    },
  });

  return html`
    <button @click="${() => setCount(count() + 1)}">
      ${children} ${count()} ${someCalculation}
    </button>
  `;
};

export default Button;
```

### How You Can Help

- **Feedback**: Your insights are invaluable. Share your thoughts on current features, suggest new ones, or report any bugs you encounter.
- **Development**: Interested in contributing code? [Let's talk!](https://www.reddit.com/r/positive_intentions).
- **Spread the Word**: Help us grow by sharing the app with others who value privacy and control over their digital communication.
- **Github Stars**: If you like the project, consider starring the repository. It helps others discover it and boosts our motivation.
- **Sponsorship**: Development is fueled by passion and coffee. Your sponsorship helps keep both flowing.
