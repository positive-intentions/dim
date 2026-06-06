import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";
import "./CartItem.js";
import "./CartSummary.js";

const CartView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const {
    cart = [],
    setCart = () => {},
    theme = "light",
    onProductClick,
    onCheckout,
  } = data;

  useStyle(css`
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
  `);

  const itemCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return html`
    <div class="cart-view" data-theme="${theme}">
      <div class="cart-header">
        <h2 class="cart-title">Cart (${itemCount} items)</h2>
      </div>
      <div class="cart-body">
        ${!Array.isArray(cart) || cart.length === 0
          ? html`
              <div class="empty-cart">
                🛒 Your cart is empty<br />
                <small>Browse the shop to add products!</small>
              </div>
            `
          : cart.map(
              (item) => html`
                <cart-item
                  .props="${{
                    item,
                    theme,
                    cart,
                    setCart,
                    onProductClick,
                  }}"
                ></cart-item>
              `
            )}
      </div>
      <div class="cart-footer">
        <cart-summary
          .props="${{ cart, onCheckout }}"
        ></cart-summary>
      </div>
    </div>
  `;
};

define({ tag: "cart-view", component: CartView });
export default CartView;
