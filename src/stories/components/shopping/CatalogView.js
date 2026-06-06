import { define, html, css, useState, useStyle } from "../../../core/dim.ts";
import { appVariables } from "./sharedStyles.js";
import { MOCK_CATEGORIES } from "./mockData.js";
import "./ProductCard.js";

const CatalogView = (props, { useState, useStyle, html, css }) => {
  const data = props.props || props;
  const {
    products = [],
    theme = "light",
    onProductClick,
    onAddToCart,
  } = data;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useStyle(css`
    ${appVariables}

    .catalog-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      background: var(--app-surface);
    }

    .catalog-header {
      padding: 1rem 1.25rem 0.5rem;
      flex-shrink: 0;
    }

    .catalog-title {
      margin: 0 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .search-box {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      font-size: 0.875rem;
      box-sizing: border-box;
      margin-bottom: 0.75rem;
      background: var(--app-bg);
      color: var(--app-text);
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }

    .filter-chip {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      border: 1px solid var(--app-border);
      background: transparent;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--app-text-secondary);
    }

    .filter-chip.active {
      background: var(--app-primary-light);
      border-color: var(--app-primary);
      color: var(--app-primary);
      font-weight: 600;
    }

    .product-grid {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 1.25rem 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      align-content: start;
    }
  `);

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return html`
    <div class="catalog-view" data-theme="${theme}">
      <div class="catalog-header">
        <h2 class="catalog-title">Shop</h2>
        <input
          class="search-box"
          type="search"
          placeholder="Search products..."
          .value="${search}"
          @input="${(e) => setSearch(e.target.value)}"
        />
        <div class="filters">
          ${MOCK_CATEGORIES.map(
            (cat) => html`
              <button
                class="filter-chip ${category === cat ? "active" : ""}"
                @click="${() => setCategory(cat)}"
              >
                ${cat}
              </button>
            `
          )}
        </div>
      </div>
      <div class="product-grid">
        ${filtered.map(
          (product) => html`
            <product-card
              .props="${{
                product,
                theme,
                onProductClick,
                onAddToCart,
              }}"
            ></product-card>
          `
        )}
      </div>
    </div>
  `;
};

define({ tag: "catalog-view", component: CatalogView });
export default CatalogView;
