const pool = require("../db");
const fs = require("fs");

exports.createListing = async (req, res) => {
  const { name, price } = req.body;
  const userId = req.userId;

  const images = req.files.map((file) => file.filename);

  try {
    const result = await pool.query(
      "INSERT INTO listings (user_id, name, price, images) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, name, price, images]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error creating listing" });
  }
};

exports.getListings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM listings WHERE user_id = $1",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};
