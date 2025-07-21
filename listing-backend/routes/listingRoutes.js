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

// Configure Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

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
  (req, res, next) => {
    console.log(`✅ PUT /listings/${req.params.id} hit`);
    next();
  },
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
