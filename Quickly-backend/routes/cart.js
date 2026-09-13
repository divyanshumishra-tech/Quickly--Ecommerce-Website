// routes/cart.js
const express = require("express");
const cartRouter = express.Router();
const { getCart, upsertCartItem, removeCartItem, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

cartRouter.get("/", protect, getCart);
cartRouter.post("/", protect, upsertCartItem);
cartRouter.delete("/clear", protect, clearCart);
cartRouter.delete("/:productId", protect, removeCartItem);

module.exports = { cartRouter };
