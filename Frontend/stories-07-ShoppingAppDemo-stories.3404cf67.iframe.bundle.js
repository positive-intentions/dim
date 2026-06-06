"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[315],{"./src/stories/07-ShoppingAppDemo.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{LiveDemo:()=>LiveDemo,__namedExportsOrder:()=>__namedExportsOrder,default:()=>_07_ShoppingAppDemo_stories});var react=__webpack_require__("./node_modules/react/index.js"),dim=__webpack_require__("./src/core/dim.ts");const appVariables=dim.AH`
  :host {
    --app-primary: #029cfd;
    --app-primary-light: #e3f2fd;
    --app-bg: #f5f5f5;
    --app-surface: #ffffff;
    --app-text: #212121;
    --app-text-secondary: #757575;
    --app-border: #e0e0e0;
    --app-success: #28a745;
    --app-danger: #dc3545;
    --app-sidebar-width: 72px;
    --app-radius: 12px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: var(--app-text);
  }

  :host([data-theme="dark"]) {
    --app-bg: #1a1a1a;
    --app-surface: #2a2a2a;
    --app-text: #f5f5f5;
    --app-text-secondary: #aaa;
    --app-border: #404040;
    --app-primary-light: #1a3a5c;
  }
`,productImageStyles=dim.AH`
  .product-image {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-primary-light);
    border-radius: var(--app-radius);
    flex-shrink: 0;
  }

  .product-image.sm {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .product-image.md {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .product-image.lg {
    width: 160px;
    height: 160px;
    font-size: 5rem;
  }

  .product-image.hero {
    width: 100%;
    max-width: 320px;
    height: 240px;
    font-size: 6rem;
    margin: 0 auto;
  }
`,viewHeaderStyles=dim.AH`
  .view-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
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

  .view-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }
`,MOCK_USER={id:"guest",name:"Alex Shopper",email:"alex@example.com",preferences:{currency:"USD"}},MOCK_PRODUCTS=[{id:1,name:"Wireless Headphones",price:199.99,image:"🎧",category:"Electronics",description:"Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio."},{id:2,name:"Coffee Mug",price:24.99,image:"☕",category:"Home",description:"Handcrafted ceramic mug with heat-retaining double walls. Perfect for your morning brew."},{id:3,name:"Running Shoes",price:129.99,image:"👟",category:"Sports",description:"Lightweight performance running shoes with responsive cushioning and breathable mesh upper."},{id:4,name:"Laptop Stand",price:79.99,image:"💻",category:"Electronics",description:"Ergonomic aluminum laptop stand with adjustable height and cable management."},{id:5,name:"Plant Pot",price:19.99,image:"🪴",category:"Home",description:"Minimalist ceramic planter with drainage hole. Ideal for succulents and small houseplants."},{id:6,name:"Yoga Mat",price:49.99,image:"🧘",category:"Sports",description:"Non-slip eco-friendly yoga mat with extra cushioning for joint support."}],MOCK_CATEGORIES=["All","Electronics","Home","Sports"],MOCK_ORDERS=[{id:"ord-1001",date:"May 28, 2026",status:"Delivered",total:224.98,items:[{productId:1,name:"Wireless Headphones",quantity:1,price:199.99},{productId:2,name:"Coffee Mug",quantity:1,price:24.99}]},{id:"ord-1002",date:"May 15, 2026",status:"Delivered",total:129.99,items:[{productId:3,name:"Running Shoes",quantity:1,price:129.99}]}],sharedKeys=id=>({image:`image-${id}`,name:`name-${id}`,price:`price-${id}`,category:`category-${id}`}),ProductCard=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{product,theme="light",onProductClick,onAddToCart}=data,[isHovered,setIsHovered]=useState(!1);if(!product)return html`<div>No product data</div>`;const keys=sharedKeys(product.id);useStyle(css`
    ${appVariables}
    ${productImageStyles}

    .product-card {
      border-radius: var(--app-radius);
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .card-image-wrap {
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
    }

    .product-name {
      font-size: 1.0625rem;
      font-weight: 600;
      margin-bottom: 0.375rem;
    }

    .product-category {
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
      margin-bottom: 0.5rem;
    }

    .product-price {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--app-primary);
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
      background: var(--app-primary);
    }

    .add-button:hover {
      background: #0278c7;
    }
  `);return html`
    <div
      class="product-card"
      data-theme="${theme}"
      @click="${e=>{e.target.closest(".add-button")||onProductClick?.(product.id)}}"
      @mouseenter="${()=>setIsHovered(!0)}"
      @mouseleave="${()=>setIsHovered(!1)}"
    >
      <div class="card-image-wrap">
        <div class="product-image md" data-vt-shared="${keys.image}">
          ${product.image}
        </div>
      </div>
      <div class="product-name" data-vt-shared="${keys.name}">${product.name}</div>
      <div class="product-category" data-vt-shared="${keys.category}">
        ${product.category}
      </div>
      <div class="product-price" data-vt-shared="${keys.price}">
        $${product.price}
      </div>
      <button
        class="add-button"
        style="background: ${isHovered?"#0278c7":"#029cfd"};"
        @click="${e=>{e.stopPropagation(),onAddToCart?.(product)}}"
      >
        Add to Cart
      </button>
    </div>
  `};(0,dim.E8)({tag:"product-card",component:ProductCard});const CatalogView=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{products=[],theme="light",onProductClick,onAddToCart}=data,[search,setSearch]=useState(""),[category,setCategory]=useState("All");useStyle(css`
    ${appVariables}

    .catalog-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .catalog-header {
      padding: 1rem 1.25rem 0.5rem;
      flex-shrink: 0;
    }

    .catalog-title {
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
      background: var(--app-bg);
      color: var(--app-text);
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

    .product-grid {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 1.25rem 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      align-content: start;
    }
  `);const filtered=products.filter((p=>{const matchesSearch=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase()),matchesCategory="All"===category||p.category===category;return matchesSearch&&matchesCategory}));return html`
    <div class="catalog-view" data-theme="${theme}">
      <div class="catalog-header">
        <h2 class="catalog-title">Shop</h2>
        <input
          class="search-box"
          type="search"
          placeholder="Search products..."
          .value="${search}"
          @input="${e=>setSearch(e.target.value)}"
        />
        <div class="filters">
          ${MOCK_CATEGORIES.map((cat=>html`
              <button
                class="filter-chip ${category===cat?"active":""}"
                @click="${()=>setCategory(cat)}"
              >
                ${cat}
              </button>
            `))}
        </div>
      </div>
      <div class="product-grid">
        ${filtered.map((product=>html`
            <product-card
              .props="${{product,theme,onProductClick,onAddToCart}}"
            ></product-card>
          `))}
      </div>
    </div>
  `};(0,dim.E8)({tag:"catalog-view",component:CatalogView});const ProductDetailView=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{product,theme="light",onBack,onAddToCart,onGoToCart}=data,[added,setAdded]=useState(!1);if(useStyle(css`
    ${appVariables}
    ${productImageStyles}
    ${viewHeaderStyles}

    .product-detail {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .detail-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 1.25rem;
    }

    .detail-name {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 1rem 0 0.375rem;
      text-align: center;
    }

    .detail-category {
      text-align: center;
      color: var(--app-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .detail-price {
      text-align: center;
      font-size: 1.75rem;
      font-weight: bold;
      color: var(--app-primary);
      margin-bottom: 1.5rem;
    }

    .detail-description {
      color: var(--app-text-secondary);
      line-height: 1.6;
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .primary-btn {
      width: 100%;
      background: var(--app-primary);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.0625rem;
      font-weight: 600;
      cursor: pointer;
    }

    .secondary-btn {
      width: 100%;
      background: transparent;
      color: var(--app-primary);
      border: 2px solid var(--app-primary);
      padding: 0.875rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
  `),!product)return html`
      <div class="product-detail" data-theme="${theme}">
        <header class="view-header">
          <button class="back-btn" @click="${onBack}">←</button>
          <h1 class="view-title">Product not found</h1>
        </header>
      </div>
    `;const keys=sharedKeys(product.id);return html`
    <div class="product-detail" data-theme="${theme}">
      <header class="view-header">
        <button class="back-btn" @click="${onBack}">←</button>
        <h1 class="view-title">Product Details</h1>
      </header>
      <div class="detail-body">
        <div class="product-image hero" data-vt-shared="${keys.image}">
          ${product.image}
        </div>
        <h2 class="detail-name" data-vt-shared="${keys.name}">
          ${product.name}
        </h2>
        <div class="detail-category" data-vt-shared="${keys.category}">
          ${product.category}
        </div>
        <div class="detail-price" data-vt-shared="${keys.price}">
          $${product.price}
        </div>
        <p class="detail-description">${product.description}</p>
        <div class="action-buttons">
          <button class="primary-btn" @click="${()=>{onAddToCart?.(product),setAdded(!0),setTimeout((()=>setAdded(!1)),2e3)}}">
            ${added?"✓ Added to Cart":"Add to Cart"}
          </button>
          <button class="secondary-btn" @click="${onGoToCart}">
            View Cart
          </button>
        </div>
      </div>
    </div>
  `};(0,dim.E8)({tag:"product-detail-view",component:ProductDetailView});const CartItem=(props,{useRef,useStyle,html,css})=>{const data=props.props||props,{item,theme="light",cart=[],setCart=()=>{},onProductClick}=data,quantityRef=useRef();if(!item)return html`<div>No item data</div>`;const keys=sharedKeys(item.id);useStyle(css`
    ${appVariables}
    ${productImageStyles}

    .cart-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      background: var(--app-bg);
      cursor: pointer;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .item-price {
      color: var(--app-primary);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .quantity-btn {
      background: var(--app-primary);
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
      width: 48px;
      text-align: center;
      padding: 0.25rem;
      border: 1px solid var(--app-border);
      border-radius: 4px;
      background: var(--app-surface);
      color: var(--app-text);
    }

    .remove-btn {
      background: var(--app-danger);
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8125rem;
      flex-shrink: 0;
    }
  `);const updateQuantity=newQuantity=>{if(newQuantity<=0)return void removeItem();const currentCart=Array.isArray(cart)?cart:[];setCart(currentCart.map((cartItem=>cartItem.id===item.id?{...cartItem,quantity:newQuantity}:cartItem)))},removeItem=()=>{const currentCart=Array.isArray(cart)?cart:[];setCart(currentCart.filter((cartItem=>cartItem.id!==item.id)))};return html`
    <div
      class="cart-item"
      data-theme="${theme}"
      @click="${()=>onProductClick?.(item.id)}"
    >
      <div class="product-image sm" data-vt-shared="${keys.image}">
        ${item.image}
      </div>
      <div class="item-details">
        <div class="item-name" data-vt-shared="${keys.name}">${item.name}</div>
        <div class="item-price" data-vt-shared="${keys.price}">
          $${item.price} each
        </div>
      </div>
      <div class="quantity-controls" @click="${e=>e.stopPropagation()}">
        <button
          class="quantity-btn"
          @click="${()=>updateQuantity(item.quantity-1)}"
        >
          -
        </button>
        <input
          ref="${quantityRef}"
          class="quantity-input"
          type="number"
          .value="${item.quantity}"
          @change="${e=>updateQuantity(parseInt(e.target.value)||1)}"
          @dblclick="${e=>{e.stopPropagation(),quantityRef.current?.focus(),quantityRef.current?.select()}}"
        />
        <button
          class="quantity-btn"
          @click="${()=>updateQuantity(item.quantity+1)}"
        >
          +
        </button>
      </div>
      <button class="remove-btn" @click="${e=>{e.stopPropagation(),removeItem()}}">
        Remove
      </button>
    </div>
  `};(0,dim.E8)({tag:"cart-item",component:CartItem});const CartSummary=(props,{useMemo,useStyle,html,css})=>{const data=props.props||props,{cart=[],showCheckout=!0,onCheckout}=data,cartSummary=useMemo((()=>{const currentCart=Array.isArray(cart)?cart:[],subtotal=currentCart.reduce(((sum,item)=>sum+item.price*item.quantity),0),tax=.08*subtotal,shipping=subtotal>50?0:9.99,total=subtotal+tax+shipping;return{subtotal:subtotal.toFixed(2),tax:tax.toFixed(2),shipping:shipping.toFixed(2),total:total.toFixed(2),itemCount:currentCart.reduce(((sum,item)=>sum+item.quantity),0),isEmpty:0===currentCart.length}}),[cart]);return useStyle(css`
    ${appVariables}

    .cart-summary {
      padding-top: 1rem;
      border-top: 1px solid var(--app-border);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9375rem;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: bold;
      padding-top: 0.5rem;
      border-top: 1px solid var(--app-border);
      color: var(--app-primary);
      margin-top: 0.5rem;
    }

    .checkout-btn {
      width: 100%;
      background: var(--app-success);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.0625rem;
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
  `),cartSummary.isEmpty?html``:html`
    <div class="cart-summary">
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
        <span>
          ${"0.00"===cartSummary.shipping?"Free":"$"+cartSummary.shipping}
        </span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>$${cartSummary.total}</span>
      </div>
      ${showCheckout?html`
            <button class="checkout-btn" @click="${onCheckout}">
              Proceed to Checkout
            </button>
          `:""}
    </div>
  `};(0,dim.E8)({tag:"cart-summary",component:CartSummary});const CartView=(props,{useStyle,html,css})=>{const data=props.props||props,{cart=[],setCart=()=>{},theme="light",onProductClick,onCheckout}=data;useStyle(css`
    ${appVariables}

    .cart-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .cart-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
      flex-shrink: 0;
    }

    .cart-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.25rem;
    }

    .empty-cart {
      text-align: center;
      color: var(--app-text-secondary);
      padding: 3rem 1rem;
      font-style: italic;
    }

    .cart-footer {
      padding: 0 1.25rem 1.25rem;
      flex-shrink: 0;
    }
  `);const itemCount=Array.isArray(cart)?cart.reduce(((sum,item)=>sum+item.quantity),0):0;return html`
    <div class="cart-view" data-theme="${theme}">
      <div class="cart-header">
        <h2 class="cart-title">Cart (${itemCount} items)</h2>
      </div>
      <div class="cart-body">
        ${Array.isArray(cart)&&0!==cart.length?cart.map((item=>html`
                <cart-item
                  .props="${{item,theme,cart,setCart,onProductClick}}"
                ></cart-item>
              `)):html`
              <div class="empty-cart">
                🛒 Your cart is empty<br />
                <small>Browse the shop to add products!</small>
              </div>
            `}
      </div>
      <div class="cart-footer">
        <cart-summary
          .props="${{cart,onCheckout}}"
        ></cart-summary>
      </div>
    </div>
  `};(0,dim.E8)({tag:"cart-view",component:CartView});const CheckoutView=(props,{useState,useStyle,html,css})=>{const data=props.props||props,{cart=[],user={},theme="light",onBack,onSubmit}=data,[name,setName]=useState(user.name||""),[email,setEmail]=useState(user.email||""),[address,setAddress]=useState(""),[cardNumber,setCardNumber]=useState("");useStyle(css`
    ${appVariables}
    ${viewHeaderStyles}

    .checkout-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .checkout-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--app-text-secondary);
      margin-bottom: 0.75rem;
    }

    .form-field {
      margin-bottom: 0.875rem;
    }

    .form-field label {
      display: block;
      font-size: 0.8125rem;
      margin-bottom: 0.375rem;
      color: var(--app-text-secondary);
    }

    .form-field input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      font-size: 0.9375rem;
      box-sizing: border-box;
      background: var(--app-bg);
      color: var(--app-text);
    }

    .submit-btn {
      width: 100%;
      background: var(--app-success);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.0625rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    .submit-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  `);const canSubmit=name.trim()&&email.trim()&&address.trim()&&cardNumber.trim().length>=4;return html`
    <div class="checkout-view" data-theme="${theme}">
      <header class="view-header">
        <button class="back-btn" @click="${onBack}">←</button>
        <h1 class="view-title">Checkout</h1>
      </header>
      <div class="checkout-body">
        <div class="form-section">
          <div class="section-label">Shipping</div>
          <div class="form-field">
            <label>Full name</label>
            <input
              type="text"
              .value="${name}"
              @input="${e=>setName(e.target.value)}"
            />
          </div>
          <div class="form-field">
            <label>Email</label>
            <input
              type="email"
              .value="${email}"
              @input="${e=>setEmail(e.target.value)}"
            />
          </div>
          <div class="form-field">
            <label>Address</label>
            <input
              type="text"
              .value="${address}"
              @input="${e=>setAddress(e.target.value)}"
            />
          </div>
        </div>
        <div class="form-section">
          <div class="section-label">Payment</div>
          <div class="form-field">
            <label>Card number</label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              .value="${cardNumber}"
              @input="${e=>setCardNumber(e.target.value)}"
            />
          </div>
        </div>
        <cart-summary .props="${{cart,showCheckout:!1}}"></cart-summary>
        <button
          class="submit-btn"
          ?disabled="${!canSubmit}"
          @click="${()=>{canSubmit&&onSubmit?.({name,email,address,cardNumber})}}"
        >
          Place Order
        </button>
      </div>
    </div>
  `};(0,dim.E8)({tag:"checkout-view",component:CheckoutView});const OrderConfirmationView=(props,{useStyle,html,css})=>{const data=props.props||props,{order,theme="light",onContinueShopping,onViewOrders}=data;return useStyle(css`
    ${appVariables}
    ${viewHeaderStyles}

    .confirmation-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .confirmation-body {
      flex: 1;
      overflow-y: auto;
      padding: 2rem 1.25rem;
      text-align: center;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: var(--app-success);
    }

    .order-id {
      color: var(--app-text-secondary);
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
    }

    .order-summary {
      text-align: left;
      background: var(--app-bg);
      border-radius: var(--app-radius);
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.375rem;
      font-size: 0.9375rem;
    }

    .summary-line.total {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--app-primary);
      border-top: 1px solid var(--app-border);
      padding-top: 0.5rem;
      margin-top: 0.5rem;
    }

    .action-btn {
      width: 100%;
      padding: 0.875rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 0.75rem;
    }

    .primary-btn {
      background: var(--app-primary);
      color: white;
      border: none;
    }

    .secondary-btn {
      background: transparent;
      color: var(--app-primary);
      border: 2px solid var(--app-primary);
    }
  `),order?html`
    <div class="confirmation-view" data-theme="${theme}">
      <header class="view-header">
        <h1 class="view-title">Order Placed</h1>
      </header>
      <div class="confirmation-body">
        <div class="success-icon">✅</div>
        <h2 class="success-title">Thank you for your order!</h2>
        <p class="order-id">Order #${order.id}</p>
        <div class="order-summary">
          ${order.items.map((item=>html`
              <div class="summary-line">
                <span>${item.name} × ${item.quantity}</span>
                <span>$${(item.price*item.quantity).toFixed(2)}</span>
              </div>
            `))}
          <div class="summary-line total">
            <span>Total</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
        </div>
        <button class="action-btn primary-btn" @click="${onContinueShopping}">
          Continue Shopping
        </button>
        <button class="action-btn secondary-btn" @click="${onViewOrders}">
          View Orders
        </button>
      </div>
    </div>
  `:html`
      <div class="confirmation-view" data-theme="${theme}">
        <header class="view-header">
          <h1 class="view-title">Order Confirmation</h1>
        </header>
        <div class="confirmation-body">Order not found</div>
      </div>
    `};(0,dim.E8)({tag:"order-confirmation-view",component:OrderConfirmationView});const OrdersView=(props,{useStyle,html,css})=>{const data=props.props||props,{orders=[],theme="light"}=data;return useStyle(css`
    ${appVariables}

    .orders-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .orders-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
      flex-shrink: 0;
    }

    .orders-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .orders-list {
      flex: 1;
      overflow-y: auto;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .order-row {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.375rem;
    }

    .order-id {
      font-weight: 600;
      font-size: 0.9375rem;
    }

    .order-status {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      background: var(--app-primary-light);
      color: var(--app-primary);
      font-weight: 600;
    }

    .order-meta {
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
      margin-bottom: 0.375rem;
    }

    .order-total {
      font-weight: 600;
      color: var(--app-primary);
    }

    .empty-orders {
      text-align: center;
      color: var(--app-text-secondary);
      padding: 3rem 1rem;
      font-style: italic;
    }
  `),html`
    <div class="orders-view" data-theme="${theme}">
      <div class="orders-header">
        <h2 class="orders-title">Orders</h2>
      </div>
      <ul class="orders-list">
        ${0===orders.length?html`
              <li class="empty-orders">
                📦 No orders yet<br />
                <small>Complete a checkout to see your orders here.</small>
              </li>
            `:orders.map((order=>html`
                <li class="order-row">
                  <div class="order-top">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status">${order.status}</span>
                  </div>
                  <div class="order-meta">${order.date}</div>
                  <div class="order-total">$${order.total.toFixed(2)}</div>
                </li>
              `))}
      </ul>
    </div>
  `};(0,dim.E8)({tag:"orders-view",component:OrdersView});const ProfileView=(props,{useStyle,html,css})=>{const data=props.props||props,{user={},theme="light",setTheme=()=>{},cart=[],setCart=()=>{}}=data;useStyle(css`
    ${appVariables}

    .profile-view {
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
      overflow-y: auto;
    }

    .profile-hero {
      text-align: center;
      padding: 2rem 1.5rem 1.5rem;
      background: linear-gradient(
        180deg,
        var(--app-primary-light) 0%,
        var(--app-surface) 100%
      );
    }

    .profile-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--app-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto;
    }

    .profile-name {
      margin: 1rem 0 0.25rem;
      font-size: 1.375rem;
      font-weight: 600;
    }

    .profile-email {
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

    .setting-btn {
      background: var(--app-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .danger-btn {
      background: var(--app-danger);
    }
  `);const itemCount=Array.isArray(cart)?cart.reduce(((sum,item)=>sum+item.quantity),0):0;return html`
    <div class="profile-view" data-theme="${theme}">
      <div class="profile-hero">
        <div class="profile-avatar">👤</div>
        <h2 class="profile-name">${user.name||"Guest"}</h2>
        <p class="profile-email">${user.email||""}</p>
      </div>
      <div class="settings-section">
        <div class="section-title">Preferences</div>
        <div class="setting-row">
          <span>Theme</span>
          <button
            class="setting-btn"
            @click="${()=>setTheme("light"===theme?"dark":"light")}"
          >
            ${"light"===theme?"🌙 Dark":"☀️ Light"}
          </button>
        </div>
        <div class="setting-row">
          <span>Currency</span>
          <span>${user.preferences?.currency||"USD"}</span>
        </div>
      </div>
      <div class="settings-section">
        <div class="section-title">Cart</div>
        <div class="setting-row">
          <span>Items in cart</span>
          <span>${itemCount}</span>
        </div>
        ${itemCount>0?html`
              <div class="setting-row">
                <span>Clear cart</span>
                <button
                  class="setting-btn danger-btn"
                  @click="${()=>setCart([])}"
                >
                  Clear
                </button>
              </div>
            `:""}
      </div>
    </div>
  `};(0,dim.E8)({tag:"shopping-profile-view",component:ProfileView});const NavigationView=(props,{useStyle,html,css})=>{const data=props.props||props,{activeTab=0,navStack=["catalog"],theme="light",cart=[],setCart=()=>{},user={},setTheme=()=>{},orders=[],onProductClick,onBack,onAddToCart,onGoToCart,onCheckout,onCheckoutSubmit,onContinueShopping,onViewOrders}=data;useStyle(css`
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
  `);const top=navStack[navStack.length-1]||"catalog";if(top.startsWith("confirmation:")){const orderId=top.split(":").slice(1).join(":");return html`
      <div class="nav-view-root">
        <order-confirmation-view
          .props="${{order:orders.find((o=>o.id===orderId))??null,theme,onContinueShopping,onViewOrders}}"
        ></order-confirmation-view>
      </div>
    `}if("checkout"===top)return html`
      <div class="nav-view-root">
        <checkout-view
          .props="${{cart,user,theme,onBack,onSubmit:onCheckoutSubmit}}"
        ></checkout-view>
      </div>
    `;if(top.startsWith("product:")){const productId=top.split(":")[1];return html`
      <div class="nav-view-root">
        <product-detail-view
          .props="${{product:(id=productId,MOCK_PRODUCTS.find((p=>String(p.id)===String(id)))??null),theme,onBack,onAddToCart,onGoToCart}}"
        ></product-detail-view>
      </div>
    `}var id;return 1===activeTab?html`
      <div class="nav-view-root">
        <cart-view
          .props="${{cart,setCart,theme,onProductClick,onCheckout}}"
        ></cart-view>
      </div>
    `:2===activeTab?html`
      <div class="nav-view-root">
        <orders-view .props="${{orders,theme}}"></orders-view>
      </div>
    `:3===activeTab?html`
      <div class="nav-view-root">
        <shopping-profile-view
          .props="${{user,theme,setTheme,cart,setCart}}"
        ></shopping-profile-view>
      </div>
    `:html`
    <div class="nav-view-root">
      <catalog-view
        .props="${{products:MOCK_PRODUCTS,theme,onProductClick,onAddToCart}}"
      ></catalog-view>
    </div>
  `};(0,dim.E8)({tag:"shopping-navigation-view",component:NavigationView});const TABS=[{id:0,label:"Shop",icon:"🛍️",root:"catalog"},{id:1,label:"Cart",icon:"🛒",root:"cart"},{id:2,label:"Orders",icon:"📦",root:"orders"},{id:3,label:"Profile",icon:"👤",root:"profile"}],TAB_VIEW_IDS={0:10,1:11,2:12,3:13},computeViewId=(activeTab,navStack)=>{const top=navStack[navStack.length-1]||"catalog";return top.startsWith("confirmation:")?"260":"checkout"===top?"250":top.startsWith("product:")?String(((id,base)=>{const num=parseInt(id,10);if(!isNaN(num))return base+num;let hash=0;for(let i=0;i<id.length;i++)hash=(31*hash+id.charCodeAt(i))%50;return base+50+hash})(top.split(":")[1],200)):String(TAB_VIEW_IDS[activeTab]??10)},ShoppingAppDemo=(props,{useState,useStyle,useStore,html,css})=>{const store=useStore({activeTab:useState(0),navStack:useState(["catalog"]),cart:useState([]),theme:useState("light"),user:useState({...MOCK_USER}),orders:useState([...MOCK_ORDERS])}),[activeTab,setActiveTab]=store.activeTab,[navStack,setNavStack]=store.navStack,[cart,setCart]=store.cart,[theme,setTheme]=store.theme,[user,setUser]=store.user,[orders,setOrders]=store.orders,viewId=computeViewId(activeTab,navStack),top=navStack[navStack.length-1]||"catalog",isPushedScreen=top.startsWith("product:")||"checkout"===top||top.startsWith("confirmation:"),cartCount=Array.isArray(cart)?cart.reduce(((sum,item)=>sum+item.quantity),0):0;useStyle(css`
    ${appVariables}

    .shopping-app {
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
      background: var(--app-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
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
      position: relative;
    }

    .sidebar-tab:hover {
      background: #f5f5f5;
    }

    .sidebar-tab.active {
      background: var(--app-primary-light);
    }

    .tab-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--app-primary);
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .main-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      position: relative;
    }

    .main-column.pushed-open .app-header,
    .main-column.pushed-open .bottom-nav {
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

    .header-cart {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.9375rem;
      color: var(--app-text);
      padding: 0.375rem 0.75rem;
      border-radius: 8px;
    }

    .header-cart:hover {
      background: var(--app-bg);
    }

    .cart-badge {
      background: var(--app-primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      position: relative;
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
  `);const tabRoot=TABS.find((t=>t.id===activeTab))?.root||"catalog",handleTabChange=tabId=>{const tab=TABS.find((t=>t.id===tabId));setActiveTab(tabId),setNavStack([tab?.root||"catalog"])},navProps={activeTab,navStack,theme,cart,setCart,user,setTheme,orders,onProductClick:id=>{setNavStack([...navStack,`product:${id}`])},onBack:()=>{navStack.length>1?setNavStack(navStack.slice(0,-1)):setNavStack([tabRoot])},onAddToCart:product=>{setCart(((cart,product)=>{const currentCart=Array.isArray(cart)?cart:[];return currentCart.find((item=>item.id===product.id))?currentCart.map((item=>item.id===product.id?{...item,quantity:item.quantity+1}:item)):[...currentCart,{...product,quantity:1}]})(cart,product))},onGoToCart:()=>{setActiveTab(1),setNavStack(["cart"])},onCheckout:()=>{setNavStack([...navStack,"checkout"])},onCheckoutSubmit:()=>{const currentCart=Array.isArray(cart)?cart:[],subtotal=currentCart.reduce(((sum,item)=>sum+item.price*item.quantity),0),total=subtotal+.08*subtotal+(subtotal>50?0:9.99),orderId=`ord-${Date.now().toString(36)}`,newOrder={id:orderId,date:(new Date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),status:"Processing",total,items:currentCart.map((item=>({productId:item.id,name:item.name,quantity:item.quantity,price:item.price})))};setOrders([newOrder,...orders]),setCart([]),setNavStack(["cart","checkout",`confirmation:${orderId}`])},onContinueShopping:()=>{setActiveTab(0),setNavStack(["catalog"])},onViewOrders:()=>{setActiveTab(2),setNavStack(["orders"])}},renderTabButton=(tab,className)=>html`
    <button
      class="${className} ${activeTab===tab.id?"active":""}"
      @click="${()=>handleTabChange(tab.id)}"
      title="${tab.label}"
    >
      ${className.includes("bottom")?html`
            <span class="bottom-tab-icon">${tab.icon}</span>
            <span>${tab.label}</span>
            ${1===tab.id&&cartCount>0?html`<span class="tab-badge">${cartCount}</span>`:""}
          `:html`
            ${tab.icon}
            ${1===tab.id&&cartCount>0?html`<span class="tab-badge">${cartCount}</span>`:""}
          `}
    </button>
  `;return html`
    <div class="shopping-app" data-theme="${theme}">
      <nav class="sidebar">
        <div class="sidebar-logo">🛍️</div>
        ${TABS.map((tab=>renderTabButton(tab,"sidebar-tab")))}
      </nav>

      <div class="main-column ${isPushedScreen?"pushed-open":""}">
        <header class="app-header">
          <h1 class="app-header-title">Dim Shop</h1>
          <button class="header-cart" @click="${()=>handleTabChange(1)}">
            🛒
            ${cartCount>0?html`<span class="cart-badge">${cartCount}</span>`:""}
          </button>
        </header>

        <div class="content-area">
          <shopping-navigation-view
            transitionId="${viewId}"
            transitionDuration="450"
            .props="${navProps}"
          ></shopping-navigation-view>
        </div>

        <nav class="bottom-nav">
          <div class="bottom-nav-inner">
            ${TABS.map((tab=>renderTabButton(tab,"bottom-tab")))}
          </div>
        </nav>
      </div>
    </div>
  `};(0,dim.E8)({tag:"shopping-app-demo",component:ShoppingAppDemo});const _07_ShoppingAppDemo_stories={title:"Demo/Shopping App",parameters:{layout:"fullscreen",docs:{description:{component:"\n# Shopping App Demo\n\nA navigable e-commerce app UI built with the Dim framework.\nAll data is hardcoded — no real payment processing or backend.\n\n## Features\n\n- **Product catalog** with search and category filters\n- **Product detail** with exhaustive shared-element transitions\n- **Shopping cart** with quantity controls and memoized totals\n- **Checkout** flow with mock shipping and payment forms\n- **Order confirmation** and **order history**\n- **Profile** tab with theme toggle and cart management\n- **Persistent state** via `useStore` (cart, theme, orders survive reload)\n\n## Page transitions\n\nUses Dim's automatic `transitionId` prop on `shopping-navigation-view` for page slides (right = forward, left = back).\n\n| Screen | `transitionId` |\n|--------|------------------|\n| Shop (catalog) | 10 |\n| Cart | 11 |\n| Orders | 12 |\n| Profile | 13 |\n| Product detail | 200 + product offset |\n| Checkout | 250 |\n| Order confirmation | 260 |\n\n## Shared-element transitions (`data-vt-shared`)\n\nPer-product keys via `sharedKeys(id)`:\n\n| Key | Catalog card | Product detail | Cart item |\n|-----|--------------|----------------|-----------|\n| `image-{id}` | Product emoji | Hero image | Line-item image |\n| `name-{id}` | Product name | Title | Item name |\n| `price-{id}` | Price | Price | Unit price |\n| `category-{id}` | Category badge | Category label | — |\n\n### Routes with shared morphs\n\n- **Catalog → Product detail**: image, name, price, category\n- **Product detail → Cart** (when item is in cart): image, name, price\n- **Cart item → Product detail**: image, name, price\n- **Back navigation**: reverse FLIP on all of the above\n\nCheckout and confirmation screens have no shared morph sources — page slide only.\n\n## Hooks demonstrated\n\n- **useStore** — persistent cart, theme, user, and orders\n- **useState** — search, filters, form fields, hover states\n- **useMemo** — cart total calculations in `cart-summary`\n- **useRef** — quantity input focus in `cart-item`\n- **useStyle** — dynamic theming with CSS-in-JS\n        "}}},tags:["autodocs"]},LiveDemo={render:()=>react.createElement("shopping-app-demo"),name:"Live Demo",parameters:{docs:{description:{story:"\nClick a product card to open the detail view — watch the image, name, price, and category morph into the hero layout.\nAdd items to the cart, proceed through checkout, and confirm your order.\nTap a cart line item to morph back into product detail. Use the sidebar or bottom nav to switch tabs.\n        "}}}},__namedExportsOrder=["LiveDemo"];LiveDemo.parameters={...LiveDemo.parameters,docs:{...LiveDemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement("shopping-app-demo"),\n  name: "Live Demo",\n  parameters: {\n    docs: {\n      description: {\n        story: `\nClick a product card to open the detail view — watch the image, name, price, and category morph into the hero layout.\nAdd items to the cart, proceed through checkout, and confirm your order.\nTap a cart line item to morph back into product detail. Use the sidebar or bottom nav to switch tabs.\n        `\n      }\n    }\n  }\n}',...LiveDemo.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-07-ShoppingAppDemo-stories.3404cf67.iframe.bundle.js.map