const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
  signup,
  login,
  updateProfile,
  getProfile,
  googleLogin,
  getAllUsers,
} = require("../controllers/authController");

// express-rate-limit exports differently across versions; this handles both.
const rl = require("express-rate-limit");
const rateLimit = typeof rl === "function" ? rl : rl.rateLimit;

// Stops password guessing: 20 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/google", loginLimiter, googleLogin);
router.post("/google-login", loginLimiter, googleLogin);

router.get("/profile", verifyToken, getProfile);
router.get("/me", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.patch("/profile", verifyToken, updateProfile);

router.get("/users", verifyToken, requireRole("admin"), getAllUsers);

module.exports = router;