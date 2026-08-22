const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { submitRating, getMyDriverRating } = require("../controllers/ratingController");

router.post("/:tripId", verifyToken, requireRole("caller"), submitRating);
router.get("/me", verifyToken, requireRole("driver"), getMyDriverRating);

module.exports = router;