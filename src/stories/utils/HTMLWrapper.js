import React, { useEffect, useRef } from 'react';

// Simple wrapper to render HTML elements in React Storybook
export const renderHTML = (createElementFn) => {
  return () => {
    const containerRef = useRef(null);
    
    useEffect(() => {
      if (containerRef.current) {
        // Clear any existing content
        containerRef.current.innerHTML = '';
        
        // Get the element from the story function
        const element = createElementFn();
        
        if (typeof element === 'string') {
          // If it's a string, set as innerHTML
          containerRef.current.innerHTML = element;
        } else if (element instanceof HTMLElement) {
          // If it's an HTML element, append it
          containerRef.current.appendChild(element);
        }
      }
    }, []);
    
    return <div ref={containerRef} />;
  };
};