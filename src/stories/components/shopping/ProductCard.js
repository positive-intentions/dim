import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables, productImageStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";

const ProductCard = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    product,
    theme = "light",
    onProductClick,
    onAddToCart,
  } = data;

  const [isHovered, setIsHovered] = useState(false);

  if (!product) {
    return html`<div>No product data</div>`;
  }

  const keys = sharedKeys(product.id);

  useStyle(css`
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
  `);

  const handleCardClick = (e) => {
    if (e.target.closest(".add-button")) return;
    onProductClick?.(product.id);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return html`
    <div
      class="product-card"
      data-theme="${theme}"
      @click="${handleCardClick}"
      @mouseenter="${() => setIsHovered(true)}"
      @mouseleave="${() => setIsHovered(false)}"
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
        style="background: ${isHovered ? "#0278c7" : "#029cfd"};"
        @click="${handleAdd}"
      >
        Add to Cart
      </button>
    </div>
  `;
};

define({ tag: "product-card", component: ProductCard });
export default ProductCard;
