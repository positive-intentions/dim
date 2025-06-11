import React from "react";
import { define, html, css } from "../core/dim.ts";
import { StyledButton } from "./components/StyledButton.js";

// Define the styled button component
define({ tag: 'styled-button', component: StyledButton });

// Demo component showing different button variants
const StyledButtonDemo = (props, { html, css, useStyle, useState }) => {
  const [clickCount, setClickCount] = useState(0);
  
  useStyle(css`
    .demo-container {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .section {
      background: white;
      padding: 1.5rem;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .section h3 {
      margin-top: 0;
      color: #333;
    }
    
    .click-counter {
      padding: 1rem;
      background: #e7f3ff;
      border-radius: 4px;
      text-align: center;
      font-weight: 600;
    }
  `);
  
  const handleClick = () => {
    setClickCount(clickCount + 1);
  };
  
  return html`
    <div class="demo-container">
      <div class="section">
        <h3>Button Variants</h3>
        <div class="button-group">
          <styled-button variant="primary" @click=${handleClick}>
            Primary Button
          </styled-button>
          
          <styled-button variant="secondary" @click=${handleClick}>
            Secondary Button
          </styled-button>
          
          <styled-button variant="primary" disabled="true">
            Disabled Primary
          </styled-button>
          
          <styled-button variant="secondary" disabled="true">
            Disabled Secondary
          </styled-button>
        </div>
      </div>
      
      <div class="section">
        <h3>Interactive Demo</h3>
        <div class="click-counter">
          Button clicked ${clickCount} times
        </div>
        <div class="button-group" style="margin-top: 1rem;">
          <styled-button variant="primary" @click=${handleClick}>
            Click Me!
          </styled-button>
          <styled-button variant="secondary" @click=${() => setClickCount(0)}>
            Reset Counter
          </styled-button>
        </div>
      </div>
      
      <div class="section">
        <h3>Custom Content</h3>
        <div class="button-group">
          <styled-button variant="primary" @click=${handleClick}>
            ⭐ Star This
          </styled-button>
          
          <styled-button variant="secondary" @click=${handleClick}>
            💾 Save Changes
          </styled-button>
          
          <styled-button variant="primary" @click=${handleClick}>
            <strong>Bold Text</strong>
          </styled-button>
        </div>
      </div>
    </div>
  `;
};

// Define the demo component
define({ tag: 'styled-button-demo', component: StyledButtonDemo });

export default {
  title: "Styled Components",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# 🎨 Styled Components

This section demonstrates how to create reusable styled components using Dim's shared styles system.

## Features

- **Shared Styles**: Import and compose styles from a central style library
- **CSS Custom Properties**: Easy theming with CSS variables
- **adoptedStyleSheets**: Modern, performant styling with CSP compliance
- **Component Variants**: Different visual styles through props
- **Dynamic Styling**: Styles that update based on component state

## Example: StyledButton

The StyledButton component demonstrates:
- Using shared button and layout styles
- Component-specific style overrides
- Dynamic theming with CSS custom properties
- Proper event handling and disabled states

\`\`\`javascript
import { buttonStyles, layoutStyles } from '../../core/shared-styles';

export const StyledButton = ({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary' 
}, { html, css, useStyle }) => {
  
  // Combine shared styles with component-specific styles
  const componentStyles = css\`
    \${buttonStyles}
    \${layoutStyles}
    
    /* Component-specific overrides */
    :host {
      --button-bg: \${variant === 'primary' ? '#007bff' : '#6c757d'};
      --button-hover-bg: \${variant === 'primary' ? '#0056b3' : '#5a6268'};
    }
  \`;
  
  useStyle(componentStyles);
  
  return html\`
    <button 
      class="button flex flex-center gap-2" 
      @click=\${onClick}
      ?disabled=\${disabled}
    >
      \${children}
    </button>
  \`;
};
\`\`\`
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const ButtonShowcase = {
  render: () => React.createElement('styled-button-demo'),
  name: "Styled Button",
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo of the StyledButton component showing different variants and states.

### Usage

\`\`\`html
<styled-button variant="primary" @click="\${handleClick}">
  Click Me
</styled-button>

<styled-button variant="secondary" disabled="true">
  Disabled Button
</styled-button>
\`\`\`

### Props

- **variant**: "primary" | "secondary" - Visual style of the button
- **disabled**: boolean - Whether the button is disabled
- **onClick**: function - Click event handler
- **children**: any - Button content

### Styling

The component uses CSS custom properties for theming:

- \`--button-bg\`: Background color
- \`--button-hover-bg\`: Hover background color
- \`--button-padding\`: Button padding
- \`--button-radius\`: Border radius
- \`--button-font-size\`: Font size
        `
      }
    }
  }
};