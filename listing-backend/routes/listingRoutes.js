const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const {
  createListing,
  createGroupedListings,
  getListings,
  getGroupedListings,
  updateListing,
  updateGroupedListings,
} = require("../controllers/listingController");

console.log("✅ listingRoutes.js loaded");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Configuration with Better Error Handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    try {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, unique + ext);
    } catch (error) {
      cb(error);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10 MB per file
    fieldSize: 10 * 1024 * 1024, // 10MB field size limit
    fields: 10, // Maximum number of non-file fields
    files: 20, // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    try {
      const allowedTypes = /jpeg|jpg|png|webp|gif/;
      const isValidMimetype = allowedTypes.test(file.mimetype);
      const isValidExtension = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (isValidMimetype && isValidExtension) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file type: ${file.mimetype}. Only JPEG, JPG, PNG, WEBP, and GIF are allowed.`
          )
        );
      }
    } catch (error) {
      cb(error);
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer Error:", err);

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          message: "File too large. Maximum size is 10MB per file.",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          message: "Too many files. Maximum is 20 files.",
        });
      case "LIMIT_FIELD_VALUE":
        return res.status(400).json({
          message: "Field value too large.",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          message: "Unexpected file field.",
        });
      default:
        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
    }
  } else if (err) {
    console.error("Upload Error:", err);
    return res.status(400).json({
      message: err.message || "File upload failed",
    });
  }
  next();
};

// Wrapper function to handle upload errors
const uploadWithErrorHandling = (fieldName, maxCount) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  };
};

/**
 * Routes with improved error handling
 */

// Create single listing
router.post(
  "/listing",
  authMiddleware,
  uploadWithErrorHandling("images", 5),
  createListing
);

// Create grouped listings
router.post(
  "/listing/group",
  authMiddleware,
  uploadWithErrorHandling("images", 20),
  createGroupedListings
);

// Update single listing
router.put(
  "/listings/:id",
  authMiddleware,
  uploadWithErrorHandling("images", 5),
  updateListing
);

// Update grouped listings
router.put(
  "/listing/group/:groupId",
  authMiddleware,
  uploadWithErrorHandling("images", 20),
  updateGroupedListings
);

// Get all listings
router.get("/listings", authMiddleware, getListings);

// Get grouped listings
router.get("/listing/group", authMiddleware, getGroupedListings);

module.exports = router;
