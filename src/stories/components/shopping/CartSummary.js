import { define, html, css, useMemo, useStyle } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";

const CartSummary = (props, { useMemo, useStyle, html, css }) => {
  const data = props.props || props;
  const { cart = [], showCheckout = true, onCheckout } = data;

  const cartSummary = useMemo(() => {
    const currentCart = Array.isArray(cart) ? cart : [];
    const subtotal = currentCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      itemCount: currentCart.reduce((sum, item) => sum + item.quantity, 0),
      isEmpty: currentCart.length === 0,
    };
  }, [cart]);

  useStyle(css`
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
  `);

  if (cartSummary.isEmpty) {
    return html``;
  }

  return html`
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
          ${cartSummary.shipping === "0.00"
            ? "Free"
            : "$" + cartSummary.shipping}
        </span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>$${cartSummary.total}</span>
      </div>
      ${showCheckout
        ? html`
            <button class="checkout-btn" @click="${onCheckout}">
              Proceed to Checkout
            </button>
          `
        : ""}
    </div>
  `;
};

define({ tag: "cart-summary", component: CartSummary });
export default CartSummary;
