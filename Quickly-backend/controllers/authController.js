const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// ── Generate tokens ──────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// ── Register ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, password_hash]
    );

    const token = generateToken(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: { id: result.insertId, name, email, phone, role: "customer" },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account deactivated." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Get Profile ───────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Update Profile ────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query("UPDATE users SET name = ?, phone = ? WHERE id = ?", [
      name, phone, req.user.id,
    ]);
    return res.json({ success: true, message: "Profile updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Change Password ───────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, req.user.id]);

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
