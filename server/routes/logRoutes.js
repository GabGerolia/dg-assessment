const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/logs/:projectId", authenticateToken, logController.fetchLogs);
router.post("/logs", authenticateToken, logController.createLogs);


module.exports = router;
