const pool = require("../db");
const fs = require("fs");
const path = require("path");

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

exports.updateListing = async (req, res) => {
  const listingId = req.params.id;
  const userId = req.userId;
  const { name, price } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM listings WHERE id = $1 AND user_id = $2",
      [listingId, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Listing not found or unauthorized" });
    }

    let imageFilenames = result.rows[0].images;

    if (req.files && req.files.length > 0) {
      imageFilenames.forEach((filename) => {
        const filePath = path.join(__dirname, "../uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      imageFilenames = req.files.map((file) => file.filename);
    }

    const updateResult = await pool.query(
      "UPDATE listings SET name = $1, price = $2, images = $3 WHERE id = $4 RETURNING *",
      [name, price, imageFilenames, listingId]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: "Error updating listing" });
  }
};
