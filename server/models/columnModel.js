const db = require("../config/db");

// Get all columns for a project
exports.getColumnsByProjectId = (projectId, callback) => {
  db.query(
    "SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC",
    [projectId],
    callback
  );
};

// Create new column
exports.createColumn = (projectId, title, color, position, callback) => {
  db.query(
    "INSERT INTO columns (project_id, title, color, position) VALUES (?, ?, ?, ?)",
    [projectId, title, color || null, position || 0],
    callback
  );
};

// Update column position
exports.updateColumnPosition = (id, position, callback) => {
  db.query("UPDATE columns SET position = ? WHERE id = ?", [position, id], callback);
};

// Fetch column details
exports.getColumnById = (id, callback) => {
  db.query("SELECT * FROM columns WHERE id = ?", [id], callback);
};

// Update column details
exports.updateColumn = (id, title, color, callback) => {
  db.query("UPDATE columns SET title = ?, color = ? WHERE id = ?", [title, color, id], callback);
};

// Delete all tasks in a column
exports.deleteTasksByColumnId = (columnId, callback) => {
  db.query("DELETE FROM tasks WHERE column_id = ?", [columnId], callback);
};

// Delete column
exports.deleteColumn = (id, callback) => {
  db.query("DELETE FROM columns WHERE id = ?", [id], callback);
};
