const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

// Every admin route requires a valid token AND the "admin" role.
router.use(verifyToken, requireRole("admin"));

router.get("/stats", admin.getStats);
router.get("/drivers/performance", admin.getDriverPerformance);
router.get("/history", admin.getHistory);
router.get("/fleet", admin.getFleet);
router.post("/fleet", admin.addVehicle);
router.get("/analytics", admin.getAnalytics);
router.get("/reports/preview", admin.previewReport);
router.get("/reports/download", admin.downloadReport);
router.get("/settings", admin.getSettings);
router.put("/settings", admin.saveSettings);

module.exports = router;