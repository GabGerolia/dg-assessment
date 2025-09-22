const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/projects", projectController.createProject);
router.get("/projects/:userId", authenticateToken, projectController.getProject);
router.get("/project/:id", authenticateToken, projectController.getProjectById);
router.put("/projects/:id", projectController.updateProject);
router.delete("/projects/:id", projectController.deleteProject);

module.exports = router;
