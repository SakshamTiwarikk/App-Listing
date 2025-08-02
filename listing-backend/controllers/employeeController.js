const pool = require("../db");
const fs = require("fs");
const path = require("path");

// Helper function to safely delete files
const safeDeleteFile = (filename) => {
  try {
    if (!filename) return;
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filename}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
  }
};

// Get user's company_id from database
const getUserCompanyId = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT company_id FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0]?.company_id;
  } catch (error) {
    console.error("Error getting user company_id:", error);
    return null;
  }
};

exports.createEmployee = async (req, res) => {
  console.log("📤 Creating employee...");
  console.log("Request body:", req.body);
  console.log("Files received:", req.files ? Object.keys(req.files).length : 0);

  const {
    name,
    dob,
    address,
    joiningDate,
    status = "Active",
    emailId,
  } = req.body;

  const userId = req.user.id; // from authMiddleware
  const companyId = req.user.company_id; // from authMiddleware

  // Validation
  if (!name || !dob || !address || !joiningDate || !emailId) {
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => safeDeleteFile(file.filename));
        } else {
          safeDeleteFile(fileArray.filename);
        }
      });
    }
    return res.status(400).json({
      message: "Name, DOB, address, joining date, and email are required.",
    });
  }

  try {
    // Check if employee email already exists for this company
    const existingEmployee = await pool.query(
      "SELECT id FROM employees WHERE email_id = $1 AND company_id = $2",
      [emailId, companyId]
    );

    if (existingEmployee.rows.length > 0) {
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((file) => safeDeleteFile(file.filename));
          } else {
            safeDeleteFile(fileArray.filename);
          }
        });
      }
      return res.status(400).json({
        message: "Employee with this email already exists in your company.",
      });
    }

    // Process uploaded files
    const photo = req.files?.photo?.[0]?.filename || null;
    const aadhaarCard = req.files?.aadhaarCard?.[0]?.filename || null;
    const panCard = req.files?.panCard?.[0]?.filename || null;

    console.log("Processed files:", { photo, aadhaarCard, panCard });

    const result = await pool.query(
      `INSERT INTO employees 
       (name, dob, address, photo, aadhaar_card, pan_card, joining_date, status, email_id, company_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        name,
        dob,
        address,
        photo,
        aadhaarCard,
        panCard,
        joiningDate,
        status,
        emailId,
        companyId,
        userId,
      ]
    );

    console.log("✅ Employee created successfully:", result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating employee:", err);

    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => safeDeleteFile(file.filename));
        } else {
          safeDeleteFile(fileArray.filename);
        }
      });
    }

    return res.status(500).json({
      message: "Error creating employee",
      error: err.message,
    });
  }
};

// Get Employees for user's company
exports.getEmployees = async (req, res) => {
  console.log("📥 Fetching employees...");

  const companyId = req.user.company_id; // ✅ Directly from decoded token
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  if (!companyId) {
    return res.status(400).json({
      message: "User company not found. Please re-login or contact support.",
    });
  }

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM employees WHERE company_id = $1`,
      [companyId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM employees WHERE company_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    );

    console.log(`✅ Found ${result.rows.length} employees (page ${page})`);

    return res.json({
      employees: result.rows,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("❌ Error fetching employees:", err.message);
    res.status(500).json({
      message: "Error fetching employees",
      error: err.message,
    });
  }
};

// Get Single Employee
exports.getEmployee = async (req, res) => {
  console.log("📥 Fetching single employee...");

  const employeeId = req.params.id;
  const companyId = req.user.company_id;

  if (!companyId) {
    return res.status(400).json({
      message: "User company not found. Please re-login or contact support.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM employees WHERE id = $1 AND company_id = $2`,
      [employeeId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found or unauthorized",
      });
    }

    console.log("✅ Employee found");
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching employee:", err.message);
    res.status(500).json({
      message: "Error fetching employee",
      error: err.message,
    });
  }
};

// Update Employee
exports.updateEmployee = async (req, res) => {
  console.log("🔄 Updating employee...");

  const employeeId = req.params.id;
  const userId = req.user.id;
  const { name, dob, address, joiningDate, status, emailId } = req.body;

  console.log("Update data:", {
    employeeId,
    name,
    dob,
    address,
    joiningDate,
    status,
    emailId,
    filesCount: req.files ? Object.keys(req.files).length : 0,
  });

  try {
    // Get user's company_id
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json({
        message: "User company not found. Please contact administrator.",
      });
    }

    // Check if employee exists and belongs to user's company
    const result = await pool.query(
      `SELECT * FROM employees WHERE id = $1 AND company_id = $2`,
      [employeeId, companyId]
    );

    if (result.rows.length === 0) {
      // Clean up uploaded files if employee not found
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((file) => safeDeleteFile(file.filename));
          } else {
            safeDeleteFile(fileArray.filename);
          }
        });
      }
      return res.status(404).json({
        message: "Employee not found or unauthorized",
      });
    }

    const currentEmployee = result.rows[0];

    // Check if email is being changed and if it conflicts
    if (emailId !== currentEmployee.email_id) {
      const existingEmployee = await pool.query(
        "SELECT id FROM employees WHERE email_id = $1 AND company_id = $2 AND id != $3",
        [emailId, companyId, employeeId]
      );

      if (existingEmployee.rows.length > 0) {
        // Clean up uploaded files
        if (req.files) {
          Object.values(req.files).forEach((fileArray) => {
            if (Array.isArray(fileArray)) {
              fileArray.forEach((file) => safeDeleteFile(file.filename));
            } else {
              safeDeleteFile(fileArray.filename);
            }
          });
        }
        return res.status(400).json({
          message: "Employee with this email already exists in your company.",
        });
      }
    }

    // Handle file updates
    let photo = currentEmployee.photo;
    let aadhaarCard = currentEmployee.aadhaar_card;
    let panCard = currentEmployee.pan_card;

    if (req.files?.photo?.[0]) {
      if (photo) safeDeleteFile(photo);
      photo = req.files.photo[0].filename;
    }

    if (req.files?.aadhaarCard?.[0]) {
      if (aadhaarCard) safeDeleteFile(aadhaarCard);
      aadhaarCard = req.files.aadhaarCard[0].filename;
    }

    if (req.files?.panCard?.[0]) {
      if (panCard) safeDeleteFile(panCard);
      panCard = req.files.panCard[0].filename;
    }

    // Update employee
    const updateResult = await pool.query(
      `UPDATE employees SET name = $1, dob = $2, address = $3, photo = $4, aadhaar_card = $5, pan_card = $6, joining_date = $7, status = $8, email_id = $9, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $10 RETURNING *`,
      [
        name,
        dob,
        address,
        photo,
        aadhaarCard,
        panCard,
        joiningDate,
        status,
        emailId,
        employeeId,
      ]
    );

    console.log("✅ Employee updated successfully");
    return res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("❌ Error updating employee:", err);

    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => safeDeleteFile(file.filename));
        } else {
          safeDeleteFile(fileArray.filename);
        }
      });
    }

    return res.status(500).json({
      message: "Error updating employee",
      error: err.message,
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  console.log("🗑️ Deleting employee...");

  const employeeId = req.params.id;
  const userId = req.user.id;

  try {
    // Get user's company_id
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json({
        message: "User company not found. Please contact administrator.",
      });
    }

    // Check if employee exists and belongs to user's company
    const result = await pool.query(
      `SELECT * FROM employees WHERE id = $1 AND company_id = $2`,
      [employeeId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found or unauthorized",
      });
    }

    const employee = result.rows[0];

    // Delete associated files
    if (employee.photo) safeDeleteFile(employee.photo);
    if (employee.aadhaar_card) safeDeleteFile(employee.aadhaar_card);
    if (employee.pan_card) safeDeleteFile(employee.pan_card);

    // Delete employee from database
    await pool.query(`DELETE FROM employees WHERE id = $1`, [employeeId]);

    console.log("✅ Employee deleted successfully");
    return res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting employee:", err);
    return res.status(500).json({
      message: "Error deleting employee",
      error: err.message,
    });
  }
};

