const db = require("../config/db");

// Find user by username
exports.findByUsername = (username, callback) => {
  db.query("SELECT * FROM user WHERE userName = ?", [username], callback);
};

// Create a new user
exports.createUser = (username, hashedPassword, callback) => {
  db.query(
    "INSERT INTO user (userName, password) VALUES (?, ?)",
    [username, hashedPassword],
    callback
  );
};
