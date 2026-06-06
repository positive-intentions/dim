import { define, html, css, useState, useStyle, useStore } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";
import {
  MOCK_USER,
  MOCK_ORDERS,
  generateOrderId,
} from "./mockData.js";
import "./NavigationView.js";

const TABS = [
  { id: 0, label: "Shop", icon: "🛍️", root: "catalog" },
  { id: 1, label: "Cart", icon: "🛒", root: "cart" },
  { id: 2, label: "Orders", icon: "📦", root: "orders" },
  { id: 3, label: "Profile", icon: "👤", root: "profile" },
];

const TAB_VIEW_IDS = { 0: 10, 1: 11, 2: 12, 3: 13 };

const idToOffset = (id, base) => {
  const num = parseInt(id, 10);
  if (!isNaN(num)) return base + num;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 50;
  }
  return base + 50 + hash;
};

const computeViewId = (activeTab, navStack) => {
  const top = navStack[navStack.length - 1] || "catalog";
  if (top.startsWith("confirmation:")) return "260";
  if (top === "checkout") return "250";
  if (top.startsWith("product:")) {
    return String(idToOffset(top.split(":")[1], 200));
  }
  // Tab roots use activeTab (same as messaging demo) so transitionId and
  // visible content always change together when switching tabs.
  return String(TAB_VIEW_IDS[activeTab] ?? 10);
};

const addProductToCart = (cart, product) => {
  const currentCart = Array.isArray(cart) ? cart : [];
  const existing = currentCart.find((item) => item.id === product.id);
  if (existing) {
    return currentCart.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  return [...currentCart, { ...product, quantity: 1 }];
};

const ShoppingAppDemo = (props, { useState, useStyle, useStore, html, css }) => {
  const store = useStore({
    activeTab: useState(0),
    navStack: useState(["catalog"]),
    cart: useState([]),
    theme: useState("light"),
    user: useState({ ...MOCK_USER }),
    orders: useState([...MOCK_ORDERS]),
  });

  const [activeTab, setActiveTab] = store.activeTab;
  const [navStack, setNavStack] = store.navStack;
  const [cart, setCart] = store.cart;
  const [theme, setTheme] = store.theme;
  const [user, setUser] = store.user;
  const [orders, setOrders] = store.orders;

  const viewId = computeViewId(activeTab, navStack);
  const top = navStack[navStack.length - 1] || "catalog";
  const isPushedScreen =
    top.startsWith("product:") ||
    top === "checkout" ||
    top.startsWith("confirmation:");

  const cartCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  useStyle(css`
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
  `);

  const tabRoot = TABS.find((t) => t.id === activeTab)?.root || "catalog";

  const handleTabChange = (tabId) => {
    const tab = TABS.find((t) => t.id === tabId);
    setActiveTab(tabId);
    setNavStack([tab?.root || "catalog"]);
  };

  const openProduct = (id) => {
    setNavStack([...navStack, `product:${id}`]);
  };

  const goBack = () => {
    if (navStack.length > 1) {
      setNavStack(navStack.slice(0, -1));
    } else {
      setNavStack([tabRoot]);
    }
  };

  const handleAddToCart = (product) => {
    setCart(addProductToCart(cart, product));
  };

  const handleGoToCart = () => {
    setActiveTab(1);
    setNavStack(["cart"]);
  };

  const handleCheckout = () => {
    setNavStack([...navStack, "checkout"]);
  };

  const handleCheckoutSubmit = () => {
    const currentCart = Array.isArray(cart) ? cart : [];
    const subtotal = currentCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;
    const orderId = generateOrderId();

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Processing",
      total,
      items: currentCart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setNavStack(["cart", "checkout", `confirmation:${orderId}`]);
  };

  const handleContinueShopping = () => {
    setActiveTab(0);
    setNavStack(["catalog"]);
  };

  const handleViewOrders = () => {
    setActiveTab(2);
    setNavStack(["orders"]);
  };

  const navProps = {
    activeTab,
    navStack,
    theme,
    cart,
    setCart,
    user,
    setTheme,
    orders,
    onProductClick: openProduct,
    onBack: goBack,
    onAddToCart: handleAddToCart,
    onGoToCart: handleGoToCart,
    onCheckout: handleCheckout,
    onCheckoutSubmit: handleCheckoutSubmit,
    onContinueShopping: handleContinueShopping,
    onViewOrders: handleViewOrders,
  };

  const renderTabButton = (tab, className) => html`
    <button
      class="${className} ${activeTab === tab.id ? "active" : ""}"
      @click="${() => handleTabChange(tab.id)}"
      title="${tab.label}"
    >
      ${className.includes("bottom")
        ? html`
            <span class="bottom-tab-icon">${tab.icon}</span>
            <span>${tab.label}</span>
            ${tab.id === 1 && cartCount > 0
              ? html`<span class="tab-badge">${cartCount}</span>`
              : ""}
          `
        : html`
            ${tab.icon}
            ${tab.id === 1 && cartCount > 0
              ? html`<span class="tab-badge">${cartCount}</span>`
              : ""}
          `}
    </button>
  `;

  return html`
    <div class="shopping-app" data-theme="${theme}">
      <nav class="sidebar">
        <div class="sidebar-logo">🛍️</div>
        ${TABS.map((tab) => renderTabButton(tab, "sidebar-tab"))}
      </nav>

      <div class="main-column ${isPushedScreen ? "pushed-open" : ""}">
        <header class="app-header">
          <h1 class="app-header-title">Dim Shop</h1>
          <button class="header-cart" @click="${() => handleTabChange(1)}">
            🛒
            ${cartCount > 0
              ? html`<span class="cart-badge">${cartCount}</span>`
              : ""}
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
            ${TABS.map((tab) => renderTabButton(tab, "bottom-tab"))}
          </div>
        </nav>
      </div>
    </div>
  `;
};

define({ tag: "shopping-app-demo", component: ShoppingAppDemo });
export default ShoppingAppDemo;
