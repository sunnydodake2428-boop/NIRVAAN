const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { signup, login, updateProfile, getProfile, googleLogin, etAllUsers } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getProfile);
router.patch("/me", verifyToken, updateProfile);
router.post("/google", googleLogin);
router.get("/users", verifyToken, requireRole("admin"), getAllUsers);

module.exports = router;