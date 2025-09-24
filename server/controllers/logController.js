const { getLogsByProject, createLog } = require("../models/logModel");

// Fetch logs for a specific project
exports.fetchLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sort = "desc" } = req.query;

    const logs = await getLogsByProject(projectId, sort);
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create a new log entry
exports.createLogs = async (req, res) => {
  try {
    const { project_id, user_id, description } = req.body;

    if (!project_id || !user_id || !description) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await createLog(project_id, user_id, description);

    res.json({
      id: result.insertId,
      project_id,
      user_id,
      description,
    });
  } catch (err) {
    console.error("Error inserting log:", err);
    res.status(500).json({ error: "Database error" });
  }
};
