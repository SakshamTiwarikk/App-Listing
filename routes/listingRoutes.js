const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createListing,
  getListings,
} = require("../controllers/listingController");

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
  "/listings",
  authMiddleware,
  upload.array("images", 5),
  createListing
);
router.get("/listings", authMiddleware, getListings);

module.exports = router;
