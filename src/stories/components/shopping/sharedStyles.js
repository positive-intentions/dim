import { css } from "../../../core/dim.ts";

export const appVariables = css`
  :host {
    --app-primary: #029cfd;
    --app-primary-light: #e3f2fd;
    --app-bg: #f5f5f5;
    --app-surface: #ffffff;
    --app-text: #212121;
    --app-text-secondary: #757575;
    --app-border: #e0e0e0;
    --app-success: #28a745;
    --app-danger: #dc3545;
    --app-sidebar-width: 72px;
    --app-radius: 12px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: var(--app-text);
  }

  :host([data-theme="dark"]) {
    --app-bg: #1a1a1a;
    --app-surface: #2a2a2a;
    --app-text: #f5f5f5;
    --app-text-secondary: #aaa;
    --app-border: #404040;
    --app-primary-light: #1a3a5c;
  }
`;

export const productImageStyles = css`
  .product-image {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-primary-light);
    border-radius: var(--app-radius);
    flex-shrink: 0;
  }

  .product-image.sm {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .product-image.md {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .product-image.lg {
    width: 160px;
    height: 160px;
    font-size: 5rem;
  }

  .product-image.hero {
    width: 100%;
    max-width: 320px;
    height: 240px;
    font-size: 6rem;
    margin: 0 auto;
  }
`;

export const viewHeaderStyles = css`
  .view-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    background: var(--app-surface);
    border-bottom: 1px solid var(--app-border);
    flex-shrink: 0;
  }

  .back-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
    color: var(--app-text);
    line-height: 1;
  }

  .view-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }
`;
