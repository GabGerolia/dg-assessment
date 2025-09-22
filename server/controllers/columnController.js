const db = require("../config/db");
const { addLog } = require("../models/logModel");

//load columns
exports.getColumns = (req, res) => {
  const { projectId } = req.params;
  db.query(
    "SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC",
    [projectId],
    (err, results) => {
      if (err) {
        console.error("Error fetching columns:", err);
        return res.status(500).json({ success: false });
      }
      res.json(results);
    }
  );
};


// Create a new column for a project
exports.createColumn = (req, res) => {
  const { projectId } = req.params;
  const { title, color, position, userId } = req.body; // <-- include userId from frontend

  db.query(
    "INSERT INTO columns (project_id, title, color, position) VALUES (?, ?, ?, ?)",
    [projectId, title, color || null, position || 0],
    (err, result) => {
      if (err) {
        console.error("Error creating column:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Insert log (only if userId provided)
      if (userId) {
        addLog(projectId, userId, `Created new column "${title}"`);
      } else {
        console.warn("No userId provided for column create log, skipping insert.");
      }

      res.json({
        id: result.insertId,
        project_id: projectId,
        title,
        color,
        position
      });
    }
  );
};

// PUT /columns/:id/position
exports.updatePosition = (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  db.query(
    "UPDATE columns SET position = ? WHERE id = ?",
    [position, id],
    (err) => {
      if (err) {
        console.error("Error updating column position:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
};

// Update column
exports.updateColumn = (req, res) => {
  const { id } = req.params;
  const { title, color, userId } = req.body; // include userId from frontend

  // Fetch old column values
  const getOldSql = "SELECT title, color, project_id FROM columns WHERE id = ?";
  db.query(getOldSql, [id], (getErr, oldRows) => {
    if (getErr) {
      console.error("Error fetching old column:", getErr);
      return res.status(500).json({ success: false });
    }
    if (!oldRows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const oldTitle = oldRows[0].title;
    const oldColor = oldRows[0].color;
    const projectId = oldRows[0].project_id;

    // Perform update
    db.query(
      "UPDATE columns SET title = ?, color = ? WHERE id = ?",
      [title, color, id],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating column:", updateErr);
          return res.status(500).json({ success: false });
        }

        // Insert log if userId provided
        if (userId) {
          const logMsg = `Updated column Title from "${oldTitle}" → "${title}" | (color: ${oldColor || "none"}) → (color: ${color || "none"})`;
          addLog(projectId, userId, logMsg);
        } else {
          console.warn("No userId provided for column update log, skipping insert.");
        }

        res.json({ success: true });
      }
    );
  });
};

// Delete column and its tasks
exports.deleteColumn = (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  // Fetch column info first
  const getSql = "SELECT title, project_id FROM columns WHERE id = ?";
  db.query(getSql, [id], (getErr, rows) => {
    if (getErr) {
      console.error("Error fetching column info:", getErr);
      return res.status(500).json({ success: false });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const { title, project_id } = rows[0];

    // Delete tasks inside the column first
    db.query("DELETE FROM tasks WHERE column_id = ?", [id], (err) => {
      if (err) {
        console.error("Error deleting tasks in column:", err);
        return res.status(500).json({ success: false });
      }

      // Delete the column itself
      db.query("DELETE FROM columns WHERE id = ?", [id], (err2) => {
        if (err2) {
          console.error("Error deleting column:", err2);
          return res.status(500).json({ success: false });
        }

        // Insert log (only if userId available)
        if (userId) {
          const logMsg = `Deleted column "${title}"`;
          addLog(project_id, userId, logMsg);
        } else {
          console.warn("No userId provided for column delete log, skipping insert.");
        }

        res.json({ success: true });
      });
    });
  });
};