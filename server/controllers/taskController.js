const db = require("../config/db");
const { addLog } = require("../models/logModel");

// Get tasks for a column
exports.getTasks = (req, res) => {
  const { columnId } = req.params;
  db.query(
    "SELECT * FROM tasks WHERE column_id = ? ORDER BY position ASC",
    [columnId],
    (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({ success: false });
      }
      res.json(results);
    }
  );
};

// Create a new task
exports.createTasks = (req, res) => {
  const { columnId } = req.params;
  const { title, description, userId } = req.body;

  const projectSql = "SELECT project_id FROM columns WHERE id = ?";
  db.query(projectSql, [columnId], (projErr, projRows) => {
    if (projErr) {
      console.error("Error finding project_id:", projErr);
      return res.status(500).json({ success: false });
    }
    if (!projRows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const projectId = projRows[0].project_id;

    // Find next position in this column
    db.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS nextPos FROM tasks WHERE column_id = ?",
      [columnId],
      (err, result) => {
        if (err) return res.status(500).json({ success: false });

        const nextPos = result[0].nextPos;

        // Insert task
        db.query(
          "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), ?)",
          [columnId, title, description, nextPos],
          (err2, insertResult) => {
            if (err2) {
              console.error("Error creating task:", err2);
              return res.status(500).json({ success: false });
            }

            // Insert log if userId is available
            if (userId) {
              addLog(projectId, userId, `Created task "${title}"`);
            }

            // Respond with new task
            res.json({
              id: insertResult.insertId,
              column_id: parseInt(columnId, 10),
              title,
              description,
              created_at: new Date(),
              position: nextPos,
            });
          }
        );
      }
    );
  });
};

// Bulk update task positions in a column / update task positions after drag-and-drop:
exports.updatePositionAfterDnD = (req, res) => {
  const { columnId } = req.params;
  const { orderedTaskIds } = req.body;

  if (!Array.isArray(orderedTaskIds)) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  // Build multiple update queries
  const queries = orderedTaskIds.map((taskId, index) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE tasks SET position = ? WHERE id = ? AND column_id = ?",
        [index, taskId, columnId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(queries)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error("Error reordering tasks:", err);
      res.status(500).json({ success: false });
    });
};

// Update task
exports.updateTasks = (req, res) => {
  const { id } = req.params;
  const { title, description, column_id, position, userId } = req.body;

  const getOldSql = "SELECT title, description, column_id, position FROM tasks WHERE id = ?";
  db.query(getOldSql, [id], (getErr, oldRows) => {
    if (getErr) return res.status(500).json({ success: false });
    if (!oldRows.length) return res.status(404).json({ success: false });

    const oldTitle = oldRows[0].title;
    const oldDesc = oldRows[0].description || "";
    const oldPos = oldRows[0].position;

    db.query(
      "UPDATE tasks SET title = ?, description = ?, column_id = ?, position = ? WHERE id = ?",
      [title, description, column_id, position, id],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false });

        // fetch project_id for log
        const findSql = `
          SELECT c.project_id 
          FROM tasks t
          JOIN columns c ON t.column_id = c.id
          WHERE t.id = ?
        `;
        db.query(findSql, [id], (findErr, rows) => {
          if (findErr) return res.status(500).json({ success: false });
          if (!rows.length) return res.status(404).json({ success: false });

          const projectId = rows[0].project_id;

          if (userId) {
            const logMsg = `Updated task "${oldTitle}" → "${title}", description "${oldDesc}" → "${description}"`;
            addLog(projectId, userId, logMsg);
          }

          res.json({ success: true });
        });
      }
    );
  });
};

// Delete task
exports.deleteTasks = (req, res) => {
  const { id } = req.params;
  // Accept userId either in body (preferred for DELETE) or query fallback
  const userId = req.body?.userId ?? req.query?.userId;

  // Fetch project_id and title of the task
  const findSql = `
    SELECT c.project_id, t.title
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    WHERE t.id = ?
  `;
  db.query(findSql, [id], (err, rows) => {
    if (err) {
      console.error("Error looking up task/project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { project_id: projectId, title } = rows[0];

    // Now delete the task
    db.query("DELETE FROM tasks WHERE id = ?", [id], (delErr) => {
      if (delErr) {
        console.error("Error deleting task:", delErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      // Insert log (only if userId provided)
      if (userId) {
        addLog(projectId, userId, `Deleted task named "${title}"`);
      } else {
        console.warn("No userId supplied for task delete log, skipping insert.");
      }

      res.json({ success: true });
    });
  });
};
