import { define, html, css, useRef, useStyle } from "../../../core/dim.ts";
import { appVariables, productImageStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";

const CartItem = (props, { useRef, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    item,
    theme = "light",
    cart = [],
    setCart = () => {},
    onProductClick,
  } = data;

  const quantityRef = useRef();

  if (!item) {
    return html`<div>No item data</div>`;
  }

  const keys = sharedKeys(item.id);

  useStyle(css`
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
  `);

  const updateQuantity = (newQuantity) => {
    if (newQuantity <= 0) {
      removeItem();
      return;
    }
    const currentCart = Array.isArray(cart) ? cart : [];
    setCart(
      currentCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const removeItem = () => {
    const currentCart = Array.isArray(cart) ? cart : [];
    setCart(currentCart.filter((cartItem) => cartItem.id !== item.id));
  };

  const focusQuantityInput = (e) => {
    e.stopPropagation();
    quantityRef.current?.focus();
    quantityRef.current?.select();
  };

  const stopPropagation = (e) => e.stopPropagation();

  return html`
    <div
      class="cart-item"
      data-theme="${theme}"
      @click="${() => onProductClick?.(item.id)}"
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
      <div class="quantity-controls" @click="${stopPropagation}">
        <button
          class="quantity-btn"
          @click="${() => updateQuantity(item.quantity - 1)}"
        >
          -
        </button>
        <input
          ref="${quantityRef}"
          class="quantity-input"
          type="number"
          .value="${item.quantity}"
          @change="${(e) => updateQuantity(parseInt(e.target.value) || 1)}"
          @dblclick="${focusQuantityInput}"
        />
        <button
          class="quantity-btn"
          @click="${() => updateQuantity(item.quantity + 1)}"
        >
          +
        </button>
      </div>
      <button class="remove-btn" @click="${(e) => { e.stopPropagation(); removeItem(); }}">
        Remove
      </button>
    </div>
  `;
};

define({ tag: "cart-item", component: CartItem });
export default CartItem;
