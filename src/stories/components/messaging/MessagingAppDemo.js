import { define, html, css, useState, useStyle, useStore } from "../../../core/dim.ts";
import { appVariables, avatarStyles } from "./sharedStyles.js";
import { MOCK_USER, MOCK_CONTACTS } from "./mockData.js";
import { renderAvatar } from "./renderAvatar.js";
import "./NavigationView.js";
import "./ContactsDrawer.js";

const TABS = [
  { id: 0, label: "Chats", icon: "💬" },
  { id: 1, label: "Calls", icon: "📞" },
  { id: 5, label: "Profile", icon: "👤" },
];

// Numeric transition IDs so Dim's auto-direction picks the correct slide axis.
// Higher value = forward (slide in from right); lower = back (slide in from left).
const TAB_VIEW_IDS = { 0: 10, 1: 11, 5: 15 };

const idToOffset = (id, base) => {
  const num = parseInt(id, 10);
  if (!isNaN(num)) return base + num;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 50;
  }
  return base + 50 + hash;
};

const computeViewId = (activeTab, navStack) => {
  const top = navStack[navStack.length - 1] || "list";
  if (top.startsWith("contact:")) {
    return String(idToOffset(top.split(":")[1], 300));
  }
  if (top.startsWith("chat:")) {
    return String(idToOffset(top.split(":")[1], 200));
  }
  return String(TAB_VIEW_IDS[activeTab] ?? 10);
};

const MessagingAppDemo = (props, { useState, useStyle, useStore, html, css }) => {
  const store = useStore({
    activeTab: useState(0),
    navStack: useState(["list"]),
    contactsOpen: useState(false),
  });

  const [activeTab, setActiveTab] = store.activeTab;
  const [navStack, setNavStack] = store.navStack;
  const [contactsOpen, setContactsOpen] = store.contactsOpen;

  const viewId = computeViewId(activeTab, navStack);
  const isChatOpen = navStack.some((entry) => entry.startsWith("chat:"));

  useStyle(css`
    ${appVariables}
    ${avatarStyles}

    .messaging-app {
      display: flex;
      height: 100vh;
      min-height: 600px;
      background: var(--app-bg);
      overflow: hidden;
      position: relative;
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
      min-height: 0;
      position: relative;
    }

    .main-column.chat-open .app-header,
    .main-column.chat-open .bottom-nav {
      display: none;
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
      padding: 0.375rem 0;
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setNavStack(["list"]);
  };

  const openChat = (id) => {
    setNavStack(["list", `chat:${id}`]);
  };

  const goBack = () => {
    if (navStack.length > 1) {
      setNavStack(navStack.slice(0, -1));
    } else {
      setNavStack(["list"]);
    }
  };

  const openContactDetails = (id) => {
    setNavStack([...navStack, `contact:${id}`]);
  };

  const handleContactBack = () => {
    goBack();
  };

  const handleContactMessage = (id) => {
    setNavStack(["list", `chat:${id}`]);
  };

  const handleContactSelect = (id) => {
    setContactsOpen(false);
    openChat(id);
  };

  const navProps = {
    activeTab,
    navStack,
    onConversationClick: openChat,
    onBack: goBack,
    onAvatarClick: openContactDetails,
    onOpenContacts: () => setContactsOpen(true),
    onCallClick: openChat,
    onContactMessage: handleContactMessage,
    onContactBack: handleContactBack,
  };

  const renderTabButton = (tab, className) => html`
    <button
      class="${className} ${activeTab === tab.id ? "active" : ""}"
      @click="${() => handleTabChange(tab.id)}"
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
    <div class="messaging-app">
      <nav class="sidebar">
        ${renderAvatar(html, {
          emoji: "💬",
          className: "sidebar-logo emoji-avatar",
          label: "Enkrypted Chat",
        })}
        ${TABS.map((tab) => renderTabButton(tab, "sidebar-tab"))}
      </nav>

      <div class="main-column ${isChatOpen ? "chat-open" : ""}">
        <header class="app-header">
          <h1 class="app-header-title">Enkrypted Chat</h1>
          <div class="header-user">
            <span>${MOCK_USER.name}</span>
            ${renderAvatar(html, {
              emoji: MOCK_USER.avatarEmoji,
              className: "avatar avatar-sm",
              label: MOCK_USER.name,
            })}
          </div>
        </header>

        <div class="content-area">
          <navigation-view
            transitionId="${viewId}"
            transitionDuration="450"
            .props="${navProps}"
          ></navigation-view>
        </div>

        <nav class="bottom-nav">
          <div class="bottom-nav-inner">
            ${TABS.map((tab) => renderTabButton(tab, "bottom-tab"))}
          </div>
        </nav>
      </div>

      <contacts-drawer
        .props="${{
          open: contactsOpen,
          contacts: MOCK_CONTACTS,
          onClose: () => setContactsOpen(false),
          onSelect: handleContactSelect,
        }}"
      ></contacts-drawer>
    </div>
  `;
};

define({ tag: "messaging-app-demo", component: MessagingAppDemo });
export default MessagingAppDemo;
