const mysql = require("mysql");

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "050503",
  database: "myDB"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

module.exports = db;