export const MOCK_USER = {
  id: "guest",
  name: "Alex Shopper",
  email: "alex@example.com",
  preferences: { currency: "USD" },
};

export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 199.99,
    image: "🎧",
    category: "Electronics",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio.",
  },
  {
    id: 2,
    name: "Coffee Mug",
    price: 24.99,
    image: "☕",
    category: "Home",
    description:
      "Handcrafted ceramic mug with heat-retaining double walls. Perfect for your morning brew.",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 129.99,
    image: "👟",
    category: "Sports",
    description:
      "Lightweight performance running shoes with responsive cushioning and breathable mesh upper.",
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 79.99,
    image: "💻",
    category: "Electronics",
    description:
      "Ergonomic aluminum laptop stand with adjustable height and cable management.",
  },
  {
    id: 5,
    name: "Plant Pot",
    price: 19.99,
    image: "🪴",
    category: "Home",
    description:
      "Minimalist ceramic planter with drainage hole. Ideal for succulents and small houseplants.",
  },
  {
    id: 6,
    name: "Yoga Mat",
    price: 49.99,
    image: "🧘",
    category: "Sports",
    description:
      "Non-slip eco-friendly yoga mat with extra cushioning for joint support.",
  },
];

export const MOCK_CATEGORIES = ["All", "Electronics", "Home", "Sports"];

export const MOCK_ORDERS = [
  {
    id: "ord-1001",
    date: "May 28, 2026",
    status: "Delivered",
    total: 224.98,
    items: [
      { productId: 1, name: "Wireless Headphones", quantity: 1, price: 199.99 },
      { productId: 2, name: "Coffee Mug", quantity: 1, price: 24.99 },
    ],
  },
  {
    id: "ord-1002",
    date: "May 15, 2026",
    status: "Delivered",
    total: 129.99,
    items: [{ productId: 3, name: "Running Shoes", quantity: 1, price: 129.99 }],
  },
];

export const getProductById = (id) =>
  MOCK_PRODUCTS.find((p) => String(p.id) === String(id)) ?? null;

export const getOrderById = (id) =>
  MOCK_ORDERS.find((o) => o.id === id) ?? null;

export const generateOrderId = () =>
  `ord-${Date.now().toString(36)}`;
