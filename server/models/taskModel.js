const db = require("../config/db");

// Get all tasks in a column
exports.getTasksByColumn = (columnId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM tasks WHERE column_id = ? ORDER BY position ASC",
      [columnId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

// Get project_id from column
exports.getProjectIdByColumn = (columnId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT project_id FROM columns WHERE id = ?", [columnId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Get next position in column
exports.getNextPosition = (columnId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS nextPos FROM tasks WHERE column_id = ?",
      [columnId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].nextPos);
      }
    );
  });
};

// Insert a new task
exports.insertTask = (columnId, title, description, position) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), ?)",
      [columnId, title, description, position],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// Update positions for drag-and-drop
exports.updateTaskPosition = (taskId, columnId, position) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE tasks SET position = ? WHERE id = ? AND column_id = ?",
      [position, taskId, columnId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Get task by id
exports.getTaskById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT title, description, column_id, position FROM tasks WHERE id = ?", [id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Update task
exports.updateTask = (id, title, description, column_id, position) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE tasks SET title = ?, description = ?, column_id = ?, position = ? WHERE id = ?",
      [title, description, column_id, position, id],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Get project id by task
exports.getProjectByTaskId = (taskId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT c.project_id 
      FROM tasks t
      JOIN columns c ON t.column_id = c.id
      WHERE t.id = ?
    `;
    db.query(sql, [taskId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Find task with project info for delete
exports.getTaskWithProject = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT c.project_id, t.title
      FROM tasks t
      JOIN columns c ON t.column_id = c.id
      WHERE t.id = ?
    `;
    db.query(sql, [id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Delete task
exports.deleteTask = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
