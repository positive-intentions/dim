import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";
import { MOCK_PRODUCTS, getProductById } from "./mockData.js";
import "./CatalogView.js";
import "./ProductDetailView.js";
import "./CartView.js";
import "./CheckoutView.js";
import "./OrderConfirmationView.js";
import "./OrdersView.js";
import "./ProfileView.js";

const NavigationView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const {
    activeTab = 0,
    navStack = ["catalog"],
    theme = "light",
    cart = [],
    setCart = () => {},
    user = {},
    setTheme = () => {},
    orders = [],
    onProductClick,
    onBack,
    onAddToCart,
    onGoToCart,
    onCheckout,
    onCheckoutSubmit,
    onContinueShopping,
    onViewOrders,
  } = data;

  useStyle(css`
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
  `);

  const top = navStack[navStack.length - 1] || "catalog";

  if (top.startsWith("confirmation:")) {
    const orderId = top.split(":").slice(1).join(":");
    const order = orders.find((o) => o.id === orderId) ?? null;

    return html`
      <div class="nav-view-root">
        <order-confirmation-view
          .props="${{
            order,
            theme,
            onContinueShopping,
            onViewOrders,
          }}"
        ></order-confirmation-view>
      </div>
    `;
  }

  if (top === "checkout") {
    return html`
      <div class="nav-view-root">
        <checkout-view
          .props="${{
            cart,
            user,
            theme,
            onBack,
            onSubmit: onCheckoutSubmit,
          }}"
        ></checkout-view>
      </div>
    `;
  }

  if (top.startsWith("product:")) {
    const productId = top.split(":")[1];
    const product = getProductById(productId);

    return html`
      <div class="nav-view-root">
        <product-detail-view
          .props="${{
            product,
            theme,
            onBack,
            onAddToCart,
            onGoToCart,
          }}"
        ></product-detail-view>
      </div>
    `;
  }

  // Tab roots follow activeTab only (same as messaging demo) so the visible
  // screen and transitionId stay in sync when switching tabs.
  if (activeTab === 1) {
    return html`
      <div class="nav-view-root">
        <cart-view
          .props="${{
            cart,
            setCart,
            theme,
            onProductClick,
            onCheckout,
          }}"
        ></cart-view>
      </div>
    `;
  }

  if (activeTab === 2) {
    return html`
      <div class="nav-view-root">
        <orders-view .props="${{ orders, theme }}"></orders-view>
      </div>
    `;
  }

  if (activeTab === 3) {
    return html`
      <div class="nav-view-root">
        <shopping-profile-view
          .props="${{
            user,
            theme,
            setTheme,
            cart,
            setCart,
          }}"
        ></shopping-profile-view>
      </div>
    `;
  }

  return html`
    <div class="nav-view-root">
      <catalog-view
        .props="${{
          products: MOCK_PRODUCTS,
          theme,
          onProductClick,
          onAddToCart,
        }}"
      ></catalog-view>
    </div>
  `;
};

define({ tag: "shopping-navigation-view", component: NavigationView });
export default NavigationView;
