const pool = require("./db");

const runMigration = async () => {
  console.log("🔄 Starting database migration...");

  try {
    // 1. Update users table to add new fields
    console.log("📝 Updating users table...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS user_type INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS company_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Create trigger function for updating updated_at
    console.log("🔧 Creating trigger functions...");
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Add trigger to users table
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // 2. Update listings table to add timestamps
    console.log("📝 Updating listings table...");
    await pool.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Add trigger to listings table
    await pool.query(`
      DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
      CREATE TRIGGER update_listings_updated_at
          BEFORE UPDATE ON listings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // 3. Create employees table
    console.log("📝 Creating employees table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          dob DATE NOT NULL,
          address TEXT NOT NULL,
          photo VARCHAR(255),
          aadhaar_card VARCHAR(255),
          pan_card VARCHAR(255),
          joining_date DATE NOT NULL,
          status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
          email_id VARCHAR(255) NOT NULL,
          company_id VARCHAR(255) NOT NULL,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(email_id, company_id)
      );
    `);

    // Add trigger to employees table
    await pool.query(`
      DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
      CREATE TRIGGER update_employees_updated_at
          BEFORE UPDATE ON employees
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create indexes for better performance
    console.log("📊 Creating indexes...");
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
      CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
      CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
      CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
      CREATE INDEX IF NOT EXISTS idx_employees_email_company ON employees(email_id, company_id);
    `);

    // Update grouped_listings table if it exists
    console.log("📝 Updating grouped_listings table...");
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'grouped_listings'
      );
    `);

    if (tableExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE grouped_listings 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);

      await pool.query(`
        DROP TRIGGER IF EXISTS update_grouped_listings_updated_at ON grouped_listings;
        CREATE TRIGGER update_grouped_listings_updated_at
            BEFORE UPDATE ON grouped_listings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    console.log("✅ Database migration completed successfully!");

    console.log("📝 Updating appointments table...");
    await pool.query(`
  ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS company_id VARCHAR(255);
`);

    await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON appointments(company_id);
`);

    // Display summary
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const employeesCount = await pool.query("SELECT COUNT(*) FROM employees");
    const listingsCount = await pool.query("SELECT COUNT(*) FROM listings");

    console.log("\n📊 Database Summary:");
    console.log(`👥 Users: ${usersCount.rows[0].count}`);
    console.log(`👨‍💼 Employees: ${employeesCount.rows[0].count}`);
    console.log(`📋 Listings: ${listingsCount.rows[0].count}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log("🎉 Migration script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = { runMigration };
