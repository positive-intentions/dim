"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[828],{"./src/stories/03-StyledComponents.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{ButtonShowcase:()=>ButtonShowcase,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_03_StyledComponents_stories});var react=__webpack_require__("./node_modules/react/index.js"),dim=__webpack_require__("./src/core/dim.ts"),mini_lit=__webpack_require__("./src/core/mini-lit.js");const buttonStyles=mini_lit.AH`
  .button {
    padding: var(--button-padding, 8px 16px);
    background: var(--button-bg, #007bff);
    color: var(--button-color, white);
    border: none;
    border-radius: var(--button-radius, 4px);
    cursor: pointer;
    font-size: var(--button-font-size, 14px);
  }
  
  .button:hover {
    background: var(--button-hover-bg, #0056b3);
  }
  
  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`,layoutStyles=(mini_lit.AH`
  .card {
    background: var(--card-bg, white);
    border: 1px solid var(--card-border, #ddd);
    border-radius: var(--card-radius, 8px);
    padding: var(--card-padding, 16px);
    box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.1));
  }
`,mini_lit.AH`
  .form-control {
    width: 100%;
    padding: var(--input-padding, 8px 12px);
    border: 1px solid var(--input-border, #ced4da);
    border-radius: var(--input-radius, 4px);
    font-size: var(--input-font-size, 14px);
  }
  
  .form-control:focus {
    outline: none;
    border-color: var(--input-focus-border, #80bdff);
    box-shadow: 0 0 0 2px var(--input-focus-shadow, rgba(0,123,255,0.25));
  }
`,mini_lit.AH`
  .h1 {
    font-size: var(--h1-size, 2.5rem);
    font-weight: var(--h1-weight, 500);
    line-height: var(--h1-line-height, 1.2);
    margin: var(--h1-margin, 0 0 1rem 0);
  }
  
  .h2 {
    font-size: var(--h2-size, 2rem);
    font-weight: var(--h2-weight, 500);
    line-height: var(--h2-line-height, 1.3);
    margin: var(--h2-margin, 0 0 0.75rem 0);
  }
  
  .body {
    font-size: var(--body-size, 1rem);
    line-height: var(--body-line-height, 1.5);
  }
`,mini_lit.AH`
  .flex {
    display: flex;
  }
  
  .flex-column {
    flex-direction: column;
  }
  
  .flex-center {
    justify-content: center;
    align-items: center;
  }
  
  .gap-1 { gap: var(--spacing-1, 0.25rem); }
  .gap-2 { gap: var(--spacing-2, 0.5rem); }
  .gap-3 { gap: var(--spacing-3, 1rem); }
  .gap-4 { gap: var(--spacing-4, 1.5rem); }
`);(0,dim.E8)({tag:"styled-button",component:({onClick,disabled,variant="primary"},{html,css,useStyle,unsafeCSS})=>{const isDisabled="true"===disabled||!0===disabled;useStyle(css`
    ${buttonStyles}
    ${layoutStyles}
    
    /* Component-specific overrides */
    :host {
      --button-bg: ${unsafeCSS("primary"===variant?"#007bff":"#6c757d")};
      --button-hover-bg: ${unsafeCSS("primary"===variant?"#0056b3":"#5a6268")};
    }
    
    .button-icon {
      margin-right: 8px;
    }
  `);return html`
    <button 
      class="button flex flex-center gap-2" 
      @click=${e=>{!isDisabled&&onClick&&onClick(e)}}
      ?disabled=${isDisabled}
    >
      <slot></slot>
    </button>
  `}});(0,dim.E8)({tag:"styled-button-demo",component:(props,{html,css,useStyle,useState})=>{const[clickCount,setClickCount]=useState(0);useStyle(css`
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
  `);const handleClick=()=>{setClickCount(clickCount+1)};return html`
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
          <styled-button variant="secondary" @click=${()=>setClickCount(0)}>
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
  `}});const _03_StyledComponents_stories={title:"useStyle()",parameters:{layout:"centered",docs:{description:{component:"\n# 🎨 Styled Components\n\nThis section demonstrates how to create reusable styled components using Dim's shared styles system.\n\n## Features\n\n- **Shared Styles**: Import and compose styles from a central style library\n- **CSS Custom Properties**: Easy theming with CSS variables\n- **adoptedStyleSheets**: Modern, performant styling with CSP compliance\n- **Component Variants**: Different visual styles through props\n- **Dynamic Styling**: Styles that update based on component state\n\n## Example: StyledButton\n\nThe StyledButton component demonstrates:\n- Using shared button and layout styles\n- Component-specific style overrides\n- Dynamic theming with CSS custom properties\n- Proper event handling and disabled states\n\n```javascript\nimport { buttonStyles, layoutStyles } from '../../core/shared-styles';\n\nexport const StyledButton = ({ \n  children, \n  onClick, \n  disabled = false,\n  variant = 'primary' \n}, { html, css, useStyle }) => {\n  \n  // Combine shared styles with component-specific styles\n  const componentStyles = css`\n    ${buttonStyles}\n    ${layoutStyles}\n    \n    /* Component-specific overrides */\n    :host {\n      --button-bg: ${variant === 'primary' ? '#007bff' : '#6c757d'};\n      --button-hover-bg: ${variant === 'primary' ? '#0056b3' : '#5a6268'};\n    }\n  `;\n  \n  useStyle(componentStyles);\n  \n  return html`\n    <button \n      class=\"button flex flex-center gap-2\" \n      @click=${onClick}\n      ?disabled=${disabled}\n    >\n      ${children}\n    </button>\n  `;\n};\n```\n        "}}},tags:["autodocs"]},ButtonShowcase={render:()=>react.createElement("styled-button-demo"),name:"Styled Button",parameters:{docs:{description:{story:'\nInteractive demo of the StyledButton component showing different variants and states.\n\n### Usage\n\n```html\n<styled-button variant="primary" @click="${handleClick}">\n  Click Me\n</styled-button>\n\n<styled-button variant="secondary" disabled="true">\n  Disabled Button\n</styled-button>\n```\n\n### Props\n\n- **variant**: "primary" | "secondary" - Visual style of the button\n- **disabled**: boolean - Whether the button is disabled\n- **onClick**: function - Click event handler\n- **children**: any - Button content\n\n### Styling\n\nThe component uses CSS custom properties for theming:\n\n- `--button-bg`: Background color\n- `--button-hover-bg`: Hover background color\n- `--button-padding`: Button padding\n- `--button-radius`: Border radius\n- `--button-font-size`: Font size\n        '}}}},__namedExportsOrder=["ButtonShowcase"];ButtonShowcase.parameters={...ButtonShowcase.parameters,docs:{...ButtonShowcase.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'styled-button-demo\'),\n  name: "Styled Button",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nInteractive demo of the StyledButton component showing different variants and states.\n\n### Usage\n\n\\`\\`\\`html\n<styled-button variant="primary" @click="\\${handleClick}">\n  Click Me\n</styled-button>\n\n<styled-button variant="secondary" disabled="true">\n  Disabled Button\n</styled-button>\n\\`\\`\\`\n\n### Props\n\n- **variant**: "primary" | "secondary" - Visual style of the button\n- **disabled**: boolean - Whether the button is disabled\n- **onClick**: function - Click event handler\n- **children**: any - Button content\n\n### Styling\n\nThe component uses CSS custom properties for theming:\n\n- \\`--button-bg\\`: Background color\n- \\`--button-hover-bg\\`: Hover background color\n- \\`--button-padding\\`: Button padding\n- \\`--button-radius\\`: Border radius\n- \\`--button-font-size\\`: Font size\n        `\n      }\n    }\n  }\n}',...ButtonShowcase.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-03-StyledComponents-stories.b3bec72a.iframe.bundle.js.map