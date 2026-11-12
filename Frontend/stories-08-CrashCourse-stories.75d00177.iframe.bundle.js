"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[386],{"./src/stories/08-CrashCourse.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Composition:()=>Composition,EffectsAndMemo:()=>EffectsAndMemo,Files:()=>Files,FinalApp:()=>FinalApp,FirstComponent:()=>FirstComponent,Pitfalls:()=>Pitfalls,ReactInterop:()=>ReactInterop,Refs:()=>Refs,State:()=>State,Store:()=>Store,Styling:()=>Styling,TemplatesAndBindings:()=>TemplatesAndBindings,UnderTheHood:()=>UnderTheHood,ViewTransitions:()=>ViewTransitions,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_08_CrashCourse_stories});var react=__webpack_require__("./node_modules/react/index.js"),core=__webpack_require__("./src/core/index.ts");const SEED_NOTES=[{id:"n-welcome",title:"Welcome to Dim Notes",body:"A tiny notes app that grows with each crash-course lesson.",pinned:!0,tags:["intro"],updatedAt:1},{id:"n-hooks",title:"Hooks feel familiar",body:"useState, useEffect, useMemo, useRef — same ideas, native custom elements.",pinned:!1,tags:["hooks"],updatedAt:2},{id:"n-store",title:"State that outlives the tab",body:"useStore persists to IndexedDB. Encryption is opt-in; there is no default password.",pinned:!1,tags:["store"],updatedAt:3}];function createNote(overrides={}){return{id:overrides.id||`n-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,title:overrides.title||"Untitled",body:overrides.body||"",pinned:!!overrides.pinned,tags:overrides.tags||[],updatedAt:overrides.updatedAt||Date.now()}}function wordCount(text){return(text||"").trim().split(/\s+/).filter(Boolean).length}const lessonStyles=core.AH`
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    color: var(--cc-fg, #0f172a);
    background: var(--cc-bg, #ffffff);
    --cc-accent: #029cfd;
    --cc-accent-hover: #0278c7;
    --cc-border: #e2e8f0;
    --cc-muted: #64748b;
    --cc-card: #f8fafc;
    --cc-danger: #dc3545;
    --cc-ok: #15803d;
    line-height: 1.45;
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    max-width: 920px;
    margin: 0 auto;
    padding: 1.25rem;
    border: 1px solid var(--cc-border);
    border-radius: 12px;
    background: var(--cc-bg, #fff);
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--cc-accent);
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  h1,
  h2,
  h3 {
    margin: 0 0 0.5rem;
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--cc-muted);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 700px) {
    .split {
      grid-template-columns: 1fr;
    }
  }

  button,
  .btn {
    background: var(--cc-accent);
    color: #fff;
    border: none;
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
  }

  button:hover,
  .btn:hover {
    background: var(--cc-accent-hover);
  }

  button:disabled,
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  button.ghost {
    background: transparent;
    color: var(--cc-fg, #0f172a);
    border: 1px solid var(--cc-border);
  }

  button.ghost:hover {
    background: var(--cc-card);
  }

  button.danger {
    background: var(--cc-danger);
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--cc-border);
    border-radius: 6px;
    font: inherit;
    background: var(--cc-bg, #fff);
    color: inherit;
  }

  textarea {
    min-height: 7rem;
    resize: vertical;
  }

  .card {
    background: var(--cc-card);
    border: 1px solid var(--cc-border);
    border-radius: 10px;
    padding: 0.9rem 1rem;
  }

  .card.selected,
  .card.active {
    border-color: var(--cc-accent);
    box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
  }

  .card.pinned {
    border-left: 4px solid var(--cc-accent);
  }

  .muted {
    color: var(--cc-muted);
    font-size: 0.85rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: #e0f2fe;
    color: #075985;
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .note-title {
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .note-body {
    margin: 0;
    color: var(--cc-muted);
    white-space: pre-wrap;
  }

  .status {
    font-size: 0.85rem;
    color: var(--cc-ok);
  }

  .status.error {
    color: var(--cc-danger);
  }

  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8em;
    background: var(--cc-card);
    border: 1px solid var(--cc-border);
    border-radius: 4px;
    padding: 0.05rem 0.3rem;
  }
`,NoteCard=(0,core.E8)({tag:"cc-l01-note-card",component:({title="Untitled",body=""},{html:tpl,css:cssFn,useStyle:style})=>(style(lessonStyles),style(cssFn`
      article {
        margin: 0;
      }
    `),tpl`
      <article class="card" data-testid="note-card">
        <h3 class="note-title">${title}</h3>
        <p class="note-body">${body}</p>
      </article>
    `)}),_04_composition_NoteCard=((0,core.E8)({tag:"cc-lesson-01",component:(_,{html:tpl,css:cssFn,useStyle:style,useScope})=>{style(lessonStyles),style(cssFn`
      .preview {
        display: grid;
        gap: 0.75rem;
      }
    `),useScope({NoteCard});const note=SEED_NOTES[0];return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 1</div>
        <h2>Your first component</h2>
        <p>
          <kbd>define({ tag, component })</kbd> registers a custom element.
          The function receives <kbd>(props, deps)</kbd> and returns
          <kbd>html</kbd>. Injected deps match the named exports.
        </p>
        <div class="preview">
          <cc-l01-note-card
            title="${note.title}"
            body="${note.body}"
          ></cc-l01-note-card>
          <p class="muted">
            Tag stamped by define: <kbd>${NoteCard.tag}</kbd>
          </p>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"cc-lesson-02",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state})=>{style(lessonStyles),style(cssFn`
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .trusted {
        font-size: 0.9rem;
      }
    `);const[pinned,setPinned]=state(!0),[busy,setBusy]=state(!1),[notes,setNotes]=state(SEED_NOTES.map((n=>({...n}))));return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 2</div>
        <h2>Templates and bindings</h2>
        <p>
          Interpolate text and attributes. Prefixes:
          <kbd>.prop=</kbd> properties,
          <kbd>@event=</kbd> listeners,
          <kbd>?bool=</kbd> boolean attributes.
          Use <kbd>keyed</kbd> so list rows keep identity when they move.
        </p>

        <div class="toolbar">
          <button id="toggle-pin" @click="${()=>setPinned(!pinned)}">
            ${pinned?"Unpin":"Pin"}
          </button>
          <button id="shuffle" @click="${()=>{setNotes([...notes].reverse())}}">Reorder list</button>
          <button
            id="busy-toggle"
            @click="${()=>setBusy(!busy)}"
          >${busy?"Stop":"Go busy"}</button>
          <button id="save" ?disabled="${busy}">
            ${busy?"Saving…":"Save"}
          </button>
        </div>

        <article class="card ${pinned?"pinned active":""}">
          <h3 class="note-title">Binding playground</h3>
          <p class="muted">Pinned: ${pinned?"yes":"no"} · Save disabled: ${busy?"yes":"no"}</p>
          <p class="trusted">${(0,core._3)("<em>trusted markup</em> via unsafeHTML")}</p>
        </article>

        <div class="list" style="margin-top: 0.75rem">
          ${notes.map((note=>(0,core.Dh)(note.id,tpl`
                <div class="card" data-id="${note.id}">
                  <div class="note-title">${note.title}</div>
                  <div class="muted">${note.id}</div>
                </div>
              `)))}
        </div>
      </div>
    `}}),(0,core.E8)({tag:"cc-lesson-03",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state})=>{style(lessonStyles),style(cssFn`
      .counter {
        font-variant-numeric: tabular-nums;
      }
    `);const seed=SEED_NOTES[0],[title,setTitle]=state(seed.title),[body,setBody]=state(seed.body),[saves,setSaves]=state(0);return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 3</div>
        <h2>State with useState</h2>
        <p>
          Controlled inputs use <kbd>.value</kbd> + <kbd>@input</kbd>.
          The renderer keeps focus and caret across re-renders.
          Unchanged values (<kbd>Object.is</kbd>) skip a re-render.
        </p>

        <div class="stack">
          <label>
            <span class="muted">Title</span>
            <input
              id="title"
              .value="${title}"
              @input="${e=>setTitle(e.target.value)}"
            />
          </label>
          <label>
            <span class="muted">Body</span>
            <textarea
              id="body"
              .value="${body}"
              @input="${e=>setBody(e.target.value)}"
            ></textarea>
          </label>
          <div class="row">
            <span class="badge counter" id="chars">${title.length+body.length} characters</span>
            <button
              id="save"
              @click="${()=>setSaves((n=>n+1))}"
            >Save</button>
            <button
              id="reset"
              class="ghost"
              @click="${()=>{setTitle(seed.title),setBody(seed.body)}}"
            >Reset</button>
            <span class="muted" id="saves">Saved ${saves} time${1===saves?"":"s"}</span>
          </div>
          <article class="card">
            <h3 class="note-title">${title||"Untitled"}</h3>
            <p class="note-body">${body}</p>
          </article>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"cc-l04-note-card",component:({note,selected,onSelect,tags},{html:tpl,css:cssFn,useStyle:style})=>{style(lessonStyles),style(cssFn`
      .card { cursor: pointer; }
      .tags { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.35rem; }
    `);const data=note||{title:"Untitled",body:"",id:"unknown"},tagList=Array.isArray(tags)?tags:data.tags||[];return tpl`
      <article
        class="card ${selected?"selected":""} ${data.pinned?"pinned":""}"
        data-id="${data.id}"
        @click="${()=>onSelect&&onSelect(data.id)}"
      >
        <div class="note-title">${data.title}</div>
        <p class="note-body">${data.body}</p>
        <div class="tags">
          ${tagList.map((t=>tpl`<span class="badge">${t}</span>`))}
        </div>
      </article>
    `}})),Panel=(0,core.E8)({tag:"cc-l04-panel",component:({heading,children},{html:tpl,css:cssFn,useStyle:style})=>(style(lessonStyles),style(cssFn`
      h3 { font-size: 0.95rem; }
    `),tpl`
      <section class="card">
        <h3>${heading||"Panel"}</h3>
        <div>${(0,core.sc)(children)}</div>
      </section>
    `)}),NoteList=(0,core.E8)({tag:"cc-l04-note-list",component:({notes,selectedId,onSelect},{html:tpl,css:cssFn,useStyle:style,useScope:scope})=>{style(lessonStyles),scope({NoteCard:_04_composition_NoteCard});return tpl`
      <div class="list">
        ${(notes||[]).map((note=>tpl`
            <cc-l04-note-card
              .props="${{note,selected:note.id===selectedId,onSelect,tags:note.tags}}"
            ></cc-l04-note-card>
          `))}
      </div>
    `}}),SavedTicker=((0,core.E8)({tag:"cc-lesson-04",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope})=>{style(lessonStyles),scope({NoteCard:_04_composition_NoteCard,NoteList,Panel});const[notes,setNotes]=state(SEED_NOTES.map((n=>({...n})))),[selectedId,setSelectedId]=state(notes[0].id),selected=notes.find((n=>n.id===selectedId))||notes[0];return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 4</div>
        <h2>Props and composition</h2>
        <p>
          <kbd>useScope({ NoteCard })</kbd> registers children using the
          <kbd>.tag</kbd> stamped by <kbd>define</kbd>. Pass objects and
          functions with <kbd>.props</kbd>. Slot markup with
          <kbd>renderChildren</kbd>. JSON attributes such as
          <kbd>tags='["a"]'</kbd> are parsed automatically.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="add-note" @click="${()=>{const note=createNote({title:`Note ${notes.length+1}`,body:"Written in the composition lesson.",tags:["new"]});setNotes([note,...notes]),setSelectedId(note.id)}}">Add note</button>
          <span class="badge" id="count">${notes.length} notes</span>
        </div>

        <div class="split">
          <cc-l04-note-list
            .props="${{notes,selectedId,onSelect:setSelectedId}}"
          ></cc-l04-note-list>
          <div class="stack">
            <cc-l04-panel heading="Editor">
              <label>
                <span class="muted">Title</span>
                <input
                  id="title"
                  .value="${selected.title}"
                  @input="${e=>{return title=e.target.value,void setNotes(notes.map((n=>n.id===selectedId?{...n,title}:n)));var title}}"
                />
              </label>
            </cc-l04-panel>
            <cc-l04-note-card
              tags='["json","attr"]'
              .props="${{note:selected,selected:!0}}"
            ></cc-l04-note-card>
          </div>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"cc-l05-ticker",component:({savedAt},{html:tpl,css:cssFn,useStyle:style,useState:state,useEffect:effect})=>{style(lessonStyles);const[seconds,setSeconds]=state(0);return effect((()=>{setSeconds(0);const id=setInterval((()=>setSeconds((s=>s+1))),1e3);return()=>clearInterval(id)}),[savedAt]),tpl`
      <span class="muted" id="ticker">Saved ${seconds}s ago</span>
    `}})),ThemedCard=((0,core.E8)({tag:"cc-lesson-05",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useEffect:effect,useMemo:memo,useScope:scope})=>{style(lessonStyles),scope({SavedTicker});const[notes]=state(SEED_NOTES.map((n=>({...n})))),[query,setQuery]=state(""),[savedAt,setSavedAt]=state(Date.now()),[showTicker,setShowTicker]=state(!0),[mountLogs,setMountLogs]=state(0);effect((()=>(setMountLogs((n=>n+1)),()=>{})),[]);const filtered=memo((()=>{const q=query.trim().toLowerCase();return q?notes.filter((n=>n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q))):notes}),[notes,query]),totalWords=memo((()=>notes.reduce(((sum,n)=>sum+wordCount(n.body)),0)),[notes]);return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 5</div>
        <h2>Effects, lifecycle, memoisation</h2>
        <p>
          <kbd>useEffect(fn, deps)</kbd> runs after render. Return a cleanup
          for timers and listeners — it also runs on disconnect.
          Dim requires a deps array (unlike React's "no deps" form).
          <kbd>useMemo</kbd> caches derived data such as search results.
        </p>

        <div class="stack">
          <input
            id="search"
            placeholder="Search notes…"
            .value="${query}"
            @input="${e=>setQuery(e.target.value)}"
          />
          <div class="row">
            <span class="badge" id="matches">${filtered.length} match${1===filtered.length?"":"es"}</span>
            <span class="badge">${totalWords} words</span>
            <span class="muted" id="mounts">Mounted ${mountLogs} time${1===mountLogs?"":"s"}</span>
          </div>
          <div class="row">
            <button id="save" @click="${()=>setSavedAt(Date.now())}">Mark saved</button>
            <button
              id="toggle-ticker"
              class="ghost"
              @click="${()=>setShowTicker(!showTicker)}"
            >${showTicker?"Unmount ticker":"Mount ticker"}</button>
            ${showTicker?tpl`<cc-l05-ticker savedAt="${savedAt}"></cc-l05-ticker>`:tpl`<span class="muted">Ticker unmounted (interval cleared)</span>`}
          </div>
          <div class="list">
            ${filtered.map((note=>tpl`
                <article class="card">
                  <div class="note-title">${note.title}</div>
                  <p class="note-body">${note.body}</p>
                </article>
              `))}
          </div>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"cc-lesson-06",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useRef:ref,querySelector})=>{style(lessonStyles);const[notes,setNotes]=state(SEED_NOTES.map((n=>({...n})))),[title,setTitle]=state(""),[selectedId,setSelectedId]=state(notes[0].id),renderCount=ref(0);renderCount.current+=1;const host=ref(),addAndFocus=()=>{const note=createNote({title:title||`Note ${notes.length+1}`,body:""});setNotes([note,...notes]),setSelectedId(note.id),setTitle(""),queueMicrotask((()=>{const input=querySelector("#title");input?.focus()}))};return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 6</div>
        <h2>Refs and the DOM</h2>
        <p>
          <kbd>useRef(initial)</kbd> is React-like. Called with no argument,
          <kbd>current</kbd> defaults to the host element.
          <kbd>querySelector</kbd> is scoped to this component's shadow root.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <input
            id="title"
            placeholder="New note title"
            .value="${title}"
            @input="${e=>setTitle(e.target.value)}"
            @keydown="${e=>{"Enter"===e.key&&addAndFocus()}}"
          />
          <button id="add-note" @click="${addAndFocus}">New note</button>
        </div>

        <p class="muted" id="renders">
          Render count (ref, no re-render): ${renderCount.current}
          · Host tag: ${host.current?.tagName?.toLowerCase?.()||"…"}
        </p>

        <div class="list">
          ${notes.map((note=>tpl`
              <article
                class="card ${note.id===selectedId?"selected":""}"
                data-id="${note.id}"
                @click="${()=>setSelectedId(note.id)}"
              >
                <div class="note-title">${note.title}</div>
              </article>
            `))}
        </div>
      </div>
    `}}),(0,core.E8)({tag:"cc-l07-card",component:({note,accent},{html:tpl,css:cssFn,useStyle:style,unsafeCSS:unsafe})=>{style(lessonStyles);const color=accent||"#029cfd";style(cssFn`
      :host {
        display: block;
      }
      :host([pinned]) .card {
        border-left: 4px solid var(--card-accent, ${unsafe(color)});
      }
      .card {
        --card-accent: ${unsafe(color)};
      }
      .swatch {
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 99px;
        background: var(--card-accent);
        display: inline-block;
      }
    `);const data=note||{title:"",body:"",pinned:!1};return tpl`
      <article class="card ${data.pinned?"pinned":""}">
        <div class="row">
          <span class="swatch"></span>
          <strong>${data.title}</strong>
        </div>
        <p class="note-body">${data.body}</p>
      </article>
    `}}));(0,core.E8)({tag:"cc-lesson-07",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope,unsafeCSS:unsafe})=>{const[theme,setTheme]=state("light"),dark="dark"===theme;return style(lessonStyles),style(cssFn`
      :host {
        --cc-bg: ${unsafe(dark?"#0b1220":"#ffffff")};
        --cc-fg: ${unsafe(dark?"#e2e8f0":"#0f172a")};
        --cc-card: ${unsafe(dark?"#111827":"#f8fafc")};
        --cc-border: ${unsafe(dark?"#1f2937":"#e2e8f0")};
        --cc-muted: ${unsafe(dark?"#94a3b8":"#64748b")};
      }
      .theme-bar {
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }
    `),scope({ThemedCard}),tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 7</div>
        <h2>Styling with useStyle</h2>
        <p>
          <kbd>useStyle(css\`…\`)</kbd> scopes CSS to the shadow root
          (<kbd>:host</kbd>, <kbd>:host([pinned])</kbd>). Where supported,
          Dim uses <kbd>adoptedStyleSheets</kbd>; otherwise a
          <kbd>&lt;style&gt;</kbd> tag. Theme with CSS variables.
        </p>

        <div class="row theme-bar">
          <button
            id="theme"
            class="ghost"
            @click="${()=>setTheme(dark?"light":"dark")}"
          >${dark?"Light theme":"Dark theme"}</button>
          <span class="muted">Theme: ${theme}</span>
        </div>

        <div class="list">
          ${SEED_NOTES.map(((note,i)=>tpl`
              <cc-l07-card
                ?pinned="${note.pinned}"
                .props="${{note,accent:0===i?"#029cfd":1===i?"#7c3aed":"#15803d"}}"
              ></cc-l07-card>
            `))}
        </div>
      </div>
    `}});function useStoreRefresh(key,{useState:state,useEffect:effect}){const[,bump]=state(0);effect((()=>{const refresh=()=>bump((n=>n+1));return window.addEventListener(key,refresh),()=>window.removeEventListener(key,refresh)}),[])}const NotesBadge=(0,core.E8)({tag:"cc-l08-badge",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useEffect:effect,useStore:storeHook})=>{style(lessonStyles),useStoreRefresh("ccNotes",{useState:state,useEffect:effect});const store=storeHook({ccNotes:state(SEED_NOTES.map((n=>({...n}))))}),[notes,,loading]=store.ccNotes;return tpl`
      <span class="badge" id="badge">
        ${(Array.isArray(notes)?notes:[]).length} shared notes${loading?" (loading)":""}
      </span>
    `}}),NotesPanel=(0,core.E8)({tag:"cc-l08-panel",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useEffect:effect,useStore:storeHook})=>{style(lessonStyles),useStoreRefresh("ccNotes",{useState:state,useEffect:effect});const store=storeHook({ccNotes:state(SEED_NOTES.map((n=>({...n}))))}),[notes,setNotes,loading]=store.ccNotes,list=Array.isArray(notes)?notes:[];return tpl`
      <div class="stack">
        <div class="row">
          <button id="add-note" @click="${()=>{setNotes([createNote({title:`Shared ${list.length+1}`,body:"From the list panel."}),...list])}}">Add note</button>
          ${loading?tpl`<span class="muted">Restoring from IndexedDB…</span>`:null}
        </div>
        <div class="list">
          ${list.map((note=>tpl`
              <article class="card" data-id="${note.id}">
                <div class="note-title">${note.title}</div>
                <p class="note-body">${note.body}</p>
              </article>
            `))}
        </div>
      </div>
    `}}),EncryptedPanel=(0,core.E8)({tag:"cc-l08-encrypted",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook})=>{style(lessonStyles);const store=storeHook({ccNotesEnc:state([])},{encryptionKey:"cc-crash-course"}),[notes,setNotes,loading]=store.ccNotesEnc,list=Array.isArray(notes)?notes:[];return tpl`
      <div class="stack">
        <p class="muted">
          Encrypted with key <kbd>cc-crash-course</kbd>. Lose the key, lose the data.
        </p>
        <button
          id="add-enc"
          @click="${()=>setNotes([createNote({title:`Secret ${list.length+1}`,body:"Ciphertext in IndexedDB."}),...list])}"
        >Add encrypted note</button>
        ${loading?tpl`<span class="muted">Decrypting…</span>`:null}
        <div class="list">
          ${list.map((note=>tpl`
              <article class="card">
                <div class="note-title">${note.title}</div>
              </article>
            `))}
        </div>
      </div>
    `}}),NotesPane=((0,core.E8)({tag:"cc-lesson-08",component:(_,{html:tpl,css:cssFn,useStyle:style,useScope:scope})=>(style(lessonStyles),scope({NotesBadge,NotesPanel,EncryptedPanel}),tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 8</div>
        <h2>Global and persistent state</h2>
        <p>
          Each component declares the slice it needs. Same-named keys sync
          across components and reloads (IndexedDB). Entries are
          <kbd>[value, setValue, isLoading, setIsLoading]</kbd>.
          Encryption is opt-in: <kbd>useStore(schema, { encryptionKey })</kbd>.
        </p>
        <div class="row" style="margin-bottom: 0.75rem">
          <cc-l08-badge></cc-l08-badge>
          <span class="muted">Reload this story — plaintext notes remain.</span>
        </div>
        <div class="split">
          <div>
            <h3>Shared plaintext</h3>
            <cc-l08-panel></cc-l08-panel>
          </div>
          <div>
            <h3>Encrypted slice</h3>
            <cc-l08-encrypted></cc-l08-encrypted>
          </div>
        </div>
      </div>
    `)}),(0,core.E8)({tag:"cc-l09-pane",component:({view,note,notes,onOpen,onBack},{html:tpl,css:cssFn,useStyle:style})=>{if(style(lessonStyles),style(cssFn`
      :host { display: block; min-height: 280px; }
      .hero {
        font-size: 1.4rem;
        margin-bottom: 0.5rem;
      }
    `),"detail"===view&&note)return tpl`
        <div class="stack">
          <button id="back" class="ghost" @click="${onBack}">← Back</button>
          <h2 class="hero" data-vt-shared="${`note-title-${note.id}`}">${note.title}</h2>
          <p class="note-body">${note.body}</p>
        </div>
      `;return tpl`
      <div class="list">
        ${(notes||[]).map((n=>tpl`
            <article
              class="card"
              data-id="${n.id}"
              @click="${()=>onOpen&&onOpen(n.id)}"
            >
              <div class="note-title" data-vt-shared="${`note-title-${n.id}`}">${n.title}</div>
              <p class="note-body">${n.body}</p>
            </article>
          `))}
      </div>
    `}})),INTEROP_KEY=((0,core.E8)({tag:"cc-lesson-09",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope})=>{style(lessonStyles),scope({NotesPane});const notes=SEED_NOTES,[selectedId,setSelectedId]=state(null),view=selectedId?"detail":"list",note=notes.find((n=>n.id===selectedId));return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 9</div>
        <h2>View transitions</h2>
        <p>
          Put <kbd>transitionId</kbd> on a child to animate content changes.
          Mark matching nodes with <kbd>data-vt-shared</kbd> for a FLIP
          shared-element animation. Numeric ids pick slide direction.
        </p>
        <cc-l09-pane
          transitionId="${selectedId?notes.findIndex((n=>n.id===selectedId))+1:0}"
          transitionDuration="450"
          .props="${{view,note,notes,onOpen:setSelectedId,onBack:()=>setSelectedId(null)}}"
        ></cc-l09-pane>
      </div>
    `}}),(0,core.E8)({tag:"cc-lesson-10",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook,useFS})=>{style(lessonStyles);const store=storeHook({ccNotes:state(SEED_NOTES.map((n=>({...n}))))}),[notes,setNotes,notesLoading]=store.ccNotes,list=Array.isArray(notes)?notes:[],fs=useFS({opfs:!0}),[files,setFiles]=state([]),[status,setStatus]=state(""),[error,setError]=state(""),refresh=async()=>{try{const entries=await fs.listDirectory("notes");setFiles(entries.map((e=>e.name))),setError("")}catch(err){setFiles([])}};return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 10</div>
        <h2>Files with useFS</h2>
        <p>
          File System Access with an Origin Private File System fallback.
          This demo forces <kbd>useFS({ opfs: true })</kbd> so it works inside
          Storybook without a folder picker. Optional
          <kbd>{ encrypt: true, encryptionPassword }</kbd> encrypts file bytes.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <span class="badge">mode: ${fs.fsMode||"…"}</span>
          <span class="badge">${fs.isReady?"ready":"init"}</span>
          <button id="export" @click="${async()=>{setStatus("Exporting…"),setError("");try{for(const note of list){const md=`# ${note.title}\n\n${note.body}\n`;await fs.writeFile(`${note.id}.md`,md,"notes")}await refresh(),setStatus(`Exported ${list.length} note(s) to OPFS notes/.`)}catch(err){setError(err?.message||String(err)),setStatus("")}}}" ?disabled="${!fs.isReady||notesLoading}">
            Export notes
          </button>
          <button id="refresh" class="ghost" @click="${refresh}" ?disabled="${!fs.isReady}">
            List files
          </button>
        </div>
        ${status?tpl`<p class="status" id="status">${status}</p>`:null}
        ${error?tpl`<p class="status error" id="error">${error}</p>`:null}

        <div class="split">
          <div>
            <h3>In-memory / store</h3>
            <div class="list">
              ${list.map((n=>tpl`
                  <article class="card">
                    <div class="note-title">${n.title}</div>
                  </article>
                `))}
            </div>
          </div>
          <div>
            <h3>OPFS notes/</h3>
            ${0===files.length?tpl`<p class="muted">No files yet. Export to create them.</p>`:tpl`<div class="list">
                    ${files.map((name=>tpl`
                        <div class="card row">
                          <span>${name}</span>
                          <button class="ghost" @click="${()=>(async name=>{setStatus("Importing…");try{const content=await fs.readFile(name,"notes"),text="string"==typeof content?content:"",[heading,...rest]=text.split("\n"),title=heading.replace(/^#\s*/,"").trim()||name,body=rest.join("\n").trim();setNotes([createNote({title,body,tags:["imported"]}),...list]),setStatus(`Imported ${name}`),setError("")}catch(err){setError(err?.message||String(err)),setStatus("")}})(name)}">Import</button>
                        </div>
                      `))}
                  </div>`}
          </div>
        </div>
      </div>
    `}}),"ccReactNote"),DimNote=(0,core.E8)({tag:"cc-l11-dim-note",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook})=>{style(lessonStyles);const store=storeHook({[INTEROP_KEY]:state("Hello from Dim")},{encryptionKey:"cc-crash-course"}),[text,setText,loading]=store.ccReactNote;return tpl`
      <div class="card">
        <div class="eyebrow">Dim component</div>
        <p class="muted">${loading?"Loading encrypted store…":"useStore + encryptionKey"}</p>
        <textarea
          id="dim-note"
          .value="${"string"==typeof text?text:String(text??"")}"
          @input="${e=>setText(e.target.value)}"
        ></textarea>
      </div>
    `}}),DimEcho=(0,core.E8)({tag:"cc-l11-echo",component:({label},{html:tpl,css:cssFn,useStyle:style})=>(style(lessonStyles),tpl`
      <div class="card">
        <div class="eyebrow">.props from React</div>
        <p id="echo-label">${label||"(no label yet — set via element.props)"}</p>
      </div>
    `)});function CrashCourseReactInterop(){const[value,setValue,isLoading]=(0,core.HS)({key:"ccReactNote",password:"cc-crash-course",defaultValue:"Hello from React"}),echoRef=(0,react.useRef)(null);return(0,react.useEffect)((()=>{echoRef.current&&(echoRef.current.props={label:`React says: ${value||""}`})}),[value]),react.createElement("div",{style:{fontFamily:"system-ui, sans-serif",maxWidth:920,margin:"0 auto",padding:20,border:"1px solid #e2e8f0",borderRadius:12}},react.createElement("div",{style:{color:"#029cfd",fontWeight:700,fontSize:12,letterSpacing:"0.08em"}},"LESSON 11"),react.createElement("h2",{style:{marginTop:4}},"React interop"),react.createElement("p",{style:{color:"#64748b"}},"React cannot pass objects through HTML attributes (they stringify). Set ",react.createElement("code",null,"element.props")," through a ref. ",react.createElement("code",null,"useDimStore")," is the React hook into Dim's encrypted IndexedDB store."),react.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},react.createElement("div",null,react.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#029cfd"}},"React"),isLoading?react.createElement("p",null,"Loading…"):react.createElement("textarea",{id:"react-note",value:value||"",onChange:e=>setValue(e.target.value),style:{width:"100%",minHeight:120,font:"inherit",padding:8}})),react.createElement(DimNote.tag)),react.createElement(DimEcho.tag,{ref:echoRef}))}(0,core.E8)({tag:"cc-lesson-12",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useMemo:memo,useRef:ref})=>{style(lessonStyles),style(cssFn`
      pre {
        background: var(--cc-card);
        border: 1px solid var(--cc-border);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        overflow: auto;
        font-size: 0.8rem;
      }
    `);const[count,setCount]=state(0),doubled=memo((()=>2*count),[count]),renders=ref(0);renders.current+=1;const host=ref(),hookSlots=Object.keys(host.current?.hooks||{}).sort(),hookIndex=host.current?.hookIndex??0;return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 12</div>
        <h2>Under the hood</h2>
        <p>
          Each update: <kbd>requestUpdate</kbd> batches in a microtask,
          <kbd>render()</kbd> resets <kbd>hookIndex</kbd> and runs the
          function, the renderer commits only the changed parts, styles
          flush, then <kbd>updated()</kbd>.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="inc" @click="${()=>setCount(count+1)}">Increment</button>
          <span class="badge">count: ${count}</span>
          <span class="badge">doubled: ${doubled}</span>
        </div>

        <pre id="inspector">renders: ${renders.current}
hookIndex (after this render): ${hookIndex}
hook slots:
${hookSlots.map((k=>`  ${k}`)).join("\n")||"  (first paint)"}
host: ${host.current?.tagName||"…"}
        </pre>
      </div>
    `}}),(0,core.E8)({tag:"cc-lesson-13",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state})=>{style(lessonStyles),style(cssFn`
      .wrong { border-color: #fecaca; }
      .right { border-color: #bbf7d0; }
      h3 { font-size: 1rem; }
    `);const[wrong,setWrong]=state(["Alpha","Beta"]),[right,setRight]=state(["Alpha","Beta"]),[tick,setTick]=state(0);return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 13</div>
        <h2>Pitfalls and rules of hooks</h2>
        <p>
          Hooks occupy numbered slots. Call them in the same order every
          render — never inside conditions or loops. State is immutable:
          <kbd>notes.push</kbd> will not update the UI.
        </p>

        <div class="split">
          <div class="card wrong">
            <h3>Wrong: mutate then set</h3>
            <p class="muted">Rendered items: ${wrong.length} · paint ${tick}</p>
            <div class="row">
              <button id="mutate" class="danger" @click="${()=>{wrong.push(`Item ${wrong.length+1}`),setWrong(wrong)}}">Push (mutate)</button>
              <button id="force" class="ghost" @click="${()=>setTick(tick+1)}">Force re-render</button>
            </div>
            <div class="list" style="margin-top: 0.5rem">
              ${wrong.map((item=>tpl`<div class="muted">${item}</div>`))}
            </div>
          </div>
          <div class="card right">
            <h3>Right: copy then set</h3>
            <p class="muted">Rendered items: ${right.length}</p>
            <button id="copy" @click="${()=>{setRight([...right,`Item ${right.length+1}`])}}">Push (copy)</button>
            <div class="list" style="margin-top: 0.5rem">
              ${right.map((item=>tpl`<div class="muted">${item}</div>`))}
            </div>
          </div>
        </div>
      </div>
    `}});const FinalCard=(0,core.E8)({tag:"cc-final-card",component:({note,selected,onSelect},{html:tpl,css:cssFn,useStyle:style})=>{style(lessonStyles),style(cssFn`
      .card { cursor: pointer; }
    `);const data=note||{id:"",title:"",body:""};return tpl`
      <article
        class="card ${selected?"selected":""} ${data.pinned?"pinned":""}"
        data-id="${data.id}"
        @click="${()=>onSelect&&onSelect(data.id)}"
      >
        <div class="note-title" data-vt-shared="${`final-title-${data.id}`}">${data.title}</div>
        <p class="note-body">${(data.body||"").slice(0,80)}</p>
      </article>
    `}}),FinalPane=(0,core.E8)({tag:"cc-final-pane",component:({view,notes,selected,onSelect,onBack,onSave,onExport,files,status,fsReady},{html:tpl,css:cssFn,useStyle:style,useScope:scope})=>{if(style(lessonStyles),style(cssFn`
      :host { display: block; min-height: 320px; }
      .editor { display: flex; flex-direction: column; gap: 0.5rem; }
    `),scope({FinalCard}),"edit"===view&&selected)return tpl`
        <div class="editor">
          <button id="back" class="ghost" @click="${onBack}">← Notes</button>
          <h2 data-vt-shared="${`final-title-${selected.id}`}">${selected.title}</h2>
          <input
            id="title"
            .value="${selected.title}"
            @input="${e=>onSave({...selected,title:e.target.value})}"
          />
          <textarea
            id="body"
            .value="${selected.body}"
            @input="${e=>onSave({...selected,body:e.target.value})}"
          ></textarea>
          <span class="muted">${wordCount(selected.body)} words</span>
        </div>
      `;return tpl`
      <div class="stack">
        <div class="list">
          ${(notes||[]).map((note=>tpl`
              <cc-final-card
                .props="${{note,selected:selected&&note.id===selected.id,onSelect}}"
              ></cc-final-card>
            `))}
        </div>
        <div class="row">
          <button id="export" @click="${onExport}" ?disabled="${!fsReady}">Export to OPFS</button>
          <span class="muted">${status||(files||[]).join(", ")}</span>
        </div>
      </div>
    `}}),_08_CrashCourse_stories=((0,core.E8)({tag:"cc-lesson-14",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook,useScope:scope,useMemo:memo,useFS,unsafeCSS:unsafe})=>{const store=storeHook({ccNotes:state(SEED_NOTES.map((n=>({...n})))),ccTheme:state("light")}),[notes,setNotes,notesLoading]=store.ccNotes,[theme,setTheme]=store.ccTheme,list=Array.isArray(notes)?notes:[],dark="dark"===theme;style(lessonStyles),style(cssFn`
      :host {
        --cc-bg: ${unsafe(dark?"#0b1220":"#ffffff")};
        --cc-fg: ${unsafe(dark?"#e2e8f0":"#0f172a")};
        --cc-card: ${unsafe(dark?"#111827":"#f8fafc")};
        --cc-border: ${unsafe(dark?"#1f2937":"#e2e8f0")};
        --cc-muted: ${unsafe(dark?"#94a3b8":"#64748b")};
      }
    `),scope({FinalPane,FinalCard});const[selectedId,setSelectedId]=state(null),[query,setQuery]=state(""),[files,setFiles]=state([]),[status,setStatus]=state(""),fs=useFS({opfs:!0}),filtered=memo((()=>{const q=query.trim().toLowerCase();return q?list.filter((n=>n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q))):list}),[list,query]),selected=list.find((n=>n.id===selectedId)),view=selected?"edit":"list",viewId=selected?list.findIndex((n=>n.id===selectedId))+1:0;return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 14</div>
        <h2>Dim Notes</h2>
        <p>
          The pieces from lessons 1–11 in one app: composition, controlled
          inputs, memoised search, theming, persisted store, view transitions,
          and OPFS export.
        </p>
        <div class="row" style="margin-bottom: 0.75rem">
          <input
            id="search"
            placeholder="Search…"
            .value="${query}"
            @input="${e=>setQuery(e.target.value)}"
            style="max-width: 16rem"
          />
          <button id="add-note" @click="${()=>{const note=createNote({title:"Untitled",body:""});setNotes([note,...list]),setSelectedId(note.id)}}">New note</button>
          <button
            id="theme"
            class="ghost"
            @click="${()=>setTheme(dark?"light":"dark")}"
          >${dark?"Light":"Dark"}</button>
          <span class="badge">${notesLoading?"Loading…":`${list.length} notes`}</span>
        </div>
        <cc-final-pane
          transitionId="${viewId}"
          transitionDuration="400"
          .props="${{view,notes:filtered,selected,onSelect:setSelectedId,onBack:()=>setSelectedId(null),onSave:next=>{setNotes(list.map((n=>n.id===next.id?{...next,updatedAt:Date.now()}:n)))},onExport:async()=>{try{for(const note of list)await fs.writeFile(`${note.id}.md`,`# ${note.title}\n\n${note.body}\n`,"notes");const entries=await fs.listDirectory("notes");setFiles(entries.map((e=>e.name))),setStatus(`Exported ${list.length} notes`)}catch(err){setStatus(err?.message||String(err))}},files,status,fsReady:fs.isReady}}"
        ></cc-final-pane>
      </div>
    `}}),{title:"Crash Course",parameters:{layout:"fullscreen",docs:{description:{component:'\n# Dim crash course\n\nDim is a **functional web-components** framework: React-like hooks, an owned\ntemplate renderer (`html` / `css`), Shadow DOM, and **no virtual DOM**.\nYou write a function, `define()` turns it into a custom element, and the\nrenderer patches only the parts of the template that changed.\n\n## What you will build\n\n**Dim Notes** grows lesson by lesson:\n\n1. A static note card\n3. An editable title and body\n4. A list of composed components\n5. Search, a ticker, and cleanup\n7. Themed, scoped styles\n8. Persisted (and optionally encrypted) store\n9. Animated list ↔ detail\n10. Export / import as files\n11. The same data inside a React page\n\nEach lesson is self-contained. Read the concept, copy the snippet, then\nuse the live example under the docs.\n\n## How a render works\n\n`define()` registers a custom element. On connect, Dim opens a shadow\nroot and calls your function. You return `html`…`; the renderer\nprepares parts (text, attributes, properties, events, booleans) and\ncommits only what changed. Hooks live in numbered slots on the host —\nsame order every render, like React.\n\n## Prerequisites\n\nModern JavaScript and tagged template literals. No build step is required\nto *use* Dim; this Storybook uses webpack so TypeScript sources resolve.\n\nImport from the public API:\n\n```javascript\nimport { define, html, css, useState } from "../core/index.ts";\n// src/core/dim.ts re-exports the same surface.\n```\n        '}}},tags:["autodocs"]}),FirstComponent={render:()=>react.createElement("cc-lesson-01"),name:"1. Your first component",parameters:{docs:{description:{story:'\n`define({ tag, component })` registers a custom element and **returns\nthe function** with `.tag` stamped on it. That stamp is what\n`useScope({ NoteCard })` uses later.\n\nThe component signature is `(props, deps) => html`…`. Injected\n`deps.html`, `deps.useState`, and so on are the **same functions** as\nthe named exports.\n\n```javascript\nimport { define, html } from "../../core/index.ts";\n\nexport const NoteCard = define({\n  tag: "cc-note-card",\n  component: ({ title = "Untitled", body = "" }) => html`\n    <article>\n      <h3>${title}</h3>\n      <p>${body}</p>\n    </article>\n  `,\n});\n```\n\nUse it from HTML (`<cc-note-card title="Hi">`), from React\n(`React.createElement("cc-note-card")`), or from another Dim component\nafter `useScope({ NoteCard })`.\n        '}}}},TemplatesAndBindings={render:()=>react.createElement("cc-lesson-02"),name:"2. Templates and bindings",parameters:{docs:{description:{story:'\nTemplates are tagged literals. Interpolate **text** with `${value}`\nand **attributes** with multi-part values\n(`class="note ${active ? \'active\' : \'\'}"`).\n\nBinding prefixes:\n\n| Prefix | Meaning |\n| --- | --- |\n| `.value=` | set a DOM **property** |\n| `@click=` | add an **event** listener |\n| `?disabled=` | toggle a **boolean** attribute |\n\nLists are `.map()`. Wrap rows in `keyed(id, html`…`)` so identity\nstays stable when the array reorders.\n\n`unsafeHTML` interpolates a string as markup. **Trusted content only**\n— never pass user input.\n\n```javascript\nhtml`\n  <button @click=${() => setPinned(!pinned)} ?disabled=${busy}>\n    ${pinned ? "Unpin" : "Pin"}\n  </button>\n  <input .value=${title} @input=${(e) => setTitle(e.target.value)} />\n  ${notes.map((n) => keyed(n.id, html`<li>${n.title}</li>`))}\n`\n```\n        '}}}},State={render:()=>react.createElement("cc-lesson-03"),name:"3. State with useState",parameters:{docs:{description:{story:'\n`useState(initial)` returns `[value, setValue]`. Updates are batched\ninto a **microtask**. If the next value is `Object.is`-equal to the\ncurrent one, Dim **skips** the re-render.\n\nUse functional updates when the next value depends on the previous one:\n`setCount((n) => n + 1)`.\n\nState is immutable: copy arrays and objects (`[...notes]`,\n`{ ...note, title }`) instead of mutating.\n\nControlled inputs:\n\n```javascript\nconst [title, setTitle] = useState("Untitled");\n\nhtml`\n  <input\n    .value=${title}\n    @input=${(e) => setTitle(e.target.value)}\n  />\n`\n```\n\nThe renderer restores **focus and caret** after each commit, so typing\nin a bound input feels native.\n        '}}}},Composition={render:()=>react.createElement("cc-lesson-04"),name:"4. Props and composition",parameters:{docs:{description:{story:'\nRegister children with `useScope`:\n\n```javascript\nuseScope({ NoteCard });                 // uses NoteCard.tag from define()\nuseScope({ "cc-note-card": NoteCard }); // explicit tag\n```\n\nHTML lowercases attribute names. Dim\'s props proxy is\n**case-insensitive**, so `transitionId` still reads from\n`transitionid`. Values that look like JSON\n(`tags=\'["a","b"]\'`) are parsed automatically.\n\n**Objects and functions cannot go through attributes** (they stringify).\nPass them with `.props`:\n\n```javascript\nhtml`\n  <cc-note-list\n    .props=${{ notes, selectedId, onSelect: setSelectedId }}\n  ></cc-note-list>\n`\n```\n\nParent markup is available as `props.children` /\n`props.childElements`. Render it with `renderChildren(children)`\n(usually a `<slot>`).\n\nData can also flow **up** via `dispatchEvent(new CustomEvent("note-select", { detail: id, bubbles: true }))`.\n        '}}}},EffectsAndMemo={render:()=>react.createElement("cc-lesson-05"),name:"5. Effects, lifecycle, memoisation",parameters:{docs:{description:{story:"\n`useEffect(fn, deps)` runs after render when `deps` change.\n\n- `[]` — once on mount\n- `[savedAt]` — when that value changes\n- Dim **requires** a deps array (passing nothing throws)\n\nReturn a cleanup function. It runs before the next effect **and** when\nthe element **disconnects** — use it for `setInterval`, subscriptions,\nand listeners.\n\n`useMemo(fn, deps)` caches derived data (filtered lists, word counts).\n\n```javascript\nuseEffect(() => {\n  const id = setInterval(() => setSeconds((s) => s + 1), 1000);\n  return () => clearInterval(id);\n}, [savedAt]);\n\nconst filtered = useMemo(() => {\n  const q = query.trim().toLowerCase();\n  return notes.filter((n) => n.title.toLowerCase().includes(q));\n}, [notes, query]);\n```\n\nUnmount the ticker in the live example to prove the interval is cleared.\n        "}}}},Refs={render:()=>react.createElement("cc-lesson-06"),name:"6. Refs and the DOM",parameters:{docs:{description:{story:"\n`useRef(initial)` returns a stable `{ current }` box. Updating\n`current` does **not** re-render (the live example keeps a render\ncounter this way).\n\n**Dim-specific:** `useRef()` with no argument defaults `current` to\nthe **host element**, not `null`. Pass an explicit initial value when\nyou want React-like behaviour.\n\n`querySelector` is bound to this component's **shadow root**.\n`getRef(selector)` looks up another Dim child's default ref.\n\n```javascript\nconst titleRef = useRef(null);\nconst host = useRef(); // host custom element\n\nconst addAndFocus = () => {\n  setNotes([createNote({ title }), ...notes]);\n  queueMicrotask(() => querySelector(\"#title\")?.focus());\n};\n```\n        "}}}},Styling={render:()=>react.createElement("cc-lesson-07"),name:"7. Styling with useStyle",parameters:{docs:{description:{story:'\n`useStyle(css`…`)` (or a string) injects CSS into the shadow root.\nSelectors are naturally scoped. `:host` and `:host([pinned])` style\nthe custom element itself.\n\nWhere the browser supports it, Dim uses `adoptedStyleSheets`; otherwise\nit appends a `<style data-style-hook>` tag. Dynamic values must go\nthrough `unsafeCSS`:\n\n```javascript\nuseStyle(css`\n  :host {\n    --cc-bg: ${unsafeCSS(dark ? "#0b1220" : "#ffffff")};\n  }\n  :host([pinned]) .card {\n    border-left: 4px solid var(--cc-accent);\n  }\n`);\n```\n\nTheme by setting CSS variables on `:host` and reading them in children.\n        '}}}},Store={render:()=>react.createElement("cc-lesson-08"),name:"8. Global and persistent state",parameters:{docs:{description:{story:'\n`useStore` is **bottom-up**: each component declares the slice it\nneeds. Same-named keys sync across components and survive reloads via\nIndexedDB.\n\nEach entry becomes `[value, setValue, isLoading, setIsLoading]`. Nested\nobjects are allowed.\n\n```javascript\nconst store = useStore({\n  ccNotes: useState([]),\n  ccTheme: useState("light"),\n});\nconst [notes, setNotes, notesLoading] = store.ccNotes;\n```\n\nEncryption is **opt-in** and there is **no default password**:\n\n```javascript\nuseStore(schema, { encryptionKey: userKey });\n```\n\nLose the key, lose the data. Never hardcode a production key.\n\nThe live example has two independent components sharing `ccNotes`, plus\nan encrypted `ccNotesEnc` slice. Reload the story — plaintext notes\nremain.\n        '}}}},ViewTransitions={render:()=>react.createElement("cc-lesson-09"),name:"9. View transitions",parameters:{docs:{description:{story:'\n**Automatic:** put `transitionId="${viewId}"` (and optionally\n`transitionDuration`) on a child. Dim wraps the render in a two-layer\nslide. Numeric ids pick direction (higher → right).\n\n**Shared elements:** mark matching nodes with\n`data-vt-shared="note-title-${id}"`. Dim FLIPs them from the old box\nto the new one.\n\n**Manual:** `useViewTransition(id, { duration, autoDirection })`\nreturns `isTransitioning`, `direction`, `getIncomingClass`,\n`getOutgoingClass`, plus `viewTransitionStyles`.\n\n```javascript\nhtml`\n  <cc-notes-pane\n    transitionId="${viewId}"\n    transitionDuration="450"\n    .props=${{ view, note, onOpen, onBack }}\n  ></cc-notes-pane>\n`\n```\n\nClick a note in the live example, then Back — the title is the shared\nelement.\n        '}}}},Files={render:()=>react.createElement("cc-lesson-10"),name:"10. Files with useFS",parameters:{docs:{description:{story:'\n`useFS()` talks to the **File System Access** API, with **OPFS** as\nthe fallback. `useFS({ opfs: true })` is deterministic in Storybook\n(no folder picker).\n\nUseful fields and methods: `isReady`, `fsMode`,\n`selectDirectory` / `pickLocalDirectory`, `writeFile`,\n`readFile`, `listDirectory`, `removeFile`, `uploadFile`.\n\n```javascript\nconst fs = useFS({ opfs: true });\nawait fs.writeFile(`${id}.md`, markdown, "notes");\nconst entries = await fs.listDirectory("notes");\nconst text = await fs.readFile(entries[0].name, "notes");\n```\n\nOptional `{ encrypt: true, encryptionPassword }` encrypts file\ncontents. There is no default password.\n\n**Caveats:** FSA needs a user gesture and a supporting browser\n(Chromium). OPFS is origin-private — not a folder the user can see in\nFinder / Explorer. jsdom has no OPFS, so tests skip this lesson.\n        '}}}},ReactInterop={render:()=>react.createElement(CrashCourseReactInterop),name:"11. React interop",parameters:{docs:{description:{story:'\nDim elements are just custom elements, so React can mount them:\n\n```javascript\nReact.createElement("cc-notes-app")\n```\n\nReact attributes are **strings**. To pass objects or functions, assign\n`.props` through a ref:\n\n```javascript\nconst ref = useRef(null);\nuseEffect(() => {\n  if (ref.current) ref.current.props = { note, onSelect };\n}, [note]);\nreturn React.createElement("cc-note-card", { ref });\n```\n\n`useDimStore({ key, password, defaultValue })` is a **React** hook\ninto Dim\'s encrypted IndexedDB. A password is **required**.\n\nIt dispatches the same encrypted `CustomEvent` as Dim\'s\n`useStore(..., { encryptionKey })` when the key and password match.\nThe live example pairs a React textarea with a Dim component on\n`ccReactNote` / `cc-crash-course`. Edits should appear on both sides\nafter the 200ms event debounce.\n\nIf they drift, check that both sides use the **same key and password**,\nand that values are strings (useDimStore is string-typed).\n        '}}}},UnderTheHood={render:()=>react.createElement("cc-lesson-12"),name:"12. Under the hood",parameters:{docs:{description:{story:'\n## Element lifecycle\n\n1. `connectedCallback` creates the open shadow root and\n   `requestUpdate()`\n2. `requestUpdate` coalesces into a **microtask**\n3. `render()` resets `hookIndex`, sets the current instance, parses\n   attributes, injects deps, calls your function\n4. The renderer **commits** the result (`preserveFocus: true`)\n5. `useStyle` queues flush (`adoptedStyleSheets` or `<style>`)\n6. `updated()` runs (view-transition host hooks in here)\n\nA `MutationObserver` on the host re-renders when **attributes**\nchange, so `transitionId="${id}"` stays reactive.\n\n## Hook slots\n\nHooks are stored as `host.hooks["hook-N"]` (and similar names for\nstyle / view-transition). `hookIndex` increments on every hook call\nand resets at the start of `render()`. That is why conditional hooks\nbreak — the slots shift.\n\n## Renderer\n\n- **prepare** — template strings → parts: child, attr, prop (`.`),\n  event (`@`), bool (`?`)\n- **commit** — patch only changed parts\n- **focus** — restore active element and caret unless a transition\n  asked to skip\n\nView transitions are wrapped by `AutoTransitionHost`\n(`src/core/transitions`). Persistence lives in\n`src/core/store`, files in `src/core/fs`.\n\nClick Increment in the inspector to watch `hookIndex` and slot names.\n        '}}}},Pitfalls={render:()=>react.createElement("cc-lesson-13"),name:"13. Pitfalls and rules of hooks",parameters:{docs:{description:{story:'\n### Conditional hooks\n\nWrong: `if (flag) useState(0)` — slots shift on the next render.\n\nRight: call every hook unconditionally; branch **inside**.\n\n### Mutating state\n\nWrong: `notes.push(item); setNotes(notes)` — same reference,\n`Object.is` bails out, UI stays stale.\n\nRight: `setNotes([...notes, item])`.\n\nThe live example: **Push (mutate)** does nothing until **Force\nre-render** (the array was mutated in place). **Push (copy)** updates\nimmediately.\n\n### Objects through attributes\n\nWrong: `onSelect="${fn}"` stringifies the function.\n\nRight: `.props=${{ onSelect }}` or `.onSelect=${fn}`.\n\n### camelCase attributes\n\nThe DOM lowercases them. Read via the props proxy, or set properties\n(`.transitionId=`).\n\n### Double `define`\n\n`customElements.define` is skipped if the tag exists. The first\ncomponent wins.\n\n### Effects without cleanup\n\nTimers leak. Always return `() => clearInterval(id)`. Dim also\nrequires a **deps array**.\n\n### `useLazyScope`\n\nEvaluates a string with `new Function`. Experimental, **unsafe** for\nuntrusted input.\n\n### Encryption keys\n\nNo default password. Hardcoded or lost keys mean unreadable data.\n\n### Controlled inputs\n\nBind `.value=${state}`. A plain `value=${state}` attribute will\nfight the DOM.\n\n### `useRef()`\n\nNo argument → `current` is the **host**, not `null`.\n        '}}}},FinalApp={render:()=>react.createElement("cc-lesson-14"),name:"14. Dim Notes (put it together)",parameters:{docs:{description:{story:"\nThe complete notes app: list + editor, search (`useMemo`), light/dark\n(`useStyle` + CSS variables), persisted `ccNotes` / `ccTheme`,\nlist ↔ detail transitions with a shared title, and OPFS export.\n\n## Recap\n\n- `define` + `html` — a custom element\n- Bindings — `.` `@` `?`, `keyed`, never `unsafeHTML` for users\n- `useState` — immutable updates, controlled `.value` + `@input`\n- `useScope` + `.props` — composition\n- `useEffect` / `useMemo` — cleanup and derived data\n- `useRef` / `querySelector` — host vs DOM nodes\n- `useStyle(css`…`)` — shadow CSS, `unsafeCSS` for dynamics\n- `useStore` — shared + persisted; encryption opt-in\n- `transitionId` + `data-vt-shared` — motion\n- `useFS({ opfs: true })` — files\n- React — `element.props` via ref, `useDimStore` for encrypted keys\n\n## Next\n\n- **API Reference** — every hook, live\n- **useStyle()** / **useTransition()** / **useFS()** — deeper galleries\n- **Demo/Messaging App** and **Demo/Shopping App** — full apps\n        "}}}},__namedExportsOrder=["FirstComponent","TemplatesAndBindings","State","Composition","EffectsAndMemo","Refs","Styling","Store","ViewTransitions","Files","ReactInterop","UnderTheHood","Pitfalls","FinalApp"];FirstComponent.parameters={...FirstComponent.parameters,docs:{...FirstComponent.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-01"),\n  name: "1. Your first component",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`define({ tag, component })\\` registers a custom element and **returns\nthe function** with \\`.tag\\` stamped on it. That stamp is what\n\\`useScope({ NoteCard })\\` uses later.\n\nThe component signature is \\`(props, deps) => html\\`…\\`. Injected\n\\`deps.html\\`, \\`deps.useState\\`, and so on are the **same functions** as\nthe named exports.\n\n\\`\\`\\`javascript\nimport { define, html } from "../../core/index.ts";\n\nexport const NoteCard = define({\n  tag: "cc-note-card",\n  component: ({ title = "Untitled", body = "" }) => html\\`\n    <article>\n      <h3>\\${title}</h3>\n      <p>\\${body}</p>\n    </article>\n  \\`,\n});\n\\`\\`\\`\n\nUse it from HTML (\\`<cc-note-card title="Hi">\\`), from React\n(\\`React.createElement("cc-note-card")\\`), or from another Dim component\nafter \\`useScope({ NoteCard })\\`.\n        `\n      }\n    }\n  }\n}',...FirstComponent.parameters?.docs?.source}}},TemplatesAndBindings.parameters={...TemplatesAndBindings.parameters,docs:{...TemplatesAndBindings.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-02"),\n  name: "2. Templates and bindings",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nTemplates are tagged literals. Interpolate **text** with \\`\\${value}\\`\nand **attributes** with multi-part values\n(\\`class="note \\${active ? \'active\' : \'\'}"\\`).\n\nBinding prefixes:\n\n| Prefix | Meaning |\n| --- | --- |\n| \\`.value=\\` | set a DOM **property** |\n| \\`@click=\\` | add an **event** listener |\n| \\`?disabled=\\` | toggle a **boolean** attribute |\n\nLists are \\`.map()\\`. Wrap rows in \\`keyed(id, html\\`…\\`)\\` so identity\nstays stable when the array reorders.\n\n\\`unsafeHTML\\` interpolates a string as markup. **Trusted content only**\n— never pass user input.\n\n\\`\\`\\`javascript\nhtml\\`\n  <button @click=\\${() => setPinned(!pinned)} ?disabled=\\${busy}>\n    \\${pinned ? "Unpin" : "Pin"}\n  </button>\n  <input .value=\\${title} @input=\\${(e) => setTitle(e.target.value)} />\n  \\${notes.map((n) => keyed(n.id, html\\`<li>\\${n.title}</li>\\`))}\n\\`\n\\`\\`\\`\n        `\n      }\n    }\n  }\n}',...TemplatesAndBindings.parameters?.docs?.source}}},State.parameters={...State.parameters,docs:{...State.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-03"),\n  name: "3. State with useState",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`useState(initial)\\` returns \\`[value, setValue]\\`. Updates are batched\ninto a **microtask**. If the next value is \\`Object.is\\`-equal to the\ncurrent one, Dim **skips** the re-render.\n\nUse functional updates when the next value depends on the previous one:\n\\`setCount((n) => n + 1)\\`.\n\nState is immutable: copy arrays and objects (\\`[...notes]\\`,\n\\`{ ...note, title }\\`) instead of mutating.\n\nControlled inputs:\n\n\\`\\`\\`javascript\nconst [title, setTitle] = useState("Untitled");\n\nhtml\\`\n  <input\n    .value=\\${title}\n    @input=\\${(e) => setTitle(e.target.value)}\n  />\n\\`\n\\`\\`\\`\n\nThe renderer restores **focus and caret** after each commit, so typing\nin a bound input feels native.\n        `\n      }\n    }\n  }\n}',...State.parameters?.docs?.source}}},Composition.parameters={...Composition.parameters,docs:{...Composition.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-04"),\n  name: "4. Props and composition",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nRegister children with \\`useScope\\`:\n\n\\`\\`\\`javascript\nuseScope({ NoteCard });                 // uses NoteCard.tag from define()\nuseScope({ "cc-note-card": NoteCard }); // explicit tag\n\\`\\`\\`\n\nHTML lowercases attribute names. Dim\'s props proxy is\n**case-insensitive**, so \\`transitionId\\` still reads from\n\\`transitionid\\`. Values that look like JSON\n(\\`tags=\'["a","b"]\'\\`) are parsed automatically.\n\n**Objects and functions cannot go through attributes** (they stringify).\nPass them with \\`.props\\`:\n\n\\`\\`\\`javascript\nhtml\\`\n  <cc-note-list\n    .props=\\${{ notes, selectedId, onSelect: setSelectedId }}\n  ></cc-note-list>\n\\`\n\\`\\`\\`\n\nParent markup is available as \\`props.children\\` /\n\\`props.childElements\\`. Render it with \\`renderChildren(children)\\`\n(usually a \\`<slot>\\`).\n\nData can also flow **up** via \\`dispatchEvent(new CustomEvent("note-select", { detail: id, bubbles: true }))\\`.\n        `\n      }\n    }\n  }\n}',...Composition.parameters?.docs?.source}}},EffectsAndMemo.parameters={...EffectsAndMemo.parameters,docs:{...EffectsAndMemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-05"),\n  name: "5. Effects, lifecycle, memoisation",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`useEffect(fn, deps)\\` runs after render when \\`deps\\` change.\n\n- \\`[]\\` — once on mount\n- \\`[savedAt]\\` — when that value changes\n- Dim **requires** a deps array (passing nothing throws)\n\nReturn a cleanup function. It runs before the next effect **and** when\nthe element **disconnects** — use it for \\`setInterval\\`, subscriptions,\nand listeners.\n\n\\`useMemo(fn, deps)\\` caches derived data (filtered lists, word counts).\n\n\\`\\`\\`javascript\nuseEffect(() => {\n  const id = setInterval(() => setSeconds((s) => s + 1), 1000);\n  return () => clearInterval(id);\n}, [savedAt]);\n\nconst filtered = useMemo(() => {\n  const q = query.trim().toLowerCase();\n  return notes.filter((n) => n.title.toLowerCase().includes(q));\n}, [notes, query]);\n\\`\\`\\`\n\nUnmount the ticker in the live example to prove the interval is cleared.\n        `\n      }\n    }\n  }\n}',...EffectsAndMemo.parameters?.docs?.source}}},Refs.parameters={...Refs.parameters,docs:{...Refs.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-06"),\n  name: "6. Refs and the DOM",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`useRef(initial)\\` returns a stable \\`{ current }\\` box. Updating\n\\`current\\` does **not** re-render (the live example keeps a render\ncounter this way).\n\n**Dim-specific:** \\`useRef()\\` with no argument defaults \\`current\\` to\nthe **host element**, not \\`null\\`. Pass an explicit initial value when\nyou want React-like behaviour.\n\n\\`querySelector\\` is bound to this component\'s **shadow root**.\n\\`getRef(selector)\\` looks up another Dim child\'s default ref.\n\n\\`\\`\\`javascript\nconst titleRef = useRef(null);\nconst host = useRef(); // host custom element\n\nconst addAndFocus = () => {\n  setNotes([createNote({ title }), ...notes]);\n  queueMicrotask(() => querySelector("#title")?.focus());\n};\n\\`\\`\\`\n        `\n      }\n    }\n  }\n}',...Refs.parameters?.docs?.source}}},Styling.parameters={...Styling.parameters,docs:{...Styling.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-07"),\n  name: "7. Styling with useStyle",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`useStyle(css\\`…\\`)\\` (or a string) injects CSS into the shadow root.\nSelectors are naturally scoped. \\`:host\\` and \\`:host([pinned])\\` style\nthe custom element itself.\n\nWhere the browser supports it, Dim uses \\`adoptedStyleSheets\\`; otherwise\nit appends a \\`<style data-style-hook>\\` tag. Dynamic values must go\nthrough \\`unsafeCSS\\`:\n\n\\`\\`\\`javascript\nuseStyle(css\\`\n  :host {\n    --cc-bg: \\${unsafeCSS(dark ? "#0b1220" : "#ffffff")};\n  }\n  :host([pinned]) .card {\n    border-left: 4px solid var(--cc-accent);\n  }\n\\`);\n\\`\\`\\`\n\nTheme by setting CSS variables on \\`:host\\` and reading them in children.\n        `\n      }\n    }\n  }\n}',...Styling.parameters?.docs?.source}}},Store.parameters={...Store.parameters,docs:{...Store.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-08"),\n  name: "8. Global and persistent state",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`useStore\\` is **bottom-up**: each component declares the slice it\nneeds. Same-named keys sync across components and survive reloads via\nIndexedDB.\n\nEach entry becomes \\`[value, setValue, isLoading, setIsLoading]\\`. Nested\nobjects are allowed.\n\n\\`\\`\\`javascript\nconst store = useStore({\n  ccNotes: useState([]),\n  ccTheme: useState("light"),\n});\nconst [notes, setNotes, notesLoading] = store.ccNotes;\n\\`\\`\\`\n\nEncryption is **opt-in** and there is **no default password**:\n\n\\`\\`\\`javascript\nuseStore(schema, { encryptionKey: userKey });\n\\`\\`\\`\n\nLose the key, lose the data. Never hardcode a production key.\n\nThe live example has two independent components sharing \\`ccNotes\\`, plus\nan encrypted \\`ccNotesEnc\\` slice. Reload the story — plaintext notes\nremain.\n        `\n      }\n    }\n  }\n}',...Store.parameters?.docs?.source}}},ViewTransitions.parameters={...ViewTransitions.parameters,docs:{...ViewTransitions.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-09"),\n  name: "9. View transitions",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Automatic:** put \\`transitionId="\\${viewId}"\\` (and optionally\n\\`transitionDuration\\`) on a child. Dim wraps the render in a two-layer\nslide. Numeric ids pick direction (higher → right).\n\n**Shared elements:** mark matching nodes with\n\\`data-vt-shared="note-title-\\${id}"\\`. Dim FLIPs them from the old box\nto the new one.\n\n**Manual:** \\`useViewTransition(id, { duration, autoDirection })\\`\nreturns \\`isTransitioning\\`, \\`direction\\`, \\`getIncomingClass\\`,\n\\`getOutgoingClass\\`, plus \\`viewTransitionStyles\\`.\n\n\\`\\`\\`javascript\nhtml\\`\n  <cc-notes-pane\n    transitionId="\\${viewId}"\n    transitionDuration="450"\n    .props=\\${{ view, note, onOpen, onBack }}\n  ></cc-notes-pane>\n\\`\n\\`\\`\\`\n\nClick a note in the live example, then Back — the title is the shared\nelement.\n        `\n      }\n    }\n  }\n}',...ViewTransitions.parameters?.docs?.source}}},Files.parameters={...Files.parameters,docs:{...Files.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-10"),\n  name: "10. Files with useFS",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n\\`useFS()\\` talks to the **File System Access** API, with **OPFS** as\nthe fallback. \\`useFS({ opfs: true })\\` is deterministic in Storybook\n(no folder picker).\n\nUseful fields and methods: \\`isReady\\`, \\`fsMode\\`,\n\\`selectDirectory\\` / \\`pickLocalDirectory\\`, \\`writeFile\\`,\n\\`readFile\\`, \\`listDirectory\\`, \\`removeFile\\`, \\`uploadFile\\`.\n\n\\`\\`\\`javascript\nconst fs = useFS({ opfs: true });\nawait fs.writeFile(\\`\\${id}.md\\`, markdown, "notes");\nconst entries = await fs.listDirectory("notes");\nconst text = await fs.readFile(entries[0].name, "notes");\n\\`\\`\\`\n\nOptional \\`{ encrypt: true, encryptionPassword }\\` encrypts file\ncontents. There is no default password.\n\n**Caveats:** FSA needs a user gesture and a supporting browser\n(Chromium). OPFS is origin-private — not a folder the user can see in\nFinder / Explorer. jsdom has no OPFS, so tests skip this lesson.\n        `\n      }\n    }\n  }\n}',...Files.parameters?.docs?.source}}},ReactInterop.parameters={...ReactInterop.parameters,docs:{...ReactInterop.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(CrashCourseReactInterop),\n  name: "11. React interop",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nDim elements are just custom elements, so React can mount them:\n\n\\`\\`\\`javascript\nReact.createElement("cc-notes-app")\n\\`\\`\\`\n\nReact attributes are **strings**. To pass objects or functions, assign\n\\`.props\\` through a ref:\n\n\\`\\`\\`javascript\nconst ref = useRef(null);\nuseEffect(() => {\n  if (ref.current) ref.current.props = { note, onSelect };\n}, [note]);\nreturn React.createElement("cc-note-card", { ref });\n\\`\\`\\`\n\n\\`useDimStore({ key, password, defaultValue })\\` is a **React** hook\ninto Dim\'s encrypted IndexedDB. A password is **required**.\n\nIt dispatches the same encrypted \\`CustomEvent\\` as Dim\'s\n\\`useStore(..., { encryptionKey })\\` when the key and password match.\nThe live example pairs a React textarea with a Dim component on\n\\`ccReactNote\\` / \\`cc-crash-course\\`. Edits should appear on both sides\nafter the 200ms event debounce.\n\nIf they drift, check that both sides use the **same key and password**,\nand that values are strings (useDimStore is string-typed).\n        `\n      }\n    }\n  }\n}',...ReactInterop.parameters?.docs?.source}}},UnderTheHood.parameters={...UnderTheHood.parameters,docs:{...UnderTheHood.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-12"),\n  name: "12. Under the hood",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n## Element lifecycle\n\n1. \\`connectedCallback\\` creates the open shadow root and\n   \\`requestUpdate()\\`\n2. \\`requestUpdate\\` coalesces into a **microtask**\n3. \\`render()\\` resets \\`hookIndex\\`, sets the current instance, parses\n   attributes, injects deps, calls your function\n4. The renderer **commits** the result (\\`preserveFocus: true\\`)\n5. \\`useStyle\\` queues flush (\\`adoptedStyleSheets\\` or \\`<style>\\`)\n6. \\`updated()\\` runs (view-transition host hooks in here)\n\nA \\`MutationObserver\\` on the host re-renders when **attributes**\nchange, so \\`transitionId="\\${id}"\\` stays reactive.\n\n## Hook slots\n\nHooks are stored as \\`host.hooks["hook-N"]\\` (and similar names for\nstyle / view-transition). \\`hookIndex\\` increments on every hook call\nand resets at the start of \\`render()\\`. That is why conditional hooks\nbreak — the slots shift.\n\n## Renderer\n\n- **prepare** — template strings → parts: child, attr, prop (\\`.\\`),\n  event (\\`@\\`), bool (\\`?\\`)\n- **commit** — patch only changed parts\n- **focus** — restore active element and caret unless a transition\n  asked to skip\n\nView transitions are wrapped by \\`AutoTransitionHost\\`\n(\\`src/core/transitions\\`). Persistence lives in\n\\`src/core/store\\`, files in \\`src/core/fs\\`.\n\nClick Increment in the inspector to watch \\`hookIndex\\` and slot names.\n        `\n      }\n    }\n  }\n}',...UnderTheHood.parameters?.docs?.source}}},Pitfalls.parameters={...Pitfalls.parameters,docs:{...Pitfalls.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-13"),\n  name: "13. Pitfalls and rules of hooks",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n### Conditional hooks\n\nWrong: \\`if (flag) useState(0)\\` — slots shift on the next render.\n\nRight: call every hook unconditionally; branch **inside**.\n\n### Mutating state\n\nWrong: \\`notes.push(item); setNotes(notes)\\` — same reference,\n\\`Object.is\\` bails out, UI stays stale.\n\nRight: \\`setNotes([...notes, item])\\`.\n\nThe live example: **Push (mutate)** does nothing until **Force\nre-render** (the array was mutated in place). **Push (copy)** updates\nimmediately.\n\n### Objects through attributes\n\nWrong: \\`onSelect="\\${fn}"\\` stringifies the function.\n\nRight: \\`.props=\\${{ onSelect }}\\` or \\`.onSelect=\\${fn}\\`.\n\n### camelCase attributes\n\nThe DOM lowercases them. Read via the props proxy, or set properties\n(\\`.transitionId=\\`).\n\n### Double \\`define\\`\n\n\\`customElements.define\\` is skipped if the tag exists. The first\ncomponent wins.\n\n### Effects without cleanup\n\nTimers leak. Always return \\`() => clearInterval(id)\\`. Dim also\nrequires a **deps array**.\n\n### \\`useLazyScope\\`\n\nEvaluates a string with \\`new Function\\`. Experimental, **unsafe** for\nuntrusted input.\n\n### Encryption keys\n\nNo default password. Hardcoded or lost keys mean unreadable data.\n\n### Controlled inputs\n\nBind \\`.value=\\${state}\\`. A plain \\`value=\\${state}\\` attribute will\nfight the DOM.\n\n### \\`useRef()\\`\n\nNo argument → \\`current\\` is the **host**, not \\`null\\`.\n        `\n      }\n    }\n  }\n}',...Pitfalls.parameters?.docs?.source}}},FinalApp.parameters={...FinalApp.parameters,docs:{...FinalApp.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("cc-lesson-14"),\n  name: "14. Dim Notes (put it together)",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nThe complete notes app: list + editor, search (\\`useMemo\\`), light/dark\n(\\`useStyle\\` + CSS variables), persisted \\`ccNotes\\` / \\`ccTheme\\`,\nlist ↔ detail transitions with a shared title, and OPFS export.\n\n## Recap\n\n- \\`define\\` + \\`html\\` — a custom element\n- Bindings — \\`.\\` \\`@\\` \\`?\\`, \\`keyed\\`, never \\`unsafeHTML\\` for users\n- \\`useState\\` — immutable updates, controlled \\`.value\\` + \\`@input\\`\n- \\`useScope\\` + \\`.props\\` — composition\n- \\`useEffect\\` / \\`useMemo\\` — cleanup and derived data\n- \\`useRef\\` / \\`querySelector\\` — host vs DOM nodes\n- \\`useStyle(css\\`…\\`)\\` — shadow CSS, \\`unsafeCSS\\` for dynamics\n- \\`useStore\\` — shared + persisted; encryption opt-in\n- \\`transitionId\\` + \\`data-vt-shared\\` — motion\n- \\`useFS({ opfs: true })\\` — files\n- React — \\`element.props\\` via ref, \\`useDimStore\\` for encrypted keys\n\n## Next\n\n- **API Reference** — every hook, live\n- **useStyle()** / **useTransition()** / **useFS()** — deeper galleries\n- **Demo/Messaging App** and **Demo/Shopping App** — full apps\n        `\n      }\n    }\n  }\n}',...FinalApp.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-08-CrashCourse-stories.75d00177.iframe.bundle.js.map