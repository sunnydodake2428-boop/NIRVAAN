const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { setAvailability, getMyDriverProfile, updateVehicle } = require("../controllers/driverController");

router.patch("/availability", verifyToken, requireRole("driver"), setAvailability);
router.get("/me", verifyToken, requireRole("driver"), getMyDriverProfile);
router.patch("/vehicle", verifyToken, requireRole("driver"), updateVehicle);

module.exports = router;