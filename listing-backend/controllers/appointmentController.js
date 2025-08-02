const pool = require("../db");

// CREATE
exports.createAppointment = async (req, res) => {
  try {
    const {
      customer_name,
      mobile_number,
      property_requirement,
      assigned_employee_id,
    } = req.body;

    const customer_photo = req.file ? req.file.filename : null;
    const company_id = req.user.company_id;

    const employeeId =
      assigned_employee_id && assigned_employee_id.trim() !== ""
        ? parseInt(assigned_employee_id)
        : null;

    const result = await pool.query(
      `INSERT INTO appointments (
        customer_name, mobile_number, property_requirement, customer_photo, assigned_employee_id, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        customer_name,
        mobile_number,
        property_requirement,
        customer_photo,
        employeeId,
        company_id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creating appointment:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// READ (with optional filters and pagination if needed)
exports.getAppointments = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { searchName, searchMobile } = req.query;

    console.log("🔍 Query Params:", { searchName, searchMobile });

    let query = `
      SELECT a.*, e.name AS employee_name 
      FROM appointments a 
      LEFT JOIN employees e ON a.assigned_employee_id = e.id 
      WHERE a.company_id = $1
    `;
    const params = [company_id];
    let idx = 2;

    if (searchName && searchName.trim() !== "") {
      query += ` AND LOWER(a.customer_name) LIKE LOWER($${idx})`;
      params.push(`%${searchName.trim()}%`);
      idx++;
    }

    if (searchMobile && searchMobile.trim() !== "") {
      query += ` AND CAST(a.mobile_number AS TEXT) LIKE $${idx}`;
      params.push(`%${searchMobile.trim()}%`);
      idx++;
    }

    query += " ORDER BY a.created_at DESC";

    console.log("🛠 Final SQL:", query);
    console.log("📦 Params:", params);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(
      "❌ Error fetching appointments:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      mobile_number,
      property_requirement,
      assigned_employee_id,
    } = req.body;

    const employeeId =
      assigned_employee_id && assigned_employee_id.trim() !== ""
        ? parseInt(assigned_employee_id)
        : null;

    const customer_photo = req.file ? req.file.filename : null;

    const result = await pool.query(
      `UPDATE appointments SET
        customer_name = $1,
        mobile_number = $2,
        property_requirement = $3,
        customer_photo = COALESCE($4, customer_photo),
        assigned_employee_id = $5,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        customer_name,
        mobile_number,
        property_requirement,
        customer_photo,
        employeeId,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error updating appointment:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM appointments WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error deleting appointment:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};
