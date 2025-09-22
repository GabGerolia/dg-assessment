const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secretKeyExample";

//fetch login info
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  db.query(
    "SELECT * FROM user WHERE userName = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.json({ success: false, message: "Invalid username or password" });
      }

      const userRecord = results[0];

      // compare plain password with hashed one
      const isMatch = await bcrypt.compare(password, userRecord.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Invalid username or password" });
      }

      const user = {
        id: userRecord.id,
        username: userRecord.userName,
      };

      // Generate JWT
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    }
  );
};

// signup
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    // check if username already exists
    db.query("SELECT * FROM user WHERE userName = ?", [username], async (err, results) => {
      if (err) {
        console.error("Error checking username:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.json({ success: false, message: "Username already taken" });
      }

      // hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

      // insert new user
      db.query(
        "INSERT INTO user (userName, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Database error" });
          }
          res.json({ success: true, message: "User registered successfully!" });
        }
      );
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Get current logged in user
exports.me = (req, res) => {
  const { id, username } = req.user;
  res.json({ user: { id, username } });
};
