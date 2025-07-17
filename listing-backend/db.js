const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then((client) => {
    return client
      .query("SELECT NOW()")
      .then((res) => {
        console.log("✅ PostgreSQL connected at:", res.rows[0].now);
        client.release();
      })
      .catch((err) => {
        client.release();
        console.error("❌ Error testing PostgreSQL connection:", err.stack);
      });
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err.stack);
  });

module.exports = pool;
