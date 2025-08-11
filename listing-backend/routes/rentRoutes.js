const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllBookedListings,
  collectRent,
  getRentHistory,
  updateRentStatus,
  getMonthlyRentReport,
} = require("../controllers/rentController");

console.log("✅ rentRoutes.js loaded");

// Ensure rent screenshots directory exists
const rentScreenshotsDir = path.join(__dirname, "../uploads/rent-screenshots");
if (!fs.existsSync(rentScreenshotsDir)) {
  fs.mkdirSync(rentScreenshotsDir, { recursive: true });
}

// Multer Configuration for Rent Screenshots
const rentScreenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/rent-screenshots/");
  },
  filename: (req, file, cb) => {
    try {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = `rent-${req.body.listingId}-${unique}${ext}`;
      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  },
});

const rentScreenshotUpload = multer({
  storage: rentScreenshotStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for screenshots
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
const handleRentUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Rent Upload Multer Error:", err);

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          message: "Screenshot file too large. Maximum size is 5MB.",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          message:
            "Unexpected file field. Only 'paymentScreenshot' is allowed.",
        });
      default:
        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
    }
  } else if (err) {
    console.error("Rent Upload Error:", err);
    return res.status(400).json({
      message: err.message || "Screenshot upload failed",
    });
  }
  next();
};

// Wrapper function for rent screenshot upload
const uploadRentScreenshot = (req, res, next) => {
  const uploadMiddleware = rentScreenshotUpload.single("paymentScreenshot");

  uploadMiddleware(req, res, (err) => {
    if (err) {
      return handleRentUploadError(err, req, res, next);
    }
    next();
  });
};

/**
 * ===== RENT COLLECTION ROUTES =====
 */

// Get all booked listings for rent collection
router.get(
  "/booked-listings",
  authMiddleware,
  (req, res, next) => {
    console.log("📥 Getting booked listings for rent collection");
    console.log("User ID:", req.user?.id);
    console.log("Company ID:", req.user?.companyId);
    next();
  },
  getAllBookedListings
);

// Collect rent (main endpoint from the frontend modal)
router.post(
  "/collect",
  authMiddleware,
  uploadRentScreenshot,
  (req, res, next) => {
    console.log("💰 Processing rent collection...");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    console.log("User ID:", req.user?.id);
    next();
  },
  collectRent
);

// Get rent collection history for a specific listing
router.get(
  "/history/:listingId",
  authMiddleware,
  (req, res, next) => {
    console.log(`📋 Getting rent history for listing ${req.params.listingId}`);
    next();
  },
  getRentHistory
);

// Get all rent collections for the authenticated user
router.get(
  "/history",
  authMiddleware,
  (req, res, next) => {
    console.log("📋 Getting all rent history for user");
    console.log("User ID:", req.user?.id);
    next();
  },
  getRentHistory
);

// Update rent collection status (if needed for admin purposes)
router.put(
  "/update-status/:collectionId",
  authMiddleware,
  (req, res, next) => {
    console.log(
      `🔄 Updating rent collection status ${req.params.collectionId}`
    );
    console.log("New status:", req.body.status);
    next();
  },
  updateRentStatus
);

// Get monthly rent report
router.get(
  "/report/monthly",
  authMiddleware,
  (req, res, next) => {
    console.log("📊 Generating monthly rent report");
    console.log("Query params:", req.query);
    next();
  },
  getMonthlyRentReport
);

// Get rent collections by company (if needed)
router.get(
  "/company/:companyId",
  authMiddleware,
  (req, res, next) => {
    const { companyId } = req.params;
    const userCompanyId = req.user?.companyId;

    // Validate company access
    if (
      userCompanyId &&
      (userCompanyId.toString() === companyId || req.user?.role === "admin")
    ) {
      console.log(`📥 Getting rent collections for company ${companyId}`);
      next();
    } else {
      res.status(403).json({
        message:
          "Access denied: You don't have permission to access this company's rent data",
      });
    }
  },
  getAllBookedListings
);

/**
 * ===== DEBUG ROUTES (Remove in production) =====
 */

// Test rent collection endpoint
router.get("/debug/test", authMiddleware, (req, res) => {
  res.json({
    message: "Rent routes working",
    user: {
      id: req.user?.id,
      email: req.user?.email,
      companyId: req.user?.companyId,
    },
    timestamp: new Date(),
  });
});

// Test file upload
router.post(
  "/debug/upload-test",
  authMiddleware,
  uploadRentScreenshot,
  (req, res) => {
    res.json({
      message: "Upload test successful",
      file: req.file,
      body: req.body,
    });
  }
);

module.exports = router;
