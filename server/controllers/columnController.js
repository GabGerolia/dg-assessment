const { addLog } = require("../models/logModel");
const Column = require("../models/columnModel");

// Load columns
exports.getColumns = (req, res) => {
  const { projectId } = req.params;
  Column.getColumnsByProjectId(projectId, (err, results) => {
    if (err) {
      console.error("Error fetching columns:", err);
      return res.status(500).json({ success: false });
    }
    res.json(results);
  });
};

// Create column
exports.createColumn = (req, res) => {
  const { projectId } = req.params;
  const { title, color, position, userId } = req.body;

  Column.createColumn(projectId, title, color, position, (err, result) => {
    if (err) {
      console.error("Error creating column:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (userId) {
      addLog(projectId, userId, `Created new column "${title}"`);
    }

    res.json({
      id: result.insertId,
      project_id: projectId,
      title,
      color,
      position
    });
  });
};

// Update position
exports.updatePosition = (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  Column.updateColumnPosition(id, position, (err) => {
    if (err) {
      console.error("Error updating column position:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
};

// Update column
exports.updateColumn = (req, res) => {
  const { id } = req.params;
  const { title, color, userId } = req.body;

  Column.getColumnById(id, (getErr, oldRows) => {
    if (getErr) {
      console.error("Error fetching old column:", getErr);
      return res.status(500).json({ success: false });
    }
    if (!oldRows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const { title: oldTitle, color: oldColor, project_id } = oldRows[0];

    Column.updateColumn(id, title, color, (updateErr) => {
      if (updateErr) {
        console.error("Error updating column:", updateErr);
        return res.status(500).json({ success: false });
      }

      if (userId) {
        const logMsg = `Updated column Title from "${oldTitle}" → "${title}" | (color: ${oldColor || "none"}) → (color: ${color || "none"})`;
        addLog(project_id, userId, logMsg);
      }

      res.json({ success: true });
    });
  });
};

// Delete column
exports.deleteColumn = (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  Column.getColumnById(id, (getErr, rows) => {
    if (getErr) {
      console.error("Error fetching column info:", getErr);
      return res.status(500).json({ success: false });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const { title, project_id } = rows[0];

    Column.deleteTasksByColumnId(id, (err) => {
      if (err) {
        console.error("Error deleting tasks in column:", err);
        return res.status(500).json({ success: false });
      }

      Column.deleteColumn(id, (err2) => {
        if (err2) {
          console.error("Error deleting column:", err2);
          return res.status(500).json({ success: false });
        }

        if (userId) {
          addLog(project_id, userId, `Deleted column "${title}"`);
        }

        res.json({ success: true });
      });
    });
  });
};
