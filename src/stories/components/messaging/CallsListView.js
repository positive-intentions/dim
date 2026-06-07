import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";
import { renderAvatar } from "./renderAvatar.js";

const callTypeIcon = (call) => {
  if (call.type === "missed") return "📵";
  if (call.callType === "video") return "📹";
  return "📞";
};

const callTypeLabel = (call) => {
  if (call.type === "missed") return "Missed";
  if (call.type === "incoming") return "Incoming";
  return "Outgoing";
};

const CallsListView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const { calls = [], onCallClick } = data;

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .calls-list {
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
      display: flex;
      flex-direction: column;
    }

    .calls-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
    }

    .calls-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .calls-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
    }

    .calls-items {
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      overflow-y: auto;
    }

    .call-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
      cursor: pointer;
      transition: background 0.15s;
    }

    .call-row:hover {
      background: #fafafa;
    }

    .call-row.missed .call-name {
      color: #d32f2f;
    }

    .call-body {
      flex: 1;
      min-width: 0;
    }

    .call-name {
      font-weight: 600;
      font-size: 0.9375rem;
    }

    .call-meta {
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
      margin-top: 0.125rem;
    }

    .call-side {
      text-align: right;
      flex-shrink: 0;
    }

    .call-time {
      font-size: 0.75rem;
      color: var(--app-text-secondary);
    }

    .call-duration {
      font-size: 0.75rem;
      color: var(--app-text-secondary);
      margin-top: 0.125rem;
    }

    .call-icon {
      font-size: 1rem;
    }
  `);

  return html`
    <div class="calls-list">
      <div class="calls-header">
        <h2 class="calls-title">Calls</h2>
        <p class="calls-subtitle">Recent call history</p>
      </div>
      <ul class="calls-items">
        ${calls.map((call) => {
          const keys = sharedKeys(call.contactId);
          return html`
            <li
              class="call-row ${call.type}"
              @click="${() => onCallClick?.(call.contactId)}"
            >
              ${renderAvatar(html, {
                emoji: call.avatarEmoji,
                vtShared: keys.avatar,
                label: call.name,
              })}
              <div class="call-body">
                <div class="call-name" data-vt-shared="${keys.name}">${call.name}</div>
                <div class="call-meta">
                  <span class="call-icon">${callTypeIcon(call)}</span>
                  ${callTypeLabel(call)}
                  ${call.callType === "video" ? " · Video" : " · Voice"}
                </div>
              </div>
              <div class="call-side">
                <div class="call-time">${call.timestamp}</div>
                ${call.duration
                  ? html`<div class="call-duration">${call.duration}</div>`
                  : ""}
              </div>
            </li>
          `;
        })}
      </ul>
    </div>
  `;
};

define({ tag: "calls-list-view", component: CallsListView });
export default CallsListView;
