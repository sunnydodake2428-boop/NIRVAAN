const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
  requestTrip,
  acceptTrip,
  completeTrip,
  getMyTrips,
  submitPriceFeedback,
  getAvailableTrips,
  getTripDetails,
  getAdminStats,
  getPaymentHistory,
  getDriverEarnings,
} = require("../controllers/tripController");

router.post("/", verifyToken, requireRole("caller"), requestTrip);
router.get("/available", verifyToken, requireRole("driver"), getAvailableTrips);
router.get("/mine", verifyToken, getMyTrips);
router.get("/admin/stats", verifyToken, requireRole("admin"), getAdminStats);
router.get("/payments/mine", verifyToken, getPaymentHistory);
router.get("/:tripId", verifyToken, getTripDetails);
router.patch("/:tripId/accept", verifyToken, requireRole("driver"), acceptTrip);
router.patch("/:tripId/complete", verifyToken, completeTrip);
router.post("/:tripId/price", verifyToken, submitPriceFeedback);
router.get("/earnings/mine", verifyToken, requireRole("driver"), getDriverEarnings);

module.exports = router;