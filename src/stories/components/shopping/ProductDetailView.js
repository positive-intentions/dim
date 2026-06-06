import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables, productImageStyles, viewHeaderStyles } from "./sharedStyles.js";
import { sharedKeys } from "./sharedKeys.js";

const ProductDetailView = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    product,
    theme = "light",
    onBack,
    onAddToCart,
    onGoToCart,
  } = data;

  const [added, setAdded] = useState(false);

  useStyle(css`
    ${appVariables}
    ${productImageStyles}
    ${viewHeaderStyles}

    .product-detail {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .detail-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 1.25rem;
    }

    .detail-name {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 1rem 0 0.375rem;
      text-align: center;
    }

    .detail-category {
      text-align: center;
      color: var(--app-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .detail-price {
      text-align: center;
      font-size: 1.75rem;
      font-weight: bold;
      color: var(--app-primary);
      margin-bottom: 1.5rem;
    }

    .detail-description {
      color: var(--app-text-secondary);
      line-height: 1.6;
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .primary-btn {
      width: 100%;
      background: var(--app-primary);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.0625rem;
      font-weight: 600;
      cursor: pointer;
    }

    .secondary-btn {
      width: 100%;
      background: transparent;
      color: var(--app-primary);
      border: 2px solid var(--app-primary);
      padding: 0.875rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
  `);

  if (!product) {
    return html`
      <div class="product-detail" data-theme="${theme}">
        <header class="view-header">
          <button class="back-btn" @click="${onBack}">←</button>
          <h1 class="view-title">Product not found</h1>
        </header>
      </div>
    `;
  }

  const keys = sharedKeys(product.id);

  const handleAdd = () => {
    onAddToCart?.(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return html`
    <div class="product-detail" data-theme="${theme}">
      <header class="view-header">
        <button class="back-btn" @click="${onBack}">←</button>
        <h1 class="view-title">Product Details</h1>
      </header>
      <div class="detail-body">
        <div class="product-image hero" data-vt-shared="${keys.image}">
          ${product.image}
        </div>
        <h2 class="detail-name" data-vt-shared="${keys.name}">
          ${product.name}
        </h2>
        <div class="detail-category" data-vt-shared="${keys.category}">
          ${product.category}
        </div>
        <div class="detail-price" data-vt-shared="${keys.price}">
          $${product.price}
        </div>
        <p class="detail-description">${product.description}</p>
        <div class="action-buttons">
          <button class="primary-btn" @click="${handleAdd}">
            ${added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
          <button class="secondary-btn" @click="${onGoToCart}">
            View Cart
          </button>
        </div>
      </div>
    </div>
  `;
};

define({ tag: "product-detail-view", component: ProductDetailView });
export default ProductDetailView;
