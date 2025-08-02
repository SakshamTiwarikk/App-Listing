const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const generateCompanyId = () => {
  return `COMP_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const lowerEmail = email.toLowerCase();
  let userType = 3; // Default: regular user
  let companyId = null;

  console.log("Starting registration for email:", lowerEmail);

  try {
    // Check if user already exists
    console.log("Checking for existing user with email:", lowerEmail);
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [lowerEmail]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine user type and company_id
    console.log("Determining user type for:", lowerEmail);
    if (lowerEmail.startsWith("admin@")) {
      userType = 1;
      companyId = uuidv4();
      console.log("Admin detected, user_type:", userType, "company_id:", companyId);
    } else if (lowerEmail.startsWith("employee@")) {
      userType = 2;
      const domain = lowerEmail.split("@")[1];
      console.log("Employee detected, domain:", domain);

      const adminQuery = await pool.query(
        "SELECT company_id FROM users WHERE user_type = 1 AND LOWER(email) = $1",
        [`admin@${domain}`]
      );

      if (adminQuery.rows.length === 0) {
        return res.status(400).json({
          message: "No admin found for this company. Ask admin to register first.",
        });
      }

      companyId = adminQuery.rows[0].company_id; // Use existing company_id
      console.log("Employee assigned company_id:", companyId);
    } else {
      console.log("No special prefix, using default user_type:", userType);
    }

    // Hash the password
    console.log("Hashing password for:", lowerEmail);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    console.log("Inserting user with:", {
      name,
      email: lowerEmail,
      userType,
      companyId,
    });
    const insertResult = await pool.query(
      `INSERT INTO users 
        (name, email, password, user_type, company_id, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, name, email, user_type, company_id, is_active, created_at`,
      [name, lowerEmail, hashedPassword, userType, companyId, true]
    );

    console.log("Registration successful, user:", insertResult.rows[0]);
    res.status(201).json({
      message: "User registered successfully",
      user: insertResult.rows[0],
    });
  } catch (err) {
    console.error("Register error details:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Use case-insensitive email lookup
    const userResult = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user account is active
    if (!user.is_active) {
      return res.status(400).json({
        message: "Account is deactivated. Please contact your administrator.",
      });
    }

    // Block employee login if not assigned to a company
    if (!user.company_id && user.user_type === 2) {
      return res.status(400).json({
        message: "Account not activated. Please contact your administrator.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        companyId: user.company_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
        companyId: user.company_id,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignCompany = async (req, res) => {
  const { userId, companyId } = req.body;
  const adminId = req.userId;

  if (!userId || !companyId) {
    return res
      .status(400)
      .json({ message: "User ID and Company ID are required" });
  }

  try {
    const adminResult = await pool.query(
      "SELECT user_type, company_id FROM users WHERE id = $1",
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = adminResult.rows[0];
    if (admin.user_type !== 1 || admin.company_id !== companyId) {
      return res.status(403).json({
        message: "Unauthorized. Only company admins can assign users.",
      });
    }

    const result = await pool.query(
      "UPDATE users SET company_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, user_type, company_id",
      [companyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User assigned to company successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Assign company error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCompanyUsers = async (req, res) => {
  const adminId = req.userId;

  try {
    const adminResult = await pool.query(
      "SELECT user_type, company_id FROM users WHERE id = $1",
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const admin = adminResult.rows[0];
    if (admin.user_type !== 1) {
      return res
        .status(403)
        .json({ message: "Unauthorized. Only admins can view company users." });
    }

    if (!admin.company_id) {
      return res.status(400).json({ message: "Admin company not found." });
    }

    const result = await pool.query(
      "SELECT id, name, email, user_type, company_id, is_active, created_at, updated_at FROM users WHERE company_id = $1 ORDER BY created_at DESC",
      [admin.company_id]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("Get company users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [email.toLowerCase()]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    console.log(`Mock password reset link sent to ${email}`);
    res.json({ message: `Reset link sent to ${email} (demo)` });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
