import React from 'react';

export default {
  title: 'Introduction',
  parameters: {
    docs: {
      description: {
        component: `
# Dim Framework

**A React-inspired functional web components framework**

Build modern web applications with familiar React-like syntax, powered by native Web Components.

## 🌟 Overview

Dim is a lightweight framework that brings React's component model and hooks to native Web Components. Write familiar functional components with hooks while leveraging the power of web standards.

## ✨ Features

- **React-like Syntax**: Familiar component patterns with hooks support
- **Web Components**: Built on native browser standards
- **Lightweight**: Minimal overhead and fast performance
- **Modern**: ES6+ with TypeScript support
- **Flexible**: Easy integration with existing projects

## 🚀 Getting Started

Check out the other stories in this Storybook to see Dim in action:

- **Getting Started**: Basic examples and tutorials
- **API Reference**: Complete hook and component documentation
- **Styled Components**: Advanced styling patterns

## 📖 Learn More

Visit the [GitHub repository](https://github.com/positive-intentions/dim) for complete documentation and examples.
        `,
      },
    },
  },
};

export const Welcome = {
  render: () => {
    return React.createElement('div', {
      style: {
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        lineHeight: '1.6'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        style: { textAlign: 'center', marginBottom: '3rem' }
      }, [
        React.createElement('img', {
          key: 'logo',
          src: '/dim.png',
          alt: 'Dim Framework Logo',
          width: '200',
          style: { marginBottom: '1rem' }
        }),
        React.createElement('h1', {
          key: 'title',
          style: { 
            fontSize: '3rem', 
            margin: '0',
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }
        }, 'Dim Framework'),
        React.createElement('p', {
          key: 'subtitle',
          style: { 
            fontSize: '1.2rem', 
            color: '#666',
            fontWeight: '300'
          }
        }, 'A React-inspired functional web components framework')
      ]),
      
      React.createElement('div', {
        key: 'content',
        style: { marginBottom: '2rem' }
      }, [
        React.createElement('h2', { key: 'overview-title' }, '🌟 Overview'),
        React.createElement('p', { key: 'overview-desc' }, 
          'Dim is a lightweight framework that brings React\'s component model and hooks to native Web Components. Write familiar functional components with hooks while leveraging the power of web standards.'
        ),
        
        React.createElement('h2', { key: 'features-title' }, '✨ Features'),
        React.createElement('ul', { key: 'features-list' }, [
          React.createElement('li', { key: 'f1' }, React.createElement('strong', null, 'React-like Syntax'), ': Familiar component patterns with hooks support'),
          React.createElement('li', { key: 'f2' }, React.createElement('strong', null, 'Web Components'), ': Built on native browser standards'),
          React.createElement('li', { key: 'f3' }, React.createElement('strong', null, 'Lightweight'), ': Minimal overhead and fast performance'),
          React.createElement('li', { key: 'f4' }, React.createElement('strong', null, 'Modern'), ': ES6+ with TypeScript support'),
          React.createElement('li', { key: 'f5' }, React.createElement('strong', null, 'Flexible'), ': Easy integration with existing projects')
        ]),
        
        React.createElement('h2', { key: 'start-title' }, '🚀 Getting Started'),
        React.createElement('p', { key: 'start-desc' }, 'Check out the other stories in this Storybook to see Dim in action:'),
        React.createElement('ul', { key: 'start-list' }, [
          React.createElement('li', { key: 's1' }, React.createElement('strong', null, 'Getting Started'), ': Basic examples and tutorials'),
          React.createElement('li', { key: 's2' }, React.createElement('strong', null, 'API Reference'), ': Complete hook and component documentation'),
          React.createElement('li', { key: 's3' }, React.createElement('strong', null, 'Styled Components'), ': Advanced styling patterns')
        ])
      ])
    ]);
  },
  name: 'Welcome to Dim',
};