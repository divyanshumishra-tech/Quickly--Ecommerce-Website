const { pool } = require("../config/db");

// ── Dashboard Stats ───────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]]     = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'customer'");
    const [[{ totalProducts }]]  = await pool.query("SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = TRUE");
    const [[{ totalOrders }]]    = await pool.query("SELECT COUNT(*) AS totalOrders FROM orders");
    const [[{ totalRevenue }]]   = await pool.query("SELECT COALESCE(SUM(final_amount), 0) AS totalRevenue FROM orders WHERE status = 'delivered'");
    const [[{ pendingOrders }]]  = await pool.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'");
    const [[{ lowStockCount }]]  = await pool.query("SELECT COUNT(*) AS lowStockCount FROM products WHERE stock <= 5 AND is_active = TRUE");

    // Recent orders
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.final_amount, o.status, o.created_at, u.name AS customer_name
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    // Revenue last 7 days
    const [revenueChart] = await pool.query(
      `SELECT DATE(created_at) AS date, SUM(final_amount) AS revenue
       FROM orders WHERE status = 'delivered' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at) ORDER BY date`
    );

    return res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders, lowStockCount },
      recentOrders,
      revenueChart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Get All Users ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    let query = "SELECT id, name, email, phone, role, is_active, created_at FROM users";
    const params = [];
    if (search) {
      query += " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [users] = await pool.query(query, params);
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Toggle User Active Status ─────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    await pool.query(
      "UPDATE users SET is_active = NOT is_active WHERE id = ? AND role != 'admin'",
      [req.params.id]
    );
    return res.json({ success: true, message: "User status updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Manage Categories ─────────────────────────────────────────
const createCategory = async (req, res) => {
  try {
    const { name, image_url, description, display_order } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await pool.query(
      "INSERT INTO categories (name, slug, image_url, description, display_order) VALUES (?, ?, ?, ?, ?)",
      [name, slug, image_url, description, display_order || 0]
    );
    return res.status(201).json({ success: true, message: "Category created." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, image_url, description, display_order, is_active } = req.body;
    await pool.query(
      "UPDATE categories SET name=?, image_url=?, description=?, display_order=?, is_active=? WHERE id=?",
      [name, image_url, description, display_order, is_active, req.params.id]
    );
    return res.json({ success: true, message: "Category updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getDashboard, getAllUsers, toggleUserStatus, createCategory, updateCategory };
