const pool = require("../db");

// ✅ CREATE employee using `pool.query`
exports.createEmployee = async (req, res) => {
  try {
    const { name, dob, address, joining_date, status, email_id } = req.body;

    const photo = req.files?.photo?.[0]?.filename || "";
    const aadhaar_card = req.files?.aadhaar_card?.[0]?.filename || "";
    const pan_card = req.files?.pan_card?.[0]?.filename || "";

    const result = await pool.query(
      `INSERT INTO employees 
        (name, dob, address, joining_date, status, email_id, photo, aadhaar_card, pan_card)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        dob,
        address,
        joining_date,
        status,
        email_id,
        photo,
        aadhaar_card,
        pan_card,
      ]
    );

    res
      .status(201)
      .json({ message: "Employee created", employee: result.rows[0] });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// ✅ GET all employees with optional filters
exports.getEmployees = async (req, res) => {
  const { name, status } = req.query;

  let baseQuery = "SELECT * FROM employees WHERE 1=1";
  const values = [];

  if (name) {
    values.push(`%${name}%`);
    baseQuery += ` AND name ILIKE $${values.length}`;
  }

  if (status) {
    values.push(status);
    baseQuery += ` AND status = $${values.length}`;
  }

  try {
    const result = await pool.query(baseQuery, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

// ✅ GET ACTIVE employees only
exports.getActiveEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM employees WHERE status = 'active'"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching active employees",
      error: error.message,
    });
  }
};

// Other CRUD operations...
exports.getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM employees WHERE id = $1", [
      id,
    ]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employee", error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, dob, address, joining_date, status, email_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees
       SET name=$1, dob=$2, address=$3, joining_date=$4, status=$5, email_id=$6
       WHERE id=$7 RETURNING *`,
      [name, dob, address, joining_date, status, email_id, id]
    );

    res
      .status(200)
      .json({ message: "Employee updated", employee: result.rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating employee", error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM employees WHERE id=$1", [id]);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting employee", error: error.message });
  }
};
