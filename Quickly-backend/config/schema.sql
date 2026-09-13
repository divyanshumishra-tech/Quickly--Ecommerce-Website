-- =============================================
-- BLINKIT CLONE - MySQL Database Schema
-- Run this file to set up your database
-- =============================================

CREATE DATABASE IF NOT EXISTS blinkit_db;
USE blinkit_db;

-- ─── USERS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('customer', 'admin') DEFAULT 'customer',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── ADDRESSES ────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  label         VARCHAR(50) DEFAULT 'Home',   -- Home / Work / Other
  full_address  TEXT NOT NULL,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CATEGORIES ───────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  image_url     VARCHAR(500),
  description   TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── SUBCATEGORIES ────────────────────────────
CREATE TABLE IF NOT EXISTS subcategories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NOT NULL,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  image_url     VARCHAR(500),
  is_active     BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ─── PRODUCTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  category_id     INT NOT NULL,
  subcategory_id  INT,
  brand           VARCHAR(100),
  image_url       VARCHAR(500),
  price           DECIMAL(10, 2) NOT NULL,
  mrp             DECIMAL(10, 2),
  discount        DECIMAL(5, 2) DEFAULT 0,   -- percentage
  unit            VARCHAR(50),               -- e.g. "500g", "1L", "12 pcs"
  stock           INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  delivery_time   VARCHAR(50) DEFAULT '10 mins',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id)    REFERENCES categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- ─── CART ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── ORDERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  address_id      INT,
  status          ENUM('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  total_amount    DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount    DECIMAL(10, 2) NOT NULL,
  payment_method  ENUM('cod','online','wallet') DEFAULT 'cod',
  payment_status  ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  delivery_time   VARCHAR(50) DEFAULT '10 mins',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- ─── ORDER ITEMS ──────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,   -- price at time of order
  subtotal    DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ─── SEED: ADMIN USER ─────────────────────────
-- Password: Admin@123 (bcrypt hash)
INSERT IGNORE INTO users (name, email, phone, password_hash, role)
VALUES (
  'Admin',
  'admin@blinkit.com',
  '9999999999',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin'
);

-- ─── SEED: CATEGORIES ─────────────────────────
INSERT IGNORE INTO categories (name, slug, image_url, display_order) VALUES
('Fruits & Vegetables', 'fruits-vegetables', 'https://cdn.blinkit.com/cats/fruits.png', 1),
('Dairy & Breakfast',   'dairy-breakfast',   'https://cdn.blinkit.com/cats/dairy.png',  2),
('Snacks & Munchies',   'snacks-munchies',   'https://cdn.blinkit.com/cats/snacks.png', 3),
('Beverages',           'beverages',         'https://cdn.blinkit.com/cats/beverages.png', 4),
('Bakery & Biscuits',   'bakery-biscuits',   'https://cdn.blinkit.com/cats/bakery.png', 5),
('Personal Care',       'personal-care',     'https://cdn.blinkit.com/cats/personal.png', 6);
