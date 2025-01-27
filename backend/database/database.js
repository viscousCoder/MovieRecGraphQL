const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "Aman2001",
  host: "localhost",
  port: 5432,
  database: "moviegrapghql",
});

async function getConnection() {
  try {
    // Get a client from the pool
    const client = await pool.connect();
    console.log("Connected to the database.");
    return client;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw new Error("Failed to connect to the database.");
  }
}

module.exports = { getConnection, pool };
