"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[738],{"./src/stories/tutorial/advanced/13-react-interop.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Fv:()=>TutorialReactInterop});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_core_index_ts__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/core/index.ts"),_shared_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/stories/tutorial/shared.js");const INTEROP_KEY="tutReactNote",INTEROP_PASSWORD="dim-tutorial",DimNote=(0,_core_index_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"tut-react-interop-dim-note",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook})=>{style(_shared_js__WEBPACK_IMPORTED_MODULE_2__.jW);const store=storeHook({[INTEROP_KEY]:state("Hello from Dim")},{encryptionKey:INTEROP_PASSWORD}),[text,setText,loading]=store[INTEROP_KEY];return tpl`
      <div class="card">
        <div class="eyebrow">Dim component</div>
        <p class="muted">${loading?"Loading encrypted store…":"useStore + encryptionKey"}</p>
        <textarea
          id="dim-note"
          .value="${"string"==typeof text?text:String(text??"")}"
          @input="${e=>setText(e.target.value)}"
        ></textarea>
      </div>
    `}}),DimEcho=(0,_core_index_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"tut-react-interop-echo",component:({label},{html:tpl,css:cssFn,useStyle:style})=>(style(_shared_js__WEBPACK_IMPORTED_MODULE_2__.jW),tpl`
      <div class="card">
        <div class="eyebrow">.props from React</div>
        <p id="echo-label">${label||"(no label yet — set via element.props)"}</p>
      </div>
    `)});function TutorialReactInterop(){const[value,setValue,isLoading]=(0,_core_index_ts__WEBPACK_IMPORTED_MODULE_1__.HS)({key:INTEROP_KEY,password:INTEROP_PASSWORD,defaultValue:"Hello from React"}),echoRef=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);return(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{echoRef.current&&(echoRef.current.props={label:`React says: ${value||""}`})}),[value]),react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{fontFamily:"system-ui, sans-serif",maxWidth:920,margin:"0 auto",padding:20,border:"1px solid #e2e8f0",borderRadius:12}},react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{color:"#029cfd",fontWeight:700,fontSize:12,letterSpacing:"0.08em"}},"ADVANCED · LESSON 13"),react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2",{style:{marginTop:4}},"React interop"),react__WEBPACK_IMPORTED_MODULE_0__.createElement("p",{style:{margin:"0 0 1rem",padding:"0.55rem 0.75rem",borderRadius:8,background:"#f8fafc",border:"1px dashed #e2e8f0",color:"#0f172a",fontSize:"0.9rem"}},react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong",{style:{color:"#029cfd"}},"Try: "),"Type in either textarea — they share an encrypted store key (about 200ms debounce)."),react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",null,react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{fontSize:12,fontWeight:700,color:"#029cfd"}},"React"),isLoading?react__WEBPACK_IMPORTED_MODULE_0__.createElement("p",null,"Loading…"):react__WEBPACK_IMPORTED_MODULE_0__.createElement("textarea",{id:"react-note",value:value||"",onChange:e=>setValue(e.target.value),style:{width:"100%",minHeight:120,font:"inherit",padding:8}})),react__WEBPACK_IMPORTED_MODULE_0__.createElement(DimNote.tag)),react__WEBPACK_IMPORTED_MODULE_0__.createElement(DimEcho.tag,{ref:echoRef}))}},"./src/stories/tutorial/index.js":(__unused_webpack_module,__unused_webpack___webpack_exports__,__webpack_require__)=>{var core=__webpack_require__("./src/core/index.ts"),shared=__webpack_require__("./src/stories/tutorial/shared.js");class TutHelloVanilla extends HTMLElement{static get observedAttributes(){return["name"]}constructor(){super(),this.attachShadow({mode:"open"}),this._render()}attributeChangedCallback(){this._render()}_render(){const name=this.getAttribute("name")||"world";this.shadowRoot.innerHTML=`\n      <style>\n        :host { display: block; }\n        .card {\n          background: var(--tut-card, #f8fafc);\n          border: 1px solid var(--tut-border, #e2e8f0);\n          border-radius: 10px;\n          padding: 0.9rem 1rem;\n        }\n        .label { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tut-accent, #029cfd); font-weight: 700; }\n        p { margin: 0.35rem 0 0; }\n      </style>\n      <div class="card">\n        <div class="label">Vanilla HTMLElement</div>\n        <p id="hello">Hello, ${name}.</p>\n      </div>\n    `}}customElements.get("tut-hello-vanilla")||customElements.define("tut-hello-vanilla",TutHelloVanilla);const HelloDim=(0,core.E8)({tag:"tut-hello-dim",component:({name="world"},{html:tpl,useStyle:style})=>(style(shared.jW),tpl`
      <article class="card">
        <div class="eyebrow">Dim define()</div>
        <p id="hello">Hello, ${name}.</p>
      </article>
    `)}),NoteCard=((0,core.E8)({tag:"tut-web-components",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope})=>{style(shared.jW),style(cssFn`
      .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media (max-width: 700px) { .compare { grid-template-columns: 1fr; } }
      .tip {
        margin-top: 1rem;
        font-size: 0.85rem;
      }
    `),scope({HelloDim});const[name,setName]=state("Ada");return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 1</div>
        <h2>What is a web component?</h2>
        <p class="try"><strong>Try:</strong> Click Greet — both cards update. In DevTools, inspect either tag: each has a #shadow-root of its own.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button
            id="greet"
            @click="${()=>setName("Ada"===name?"Linus":"Ada")}"
          >Greet ${"Ada"===name?"Linus":"Ada"}</button>
          <span class="muted">Attribute <kbd>name="${name}"</kbd> is a string on the element.</span>
        </div>

        <div class="compare">
          <tut-hello-vanilla id="vanilla" name="${name}"></tut-hello-vanilla>
          <tut-hello-dim .props="${{name}}"></tut-hello-dim>
        </div>

        <p class="muted tip">
          Custom element tag names must contain a hyphen (<kbd>tut-hello-vanilla</kbd>).
          The Shadow DOM keeps each card’s CSS off the rest of the page.
          Dim’s <kbd>define()</kbd> is the same idea — class, tag, shadow root — with less boilerplate.
        </p>
      </div>
    `}}),(0,core.E8)({tag:"tut-first-component-card",component:({title="Untitled",body=""},{html:tpl,css:cssFn,useStyle:style})=>(style(shared.jW),style(cssFn`
      article {
        margin: 0;
      }
    `),tpl`
      <article class="card" data-testid="note-card">
        <h3 class="note-title">${title}</h3>
        <p class="note-body">${body}</p>
      </article>
    `)})),_05_composition_NoteCard=((0,core.E8)({tag:"tut-first-component",component:(_,{html:tpl,css:cssFn,useStyle:style,useScope})=>{style(shared.jW),style(cssFn`
      .preview {
        display: grid;
        gap: 0.75rem;
      }
    `),useScope({NoteCard});const note=shared.qt[0];return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 2</div>
        <h2>Your first component</h2>
        <p class="try"><strong>Try:</strong> Inspect the card — it is a real custom element. The stamped tag name is printed below.</p>
        <div class="preview">
          <tut-first-component-card
            title="${note.title}"
            body="${note.body}"
          ></tut-first-component-card>
          <p class="muted">
            Tag stamped by define: <kbd>${NoteCard.tag}</kbd>
          </p>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-templates-bindings",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state})=>{style(shared.jW),style(cssFn`
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .trusted {
        font-size: 0.9rem;
      }
    `);const[pinned,setPinned]=state(!0),[busy,setBusy]=state(!1),[notes,setNotes]=state(shared.qt.map((n=>({...n}))));return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 3</div>
        <h2>Templates and bindings</h2>
        <p class="try"><strong>Try:</strong> 1) Pin / Unpin — the card border changes. 2) Go busy — Save greys out. 3) Reorder list — rows move but keep their ids.</p>

        <div class="toolbar">
          <button id="toggle-pin" @click="${()=>setPinned((p=>!p))}">
            ${pinned?"Unpin":"Pin"}
          </button>
          <button id="shuffle" @click="${()=>setNotes((list=>[...list].reverse()))}">Reorder list</button>
          <button id="busy-toggle" @click="${()=>setBusy((b=>!b))}">
            ${busy?"Stop":"Go busy"}
          </button>
          <button id="save" ?disabled="${busy}">
            ${busy?"Saving…":"Save"}
          </button>
        </div>

        <article class="card ${pinned?"pinned active":""}" data-pinned="${pinned?"yes":"no"}">
          <h3 class="note-title">Binding playground</h3>
          <p class="muted">Pinned: ${pinned?"yes":"no"} · Save disabled: ${busy?"yes":"no"}</p>
          <p class="trusted">${(0,core._3)("<em>trusted markup</em> via unsafeHTML")}</p>
        </article>

        <div class="list" style="margin-top: 0.75rem" id="note-list">
          ${notes.map((note=>(0,core.Dh)(note.id,tpl`
                <div class="card" data-id="${note.id}">
                  <div class="note-title">${note.title}</div>
                  <div class="muted">${note.id}</div>
                </div>
              `)))}
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-use-state",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state})=>{style(shared.jW),style(cssFn`
      .counter {
        font-variant-numeric: tabular-nums;
      }
    `);const seed=shared.qt[0],[title,setTitle]=state(seed.title),[body,setBody]=state(seed.body),[saves,setSaves]=state(0);return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 4</div>
        <h2>State with useState</h2>
        <p class="try"><strong>Try:</strong> 1) Type in Title — the preview and character count update. 2) Click Save, then Reset.</p>

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
            <h3 class="note-title" id="preview-title">${title||"Untitled"}</h3>
            <p class="note-body">${body}</p>
          </article>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-composition-note-card",component:({note,selected,onSelect,tags},{html:tpl,css:cssFn,useStyle:style})=>{style(shared.jW),style(cssFn`
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
    `}})),Panel=(0,core.E8)({tag:"tut-composition-panel",component:({heading,children},{html:tpl,css:cssFn,useStyle:style})=>(style(shared.jW),style(cssFn`
      h3 { font-size: 0.95rem; }
    `),tpl`
      <section class="card">
        <h3>${heading||"Panel"}</h3>
        <div>${(0,core.sc)(children)}</div>
      </section>
    `)}),NoteList=(0,core.E8)({tag:"tut-composition-note-list",component:({notes,selectedId,onSelect},{html:tpl,css:cssFn,useStyle:style,useScope:scope})=>{style(shared.jW),scope({NoteCard:_05_composition_NoteCard});return tpl`
      <div class="list">
        ${(notes||[]).map((note=>tpl`
            <tut-composition-note-card
              .props="${{note,selected:note.id===selectedId,onSelect,tags:note.tags}}"
            ></tut-composition-note-card>
          `))}
      </div>
    `}}),ThemedCard=((0,core.E8)({tag:"tut-composition",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope})=>{style(shared.jW),scope({NoteCard:_05_composition_NoteCard,NoteList,Panel});const[notes,setNotes]=state(shared.qt.map((n=>({...n})))),[selectedId,setSelectedId]=state(notes[0].id),selected=notes.find((n=>n.id===selectedId))||notes[0];return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 5</div>
        <h2>Props and composition</h2>
        <p class="try"><strong>Try:</strong> 1) Add note — the badge count goes up. 2) Click a card. 3) Edit its title in the editor — both views stay in sync.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="add-note" @click="${()=>{const note=(0,shared.p4)({title:`Note ${notes.length+1}`,body:"Written in the composition lesson.",tags:["new"]});setNotes([note,...notes]),setSelectedId(note.id)}}">Add note</button>
          <span class="badge" id="count">${notes.length} notes</span>
        </div>

        <div class="split">
          <tut-composition-note-list
            .props="${{notes,selectedId,onSelect:setSelectedId}}"
          ></tut-composition-note-list>
          <div class="stack">
            <tut-composition-panel heading="Editor">
              <label>
                <span class="muted">Title</span>
                <input
                  id="title"
                  .value="${selected.title}"
                  @input="${e=>{return title=e.target.value,void setNotes(notes.map((n=>n.id===selectedId?{...n,title}:n)));var title}}"
                />
              </label>
            </tut-composition-panel>
            <tut-composition-note-card
              tags='["json","attr"]'
              .props="${{note:selected,selected:!0}}"
            ></tut-composition-note-card>
          </div>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-styling-card",component:({note,accent},{html:tpl,css:cssFn,useStyle:style,unsafeCSS:unsafe})=>{style(shared.jW);const color=accent||"#029cfd";style(cssFn`
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
    `}})),SavedTicker=((0,core.E8)({tag:"tut-styling",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope,useRef:ref})=>{const[theme,setTheme]=state("light"),dark="dark"===theme,host=ref();(0,shared.AZ)(host.current,theme),style(shared.Qp),style(shared.jW),style(cssFn`
      .theme-bar {
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }
    `),scope({ThemedCard});return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 6</div>
        <h2>Styling with useStyle</h2>
        <p class="try"><strong>Try:</strong> Click Dark theme — the shell and cards invert. Click again for light. Page CSS does not leak in; tokens travel through CSS variables.</p>

        <div class="row theme-bar">
          <button id="theme" class="ghost" @click="${()=>setTheme(dark?"light":"dark")}">
            ${dark?"Light theme":"Dark theme"}
          </button>
          <span class="muted" id="theme-label">Theme: ${theme}</span>
        </div>

        <div class="list">
          ${shared.qt.map(((note,i)=>tpl`
              <tut-styling-card
                ?pinned="${note.pinned}"
                .props="${{note,accent:0===i?"#029cfd":1===i?"#7c3aed":"#15803d"}}"
              ></tut-styling-card>
            `))}
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-effects-memo-ticker",component:({savedAt},{html:tpl,css:cssFn,useStyle:style,useState:state,useEffect:effect})=>{style(shared.jW);const[seconds,setSeconds]=state(0);return effect((()=>{setSeconds(0);const id=setInterval((()=>setSeconds((s=>s+1))),1e3);return()=>clearInterval(id)}),[savedAt]),tpl`
      <span class="muted" id="ticker">Saved ${seconds}s ago</span>
    `}})),NotesBadge=((0,core.E8)({tag:"tut-effects-memo",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useEffect:effect,useMemo:memo,useScope:scope})=>{style(shared.jW),scope({SavedTicker});const[notes]=state(shared.qt.map((n=>({...n})))),[query,setQuery]=state(""),[savedAt,setSavedAt]=state(Date.now()),[showTicker,setShowTicker]=state(!0),[mountLogs,setMountLogs]=state(0);effect((()=>(setMountLogs((n=>n+1)),()=>{})),[]);const filtered=memo((()=>{const q=query.trim().toLowerCase();return q?notes.filter((n=>n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q))):notes}),[notes,query]),totalWords=memo((()=>notes.reduce(((sum,n)=>sum+(0,shared.e)(n.body)),0)),[notes]);return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 7</div>
        <h2>Effects, lifecycle, memoisation</h2>
        <p class="try"><strong>Try:</strong> 1) Search “hooks” — the match count drops to 1. 2) Unmount ticker — the interval is cleared (no more ticking).</p>

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
              @click="${()=>setShowTicker((v=>!v))}"
            >${showTicker?"Unmount ticker":"Mount ticker"}</button>
            ${showTicker?tpl`<tut-effects-memo-ticker savedAt="${savedAt}"></tut-effects-memo-ticker>`:tpl`<span class="muted" id="ticker-gone">Ticker unmounted (interval cleared)</span>`}
          </div>
          <div class="list" id="results">
            ${filtered.map((note=>tpl`
                <article class="card" data-id="${note.id}">
                  <div class="note-title">${note.title}</div>
                  <p class="note-body">${note.body}</p>
                </article>
              `))}
          </div>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-refs",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useRef:ref,querySelector})=>{style(shared.jW);const[notes,setNotes]=state(shared.qt.map((n=>({...n})))),[title,setTitle]=state(""),[selectedId,setSelectedId]=state(notes[0].id),renderCount=ref(0);renderCount.current+=1;const host=ref(),addAndFocus=()=>{const note=(0,shared.p4)({title:title||`Note ${notes.length+1}`,body:""});setNotes([note,...notes]),setSelectedId(note.id),setTitle("");const el=host.current;Promise.resolve(el?.updateComplete).then((()=>{querySelector("#title")?.focus()}))};return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 8</div>
        <h2>Refs and the DOM</h2>
        <p class="try"><strong>Try:</strong> Click New note — the title field stays focused. Watch the render count: refs change without extra renders.</p>

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

        <div class="list" id="note-list">
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
    `}}),(0,core.E8)({tag:"tut-use-store-badge",component:({notes,loading},{html:tpl,useStyle:style})=>{style(shared.jW);return tpl`
      <span class="badge" id="badge">
        ${(Array.isArray(notes)?notes:[]).length} shared notes${loading?" (loading)":""}
      </span>
    `}})),NotesPanel=(0,core.E8)({tag:"tut-use-store-panel",component:({notes,loading,draft,onDraft,onAdd},{html:tpl,useStyle:style})=>{style(shared.jW);const list=Array.isArray(notes)?notes:[],setDraft="function"==typeof onDraft?onDraft:()=>{},add="function"==typeof onAdd?onAdd:()=>{};return tpl`
      <div class="stack">
        <div class="row">
          <input
            id="note-title"
            placeholder="New note title"
            .value="${"string"==typeof draft?draft:""}"
            @input="${e=>setDraft(e.target.value)}"
            @keydown="${e=>{"Enter"===e.key&&add()}}"
          />
          <button id="add-note" @click="${add}">Add note</button>
          ${loading?tpl`<span class="muted" id="restoring">Restoring from IndexedDB…</span>`:null}
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
    `}}),EncryptedPanel=(0,core.E8)({tag:"tut-use-store-encrypted",component:({notes,loading,draft,onDraft,onAdd},{html:tpl,useStyle:style})=>{style(shared.jW);const list=Array.isArray(notes)?notes:[],setDraft="function"==typeof onDraft?onDraft:()=>{},add="function"==typeof onAdd?onAdd:()=>{};return tpl`
      <div class="stack">
        <p class="muted">
          Encrypted with key <kbd>dim-tutorial</kbd>. Lose the key, lose the data.
        </p>
        <div class="row">
          <input
            id="enc-title"
            placeholder="Secret note title"
            .value="${"string"==typeof draft?draft:""}"
            @input="${e=>setDraft(e.target.value)}"
            @keydown="${e=>{"Enter"===e.key&&add()}}"
          />
          <button id="add-enc" @click="${add}">Add encrypted note</button>
        </div>
        ${loading?tpl`<span class="muted" id="decrypting">Decrypting…</span>`:null}
        <div class="list">
          ${list.map((note=>tpl`
              <article class="card">
                <div class="note-title">${note.title}</div>
              </article>
            `))}
        </div>
      </div>
    `}}),NotesPane=((0,core.E8)({tag:"tut-use-store",component:(_,{html:tpl,useStyle:style,useScope:scope,useState:state,useStore:storeHook})=>{style(shared.jW),scope({NotesBadge,NotesPanel,EncryptedPanel});const store=storeHook({tutNotes:state(shared.qt.map((n=>({...n}))))}),encStore=storeHook({tutNotesEnc:state([])},{encryptionKey:"dim-tutorial"}),[notes,setNotes,notesLoading]=store.tutNotes,[encNotes,setEncNotes,encLoading]=encStore.tutNotesEnc,[draft,setDraft]=state(""),[encDraft,setEncDraft]=state(""),list=Array.isArray(notes)?notes:[],encList=Array.isArray(encNotes)?encNotes:[];return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 9</div>
        <h2>Global and persistent state</h2>
        <p class="try"><strong>Try:</strong> 1) Type a title and Add note — badge and list update. 2) Reload this story — plaintext notes remain. 3) Add an encrypted note on the right.</p>
        <div class="row" style="margin-bottom: 0.75rem">
          <tut-use-store-badge .props="${{notes:list,loading:notesLoading}}"></tut-use-store-badge>
          <span class="muted">Reload this story — plaintext notes remain.</span>
        </div>
        <div class="split">
          <div>
            <h3>Shared plaintext</h3>
            <tut-use-store-panel .props="${{notes:list,loading:notesLoading,draft,onDraft:setDraft,onAdd:()=>{setNotes([(0,shared.p4)({title:draft.trim()||`Shared ${list.length+1}`,body:"From the list panel."}),...list]),setDraft("")}}}"></tut-use-store-panel>
          </div>
          <div>
            <h3>Encrypted slice</h3>
            <tut-use-store-encrypted .props="${{notes:encList,loading:encLoading,draft:encDraft,onDraft:setEncDraft,onAdd:()=>{setEncNotes([(0,shared.p4)({title:encDraft.trim()||`Secret ${encList.length+1}`,body:"Ciphertext in IndexedDB."}),...encList]),setEncDraft("")}}}"></tut-use-store-encrypted>
          </div>
        </div>
      </div>
    `}}),(0,core.E8)({tag:"tut-view-transitions-pane",component:({view,note,notes,onOpen,onBack},{html:tpl,css:cssFn,useStyle:style})=>{if(style(shared.jW),style(cssFn`
      :host { display: block; min-height: 280px; }
      .hero {
        font-size: 1.4rem;
        margin-bottom: 0.5rem;
      }
    `),"detail"===view&&note)return tpl`
        <div class="stack">
          <button id="back" class="ghost" @click="${onBack}">← Back</button>
          <h2 class="hero" data-vt-shared="${`note-title-${note.id}`}">${note.title}</h2>
          <p class="note-body" data-vt-shared="${`note-body-${note.id}`}">${note.body}</p>
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
              <p class="note-body" data-vt-shared="${`note-body-${n.id}`}">${n.body}</p>
            </article>
          `))}
      </div>
    `}}));(0,core.E8)({tag:"tut-view-transitions",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useScope:scope})=>{style(shared.jW),scope({NotesPane});const notes=shared.qt,[selectedId,setSelectedId]=state(null),view=selectedId?"detail":"list",note=notes.find((n=>n.id===selectedId));return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 10</div>
        <h2>View transitions</h2>
        <p class="try"><strong>Try:</strong> 1) Click a note — the view slides to detail. 2) Click Back — title and body FLIP as shared elements.</p>
        <tut-view-transitions-pane
          transitionId="${selectedId?notes.findIndex((n=>n.id===selectedId))+1:0}"
          transitionDuration="450"
          .props="${{view,note,notes,onOpen:setSelectedId,onBack:()=>setSelectedId(null)}}"
        ></tut-view-transitions-pane>
      </div>
    `}});(0,core.E8)({tag:"tut-use-fs",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook,useFS})=>{style(shared.jW);const store=storeHook({tutNotes:state(shared.qt.map((n=>({...n}))))}),[notes,setNotes,notesLoading]=store.tutNotes,list=Array.isArray(notes)?notes:[],opfsAvailable=function hasOpfs(){return"undefined"!=typeof navigator&&!!navigator.storage?.getDirectory}(),fs=useFS({opfs:!0}),[files,setFiles]=state([]),[status,setStatus]=state(""),[error,setError]=state(""),canWrite=opfsAvailable&&fs?.isReady&&"function"==typeof fs.writeFile,refresh=async()=>{if(canWrite)try{const entries=await fs.listDirectory("notes");setFiles(entries.map((e=>e.name))),setError("")}catch(err){setFiles([])}else setError("OPFS is not available in this environment.")};return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 11</div>
        <h2>Files with useFS</h2>
        <p class="try"><strong>Try:</strong> 1) Click Export notes (needs a browser with OPFS). 2) Click Import on a listed file.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <span class="badge" id="fs-mode">mode: ${fs.fsMode||"…"}</span>
          <span class="badge" id="fs-ready">${canWrite?"ready":opfsAvailable?"init":"unavailable"}</span>
          <button id="export" @click="${async()=>{if(!canWrite)return setError("OPFS is not available in this environment."),void setStatus("");setStatus("Exporting…"),setError("");try{for(const note of list){const md=`# ${note.title}\n\n${note.body}\n`;await fs.writeFile(`${note.id}.md`,md,"notes")}await refresh(),setStatus(`Exported ${list.length} note(s) to OPFS notes/.`)}catch(err){setError(err?.message||String(err)),setStatus("")}}}" ?disabled="${!canWrite||notesLoading}">
            Export notes
          </button>
          <button id="refresh" class="ghost" @click="${refresh}" ?disabled="${!canWrite}">
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
                          <button class="ghost" @click="${()=>(async name=>{if(canWrite){setStatus("Importing…");try{const content=await fs.readFile(name,"notes"),text="string"==typeof content?content:"",[heading,...rest]=text.split("\n"),title=heading.replace(/^#\s*/,"").trim()||name,body=rest.join("\n").trim();setNotes([(0,shared.p4)({title,body,tags:["imported"]}),...list]),setStatus(`Imported ${name}`),setError("")}catch(err){setError(err?.message||String(err)),setStatus("")}}else setError("OPFS is not available in this environment.")})(name)}">Import</button>
                        </div>
                      `))}
                  </div>`}
          </div>
        </div>
      </div>
    `}});const FinalCard=(0,core.E8)({tag:"tut-final-app-card",component:({note,selected,onSelect},{html:tpl,css:cssFn,useStyle:style})=>{style(shared.jW),style(cssFn`
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
    `}}),FinalPane=(0,core.E8)({tag:"tut-final-app-pane",component:({view,notes,selected,onSelect,onBack,onSave,onExport,files,status,fsReady},{html:tpl,css:cssFn,useStyle:style,useScope:scope})=>{if(style(shared.jW),style(cssFn`
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
          <span class="muted">${(0,shared.e)(selected.body)} words</span>
        </div>
      `;return tpl`
      <div class="stack">
        <div class="list">
          ${(notes||[]).map((note=>tpl`
              <tut-final-app-card
                .props="${{note,selected:selected&&note.id===selected.id,onSelect}}"
              ></tut-final-app-card>
            `))}
        </div>
        <div class="row">
          <button id="export" @click="${onExport}" ?disabled="${!fsReady}">Export to OPFS</button>
          <span class="muted">${status||(files||[]).join(", ")}</span>
        </div>
      </div>
    `}});(0,core.E8)({tag:"tut-final-app",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useStore:storeHook,useScope:scope,useMemo:memo,useFS,useRef:ref,useEffect:effect})=>{const store=storeHook({tutNotes:state(shared.qt.map((n=>({...n})))),tutTheme:state("light")}),[storedNotes,setStoredNotes,notesLoading]=store.tutNotes,[storedTheme,setStoredTheme]=store.tutTheme,[notes,setNotesLocal]=state(shared.qt.map((n=>({...n})))),list=Array.isArray(notes)?notes:[],setNotes=next=>{setNotesLocal(next),setStoredNotes(next)},[theme,setTheme]=state("dark"===storedTheme?"dark":"light"),dark="dark"===theme,host=ref();(0,shared.AZ)(host.current,theme),effect((()=>{!notesLoading&&Array.isArray(storedNotes)&&setNotesLocal(storedNotes)}),[storedNotes,notesLoading]),effect((()=>{notesLoading||"dark"!==storedTheme&&"light"!==storedTheme||storedTheme!==theme&&setTheme(storedTheme)}),[storedTheme,notesLoading]),style(shared.Qp),style(shared.jW),scope({FinalPane,FinalCard});const[selectedId,setSelectedId]=state(null),[query,setQuery]=state(""),[files,setFiles]=state([]),[status,setStatus]=state(""),fs=useFS({opfs:!0}),filtered=memo((()=>{const q=query.trim().toLowerCase();return q?list.filter((n=>n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q))):list}),[list,query]),selected=list.find((n=>n.id===selectedId)),view=selected?"edit":"list",viewId=selected?list.findIndex((n=>n.id===selectedId))+1:0;return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 12</div>
        <h2>Dim Notes</h2>
        <p class="try"><strong>Try:</strong> 1) New note and edit title/body. 2) Search. 3) Dark — theme persists. 4) Open a note for the list ↔ detail slide.</p>
        <div class="row" style="margin-bottom: 0.75rem">
          <input
            id="search"
            placeholder="Search…"
            .value="${query}"
            @input="${e=>setQuery(e.target.value)}"
            style="max-width: 16rem"
          />
          <button id="add-note" @click="${()=>{const note=(0,shared.p4)({title:"Untitled",body:""});setNotes([note,...list]),setSelectedId(note.id)}}">New note</button>
          <button id="theme" class="ghost" @click="${()=>{const next=dark?"light":"dark";setTheme(next),setStoredTheme(next)}}">
            ${dark?"Light":"Dark"}
          </button>
          <span class="badge" id="count">${notesLoading?"Loading…":`${list.length} notes`}</span>
        </div>
        <tut-final-app-pane
          transitionId="${viewId}"
          transitionDuration="400"
          .props="${{view,notes:filtered,selected,onSelect:setSelectedId,onBack:()=>setSelectedId(null),onSave:next=>{setNotes(list.map((n=>n.id===next.id?{...next,updatedAt:Date.now()}:n)))},onExport:async()=>{if(fs?.isReady&&"function"==typeof fs.writeFile)try{for(const note of list)await fs.writeFile(`${note.id}.md`,`# ${note.title}\n\n${note.body}\n`,"notes");const entries=await fs.listDirectory("notes");setFiles(entries.map((e=>e.name))),setStatus(`Exported ${list.length} notes`)}catch(err){setStatus(err?.message||String(err))}else setStatus("File system not ready in this environment.")},files,status,fsReady:!!fs?.isReady}}"
        ></tut-final-app-pane>
      </div>
    `}});__webpack_require__("./src/stories/tutorial/advanced/13-react-interop.js");(0,core.E8)({tag:"tut-under-the-hood",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state,useMemo:memo,useRef:ref})=>{style(shared.jW),style(cssFn`
      pre {
        background: var(--tut-card, #f8fafc);
        border: 1px solid var(--tut-border, #e2e8f0);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        overflow: auto;
        font-size: 0.8rem;
      }
    `);const[count,setCount]=state(0),doubled=memo((()=>2*count),[count]),renders=ref(0);renders.current+=1;const host=ref(),hookSlots=Object.keys(host.current?.hooks||{}).sort(),hookIndex=host.current?.hookIndex??0;return tpl`
      <div class="shell">
        <div class="eyebrow">Advanced · Lesson 14</div>
        <h2>Under the hood</h2>
        <p class="try"><strong>Try:</strong> Click Increment — render count and hook slots update. Dim stores hooks on the host (no virtual DOM).</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="inc" @click="${()=>setCount(count+1)}">Increment</button>
          <span class="badge" id="count">count: ${count}</span>
          <span class="badge">doubled: ${doubled}</span>
        </div>

        <pre id="inspector">renders: ${renders.current}
hookIndex (after this render): ${hookIndex}
hook slots:
${hookSlots.map((k=>`  ${k}`)).join("\n")||"  (first paint)"}
host: ${host.current?.tagName||"…"}
        </pre>
      </div>
    `}}),(0,core.E8)({tag:"tut-pitfalls",component:(_,{html:tpl,css:cssFn,useStyle:style,useState:state})=>{style(shared.jW),style(cssFn`
      .wrong { border-color: #fecaca; }
      .right { border-color: #bbf7d0; }
      h3 { font-size: 1rem; }
    `);const[wrong,setWrong]=state(["Alpha","Beta"]),[right,setRight]=state(["Alpha","Beta"]),[tick,setTick]=state(0);return tpl`
      <div class="shell">
        <div class="eyebrow">Advanced · Lesson 15</div>
        <h2>Pitfalls and rules of hooks</h2>
        <p class="try"><strong>Try:</strong> 1) Push (mutate) — the count stays at 2. 2) Force re-render — mutated data finally shows. 3) Push (copy) — updates immediately.</p>

        <div class="split">
          <div class="card wrong">
            <h3>Wrong: mutate then set</h3>
            <p class="muted" id="wrong-count">Rendered items: ${wrong.length} · paint ${tick}</p>
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
            <p class="muted" id="right-count">Rendered items: ${right.length}</p>
            <button id="copy" @click="${()=>{setRight([...right,`Item ${right.length+1}`])}}">Push (copy)</button>
            <div class="list" style="margin-top: 0.5rem">
              ${right.map((item=>tpl`<div class="muted">${item}</div>`))}
            </div>
          </div>
        </div>
      </div>
    `}})},"./src/stories/tutorial/shared.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{AZ:()=>applyTheme,Qp:()=>themeStyles,e:()=>wordCount,jW:()=>lessonStyles,p4:()=>createNote,qt:()=>SEED_NOTES});var _core_index_ts__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/core/index.ts");const SEED_NOTES=[{id:"n-welcome",title:"Welcome to Dim Notes",body:"A tiny notes app that grows with each tutorial lesson.",pinned:!0,tags:["intro"],updatedAt:1},{id:"n-hooks",title:"Hooks feel familiar",body:"useState, useEffect, useMemo, useRef — same ideas, native custom elements.",pinned:!1,tags:["hooks"],updatedAt:2},{id:"n-store",title:"State that outlives the tab",body:"useStore persists to IndexedDB. Encryption is opt-in; there is no default password.",pinned:!1,tags:["store"],updatedAt:3}];function createNote(overrides={}){return{id:overrides.id||`n-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,title:overrides.title||"Untitled",body:overrides.body||"",pinned:!!overrides.pinned,tags:overrides.tags||[],updatedAt:overrides.updatedAt||Date.now()}}function wordCount(text){return(text||"").trim().split(/\s+/).filter(Boolean).length}const themeStyles=_core_index_ts__WEBPACK_IMPORTED_MODULE_0__.AH`
  :host,
  :host([data-theme="light"]) {
    --tut-bg: #ffffff;
    --tut-fg: #0f172a;
    --tut-card: #f8fafc;
    --tut-border: #e2e8f0;
    --tut-muted: #64748b;
    --tut-accent: #029cfd;
    --tut-accent-hover: #0278c7;
    --tut-danger: #dc3545;
    --tut-ok: #15803d;
    --tut-badge-bg: #e0f2fe;
    --tut-badge-fg: #075985;
  }

  :host([data-theme="dark"]) {
    --tut-bg: #0b1220;
    --tut-fg: #e2e8f0;
    --tut-card: #111827;
    --tut-border: #1f2937;
    --tut-muted: #94a3b8;
    --tut-accent: #38bdf8;
    --tut-accent-hover: #7dd3fc;
    --tut-danger: #f87171;
    --tut-ok: #4ade80;
    --tut-badge-bg: #0c4a6e;
    --tut-badge-fg: #e0f2fe;
  }
`,lessonStyles=_core_index_ts__WEBPACK_IMPORTED_MODULE_0__.AH`
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    color: var(--tut-fg, #0f172a);
    background: var(--tut-bg, #ffffff);
    line-height: 1.45;
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    max-width: 920px;
    margin: 0 auto;
    padding: 1.25rem;
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 12px;
    background: var(--tut-bg, #fff);
    color: var(--tut-fg, #0f172a);
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tut-accent, #029cfd);
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  h1,
  h2,
  h3 {
    margin: 0 0 0.5rem;
    color: var(--tut-fg, #0f172a);
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--tut-muted, #64748b);
  }

  .try {
    margin: 0 0 1rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    background: var(--tut-card, #f8fafc);
    border: 1px dashed var(--tut-border, #e2e8f0);
    color: var(--tut-fg, #0f172a);
    font-size: 0.9rem;
  }

  .try strong {
    color: var(--tut-accent, #029cfd);
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
    background: var(--tut-accent, #029cfd);
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
    background: var(--tut-accent-hover, #0278c7);
  }

  button:disabled,
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  button.ghost {
    background: transparent;
    color: var(--tut-fg, #0f172a);
    border: 1px solid var(--tut-border, #e2e8f0);
  }

  button.ghost:hover {
    background: var(--tut-card, #f8fafc);
  }

  button.danger {
    background: var(--tut-danger, #dc3545);
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 6px;
    font: inherit;
    background: var(--tut-bg, #fff);
    color: inherit;
  }

  textarea {
    min-height: 7rem;
    resize: vertical;
  }

  .card {
    background: var(--tut-card, #f8fafc);
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    color: var(--tut-fg, #0f172a);
  }

  .card.selected,
  .card.active {
    border-color: var(--tut-accent, #029cfd);
    box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
  }

  .card.pinned {
    border-left: 4px solid var(--tut-accent, #029cfd);
  }

  .muted {
    color: var(--tut-muted, #64748b);
    font-size: 0.85rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--tut-badge-bg, #e0f2fe);
    color: var(--tut-badge-fg, #075985);
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
    color: var(--tut-muted, #64748b);
    white-space: pre-wrap;
  }

  .status {
    font-size: 0.85rem;
    color: var(--tut-ok, #15803d);
  }

  .status.error {
    color: var(--tut-danger, #dc3545);
  }

  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8em;
    background: var(--tut-card, #f8fafc);
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 4px;
    padding: 0.05rem 0.3rem;
  }
`;function applyTheme(host,theme){host&&"function"==typeof host.setAttribute&&host.setAttribute("data-theme","dark"===theme?"dark":"light")}}}]);
//# sourceMappingURL=738.52f10a03.iframe.bundle.js.map