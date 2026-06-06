import React from "react";
import "./components/messaging/MessagingAppDemo.js";

export default {
  title: "Demo/Messaging App",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Messaging App Demo

A navigable messaging app UI built with the Dim framework, modeled after glitr-chat.
All data is hardcoded — no real messaging, P2P, or backend.

## Features

- **Conversation list** with search and filters
- **Chat view** with exhaustive shared-element transitions
- **Contacts drawer** for starting new conversations
- **Calls** and **Profile** tabs
- **Contact details** overlay from chat header

## Page transitions

Uses Dim's automatic \`transitionId\` prop on \`navigation-view\` for page slides (right = forward, left = back).

## Shared-element transitions (\`data-vt-shared\`)

Per-conversation keys via \`sharedKeys(id)\`:

| Key | List row | Chat | Calls row | Contact details |
|-----|----------|------|-----------|-----------------|
| \`avatar-{id}\` | Row avatar | Header avatar | Call avatar | Hero avatar |
| \`name-{id}\` | Row name | Header name | Call name | Hero name |
| \`lastMessage-{id}\` | Preview text | Last bubble | — | — |
| \`timestamp-{id}\` | Row time | Last bubble time | — | — |
| \`online-{id}\` | Online dot | Header dot | — | — |
| \`status-{id}\` | — | Header status | — | Hero status |

### Routes with shared morphs

- **Chat list → Chat**: avatar, name, lastMessage, timestamp, online
- **Calls → Chat**: avatar, name
- **Chat → Contact details**: avatar, name, status
- **Back navigation**: reverse FLIP on all of the above

Contacts drawer opens outside \`navigation-view\`, so drawer row → chat does not FLIP (list → chat transition runs instead).
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const LiveDemo = {
  render: () => React.createElement("messaging-app-demo"),
  name: "Live Demo",
  parameters: {
    docs: {
      description: {
        story: `
Click a conversation to open the chat — watch the avatar, name, preview message, and timestamp morph into the header and last bubble.
Use the Calls tab or contact details for additional shared transitions. Use the pencil button for contacts.
        `,
      },
    },
  },
};
