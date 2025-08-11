const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getActiveEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const authMiddleware = require("../middleware/authMiddleware");

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ One correct POST route
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
  ]),
  createEmployee
);

// ✅ Other routes
router.get("/", authMiddleware, getEmployees);
router.get("/active", authMiddleware, getActiveEmployees);
router.get("/:id", authMiddleware, getEmployee);
router.put("/:id", authMiddleware, updateEmployee);
router.delete("/:id", authMiddleware, deleteEmployee);

module.exports = router;
