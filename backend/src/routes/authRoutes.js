const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { signup, login, updateProfile, getProfile } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getProfile);
router.patch("/me", verifyToken, updateProfile);
router.post("/google", googleLogin);

module.exports = router;