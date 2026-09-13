const { pool } = require("../config/db");

const getAddresses = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC", [req.user.id]);
  return res.json({ success: true, addresses: rows });
};

const addAddress = async (req, res) => {
  try {
    const { label, full_address, city, state, pincode, latitude, longitude, is_default } = req.body;

    if (is_default) {
      await pool.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id]);
    }

    const [result] = await pool.query(
      "INSERT INTO addresses (user_id, label, full_address, city, state, pincode, latitude, longitude, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, label || "Home", full_address, city, state, pincode, latitude || null, longitude || null, is_default || false]
    );
    return res.status(201).json({ success: true, message: "Address added.", addressId: result.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { label, full_address, city, state, pincode, is_default } = req.body;
    if (is_default) {
      await pool.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id]);
    }
    await pool.query(
      "UPDATE addresses SET label=?, full_address=?, city=?, state=?, pincode=?, is_default=? WHERE id=? AND user_id=?",
      [label, full_address, city, state, pincode, is_default, req.params.id, req.user.id]
    );
    return res.json({ success: true, message: "Address updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteAddress = async (req, res) => {
  try {
    await pool.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    return res.json({ success: true, message: "Address deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
