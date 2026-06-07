"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[294],{"./src/stories/06-MessagingAppDemo.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{LiveDemo:()=>LiveDemo,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_06_MessagingAppDemo_stories});var react=__webpack_require__("./node_modules/react/index.js"),dim=__webpack_require__("./src/core/dim.ts");const appVariables=dim.AH`
  :host {
    --app-primary: #1976d2;
    --app-primary-light: #e3f2fd;
    --app-bg: #f5f5f5;
    --app-surface: #ffffff;
    --app-text: #212121;
    --app-text-secondary: #757575;
    --app-border: #e0e0e0;
    --app-online: #4caf50;
    --app-sent: #1976d2;
    --app-received: #ffffff;
    --app-sidebar-width: 72px;
    --app-radius: 12px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: var(--app-text);
  }
`,avatarStyles=dim.AH`
  .avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--app-primary-light);
    display: block;
  }

  .avatar.avatar-sm {
    width: 32px;
    height: 32px;
  }

  .avatar.avatar-lg {
    width: 56px;
    height: 56px;
  }

  .avatar.emoji-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--app-primary-light);
  }

  .avatar.emoji-avatar.avatar-sm {
    font-size: 1rem;
  }

  .avatar.emoji-avatar.avatar-lg {
    font-size: 1.75rem;
  }

  .online-dot {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--app-online);
    border: 2px solid var(--app-surface);
  }
`,MOCK_USER={id:"me",name:"Alex Morgan",email:"alex.morgan@example.com",phone:"+1 555 010 2000",avatarEmoji:"🧑🏽‍💼",status:"Available"},MOCK_CONVERSATIONS=[{id:"lenny-ai",name:"Lenny",lastMessage:"Hello! I'm here to help.",lastMessageSender:"Lenny",timestamp:"now",unreadCount:0,avatarEmoji:"🤖",isOnline:!0,isGroup:!1,isPinned:!0,isMuted:!1,type:"active"},{id:"1",name:"Design Team",lastMessage:"The new mockups look amazing! 🎨",lastMessageSender:"Alice",timestamp:"2 min ago",unreadCount:3,avatarEmoji:"🎨",isOnline:!0,isGroup:!0,isPinned:!0,isMuted:!1,members:8,type:"active"},{id:"2",name:"Alice Johnson",lastMessage:"Can we schedule the meeting for tomorrow?",lastMessageSender:"Alice",timestamp:"15 min ago",unreadCount:1,avatarEmoji:"👩🏼",isOnline:!0,isGroup:!1,isPinned:!1,isMuted:!1,type:"active"},{id:"3",name:"Project Alpha",lastMessage:"Documentation has been updated",lastMessageSender:"Bob",timestamp:"1 hour ago",unreadCount:0,avatarEmoji:"🚀",isOnline:!1,isGroup:!0,isPinned:!0,isMuted:!0,members:12,type:"active"},{id:"4",name:"Bob Designer",lastMessage:"Thanks for the feedback! 👍",lastMessageSender:"Bob",timestamp:"3 hours ago",unreadCount:0,avatarEmoji:"👨🏻‍🎨",isOnline:!1,isGroup:!1,isPinned:!1,isMuted:!1,type:"active"},{id:"5",name:"Charlie Smith",lastMessage:"I'll send the files by EOD.",lastMessageSender:"Charlie",timestamp:"5 hours ago",unreadCount:2,avatarEmoji:"👨🏾‍💻",isOnline:!1,isGroup:!1,isPinned:!1,isMuted:!1,type:"active"},{id:"6",name:"Marketing Team",lastMessage:"Campaign launch is tomorrow 🚀",lastMessageSender:"Dana",timestamp:"Yesterday",unreadCount:0,avatarEmoji:"📣",isOnline:!0,isGroup:!0,isPinned:!1,isMuted:!1,members:6,type:"active"}],MOCK_CONTACTS=[{id:"1",name:"Alice Johnson",phoneNumber:"+1 234 567 8901",email:"alice@example.com",avatarEmoji:"👩🏼",isOnline:!0,isFavorite:!0},{id:"2",name:"Bob Smith",email:"bob.smith@example.com",avatarEmoji:"👨🏽",isRecent:!0},{id:"3",name:"Charlie Brown",phoneNumber:"+1 234 567 8903",avatarEmoji:"👦🏻",isFavorite:!0},{id:"4",name:"Diana Ross",phoneNumber:"+1 234 567 8904",email:"diana@example.com",avatarEmoji:"👩🏿",isOnline:!0,isRecent:!0},{id:"5",name:"Edward Norton",phoneNumber:"+1 234 567 8905",avatarEmoji:"👨🏻",lastSeen:"Yesterday"},{id:"6",name:"Fiona Apple",email:"fiona@example.com",avatarEmoji:"👩🏼‍🎤",isOnline:!0},{id:"7",name:"George Michael",phoneNumber:"+1 234 567 8907",avatarEmoji:"👨🏼",isRecent:!0},{id:"8",name:"Helen Hunt",phoneNumber:"+1 234 567 8908",avatarEmoji:"👩🏻‍⚕️"}],MOCK_CALLS=[{id:"c1",contactId:"2",name:"Alice Johnson",avatarEmoji:"👩🏼",type:"incoming",callType:"video",timestamp:"10:32 AM",duration:"12:45"},{id:"c2",contactId:"4",name:"Bob Designer",avatarEmoji:"👨🏻‍🎨",type:"outgoing",callType:"voice",timestamp:"Yesterday",duration:"3:21"},{id:"c3",contactId:"5",name:"Charlie Smith",avatarEmoji:"👨🏾‍💻",type:"missed",callType:"voice",timestamp:"Yesterday",duration:null},{id:"c4",contactId:"4",name:"Diana Ross",avatarEmoji:"👩🏿",type:"incoming",callType:"voice",timestamp:"Mon",duration:"8:02"},{id:"c5",contactId:"1",name:"Design Team",avatarEmoji:"🎨",type:"outgoing",callType:"video",timestamp:"Sun",duration:"45:10"},{id:"c6",contactId:"6",name:"Fiona Apple",avatarEmoji:"👩🏼‍🎤",type:"missed",callType:"video",timestamp:"Sat",duration:null}],baseMessages=(peerName,peerEmoji)=>[{id:"m1",message:"Hey! Good to connect with you.",username:peerName,timestamp:"9:00 AM",type:"received",avatarEmoji:peerEmoji},{id:"m2",message:"Hi! How are things going on your end?",username:"You",timestamp:"9:02 AM",type:"sent",avatarEmoji:MOCK_USER.avatarEmoji},{id:"m3",message:"Pretty busy but making good progress on the project.",username:peerName,timestamp:"9:05 AM",type:"received",avatarEmoji:peerEmoji},{id:"m4",message:"That's great to hear. Let me know if you need anything.",username:"You",timestamp:"9:07 AM",type:"sent",avatarEmoji:MOCK_USER.avatarEmoji},{id:"m5",message:"Will do — thanks! 👍",username:peerName,timestamp:"9:10 AM",type:"received",avatarEmoji:peerEmoji}],buildThread=conv=>[...baseMessages(conv.name,conv.avatarEmoji).slice(0,-1),{id:`m-last-${conv.id}`,message:conv.lastMessage,timestamp:conv.timestamp,type:"received",username:conv.lastMessageSender||conv.name,avatarEmoji:conv.avatarEmoji}],buildLennyThread=conv=>[{id:"la1",message:"Hello! I'm Lenny, your AI assistant.",username:"Lenny",timestamp:"now",type:"received",avatarEmoji:conv.avatarEmoji},{id:`m-last-${conv.id}`,message:conv.lastMessage,timestamp:conv.timestamp,type:"received",username:"Lenny",avatarEmoji:conv.avatarEmoji}],MOCK_MESSAGES=Object.fromEntries(MOCK_CONVERSATIONS.map((conv=>[conv.id,"lenny-ai"===conv.id?buildLennyThread(conv):buildThread(conv)]))),getConversationById=id=>MOCK_CONVERSATIONS.find((c=>c.id===id)),getContactById=id=>MOCK_CONTACTS.find((c=>c.id===id)),renderAvatar=(html,{emoji="👤",className="avatar",vtShared,label,style})=>html`
  <div
    class="${className} emoji-avatar"
    ${vtShared?html`data-vt-shared="${vtShared}"`:""}
    ${label?html`aria-label="${label}" role="img"`:""}
    ${style?html`style="${style}"`:""}
  >
    ${emoji}
  </div>
`,sharedKeys=id=>({avatar:`avatar-${id}`,name:`name-${id}`,lastMessage:`lastMessage-${id}`,timestamp:`timestamp-${id}`,status:`status-${id}`,online:`online-${id}`}),ConversationListView=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{conversations=[],onConversationClick,onOpenContacts}=data,[search,setSearch]=useState(""),[filter,setFilter]=useState("all");useStyle(css`
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
  `);const filtered=conversations.filter((c=>{if("groups"===filter&&!c.isGroup)return!1;if("direct"===filter&&c.isGroup)return!1;if(search){const q=search.toLowerCase();return c.name.toLowerCase().includes(q)||(c.lastMessage||"").toLowerCase().includes(q)}return!0}));return html`
    <div class="conversation-list">
      <div class="list-header">
        <h2 class="list-title">Messages</h2>
        <input
          class="search-box"
          type="search"
          placeholder="Search conversations..."
          .value="${search}"
          @input="${e=>setSearch(e.target.value)}"
        />
        <div class="filters">
          ${["all","groups","direct"].map((f=>html`
              <button
                class="filter-chip ${filter===f?"active":""}"
                @click="${()=>setFilter(f)}"
              >
                ${"all"===f?"All":"groups"===f?"Groups":"Direct"}
              </button>
            `))}
        </div>
      </div>

      <div class="list-wrap">
        <ul class="conversations">
          ${filtered.map((conv=>{const keys=sharedKeys(conv.id);return html`
              <li
                class="conv-row"
                @click="${()=>onConversationClick?.(conv.id)}"
              >
                <div class="avatar-wrap">
                  ${(conv=>{const keys=sharedKeys(conv.id);return renderAvatar(html,{emoji:conv.avatarEmoji,vtShared:keys.avatar,label:conv.name})})(conv)}
                  ${conv.isOnline?html`<span class="online-dot" data-vt-shared="${keys.online}"></span>`:""}
                </div>
                <div class="conv-body">
                  <div class="conv-top">
                    <span class="conv-name" data-vt-shared="${keys.name}">${conv.name}</span>
                    <span class="conv-time" data-vt-shared="${keys.timestamp}">${conv.timestamp}</span>
                  </div>
                  <div class="conv-preview">
                    ${conv.isGroup&&conv.lastMessageSender?html`<strong>${conv.lastMessageSender}: </strong>`:""}
                    <span class="conv-preview-text" data-vt-shared="${keys.lastMessage}">${conv.lastMessage}</span>
                  </div>
                </div>
                ${conv.unreadCount>0?html`<span class="unread-badge">${conv.unreadCount}</span>`:""}
              </li>
            `}))}
        </ul>
        <button class="fab" title="New message" @click="${()=>onOpenContacts?.()}">
          ✏️
        </button>
      </div>
    </div>
  `};(0,dim.E8)({tag:"conversation-list-view",component:ConversationListView});const ChatView=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{conversation,messages=[],onBack,onAvatarClick}=data,[draft,setDraft]=useState("");if(useStyle(css`
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
  `),!conversation)return html`<div class="chat-view">No conversation selected</div>`;const keys=sharedKeys(conversation.id),headerStatus=(messages.length>0&&messages[messages.length-1],conversation.isOnline?"Online":conversation.isGroup?`${conversation.members||0} members`:"Offline");return html`
    <div class="chat-view">
      <header class="chat-header">
        <button class="back-btn" @click="${()=>onBack?.()}" aria-label="Back">
          ←
        </button>
        <button
          class="header-avatar-btn"
          @click="${()=>onAvatarClick?.(conversation.id)}"
        >
          <div class="avatar-wrap">
            ${renderAvatar(html,{emoji:conversation.avatarEmoji,className:"avatar avatar-sm",vtShared:keys.avatar,label:conversation.name})}
            ${conversation.isOnline?html`<span class="online-dot" data-vt-shared="${keys.online}"></span>`:""}
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
        ${messages.map(((msg,index)=>{const isLast=index===messages.length-1;return html`
            <div class="message-row ${msg.type}">
              ${"received"===msg.type?renderAvatar(html,{emoji:msg.avatarEmoji,className:"avatar avatar-sm",label:msg.username}):""}
              <div>
                ${isLast?html`
                      <div class="bubble" data-vt-shared="${keys.lastMessage}">
                        ${msg.message}
                      </div>
                      <div class="msg-meta" data-vt-shared="${keys.timestamp}">
                        ${msg.timestamp}
                      </div>
                    `:html`
                      <div class="bubble">${msg.message}</div>
                      <div class="msg-meta">${msg.timestamp}</div>
                    `}
              </div>
            </div>
          `}))}
      </div>

      <div class="input-bar">
        <input
          class="msg-input"
          type="text"
          placeholder="Type a message..."
          .value="${draft}"
          @input="${e=>setDraft(e.target.value)}"
        />
        <button class="send-btn" title="Send">➤</button>
      </div>
    </div>
  `};(0,dim.E8)({tag:"chat-view",component:ChatView});const CallsListView=(props,{useStyle,html,css})=>{const data=props.props||props,{calls=[],onCallClick}=data;return useStyle(css`
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
  `),html`
    <div class="calls-list">
      <div class="calls-header">
        <h2 class="calls-title">Calls</h2>
        <p class="calls-subtitle">Recent call history</p>
      </div>
      <ul class="calls-items">
        ${calls.map((call=>{const keys=sharedKeys(call.contactId);return html`
            <li
              class="call-row ${call.type}"
              @click="${()=>onCallClick?.(call.contactId)}"
            >
              ${renderAvatar(html,{emoji:call.avatarEmoji,vtShared:keys.avatar,label:call.name})}
              <div class="call-body">
                <div class="call-name" data-vt-shared="${keys.name}">${call.name}</div>
                <div class="call-meta">
                  <span class="call-icon">${(call=>"missed"===call.type?"📵":"video"===call.callType?"📹":"📞")(call)}</span>
                  ${(call=>"missed"===call.type?"Missed":"incoming"===call.type?"Incoming":"Outgoing")(call)}
                  ${"video"===call.callType?" · Video":" · Voice"}
                </div>
              </div>
              <div class="call-side">
                <div class="call-time">${call.timestamp}</div>
                ${call.duration?html`<div class="call-duration">${call.duration}</div>`:""}
              </div>
            </li>
          `}))}
      </ul>
    </div>
  `};(0,dim.E8)({tag:"calls-list-view",component:CallsListView});const ProfileView=(props,{useStyle,html,css})=>{const data=props.props||props,{user={}}=data;return useStyle(css`
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
  `),html`
    <div class="profile-view">
      <div class="profile-hero">
        ${renderAvatar(html,{emoji:user.avatarEmoji,className:"avatar avatar-lg",label:user.name,style:"margin: 0 auto;"})}
        <h2 class="profile-name">${user.name}</h2>
        <p class="profile-status">${user.status||"Available"}</p>
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
  `};(0,dim.E8)({tag:"profile-view",component:ProfileView});const ContactDetailsView=(props,{useStyle,html,css})=>{const data=props.props||props,{contact,onBack,onMessage}=data;if(useStyle(css`
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
  `),!contact)return html`<div class="contact-details">Contact not found</div>`;const keys=sharedKeys(contact.id),statusText=contact.isOnline?"Online":contact.isGroup?`${contact.members||0} members`:contact.lastSeen||"Offline";return html`
    <div class="contact-details">
      <header class="details-header">
        <button class="back-btn" @click="${()=>onBack?.()}" aria-label="Back">
          ←
        </button>
        <span class="details-title">Contact info</span>
      </header>

      <div class="details-hero">
        ${renderAvatar(html,{emoji:contact.avatarEmoji,className:"avatar avatar-lg",vtShared:keys.avatar,label:contact.name,style:"margin: 0 auto;"})}
        <h2 class="details-name" data-vt-shared="${keys.name}">${contact.name}</h2>
        <p class="details-status" data-vt-shared="${keys.status}">${statusText}</p>
      </div>

      <div class="action-row">
        <button class="action-btn" @click="${()=>onMessage?.(contact.id)}">
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
        ${contact.phoneNumber?html`
              <div class="info-row">
                <div class="info-label">Phone</div>
                <div class="info-value">${contact.phoneNumber}</div>
              </div>
            `:""}
        ${contact.email?html`
              <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">${contact.email}</div>
              </div>
            `:""}
      </div>
    </div>
  `};(0,dim.E8)({tag:"contact-details-view",component:ContactDetailsView});const NavigationView=(props,{useStyle,html,css})=>{const data=props.props||props,{activeTab=0,navStack=["list"],onConversationClick,onBack,onAvatarClick,onOpenContacts,onCallClick,onContactMessage,onContactBack}=data;useStyle(css`
    ${appVariables}

    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    .auto-transition-wrapper,
    .view-transition-item,
    .vt-layer {
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .vt-layer:not(.vt-incoming) {
      pointer-events: none;
    }

    .nav-view-root {
      flex: 1;
      height: 100%;
      width: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .nav-view-root > * {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  `);const top=navStack[navStack.length-1]||"list";if(top.startsWith("contact:")){return html`
      <div class="nav-view-root">
        <contact-details-view
          .props="${{contact:(id=>{const conversation=getConversationById(id);if(conversation){const matchedContact=MOCK_CONTACTS.find((c=>c.name===conversation.name));return{id:conversation.id,name:conversation.name,avatarEmoji:conversation.avatarEmoji,isOnline:conversation.isOnline,isGroup:conversation.isGroup,phoneNumber:matchedContact?.phoneNumber,email:matchedContact?.email,lastSeen:matchedContact?.lastSeen}}return getContactById(id)})(top.split(":")[1]),onBack:onContactBack,onMessage:onContactMessage}}"
        ></contact-details-view>
      </div>
    `}if(top.startsWith("chat:")){const chatId=top.split(":")[1],conversation=(id=>{const conversation=getConversationById(id);if(conversation)return conversation;const contact=getContactById(id);return contact?{id:contact.id,name:contact.name,avatarEmoji:contact.avatarEmoji,isOnline:contact.isOnline,isGroup:!1}:null})(chatId);return html`
      <div class="nav-view-root">
        <chat-view
          .props="${{conversation,messages:MOCK_MESSAGES[chatId]||baseMessages("Contact","👤"),onBack,onAvatarClick}}"
        ></chat-view>
      </div>
    `}return 1===activeTab?html`
      <div class="nav-view-root">
        <calls-list-view
          .props="${{calls:MOCK_CALLS,onCallClick}}"
        ></calls-list-view>
      </div>
    `:5===activeTab?html`
      <div class="nav-view-root">
        <profile-view .props="${{user:MOCK_USER}}"></profile-view>
      </div>
    `:html`
    <div class="nav-view-root">
      <conversation-list-view
        .props="${{conversations:MOCK_CONVERSATIONS,onConversationClick,onOpenContacts}}"
      ></conversation-list-view>
    </div>
  `};(0,dim.E8)({tag:"navigation-view",component:NavigationView});const ContactsDrawer=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{open,contacts=[],onClose,onSelect}=data,[search,setSearch]=useState("");useStyle(css`
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
  `);const filtered=contacts.filter((c=>{if(!search)return!0;const q=search.toLowerCase();return c.name.toLowerCase().includes(q)||(c.email||"").toLowerCase().includes(q)||(c.phoneNumber||"").includes(q)}));return html`
    <div class="drawer-root ${open?"open":""}">
      <div class="drawer-backdrop" @click="${()=>onClose?.()}"></div>
      <aside class="drawer-panel">
        <div class="drawer-header">
          <h2 class="drawer-title">Contacts</h2>
          <button class="close-btn" @click="${()=>onClose?.()}" aria-label="Close">
            ✕
          </button>
        </div>
        <div class="drawer-search">
          <input
            class="search-input"
            type="search"
            placeholder="Search contacts..."
            .value="${search}"
            @input="${e=>setSearch(e.target.value)}"
          />
        </div>
        <ul class="contacts-list">
          ${filtered.map((contact=>html`
              <li
                class="contact-row"
                @click="${()=>onSelect?.(contact.id)}"
              >
                <div class="avatar-wrap">
                  ${renderAvatar(html,{emoji:contact.avatarEmoji,label:contact.name})}
                  ${contact.isOnline?html`<span class="online-dot"></span>`:""}
                </div>
                <div>
                  <div class="contact-name">${contact.name}</div>
                  <div class="contact-sub">
                    ${contact.isOnline?"Online":contact.lastSeen||contact.email||contact.phoneNumber||""}
                  </div>
                </div>
              </li>
            `))}
        </ul>
      </aside>
    </div>
  `};(0,dim.E8)({tag:"contacts-drawer",component:ContactsDrawer});const TABS=[{id:0,label:"Chats",icon:"💬"},{id:1,label:"Calls",icon:"📞"},{id:5,label:"Profile",icon:"👤"}],TAB_VIEW_IDS={0:10,1:11,5:15},idToOffset=(id,base)=>{const num=parseInt(id,10);if(!isNaN(num))return base+num;let hash=0;for(let i=0;i<id.length;i++)hash=(31*hash+id.charCodeAt(i))%50;return base+50+hash},MessagingAppDemo=(props,{useState,useStyle,useStore,html,css})=>{const store=useStore({activeTab:useState(0),navStack:useState(["list"]),contactsOpen:useState(!1)}),[activeTab,setActiveTab]=store.activeTab,[navStack,setNavStack]=store.navStack,[contactsOpen,setContactsOpen]=store.contactsOpen,viewId=((activeTab,navStack)=>{const top=navStack[navStack.length-1]||"list";return top.startsWith("contact:")?String(idToOffset(top.split(":")[1],300)):top.startsWith("chat:")?String(idToOffset(top.split(":")[1],200)):String(TAB_VIEW_IDS[activeTab]??10)})(activeTab,navStack),isChatOpen=navStack.some((entry=>entry.startsWith("chat:")));useStyle(css`
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
  `);const openChat=id=>{setNavStack(["list",`chat:${id}`])},goBack=()=>{navStack.length>1?setNavStack(navStack.slice(0,-1)):setNavStack(["list"])},navProps={activeTab,navStack,onConversationClick:openChat,onBack:goBack,onAvatarClick:id=>{setNavStack([...navStack,`contact:${id}`])},onOpenContacts:()=>setContactsOpen(!0),onCallClick:openChat,onContactMessage:id=>{setNavStack(["list",`chat:${id}`])},onContactBack:()=>{goBack()}},renderTabButton=(tab,className)=>html`
    <button
      class="${className} ${activeTab===tab.id?"active":""}"
      @click="${()=>{return tabId=tab.id,setActiveTab(tabId),void setNavStack(["list"]);var tabId}}"
      title="${tab.label}"
    >
      ${className.includes("bottom")?html`
            <span class="bottom-tab-icon">${tab.icon}</span>
            <span>${tab.label}</span>
          `:tab.icon}
    </button>
  `;return html`
    <div class="messaging-app">
      <nav class="sidebar">
        ${renderAvatar(html,{emoji:"💬",className:"sidebar-logo emoji-avatar",label:"Enkrypted Chat"})}
        ${TABS.map((tab=>renderTabButton(tab,"sidebar-tab")))}
      </nav>

      <div class="main-column ${isChatOpen?"chat-open":""}">
        <header class="app-header">
          <h1 class="app-header-title">Enkrypted Chat</h1>
          <div class="header-user">
            <span>${MOCK_USER.name}</span>
            ${renderAvatar(html,{emoji:MOCK_USER.avatarEmoji,className:"avatar avatar-sm",label:MOCK_USER.name})}
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
            ${TABS.map((tab=>renderTabButton(tab,"bottom-tab")))}
          </div>
        </nav>
      </div>

      <contacts-drawer
        .props="${{open:contactsOpen,contacts:MOCK_CONTACTS,onClose:()=>setContactsOpen(!1),onSelect:id=>{setContactsOpen(!1),openChat(id)}}}"
      ></contacts-drawer>
    </div>
  `};(0,dim.E8)({tag:"messaging-app-demo",component:MessagingAppDemo});const _06_MessagingAppDemo_stories={title:"Demo/Messaging App",parameters:{layout:"fullscreen",docs:{description:{component:"\n# Messaging App Demo\n\nA navigable messaging app UI built with the Dim framework, modeled after glitr-chat.\nAll data is hardcoded — no real messaging, P2P, or backend.\n\n## Features\n\n- **Conversation list** with search and filters\n- **Chat view** with exhaustive shared-element transitions\n- **Contacts drawer** for starting new conversations\n- **Calls** and **Profile** tabs\n- **Contact details** overlay from chat header\n\n## Page transitions\n\nUses Dim's automatic `transitionId` prop on `navigation-view` for page slides (right = forward, left = back).\n\n## Shared-element transitions (`data-vt-shared`)\n\nPer-conversation keys via `sharedKeys(id)`:\n\n| Key | List row | Chat | Calls row | Contact details |\n|-----|----------|------|-----------|-----------------|\n| `avatar-{id}` | Row avatar | Header avatar | Call avatar | Hero avatar |\n| `name-{id}` | Row name | Header name | Call name | Hero name |\n| `lastMessage-{id}` | Preview text | Last bubble | — | — |\n| `timestamp-{id}` | Row time | Last bubble time | — | — |\n| `online-{id}` | Online dot | Header dot | — | — |\n| `status-{id}` | — | Header status | — | Hero status |\n\n### Routes with shared morphs\n\n- **Chat list → Chat**: avatar, name, lastMessage, timestamp, online\n- **Calls → Chat**: avatar, name\n- **Chat → Contact details**: avatar, name, status\n- **Back navigation**: reverse FLIP on all of the above\n\nContacts drawer opens outside `navigation-view`, so drawer row → chat does not FLIP (list → chat transition runs instead).\n        "}}},tags:["autodocs"]},LiveDemo={render:()=>react.createElement("messaging-app-demo"),name:"Live Demo",parameters:{docs:{description:{story:"\nClick a conversation to open the chat — watch the avatar, name, preview message, and timestamp morph into the header and last bubble.\nUse the Calls tab or contact details for additional shared transitions. Use the pencil button for contacts.\n        "}}}},__namedExportsOrder=["LiveDemo"];LiveDemo.parameters={...LiveDemo.parameters,docs:{...LiveDemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("messaging-app-demo"),\n  name: "Live Demo",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nClick a conversation to open the chat — watch the avatar, name, preview message, and timestamp morph into the header and last bubble.\nUse the Calls tab or contact details for additional shared transitions. Use the pencil button for contacts.\n        `\n      }\n    }\n  }\n}',...LiveDemo.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-06-MessagingAppDemo-stories.8fff7d1c.iframe.bundle.js.map