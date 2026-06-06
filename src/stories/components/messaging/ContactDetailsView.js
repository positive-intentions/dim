import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";

const ContactDetailsView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const { contact, onBack, onMessage } = data;

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .contact-details {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .details-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--app-border);
    }

    .back-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
    }

    .details-title {
      font-weight: 600;
      font-size: 1rem;
    }

    .details-hero {
      text-align: center;
      padding: 2rem 1.5rem;
    }

    .details-name {
      margin: 1rem 0 0.25rem;
      font-size: 1.375rem;
      font-weight: 600;
    }

    .details-status {
      color: var(--app-text-secondary);
      font-size: 0.875rem;
    }

    .action-row {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      padding: 1rem;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.75rem;
      color: var(--app-text-secondary);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--app-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .info-section {
      padding: 0.5rem 0;
    }

    .info-row {
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--app-text-secondary);
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-size: 0.9375rem;
    }
  `);

  if (!contact) {
    return html`<div class="contact-details">Contact not found</div>`;
  }

  const keys = sharedKeys(contact.id);
  const statusText = contact.isOnline
    ? "Online"
    : contact.isGroup
      ? `${contact.members || 0} members`
      : contact.lastSeen || "Offline";

  return html`
    <div class="contact-details">
      <header class="details-header">
        <button class="back-btn" @click="${() => onBack?.()}" aria-label="Back">
          ←
        </button>
        <span class="details-title">Contact info</span>
      </header>

      <div class="details-hero">
        <img
          class="avatar avatar-lg"
          src="${contact.avatar}"
          alt="${contact.name}"
          style="margin: 0 auto;"
          data-vt-shared="${keys.avatar}"
        />
        <h2 class="details-name" data-vt-shared="${keys.name}">${contact.name}</h2>
        <p class="details-status" data-vt-shared="${keys.status}">${statusText}</p>
      </div>

      <div class="action-row">
        <button class="action-btn" @click="${() => onMessage?.(contact.id)}">
          <span class="action-icon">💬</span>
          Message
        </button>
        <button class="action-btn">
          <span class="action-icon">📞</span>
          Call
        </button>
        <button class="action-btn">
          <span class="action-icon">📹</span>
          Video
        </button>
      </div>

      <div class="info-section">
        ${contact.phoneNumber
          ? html`
              <div class="info-row">
                <div class="info-label">Phone</div>
                <div class="info-value">${contact.phoneNumber}</div>
              </div>
            `
          : ""}
        ${contact.email
          ? html`
              <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">${contact.email}</div>
              </div>
            `
          : ""}
      </div>
    </div>
  `;
};

define({ tag: "contact-details-view", component: ContactDetailsView });
export default ContactDetailsView;
