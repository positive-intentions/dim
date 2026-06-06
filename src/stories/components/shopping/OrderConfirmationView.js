import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables, viewHeaderStyles } from "./sharedStyles.js";

const OrderConfirmationView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const {
    order,
    theme = "light",
    onContinueShopping,
    onViewOrders,
  } = data;

  useStyle(css`
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
  `);

  if (!order) {
    return html`
      <div class="confirmation-view" data-theme="${theme}">
        <header class="view-header">
          <h1 class="view-title">Order Confirmation</h1>
        </header>
        <div class="confirmation-body">Order not found</div>
      </div>
    `;
  }

  return html`
    <div class="confirmation-view" data-theme="${theme}">
      <header class="view-header">
        <h1 class="view-title">Order Placed</h1>
      </header>
      <div class="confirmation-body">
        <div class="success-icon">✅</div>
        <h2 class="success-title">Thank you for your order!</h2>
        <p class="order-id">Order #${order.id}</p>
        <div class="order-summary">
          ${order.items.map(
            (item) => html`
              <div class="summary-line">
                <span>${item.name} × ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `
          )}
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
  `;
};

define({ tag: "order-confirmation-view", component: OrderConfirmationView });
export default OrderConfirmationView;
