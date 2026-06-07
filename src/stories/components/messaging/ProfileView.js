import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { renderAvatar } from "./renderAvatar.js";

const ProfileView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const { user = {} } = data;

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .profile-view {
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
      overflow-y: auto;
    }

    .profile-hero {
      text-align: center;
      padding: 2rem 1.5rem 1.5rem;
      background: linear-gradient(180deg, var(--app-primary-light) 0%, var(--app-surface) 100%);
    }

    .profile-name {
      margin: 1rem 0 0.25rem;
      font-size: 1.375rem;
      font-weight: 600;
    }

    .profile-status {
      color: var(--app-text-secondary);
      font-size: 0.875rem;
    }

    .settings-section {
      padding: 0.5rem 0;
    }

    .section-title {
      padding: 0.75rem 1.25rem 0.375rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--app-text-secondary);
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
      font-size: 0.9375rem;
    }

    .setting-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .setting-value {
      color: var(--app-text-secondary);
      font-size: 0.875rem;
    }

    .toggle {
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: var(--app-primary);
      position: relative;
    }

    .toggle::after {
      content: "";
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
    }

    .toggle.off {
      background: #bdbdbd;
    }

    .toggle.off::after {
      right: auto;
      left: 2px;
    }

    .logout-btn {
      display: block;
      width: calc(100% - 2.5rem);
      margin: 1.5rem auto;
      padding: 0.75rem;
      border: 1px solid #ef5350;
      border-radius: 8px;
      background: transparent;
      color: #ef5350;
      font-weight: 600;
      cursor: pointer;
    }
  `);

  return html`
    <div class="profile-view">
      <div class="profile-hero">
        ${renderAvatar(html, {
          emoji: user.avatarEmoji,
          className: "avatar avatar-lg",
          label: user.name,
          style: "margin: 0 auto;",
        })}
        <h2 class="profile-name">${user.name}</h2>
        <p class="profile-status">${user.status || "Available"}</p>
      </div>

      <div class="settings-section">
        <div class="section-title">Account</div>
        <div class="setting-row">
          <span class="setting-label">📧 Email</span>
          <span class="setting-value">${user.email}</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">📱 Phone</span>
          <span class="setting-value">${user.phone}</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">Preferences</div>
        <div class="setting-row">
          <span class="setting-label">🔔 Notifications</span>
          <span class="toggle"></span>
        </div>
        <div class="setting-row">
          <span class="setting-label">🌙 Dark mode</span>
          <span class="toggle off"></span>
        </div>
        <div class="setting-row">
          <span class="setting-label">🔒 Read receipts</span>
          <span class="toggle"></span>
        </div>
      </div>

      <button class="logout-btn">Sign out</button>
    </div>
  `;
};

define({ tag: "profile-view", component: ProfileView });
export default ProfileView;
