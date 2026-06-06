import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables, viewHeaderStyles } from "./sharedStyles.js";
import "./CartSummary.js";

const CheckoutView = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    cart = [],
    user = {},
    theme = "light",
    onBack,
    onSubmit,
  } = data;

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useStyle(css`
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
  `);

  const canSubmit =
    name.trim() && email.trim() && address.trim() && cardNumber.trim().length >= 4;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ name, email, address, cardNumber });
  };

  return html`
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
              @input="${(e) => setName(e.target.value)}"
            />
          </div>
          <div class="form-field">
            <label>Email</label>
            <input
              type="email"
              .value="${email}"
              @input="${(e) => setEmail(e.target.value)}"
            />
          </div>
          <div class="form-field">
            <label>Address</label>
            <input
              type="text"
              .value="${address}"
              @input="${(e) => setAddress(e.target.value)}"
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
              @input="${(e) => setCardNumber(e.target.value)}"
            />
          </div>
        </div>
        <cart-summary .props="${{ cart, showCheckout: false }}"></cart-summary>
        <button
          class="submit-btn"
          ?disabled="${!canSubmit}"
          @click="${handleSubmit}"
        >
          Place Order
        </button>
      </div>
    </div>
  `;
};

define({ tag: "checkout-view", component: CheckoutView });
export default CheckoutView;
