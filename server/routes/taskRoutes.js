const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/columns/:columnId/tasks", authenticateToken, taskController.getTasks);
router.post("/columns/:columnId/tasks", authenticateToken, taskController.createTasks);
router.put("/columns/:columnId/tasks/reorder", authenticateToken, taskController.updatePositionAfterDnD);
router.put("/tasks/:id", authenticateToken, taskController.updateTasks);
router.delete("/tasks/:id", authenticateToken, taskController.deleteTasks);


module.exports = router;
