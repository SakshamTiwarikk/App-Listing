const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createListing,
  getListings,
  updateListing,
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

router.post(
  "/listing",
  authMiddleware,
  upload.array("images", 5),
  createListing
);

// Update listing route (edit post)
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

router.get("/listings", authMiddleware, getListings);

module.exports = router;
