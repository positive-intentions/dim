import React from "react";
import "./components/shopping/ShoppingAppDemo.js";

export default {
  title: "Demo/Shopping App",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Shopping App Demo

A navigable e-commerce app UI built with the Dim framework.
All data is hardcoded — no real payment processing or backend.

## Features

- **Product catalog** with search and category filters
- **Product detail** with exhaustive shared-element transitions
- **Shopping cart** with quantity controls and memoized totals
- **Checkout** flow with mock shipping and payment forms
- **Order confirmation** and **order history**
- **Profile** tab with theme toggle and cart management
- **Persistent state** via \`useStore\` (cart, theme, orders survive reload)

## Page transitions

Uses Dim's automatic \`transitionId\` prop on \`shopping-navigation-view\` for page slides (right = forward, left = back).

| Screen | \`transitionId\` |
|--------|------------------|
| Shop (catalog) | 10 |
| Cart | 11 |
| Orders | 12 |
| Profile | 13 |
| Product detail | 200 + product offset |
| Checkout | 250 |
| Order confirmation | 260 |

## Shared-element transitions (\`data-vt-shared\`)

Per-product keys via \`sharedKeys(id)\`:

| Key | Catalog card | Product detail | Cart item |
|-----|--------------|----------------|-----------|
| \`image-{id}\` | Product emoji | Hero image | Line-item image |
| \`name-{id}\` | Product name | Title | Item name |
| \`price-{id}\` | Price | Price | Unit price |
| \`category-{id}\` | Category badge | Category label | — |

### Routes with shared morphs

- **Catalog → Product detail**: image, name, price, category
- **Product detail → Cart** (when item is in cart): image, name, price
- **Cart item → Product detail**: image, name, price
- **Back navigation**: reverse FLIP on all of the above

Checkout and confirmation screens have no shared morph sources — page slide only.

## Hooks demonstrated

- **useStore** — persistent cart, theme, user, and orders
- **useState** — search, filters, form fields, hover states
- **useMemo** — cart total calculations in \`cart-summary\`
- **useRef** — quantity input focus in \`cart-item\`
- **useStyle** — dynamic theming with CSS-in-JS
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const LiveDemo = {
  render: () => React.createElement("shopping-app-demo"),
  name: "Live Demo",
  parameters: {
    docs: {
      description: {
        story: `
Click a product card to open the detail view — watch the image, name, price, and category morph into the hero layout.
Add items to the cart, proceed through checkout, and confirm your order.
Tap a cart line item to morph back into product detail. Use the sidebar or bottom nav to switch tabs.
        `,
      },
    },
  },
};
