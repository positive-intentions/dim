import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { renderAvatar } from "./renderAvatar.js";

const TABS = [
  { id: 0, label: "Chats", icon: "💬" },
  { id: 1, label: "Calls", icon: "📞" },
  { id: 5, label: "Profile", icon: "👤" },
];

const AppChrome = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const {
    activeTab = 0,
    user = {},
    appTitle = "Enkrypted Chat",
    onTabChange,
    children = "",
  } = data;

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .app-chrome {
      display: flex;
      height: 100vh;
      min-height: 600px;
      background: var(--app-bg);
      overflow: hidden;
    }

    .sidebar {
      width: var(--app-sidebar-width);
      background: var(--app-surface);
      border-right: 1px solid var(--app-border);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0;
      flex-shrink: 0;
    }

    .sidebar-logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .sidebar-tab {
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 12px;
      background: transparent;
      cursor: pointer;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      transition: background 0.15s;
    }

    .sidebar-tab:hover {
      background: #f5f5f5;
    }

    .sidebar-tab.active {
      background: var(--app-primary-light);
    }

    .main-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      position: relative;
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      background: var(--app-surface);
      border-bottom: 1px solid var(--app-border);
      flex-shrink: 0;
    }

    .app-header-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .header-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .bottom-nav {
      display: none;
      background: var(--app-surface);
      border-top: 1px solid var(--app-border);
      padding: 0.375rem 0 calc(0.375rem + env(safe-area-inset-bottom, 0));
      flex-shrink: 0;
    }

    .bottom-nav-inner {
      display: flex;
      justify-content: space-around;
    }

    .bottom-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
      background: none;
      border: none;
      padding: 0.375rem;
      cursor: pointer;
      font-size: 0.6875rem;
      color: var(--app-text-secondary);
    }

    .bottom-tab.active {
      color: var(--app-primary);
      font-weight: 600;
    }

    .bottom-tab-icon {
      font-size: 1.25rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }

      .bottom-nav {
        display: block;
      }
    }
  `);

  const renderTabButton = (tab, className) => html`
    <button
      class="${className} ${activeTab === tab.id ? "active" : ""}"
      @click="${() => onTabChange?.(tab.id)}"
      title="${tab.label}"
    >
      ${className.includes("bottom")
        ? html`
            <span class="bottom-tab-icon">${tab.icon}</span>
            <span>${tab.label}</span>
          `
        : tab.icon}
    </button>
  `;

  return html`
    <div class="app-chrome">
      <nav class="sidebar">
        ${renderAvatar(html, {
          emoji: "💬",
          className: "sidebar-logo emoji-avatar",
          label: appTitle,
        })}
        ${TABS.map((tab) => renderTabButton(tab, "sidebar-tab"))}
      </nav>

      <div class="main-column">
        <header class="app-header">
          <h1 class="app-header-title">${appTitle}</h1>
          <div class="header-user">
            <span>${user.name}</span>
            ${renderAvatar(html, {
              emoji: user.avatarEmoji,
              className: "avatar avatar-sm",
              label: user.name,
            })}
          </div>
        </header>

        <div class="content-area">
          ${children}
        </div>

        <nav class="bottom-nav">
          <div class="bottom-nav-inner">
            ${TABS.map((tab) => renderTabButton(tab, "bottom-tab"))}
          </div>
        </nav>
      </div>
    </div>
  `;
};

define({ tag: "app-chrome", component: AppChrome });
export default AppChrome;
