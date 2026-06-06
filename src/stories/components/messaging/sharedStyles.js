import { css } from "../../../core/dim.ts";

export const appVariables = css`
  :host {
    --app-primary: #1976d2;
    --app-primary-light: #e3f2fd;
    --app-bg: #f5f5f5;
    --app-surface: #ffffff;
    --app-text: #212121;
    --app-text-secondary: #757575;
    --app-border: #e0e0e0;
    --app-online: #4caf50;
    --app-sent: #1976d2;
    --app-received: #ffffff;
    --app-sidebar-width: 72px;
    --app-radius: 12px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: var(--app-text);
  }
`;

export const avatarStyles = css`
  .avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--app-primary-light);
    display: block;
  }

  .avatar.avatar-sm {
    width: 32px;
    height: 32px;
  }

  .avatar.avatar-lg {
    width: 56px;
    height: 56px;
  }

  .avatar.emoji-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--app-primary-light);
  }

  .online-dot {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--app-online);
    border: 2px solid var(--app-surface);
  }
`;
