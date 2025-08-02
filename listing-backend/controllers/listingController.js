const pool = require("../db");
const fs = require("fs");
const path = require("path");

// Helper function to safely delete files
const safeDeleteFile = (filename) => {
  try {
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filename}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
  }
};

// ✅ Create Listing with improved error handling
exports.createListing = async (req, res) => {
  console.log("📤 Creating listing...");
  console.log("Request body:", req.body);
  console.log("Files received:", req.files?.length || 0);

  const { name, price } = req.body;
  const userId = req.userId;

  // Validation
  if (!name || !price) {
    // Clean up uploaded files if validation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }
    return res.status(400).json({
      message: "Name and price are required.",
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "At least one image is required.",
    });
  }

  const images = req.files.map((file) => file.filename);
  console.log("Processed images:", images);

  try {
    const result = await pool.query(
      `INSERT INTO listings (user_id, name, price, images) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, parseFloat(price), images]
    );

    console.log("✅ Listing created successfully:", result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating listing:", err);

    // Clean up uploaded files on database error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }

    return res.status(500).json({
      message: "Error creating listing",
      error: err.message,
    });
  }
};

// ✅ Get User Listings with pagination support
exports.getListings = async (req, res) => {
  console.log("📥 Fetching listings...");

  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      `SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    console.log(`✅ Found ${result.rows.length} listings (page ${page})`);

    return res.json({
      listings: result.rows,
      total: total,
      page: page,
      limit: limit,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    res.status(500).json({
      message: "Error fetching listings",
      error: err.message,
    });
  }
};

// ✅ Update Listing with improved error handling
exports.updateListing = async (req, res) => {
  console.log("🔄 Updating listing...");

  const listingId = req.params.id;
  const userId = req.userId;
  const { name, price } = req.body;

  console.log("Update data:", {
    listingId,
    name,
    price,
    filesCount: req.files?.length || 0,
  });

  try {
    // Check if listing exists and belongs to user
    const result = await pool.query(
      `SELECT * FROM listings WHERE id = $1 AND user_id = $2`,
      [listingId, userId]
    );

    if (result.rows.length === 0) {
      // Clean up uploaded files if listing not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => safeDeleteFile(file.filename));
      }
      return res.status(404).json({
        message: "Listing not found or unauthorized",
      });
    }

    let currentImages = result.rows[0].images || [];

    // Handle image replacement
    if (req.files && req.files.length > 0) {
      console.log("Replacing images...");

      // Delete old images
      currentImages.forEach((filename) => {
        safeDeleteFile(filename);
      });

      // Use new images
      currentImages = req.files.map((file) => file.filename);
      console.log("New images:", currentImages);
    }

    // Update listing
    const updateResult = await pool.query(
      `UPDATE listings SET name = $1, price = $2, images = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
      [name, parseFloat(price), currentImages, listingId]
    );

    console.log("✅ Listing updated successfully");
    return res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("❌ Error updating listing:", err);

    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }

    return res.status(500).json({
      message: "Error updating listing",
      error: err.message,
    });
  }
};

// CREATE GROUPED LISTINGS with improved error handling
exports.createGroupedListings = async (req, res) => {
  console.log("📤 Creating grouped listing...");

  const userId = req.userId;
  const { name, price, description } = req.body;
  const images = req.files?.map((file) => file.filename) || [];

  console.log("Grouped listing data:", {
    name,
    price,
    description,
    imagesCount: images.length,
  });

  try {
    const result = await pool.query(
      "INSERT INTO grouped_listings (user_id, name, price, description, images) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, name, parseFloat(price), description, images]
    );

    console.log("✅ Grouped listing created successfully");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating grouped listing:", err);

    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }

    res.status(500).json({
      message: "Failed to create grouped listing",
      error: err.message,
    });
  }
};

// UPDATE GROUPED LISTINGS with improved error handling
exports.updateGroupedListings = async (req, res) => {
  console.log("🔄 Updating grouped listing...");

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
      // Clean up uploaded files if group not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => safeDeleteFile(file.filename));
      }
      return res.status(404).json({
        message: "Group not found or unauthorized",
      });
    }

    const oldImages = existing.rows[0].images || [];
    let newImages = oldImages;

    // Handle image replacement
    if (req.files && req.files.length > 0) {
      console.log("Replacing grouped listing images...");

      // Delete old images
      oldImages.forEach((filename) => {
        safeDeleteFile(filename);
      });

      newImages = req.files.map((file) => file.filename);
    }

    // Update the group listing
    const updated = await pool.query(
      "UPDATE grouped_listings SET name = $1, price = $2, description = $3, images = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [name, parseFloat(price), description, newImages, groupId]
    );

    console.log("✅ Grouped listing updated successfully");
    res.json(updated.rows[0]);
  } catch (err) {
    console.error("❌ Error updating grouped listing:", err);

    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }

    res.status(500).json({
      message: "Failed to update grouped listing",
      error: err.message,
    });
  }
};

// GET GROUPED LISTINGS
exports.getGroupedListings = async (req, res) => {
  console.log("📥 Fetching grouped listings...");

  const userId = req.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM grouped_listings WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    console.log(`✅ Found ${result.rows.length} grouped listings`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching grouped listings:", err);
    res.status(500).json({
      message: "Failed to fetch grouped listings",
      error: err.message,
    });
  }
};
