import React, { useEffect, useRef } from 'react';

// Wrapper component for web components in React Storybook
export const WebComponent = ({ tag, props = {}, children, innerHTML }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create the web component
      const element = document.createElement(tag);
      
      // Set props if any
      if (Object.keys(props).length > 0) {
        element.props = props;
      }
      
      // Set innerHTML if provided
      if (innerHTML) {
        element.innerHTML = innerHTML;
      }
      
      // Set text content if children is a string
      if (typeof children === 'string') {
        element.textContent = children;
      }
      
      // Append to container
      containerRef.current.appendChild(element);
    }
  }, [tag, props, children, innerHTML]);
  
  return <div ref={containerRef} />;
};

// Helper to create a story with HTML content
export const HTMLStory = ({ html }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current && html) {
      containerRef.current.innerHTML = html;
      
      // Execute any scripts in the HTML
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        script.parentNode.replaceChild(newScript, script);
      });
    }
  }, [html]);
  
  return <div ref={containerRef} />;
};