const { pool } = require("../config/db");

// ── Get Cart ──────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id, c.quantity, c.product_id,
              p.name, p.price, p.mrp, p.discount, p.image_url, p.unit, p.stock, p.delivery_time,
              (p.price * c.quantity) AS subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.is_active = TRUE`,
      [req.user.id]
    );

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({ success: true, items, totalAmount: totalAmount.toFixed(2), totalItems });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Add / Update Cart Item ────────────────────────────────────
const upsertCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    // Check product exists and has stock
    const [product] = await pool.query(
      "SELECT id, stock FROM products WHERE id = ? AND is_active = TRUE",
      [product_id]
    );
    if (!product.length) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (product[0].stock < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock." });
    }

    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = ?`,
      [req.user.id, product_id, quantity, quantity]
    );

    return res.json({ success: true, message: "Cart updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Remove Cart Item ──────────────────────────────────────────
const removeCartItem = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      [req.user.id, req.params.productId]
    );
    return res.json({ success: true, message: "Item removed from cart." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Clear Cart ────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await pool.query("DELETE FROM cart WHERE user_id = ?", [req.user.id]);
    return res.json({ success: true, message: "Cart cleared." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getCart, upsertCartItem, removeCartItem, clearCart };
