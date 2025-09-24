const {
  getTasksByColumn,
  getProjectIdByColumn,
  getNextPosition,
  insertTask,
  updateTaskPosition,
  getTaskById,
  updateTask,
  getProjectByTaskId,
  getTaskWithProject,
  deleteTask,
} = require("../models/taskModel");
const { addLog } = require("../models/logModel");

// Get tasks for a column
exports.getTasks = async (req, res) => {
  try {
    const { columnId } = req.params;
    const tasks = await getTasksByColumn(columnId);
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ success: false });
  }
};

// Create a new task
exports.createTasks = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, description, userId } = req.body;

    const columns = await getProjectIdByColumn(columnId);
    if (!columns.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const projectId = columns[0].project_id;
    const nextPos = await getNextPosition(columnId);
    const result = await insertTask(columnId, title, description, nextPos);

    if (userId) {
      addLog(projectId, userId, `Created task "${title}"`);
    }

    res.json({
      id: result.insertId,
      column_id: parseInt(columnId, 10),
      title,
      description,
      created_at: new Date(),
      position: nextPos,
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ success: false });
  }
};

// Bulk update positions after drag-and-drop
exports.updatePositionAfterDnD = async (req, res) => {
  const { columnId } = req.params;
  const { orderedTaskIds } = req.body;

  if (!Array.isArray(orderedTaskIds)) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  try {
    await Promise.all(
      orderedTaskIds.map((taskId, index) => updateTaskPosition(taskId, columnId, index))
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error reordering tasks:", err);
    res.status(500).json({ success: false });
  }
};

// Update task
exports.updateTasks = async (req, res) => {
  const { id } = req.params;
  const { title, description, column_id, position, userId } = req.body;

  try {
    const oldRows = await getTaskById(id);
    if (!oldRows.length) return res.status(404).json({ success: false });

    const oldTask = oldRows[0];
    await updateTask(id, title, description, column_id, position);

    const projectRows = await getProjectByTaskId(id);
    if (!projectRows.length) return res.status(404).json({ success: false });

    if (userId) {
      const logMsg = `Updated task "${oldTask.title}" → "${title}", description "${oldTask.description}" → "${description}"`;
      addLog(projectRows[0].project_id, userId, logMsg);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ success: false });
  }
};

// Delete task
exports.deleteTasks = async (req, res) => {
  const { id } = req.params;
  const userId = req.body?.userId ?? req.query?.userId;

  try {
    const rows = await getTaskWithProject(id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { project_id: projectId, title } = rows[0];
    await deleteTask(id);

    if (userId) {
      addLog(projectId, userId, `Deleted task named "${title}"`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false });
  }
};
