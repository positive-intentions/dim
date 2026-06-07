import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { renderAvatar } from "./renderAvatar.js";

const ContactsDrawer = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const { open, contacts = [], onClose, onSelect } = data;
  const [search, setSearch] = useState("");

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .drawer-root {
      position: fixed;
      inset: 0;
      z-index: 100;
      pointer-events: none;
    }

    .drawer-root.open {
      pointer-events: auto;
    }

    .drawer-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .drawer-root.open .drawer-backdrop {
      opacity: 1;
    }

    .drawer-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(360px, 90vw);
      background: var(--app-surface);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    .drawer-root.open .drawer-panel {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
    }

    .drawer-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
    }

    .drawer-search {
      padding: 0.75rem 1.25rem;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      font-size: 0.875rem;
      box-sizing: border-box;
    }

    .contacts-list {
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      overflow-y: auto;
    }

    .contact-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    .contact-row:hover {
      background: #fafafa;
    }

    .contact-name {
      font-weight: 500;
      font-size: 0.9375rem;
    }

    .contact-sub {
      font-size: 0.75rem;
      color: var(--app-text-secondary);
      margin-top: 0.125rem;
    }
  `);

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phoneNumber || "").includes(q)
    );
  });

  return html`
    <div class="drawer-root ${open ? "open" : ""}">
      <div class="drawer-backdrop" @click="${() => onClose?.()}"></div>
      <aside class="drawer-panel">
        <div class="drawer-header">
          <h2 class="drawer-title">Contacts</h2>
          <button class="close-btn" @click="${() => onClose?.()}" aria-label="Close">
            ✕
          </button>
        </div>
        <div class="drawer-search">
          <input
            class="search-input"
            type="search"
            placeholder="Search contacts..."
            .value="${search}"
            @input="${(e) => setSearch(e.target.value)}"
          />
        </div>
        <ul class="contacts-list">
          ${filtered.map(
            (contact) => html`
              <li
                class="contact-row"
                @click="${() => onSelect?.(contact.id)}"
              >
                <div class="avatar-wrap">
                  ${renderAvatar(html, {
                    emoji: contact.avatarEmoji,
                    label: contact.name,
                  })}
                  ${contact.isOnline
                    ? html`<span class="online-dot"></span>`
                    : ""}
                </div>
                <div>
                  <div class="contact-name">${contact.name}</div>
                  <div class="contact-sub">
                    ${contact.isOnline
                      ? "Online"
                      : contact.lastSeen || contact.email || contact.phoneNumber || ""}
                  </div>
                </div>
              </li>
            `
          )}
        </ul>
      </aside>
    </div>
  `;
};

define({ tag: "contacts-drawer", component: ContactsDrawer });
export default ContactsDrawer;
