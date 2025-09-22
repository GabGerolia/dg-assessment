const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware")


// Fetch logs for a specific project
exports.fetchLogs = (req, res) => {
  const { projectId } = req.params;
  const { sort = "desc" } = req.query; // optional sort param

  const sql = `
    SELECT logs.*, user.userName 
    FROM logs 
    JOIN user ON logs.user_id = user.id 
    WHERE logs.project_id = ? 
    ORDER BY logs.created_at ${sort.toUpperCase() === "ASC" ? "ASC" : "DESC"}
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching logs:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

// Create a new log entry
exports.createLogs = (req, res) => {
  const { project_id, user_id, description } = req.body;

  if (!project_id || !user_id || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = "INSERT INTO logs (project_id, user_id, description) VALUES (?, ?, ?)";
  db.query(sql, [project_id, user_id, description], (err, result) => {
    if (err) {
      console.error("Error inserting log:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ id: result.insertId, project_id, user_id, description });
  });
};
