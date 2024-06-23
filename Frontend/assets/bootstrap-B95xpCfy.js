import{r as f}from"./__federation_shared_react-BChr2Uhh.js";import{r as d}from"./__federation_shared_react-dom-9lRLKTWe.js";import{useState as _,useEffect as x,useMemo as y,x as v,define as E}from"./__federation_expose_Dim-D87w0KSd.js";var m={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R=f,b=Symbol.for("react.element"),j=Symbol.for("react.fragment"),O=Object.prototype.hasOwnProperty,$=R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,g={key:!0,ref:!0,__self:!0,__source:!0};function l(r,t,o){var e,n={},s=null,i=null;o!==void 0&&(s=""+o),t.key!==void 0&&(s=""+t.key),t.ref!==void 0&&(i=t.ref);for(e in t)O.call(t,e)&&!g.hasOwnProperty(e)&&(n[e]=t[e]);if(r&&r.defaultProps)for(e in t=r.defaultProps,t)n[e]===void 0&&(n[e]=t[e]);return{$$typeof:b,type:r,key:s,ref:i,props:n,_owner:$.current}}u.Fragment=j;u.jsx=l;u.jsxs=l;m.exports=u;var c=m.exports,p,a=d;p=a.createRoot,a.hydrateRoot;const h=function({children:r,initialstate:t=0}){const[o,e]=_(parseInt(t),"test-state");x(()=>(console.log("Button mounted"),()=>{console.log("Button unmounted")}),[o()],"test-effect");const n=y(()=>{const s=o()*2;return console.log("memo calculation",s),s},[o()],"test-memo");return v`
        <button @click="${()=>e(o()+1)}">
            ${r}
            ${o()}
            ${n}
        </button>
    `};E({tag:"my-button",component:h});const k=()=>c.jsx("div",{children:c.jsx("my-button",{id:"aaa",initialstate:"33",children:"positive-intentions"})}),S=document.getElementById("app"),B=p(S);B.render(c.jsx(k,{}));
