const API = import.meta.env.VITE_API_URL;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ── Auth ──────────────────────────────────────
export const registerUser = (data) =>
  fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const loginUser = (data) =>
  fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const getProfile = (token) =>
  fetch(`${API}/auth/profile`, { headers: authHeaders(token) }).then((r) => r.json());

// ── Products ──────────────────────────────────
export const getProducts = (params = "") =>
  fetch(`${API}/products?${params}`).then((r) => r.json());

export const getCategories = () =>
  fetch(`${API}/products/categories`).then((r) => r.json());

// ── Cart ──────────────────────────────────────
export const getCart = (token) =>
  fetch(`${API}/cart`, { headers: authHeaders(token) }).then((r) => r.json());

export const addToCart = (token, product_id, quantity = 1) =>
  fetch(`${API}/cart`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ product_id, quantity }),
  }).then((r) => r.json());

export const removeFromCart = (token, productId) =>
  fetch(`${API}/cart/${productId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }).then((r) => r.json());

export const clearCart = (token) =>
  fetch(`${API}/cart/clear`, {
    method: "DELETE",
    headers: authHeaders(token),
  }).then((r) => r.json());

// ── Orders ────────────────────────────────────
export const placeOrder = (token, data) =>
  fetch(`${API}/orders`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const getMyOrders = (token) =>
  fetch(`${API}/orders/my`, { headers: authHeaders(token) }).then((r) => r.json());

// ── Addresses ─────────────────────────────────
export const getAddresses = (token) =>
  fetch(`${API}/addresses`, { headers: authHeaders(token) }).then((r) => r.json());

export const addAddress = (token, data) =>
  fetch(`${API}/addresses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }).then((r) => r.json());