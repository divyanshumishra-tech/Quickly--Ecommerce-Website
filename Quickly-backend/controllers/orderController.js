const { pool } = require("../config/db");

// ── Place Order ───────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { address_id, payment_method = "cod", notes } = req.body;
    const user_id = req.user.id;

    // Get cart items
    const [cartItems] = await conn.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id]
    );

    if (!cartItems.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Check stock for all items
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `"${item.name}" has insufficient stock.` });
      }
    }

    // Calculate totals
    const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryCharge = totalAmount >= 199 ? 0 : 25;
    const finalAmount = totalAmount + deliveryCharge;

    // Create order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, address_id, total_amount, delivery_charge, final_amount, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, address_id || null, totalAmount, deliveryCharge, finalAmount, payment_method, notes || null]
    );
    const orderId = orderResult.insertId;

    // Insert order items & reduce stock
    for (const item of cartItems) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price, item.price * item.quantity]
      );
      await conn.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await conn.query("DELETE FROM cart WHERE user_id = ?", [user_id]);

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! 🎉",
      orderId,
      totalAmount: totalAmount.toFixed(2),
      deliveryCharge: deliveryCharge.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    });
  } catch (err) {
    await conn.rollback();
    console.error("Order error:", err);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  } finally {
    conn.release();
  }
};

// ── Get My Orders ─────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, a.full_address, a.city, a.pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Attach items to each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.image_url, p.unit
         FROM order_items oi JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Get Single Order ──────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, a.full_address, a.city, a.pincode, a.label
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: "Order not found." });

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url, p.unit
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    return res.json({ success: true, order: { ...orders[0], items } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Cancel Order ──────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!orders.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (!["pending", "confirmed"].includes(orders[0].status)) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage." });
    }

    // Restore stock
    const [items] = await conn.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    for (const item of items) {
      await conn.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    }

    await conn.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    await conn.commit();

    return res.json({ success: true, message: "Order cancelled." });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: "Server error." });
  } finally {
    conn.release();
  }
};

// ── ADMIN: Get All Orders ─────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.name AS customer_name, u.email, u.phone
      FROM orders o JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    if (status) { query += " WHERE o.status = ?"; params.push(status); }
    query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [orders] = await pool.query(query, params);
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── ADMIN: Update Order Status ────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    return res.json({ success: true, message: `Order status updated to "${status}".` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };
