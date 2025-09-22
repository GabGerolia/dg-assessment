const db = require("../config/db");

// helper to insert log entries (non-blocking)
function addLog(projectId, userId, description) {
  if (!projectId || !userId || !description) {
    console.warn("addLog missing fields:", { projectId, userId, description });
    return;
  }
  const sql = "INSERT INTO logs (project_id, user_id, description) VALUES (?, ?, ?)";
  db.query(sql, [projectId, userId, description], (err) => {
    if (err) console.error("Error inserting log:", err);
  });
}

module.exports = { addLog };