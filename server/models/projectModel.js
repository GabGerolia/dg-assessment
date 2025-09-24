const db = require("../config/db");

// Create new project
exports.createProject = (userId, title, description, callback) => {
  const sql = "INSERT INTO projects (user_id, title, description, created_at) VALUES (?, ?, ?, NOW())";
  db.query(sql, [userId, title, description], callback);
};

// Insert preset columns
exports.insertColumns = (projectId, presetColumns, callback) => {
  const sql = "INSERT INTO columns (project_id, title, color, position) VALUES ?";
  const values = presetColumns.map(c => [projectId, c.title, c.color, c.position]);
  db.query(sql, [values], callback);
};

// Insert default task
exports.insertDefaultTask = (columnId, callback) => {
  const sql = "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), 0)";
  db.query(sql, [columnId, "Sample Title", "Sample Description"], callback);
};

// Get projects by user at home
exports.getProjectsByUserId = (userId, callback) => {
  db.query("SELECT * FROM projects WHERE user_id = ?", [userId], callback);
};

//get project (by id) details after clicking on project
exports.getProjectById = (id, callback) => {
  db.query("SELECT * FROM projects WHERE id = ?", [id], callback);
};

// Update project
exports.updateProject = (id, title, description, callback) => {
  const sql = "UPDATE projects SET title = ?, description = ? WHERE id = ?";
  db.query(sql, [title, description, id], callback);
};

// Get old project values (before update)
exports.getOldProjectValues = (id, callback) => {
  db.query("SELECT title, description FROM projects WHERE id = ?", [id], callback);
};

// Delete project
exports.deleteProject = (id, callback) => {
  db.query("DELETE FROM projects WHERE id = ?", [id], callback);
};
