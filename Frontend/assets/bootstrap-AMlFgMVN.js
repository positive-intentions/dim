import{r as d}from"./__federation_shared_react-BChr2Uhh.js";import{r as _}from"./__federation_shared_react-dom-9lRLKTWe.js";import{useState as x,useEffect as m,useMemo as y,x as v,define as g}from"./__federation_expose_Dim-D87w0KSd.js";var l={exports:{}},c={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var E=d,R=Symbol.for("react.element"),b=Symbol.for("react.fragment"),j=Object.prototype.hasOwnProperty,O=E.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,$={key:!0,ref:!0,__self:!0,__source:!0};function f(r,t,o){var e,n={},s=null,i=null;o!==void 0&&(s=""+o),t.key!==void 0&&(s=""+t.key),t.ref!==void 0&&(i=t.ref);for(e in t)j.call(t,e)&&!$.hasOwnProperty(e)&&(n[e]=t[e]);if(r&&r.defaultProps)for(e in t=r.defaultProps,t)n[e]===void 0&&(n[e]=t[e]);return{$$typeof:R,type:r,key:s,ref:i,props:n,_owner:O.current}}c.Fragment=b;c.jsx=f;c.jsxs=f;l.exports=c;var u=l.exports,p,a=_;p=a.createRoot,a.hydrateRoot;const h=function({children:r,initialstate:t=0}){const[o,e]=x(parseInt(t),"test-state");m(()=>(console.log("Button mounted"),()=>{console.log("Button unmounted")}),[],"test-mount-effect"),m(()=>{console.log("count effect triggered")},[o()],"test-effect");const n=y(()=>{const s=o()*2;return console.log("memo calculation triggered:",s),s},[o()],"test-memo");return v`
        <button @click="${()=>e(o()+1)}">
            ${r}
            ${o()}
            ${n}
        </button>
    `};g({tag:"my-button",component:h});const k=()=>u.jsx("div",{children:u.jsx("my-button",{id:"aaa",initialstate:"33",children:"positive-intentions"})}),S=document.getElementById("app"),B=p(S);B.render(u.jsx(k,{}));
