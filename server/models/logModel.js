const db = require("../config/db");

// Fetch logs for a project
function getLogsByProject(projectId, sort = "DESC") {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT logs.*, user.userName 
      FROM logs 
      JOIN user ON logs.user_id = user.id 
      WHERE logs.project_id = ? 
      ORDER BY logs.created_at ${sort.toUpperCase() === "ASC" ? "ASC" : "DESC"}
    `;
    db.query(sql, [projectId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Insert log (explicitly from controller)
function createLog(projectId, userId, description) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO logs (project_id, user_id, description) VALUES (?, ?, ?)";
    db.query(sql, [projectId, userId, description], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Helper for background logging (non-blocking)
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

module.exports = { getLogsByProject, createLog, addLog };
