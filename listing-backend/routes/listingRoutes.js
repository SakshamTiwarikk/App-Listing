const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const {
  createListing,
  createGroupedListings, // 👈 new controller
  getListings,
  getGroupedListings,
  updateListing,
  updateGroupedListings, // 👈 new controller
} = require("../controllers/listingController");

console.log("✅ listingRoutes.js loaded");

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const isValid = allowedTypes.test(file.mimetype);
    if (isValid) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/**
 * Routes
 */

// Create single listing
router.post(
  "/listing",
  authMiddleware,
  upload.array("images", 5),
  createListing
);

// Create grouped listings
router.post(
  "/listing/group",
  authMiddleware,
  upload.array("images", 20),
  createGroupedListings // 👈 new controller for group upload
);

// Update single listing
router.put(
  "/listings/:id",
  authMiddleware,
  upload.array("images", 5),
  updateListing
);

// Update grouped listings
router.put(
  "/listing/group/:groupId",
  authMiddleware,
  upload.array("images", 20),
  updateGroupedListings // 👈 new controller for group edit
);

// Get all listings
router.get("/listings", authMiddleware, getListings);
// Get grouped listings
router.get("/listing/group", authMiddleware, getGroupedListings);

module.exports = router;
