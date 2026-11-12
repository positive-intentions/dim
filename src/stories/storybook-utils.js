import React from 'react';
import { render, HTML_RESULT } from '../core/renderer/index.js';

/**
 * Component that renders a Dim html template
 */
function DimHtmlRenderer({ template }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current && template) {
      render(template, containerRef.current);
    }
  }, [template]);

  return React.createElement('div', { ref: containerRef });
}

/**
 * Wraps a Dim html story render function to make it compatible with React-based Storybook
 * @param {Function} renderFn - Function that returns a Dim TemplateResult
 * @returns {Function} A function that returns either a React element or the original result
 */
export function wrapDimHtmlStory(renderFn) {
  return (args) => {
    const result = renderFn(args);

    // Check if the result is a Dim template
    if (result && result._$dimType$ === HTML_RESULT) {
      return React.createElement(DimHtmlRenderer, { template: result });
    }

    // If not a template, return as-is
    return result;
  };
}
