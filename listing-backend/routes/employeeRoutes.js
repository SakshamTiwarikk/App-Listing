const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

console.log("✅ employeeRoutes.js loaded");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Configuration for employee files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    try {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname; // photo, aadhaarCard, panCard
      cb(null, `${prefix}-${unique}${ext}`);
    } catch (error) {
      cb(error);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    fieldSize: 5 * 1024 * 1024, // 5MB field size limit
    fields: 10, // Maximum number of non-file fields
    files: 10, // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    try {
      // Allow images for photo
      if (file.fieldname === "photo") {
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
              `Invalid photo file type: ${file.mimetype}. Only JPEG, JPG, PNG, WEBP, and GIF are allowed.`
            )
          );
        }
      }
      // Allow images and PDFs for documents
      else if (
        file.fieldname === "aadhaarCard" ||
        file.fieldname === "panCard"
      ) {
        const allowedTypes = /jpeg|jpg|png|webp|gif|pdf/;
        const isValidMimetype =
          allowedTypes.test(file.mimetype) ||
          file.mimetype === "application/pdf";
        const isValidExtension = allowedTypes.test(
          path.extname(file.originalname).toLowerCase()
        );

        if (isValidMimetype && isValidExtension) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid document file type: ${file.mimetype}. Only JPEG, JPG, PNG, WEBP, GIF, and PDF are allowed.`
            )
          );
        }
      } else {
        cb(new Error(`Unexpected field: ${file.fieldname}`));
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
          message: "File too large. Maximum size is 5MB per file.",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          message: "Too many files. Maximum is 10 files.",
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

// Wrapper function to handle upload errors for employee files
const uploadEmployeeFiles = () => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "aadhaarCard", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
    ]);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  };
};

/**
 * Employee Routes
 */

// Create employee
router.post("/", authMiddleware, uploadEmployeeFiles(), createEmployee);

// Get all employees for user's company
router.get("/", authMiddleware, getEmployees);

// Get single employee
router.get("/:id", authMiddleware, getEmployee);

// Update employee
router.put("/:id", authMiddleware, uploadEmployeeFiles(), updateEmployee);

// Delete employee
router.delete("/:id", authMiddleware, deleteEmployee);
// Public route to fetch only active employees (no auth required)
router.get("/public/active", async (req, res) => {
  const pool = require("../db");
  try {
    const result = await pool.query(
      "SELECT id, name FROM employees WHERE status = 'active'"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching active employees:", error);
    res.status(500).json({ message: "Failed to load active employees" });
  }
});


module.exports = router;
