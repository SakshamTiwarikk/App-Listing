const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  forgotPassword,
  assignCompany,
  getCompanyUsers,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Protected routes (require authentication)
router.post("/assign-company", authMiddleware, assignCompany);
router.get("/company-users", authMiddleware, getCompanyUsers);

module.exports = router;
