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
// CREATE GROUPED LISTINGS
exports.createGroupedListings = async (req, res) => {
  const userId = req.userId;
  const { name, price, description } = req.body;

  const images = req.files?.map((file) => file.filename) || [];

  try {
    const result = await pool.query(
      "INSERT INTO grouped_listings (user_id, name, price, description, images) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, name, price, description, images]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating grouped listing:", err);
    res.status(500).json({ message: "Failed to create grouped listing" });
  }
};

// UPDATE GROUPED LISTINGS
exports.updateGroupedListings = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.userId;
  const { name, price, description } = req.body;

  try {
    // Check if the group exists and belongs to the user
    const existing = await pool.query(
      "SELECT * FROM grouped_listings WHERE id = $1 AND user_id = $2",
      [groupId, userId]
    );

    if (existing.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Group not found or unauthorized" });
    }

    // Delete old images from filesystem
    // Inside updateGroupedListings

    const oldImages = existing.rows[0].images || [];

    if (req.files && req.files.length > 0 && oldImages.length > 0) {
      oldImages.forEach((filename) => {
        const filePath = path.join(__dirname, "../uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    const newImages = req.files?.map((file) => file.filename) || oldImages;

    // Update the group listing
    const updated = await pool.query(
      "UPDATE grouped_listings SET name = $1, price = $2, description = $3, images = $4 WHERE id = $5 RETURNING *",
      [name, price, description, newImages, groupId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("Error updating grouped listing:", err);
    res.status(500).json({ message: "Failed to update grouped listing" });
  }
};
// GET GROUPED LISTINGS
exports.getGroupedListings = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM grouped_listings WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching grouped listings:", err);
    res.status(500).json({ message: "Failed to fetch grouped listings" });
  }
};
