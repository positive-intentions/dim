"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[508],{"./src/stories/01-GettingStarted.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{CartCalculationsDemo:()=>CartCalculationsDemo,InputFocusDemo:()=>InputFocusDemo,LiveDemo:()=>LiveDemo,ProductCatalogDemo:()=>ProductCatalogDemo,StepByStep:()=>StepByStep,ThemeToggleDemo:()=>ThemeToggleDemo,UseStoreDemo:()=>UseStoreDemo,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_01_GettingStarted_stories});var react=__webpack_require__("./node_modules/react/index.js"),dim=__webpack_require__("./src/core/dim.ts");(0,dim.E8)({tag:"crypto-test-store-demo",component:(props,{useStore,useState,css,html,useEffect,useStyle})=>{useStyle(css`
    .crypto-test {
      padding: 20px;
      border: 1px solid #ccc;
      margin: 20px;
    }
    .status {
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
      cursor: pointer;
      background: #029cfd;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover {
      background: #0278c7;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .error {
      color: red;
      margin: 10px 0;
    }
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
    }
  `);const[testData,setTestData]=useState("Initial encrypted data"),[counter,setCounter]=useState(0),[objectData,setObjectData]=useState({name:"test",value:123}),store=useStore({testData:[testData,setTestData],counter:[counter,setCounter],objectData:[objectData,setObjectData]}),[isLoading,setIsLoading]=useState(!1),[error,setError]=useState(null),getCurrentValue=key=>store[key]&&Array.isArray(store[key])&&store[key].length>0?store[key][0]:null,getSetter=key=>store[key]&&Array.isArray(store[key])&&store[key].length>1?store[key][1]:null;return useEffect((()=>{setIsLoading(!0);const timer=setTimeout((()=>{setIsLoading(!1),console.log("Store demo ready")}),1e3);return()=>clearTimeout(timer)}),[]),html`
    <div class="crypto-test">
      <h2>Crypto Test with Store (Demo)</h2>
      
      ${error?html`<div class="error">Error: ${error}</div>`:""}
      
      <div class="status">
        <h3>Current Values:</h3>
        <p>
          <strong>Test Data:</strong> 
          ${isLoading?"Loading...":getCurrentValue("testData")||"No data"}
        </p>
        <p>
          <strong>Counter:</strong> 
          ${isLoading?"Loading...":getCurrentValue("counter")??0}
        </p>
        <p>
          <strong>Object Data:</strong>
          ${isLoading?"Loading...":html`<pre>${JSON.stringify(getCurrentValue("objectData")||{},null,2)}</pre>`}
        </p>
      </div>
      
      <div>
        <button @click="${()=>{try{const setter=getSetter("testData");if(!setter)throw new Error("testData setter not available");const newValue=`Updated at ${(new Date).toISOString()}`;setter(newValue),console.log("Updated testData to:",newValue),setError(null)}catch(err){console.error("Failed to update testData:",err),setError(err.message)}}}" ?disabled="${isLoading}">Update Test Data</button>
        <button @click="${()=>{try{const setter=getSetter("counter");if(!setter)throw new Error("counter setter not available");const newValue=(getCurrentValue("counter")||0)+1;setter(newValue),console.log("Incremented counter to:",newValue),setError(null)}catch(err){console.error("Failed to increment counter:",err),setError(err.message)}}}" ?disabled="${isLoading}">Increment Counter</button>
        <button @click="${()=>{try{const setter=getSetter("objectData");if(!setter)throw new Error("objectData setter not available");const newValue={name:`Object ${getCurrentValue("counter")||0}`,value:1e3*Math.random(),timestamp:(new Date).toISOString()};setter(newValue),console.log("Updated objectData to:",newValue),setError(null)}catch(err){console.error("Failed to update objectData:",err),setError(err.message)}}}" ?disabled="${isLoading}">Update Object</button>
      </div>
      
      <div class="status">
        <p><strong>Store Status:</strong> ${isLoading?"Loading...":"Ready"}</p>
        <p><em>This demo uses encrypted store with safe error handling</em></p>
        <p><em>Check console and IndexedDB for encrypted values</em></p>
      </div>
    </div>
  `}});(0,dim.E8)({tag:"shopping-basket-tutorial",component:(props,{useState,useEffect,useStyle,useScope,useMemo,useRef,useStore,html,css})=>{const store=useStore({cart:useState([]),theme:useState("light"),user:useState({name:"Guest",preferences:{currency:"USD"}})}),[cart,setCart]=store.cart,[theme,setTheme]=store.theme,[user,setUser]=store.user,ProductCard=(props,{useState,useStyle,useEffect,html,css})=>{const[isHovered,setIsHovered]=useState(!1),{product,theme,cart,setCart}=props.props||props;if(!product)return html`<div>No product data</div>`;useStyle(css`
      .product-card {
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s, background 0.3s, border-color 0.3s;
        cursor: pointer;
      }

      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      }

      .product-image {
        font-size: 3rem;
        text-align: center;
        margin-bottom: 1rem;
      }

      .product-name {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
      }

      .product-category {
        font-size: 0.875rem;
        color: #6c757d;
        margin-bottom: 0.75rem;
      }

      .product-price {
        font-size: 1.25rem;
        font-weight: bold;
        color: #029cfd;
        margin-bottom: 1rem;
      }

      .add-button {
        width: 100%;
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .add-button:hover {
        background: #0278c7 !important;
      }
    `);return html`
      <div 
        class="product-card"
        style="background: ${"light"===theme?"white":"#2a2a2a"}; border: 1px solid ${"light"===theme?"#e9ecef":"#404040"};"
        @mouseenter="${()=>setIsHovered(!0)}"
        @mouseleave="${()=>setIsHovered(!1)}"
      >
        <div class="product-image">${product.image}</div>
        <div class="product-name" style="color: ${"light"===theme?"#333":"#fff"};">${product.name}</div>
        <div class="product-category">${product.category}</div>
        <div class="product-price">$${product.price}</div>
        <button class="add-button" style="background: ${isHovered?"#0278c7":"#029cfd"};" @click="${()=>{const currentCart=Array.isArray(cart)?cart:[],existingItem=currentCart.find((item=>item.id===product.id));setCart(existingItem?currentCart.map((item=>item.id===product.id?{...item,quantity:item.quantity+1}:item)):[...currentCart,{...product,quantity:1}])}}">
          Add to Cart
        </button>
      </div>
    `},CartItem=(props,{useState,useRef,useStyle,useEffect,html,css})=>{const quantityRef=useRef(),{item,theme,cart,setCart}=props.props||props;if(!item)return html`<div>No item data</div>`;useStyle(css`
      .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.75rem;
        transition: background 0.3s;
      }

      .item-image {
        font-size: 2rem;
      }

      .item-details {
        flex: 1;
      }

      .item-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        transition: color 0.3s;
      }

      .item-price {
        color: #029cfd;
        font-weight: 500;
      }

      .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .quantity-btn {
        background: #029cfd;
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .quantity-input {
        width: 60px;
        text-align: center;
        padding: 0.25rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: background 0.3s, color 0.3s;
      }

      .remove-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        margin-left: 1rem;
      }
    `);const updateQuantity=newQuantity=>{if(newQuantity<=0)return void removeItem();const currentCart=Array.isArray(cart)?cart:[];setCart(currentCart.map((cartItem=>cartItem.id===item.id?{...cartItem,quantity:newQuantity}:cartItem)))},removeItem=()=>{const currentCart=Array.isArray(cart)?cart:[];setCart(currentCart.filter((cartItem=>cartItem.id!==item.id)))};return html`
      <div class="cart-item" style="background: ${"light"===theme?"#f8f9fa":"#353535"};">
        <div class="item-image">${item.image}</div>
        <div class="item-details">
          <div class="item-name" style="color: ${"light"===theme?"#333":"#fff"};">${item.name}</div>
          <div class="item-price">$${item.price} each</div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" @click="${()=>updateQuantity(item.quantity-1)}">-</button>
          <input 
            ref="${quantityRef}"
            class="quantity-input" 
            type="number" 
            .value="${item.quantity}"
            style="background: ${"light"===theme?"white":"#2a2a2a"}; color: ${"light"===theme?"#333":"#fff"};"
            @change="${e=>updateQuantity(parseInt(e.target.value)||1)}"
            @dblclick="${()=>{quantityRef.current?.focus(),quantityRef.current?.select()}}"
          />
          <button class="quantity-btn" @click="${()=>updateQuantity(item.quantity+1)}">+</button>
        </div>
        <button class="remove-btn" @click="${removeItem}">Remove</button>
      </div>
    `};return useScope({"user-controls":(props,{useStyle,useEffect,html,css})=>{const{theme="light",setTheme=()=>{},user={name:"Guest"},cart=[],setCart=()=>{}}=props.props||props;return useStyle(css`
      .user-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: background 0.3s, border-color 0.3s;
      }

      .user-info {
        font-weight: 600;
        transition: color 0.3s;
      }

      .controls {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .theme-toggle {
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .clear-cart {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .user-controls {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }
      }
    `),html`
      <div class="user-controls" style="background: ${"light"===theme?"white":"#2a2a2a"}; border: 1px solid ${"light"===theme?"#e9ecef":"#404040"};">
        <div class="user-info" style="color: ${"light"===theme?"#333":"#fff"};">
          Welcome, ${user.name}! 👋
        </div>
        <div class="controls">
          <button class="theme-toggle" style="background: ${"light"===theme?"#6c757d":"#029cfd"};" @click="${()=>setTheme("light"===theme?"dark":"light")}">
            ${"light"===theme?"🌙 Dark":"☀️ Light"} Mode
          </button>
          ${Array.isArray(cart)&&cart.length>0?html`
            <button class="clear-cart" @click="${()=>setCart([])}">
              Clear Cart
            </button>
          `:""}
        </div>
      </div>
    `},"product-grid":(props,{useScope,useStyle,useEffect,html,css})=>{const{theme="light",cart=[],setCart=()=>{},products=[]}=props.props||props;return useScope({"product-card":ProductCard}),useStyle(css`
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .products-header {
        margin-bottom: 1.5rem;
      }

      .products-title {
        font-size: 1.75rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
      }

      .products-subtitle {
        color: #6c757d;
      }

      @media (max-width: 768px) {
        .product-grid {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
      }
    `),html`
      <div>
        <div class="products-header">
          <h2 class="products-title" style="color: ${"light"===theme?"#333":"#fff"};">Our Products</h2>
          <p class="products-subtitle">Discover amazing products at great prices</p>
        </div>
        <div class="product-grid">
          ${products.map((product=>html`
            <product-card .props="${{product,theme,cart,setCart}}"></product-card>
          `))}
        </div>
      </div>
    `},"shopping-cart":(props,{useMemo,useStyle,useScope,useEffect,html,css})=>{const{theme="light",cart=[],setCart=()=>{}}=props.props||props;useScope({"cart-item":CartItem});const cartSummary=useMemo((()=>{const currentCart=Array.isArray(cart)?cart:[],subtotal=currentCart.reduce(((sum,item)=>sum+item.price*item.quantity),0),tax=.08*subtotal,shipping=subtotal>50?0:9.99,total=subtotal+tax+shipping;return{subtotal:subtotal.toFixed(2),tax:tax.toFixed(2),shipping:shipping.toFixed(2),total:total.toFixed(2),itemCount:currentCart.reduce(((sum,item)=>sum+item.quantity),0)}}),[cart]);return useStyle(css`
      .shopping-cart {
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: background 0.3s, border-color 0.3s;
      }

      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #029cfd;
      }

      .cart-title {
        font-size: 1.5rem;
        font-weight: bold;
        transition: color 0.3s;
      }

      .item-count {
        background: #029cfd;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .cart-items {
        margin-bottom: 1.5rem;
        max-height: 400px;
        overflow-y: auto;
      }

      .empty-cart {
        text-align: center;
        color: #6c757d;
        padding: 2rem;
        font-style: italic;
      }

      .cart-summary {
        padding-top: 1rem;
        transition: border-color 0.3s;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
      }

      .summary-row.total {
        font-size: 1.25rem;
        font-weight: bold;
        padding-top: 0.5rem;
        color: #029cfd;
        transition: border-color 0.3s;
      }

      .checkout-btn {
        width: 100%;
        background: #28a745;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 8px;
        font-size: 1.125rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
        transition: background 0.2s;
      }

      .checkout-btn:hover {
        background: #218838;
      }

      .checkout-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }
    `),html`
      <div class="shopping-cart" style="background: ${"light"===theme?"white":"#2a2a2a"}; border: 1px solid ${"light"===theme?"#e9ecef":"#404040"};">
        <div class="cart-header">
          <h3 class="cart-title" style="color: ${"light"===theme?"#333":"#fff"};">Shopping Cart</h3>
          <span class="item-count">${cartSummary.itemCount} items</span>
        </div>

        <div class="cart-items">
          ${Array.isArray(cart)&&0===cart.length?html`
            <div class="empty-cart">
              🛒 Your cart is empty<br>
              <small>Add some products to get started!</small>
            </div>
          `:html`
            ${Array.isArray(cart)?cart.map((item=>html`
              <cart-item .props="${{item,theme,cart,setCart}}"></cart-item>
            `)):""}
          `}
        </div>

        ${Array.isArray(cart)&&cart.length>0?html`
          <div class="cart-summary" style="border-top: 1px solid ${"light"===theme?"#e9ecef":"#404040"};">
            <div class="summary-row" style="color: ${"light"===theme?"#333":"#fff"};">
              <span>Subtotal:</span>
              <span>$${cartSummary.subtotal}</span>
            </div>
            <div class="summary-row" style="color: ${"light"===theme?"#333":"#fff"};">
              <span>Tax:</span>
              <span>$${cartSummary.tax}</span>
            </div>
            <div class="summary-row" style="color: ${"light"===theme?"#333":"#fff"};">
              <span>Shipping:</span>
              <span>${"0.00"===cartSummary.shipping?"Free":"$"+cartSummary.shipping}</span>
            </div>
            <div class="summary-row total" style="border-top: 1px solid ${"light"===theme?"#e9ecef":"#404040"};">
              <span>Total:</span>
              <span>$${cartSummary.total}</span>
            </div>
            <button class="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        `:""}
      </div>
    `}}),useStyle(css`
    .shopping-app {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      transition: background 0.3s ease;
    }

    .app-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .app-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      transition: color 0.3s;
    }

    .app-subtitle {
      font-size: 1.125rem;
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      
      .shopping-app {
        padding: 1rem;
      }
    }

    .features-showcase {
      margin-top: 3rem;
      padding: 2rem;
      border-radius: 12px;
      transition: background 0.3s, border-color 0.3s;
    }

    .features-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-align: center;
      transition: color 0.3s;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .feature-item {
      text-align: center;
      padding: 1rem;
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .feature-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
      transition: color 0.3s;
    }

    .feature-desc {
      font-size: 0.875rem;
      color: #6c757d;
    }
  `),useEffect((()=>{const cartLength=Array.isArray(cart)?cart.length:0;return console.log(`Shopping app mounted with ${cartLength} items in cart`),()=>{console.log("Shopping app unmounted")}}),[]),html`
    <div class="shopping-app" style="background: ${"light"===theme?"#f8f9fa":"#1a1a1a"};">
      <div class="app-header">
        <h1 class="app-title" style="color: ${"light"===theme?"#333":"#fff"};">🛍️ Dim Shopping</h1>
        <p class="app-subtitle">A complete shopping experience built with Dim Framework</p>
      </div>

      <user-controls .props="${{theme,setTheme,user,cart,setCart}}">
      </user-controls>

      <div class="main-content">
        <div class="products-section">
          <product-grid .props="${{theme,cart,setCart,products:[{id:1,name:"Wireless Headphones",price:199.99,image:"🎧",category:"Electronics"},{id:2,name:"Coffee Mug",price:24.99,image:"☕",category:"Home"},{id:3,name:"Running Shoes",price:129.99,image:"👟",category:"Sports"},{id:4,name:"Laptop Stand",price:79.99,image:"💻",category:"Electronics"},{id:5,name:"Plant Pot",price:19.99,image:"🪴",category:"Home"},{id:6,name:"Yoga Mat",price:49.99,image:"🧘",category:"Sports"}]}}">
          </product-grid>
        </div>
        <div class="cart-section">
          <shopping-cart .props="${{theme,cart,setCart}}">
          </shopping-cart>
        </div>
      </div>

      <div class="features-showcase" style="background: ${"light"===theme?"white":"#2a2a2a"}; border: 1px solid ${"light"===theme?"#e9ecef":"#404040"};">
        <h3 class="features-title" style="color: ${"light"===theme?"#333":"#fff"};">🚀 Dim Features Demonstrated</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useState</div>
            <div class="feature-desc">Cart items, theme, hover states</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useEffect</div>
            <div class="feature-desc">Component lifecycle, style updates</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useStyle</div>
            <div class="feature-desc">Dynamic theming, responsive design</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🧩</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useScope</div>
            <div class="feature-desc">Component composition</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🧠</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useMemo</div>
            <div class="feature-desc">Cart calculations, performance</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useRef</div>
            <div class="feature-desc">Input focus, DOM manipulation</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💾</div>
            <div class="feature-name" style="color: ${"light"===theme?"#333":"#fff"};">useStore</div>
            <div class="feature-desc">Global state, persistence</div>
          </div>
        </div>
      </div>
    </div>
  `}}),(0,dim.E8)({tag:"product-card-example",component:(props,{useState,useStyle,html,css})=>{const[isHovered,setIsHovered]=useState(!1);return useStyle(css`
    .product-card {
      padding: 1.5rem;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      cursor: pointer;
      border: 1px solid #e9ecef;
      max-width: 300px;
      margin: 0 auto;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    .product-image {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .product-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .product-price {
      font-size: 1.125rem;
      color: #029cfd;
      margin-bottom: 1rem;
    }
    
    .add-button {
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .add-button:hover {
      background: #0278c7 !important;
    }
  `),html`
    <div 
      class="product-card"
      @mouseenter="${()=>setIsHovered(!0)}"
      @mouseleave="${()=>setIsHovered(!1)}"
    >
      <div class="product-image">☕</div>
      <div class="product-name">Coffee Mug</div>
      <div class="product-price">$24.99</div>
      <button class="add-button" style="background: ${isHovered?"#0278c7":"#029cfd"};">Add to Cart</button>
    </div>
  `}}),(0,dim.E8)({tag:"cart-summary-example",component:(props,{useMemo,useStyle,html,css})=>{const cart=[{id:1,name:"Coffee Mug",price:24.99,quantity:2},{id:2,name:"Laptop Stand",price:79.99,quantity:1}],cartSummary=useMemo((()=>{console.log("Calculating cart totals...");const subtotal=cart.reduce(((sum,item)=>sum+item.price*item.quantity),0),tax=.08*subtotal,shipping=subtotal>50?0:9.99,total=subtotal+tax+shipping;return{subtotal:subtotal.toFixed(2),tax:tax.toFixed(2),shipping:shipping.toFixed(2),total:total.toFixed(2),itemCount:cart.reduce(((sum,item)=>sum+item.quantity),0)}}),[cart]);return useStyle(css`
    .cart-summary {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      max-width: 300px;
      margin: 0 auto;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .summary-row.total {
      font-weight: bold;
      font-size: 1.125rem;
      padding-top: 0.5rem;
      border-top: 1px solid #dee2e6;
      color: #029cfd;
    }
  `),html`
    <div class="cart-summary">
      <h4>Cart Summary (${cartSummary.itemCount} items)</h4>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>$${cartSummary.subtotal}</span>
      </div>
      <div class="summary-row">
        <span>Tax:</span>
        <span>$${cartSummary.tax}</span>
      </div>
      <div class="summary-row">
        <span>Shipping:</span>
        <span>${"0.00"===cartSummary.shipping?"Free":"$"+cartSummary.shipping}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>$${cartSummary.total}</span>
      </div>
    </div>
  `}}),(0,dim.E8)({tag:"input-focus-example",component:(props,{useRef,useStyle,html,css})=>{const inputRef=useRef();useStyle(css`
    .input-demo {
      max-width: 300px;
      margin: 0 auto;
      text-align: center;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 100%;
      margin-bottom: 1rem;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
  `);const focusAndSelect=()=>{inputRef.current?.focus(),inputRef.current?.select()};return html`
    <div class="input-demo">
      <input 
        ref="${inputRef}"
        type="text" 
        value="Double-click to select"
        @dblclick="${focusAndSelect}"
      />
      <button @click="${focusAndSelect}">Focus & Select</button>
    </div>
  `}}),(0,dim.E8)({tag:"theme-toggle-example",component:(props,{useState,useEffect,useStyle,html,css})=>{const[theme,setTheme]=useState("light");return useEffect((()=>{useStyle(css`
      .theme-demo {
        padding: 2rem;
        background: ${(0,dim.iz)("light"===theme?"#f8f9fa":"#2a2a2a")};
        color: ${(0,dim.iz)("light"===theme?"#333":"#fff")};
        border-radius: 12px;
        text-align: center;
        transition: all 0.3s ease;
        max-width: 400px;
        margin: 0 auto;
      }

      button {
        background: ${(0,dim.iz)("light"===theme?"#6c757d":"#029cfd")};
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
      }
    `)}),[theme]),html`
    <div class="theme-demo">
      <h3>Dynamic Theme Demo</h3>
      <p>Current theme: ${theme}</p>
      <button @click="${()=>setTheme("light"===theme?"dark":"light")}">
        ${"light"===theme?"🌙 Dark":"☀️ Light"} Mode
      </button>
    </div>
  `}});const _01_GettingStarted_stories={title:"Getting Started",parameters:{layout:"fullscreen",docs:{description:{component:"\n# 🛍️ Complete Shopping Basket Tutorial\n\nLearn Dim Framework by building a real-world shopping application that demonstrates every feature.\n\n## 🎯 What You'll Build\n\nA complete shopping experience featuring:\n- **Product catalog** with interactive cards\n- **Shopping cart** with quantity controls\n- **Real-time calculations** with tax and shipping\n- **Dark/light theme** switching\n- **Persistent state** that survives page reloads\n- **Responsive design** that works on all devices\n\n## 🚀 Features Covered\n\n### Core Hooks\n- **useState** - Local component state for UI interactions\n- **useEffect** - Component lifecycle and side effects\n- **useStyle** - Dynamic CSS-in-JS with theming\n- **useScope** - Component composition and organization\n- **useMemo** - Performance optimization for calculations\n- **useRef** - DOM access and manipulation\n- **useStore** - Global state management with persistence\n\n### Real-World Patterns\n- **State Management** - Cart data, user preferences, theme\n- **Component Architecture** - Modular, reusable components\n- **Performance** - Memoized calculations, efficient re-renders\n- **User Experience** - Smooth interactions, responsive design\n- **Data Persistence** - Automatic localStorage integration\n\n## 📚 Learning Path\n\n1. **Live Demo** - Interact with the completed application\n2. **Step-by-Step Tutorial** - Build it yourself with guided steps\n3. **Code Examples** - Copy-paste ready code snippets\n4. **Best Practices** - Learn professional patterns and techniques\n\n## 🔥 Why This Tutorial?\n\nUnlike simple examples, this tutorial shows you:\n- How to structure a real application\n- How different hooks work together\n- Performance considerations at scale\n- Production-ready patterns and practices\n\nPerfect for developers wanting to learn modern web component development with a React-like API!\n        "}}},tags:["autodocs"]},LiveDemo={render:()=>react.createElement("shopping-basket-tutorial"),name:"Live Demo",parameters:{docs:{description:{story:"A fully interactive shopping basket showcasing all Dim Framework features. Add products, manage cart, switch themes, and see persistence in action!"}}}},StepByStep={render:()=>null,name:"📚 Step-by-Step Tutorial",parameters:{docs:{source:{code:null},description:{story:"\n# 🎓 Building a Shopping Basket - Complete Tutorial\n\nLearn every Dim feature by building a real shopping application step by step. Each section below demonstrates a specific hook with live examples and complete code.\n\n## Step 1: Project Setup & Installation\n\nStart by setting up a new project with Dim Framework.\n\n### Install Dim\n\n```bash\nnpm install @dim/core\n# or with yarn\nyarn add @dim/core\n\n# or include via CDN\n<script type=\"module\" src=\"https://unpkg.com/@dim/core\"><\/script>\n```\n\n### Basic HTML Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Shopping Basket with Dim</title>\n</head>\n<body>\n    <div id=\"app\">\n        <shopping-basket></shopping-basket>\n    </div>\n    <script type=\"module\" src=\"./shopping-basket.js\"><\/script>\n</body>\n</html>\n```\n\n> 💡 **Tip:** Dim works without any build tools! You can develop directly in the browser with ES modules.\n\n## Step 2: Global State with useStore\n\nCreate a global store for cart data that persists across page reloads.\n\n```javascript\nimport { useState, useStore, define } from '@dim/core';\n\nconst ShoppingBasket = (props, { useStore, useState, html }) => {\n  // Global persistent store\n  const store = useStore({\n    cart: useState([]),\n    theme: useState('light'),\n    user: useState({ name: 'Guest' })\n  });\n\n  const [cart, setCart] = store.cart;\n  const [theme, setTheme] = store.theme;\n  const [user, setUser] = store.user;\n\n  return html`\n    <div>\n      <h1>Shopping Cart (${cart.length} items)</h1>\n      <p>Theme: ${theme}</p>\n    </div>\n  `;\n};\n\ndefine({ tag: 'shopping-basket', component: ShoppingBasket });\n```\n\n> 🔥 **Key Feature:** useStore automatically persists data to localStorage, so your cart survives page reloads!\n\n## Step 3: Product Catalog with useState\n\nBuild interactive product cards with local state for hover effects.\n\n```javascript\nconst ProductCard = ({ product }, { useState, useStyle, html, css }) => {\n  const [isHovered, setIsHovered] = useState(false);\n  \n  useStyle(css`\n    .product-card {\n      padding: 1rem;\n      border-radius: 8px;\n      background: white;\n      box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n      transition: transform 0.2s;\n      cursor: pointer;\n    }\n    \n    .product-card:hover {\n      transform: translateY(-4px);\n      box-shadow: 0 8px 20px rgba(0,0,0,0.15);\n    }\n    \n    .add-button {\n      background: ${isHovered ? '#0278c7' : '#029cfd'};\n      color: white;\n      border: none;\n      padding: 0.75rem 1rem;\n      border-radius: 6px;\n      cursor: pointer;\n      width: 100%;\n    }\n  `);\n\n  return html`\n    <div \n      class=\"product-card\"\n      @mouseenter=\"${() => setIsHovered(true)}\"\n      @mouseleave=\"${() => setIsHovered(false)}\"\n    >\n      <h3>${product.name}</h3>\n      <p>$${product.price}</p>\n      <button class=\"add-button\">Add to Cart</button>\n    </div>\n  `;\n};\n```\n\n> ⚠️ **Important:** Each component gets its own isolated state. Hover states are independent per card!\n\n## Step 4: Component Composition with useScope\n\nOrganize your app by composing smaller components together.\n\n```javascript\nconst ProductGrid = (props, { useScope, html }) => {\n  // Register child components in this scope\n  useScope({\n    'product-card': ProductCard\n  });\n\n  const products = [\n    { id: 1, name: 'Headphones', price: 199.99 },\n    { id: 2, name: 'Coffee Mug', price: 24.99 },\n    // ... more products\n  ];\n\n  return html`\n    <div class=\"product-grid\">\n      ${products.map(product => html`\n        <product-card .product=\"${product}\"></product-card>\n      `)}\n    </div>\n  `;\n};\n\n// In your main component\nconst ShoppingBasket = (props, { useScope, html }) => {\n  useScope({\n    'product-grid': ProductGrid,\n    'shopping-cart': ShoppingCart,\n    'user-controls': UserControls\n  });\n\n  return html`\n    <div>\n      <user-controls></user-controls>\n      <product-grid></product-grid>\n      <shopping-cart></shopping-cart>\n    </div>\n  `;\n};\n```\n\n> 🧩 **Component Architecture:** useScope lets you build modular, reusable components without global registration conflicts.\n\n## Step 5: Performance with useMemo\n\nOptimize expensive calculations with memoization.\n\n```javascript\nconst ShoppingCart = (props, { useMemo, html }) => {\n  // Expensive calculations memoized\n  const cartSummary = useMemo(() => {\n    console.log('Calculating cart totals...'); // Only runs when cart changes\n    \n    const subtotal = cart.reduce((sum, item) => \n      sum + (item.price * item.quantity), 0);\n    const tax = subtotal * 0.08;\n    const shipping = subtotal > 50 ? 0 : 9.99;\n    const total = subtotal + tax + shipping;\n    \n    return {\n      subtotal: subtotal.toFixed(2),\n      tax: tax.toFixed(2),\n      shipping: shipping.toFixed(2),\n      total: total.toFixed(2),\n      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)\n    };\n  }, [cart]); // Only recalculate when cart changes\n\n  return html`\n    <div>\n      <h3>Cart (${cartSummary.itemCount} items)</h3>\n      <p>Subtotal: $${cartSummary.subtotal}</p>\n      <p>Tax: $${cartSummary.tax}</p>\n      <p>Shipping: $${cartSummary.shipping}</p>\n      <p><strong>Total: $${cartSummary.total}</strong></p>\n    </div>\n  `;\n};\n```\n\n> ⚡ **Performance:** useMemo prevents expensive recalculations on every render. Check the console to see it in action!\n\n## Step 6: DOM Access with useRef\n\nDirect DOM manipulation for focus management and input handling.\n\n```javascript\nconst CartItem = ({ item }, { useRef, html }) => {\n  const quantityRef = useRef();\n\n  const focusQuantityInput = () => {\n    quantityRef.current?.focus();\n    quantityRef.current?.select(); // Select all text\n  };\n\n  const updateQuantity = (newQuantity) => {\n    if (newQuantity <= 0) {\n      removeItem();\n      return;\n    }\n    setCart(cart.map(cartItem => \n      cartItem.id === item.id \n        ? { ...cartItem, quantity: newQuantity }\n        : cartItem\n    ));\n  };\n\n  return html`\n    <div class=\"cart-item\">\n      <span>${item.name}</span>\n      <input \n        ref=\"${quantityRef}\"\n        type=\"number\" \n        .value=\"${item.quantity}\"\n        @change=\"${(e) => updateQuantity(parseInt(e.target.value))}\"\n        @dblclick=\"${focusQuantityInput}\"\n      />\n      <button @click=\"${() => updateQuantity(item.quantity + 1)}\">+</button>\n      <button @click=\"${() => updateQuantity(item.quantity - 1)}\">-</button>\n    </div>\n  `;\n};\n```\n\n> 📍 **DOM Control:** useRef gives you direct access to DOM elements for focus, scrolling, measurements, and more.\n\n## Step 7: Dynamic Theming with useStyle\n\nCreate responsive, themeable components with CSS-in-JS.\n\n```javascript\nconst ShoppingApp = (props, { useStyle, useEffect, css }) => {\n  // Re-apply styles when theme changes\n  useEffect(() => {\n    useStyle(css`\n      .shopping-app {\n        background: ${theme === 'light' ? '#f8f9fa' : '#1a1a1a'};\n        color: ${theme === 'light' ? '#333' : '#fff'};\n        transition: all 0.3s ease;\n        min-height: 100vh;\n        padding: 2rem;\n      }\n\n      .product-card {\n        background: ${theme === 'light' ? 'white' : '#2a2a2a'};\n        border: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};\n      }\n\n      @media (max-width: 768px) {\n        .shopping-app {\n          padding: 1rem;\n        }\n        \n        .main-content {\n          grid-template-columns: 1fr; /* Stack on mobile */\n        }\n      }\n    `);\n  }, [theme]);\n\n  return html`\n    <div class=\"shopping-app\">\n      <button @click=\"${() => setTheme(theme === 'light' ? 'dark' : 'light')}\">\n        ${theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode\n      </button>\n      \x3c!-- rest of app --\x3e\n    </div>\n  `;\n};\n```\n\n> 🎨 **Responsive Design:** Combine CSS-in-JS with media queries for truly dynamic, responsive components.\n\n## Step 8: Side Effects with useEffect\n\nHandle component lifecycle, API calls, and cleanup.\n\n```javascript\nconst ShoppingBasket = (props, { useEffect, html }) => {\n  // Component lifecycle\n  useEffect(() => {\n    console.log('Shopping basket mounted');\n    \n    // Cleanup function\n    return () => {\n      console.log('Shopping basket unmounted');\n    };\n  }, []); // Empty deps = run once on mount/unmount\n\n  // React to cart changes\n  useEffect(() => {\n    console.log(`Cart updated: ${cart.length} items`);\n    \n    // Update document title\n    document.title = `Shopping Cart (${cart.length})`;\n    \n    // Save to analytics (example)\n    if (cart.length > 0) {\n      analytics.track('cart_updated', {\n        itemCount: cart.length,\n        total: calculateTotal(cart)\n      });\n    }\n  }, [cart]); // Run when cart changes\n\n  // Auto-save draft cart\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      localStorage.setItem('cart_draft', JSON.stringify(cart));\n    }, 1000); // Debounce saves\n\n    return () => clearTimeout(timer);\n  }, [cart]);\n\n  return html`<div>Your shopping basket</div>`;\n};\n```\n\n> 🧹 **Cleanup:** Always clean up timers, subscriptions, and event listeners in the cleanup function to prevent memory leaks.\n\n## 🎉 Congratulations!\n\nYou've now learned all the core Dim hooks by building a complete shopping basket application. You can see the full implementation in the **Live Demo** story above.\n\n### Next Steps\n\n1. Try modifying the live demo to add new features\n2. Explore the **API Reference** for detailed hook documentation\n3. Build your own application using these patterns!\n        "}}}},ProductCatalogDemo={render:()=>react.createElement("product-card-example"),name:"useState - Product Card",parameters:{docs:{description:{story:"Interactive product card demonstrating local state management with hover effects."}}}},CartCalculationsDemo={render:()=>react.createElement("cart-summary-example"),name:"useMemo - Cart Summary",parameters:{docs:{description:{story:"Cart summary showing memoized calculations for performance. Open the console to see when calculations run."}}}},InputFocusDemo={render:()=>react.createElement("input-focus-example"),name:"useRef - DOM Access",parameters:{docs:{description:{story:"Input focus management using useRef for direct DOM manipulation."}}}},ThemeToggleDemo={render:()=>react.createElement("theme-toggle-example"),name:"useStyle - Dynamic Theming",parameters:{docs:{description:{story:"Dynamic theme switching with CSS-in-JS, demonstrating reactive styling."}}}},UseStoreDemo={render:()=>react.createElement("crypto-test-store-demo"),name:"useStore - Encrypted State Management",parameters:{docs:{description:{story:"Demonstrates the useStore hook for global state management with automatic encryption and persistence. \n        \n        The store encrypts data at rest in IndexedDB and provides reactive state updates across components.\n        Check the console and IndexedDB in DevTools to see the encrypted values."}}}},__namedExportsOrder=["LiveDemo","StepByStep","ProductCatalogDemo","CartCalculationsDemo","InputFocusDemo","ThemeToggleDemo","UseStoreDemo"];LiveDemo.parameters={...LiveDemo.parameters,docs:{...LiveDemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'shopping-basket-tutorial\'),\n  name: "Live Demo",\n  parameters: {\n    docs: {\n      description: {\n        story: "A fully interactive shopping basket showcasing all Dim Framework features. Add products, manage cart, switch themes, and see persistence in action!"\n      }\n    }\n  }\n}',...LiveDemo.parameters?.docs?.source}}},StepByStep.parameters={...StepByStep.parameters,docs:{...StepByStep.parameters?.docs,source:{originalSource:"{\n  render: () => null,\n  name: \"📚 Step-by-Step Tutorial\",\n  parameters: {\n    docs: {\n      source: {\n        code: null\n      },\n      description: {\n        story: `\n# 🎓 Building a Shopping Basket - Complete Tutorial\n\nLearn every Dim feature by building a real shopping application step by step. Each section below demonstrates a specific hook with live examples and complete code.\n\n## Step 1: Project Setup & Installation\n\nStart by setting up a new project with Dim Framework.\n\n### Install Dim\n\n\\`\\`\\`bash\nnpm install @dim/core\n# or with yarn\nyarn add @dim/core\n\n# or include via CDN\n<script type=\"module\" src=\"https://unpkg.com/@dim/core\"><\/script>\n\\`\\`\\`\n\n### Basic HTML Structure\n\n\\`\\`\\`html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Shopping Basket with Dim</title>\n</head>\n<body>\n    <div id=\"app\">\n        <shopping-basket></shopping-basket>\n    </div>\n    <script type=\"module\" src=\"./shopping-basket.js\"><\/script>\n</body>\n</html>\n\\`\\`\\`\n\n> 💡 **Tip:** Dim works without any build tools! You can develop directly in the browser with ES modules.\n\n## Step 2: Global State with useStore\n\nCreate a global store for cart data that persists across page reloads.\n\n\\`\\`\\`javascript\nimport { useState, useStore, define } from '@dim/core';\n\nconst ShoppingBasket = (props, { useStore, useState, html }) => {\n  // Global persistent store\n  const store = useStore({\n    cart: useState([]),\n    theme: useState('light'),\n    user: useState({ name: 'Guest' })\n  });\n\n  const [cart, setCart] = store.cart;\n  const [theme, setTheme] = store.theme;\n  const [user, setUser] = store.user;\n\n  return html\\`\n    <div>\n      <h1>Shopping Cart (\\${cart.length} items)</h1>\n      <p>Theme: \\${theme}</p>\n    </div>\n  \\`;\n};\n\ndefine({ tag: 'shopping-basket', component: ShoppingBasket });\n\\`\\`\\`\n\n> 🔥 **Key Feature:** useStore automatically persists data to localStorage, so your cart survives page reloads!\n\n## Step 3: Product Catalog with useState\n\nBuild interactive product cards with local state for hover effects.\n\n\\`\\`\\`javascript\nconst ProductCard = ({ product }, { useState, useStyle, html, css }) => {\n  const [isHovered, setIsHovered] = useState(false);\n  \n  useStyle(css\\`\n    .product-card {\n      padding: 1rem;\n      border-radius: 8px;\n      background: white;\n      box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n      transition: transform 0.2s;\n      cursor: pointer;\n    }\n    \n    .product-card:hover {\n      transform: translateY(-4px);\n      box-shadow: 0 8px 20px rgba(0,0,0,0.15);\n    }\n    \n    .add-button {\n      background: \\${isHovered ? '#0278c7' : '#029cfd'};\n      color: white;\n      border: none;\n      padding: 0.75rem 1rem;\n      border-radius: 6px;\n      cursor: pointer;\n      width: 100%;\n    }\n  \\`);\n\n  return html\\`\n    <div \n      class=\"product-card\"\n      @mouseenter=\"\\${() => setIsHovered(true)}\"\n      @mouseleave=\"\\${() => setIsHovered(false)}\"\n    >\n      <h3>\\${product.name}</h3>\n      <p>$\\${product.price}</p>\n      <button class=\"add-button\">Add to Cart</button>\n    </div>\n  \\`;\n};\n\\`\\`\\`\n\n> ⚠️ **Important:** Each component gets its own isolated state. Hover states are independent per card!\n\n## Step 4: Component Composition with useScope\n\nOrganize your app by composing smaller components together.\n\n\\`\\`\\`javascript\nconst ProductGrid = (props, { useScope, html }) => {\n  // Register child components in this scope\n  useScope({\n    'product-card': ProductCard\n  });\n\n  const products = [\n    { id: 1, name: 'Headphones', price: 199.99 },\n    { id: 2, name: 'Coffee Mug', price: 24.99 },\n    // ... more products\n  ];\n\n  return html\\`\n    <div class=\"product-grid\">\n      \\${products.map(product => html\\`\n        <product-card .product=\"\\${product}\"></product-card>\n      \\`)}\n    </div>\n  \\`;\n};\n\n// In your main component\nconst ShoppingBasket = (props, { useScope, html }) => {\n  useScope({\n    'product-grid': ProductGrid,\n    'shopping-cart': ShoppingCart,\n    'user-controls': UserControls\n  });\n\n  return html\\`\n    <div>\n      <user-controls></user-controls>\n      <product-grid></product-grid>\n      <shopping-cart></shopping-cart>\n    </div>\n  \\`;\n};\n\\`\\`\\`\n\n> 🧩 **Component Architecture:** useScope lets you build modular, reusable components without global registration conflicts.\n\n## Step 5: Performance with useMemo\n\nOptimize expensive calculations with memoization.\n\n\\`\\`\\`javascript\nconst ShoppingCart = (props, { useMemo, html }) => {\n  // Expensive calculations memoized\n  const cartSummary = useMemo(() => {\n    console.log('Calculating cart totals...'); // Only runs when cart changes\n    \n    const subtotal = cart.reduce((sum, item) => \n      sum + (item.price * item.quantity), 0);\n    const tax = subtotal * 0.08;\n    const shipping = subtotal > 50 ? 0 : 9.99;\n    const total = subtotal + tax + shipping;\n    \n    return {\n      subtotal: subtotal.toFixed(2),\n      tax: tax.toFixed(2),\n      shipping: shipping.toFixed(2),\n      total: total.toFixed(2),\n      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)\n    };\n  }, [cart]); // Only recalculate when cart changes\n\n  return html\\`\n    <div>\n      <h3>Cart (\\${cartSummary.itemCount} items)</h3>\n      <p>Subtotal: $\\${cartSummary.subtotal}</p>\n      <p>Tax: $\\${cartSummary.tax}</p>\n      <p>Shipping: $\\${cartSummary.shipping}</p>\n      <p><strong>Total: $\\${cartSummary.total}</strong></p>\n    </div>\n  \\`;\n};\n\\`\\`\\`\n\n> ⚡ **Performance:** useMemo prevents expensive recalculations on every render. Check the console to see it in action!\n\n## Step 6: DOM Access with useRef\n\nDirect DOM manipulation for focus management and input handling.\n\n\\`\\`\\`javascript\nconst CartItem = ({ item }, { useRef, html }) => {\n  const quantityRef = useRef();\n\n  const focusQuantityInput = () => {\n    quantityRef.current?.focus();\n    quantityRef.current?.select(); // Select all text\n  };\n\n  const updateQuantity = (newQuantity) => {\n    if (newQuantity <= 0) {\n      removeItem();\n      return;\n    }\n    setCart(cart.map(cartItem => \n      cartItem.id === item.id \n        ? { ...cartItem, quantity: newQuantity }\n        : cartItem\n    ));\n  };\n\n  return html\\`\n    <div class=\"cart-item\">\n      <span>\\${item.name}</span>\n      <input \n        ref=\"\\${quantityRef}\"\n        type=\"number\" \n        .value=\"\\${item.quantity}\"\n        @change=\"\\${(e) => updateQuantity(parseInt(e.target.value))}\"\n        @dblclick=\"\\${focusQuantityInput}\"\n      />\n      <button @click=\"\\${() => updateQuantity(item.quantity + 1)}\">+</button>\n      <button @click=\"\\${() => updateQuantity(item.quantity - 1)}\">-</button>\n    </div>\n  \\`;\n};\n\\`\\`\\`\n\n> 📍 **DOM Control:** useRef gives you direct access to DOM elements for focus, scrolling, measurements, and more.\n\n## Step 7: Dynamic Theming with useStyle\n\nCreate responsive, themeable components with CSS-in-JS.\n\n\\`\\`\\`javascript\nconst ShoppingApp = (props, { useStyle, useEffect, css }) => {\n  // Re-apply styles when theme changes\n  useEffect(() => {\n    useStyle(css\\`\n      .shopping-app {\n        background: \\${theme === 'light' ? '#f8f9fa' : '#1a1a1a'};\n        color: \\${theme === 'light' ? '#333' : '#fff'};\n        transition: all 0.3s ease;\n        min-height: 100vh;\n        padding: 2rem;\n      }\n\n      .product-card {\n        background: \\${theme === 'light' ? 'white' : '#2a2a2a'};\n        border: 1px solid \\${theme === 'light' ? '#e9ecef' : '#404040'};\n      }\n\n      @media (max-width: 768px) {\n        .shopping-app {\n          padding: 1rem;\n        }\n        \n        .main-content {\n          grid-template-columns: 1fr; /* Stack on mobile */\n        }\n      }\n    \\`);\n  }, [theme]);\n\n  return html\\`\n    <div class=\"shopping-app\">\n      <button @click=\"\\${() => setTheme(theme === 'light' ? 'dark' : 'light')}\">\n        \\${theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode\n      </button>\n      \x3c!-- rest of app --\x3e\n    </div>\n  \\`;\n};\n\\`\\`\\`\n\n> 🎨 **Responsive Design:** Combine CSS-in-JS with media queries for truly dynamic, responsive components.\n\n## Step 8: Side Effects with useEffect\n\nHandle component lifecycle, API calls, and cleanup.\n\n\\`\\`\\`javascript\nconst ShoppingBasket = (props, { useEffect, html }) => {\n  // Component lifecycle\n  useEffect(() => {\n    console.log('Shopping basket mounted');\n    \n    // Cleanup function\n    return () => {\n      console.log('Shopping basket unmounted');\n    };\n  }, []); // Empty deps = run once on mount/unmount\n\n  // React to cart changes\n  useEffect(() => {\n    console.log(\\`Cart updated: \\${cart.length} items\\`);\n    \n    // Update document title\n    document.title = \\`Shopping Cart (\\${cart.length})\\`;\n    \n    // Save to analytics (example)\n    if (cart.length > 0) {\n      analytics.track('cart_updated', {\n        itemCount: cart.length,\n        total: calculateTotal(cart)\n      });\n    }\n  }, [cart]); // Run when cart changes\n\n  // Auto-save draft cart\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      localStorage.setItem('cart_draft', JSON.stringify(cart));\n    }, 1000); // Debounce saves\n\n    return () => clearTimeout(timer);\n  }, [cart]);\n\n  return html\\`<div>Your shopping basket</div>\\`;\n};\n\\`\\`\\`\n\n> 🧹 **Cleanup:** Always clean up timers, subscriptions, and event listeners in the cleanup function to prevent memory leaks.\n\n## 🎉 Congratulations!\n\nYou've now learned all the core Dim hooks by building a complete shopping basket application. You can see the full implementation in the **Live Demo** story above.\n\n### Next Steps\n\n1. Try modifying the live demo to add new features\n2. Explore the **API Reference** for detailed hook documentation\n3. Build your own application using these patterns!\n        `\n      }\n    }\n  }\n}",...StepByStep.parameters?.docs?.source}}},ProductCatalogDemo.parameters={...ProductCatalogDemo.parameters,docs:{...ProductCatalogDemo.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('product-card-example'),\n  name: \"useState - Product Card\",\n  parameters: {\n    docs: {\n      description: {\n        story: `Interactive product card demonstrating local state management with hover effects.`\n      }\n    }\n  }\n}",...ProductCatalogDemo.parameters?.docs?.source}}},CartCalculationsDemo.parameters={...CartCalculationsDemo.parameters,docs:{...CartCalculationsDemo.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('cart-summary-example'),\n  name: \"useMemo - Cart Summary\",\n  parameters: {\n    docs: {\n      description: {\n        story: `Cart summary showing memoized calculations for performance. Open the console to see when calculations run.`\n      }\n    }\n  }\n}",...CartCalculationsDemo.parameters?.docs?.source}}},InputFocusDemo.parameters={...InputFocusDemo.parameters,docs:{...InputFocusDemo.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('input-focus-example'),\n  name: \"useRef - DOM Access\",\n  parameters: {\n    docs: {\n      description: {\n        story: `Input focus management using useRef for direct DOM manipulation.`\n      }\n    }\n  }\n}",...InputFocusDemo.parameters?.docs?.source}}},ThemeToggleDemo.parameters={...ThemeToggleDemo.parameters,docs:{...ThemeToggleDemo.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('theme-toggle-example'),\n  name: \"useStyle - Dynamic Theming\",\n  parameters: {\n    docs: {\n      description: {\n        story: `Dynamic theme switching with CSS-in-JS, demonstrating reactive styling.`\n      }\n    }\n  }\n}",...ThemeToggleDemo.parameters?.docs?.source}}},UseStoreDemo.parameters={...UseStoreDemo.parameters,docs:{...UseStoreDemo.parameters?.docs,source:{originalSource:"{\n  render: () => React.createElement('crypto-test-store-demo'),\n  name: \"useStore - Encrypted State Management\",\n  parameters: {\n    docs: {\n      description: {\n        story: `Demonstrates the useStore hook for global state management with automatic encryption and persistence. \n        \n        The store encrypts data at rest in IndexedDB and provides reactive state updates across components.\n        Check the console and IndexedDB in DevTools to see the encrypted values.`\n      }\n    }\n  }\n}",...UseStoreDemo.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-01-GettingStarted-stories.e2b32c73.iframe.bundle.js.map