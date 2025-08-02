const express = require("express");
const router = express.Router();
const pool = require("../db"); // Adjust path if needed
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create appointment
router.post("/", upload.single("customer_photo"), async (req, res) => {
  const {
    customer_name,
    mobile_number,
    property_requirement,
    assigned_employee_id,
  } = req.body;
  const customer_photo = req.file ? req.file.path : null;

  try {
    // Validate required fields
    if (!customer_name || !mobile_number || !property_requirement) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: customer_name, mobile_number, or property_requirement",
        });
    }

    // Validate assigned_employee_id if provided
    if (assigned_employee_id) {
      const employeeCheck = await pool.query(
        "SELECT id FROM employees WHERE id = $1",
        [parseInt(assigned_employee_id)]
      );
      if (employeeCheck.rowCount === 0) {
        return res.status(400).json({ error: "Invalid assigned_employee_id" });
      }
    }

    const result = await pool.query(
      `INSERT INTO appointments 
        (customer_name, mobile_number, property_requirement, customer_photo, assigned_employee_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        customer_name,
        mobile_number,
        property_requirement,
        customer_photo,
        assigned_employee_id ? parseInt(assigned_employee_id) : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Failed to create appointment",
      details: err.message || "Unknown error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    console.log("🔍 All request query params:", req.query);
    
    const searchName = req.query.searchName;
    console.log("🔍 Extracted searchName:", searchName);
    
    if (searchName) {
      // Direct query with the exact name
      const query = `
        SELECT a.*, e.name AS employee_name 
        FROM appointments a 
        LEFT JOIN employees e ON a.assigned_employee_id = e.id
        WHERE a.is_active = true 
        AND LOWER(a.customer_name) LIKE LOWER('%${searchName}%')
        ORDER BY a.created_at DESC
      `;
      
      console.log("🗃️ Executing query:", query);
      
      const result = await pool.query(query);
      console.log("📊 Results found:", result.rows.length);
      
      res.json({
        appointments: result.rows,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: result.rows.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    } else {
      // No search - return all
      const result = await pool.query(`
        SELECT a.*, e.name AS employee_name 
        FROM appointments a 
        LEFT JOIN employees e ON a.assigned_employee_id = e.id
        WHERE a.is_active = true 
        ORDER BY a.created_at DESC
      `);
      
      res.json({
        appointments: result.rows,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: result.rows.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }
    
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});




// Update appointment
router.put("/:id", upload.single("customer_photo"), async (req, res) => {
  const { id } = req.params;
  let {
    customer_name,
    mobile_number,
    property_requirement,
    assigned_employee_id,
  } = req.body;
  const customer_photo = req.file ? req.file.path : null;

  console.log("🛠️ PUT Request Body:", {
    id,
    customer_name,
    mobile_number,
    property_requirement,
    assigned_employee_id,
    customer_photo,
  });

  try {
    // Validate inputs
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ error: "Invalid or missing appointment ID" });
    }
    if (!customer_name || !mobile_number || !property_requirement) {
      return res.status(400).json({
        error:
          "Missing required fields: customer_name, mobile_number, or property_requirement",
      });
    }

    // Parse and validate assigned_employee_id
    assigned_employee_id = assigned_employee_id
      ? parseInt(assigned_employee_id)
      : null;
    if (assigned_employee_id && isNaN(assigned_employee_id)) {
      return res.status(400).json({ error: "Invalid assigned_employee_id" });
    }

    // Check if employee exists (if provided)
    if (assigned_employee_id) {
      const employeeCheck = await pool.query(
        "SELECT id FROM employees WHERE id = $1",
        [assigned_employee_id]
      );
      if (employeeCheck.rowCount === 0) {
        return res
          .status(400)
          .json({ error: "Assigned employee does not exist" });
      }
    }

    // Check if appointment exists
    const appointmentCheck = await pool.query(
      "SELECT id FROM appointments WHERE id = $1 AND is_active = true",
      [parseInt(id)]
    );
    if (appointmentCheck.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Appointment not found or inactive" });
    }

    // Execute update query
    const result = await pool.query(
      `UPDATE appointments SET 
         customer_name = $1,
         mobile_number = $2,
         property_requirement = $3,
         customer_photo = COALESCE($4, customer_photo),
         assigned_employee_id = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND is_active = true
       RETURNING *`,
      [
        customer_name,
        mobile_number,
        property_requirement,
        customer_photo,
        assigned_employee_id,
        parseInt(id),
      ]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Appointment not found or inactive" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Update error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      constraint: err.constraint,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Failed to update appointment",
      details: err.message || "Unknown error",
      code: err.code,
    });
  }
});

// Delete appointment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const result = await pool.query(
      "UPDATE appointments SET is_active = false WHERE id = $1 AND is_active = true RETURNING *",
      [parseInt(id)]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Appointment not found or already inactive" });
    }

    res.status(200).json({ message: "Appointment marked inactive" });
  } catch (err) {
    console.error("Delete (inactive) error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Failed to mark appointment inactive",
      details: err.message || "Unknown error",
    });
  }
});

module.exports = router;
