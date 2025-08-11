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

// ✅ FIXED Create Listing - Added missing booking_status and company_id
exports.createListing = async (req, res) => {
  console.log("📤 Creating listing...");
  console.log("Request body:", req.body);

  const {
    name,
    price,
    description,
    city,
    property_type,
    bhk,
    facing,
    size,
    floors,
    total_floors,
    location,
    street_landmark,
    map_link,
    rent_or_lease,
    deposit,
    maintenance,
    available_from,
    furnishing,
    parking,
    preferred_tenants,
    non_veg_allowed,
    shown_by,
    booking_date,
    agreement_duration,
    bookingStatus = "available",
    bookedBy = null,
  } = req.body;

  const userId = req.user?.id;
  const companyId = req.user?.companyId || req.body.companyId || null;

  console.log("👤 User ID:", userId);
  console.log("🏢 Company ID:", companyId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Missing user ID" });
  }

  // Enhanced validation
  const errors = [];
  if (!name || name.trim() === "") errors.push("Name is required.");
  if (!price || isNaN(parseFloat(price)))
    errors.push("Price is required and must be a valid number.");
  if (!req.files || req.files.length === 0)
    errors.push("At least one image is required.");

  if (errors.length > 0) {
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }
    return res.status(400).json({ message: errors.join(" ") });
  }

  const images = req.files.map((file) => file.filename);

  try {
    const parsedPrice = parseFloat(price);
    const result = await pool.query(
      `INSERT INTO listings (
        user_id, company_id, name, price, images, description, city, property_type, bhk, facing,
        size, floors, total_floors, location, street_landmark, map_link, rent_or_lease,
        deposit, maintenance, available_from, furnishing, parking, preferred_tenants,
        non_veg_allowed, shown_by, booking_date, agreement_duration, booking_status, booked_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29) RETURNING *`,
      [
        userId,
        companyId,
        name.trim(),
        parsedPrice,
        images,
        description || null,
        city || null,
        property_type || null,
        bhk || null,
        facing || null,
        size || null,
        floors || null,
        total_floors || null,
        location || null,
        street_landmark || null,
        map_link || null,
        rent_or_lease || null,
        deposit || null,
        maintenance || null,
        available_from || null,
        furnishing || null,
        parking || null,
        preferred_tenants || null,
        non_veg_allowed === "true" ? true : false || null,
        shown_by || null,
        booking_date || null,
        agreement_duration || null,
        bookingStatus,
        bookedBy || null,
      ]
    );

    console.log("✅ Listing created successfully:", result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating listing:", err);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }
    return res.status(500).json({
      message: "Error creating listing",
      error: err.message,
    });
  }
};

// ✅ FIXED Get Listings - Added booking_status in SELECT with proper field mapping
// In your getListings function, ensure rent_status is included
exports.getListings = async (req, res) => {
  console.log("📥 Fetching listings...");

  const userId = req.user?.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // ✅ CRITICAL: Include rent_status in SELECT
    const result = await pool.query(
      `SELECT 
        id, name, price, images, description, city, property_type, bhk,
        booking_status as "bookingStatus", 
        COALESCE(rent_status, 'pending') as "rentStatus",  -- ✅ Include rent status with default
        booked_by as "bookedBy", 
        company_id as "companyId",
        created_at, updated_at as "updatedAt"
       FROM listings 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    console.log(`✅ Found ${result.rows.length} listings`);

    // Debug: Log rent statuses
    result.rows.forEach((listing) => {
      console.log(
        `Listing ${listing.id}: bookingStatus="${listing.bookingStatus}", rentStatus="${listing.rentStatus}"`
      );
    });

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

// ✅ CRITICAL FIX: Updated Update Listing to handle both camelCase and snake_case
// ✅ Enhanced updateListing with detailed error logging
exports.updateListing = async (req, res) => {
  console.log("🔄 Starting listing update...");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  console.log("User from auth:", req.user);
  console.log("Content-Type:", req.get("Content-Type"));

  const { id } = req.params;

  try {
    // ✅ Check if listing exists first
    const existingListing = await pool.query(
      "SELECT * FROM listings WHERE id = $1",
      [id]
    );

    if (existingListing.rows.length === 0) {
      console.log("❌ Listing not found with ID:", id);
      return res.status(404).json({
        message: "Listing not found",
        listingId: id,
      });
    }

    console.log("✅ Found existing listing:", existingListing.rows[0]);

    // ✅ Extract and validate data
    const {
      name,
      price,
      description,
      city,
      property_type,
      bhk,
      facing,
      size,
      floors,
      total_floors,
      location,
      street_landmark,
      map_link,
      rent_or_lease,
      deposit,
      maintenance,
      available_from,
      furnishing,
      parking,
      preferred_tenants,
      non_veg_allowed,
      shown_by,
      booking_date,
      agreement_duration,
      bookingStatus,
      booking_status,
      bookedBy,
      booked_by,
    } = req.body;

    // Handle both camelCase and snake_case
    const finalBookingStatus = bookingStatus || booking_status;
    const finalBookedBy = bookedBy || booked_by;

    console.log("📝 Processing update with data:");
    console.log("- Name:", name);
    console.log("- Price:", price);
    console.log("- Booking Status:", finalBookingStatus);
    console.log("- Booked By:", finalBookedBy);

    // ✅ Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;

    if (name !== undefined && name !== null) {
      updateFields.push(`name = $${paramCounter}`);
      updateValues.push(name);
      paramCounter++;
    }
    if (price !== undefined && price !== null) {
      updateFields.push(`price = $${paramCounter}`);
      updateValues.push(parseFloat(price));
      paramCounter++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter}`);
      updateValues.push(description);
      paramCounter++;
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramCounter}`);
      updateValues.push(city);
      paramCounter++;
    }
    if (property_type !== undefined) {
      updateFields.push(`property_type = $${paramCounter}`);
      updateValues.push(property_type);
      paramCounter++;
    }
    if (bhk !== undefined) {
      updateFields.push(`bhk = $${paramCounter}`);
      updateValues.push(bhk);
      paramCounter++;
    }
    if (finalBookingStatus !== undefined && finalBookingStatus !== null) {
      updateFields.push(`booking_status = $${paramCounter}`);
      updateValues.push(finalBookingStatus);
      paramCounter++;
    }
    if (finalBookedBy !== undefined) {
      updateFields.push(`booked_by = $${paramCounter}`);
      updateValues.push(finalBookedBy || null);
      paramCounter++;
    }

    // Always update timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 1) {
      // Only timestamp
      console.log("⚠️ No fields to update");
      return res.status(400).json({
        message: "No fields provided for update",
      });
    }

    // Add ID parameter
    updateValues.push(id);
    const whereClause = `$${paramCounter}`;

    const updateQuery = `
      UPDATE listings 
      SET ${updateFields.join(", ")}
      WHERE id = ${whereClause} 
      RETURNING 
        id, name, price, description, city, property_type, bhk,
        booking_status as "bookingStatus", 
        booked_by as "bookedBy", 
        company_id as "companyId",
        updated_at as "updatedAt"
    `;

    console.log("🔍 Final update query:", updateQuery);
    console.log("🔍 Update values:", updateValues);

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      console.log("❌ No rows updated");
      return res
        .status(404)
        .json({ message: "Listing not found or no changes made" });
    }

    console.log("✅ Listing updated successfully:", result.rows[0]);
    res.status(200).json({
      message: "Listing updated successfully",
      listing: result.rows[0],
    });
  } catch (error) {
    console.error("❌ DETAILED UPDATE ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error detail:", error.detail);
    console.error("Error stack:", error.stack);
    console.error("PostgreSQL error info:", {
      severity: error.severity,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      internalPosition: error.internalPosition,
      internalQuery: error.internalQuery,
      where: error.where,
      schema: error.schema,
      table: error.table,
      column: error.column,
      dataType: error.dataType,
      constraint: error.constraint,
    });

    res.status(500).json({
      message: "Failed to update listing",
      error: error.message,
      errorCode: error.code,
      errorDetail: error.detail || "No additional details available",
    });
  }
};

// Keep your other existing functions (createGroupedListings, updateGroupedListings, getGroupedListings)
exports.createGroupedListings = async (req, res) => {
  console.log("📤 Creating grouped listing...");
  const userId = req.user?.id;
  const { name, price, description } = req.body;
  const images = req.files?.map((file) => file.filename) || [];

  try {
    const result = await pool.query(
      "INSERT INTO grouped_listings (user_id, name, price, description, images) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, name, parseFloat(price), description, images]
    );
    console.log("✅ Grouped listing created successfully");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating grouped listing:", err);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }
    res.status(500).json({
      message: "Failed to create grouped listing",
      error: err.message,
    });
  }
};

exports.updateGroupedListings = async (req, res) => {
  console.log("🔄 Updating grouped listing...");
  const groupId = req.params.groupId;
  const userId = req.user?.id;
  const { name, price, description } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM grouped_listings WHERE id = $1 AND user_id = $2",
      [groupId, userId]
    );

    if (existing.rows.length === 0) {
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => safeDeleteFile(file.filename));
      }
      return res
        .status(404)
        .json({ message: "Group not found or unauthorized" });
    }

    const oldImages = existing.rows[0].images || [];
    let newImages = oldImages;

    if (req.files && req.files.length > 0) {
      oldImages.forEach((filename) => safeDeleteFile(filename));
      newImages = req.files.map((file) => file.filename);
    }

    const updated = await pool.query(
      "UPDATE grouped_listings SET name = $1, price = $2, description = $3, images = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [name, parseFloat(price), description, newImages, groupId]
    );

    console.log("✅ Grouped listing updated successfully");
    res.json(updated.rows[0]);
  } catch (err) {
    console.error("❌ Error updating grouped listing:", err);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => safeDeleteFile(file.filename));
    }
    res.status(500).json({
      message: "Failed to update grouped listing",
      error: err.message,
    });
  }
};

exports.getGroupedListings = async (req, res) => {
  console.log("📥 Fetching grouped listings...");
  const userId = req.user?.id;

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
