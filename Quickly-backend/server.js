require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// ── Route Imports ─────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const productRoutes  = require("./routes/products");
const { cartRouter } = require("./routes/cart");
const orderRoutes    = require("./routes/orders");
const addressRoutes  = require("./routes/addresses");
const adminRoutes    = require("./routes/admin");

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/cart",      cartRouter);
app.use("/api/orders",    orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin",     adminRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Blinkit Backend is running!" });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Internal server error." });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🟢 Server running at http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
});
