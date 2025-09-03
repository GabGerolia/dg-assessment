const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();


// allow JSON in requests
app.use(express.json());

app.use(cors({ origin: ["http://localhost:5173"] }));

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


app.get("/api", (req, res) => {
  db.query("SELECT * FROM test", (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

app.post("/api", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  db.query("INSERT INTO test (name) VALUES (?)", [name], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json({ id: result.insertId, name });
    }
  });
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
