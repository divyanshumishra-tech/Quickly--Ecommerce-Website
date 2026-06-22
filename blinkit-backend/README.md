# 🟡 Blinkit Clone — Backend API

> Node.js + Express + MySQL REST API for the Blinkit Clone frontend

---

## 📁 Project Structure

```
blinkit-backend/
├── config/
│   ├── db.js           # MySQL connection pool
│   └── schema.sql      # Database tables + seed data
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── addressController.js
│   └── adminController.js
├── middleware/
│   └── auth.js         # JWT protect + adminOnly
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   ├── addresses.js
│   └── admin.js
├── .env.example
├── package.json
└── server.js
```

---

## ⚡ Quick Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd blinkit-backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Then edit .env with your values
```

### 3. Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source /path/to/blinkit-backend/config/schema.sql
```

### 4. Start Server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Server runs at: `http://localhost:5000`

---

## 🔗 API Endpoints

### 🔐 Auth  `/api/auth`
| Method | Endpoint            | Auth | Description        |
|--------|---------------------|------|--------------------|
| POST   | `/register`         | ❌   | Register new user  |
| POST   | `/login`            | ❌   | Login              |
| GET    | `/profile`          | ✅   | Get my profile     |
| PUT    | `/profile`          | ✅   | Update profile     |
| PUT    | `/change-password`  | ✅   | Change password    |

### 🛍️ Products  `/api/products`
| Method | Endpoint     | Auth  | Description               |
|--------|--------------|-------|---------------------------|
| GET    | `/`          | ❌    | List products (+ filters) |
| GET    | `/categories`| ❌    | All categories             |
| GET    | `/:id`       | ❌    | Single product             |
| POST   | `/`          | Admin | Create product             |
| PUT    | `/:id`       | Admin | Update product             |
| DELETE | `/:id`       | Admin | Delete product             |

**Query params:** `?category=fruits-vegetables&search=apple&minPrice=10&maxPrice=200&page=1&limit=20`

### 🛒 Cart  `/api/cart`
| Method | Endpoint       | Auth | Description        |
|--------|----------------|------|--------------------|
| GET    | `/`            | ✅   | Get my cart        |
| POST   | `/`            | ✅   | Add / update item  |
| DELETE | `/:productId`  | ✅   | Remove item        |
| DELETE | `/clear`       | ✅   | Clear entire cart  |

### 📦 Orders  `/api/orders`
| Method | Endpoint         | Auth  | Description         |
|--------|------------------|-------|---------------------|
| POST   | `/`              | ✅    | Place order         |
| GET    | `/my`            | ✅    | My orders           |
| GET    | `/:id`           | ✅    | Order details       |
| PUT    | `/:id/cancel`    | ✅    | Cancel order        |
| GET    | `/`              | Admin | All orders          |
| PUT    | `/:id/status`    | Admin | Update status       |

### 📍 Addresses  `/api/addresses`
| Method | Endpoint | Auth | Description      |
|--------|----------|------|------------------|
| GET    | `/`      | ✅   | My addresses     |
| POST   | `/`      | ✅   | Add address      |
| PUT    | `/:id`   | ✅   | Update address   |
| DELETE | `/:id`   | ✅   | Delete address   |

### 🔧 Admin  `/api/admin`
| Method | Endpoint               | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | `/dashboard`           | Admin | Stats & charts      |
| GET    | `/users`               | Admin | All users           |
| PUT    | `/users/:id/toggle`    | Admin | Block/unblock user  |
| POST   | `/categories`          | Admin | Create category     |
| PUT    | `/categories/:id`      | Admin | Update category     |

---

## 🔑 Authentication

All protected routes need the header:
```
Authorization: Bearer <your_jwt_token>
```

**Default Admin credentials:**
- Email: `admin@blinkit.com`
- Password: `password` ← **Change this in production!**

---

## 🌐 Connect to React Frontend

In your React (Vite) `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Example API call:
```js
// src/utils/api.js
const API = import.meta.env.VITE_API_URL;

export const loginUser = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getProducts = async (token) => {
  const res = await fetch(`${API}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
```

---

## 🚀 Deploy on Render (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set environment variables from `.env.example`
5. Build command: `npm install`
6. Start command: `npm start`

For MySQL, use [PlanetScale](https://planetscale.com) or [Railway](https://railway.app) free tier.

---

## 📋 Order Status Flow

```
pending → confirmed → preparing → out_for_delivery → delivered
                                                    ↘ cancelled
```

## 💸 Delivery Charge Logic
- Order total ≥ ₹199 → **FREE delivery**
- Order total < ₹199 → **₹25 delivery charge**
