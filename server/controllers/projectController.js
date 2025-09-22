const db = require("../config/db");
const { addLog } = require("../models/logModel");

// Create project
exports.createProject = (req, res) => {
  const { userId, title, description } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql = "INSERT INTO projects (user_id, title, description, created_at) VALUES (?, ?, ?, NOW())";
  db.query(sql, [userId, title, description], (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    const projectId = result.insertId;

    // Insert preset columns 
    //change colors here if main colors was change
    const presetColumns = [
      { title: "Todo", color: "hsl(350, 63%, 40%)", position: 0 },
      { title: "In Progress", color: "hsl(25 45% 40%)", position: 1 },
      { title: "Done", color: "hsl(140 35% 40%)", position: 2 },
    ];

    const columnSql = "INSERT INTO columns (project_id, title, color, position) VALUES ?";
    const columnValues = presetColumns.map(c => [projectId, c.title, c.color, c.position]);

    db.query(columnSql, [columnValues], (colErr, colResult) => {
      if (colErr) {
        console.error("Error inserting columns:", colErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      const todoColumnId = colResult.insertId; // ID of "Todo" column (first inserted)

      // Insert default sample task into Todo
      const taskSql = "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), 0)";
      db.query(taskSql, [todoColumnId, "Sample Title", "Sample Description"], (taskErr) => {
        if (taskErr) {
          console.error("Error inserting sample task:", taskErr);
          return res.status(500).json({ success: false, error: "Database error" });
        }

        res.json({ success: true, id: projectId });
      });
    });
  });
};

// Get projects by user at home
exports.getProject = (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM projects WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, projects: results });
  });
};

//get project details after clicking on project
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM projects WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (!results.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, project: results[0] });
  });
};


// Update project
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description, userId } = req.body;

  // First get the current values
  const getSql = "SELECT title, description FROM projects WHERE id = ?";
  db.query(getSql, [id], (getErr, rows) => {
    if (getErr) {
      console.error("Error fetching old project data:", getErr);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const oldTitle = rows[0].title;
    const oldDesc = rows[0].description;

    // Update with new values
    const updateSql = "UPDATE projects SET title = ?, description = ? WHERE id = ?";
    db.query(updateSql, [title, description, id], (updateErr, result) => {
      if (updateErr) {
        console.error("Error updating project:", updateErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      // Insert log if userId is available
      if (userId) {
        const logMsg = `Updated project: title "${oldTitle}" → "${title}", description "${oldDesc}" → "${description}"`;
        addLog(id, userId, logMsg);
      } else {
        console.warn("No userId provided for project update log, skipping insert.");
      }

      res.json({ success: true });
    });
  });
};

// Delete project
exports.deleteProject = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true });
  });
};