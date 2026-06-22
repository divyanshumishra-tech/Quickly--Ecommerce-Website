const express = require("express");
const router = express.Router();
const { getDashboard, getAllUsers, toggleUserStatus, createCategory, updateCategory } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly); // All admin routes protected

router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);

module.exports = router;
