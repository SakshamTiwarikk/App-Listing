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

// ✅ Added rent controller import
const {
  getBookedListingsByCompany,
  getAllBookedListings,
} = require("../controllers/rentController");

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
    fields: 100, // Maximum number of non-file fields
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

// ✅ NEW: Company validation middleware
const validateCompanyAccess = (req, res, next) => {
  const { companyId } = req.params;
  const userCompanyId = req.user?.companyId;

  console.log("Validating company access:");
  console.log("Requested companyId:", companyId);
  console.log("User's companyId:", userCompanyId);

  // Allow access if user belongs to the company or is admin
  if (
    userCompanyId &&
    (userCompanyId.toString() === companyId || req.user?.role === "admin")
  ) {
    next();
  } else {
    res.status(403).json({
      message:
        "Access denied: You don't have permission to access this company's data",
    });
  }
};

/**
 * ✅ UPDATED Routes with companyId support
 */

// ========== LISTING ROUTES ==========

// Create single listing (now includes companyId automatically from user token)
router.post(
  "/listing",
  authMiddleware,
  uploadWithErrorHandling("images", 5),
  (req, res, next) => {
    // ✅ Automatically set companyId from authenticated user
    req.body.companyId = req.user?.companyId;
    console.log("Setting companyId for new listing:", req.body.companyId);
    next();
  },
  createListing
);

// Create grouped listings
router.post(
  "/listing/group",
  authMiddleware,
  uploadWithErrorHandling("images", 20),
  (req, res, next) => {
    req.body.companyId = req.user?.companyId;
    next();
  },
  createGroupedListings
);

// Update single listing (handles both bookingStatus updates and regular updates)
router.put(
  "/listings/:id",
  authMiddleware,
  (req, res, next) => {
    // ✅ Log the update request for debugging
    console.log("🔄 Update listing request:");
    console.log("Listing ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);
    console.log("Company ID:", req.user?.companyId);
    next();
  },
  // Note: No file upload middleware here since we're mainly updating status/text fields
  // Add uploadWithErrorHandling("images", 5) if you need image updates
  updateListing
);

// Update grouped listings
router.put(
  "/listing/group/:groupId",
  authMiddleware,
  uploadWithErrorHandling("images", 20),
  updateGroupedListings
);

// Get all listings for authenticated user
router.get(
  "/listings",
  authMiddleware,
  (req, res, next) => {
    console.log("📥 Getting listings for user:", req.user?.id);
    console.log("User company:", req.user?.companyId);
    next();
  },
  getListings
);

// Get grouped listings
router.get("/listing/group", authMiddleware, getGroupedListings);

// ========== ✅ NEW: RENT COLLECTION ROUTES ==========
router.get("/rent/:companyId", authMiddleware, getBookedListingsByCompany);

// ✅ Alternative route that matches your frontend API call
// This handles the GET /api/listings call from RentCollection component
router.get("/listings/booked", authMiddleware, getAllBookedListings);

// ========== ✅ NEW: COMPANY-SPECIFIC ROUTES ==========

// Get all listings for a specific company
router.get(
  "/company/:companyId/listings",
  authMiddleware,
  validateCompanyAccess,
  (req, res, next) => {
    console.log("📥 Getting listings for company:", req.params.companyId);
    // Modify the request to filter by company
    req.query.companyId = req.params.companyId;
    next();
  },
  getListings
);

// Get only booked listings for a specific company
router.get(
  "/company/:companyId/booked",
  authMiddleware,
  validateCompanyAccess,
  getBookedListingsByCompany
);

// ========== DEBUG ROUTES (Remove in production) ==========

// ✅ Debug route to test authentication and company access
router.get("/debug/user", authMiddleware, (req, res) => {
  res.json({
    message: "User info from token",
    user: {
      id: req.user?.id,
      email: req.user?.email,
      companyId: req.user?.companyId,
      role: req.user?.role,
    },
  });
});

// ✅ Debug route to test listing access
router.get(
  "/debug/listings",
  authMiddleware,
  (req, res, next) => {
    console.log("🐛 Debug: Fetching listings");
    console.log("User from token:", req.user);
    next();
  },
  getListings
);

module.exports = router;
