/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const N=globalThis,z=N.ShadowRoot&&(N.ShadyCSS===void 0||N.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,nt=Symbol(),q=new WeakMap;let _t=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==nt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(z&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=q.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&q.set(e,t))}return t}toString(){return this.cssText}};const mt=o=>new _t(typeof o=="string"?o:o+"",void 0,nt),gt=(o,t)=>{if(z)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),n=N.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=e.cssText,o.appendChild(s)}},W=z?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return mt(e)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:yt,defineProperty:St,getOwnPropertyDescriptor:At,getOwnPropertyNames:vt,getOwnPropertySymbols:Et,getPrototypeOf:bt}=Object,O=globalThis,F=O.trustedTypes,wt=F?F.emptyScript:"",Ct=O.reactiveElementPolyfillSupport,w=(o,t)=>o,D={toAttribute(o,t){switch(t){case Boolean:o=o?wt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},ot=(o,t)=>!yt(o,t),J={attribute:!0,type:String,converter:D,reflect:!1,hasChanged:ot};Symbol.metadata??=Symbol("metadata"),O.litPropertyMetadata??=new WeakMap;class A extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=J){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),n=this.getPropertyDescriptor(t,s,e);n!==void 0&&St(this.prototype,t,n)}}static getPropertyDescriptor(t,e,s){const{get:n,set:i}=At(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get(){return n?.call(this)},set(r){const c=n?.call(this);i.call(this,r),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??J}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const t=bt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const e=this.properties,s=[...vt(e),...Et(e)];for(const n of s)this.createProperty(n,e[n])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,n]of e)this.elementProperties.set(s,n)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const n=this._$Eu(e,s);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const n of s)e.unshift(W(n))}else t!==void 0&&e.push(W(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return gt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EC(t,e){const s=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,s);if(n!==void 0&&s.reflect===!0){const i=(s.converter?.toAttribute!==void 0?s.converter:D).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(n):this.setAttribute(n,i),this._$Em=null}}_$AK(t,e){const s=this.constructor,n=s._$Eh.get(t);if(n!==void 0&&this._$Em!==n){const i=s.getPropertyOptions(n),r=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:D;this._$Em=n,this[n]=r.fromAttribute(e,i.type),this._$Em=null}}requestUpdate(t,e,s){if(t!==void 0){if(s??=this.constructor.getPropertyOptions(t),!(s.hasChanged??ot)(this[t],e))return;this.P(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$ET())}P(t,e,s){this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[n,i]of s)i.wrapped!==!0||this._$AL.has(n)||this[n]===void 0||this.P(n,this[n],i)}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EU()}catch(s){throw t=!1,this._$EU(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach(e=>this._$EC(e,this[e])),this._$EU()}updated(t){}firstUpdated(t){}}A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[w("elementProperties")]=new Map,A[w("finalized")]=new Map,Ct?.({ReactiveElement:A}),(O.reactiveElementVersions??=[]).push("2.0.4");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const B=globalThis,H=B.trustedTypes,Z=H?H.createPolicy("lit-html",{createHTML:o=>o}):void 0,it="$lit$",f=`lit$${Math.random().toFixed(9).slice(2)}$`,rt="?"+f,xt=`<${rt}>`,y=document,x=()=>y.createComment(""),k=o=>o===null||typeof o!="object"&&typeof o!="function",ht=Array.isArray,kt=o=>ht(o)||typeof o?.[Symbol.iterator]=="function",I=`[ 	
\f\r]`,b=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,K=/-->/g,G=/>/g,_=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Q=/'/g,X=/"/g,ct=/^(?:script|style|textarea|title)$/i,v=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Y=new WeakMap,g=y.createTreeWalker(y,129);function at(o,t){if(!Array.isArray(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return Z!==void 0?Z.createHTML(t):t}const Pt=(o,t)=>{const e=o.length-1,s=[];let n,i=t===2?"<svg>":"",r=b;for(let c=0;c<e;c++){const h=o[c];let l,a,d=-1,p=0;for(;p<h.length&&(r.lastIndex=p,a=r.exec(h),a!==null);)p=r.lastIndex,r===b?a[1]==="!--"?r=K:a[1]!==void 0?r=G:a[2]!==void 0?(ct.test(a[2])&&(n=RegExp("</"+a[2],"g")),r=_):a[3]!==void 0&&(r=_):r===_?a[0]===">"?(r=n??b,d=-1):a[1]===void 0?d=-2:(d=r.lastIndex-a[2].length,l=a[1],r=a[3]===void 0?_:a[3]==='"'?X:Q):r===X||r===Q?r=_:r===K||r===G?r=b:(r=_,n=void 0);const $=r===_&&o[c+1].startsWith("/>")?" ":"";i+=r===b?h+xt:d>=0?(s.push(l),h.slice(0,d)+it+h.slice(d)+f+$):h+f+(d===-2?c:$)}return[at(o,i+(o[e]||"<?>")+(t===2?"</svg>":"")),s]};class P{constructor({strings:t,_$litType$:e},s){let n;this.parts=[];let i=0,r=0;const c=t.length-1,h=this.parts,[l,a]=Pt(t,e);if(this.el=P.createElement(l,s),g.currentNode=this.el.content,e===2){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=g.nextNode())!==null&&h.length<c;){if(n.nodeType===1){if(n.hasAttributes())for(const d of n.getAttributeNames())if(d.endsWith(it)){const p=a[r++],$=n.getAttribute(d).split(f),R=/([.?@])?(.*)/.exec(p);h.push({type:1,index:i,name:R[2],strings:$,ctor:R[1]==="."?Tt:R[1]==="?"?Rt:R[1]==="@"?Nt:L}),n.removeAttribute(d)}else d.startsWith(f)&&(h.push({type:6,index:i}),n.removeAttribute(d));if(ct.test(n.tagName)){const d=n.textContent.split(f),p=d.length-1;if(p>0){n.textContent=H?H.emptyScript:"";for(let $=0;$<p;$++)n.append(d[$],x()),g.nextNode(),h.push({type:2,index:++i});n.append(d[p],x())}}}else if(n.nodeType===8)if(n.data===rt)h.push({type:2,index:i});else{let d=-1;for(;(d=n.data.indexOf(f,d+1))!==-1;)h.push({type:7,index:i}),d+=f.length-1}i++}}static createElement(t,e){const s=y.createElement("template");return s.innerHTML=t,s}}function E(o,t,e=o,s){if(t===v)return t;let n=s!==void 0?e._$Co?.[s]:e._$Cl;const i=k(t)?void 0:t._$litDirective$;return n?.constructor!==i&&(n?._$AO?.(!1),i===void 0?n=void 0:(n=new i(o),n._$AT(o,e,s)),s!==void 0?(e._$Co??=[])[s]=n:e._$Cl=n),n!==void 0&&(t=E(o,n._$AS(o,t.values),n,s)),t}class Ut{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,n=(t?.creationScope??y).importNode(e,!0);g.currentNode=n;let i=g.nextNode(),r=0,c=0,h=s[0];for(;h!==void 0;){if(r===h.index){let l;h.type===2?l=new U(i,i.nextSibling,this,t):h.type===1?l=new h.ctor(i,h.name,h.strings,this,t):h.type===6&&(l=new Ht(i,this,t)),this._$AV.push(l),h=s[++c]}r!==h?.index&&(i=g.nextNode(),r++)}return g.currentNode=y,n}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class U{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,n){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),k(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==v&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):kt(t)?this.k(t):this._(t)}S(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.S(t))}_(t){this._$AH!==u&&k(this._$AH)?this._$AA.nextSibling.data=t:this.T(y.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,n=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=P.createElement(at(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===n)this._$AH.p(e);else{const i=new Ut(n,this),r=i.u(this.options);i.p(e),this.T(r),this._$AH=i}}_$AC(t){let e=Y.get(t.strings);return e===void 0&&Y.set(t.strings,e=new P(t)),e}k(t){ht(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,n=0;for(const i of t)n===e.length?e.push(s=new U(this.S(x()),this.S(x()),this,this.options)):s=e[n],s._$AI(i),n++;n<e.length&&(this._$AR(s&&s._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class L{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,n,i){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,n){const i=this.strings;let r=!1;if(i===void 0)t=E(this,t,e,0),r=!k(t)||t!==this._$AH&&t!==v,r&&(this._$AH=t);else{const c=t;let h,l;for(t=i[0],h=0;h<i.length-1;h++)l=E(this,c[s+h],e,h),l===v&&(l=this._$AH[h]),r||=!k(l)||l!==this._$AH[h],l===u?t=u:t!==u&&(t+=(l??"")+i[h+1]),this._$AH[h]=l}r&&!n&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Tt extends L{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}}class Rt extends L{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}}class Nt extends L{constructor(t,e,s,n,i){super(t,e,s,n,i),this.type=5}_$AI(t,e=this){if((t=E(this,t,e,0)??u)===v)return;const s=this._$AH,n=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==u&&(s===u||n);n&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Ht{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}}const Ot=B.litHtmlPolyfillSupport;Ot?.(P,U),(B.litHtmlVersions??=[]).push("3.1.4");const Lt=(o,t,e)=>{const s=e?.renderBefore??t;let n=s._$litPart$;if(n===void 0){const i=e?.renderBefore??null;s._$litPart$=n=new U(t.insertBefore(x(),i),i,void 0,e??{})}return n._$AI(o),n};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class C extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Lt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}}C._$litElement$=!0,C.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:C});const It=globalThis.litElementPolyfillSupport;It?.({LitElement:C});(globalThis.litElementVersions??=[]).push("4.0.6");const M=globalThis,Mt=M.ShadowRoot&&(M.ShadyCSS===void 0||M.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,V=Symbol(),tt=new WeakMap;class lt{constructor(t,e,s){if(this._$cssResult$=!0,s!==V)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this._strings=e}get styleSheet(){let t=this._styleSheet;const e=this._strings;if(Mt&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=tt.get(e)),t===void 0&&((this._styleSheet=t=new CSSStyleSheet).replaceSync(this.cssText),s&&tt.set(e,t))}return t}toString(){return this.cssText}}const Dt=o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${o}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},jt=o=>new lt(typeof o=="string"?o:String(o),void 0,V),zt=(o,...t)=>{const e=o.length===1?o[0]:t.reduce((s,n,i)=>s+Dt(n)+o[i+1],o[0]);return new lt(e,o,V)},Bt=(o,...t)=>({_$litType$:1,strings:o,values:t});function Vt(o){const t={};return(e,s)=>{t[e]!==void 0&&clearTimeout(t[e]),t[e]=window.setTimeout(()=>{window.dispatchEvent(new CustomEvent(e,{detail:s})),t[e]=void 0},o)}}const dt=Vt(10);let m;const qt="DimDatabase",S="DimStore";class ut{constructor(){this.openDatabase()}async openDatabase(){return new Promise((t,e)=>{let s=indexedDB.open(qt,1);s.onupgradeneeded=function(n){m=n.target.result,m.objectStoreNames.contains(S)||m.createObjectStore(S,{keyPath:"id"})},s.onsuccess=function(n){m=n.target.result,t(m)},s.onerror=function(n){e("Error opening database: "+n.target.error)}})}async writeValue(t,e){return new Promise((s,n)=>{let r=m.transaction([S],"readwrite").objectStore(S);const c=btoa(JSON.stringify({payload:e}));let h=r.put({id:t,value:c});h.onsuccess=function(l){s("Value written successfully")},h.onerror=function(l){n("Error writing value: "+l.target.error)}})}async readValue(t,e){return new Promise((s,n)=>{let c=m.transaction([S],"readonly").objectStore(S).get(t);c.onsuccess=function(h){if(c.result){const l=JSON.parse(atob(c.result.value)).payload;s({value:l,newState:e})}else s(null)},c.onerror=function(h){n("Error reading value: "+h.target.error)}})}loadFromDatabase=t=>{const e=(s,n)=>{Object.keys(s).forEach(i=>{typeof s[i]=="object"&&s[i].length===void 0?e(s[i],`${n}${i}.`):this.readValue(`${n}${i}`,s[i]).then(r=>{r&&dt(`${n}${i}`,r.value)}).catch(console.error)})};e(t,"")}}class Wt{constructor(){this.store={},this.eventListener=[],this.db=new ut}generateListener(t){const{listenerId:e,key:s,value:n}=t,i=this.eventListener.find(a=>a.listenerId===e),r=`${s}`;i&&(window.removeEventListener(r,i.listener),this.eventListener=this.eventListener.filter(a=>a.listenerId!==e));const c=a=>{n[1](a.detail),this.store={...this.store,[s]:a.detail}};window.addEventListener(r,c),this.eventListener.push({listenerId:e,listener:c});const h=a=>{this.db.writeValue(s,a).catch(console.error),dt(r,a)};return[this.store[s]||n[0],h]}removeListeners(t){const e=this.eventListener.find(s=>s.listenerId===t);e&&(window.removeEventListener(`${e.key}`,e.listener),this.eventListener=this.eventListener.filter(s=>s.listenerId!==t))}createListeners=(t,e)=>{const s=(n,i)=>{Object.keys(n).forEach(r=>{if(typeof n[r]=="object"&&n[r].length===void 0)s(n[r],`${i}${r}.`);else{const[c,h]=this.generateListener({listenerId:e,key:`${i}${r}`,value:n[r]});n[r]=[c,h].concat(n[r])}})};s(t,"")}}let j=null;function et(o){j=o}function T(){if(!j)throw new Error("Hooks can only be called inside a component.");return j}function pt({tag:o,component:t}){class e extends C{static get properties(){return{props:{type:Object}}}constructor(){super(),this.hookIndex=0,this.hooks={}}render(){this.hookIndex=0,et(this);const n=Array.from(this.attributes).reduce((l,a)=>(l[a.name]=a.value,l),{});this.props=this.props||{};const i=this.shadowRoot?.querySelector.bind(this.shadowRoot),c={useState:$t,useEffect:ft,useMemo:Ft,useScope:Jt,useStyle:Zt,useStore:Qt,html:Bt,css:zt,useRef:Kt,querySelector:i,getRef:l=>{const a=i(l),d=Object.keys(a.hooks).find(p=>!!a.hooks[p].current)||"";return a.hooks[d].current}},h=t({...n,...this.props,children:this.innerHTML},c);return et(null),h}}window.customElements.define(o,e)}function $t(o){const t=T(),s=`hook-${t.hookIndex++}`;t.hooks[s]||(t.hooks[s]=o);const n=i=>{const r=typeof i=="function"?i(t.hooks[s]):i;t.hooks[s]=r,t.requestUpdate()};return[t.hooks[s],n]}function ft(o,t){const e=T(),n=`hook-${e.hookIndex++}`,i=e.hooks[n]?.dependencies;if(!i||t.some((c,h)=>c!==i[h])){e.hooks[n]?.cleanup&&e.hooks[n].cleanup();const c=o();e.hooks[n]={dependencies:t,cleanup:c}}e.addController({hostDisconnected(){e.hooks[n]?.cleanup&&e.hooks[n].cleanup()}})}function Ft(o,t){const e=T(),n=`hook-${e.hookIndex++}`,i=e.hooks[n]?.dependencies;return(!i||t.some((c,h)=>c!==i[h]))&&(e.hooks[n]={value:o(),dependencies:t}),e.hooks[n].value}function Jt(o){Object.keys(o).forEach(t=>{const e=o[t];customElements.get(t)||pt({tag:t,component:e})})}function Zt(o){const t=T();if(!t._stylesApplied){t._stylesApplied=!0;const e=document.createElement("style");e.textContent=jt(o).cssText,t.shadowRoot.appendChild(e)}}const Yt=(o,t)=>{t.then(e=>{const s=new Function(`return ${e}`)();customElements.get(o)||pt({tag:o,component:s})})};function Kt(){const o=T(),e=`hook-${o.hookIndex++}`;return o.hooks[e]||(o.hooks[e]={current:o}),o.hooks[e]}const st=new Wt,Gt=new ut,Qt=o=>{const[t]=$t(crypto.getRandomValues(new Uint8Array(8)));return st.createListeners(o,t),ft(()=>(Gt.loadFromDatabase(o),()=>{st.removeListeners(t)}),[]),o};export{pt as define,ft as useEffect,Yt as useLazyScope,Ft as useMemo,Kt as useRef,Jt as useScope,$t as useState,Qt as useStore,Zt as useStyle};