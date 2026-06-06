export const avatarUrl = (seed) => `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;

export const MOCK_USER = {
  id: "me",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 555 010 2000",
  avatar: avatarUrl("alex-morgan"),
  status: "Available",
};

export const MOCK_CONVERSATIONS = [
  {
    id: "lenny-ai",
    name: "Lenny",
    lastMessage: "Hello! I'm here to help.",
    lastMessageSender: "Lenny",
    timestamp: "now",
    unreadCount: 0,
    avatar: avatarUrl("lenny-ai"),
    avatarEmoji: "🤖",
    isOnline: true,
    isGroup: false,
    isPinned: true,
    isMuted: false,
    type: "active",
  },
  {
    id: "1",
    name: "Design Team",
    lastMessage: "The new mockups look amazing! 🎨",
    lastMessageSender: "Alice",
    timestamp: "2 min ago",
    unreadCount: 3,
    avatar: avatarUrl("design-team"),
    isOnline: true,
    isGroup: true,
    isPinned: true,
    isMuted: false,
    members: 8,
    type: "active",
  },
  {
    id: "2",
    name: "Alice Johnson",
    lastMessage: "Can we schedule the meeting for tomorrow?",
    lastMessageSender: "Alice",
    timestamp: "15 min ago",
    unreadCount: 1,
    avatar: avatarUrl("alice-johnson"),
    isOnline: true,
    isGroup: false,
    isPinned: false,
    isMuted: false,
    type: "active",
  },
  {
    id: "3",
    name: "Project Alpha",
    lastMessage: "Documentation has been updated",
    lastMessageSender: "Bob",
    timestamp: "1 hour ago",
    unreadCount: 0,
    avatar: avatarUrl("project-alpha"),
    isOnline: false,
    isGroup: true,
    isPinned: true,
    isMuted: true,
    members: 12,
    type: "active",
  },
  {
    id: "4",
    name: "Bob Designer",
    lastMessage: "Thanks for the feedback! 👍",
    lastMessageSender: "Bob",
    timestamp: "3 hours ago",
    unreadCount: 0,
    avatar: avatarUrl("bob-designer"),
    isOnline: false,
    isGroup: false,
    isPinned: false,
    isMuted: false,
    type: "active",
  },
  {
    id: "5",
    name: "Charlie Smith",
    lastMessage: "I'll send the files by EOD.",
    lastMessageSender: "Charlie",
    timestamp: "5 hours ago",
    unreadCount: 2,
    avatar: avatarUrl("charlie-smith"),
    isOnline: false,
    isGroup: false,
    isPinned: false,
    isMuted: false,
    type: "active",
  },
  {
    id: "6",
    name: "Marketing Team",
    lastMessage: "Campaign launch is tomorrow 🚀",
    lastMessageSender: "Dana",
    timestamp: "Yesterday",
    unreadCount: 0,
    avatar: avatarUrl("marketing-team"),
    isOnline: true,
    isGroup: true,
    isPinned: false,
    isMuted: false,
    members: 6,
    type: "active",
  },
];

export const MOCK_CONTACTS = [
  {
    id: "1",
    name: "Alice Johnson",
    phoneNumber: "+1 234 567 8901",
    email: "alice@example.com",
    avatar: avatarUrl("alice-johnson"),
    isOnline: true,
    isFavorite: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    avatar: avatarUrl("bob-smith"),
    isRecent: true,
  },
  {
    id: "3",
    name: "Charlie Brown",
    phoneNumber: "+1 234 567 8903",
    avatar: avatarUrl("charlie-brown"),
    isFavorite: true,
  },
  {
    id: "4",
    name: "Diana Ross",
    phoneNumber: "+1 234 567 8904",
    email: "diana@example.com",
    avatar: avatarUrl("diana-ross"),
    isOnline: true,
    isRecent: true,
  },
  {
    id: "5",
    name: "Edward Norton",
    phoneNumber: "+1 234 567 8905",
    avatar: avatarUrl("edward-norton"),
    lastSeen: "Yesterday",
  },
  {
    id: "6",
    name: "Fiona Apple",
    email: "fiona@example.com",
    avatar: avatarUrl("fiona-apple"),
    isOnline: true,
  },
  {
    id: "7",
    name: "George Michael",
    phoneNumber: "+1 234 567 8907",
    avatar: avatarUrl("george-michael"),
    isRecent: true,
  },
  {
    id: "8",
    name: "Helen Hunt",
    phoneNumber: "+1 234 567 8908",
    avatar: avatarUrl("helen-hunt"),
  },
];

export const MOCK_CALLS = [
  {
    id: "c1",
    contactId: "2",
    name: "Alice Johnson",
    avatar: avatarUrl("alice-johnson"),
    type: "incoming",
    callType: "video",
    timestamp: "10:32 AM",
    duration: "12:45",
  },
  {
    id: "c2",
    contactId: "4",
    name: "Bob Designer",
    avatar: avatarUrl("bob-designer"),
    type: "outgoing",
    callType: "voice",
    timestamp: "Yesterday",
    duration: "3:21",
  },
  {
    id: "c3",
    contactId: "5",
    name: "Charlie Smith",
    avatar: avatarUrl("charlie-smith"),
    type: "missed",
    callType: "voice",
    timestamp: "Yesterday",
    duration: null,
  },
  {
    id: "c4",
    contactId: "4",
    name: "Diana Ross",
    avatar: avatarUrl("diana-ross"),
    type: "incoming",
    callType: "voice",
    timestamp: "Mon",
    duration: "8:02",
  },
  {
    id: "c5",
    contactId: "1",
    name: "Design Team",
    avatar: avatarUrl("design-team"),
    type: "outgoing",
    callType: "video",
    timestamp: "Sun",
    duration: "45:10",
  },
  {
    id: "c6",
    contactId: "6",
    name: "Fiona Apple",
    avatar: avatarUrl("fiona-apple"),
    type: "missed",
    callType: "video",
    timestamp: "Sat",
    duration: null,
  },
];

const baseMessages = (peerName, peerAvatar) => [
  {
    id: "m1",
    message: `Hey! Good to connect with you.`,
    username: peerName,
    timestamp: "9:00 AM",
    type: "received",
    avatar: peerAvatar,
  },
  {
    id: "m2",
    message: "Hi! How are things going on your end?",
    username: "You",
    timestamp: "9:02 AM",
    type: "sent",
    avatar: MOCK_USER.avatar,
  },
  {
    id: "m3",
    message: "Pretty busy but making good progress on the project.",
    username: peerName,
    timestamp: "9:05 AM",
    type: "received",
    avatar: peerAvatar,
  },
  {
    id: "m4",
    message: "That's great to hear. Let me know if you need anything.",
    username: "You",
    timestamp: "9:07 AM",
    type: "sent",
    avatar: MOCK_USER.avatar,
  },
  {
    id: "m5",
    message: "Will do — thanks! 👍",
    username: peerName,
    timestamp: "9:10 AM",
    type: "received",
    avatar: peerAvatar,
  },
];

const buildThread = (conv) => {
  const prior = baseMessages(conv.name, conv.avatar).slice(0, -1);
  return [
    ...prior,
    {
      id: `m-last-${conv.id}`,
      message: conv.lastMessage,
      timestamp: conv.timestamp,
      type: "received",
      username: conv.lastMessageSender || conv.name,
      avatar: conv.avatar,
    },
  ];
};

const buildLennyThread = (conv) => [
  {
    id: "la1",
    message: "Hello! I'm Lenny, your AI assistant.",
    username: "Lenny",
    timestamp: "now",
    type: "received",
    avatar: avatarUrl("lenny-ai"),
  },
  {
    id: `m-last-${conv.id}`,
    message: conv.lastMessage,
    timestamp: conv.timestamp,
    type: "received",
    username: "Lenny",
    avatar: avatarUrl("lenny-ai"),
  },
];

export const MOCK_MESSAGES = Object.fromEntries(
  MOCK_CONVERSATIONS.map((conv) => [
    conv.id,
    conv.id === "lenny-ai" ? buildLennyThread(conv) : buildThread(conv),
  ])
);

export const getConversationById = (id) =>
  MOCK_CONVERSATIONS.find((c) => c.id === id);

export const getContactById = (id) => MOCK_CONTACTS.find((c) => c.id === id);

export const getProfileForId = (id) => {
  const conversation = getConversationById(id);
  if (conversation) {
    const matchedContact = MOCK_CONTACTS.find((c) => c.name === conversation.name);
    return {
      id: conversation.id,
      name: conversation.name,
      avatar: conversation.avatar,
      isOnline: conversation.isOnline,
      isGroup: conversation.isGroup,
      phoneNumber: matchedContact?.phoneNumber,
      email: matchedContact?.email,
      lastSeen: matchedContact?.lastSeen,
    };
  }
  return getContactById(id);
};

export const getMessagesForConversation = (id) =>
  MOCK_MESSAGES[id] || baseMessages("Contact", avatarUrl(id));
