const mysql = require("mysql2");

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,   // allow up to 10 connections
  queueLimit: 0          // unlimited queued requests
});

// Optional: log connection test
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL pool connection failed:", err);
  } else {
    console.log("MySQL pool connected.");
    connection.release(); // release back to pool
  }
});

module.exports = pool;
