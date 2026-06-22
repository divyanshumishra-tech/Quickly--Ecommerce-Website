const { pool } = require("../config/db");

// ── Get All Products (with filters) ──────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, subcategory, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name AS category_name, s.name AS subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category) {
      query += " AND c.slug = ?";
      params.push(category);
    }
    if (subcategory) {
      query += " AND s.slug = ?";
      params.push(subcategory);
    }
    if (search) {
      query += " AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (minPrice) { query += " AND p.price >= ?"; params.push(minPrice); }
    if (maxPrice) { query += " AND p.price <= ?"; params.push(maxPrice); }

    // Count total
    const countQuery = query.replace(
      "SELECT p.*, c.name AS category_name, s.name AS subcategory_name",
      "SELECT COUNT(*) AS total"
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [products] = await pool.query(query, params);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Get Single Product ────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, s.name AS subcategory_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       WHERE p.id = ? AND p.is_active = TRUE`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, product: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Get All Categories ────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order"
    );
    const [subcategories] = await pool.query(
      "SELECT * FROM subcategories WHERE is_active = TRUE ORDER BY display_order"
    );

    // Nest subcategories under categories
    const result = categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
    }));

    return res.json({ success: true, categories: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── ADMIN: Create Product ─────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, category_id, subcategory_id, brand, image_url, price, mrp, discount, unit, stock, delivery_time } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, category_id, subcategory_id, brand, image_url, price, mrp, discount, unit, stock, delivery_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, category_id, subcategory_id || null, brand, image_url, price, mrp || price, discount || 0, unit, stock || 0, delivery_time || "10 mins"]
    );
    return res.status(201).json({ success: true, message: "Product created.", productId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── ADMIN: Update Product ─────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, mrp, discount, stock, is_active, image_url, unit, delivery_time } = req.body;
    await pool.query(
      `UPDATE products SET name=?, description=?, price=?, mrp=?, discount=?, stock=?, is_active=?, image_url=?, unit=?, delivery_time=? WHERE id=?`,
      [name, description, price, mrp, discount, stock, is_active, image_url, unit, delivery_time, req.params.id]
    );
    return res.json({ success: true, message: "Product updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── ADMIN: Delete Product ─────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    await pool.query("UPDATE products SET is_active = FALSE WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getProducts, getProductById, getCategories, createProduct, updateProduct, deleteProduct };
