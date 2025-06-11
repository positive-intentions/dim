// Re-export main lit functionality
export { LitElement } from './lit-element/lit-element.ts';
export { html, render, svg, noChange, nothing } from './lit-html/lit-html.ts';
export { css, unsafeCSS } from '../../core/mini-lit.js'; // Keep using your existing CSS implementation