const express = require("express");
const router = express.Router();
const columnController = require("../controllers/columnController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/projects/:projectId/columns", authenticateToken, columnController.getColumns);
router.post("/projects/:projectId/columns", authenticateToken, columnController.createColumn);
router.put("/columns/:id/position", authenticateToken, columnController.updatePosition);
router.put("/columns/:id", authenticateToken, columnController.updateColumn);
router.delete("/columns/:id", authenticateToken, columnController.deleteColumn);

module.exports = router;
