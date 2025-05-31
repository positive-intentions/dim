import React from 'react';

/**
 * Component that renders a lit-html template
 */
function LitHtmlRenderer({ template }) {
  const containerRef = React.useRef(null);
  
  React.useEffect(() => {
    if (containerRef.current && template) {
      // Dynamically import lit's render function
      import('lit').then(({ render }) => {
        // Render the lit-html template into the container
        render(template, containerRef.current);
      });
    }
  }, [template]);
  
  return React.createElement('div', { ref: containerRef });
}

/**
 * Wraps a lit-html story render function to make it compatible with React-based Storybook
 * @param {Function} renderFn - Function that returns a lit-html template
 * @returns {Function} A function that returns either a React element or the original result
 */
export function wrapLitHtmlStory(renderFn) {
  return (args) => {
    const result = renderFn(args);
    
    // Check if the result is a lit-html template
    if (result && result._$litType$ !== undefined) {
      // Return a React element (not a function) that renders the lit-html template
      return React.createElement(LitHtmlRenderer, { template: result });
    }
    
    // If not a lit-html template, return as-is
    return result;
  };
}