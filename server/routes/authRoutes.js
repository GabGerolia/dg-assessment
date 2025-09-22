const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/me", authenticateToken, authController.me);

module.exports = router;
