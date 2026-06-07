import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";
import { renderAvatar } from "./renderAvatar.js";

const ConversationListView = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    conversations = [],
    onConversationClick,
    onOpenContacts,
  } = data;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .conversation-list {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .list-header {
      padding: 1rem 1.25rem 0.5rem;
    }

    .list-title {
      margin: 0 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .search-box {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      font-size: 0.875rem;
      box-sizing: border-box;
      margin-bottom: 0.75rem;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }

    .filter-chip {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      border: 1px solid var(--app-border);
      background: transparent;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--app-text-secondary);
    }

    .filter-chip.active {
      background: var(--app-primary-light);
      border-color: var(--app-primary);
      color: var(--app-primary);
      font-weight: 600;
    }

    .conversations {
      flex: 1;
      overflow-y: auto;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .conv-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      border-bottom: 1px solid var(--app-border);
      transition: background 0.15s;
    }

    .conv-row:hover {
      background: #fafafa;
    }

    .conv-body {
      flex: 1;
      min-width: 0;
    }

    .conv-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
    }

    .conv-name {
      font-weight: 600;
      font-size: 0.9375rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conv-time {
      font-size: 0.75rem;
      color: var(--app-text-secondary);
      flex-shrink: 0;
    }

    .conv-preview {
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 0.125rem;
    }

    .conv-preview-text {
      display: inline;
    }

    .unread-badge {
      background: var(--app-primary);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      flex-shrink: 0;
    }

    .fab {
      position: absolute;
      bottom: 1.5rem;
      right: 1.5rem;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--app-primary);
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .list-wrap {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `);

  const filtered = conversations.filter((c) => {
    if (filter === "groups" && !c.isGroup) return false;
    if (filter === "direct" && c.isGroup) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderConvAvatar = (conv) => {
    const keys = sharedKeys(conv.id);
    return renderAvatar(html, {
      emoji: conv.avatarEmoji,
      vtShared: keys.avatar,
      label: conv.name,
    });
  };

  return html`
    <div class="conversation-list">
      <div class="list-header">
        <h2 class="list-title">Messages</h2>
        <input
          class="search-box"
          type="search"
          placeholder="Search conversations..."
          .value="${search}"
          @input="${(e) => setSearch(e.target.value)}"
        />
        <div class="filters">
          ${["all", "groups", "direct"].map(
            (f) => html`
              <button
                class="filter-chip ${filter === f ? "active" : ""}"
                @click="${() => setFilter(f)}"
              >
                ${f === "all" ? "All" : f === "groups" ? "Groups" : "Direct"}
              </button>
            `
          )}
        </div>
      </div>

      <div class="list-wrap">
        <ul class="conversations">
          ${filtered.map(
            (conv) => {
              const keys = sharedKeys(conv.id);
              return html`
              <li
                class="conv-row"
                @click="${() => onConversationClick?.(conv.id)}"
              >
                <div class="avatar-wrap">
                  ${renderConvAvatar(conv)}
                  ${conv.isOnline
                    ? html`<span class="online-dot" data-vt-shared="${keys.online}"></span>`
                    : ""}
                </div>
                <div class="conv-body">
                  <div class="conv-top">
                    <span class="conv-name" data-vt-shared="${keys.name}">${conv.name}</span>
                    <span class="conv-time" data-vt-shared="${keys.timestamp}">${conv.timestamp}</span>
                  </div>
                  <div class="conv-preview">
                    ${conv.isGroup && conv.lastMessageSender
                      ? html`<strong>${conv.lastMessageSender}: </strong>`
                      : ""}
                    <span class="conv-preview-text" data-vt-shared="${keys.lastMessage}">${conv.lastMessage}</span>
                  </div>
                </div>
                ${conv.unreadCount > 0
                  ? html`<span class="unread-badge">${conv.unreadCount}</span>`
                  : ""}
              </li>
            `;
            }
          )}
        </ul>
        <button class="fab" title="New message" @click="${() => onOpenContacts?.()}">
          ✏️
        </button>
      </div>
    </div>
  `;
};

define({ tag: "conversation-list-view", component: ConversationListView });
export default ConversationListView;
