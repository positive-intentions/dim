const d=new Set(["Module","__esModule","default","_export_sfc"]);let a={"./Dim":()=>(l([],!1,"./Dim"),f("./__federation_expose_Dim-Ezem4zve.js").then(e=>Object.keys(e).every(n=>d.has(n))?()=>e.default:()=>e))};const c={},l=(e,n,i)=>{const o=import.meta.url;if(typeof o>"u"){console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".');return}const _=o.substring(0,o.lastIndexOf("vite-remoteEntry.js"));e.forEach(r=>{const t=_+r;if(!(t in c))if(c[t]=!0,n){const s="css__dim__"+i;window[s]==null&&(window[s]=[]),window[s].push(t)}else{const s=document.head.appendChild(document.createElement("link"));s.href=t,s.rel="stylesheet"}})};async function f(e){return import(e)}const h=e=>{if(!a[e])throw new Error("Can not find remote module "+e);return a[e]()},u=e=>{globalThis.__federation_shared__=globalThis.__federation_shared__||{},Object.entries(e).forEach(([n,i])=>{const o=Object.keys(i)[0],_=Object.values(i)[0],r=_.scope||"default";globalThis.__federation_shared__[r]=globalThis.__federation_shared__[r]||{};const t=globalThis.__federation_shared__[r];(t[n]=t[n]||{})[o]=_})};export{l as dynamicLoadingCss,h as get,u as init};
