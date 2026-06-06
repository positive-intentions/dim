import { define, html, css, useStyle } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";

const OrdersView = (props, { useStyle, html, css }) => {
  const data = props.props || props;
  const { orders = [], theme = "light" } = data;

  useStyle(css`
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
  `);

  return html`
    <div class="orders-view" data-theme="${theme}">
      <div class="orders-header">
        <h2 class="orders-title">Orders</h2>
      </div>
      <ul class="orders-list">
        ${orders.length === 0
          ? html`
              <li class="empty-orders">
                📦 No orders yet<br />
                <small>Complete a checkout to see your orders here.</small>
              </li>
            `
          : orders.map(
              (order) => html`
                <li class="order-row">
                  <div class="order-top">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status">${order.status}</span>
                  </div>
                  <div class="order-meta">${order.date}</div>
                  <div class="order-total">$${order.total.toFixed(2)}</div>
                </li>
              `
            )}
      </ul>
    </div>
  `;
};

define({ tag: "orders-view", component: OrdersView });
export default OrdersView;
