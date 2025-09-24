const { addLog } = require("../models/logModel");
const Project = require("../models/projectModel");

// Create project
exports.createProject = (req, res) => {
  const { userId, title, description } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  Project.createProject(userId, title, description, (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    const projectId = result.insertId;

    // Preset columns
    const presetColumns = [ //change colors here.
      { title: "Todo", color: "hsl(350, 63%, 40%)", position: 0 },
      { title: "In Progress", color: "hsl(25 45% 40%)", position: 1 },
      { title: "Done", color: "hsl(140 35% 40%)", position: 2 },
    ];

    Project.insertColumns(projectId, presetColumns, (colErr, colResult) => {
      if (colErr) {
        console.error("Error inserting columns:", colErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      const todoColumnId = colResult.insertId; // first inserted column ("Todo")

      Project.insertDefaultTask(todoColumnId, (taskErr) => {
        if (taskErr) {
          console.error("Error inserting sample task:", taskErr);
          return res.status(500).json({ success: false, error: "Database error" });
        }
        res.json({ success: true, id: projectId });
      });
    });
  });
};

// Get projects by user
exports.getProject = (req, res) => {
  const { userId } = req.params;
  Project.getProjectsByUserId(userId, (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, projects: results });
  });
};

// Get project by id
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  Project.getProjectById(id, (err, results) => {
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

  Project.getOldProjectValues(id, (getErr, rows) => {
    if (getErr) {
      console.error("Error fetching old project data:", getErr);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const oldTitle = rows[0].title;
    const oldDesc = rows[0].description;

    Project.updateProject(id, title, description, (updateErr) => {
      if (updateErr) {
        console.error("Error updating project:", updateErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      if (userId) {
        const logMsg = `Updated project: title "${oldTitle}" → "${title}", description "${oldDesc}" → "${description}"`;
        addLog(id, userId, logMsg);
      }

      res.json({ success: true });
    });
  });
};

// Delete project
exports.deleteProject = (req, res) => {
  const { id } = req.params;
  Project.deleteProject(id, (err) => {
    if (err) {
      console.error("Error deleting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true });
  });
};
