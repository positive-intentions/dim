import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";
import { renderAvatar } from "./renderAvatar.js";

const ChatView = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    conversation,
    messages = [],
    onBack,
    onAvatarClick,
  } = data;

  const [draft, setDraft] = useState("");

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .chat-view {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      min-height: 0;
      background: var(--app-bg);
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
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

    .header-info {
      flex: 1;
      min-width: 0;
    }

    .header-name {
      font-weight: 600;
      font-size: 1rem;
    }

    .header-status {
      font-size: 0.75rem;
      color: var(--app-text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 0.25rem;
    }

    .icon-btn {
      background: none;
      border: none;
      font-size: 1.125rem;
      cursor: pointer;
      padding: 0.375rem;
      border-radius: 50%;
    }

    .icon-btn:hover {
      background: #f0f0f0;
    }

    .messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      -webkit-overflow-scrolling: touch;
    }

    .message-row {
      display: flex;
      gap: 0.5rem;
      max-width: 85%;
    }

    .message-row.sent {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-row.received {
      align-self: flex-start;
    }

    .bubble {
      padding: 0.625rem 0.875rem;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.4;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }

    .message-row.sent .bubble {
      background: var(--app-sent);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-row.received .bubble {
      background: var(--app-received);
      color: var(--app-text);
      border-bottom-left-radius: 4px;
    }

    .msg-meta {
      font-size: 0.6875rem;
      color: var(--app-text-secondary);
      margin-top: 0.25rem;
    }

    .message-row.sent .msg-meta {
      text-align: right;
    }

    .input-bar {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
      background: var(--app-surface);
      border-top: 1px solid var(--app-border);
      flex-shrink: 0;
      margin-top: auto;
    }

    .msg-input {
      flex: 1;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--app-border);
      border-radius: 24px;
      font-size: 0.875rem;
      outline: none;
    }

    .send-btn {
      background: var(--app-primary);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .header-avatar-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `);

  if (!conversation) {
    return html`<div class="chat-view">No conversation selected</div>`;
  }

  const keys = sharedKeys(conversation.id);
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const headerStatus = conversation.isOnline
    ? "Online"
    : conversation.isGroup
      ? `${conversation.members || 0} members`
      : "Offline";

  const renderHeaderAvatar = () =>
    renderAvatar(html, {
      emoji: conversation.avatarEmoji,
      className: "avatar avatar-sm",
      vtShared: keys.avatar,
      label: conversation.name,
    });

  return html`
    <div class="chat-view">
      <header class="chat-header">
        <button class="back-btn" @click="${() => onBack?.()}" aria-label="Back">
          ←
        </button>
        <button
          class="header-avatar-btn"
          @click="${() => onAvatarClick?.(conversation.id)}"
        >
          <div class="avatar-wrap">
            ${renderHeaderAvatar()}
            ${conversation.isOnline
              ? html`<span class="online-dot" data-vt-shared="${keys.online}"></span>`
              : ""}
          </div>
        </button>
        <div class="header-info">
          <div class="header-name" data-vt-shared="${keys.name}">${conversation.name}</div>
          <div class="header-status" data-vt-shared="${keys.status}">${headerStatus}</div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="Video call">📹</button>
          <button class="icon-btn" title="Voice call">📞</button>
          <button class="icon-btn" title="More">⋮</button>
        </div>
      </header>

      <div class="messages">
        ${messages.map(
          (msg, index) => {
            const isLast = index === messages.length - 1;
            return html`
            <div class="message-row ${msg.type}">
              ${msg.type === "received"
                ? renderAvatar(html, {
                    emoji: msg.avatarEmoji,
                    className: "avatar avatar-sm",
                    label: msg.username,
                  })
                : ""}
              <div>
                ${isLast
                  ? html`
                      <div class="bubble" data-vt-shared="${keys.lastMessage}">
                        ${msg.message}
                      </div>
                      <div class="msg-meta" data-vt-shared="${keys.timestamp}">
                        ${msg.timestamp}
                      </div>
                    `
                  : html`
                      <div class="bubble">${msg.message}</div>
                      <div class="msg-meta">${msg.timestamp}</div>
                    `}
              </div>
            </div>
          `;
          }
        )}
      </div>

      <div class="input-bar">
        <input
          class="msg-input"
          type="text"
          placeholder="Type a message..."
          .value="${draft}"
          @input="${(e) => setDraft(e.target.value)}"
        />
        <button class="send-btn" title="Send">➤</button>
      </div>
    </div>
  `;
};

define({ tag: "chat-view", component: ChatView });
export default ChatView;
