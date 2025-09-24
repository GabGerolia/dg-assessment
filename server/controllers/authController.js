const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "secretKeyExample";

// Login
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  User.findByUsername(username, async (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: "Invalid username or password" });
    }

    const userRecord = results[0];
    const isMatch = await bcrypt.compare(password, userRecord.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid username or password" });
    }

    const user = { id: userRecord.id, username: userRecord.userName };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  });
};

// Signup
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  User.findByUsername(username, async (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    User.createUser(username, hashedPassword, (err) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, message: "User registered successfully!" });
    });
  });
};

// Current user
exports.me = (req, res) => {
  const { id, username } = req.user;
  res.json({ user: { id, username } });
};
