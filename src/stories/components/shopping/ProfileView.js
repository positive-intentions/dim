import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";

const ProfileView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const {
    user = {},
    theme = "light",
    setTheme = () => {},
    cart = [],
    setCart = () => {},
  } = data;

  useStyle(css`
    ${appVariables}

    .profile-view {
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
      overflow-y: auto;
    }

    .profile-hero {
      text-align: center;
      padding: 2rem 1.5rem 1.5rem;
      background: linear-gradient(
        180deg,
        var(--app-primary-light) 0%,
        var(--app-surface) 100%
      );
    }

    .profile-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--app-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto;
    }

    .profile-name {
      margin: 1rem 0 0.25rem;
      font-size: 1.375rem;
      font-weight: 600;
    }

    .profile-email {
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

    .setting-btn {
      background: var(--app-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .danger-btn {
      background: var(--app-danger);
    }
  `);

  const itemCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return html`
    <div class="profile-view" data-theme="${theme}">
      <div class="profile-hero">
        <div class="profile-avatar">👤</div>
        <h2 class="profile-name">${user.name || "Guest"}</h2>
        <p class="profile-email">${user.email || ""}</p>
      </div>
      <div class="settings-section">
        <div class="section-title">Preferences</div>
        <div class="setting-row">
          <span>Theme</span>
          <button
            class="setting-btn"
            @click="${() => setTheme(theme === "light" ? "dark" : "light")}"
          >
            ${theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
        <div class="setting-row">
          <span>Currency</span>
          <span>${user.preferences?.currency || "USD"}</span>
        </div>
      </div>
      <div class="settings-section">
        <div class="section-title">Cart</div>
        <div class="setting-row">
          <span>Items in cart</span>
          <span>${itemCount}</span>
        </div>
        ${itemCount > 0
          ? html`
              <div class="setting-row">
                <span>Clear cart</span>
                <button
                  class="setting-btn danger-btn"
                  @click="${() => setCart([])}"
                >
                  Clear
                </button>
              </div>
            `
          : ""}
      </div>
    </div>
  `;
};

define({ tag: "shopping-profile-view", component: ProfileView });
export default ProfileView;
