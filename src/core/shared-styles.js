import { css } from './mini-lit';

// Shared button styles with custom properties
export const buttonStyles = css`
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
`;

// Shared card styles
export const cardStyles = css`
  .card {
    background: var(--card-bg, white);
    border: 1px solid var(--card-border, #ddd);
    border-radius: var(--card-radius, 8px);
    padding: var(--card-padding, 16px);
    box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.1));
  }
`;

// Shared form styles
export const formStyles = css`
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
`;

// Typography styles
export const typographyStyles = css`
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
`;

// Layout utilities
export const layoutStyles = css`
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
`;