const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { searchHospitals, addHospital } = require("../controllers/hospitalController");

// e.g. GET /api/hospitals?specialty=cancer&lat=18.62&lng=73.80
router.get("/", searchHospitals);
router.post("/", verifyToken, requireRole("admin"), addHospital);

module.exports = router;