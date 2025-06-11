import React from "react";
import { define, html, css, useState, useEffect, useStyle, useScope, useMemo, useRef, useStore, unsafeCSS } from "../core/dim.ts";
import "./test-crypto-store-demo.js";

// Shopping Basket Tutorial - Complete Implementation
const ShoppingBasketTutorial = (props, { useState, useEffect, useStyle, useScope, useMemo, useRef, useStore, html, css }) => {
  // Use persistent store for cart, theme, and user data
  const store = useStore({
    cart: useState([]),
    theme: useState('light'),
    user: useState({ name: 'Guest', preferences: { currency: 'USD' } })
  });

  const [cart, setCart] = store.cart;
  const [theme, setTheme] = store.theme;
  const [user, setUser] = store.user;

  // Sample products data
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 199.99, image: '🎧', category: 'Electronics' },
    { id: 2, name: 'Coffee Mug', price: 24.99, image: '☕', category: 'Home' },
    { id: 3, name: 'Running Shoes', price: 129.99, image: '👟', category: 'Sports' },
    { id: 4, name: 'Laptop Stand', price: 79.99, image: '💻', category: 'Electronics' },
    { id: 5, name: 'Plant Pot', price: 19.99, image: '🪴', category: 'Home' },
    { id: 6, name: 'Yoga Mat', price: 49.99, image: '🧘', category: 'Sports' }
  ];

  // Product Card Component - Demonstrates useStyle with props
  const ProductCard = (props, { useState, useStyle, useEffect, html, css }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Extract props from .props attribute
    const { product, theme, cart, setCart } = props.props || props;
    
    // Provide defaults if not passed
    if (!product) {
      return html`<div>No product data</div>`;
    }
    
    useStyle(css`
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
    `);

    const addToCart = () => {
      const currentCart = Array.isArray(cart) ? cart : [];
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        setCart(currentCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...currentCart, { ...product, quantity: 1 }]);
      }
    };

    return html`
      <div 
        class="product-card"
        style="background: ${theme === 'light' ? 'white' : '#2a2a2a'}; border: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};"
        @mouseenter="${() => setIsHovered(true)}"
        @mouseleave="${() => setIsHovered(false)}"
      >
        <div class="product-image">${product.image}</div>
        <div class="product-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">${product.name}</div>
        <div class="product-category">${product.category}</div>
        <div class="product-price">$${product.price}</div>
        <button class="add-button" style="background: ${isHovered ? '#0278c7' : '#029cfd'};" @click="${addToCart}">
          Add to Cart
        </button>
      </div>
    `;
  };

  // Cart Item Component - Demonstrates useRef for DOM access
  const CartItem = (props, { useState, useRef, useStyle, useEffect, html, css }) => {
    const quantityRef = useRef();
    
    // Extract props from .props attribute
    const { item, theme, cart, setCart } = props.props || props;
    
    // Provide defaults if not passed
    if (!item) {
      return html`<div>No item data</div>`;
    }
    
    useStyle(css`
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
    `);

    const updateQuantity = (newQuantity) => {
      if (newQuantity <= 0) {
        removeItem();
        return;
      }
      const currentCart = Array.isArray(cart) ? cart : [];
      setCart(currentCart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    };

    const removeItem = () => {
      const currentCart = Array.isArray(cart) ? cart : [];
      setCart(currentCart.filter(cartItem => cartItem.id !== item.id));
    };

    const focusQuantityInput = () => {
      quantityRef.current?.focus();
      quantityRef.current?.select();
    };

    return html`
      <div class="cart-item" style="background: ${theme === 'light' ? '#f8f9fa' : '#353535'};">
        <div class="item-image">${item.image}</div>
        <div class="item-details">
          <div class="item-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">${item.name}</div>
          <div class="item-price">$${item.price} each</div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" @click="${() => updateQuantity(item.quantity - 1)}">-</button>
          <input 
            ref="${quantityRef}"
            class="quantity-input" 
            type="number" 
            .value="${item.quantity}"
            style="background: ${theme === 'light' ? 'white' : '#2a2a2a'}; color: ${theme === 'light' ? '#333' : '#fff'};"
            @change="${(e) => updateQuantity(parseInt(e.target.value) || 1)}"
            @dblclick="${focusQuantityInput}"
          />
          <button class="quantity-btn" @click="${() => updateQuantity(item.quantity + 1)}">+</button>
        </div>
        <button class="remove-btn" @click="${removeItem}">Remove</button>
      </div>
    `;
  };

  // Shopping Cart Component - Demonstrates useMemo for calculations
  const ShoppingCart = (props, { useMemo, useStyle, useScope, useEffect, html, css }) => {
    // Extract props from .props attribute
    const { 
      theme = 'light', 
      cart = [], 
      setCart = () => {} 
    } = props.props || props;
    
    useScope({
      'cart-item': CartItem
    });

    // Memoized calculations for performance
    const cartSummary = useMemo(() => {
      const currentCart = Array.isArray(cart) ? cart : [];
      const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
      const total = subtotal + tax + shipping;
      
      return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        itemCount: currentCart.reduce((sum, item) => sum + item.quantity, 0)
      };
    }, [cart]);

    useStyle(css`
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
    `);

    return html`
      <div class="shopping-cart" style="background: ${theme === 'light' ? 'white' : '#2a2a2a'}; border: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};">
        <div class="cart-header">
          <h3 class="cart-title" style="color: ${theme === 'light' ? '#333' : '#fff'};">Shopping Cart</h3>
          <span class="item-count">${cartSummary.itemCount} items</span>
        </div>

        <div class="cart-items">
          ${Array.isArray(cart) && cart.length === 0 ? html`
            <div class="empty-cart">
              🛒 Your cart is empty<br>
              <small>Add some products to get started!</small>
            </div>
          ` : html`
            ${Array.isArray(cart) ? cart.map(item => html`
              <cart-item .props="${{ item, theme, cart, setCart }}"></cart-item>
            `) : ''}
          `}
        </div>

        ${Array.isArray(cart) && cart.length > 0 ? html`
          <div class="cart-summary" style="border-top: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};">
            <div class="summary-row" style="color: ${theme === 'light' ? '#333' : '#fff'};">
              <span>Subtotal:</span>
              <span>$${cartSummary.subtotal}</span>
            </div>
            <div class="summary-row" style="color: ${theme === 'light' ? '#333' : '#fff'};">
              <span>Tax:</span>
              <span>$${cartSummary.tax}</span>
            </div>
            <div class="summary-row" style="color: ${theme === 'light' ? '#333' : '#fff'};">
              <span>Shipping:</span>
              <span>${cartSummary.shipping === '0.00' ? 'Free' : '$' + cartSummary.shipping}</span>
            </div>
            <div class="summary-row total" style="border-top: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};">
              <span>Total:</span>
              <span>$${cartSummary.total}</span>
            </div>
            <button class="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        ` : ''}
      </div>
    `;
  };

  // User Controls - Demonstrates theme switching and useStore
  const UserControls = (props, { useStyle, useEffect, html, css }) => {
    // Extract props from .props attribute
    const { 
      theme = 'light', 
      setTheme = () => {}, 
      user = { name: 'Guest' }, 
      cart = [], 
      setCart = () => {} 
    } = props.props || props;
    
    useStyle(css`
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
    `);

    return html`
      <div class="user-controls" style="background: ${theme === 'light' ? 'white' : '#2a2a2a'}; border: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};">
        <div class="user-info" style="color: ${theme === 'light' ? '#333' : '#fff'};">
          Welcome, ${user.name}! 👋
        </div>
        <div class="controls">
          <button class="theme-toggle" style="background: ${theme === 'light' ? '#6c757d' : '#029cfd'};" @click="${() => setTheme(theme === 'light' ? 'dark' : 'light')}">
            ${theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
          </button>
          ${Array.isArray(cart) && cart.length > 0 ? html`
            <button class="clear-cart" @click="${() => setCart([])}">
              Clear Cart
            </button>
          ` : ''}
        </div>
      </div>
    `;
  };

  // Product Grid - Demonstrates useScope for component composition
  const ProductGrid = (props, { useScope, useStyle, useEffect, html, css }) => {
    // Extract props from .props attribute
    const { 
      theme = 'light', 
      cart = [], 
      setCart = () => {}, 
      products = [] 
    } = props.props || props;
    
    useScope({
      'product-card': ProductCard
    });

    useStyle(css`
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
    `);

    return html`
      <div>
        <div class="products-header">
          <h2 class="products-title" style="color: ${theme === 'light' ? '#333' : '#fff'};">Our Products</h2>
          <p class="products-subtitle">Discover amazing products at great prices</p>
        </div>
        <div class="product-grid">
          ${products.map(product => html`
            <product-card .props="${{ product, theme, cart, setCart }}"></product-card>
          `)}
        </div>
      </div>
    `;
  };

  // Register all components in scope
  useScope({
    'user-controls': UserControls,
    'product-grid': ProductGrid,
    'shopping-cart': ShoppingCart
  });

  // Main container styles
  useStyle(css`
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
  `);

  // Effect to demonstrate lifecycle
  useEffect(() => {
    const cartLength = Array.isArray(cart) ? cart.length : 0;
    console.log(`Shopping app mounted with ${cartLength} items in cart`);
    
    return () => {
      console.log('Shopping app unmounted');
    };
  }, []);

  return html`
    <div class="shopping-app" style="background: ${theme === 'light' ? '#f8f9fa' : '#1a1a1a'};">
      <div class="app-header">
        <h1 class="app-title" style="color: ${theme === 'light' ? '#333' : '#fff'};">🛍️ Dim Shopping</h1>
        <p class="app-subtitle">A complete shopping experience built with Dim Framework</p>
      </div>

      <user-controls .props="${{ theme, setTheme, user, cart, setCart }}">
      </user-controls>

      <div class="main-content">
        <div class="products-section">
          <product-grid .props="${{ theme, cart, setCart, products }}">
          </product-grid>
        </div>
        <div class="cart-section">
          <shopping-cart .props="${{ theme, cart, setCart }}">
          </shopping-cart>
        </div>
      </div>

      <div class="features-showcase" style="background: ${theme === 'light' ? 'white' : '#2a2a2a'}; border: 1px solid ${theme === 'light' ? '#e9ecef' : '#404040'};">
        <h3 class="features-title" style="color: ${theme === 'light' ? '#333' : '#fff'};">🚀 Dim Features Demonstrated</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useState</div>
            <div class="feature-desc">Cart items, theme, hover states</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useEffect</div>
            <div class="feature-desc">Component lifecycle, style updates</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useStyle</div>
            <div class="feature-desc">Dynamic theming, responsive design</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🧩</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useScope</div>
            <div class="feature-desc">Component composition</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🧠</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useMemo</div>
            <div class="feature-desc">Cart calculations, performance</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useRef</div>
            <div class="feature-desc">Input focus, DOM manipulation</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💾</div>
            <div class="feature-name" style="color: ${theme === 'light' ? '#333' : '#fff'};">useStore</div>
            <div class="feature-desc">Global state, persistence</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Small example components for the tutorial
const ProductCardExample = (props, { useState, useStyle, html, css }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  useStyle(css`
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
  `);

  return html`
    <div 
      class="product-card"
      @mouseenter="${() => setIsHovered(true)}"
      @mouseleave="${() => setIsHovered(false)}"
    >
      <div class="product-image">☕</div>
      <div class="product-name">Coffee Mug</div>
      <div class="product-price">$24.99</div>
      <button class="add-button" style="background: ${isHovered ? '#0278c7' : '#029cfd'};">Add to Cart</button>
    </div>
  `;
};

const CartSummaryExample = (props, { useMemo, useStyle, html, css }) => {
  // Sample cart data
  const cart = [
    { id: 1, name: 'Coffee Mug', price: 24.99, quantity: 2 },
    { id: 2, name: 'Laptop Stand', price: 79.99, quantity: 1 }
  ];

  const cartSummary = useMemo(() => {
    console.log('Calculating cart totals...'); // Shows memoization
    
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart]);

  useStyle(css`
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
  `);

  return html`
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
        <span>${cartSummary.shipping === '0.00' ? 'Free' : '$' + cartSummary.shipping}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>$${cartSummary.total}</span>
      </div>
    </div>
  `;
};

const InputFocusExample = (props, { useRef, useStyle, html, css }) => {
  const inputRef = useRef();

  useStyle(css`
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
  `);

  const focusAndSelect = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return html`
    <div class="input-demo">
      <input 
        ref="${inputRef}"
        type="text" 
        value="Double-click to select"
        @dblclick="${focusAndSelect}"
      />
      <button @click="${focusAndSelect}">Focus & Select</button>
    </div>
  `;
};

const ThemeToggleExample = (props, { useState, useEffect, useStyle, html, css }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    useStyle(css`
      .theme-demo {
        padding: 2rem;
        background: ${unsafeCSS(theme === 'light' ? '#f8f9fa' : '#2a2a2a')};
        color: ${unsafeCSS(theme === 'light' ? '#333' : '#fff')};
        border-radius: 12px;
        text-align: center;
        transition: all 0.3s ease;
        max-width: 400px;
        margin: 0 auto;
      }

      button {
        background: ${unsafeCSS(theme === 'light' ? '#6c757d' : '#029cfd')};
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
      }
    `);
  }, [theme]);

  return html`
    <div class="theme-demo">
      <h3>Dynamic Theme Demo</h3>
      <p>Current theme: ${theme}</p>
      <button @click="${() => setTheme(theme === 'light' ? 'dark' : 'light')}">
        ${theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
      </button>
    </div>
  `;
};

// Define components
define({ tag: 'shopping-basket-tutorial', component: ShoppingBasketTutorial });
define({ tag: 'product-card-example', component: ProductCardExample });
define({ tag: 'cart-summary-example', component: CartSummaryExample });
define({ tag: 'input-focus-example', component: InputFocusExample });
define({ tag: 'theme-toggle-example', component: ThemeToggleExample });



export default {
  title: "Getting Started",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# 🛍️ Complete Shopping Basket Tutorial

Learn Dim Framework by building a real-world shopping application that demonstrates every feature.

## 🎯 What You'll Build

A complete shopping experience featuring:
- **Product catalog** with interactive cards
- **Shopping cart** with quantity controls
- **Real-time calculations** with tax and shipping
- **Dark/light theme** switching
- **Persistent state** that survives page reloads
- **Responsive design** that works on all devices

## 🚀 Features Covered

### Core Hooks
- **useState** - Local component state for UI interactions
- **useEffect** - Component lifecycle and side effects
- **useStyle** - Dynamic CSS-in-JS with theming
- **useScope** - Component composition and organization
- **useMemo** - Performance optimization for calculations
- **useRef** - DOM access and manipulation
- **useStore** - Global state management with persistence

### Real-World Patterns
- **State Management** - Cart data, user preferences, theme
- **Component Architecture** - Modular, reusable components
- **Performance** - Memoized calculations, efficient re-renders
- **User Experience** - Smooth interactions, responsive design
- **Data Persistence** - Automatic localStorage integration

## 📚 Learning Path

1. **Live Demo** - Interact with the completed application
2. **Step-by-Step Tutorial** - Build it yourself with guided steps
3. **Code Examples** - Copy-paste ready code snippets
4. **Best Practices** - Learn professional patterns and techniques

## 🔥 Why This Tutorial?

Unlike simple examples, this tutorial shows you:
- How to structure a real application
- How different hooks work together
- Performance considerations at scale
- Production-ready patterns and practices

Perfect for developers wanting to learn modern web component development with a React-like API!
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const LiveDemo = {
  render: () => React.createElement('shopping-basket-tutorial'),
  name: "Live Demo",
  parameters: {
    docs: {
      description: {
        story: "A fully interactive shopping basket showcasing all Dim Framework features. Add products, manage cart, switch themes, and see persistence in action!"
      }
    }
  }
};

export const StepByStep = {
  render: () => null,
  name: "📚 Step-by-Step Tutorial",
  parameters: {
    docs: {
      source: { code: null },
      description: {
        story: `
# 🎓 Building a Shopping Basket - Complete Tutorial

Learn every Dim feature by building a real shopping application step by step. Each section below demonstrates a specific hook with live examples and complete code.

## Step 1: Project Setup & Installation

Start by setting up a new project with Dim Framework.

### Install Dim

\`\`\`bash
npm install @dim/core
# or with yarn
yarn add @dim/core

# or include via CDN
<script type="module" src="https://unpkg.com/@dim/core"></script>
\`\`\`

### Basic HTML Structure

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Shopping Basket with Dim</title>
</head>
<body>
    <div id="app">
        <shopping-basket></shopping-basket>
    </div>
    <script type="module" src="./shopping-basket.js"></script>
</body>
</html>
\`\`\`

> 💡 **Tip:** Dim works without any build tools! You can develop directly in the browser with ES modules.

## Step 2: Global State with useStore

Create a global store for cart data that persists across page reloads.

\`\`\`javascript
import { useState, useStore, define } from '@dim/core';

const ShoppingBasket = (props, { useStore, useState, html }) => {
  // Global persistent store
  const store = useStore({
    cart: useState([]),
    theme: useState('light'),
    user: useState({ name: 'Guest' })
  });

  const [cart, setCart] = store.cart;
  const [theme, setTheme] = store.theme;
  const [user, setUser] = store.user;

  return html\`
    <div>
      <h1>Shopping Cart (\${cart.length} items)</h1>
      <p>Theme: \${theme}</p>
    </div>
  \`;
};

define({ tag: 'shopping-basket', component: ShoppingBasket });
\`\`\`

> 🔥 **Key Feature:** useStore automatically persists data to localStorage, so your cart survives page reloads!

## Step 3: Product Catalog with useState

Build interactive product cards with local state for hover effects.

\`\`\`javascript
const ProductCard = ({ product }, { useState, useStyle, html, css }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  useStyle(css\`
    .product-card {
      padding: 1rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      cursor: pointer;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    
    .add-button {
      background: \${isHovered ? '#0278c7' : '#029cfd'};
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
    }
  \`);

  return html\`
    <div 
      class="product-card"
      @mouseenter="\${() => setIsHovered(true)}"
      @mouseleave="\${() => setIsHovered(false)}"
    >
      <h3>\${product.name}</h3>
      <p>$\${product.price}</p>
      <button class="add-button">Add to Cart</button>
    </div>
  \`;
};
\`\`\`

> ⚠️ **Important:** Each component gets its own isolated state. Hover states are independent per card!

## Step 4: Component Composition with useScope

Organize your app by composing smaller components together.

\`\`\`javascript
const ProductGrid = (props, { useScope, html }) => {
  // Register child components in this scope
  useScope({
    'product-card': ProductCard
  });

  const products = [
    { id: 1, name: 'Headphones', price: 199.99 },
    { id: 2, name: 'Coffee Mug', price: 24.99 },
    // ... more products
  ];

  return html\`
    <div class="product-grid">
      \${products.map(product => html\`
        <product-card .product="\${product}"></product-card>
      \`)}
    </div>
  \`;
};

// In your main component
const ShoppingBasket = (props, { useScope, html }) => {
  useScope({
    'product-grid': ProductGrid,
    'shopping-cart': ShoppingCart,
    'user-controls': UserControls
  });

  return html\`
    <div>
      <user-controls></user-controls>
      <product-grid></product-grid>
      <shopping-cart></shopping-cart>
    </div>
  \`;
};
\`\`\`

> 🧩 **Component Architecture:** useScope lets you build modular, reusable components without global registration conflicts.

## Step 5: Performance with useMemo

Optimize expensive calculations with memoization.

\`\`\`javascript
const ShoppingCart = (props, { useMemo, html }) => {
  // Expensive calculations memoized
  const cartSummary = useMemo(() => {
    console.log('Calculating cart totals...'); // Only runs when cart changes
    
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart]); // Only recalculate when cart changes

  return html\`
    <div>
      <h3>Cart (\${cartSummary.itemCount} items)</h3>
      <p>Subtotal: $\${cartSummary.subtotal}</p>
      <p>Tax: $\${cartSummary.tax}</p>
      <p>Shipping: $\${cartSummary.shipping}</p>
      <p><strong>Total: $\${cartSummary.total}</strong></p>
    </div>
  \`;
};
\`\`\`

> ⚡ **Performance:** useMemo prevents expensive recalculations on every render. Check the console to see it in action!

## Step 6: DOM Access with useRef

Direct DOM manipulation for focus management and input handling.

\`\`\`javascript
const CartItem = ({ item }, { useRef, html }) => {
  const quantityRef = useRef();

  const focusQuantityInput = () => {
    quantityRef.current?.focus();
    quantityRef.current?.select(); // Select all text
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity <= 0) {
      removeItem();
      return;
    }
    setCart(cart.map(cartItem => 
      cartItem.id === item.id 
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    ));
  };

  return html\`
    <div class="cart-item">
      <span>\${item.name}</span>
      <input 
        ref="\${quantityRef}"
        type="number" 
        .value="\${item.quantity}"
        @change="\${(e) => updateQuantity(parseInt(e.target.value))}"
        @dblclick="\${focusQuantityInput}"
      />
      <button @click="\${() => updateQuantity(item.quantity + 1)}">+</button>
      <button @click="\${() => updateQuantity(item.quantity - 1)}">-</button>
    </div>
  \`;
};
\`\`\`

> 📍 **DOM Control:** useRef gives you direct access to DOM elements for focus, scrolling, measurements, and more.

## Step 7: Dynamic Theming with useStyle

Create responsive, themeable components with CSS-in-JS.

\`\`\`javascript
const ShoppingApp = (props, { useStyle, useEffect, css }) => {
  // Re-apply styles when theme changes
  useEffect(() => {
    useStyle(css\`
      .shopping-app {
        background: \${theme === 'light' ? '#f8f9fa' : '#1a1a1a'};
        color: \${theme === 'light' ? '#333' : '#fff'};
        transition: all 0.3s ease;
        min-height: 100vh;
        padding: 2rem;
      }

      .product-card {
        background: \${theme === 'light' ? 'white' : '#2a2a2a'};
        border: 1px solid \${theme === 'light' ? '#e9ecef' : '#404040'};
      }

      @media (max-width: 768px) {
        .shopping-app {
          padding: 1rem;
        }
        
        .main-content {
          grid-template-columns: 1fr; /* Stack on mobile */
        }
      }
    \`);
  }, [theme]);

  return html\`
    <div class="shopping-app">
      <button @click="\${() => setTheme(theme === 'light' ? 'dark' : 'light')}">
        \${theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
      </button>
      <!-- rest of app -->
    </div>
  \`;
};
\`\`\`

> 🎨 **Responsive Design:** Combine CSS-in-JS with media queries for truly dynamic, responsive components.

## Step 8: Side Effects with useEffect

Handle component lifecycle, API calls, and cleanup.

\`\`\`javascript
const ShoppingBasket = (props, { useEffect, html }) => {
  // Component lifecycle
  useEffect(() => {
    console.log('Shopping basket mounted');
    
    // Cleanup function
    return () => {
      console.log('Shopping basket unmounted');
    };
  }, []); // Empty deps = run once on mount/unmount

  // React to cart changes
  useEffect(() => {
    console.log(\`Cart updated: \${cart.length} items\`);
    
    // Update document title
    document.title = \`Shopping Cart (\${cart.length})\`;
    
    // Save to analytics (example)
    if (cart.length > 0) {
      analytics.track('cart_updated', {
        itemCount: cart.length,
        total: calculateTotal(cart)
      });
    }
  }, [cart]); // Run when cart changes

  // Auto-save draft cart
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('cart_draft', JSON.stringify(cart));
    }, 1000); // Debounce saves

    return () => clearTimeout(timer);
  }, [cart]);

  return html\`<div>Your shopping basket</div>\`;
};
\`\`\`

> 🧹 **Cleanup:** Always clean up timers, subscriptions, and event listeners in the cleanup function to prevent memory leaks.

## 🎉 Congratulations!

You've now learned all the core Dim hooks by building a complete shopping basket application. You can see the full implementation in the **Live Demo** story above.

### Next Steps

1. Try modifying the live demo to add new features
2. Explore the **API Reference** for detailed hook documentation
3. Build your own application using these patterns!
        `
      }
    }
  }
};

export const ProductCatalogDemo = {
  render: () => React.createElement('product-card-example'),
  name: "useState - Product Card",
  parameters: {
    docs: {
      description: {
        story: `Interactive product card demonstrating local state management with hover effects.`
      }
    }
  }
};

export const CartCalculationsDemo = {
  render: () => React.createElement('cart-summary-example'),
  name: "useMemo - Cart Summary",
  parameters: {
    docs: {
      description: {
        story: `Cart summary showing memoized calculations for performance. Open the console to see when calculations run.`
      }
    }
  }
};

export const InputFocusDemo = {
  render: () => React.createElement('input-focus-example'),
  name: "useRef - DOM Access",
  parameters: {
    docs: {
      description: {
        story: `Input focus management using useRef for direct DOM manipulation.`
      }
    }
  }
};

export const ThemeToggleDemo = {
  render: () => React.createElement('theme-toggle-example'),
  name: "useStyle - Dynamic Theming",
  parameters: {
    docs: {
      description: {
        story: `Dynamic theme switching with CSS-in-JS, demonstrating reactive styling.`
      }
    }
  }
};

export const UseStoreDemo = {
  render: () => React.createElement('crypto-test-store-demo'),
  name: "useStore - Encrypted State Management",
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the useStore hook for global state management with automatic encryption and persistence. 
        
        The store encrypts data at rest in IndexedDB and provides reactive state updates across components.
        Check the console and IndexedDB in DevTools to see the encrypted values.`
      }
    }
  }
};