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


//fetch login info
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  } else if(!password){
    return res.status(400).json({ error: "Password is required"});
  }

  db.query(
    "SELECT * FROM test WHERE userName = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        // username exists
        res.json({ success: true, message: "Username found" });
      } else {
        // username not found
        res.json({ success: false, message: "Invalid username" });
      }
    }
  );
});

// signup
app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // check if username already exists
  db.query("SELECT * FROM test WHERE userName = ?", [username], (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      // username already exists
      return res.json({ success: false, message: "Username already taken" });
    }

    // insert new user
    db.query(
      "INSERT INTO test (userName, password) VALUES (?, ?)",
      [username, password],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "User registered successfully!" });
      }
    );
  });
});



app.listen(8080, () => {
  console.log("Server started on port 8080");
});

// // fetch all data to 8080/api
// app.get("/api", (req, res) => {
//   db.query("SELECT * FROM test", (err, results) => {
//     if (err) {
//       console.error("Error fetching data:", err);
//       res.status(500).json({ error: "Database error" });
//     } else {
//       res.json(results);
//     }
//   });
// });

// // test insert
// app.post("/api", (req, res) => {
//   const { name } = req.body;
//   if (!name) {
//     return res.status(400).json({ error: "Name is required" });
//   }

//   db.query("INSERT INTO test (name) VALUES (?)", [name], (err, result) => {
//     if (err) {
//       console.error("Error inserting data:", err);
//       res.status(500).json({ error: "Database error" });
//     } else {
//       res.json({ id: result.insertId, name });
//     }
//   });
// });


