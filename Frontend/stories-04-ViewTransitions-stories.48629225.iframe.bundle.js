"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[277],{"./src/stories/04-ViewTransitions.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{AdvancedNavigation:()=>_04_ViewTransitions_stories_AdvancedNavigation,AnimationShowcase:()=>AnimationShowcase,AutomaticTransitions:()=>AutomaticTransitions,ImageGallery:()=>ImageGallery,PageNavigation:()=>PageNavigation,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_04_ViewTransitions_stories});var react=__webpack_require__("./node_modules/react/index.js"),dim=__webpack_require__("./src/core/dim.ts");const ViewTransitionsGallery=(props,{useState,useEffect,useStyle,useViewTransition,html,css,keyed})=>{const[currentIndex,setCurrentIndex]=useState(0),transition=useViewTransition(currentIndex.toString(),{duration:500,autoDirection:!0}),images=[{id:1,emoji:"🏔️",title:"Mountain Vista",bg:"#dbeafe"},{id:2,emoji:"🌊",title:"Ocean Waves",bg:"#cffafe"},{id:3,emoji:"🌲",title:"Forest Path",bg:"#dcfce7"},{id:4,emoji:"🏜️",title:"Desert Sunset",bg:"#fef3c7"},{id:5,emoji:"🌃",title:"City Lights",bg:"#ede9fe"}];useStyle(css`
    /* Include view transition styles */
    ${dim.fZ}
    
    .gallery-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .gallery-title {
      text-align: center;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 2rem;
      color: #333;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      background: #000;
    }

    .main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transform: translateX(0);
    }

    .slide-emoji {
      font-size: 9rem;
      line-height: 1;
      user-select: none;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .nav-button:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
    }

    .nav-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    .prev-button {
      left: 15px;
    }

    .next-button {
      right: 15px;
    }

    .image-title {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .thumbnail-container {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .thumbnail {
      width: 80px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      background: #e9ecef;
      border-radius: 4px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .thumbnail:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    .thumbnail.active {
      border-color: #029cfd;
      opacity: 1;
      transform: scale(1.1);
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .control-button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .control-button:hover {
      background: #0278c7;
    }

    .control-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .indicator-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ccc;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dot.active {
      background: #029cfd;
      transform: scale(1.2);
    }

    .dot:hover {
      background: #029cfd;
    }

    @media (max-width: 768px) {
      .gallery-container {
        padding: 1rem;
      }

      .main-image-container {
        height: 300px;
      }

      .nav-button {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }

      .thumbnail {
        width: 60px;
        height: 45px;
      }

      .controls {
        flex-direction: column;
        align-items: center;
      }
    }
  `);const nextImage=()=>{transition.isTransitioning||setCurrentIndex((prev=>(prev+1)%images.length))},prevImage=()=>{transition.isTransitioning||setCurrentIndex((prev=>(prev-1+images.length)%images.length))},goToImage=index=>{transition.isTransitioning||index===currentIndex||setCurrentIndex(index)};useEffect((()=>{const interval=setInterval((()=>{transition.isTransitioning||nextImage()}),4e3);return()=>clearInterval(interval)}),[transition.isTransitioning]);const previousIndex=transition.isTransitioning&&null!==transition.previousId&&void 0!==transition.previousId?parseInt(transition.previousId,10):null,outgoingImage=null!==previousIndex&&images[previousIndex]?images[previousIndex]:null;return html`
    <div class="gallery-container">
      <h2 class="gallery-title">🖼️ View Transitions Gallery</h2>
      
      <div class="main-image-container view-transition-container">
        ${outgoingImage?keyed(previousIndex,html`
          <div
            class="${transition.getOutgoingClass("main-image")}"
            style="background:${outgoingImage.bg}"
            role="img"
            aria-label="${outgoingImage.title}"
          >
            <span class="slide-emoji">${outgoingImage.emoji}</span>
          </div>
        `):""}

        ${keyed(currentIndex,html`
          <div
            class="${transition.getIncomingClass("main-image")}"
            style="background:${images[currentIndex].bg}"
            role="img"
            aria-label="${images[currentIndex].title}"
          >
            <span class="slide-emoji">${images[currentIndex].emoji}</span>
          </div>
        `)}
        
        <button 
          class="nav-button prev-button" 
          @click="${prevImage}"
          ?disabled="${transition.isTransitioning}"
        >‹</button>
        
        <button 
          class="nav-button next-button" 
          @click="${nextImage}"
          ?disabled="${transition.isTransitioning}"
        >›</button>
        
        <div class="image-title">
          ${images[currentIndex].title}
        </div>
      </div>

      <div class="indicator-dots">
        ${images.map(((_,index)=>html`
          <div 
            class="dot ${index===currentIndex?"active":""}"
            @click="${()=>goToImage(index)}"
          ></div>
        `))}
      </div>

      <div class="thumbnail-container">
        ${images.map(((image,index)=>html`
          <div 
            class="thumbnail ${index===currentIndex?"active":""}"
            role="button"
            aria-label="${image.title}"
            @click="${()=>goToImage(index)}"
          >${image.emoji}</div>
        `))}
      </div>

      <div class="controls">
        <button class="control-button" @click="${prevImage}" ?disabled="${transition.isTransitioning}">
          ⏮️ Previous
        </button>
        <button class="control-button" @click="${nextImage}" ?disabled="${transition.isTransitioning}">
          Next ⏭️
        </button>
      </div>
      
      <!-- Debug info for the new view transitions API -->
      <div style="margin-top: 2rem; padding: 1rem; background: #e9ecef; border-radius: 8px; font-size: 0.875rem;">
        <strong>🔧 View Transitions Debug:</strong><br>
        Transitioning: ${transition.isTransitioning}<br>
        Direction: ${transition.direction}<br>
        Current ID: ${transition.currentId}<br>
        Previous ID: ${transition.previousId}<br>
        Classes: ${transition.getTransitionClasses("debug")}
      </div>
    </div>
  `};(0,dim.E8)({tag:"view-transitions-gallery",component:ViewTransitionsGallery});const SimpleGallery=(props,{useState,useEffect,useStyle,html,css})=>{const[currentIndex,setCurrentIndex]=useState(0),images=[{id:1,emoji:"🏔️",title:"Mountain Vista",bg:"#dbeafe"},{id:2,emoji:"🌊",title:"Ocean Waves",bg:"#cffafe"},{id:3,emoji:"🌲",title:"Forest Path",bg:"#dcfce7"},{id:4,emoji:"🏜️",title:"Desert Sunset",bg:"#fef3c7"},{id:5,emoji:"🌃",title:"City Lights",bg:"#ede9fe"}];useStyle(css`
    .gallery-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .gallery-title {
      text-align: center;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 2rem;
      color: #333;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      background: #000;
    }

    .main-image {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .nav-button:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
    }

    .prev-button {
      left: 15px;
    }

    .next-button {
      right: 15px;
    }

    .image-title {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .thumbnail-container {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .thumbnail {
      width: 80px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      background: #e9ecef;
      border-radius: 4px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .thumbnail:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    .thumbnail.active {
      border-color: #029cfd;
      opacity: 1;
      transform: scale(1.1);
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .control-button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .control-button:hover {
      background: #0278c7;
    }

    .syntax-example {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #e9ecef;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .syntax-title {
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
    }

    @media (max-width: 768px) {
      .gallery-container {
        padding: 1rem;
      }

      .main-image-container {
        height: 300px;
      }

      .nav-button {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }

      .thumbnail {
        width: 60px;
        height: 45px;
      }
    }
  `);const nextImage=()=>{setCurrentIndex((prev=>(prev+1)%images.length))};return useEffect((()=>{const interval=setInterval((()=>{nextImage()}),4e3);return()=>clearInterval(interval)}),[]),html`
    <div class="gallery-container">
      <h2 class="gallery-title">🚀 Auto View Transitions Gallery</h2>
      
      <!-- The magic happens here: just add transitionId prop! -->
      <simple-image 
        transitionId="${currentIndex}"
        transitionDuration="500"
        emoji="${images[currentIndex].emoji}"
        title="${images[currentIndex].title}"
        bg="${images[currentIndex].bg}"
      ></simple-image>

      <div class="thumbnail-container">
        ${images.map(((image,index)=>html`
          <div 
            class="thumbnail ${index===currentIndex?"active":""}"
            role="button"
            aria-label="${image.title}"
            @click="${()=>(index=>{index!==currentIndex&&setCurrentIndex(index)})(index)}"
          >${image.emoji}</div>
        `))}
      </div>

      <div class="controls">
        <button class="control-button" @click="${()=>{setCurrentIndex((prev=>(prev-1+images.length)%images.length))}}">
          ⏮️ Previous
        </button>
        <button class="control-button" @click="${nextImage}">
          Next ⏭️
        </button>
      </div>

      <div class="syntax-example">
        <div class="syntax-title">✨ Framework Magic - No Manual Transition Code!</div>
        <div>
          &lt;simple-image <br>
          &nbsp;&nbsp;transitionId="\${currentIndex}"<br>
          &nbsp;&nbsp;transitionDuration="500"<br>
          &nbsp;&nbsp;emoji="\${image.emoji}"<br>
          &nbsp;&nbsp;title="\${image.title}"<br>
          &gt;&lt;/simple-image&gt;
        </div>
        <br>
        <div><strong>That's it!</strong> The framework automatically handles:</div>
        <div>• Transition detection when transitionId changes</div>
        <div>• Direction calculation (left/right based on ID comparison)</div>
        <div>• CSS class application</div>
        <div>• Wrapper elements</div>
        <div>• Animation timing</div>
      </div>
    </div>
  `};(0,dim.E8)({tag:"simple-gallery",component:SimpleGallery}),(0,dim.E8)({tag:"simple-image",component:(props,{html})=>{const{emoji,title,bg}=props;return html`
    <div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden; background: ${bg||"#dbeafe"}; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 9rem; line-height: 1; user-select: none;">${emoji}</span>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0, 0, 0, 0.7); color: white; padding: 0.5rem 1rem; border-radius: 4px; font-size: 1.1rem; font-weight: 600;">
        ${title}
      </div>
    </div>
  `}});const NavigationExample=(props,{useState,useEffect,useStyle,html,css})=>{const[currentPage,setCurrentPage]=useState("home"),[navigationHistory,setNavigationHistory]=useState(["home"]),pages={home:{id:"home",title:"Home",icon:"🏠",color:"#e3f2fd",content:{heading:"Welcome Home",description:"This is the main landing page of our application.",features:["Shared Component","Beautiful design","Smooth animations","Responsive layout","Modern framework"]}},about:{id:"about",title:"About",icon:"👋",color:"#f3e5f5",content:{heading:"About Us",description:"Learn more about our company and mission.",features:["Founded in 2024","Innovative solutions","Shared Component","Customer focused","Global reach"]}},services:{id:"services",title:"Services",icon:"⚙️",color:"#e8f5e8",content:{heading:"Our Services",description:"Discover what we can do for you.",features:["Web Development","Mobile Apps","UI/UX Design","Consulting","Shared Component"]}},portfolio:{id:"portfolio",title:"Portfolio",icon:"💼",color:"#fff3e0",content:{heading:"Our Work",description:"Check out our latest projects and achievements.",features:["E-commerce sites","Shared Component","SaaS platforms","Mobile applications","Design systems"]}},contact:{id:"contact",title:"Contact",icon:"📧",color:"#ffebee",content:{heading:"Get in Touch",description:"Ready to start your project? Contact us today.",features:["Free consultation","24/7 support","Quick response","Flexible pricing","Shared Component"]}}},pageOrder=["home","about","services","portfolio","contact"];useStyle(css`
    .navigation-app {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      overflow: hidden;
      min-height: 600px;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .navigation {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      padding: 0;
      display: flex;
      overflow-x: auto;
    }

    .nav-item {
      flex: 1;
      min-width: 120px;
      background: none;
      border: none;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6c757d;
    }

    .nav-item:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #495057;
    }

    .nav-item.active {
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
    }

    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #667eea;
    }

    .nav-icon {
      font-size: 1.5rem;
    }

    .page-container {
      position: relative;
      min-height: 500px;
      overflow: hidden;
    }

    .controls {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1rem;
    }

    .control-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-button:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .control-button:disabled {
      background: #adb5bd;
      cursor: not-allowed;
      transform: none;
    }

    .page-info {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #6c757d;
      backdrop-filter: blur(10px);
    }

    .transition-debug {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-family: 'Courier New', monospace;
      max-width: 300px;
    }

    .syntax-showcase {
      margin-top: 2rem;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #dee2e6;
    }

    .syntax-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
    }

    .code-block {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
      margin: 1rem 0;
    }

    @media (max-width: 768px) {
      .navigation {
        overflow-x: auto;
      }
      
      .nav-item {
        min-width: 100px;
        padding: 0.75rem 1rem;
        font-size: 0.75rem;
      }
      
      .nav-icon {
        font-size: 1.25rem;
      }
      
      .page-content {
        padding: 2rem 1rem;
      }
      
      .page-heading {
        font-size: 2rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .controls {
        flex-direction: column;
        width: 90%;
        max-width: 300px;
      }
    }
  `);const navigateToPage=pageId=>{pageId!==currentPage&&(setNavigationHistory((prev=>[...prev,pageId])),setCurrentPage(pageId))},goToNextPage=()=>{const currentIndex=pageOrder.indexOf(currentPage);currentIndex<pageOrder.length-1&&navigateToPage(pageOrder[currentIndex+1])},getCurrentPageIndex=()=>pageOrder.indexOf(currentPage),isFirstPage=0===getCurrentPageIndex(),isLastPage=getCurrentPageIndex()===pageOrder.length-1;return useEffect((()=>{const interval=setInterval((()=>{isLastPage?navigateToPage("home"):goToNextPage()}),6e3);return()=>clearInterval(interval)}),[currentPage,isLastPage]),html`
    <div class="navigation-app">
      <div class="app-header">
        <h1 class="app-title">🚀 Navigation Transitions Demo</h1>
        <div class="breadcrumb">
          ${navigationHistory.slice(-3).map(((pageId,index,arr)=>html`
            ${index>0?html`<span>→</span>`:""}
            <span>${pages[pageId].icon} ${pages[pageId].title}</span>
          `))}
        </div>
      </div>

      <nav class="navigation">
        ${pageOrder.map((pageId=>html`
          <button 
            class="nav-item ${pageId===currentPage?"active":""}"
            @click="${()=>navigateToPage(pageId)}"
          >
            <span class="nav-icon">${pages[pageId].icon}</span>
            <span>${pages[pageId].title}</span>
          </button>
        `))}
      </nav>

      <div class="page-container">
        <!-- This is where the magic happens - automatic view transitions! -->
        <page-content 
          transitionId="${getCurrentPageIndex()}"
          transitionDuration="600"
          pageData="${JSON.stringify(pages[currentPage])}"
        ></page-content>

        <div class="controls">
          <button 
            class="control-button" 
            @click="${()=>{const currentIndex=pageOrder.indexOf(currentPage);currentIndex>0&&navigateToPage(pageOrder[currentIndex-1])}}"
            ?disabled="${isFirstPage}"
          >
            ⏮️ Previous
          </button>
          <button 
            class="control-button" 
            @click="${goToNextPage}"
            ?disabled="${isLastPage}"
          >
            Next ⏭️
          </button>
        </div>

        <div class="page-info">
          Page ${getCurrentPageIndex()+1} of ${pageOrder.length}
        </div>
      </div>

      <div class="syntax-showcase">
        <div class="syntax-title">✨ Framework Magic - Page Navigation Transitions</div>
        
        <div class="code-block">
&lt;page-content 
  transitionId="\${pageIndex}"
  transitionDuration="600"
  pageData="\${JSON.stringify(pages[currentPage])}"
&gt;&lt;/page-content&gt;
        </div>

        <p><strong>Automatic Features:</strong></p>
        <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
          <li>🎯 <strong>Smart Direction Detection:</strong> Left/right based on page order</li>
          <li>⚡ <strong>Smooth Transitions:</strong> 600ms sliding animations</li>
          <li>🔄 <strong>Navigation History:</strong> Breadcrumb tracking</li>
          <li>📱 <strong>Responsive Design:</strong> Mobile-friendly navigation</li>
          <li>🎨 <strong>Auto-styling:</strong> Framework handles all CSS classes</li>
        </ul>
      </div>
    </div>
  `};(0,dim.E8)({tag:"navigation-example",component:NavigationExample}),(0,dim.E8)({tag:"page-content",component:(props,{html,useStyle,css})=>{const raw=props.pageData,pageData="string"==typeof raw?JSON.parse(raw||"{}"):raw||{},{content={heading:"",description:"",features:[]},color}=pageData;return useStyle(css`
    .page-content {
      padding: 3rem 2rem;
      text-align: center;
      min-height: 500px;
      box-sizing: border-box;
    }

    .page-heading {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
    }

    .page-description {
      font-size: 1.125rem;
      color: #6c757d;
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .feature-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
      transition: transform 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-2px);
    }

    /* The shared card is visually distinct so the FLIP reposition is easy to
       follow as it moves between tabs. */
    .feature-card.shared-card {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border-left-color: #f59e0b;
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
    }

    .feature-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }
  `),html`
    <div class="page-content" style="background: ${color};">
      <h2 class="page-heading">${content.heading}</h2>
      <p class="page-description">${content.description}</p>
      
      <div class="features-grid">
        ${content.features.map((feature=>"Shared Component"===feature?html`
                <div class="feature-card shared-card" data-vt-shared="shared-feature">
                  <div class="feature-title">⭐ ${feature}</div>
                </div>
              `:html`
                <div class="feature-card">
                  <div class="feature-title">${feature}</div>
                </div>
              `))}
      </div>
    </div>
  `}}),(0,dim.E8)({tag:"advanced-navigation",component:(props,{useState,useStyle,html,css})=>{const[currentSection,setCurrentSection]=useState("dashboard"),[currentSubPage,setCurrentSubPage]=useState("overview"),sections={dashboard:{title:"Dashboard",icon:"📊",subPages:["overview","analytics","reports"]},users:{title:"Users",icon:"👥",subPages:["list","permissions","activity"]},settings:{title:"Settings",icon:"⚙️",subPages:["general","security","billing"]}};return useStyle(css`
    .advanced-nav {
      display: flex;
      height: 400px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .sidebar {
      width: 200px;
      background: #2d3748;
      color: white;
      padding: 1rem 0;
    }

    .section-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
      border: none;
      background: none;
      color: inherit;
      width: 100%;
      text-align: left;
    }

    .section-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .section-item.active {
      background: rgba(102, 126, 234, 0.3);
    }

    .sub-nav {
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 1rem 0;
      min-width: 150px;
    }

    .sub-item {
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      color: #6c757d;
    }

    .sub-item:hover {
      background: #e9ecef;
    }

    .sub-item.active {
      background: #667eea;
      color: white;
    }

    .content-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
  `),html`
    <div class="advanced-nav">
      <div class="sidebar">
        ${Object.entries(sections).map((([sectionId,section])=>html`
          <button 
            class="section-item ${sectionId===currentSection?"active":""}"
            @click="${()=>{setCurrentSection(sectionId),setCurrentSubPage(section.subPages[0])}}"
          >
            <span>${section.icon}</span>
            <span>${section.title}</span>
          </button>
        `))}
      </div>

      <div class="sub-nav">
        ${sections[currentSection].subPages.map((subPage=>html`
          <button 
            class="sub-item ${subPage===currentSubPage?"active":""}"
            @click="${()=>setCurrentSubPage(subPage)}"
          >
            ${subPage.charAt(0).toUpperCase()+subPage.slice(1)}
          </button>
        `))}
      </div>

      <div class="content-area">
        <!-- Nested view transitions with section-subpage ID -->
        <nested-content 
          transitionId="${currentSection}-${currentSubPage}"
          transitionDuration="400"
          section="${currentSection}"
          subPage="${currentSubPage}"
        ></nested-content>
      </div>
    </div>
  `}}),(0,dim.E8)({tag:"nested-content",component:(props,{html})=>{const{section,subPage}=props;return html`
    <div style="padding: 2rem; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; height: 100%; display: flex; flex-direction: column; justify-content: center;">
      <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">${section.charAt(0).toUpperCase()+section.slice(1)}</h3>
      <p style="margin: 0; font-size: 1.125rem; opacity: 0.9;">${subPage.charAt(0).toUpperCase()+subPage.slice(1)} Content</p>
      <div style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.7;">
        Transition ID: ${section}-${subPage}
      </div>
    </div>
  `}});const _04_ViewTransitions_stories={title:"useTransition()",parameters:{layout:"fullscreen",docs:{description:{component:"\n# 🖼️ View Transitions Gallery\n\nA beautiful image gallery demonstrating smooth sliding animations and view transitions using the Dim Framework.\n\n## 🎯 Features\n\n- **Smooth Sliding Animations** - CSS transitions with cubic-bezier easing\n- **Multiple Navigation Methods** - Arrow keys, thumbnails, dots, and buttons\n- **Auto-play Functionality** - Automatic slideshow with 4-second intervals\n- **Responsive Design** - Adapts to different screen sizes\n- **Touch-friendly** - Optimized for mobile interaction\n- **Loading States** - Prevents rapid clicks during transitions\n\n## 🚀 Animation Techniques\n\n### CSS Transitions\n- Uses `transform: translateX()` for smooth horizontal sliding\n- `cubic-bezier(0.4, 0, 0.2, 1)` for natural easing\n- Opacity transitions for fade effects\n\n### Performance Optimizations\n- Uses `transform` and `opacity` for GPU acceleration\n- Prevents animation overlaps with transition state management\n- Lazy loading for images\n\n## 🎨 Interaction States\n\n- **Hover Effects** - Scale and opacity changes on interactive elements\n- **Active States** - Visual feedback for current selection\n- **Disabled States** - Prevents actions during transitions\n- **Loading States** - Smooth transitions between images\n\n## 📱 Responsive Behavior\n\n- Thumbnail grid adapts to screen width\n- Touch-friendly button sizes on mobile\n- Optimized image dimensions for different viewports\n        "}}},tags:["autodocs"]},ImageGallery={render:()=>react.createElement("view-transitions-gallery"),name:"Image Gallery with Sliding Transitions",parameters:{docs:{description:{story:"\nA complete image gallery with smooth sliding animations. Features include:\n\n- **Navigation**: Use arrow buttons, click thumbnails, or indicator dots\n- **Auto-play**: Automatically advances every 4 seconds\n- **Smooth Transitions**: CSS-powered sliding animations\n- **Responsive**: Works on desktop and mobile devices\n\nThe gallery uses CSS transforms and transitions for smooth animations, with state management to prevent rapid-fire clicks during transitions.\n        "}}}},AutomaticTransitions={render:()=>react.createElement("simple-gallery"),name:"🚀 Simple Automatic Transitions",parameters:{docs:{description:{story:'\n**Framework Magic!** This gallery uses the new automatic view transitions feature.\n\n### How it works:\n1. Just add `transitionId` prop to any component\n2. When the ID changes, transitions happen automatically\n3. Direction is auto-calculated based on ID comparison\n4. No manual CSS classes or state management needed!\n\n### Example Syntax:\n```html\n<simple-image \n  transitionId="${currentIndex}"\n  transitionDuration="500"\n  src="${image.src}"\n  title="${image.title}"\n></simple-image>\n```\n\nThe framework automatically handles:\n- Transition detection\n- Direction calculation (left/right)\n- CSS class application\n- Wrapper elements\n- Animation timing\n        '}}}},PageNavigation={render:()=>react.createElement("navigation-example"),name:"🔥 Page Navigation Transitions",parameters:{docs:{description:{story:'\n**Complex Navigation Made Simple!** This demonstrates automatic view transitions for multi-page navigation.\n\n### Features Demonstrated:\n- **Multi-page navigation** with automatic sliding\n- **Smart direction detection** based on page order\n- **Navigation history** with breadcrumb tracking\n- **Responsive design** that works on mobile\n- **Auto-advance demo** cycling through pages\n\n### Framework Magic:\n```html\n<page-content \n  transitionId="${currentPage}"\n  transitionDuration="600"\n  pageData="${JSON.stringify(pages[currentPage])}"\n></page-content>\n```\n\n### Automatic Behaviors:\n- 🎯 **Direction Detection**: Slides left/right based on page order\n- ⚡ **Smooth Transitions**: 600ms sliding animations\n- 🔄 **History Tracking**: Breadcrumb navigation\n- 📱 **Mobile Responsive**: Touch-friendly navigation\n- 🎨 **Auto-styling**: No manual CSS classes needed\n\n### Complex Navigation:\nThe example also includes a nested navigation component showing how view transitions work with:\n- Sidebar navigation\n- Sub-page routing\n- Nested transition IDs (`section-subpage`)\n- Multi-level content transitions\n\nPerfect for dashboards, admin panels, and complex applications!\n        '}}}},_04_ViewTransitions_stories_AdvancedNavigation={render:()=>react.createElement("advanced-navigation"),name:"🏗️ Nested Navigation",parameters:{docs:{description:{story:'\n**Advanced Navigation Patterns** - Demonstrates nested transitions with complex routing.\n\n### Features:\n- **Sidebar + Sub-navigation** layout\n- **Nested transition IDs** (e.g., `dashboard-overview`)\n- **Two-level routing** with automatic transitions\n- **State coordination** between sections and sub-pages\n\n### Transition ID Strategy:\n```html\n<nested-content \n  transitionId="${currentSection}-${currentSubPage}"\n  transitionDuration="400"\n></nested-content>\n```\n\nThis creates unique IDs like:\n- `dashboard-overview`\n- `dashboard-analytics`\n- `users-list`\n- `settings-security`\n\nThe framework automatically determines direction based on the combined ID comparison!\n        '}}}},AnimationShowcase={render:()=>react.createElement("view-transitions-gallery"),name:"Manual View Transitions (Advanced)",parameters:{docs:{description:{story:"\nThis story shows the manual approach using the `useViewTransition` hook directly.\n\n### Manual Hook Usage:\n```javascript\nconst transition = useViewTransition(currentIndex.toString(), {\n  duration: 500,\n  autoDirection: true\n});\n```\n\n### CSS Animations Used:\n- `transform: translateX()` for slide transitions\n- `opacity` changes for fade effects\n- `scale()` transforms for hover states\n- `cubic-bezier` easing for natural motion\n\n### Performance Considerations:\n- GPU-accelerated properties (`transform`, `opacity`)\n- Transition state management prevents animation conflicts\n- Efficient re-renders with useState hooks\n\n### User Experience:\n- Visual feedback for all interactive elements\n- Disabled states during transitions\n- Auto-play with manual override\n- Multiple navigation methods for accessibility\n        "}}}},__namedExportsOrder=["ImageGallery","AutomaticTransitions","PageNavigation","AdvancedNavigation","AnimationShowcase"];ImageGallery.parameters={...ImageGallery.parameters,docs:{...ImageGallery.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('view-transitions-gallery'),\n  name: \"Image Gallery with Sliding Transitions\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nA complete image gallery with smooth sliding animations. Features include:\n\n- **Navigation**: Use arrow buttons, click thumbnails, or indicator dots\n- **Auto-play**: Automatically advances every 4 seconds\n- **Smooth Transitions**: CSS-powered sliding animations\n- **Responsive**: Works on desktop and mobile devices\n\nThe gallery uses CSS transforms and transitions for smooth animations, with state management to prevent rapid-fire clicks during transitions.\n        `\n      }\n    }\n  }\n}",...ImageGallery.parameters?.docs?.source}}},AutomaticTransitions.parameters={...AutomaticTransitions.parameters,docs:{...AutomaticTransitions.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'simple-gallery\'),\n  name: "🚀 Simple Automatic Transitions",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Framework Magic!** This gallery uses the new automatic view transitions feature.\n\n### How it works:\n1. Just add \\`transitionId\\` prop to any component\n2. When the ID changes, transitions happen automatically\n3. Direction is auto-calculated based on ID comparison\n4. No manual CSS classes or state management needed!\n\n### Example Syntax:\n\\`\\`\\`html\n<simple-image \n  transitionId="\\${currentIndex}"\n  transitionDuration="500"\n  src="\\${image.src}"\n  title="\\${image.title}"\n></simple-image>\n\\`\\`\\`\n\nThe framework automatically handles:\n- Transition detection\n- Direction calculation (left/right)\n- CSS class application\n- Wrapper elements\n- Animation timing\n        `\n      }\n    }\n  }\n}',...AutomaticTransitions.parameters?.docs?.source}}},PageNavigation.parameters={...PageNavigation.parameters,docs:{...PageNavigation.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'navigation-example\'),\n  name: "🔥 Page Navigation Transitions",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Complex Navigation Made Simple!** This demonstrates automatic view transitions for multi-page navigation.\n\n### Features Demonstrated:\n- **Multi-page navigation** with automatic sliding\n- **Smart direction detection** based on page order\n- **Navigation history** with breadcrumb tracking\n- **Responsive design** that works on mobile\n- **Auto-advance demo** cycling through pages\n\n### Framework Magic:\n\\`\\`\\`html\n<page-content \n  transitionId="\\${currentPage}"\n  transitionDuration="600"\n  pageData="\\${JSON.stringify(pages[currentPage])}"\n></page-content>\n\\`\\`\\`\n\n### Automatic Behaviors:\n- 🎯 **Direction Detection**: Slides left/right based on page order\n- ⚡ **Smooth Transitions**: 600ms sliding animations\n- 🔄 **History Tracking**: Breadcrumb navigation\n- 📱 **Mobile Responsive**: Touch-friendly navigation\n- 🎨 **Auto-styling**: No manual CSS classes needed\n\n### Complex Navigation:\nThe example also includes a nested navigation component showing how view transitions work with:\n- Sidebar navigation\n- Sub-page routing\n- Nested transition IDs (\\`section-subpage\\`)\n- Multi-level content transitions\n\nPerfect for dashboards, admin panels, and complex applications!\n        `\n      }\n    }\n  }\n}',...PageNavigation.parameters?.docs?.source}}},_04_ViewTransitions_stories_AdvancedNavigation.parameters={..._04_ViewTransitions_stories_AdvancedNavigation.parameters,docs:{..._04_ViewTransitions_stories_AdvancedNavigation.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'advanced-navigation\'),\n  name: "🏗️ Nested Navigation",\n  parameters: {\n    docs: {\n      description: {\n        story: `\n**Advanced Navigation Patterns** - Demonstrates nested transitions with complex routing.\n\n### Features:\n- **Sidebar + Sub-navigation** layout\n- **Nested transition IDs** (e.g., \\`dashboard-overview\\`)\n- **Two-level routing** with automatic transitions\n- **State coordination** between sections and sub-pages\n\n### Transition ID Strategy:\n\\`\\`\\`html\n<nested-content \n  transitionId="\\${currentSection}-\\${currentSubPage}"\n  transitionDuration="400"\n></nested-content>\n\\`\\`\\`\n\nThis creates unique IDs like:\n- \\`dashboard-overview\\`\n- \\`dashboard-analytics\\`\n- \\`users-list\\`\n- \\`settings-security\\`\n\nThe framework automatically determines direction based on the combined ID comparison!\n        `\n      }\n    }\n  }\n}',..._04_ViewTransitions_stories_AdvancedNavigation.parameters?.docs?.source}}},AnimationShowcase.parameters={...AnimationShowcase.parameters,docs:{...AnimationShowcase.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('view-transitions-gallery'),\n  name: \"Manual View Transitions (Advanced)\",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nThis story shows the manual approach using the \\`useViewTransition\\` hook directly.\n\n### Manual Hook Usage:\n\\`\\`\\`javascript\nconst transition = useViewTransition(currentIndex.toString(), {\n  duration: 500,\n  autoDirection: true\n});\n\\`\\`\\`\n\n### CSS Animations Used:\n- \\`transform: translateX()\\` for slide transitions\n- \\`opacity\\` changes for fade effects\n- \\`scale()\\` transforms for hover states\n- \\`cubic-bezier\\` easing for natural motion\n\n### Performance Considerations:\n- GPU-accelerated properties (\\`transform\\`, \\`opacity\\`)\n- Transition state management prevents animation conflicts\n- Efficient re-renders with useState hooks\n\n### User Experience:\n- Visual feedback for all interactive elements\n- Disabled states during transitions\n- Auto-play with manual override\n- Multiple navigation methods for accessibility\n        `\n      }\n    }\n  }\n}",...AnimationShowcase.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-04-ViewTransitions-stories.48629225.iframe.bundle.js.map