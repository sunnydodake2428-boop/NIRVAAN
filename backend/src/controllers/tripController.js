const pool = require("../config/db");

// ---------------------------------------------------------------------------
// Settings you can change
// ---------------------------------------------------------------------------
// Drivers sign up on their own, so anyone can become a "driver" and see patient
// phone numbers. Set this to true ONCE you have a way to mark drivers as verified
// (drivers.is_verified = true). Until then it stays false so nothing breaks.
const REQUIRE_VERIFIED_DRIVERS = false;

// Open requests older than this are hidden from drivers (there is no cancel button yet).
const OPEN_REQUEST_MINUTES = 30;
// ---------------------------------------------------------------------------

const toId = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// null = not provided, NaN = invalid, otherwise the number
const toCoord = (v, max) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n) <= max ? n : NaN;
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Caller requests an ambulance
async function requestTrip(req, res) {
  try {
    const { pickup_lat, pickup_lng, pickup_address } = req.body;
    const lat = toCoord(pickup_lat, 90);
    const lng = toCoord(pickup_lng, 180);
    if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Valid pickup_lat and pickup_lng are required" });
    }
    const address = pickup_address ? String(pickup_address).slice(0, 300) : null;
    const caller_id = req.user.id;

    // Double-tap protection: return the caller's still-open request instead of creating a duplicate
    const open = await pool.query(
      `SELECT * FROM trips
       WHERE caller_id = $1 AND status::text = 'requested'
         AND requested_at > NOW() - make_interval(mins => $2::int)
       ORDER BY requested_at DESC LIMIT 1`,
      [caller_id, OPEN_REQUEST_MINUTES]
    );
    if (open.rows.length > 0) return res.status(200).json(open.rows[0]);

    const result = await pool.query(
      `INSERT INTO trips (caller_id, pickup_lat, pickup_lng, pickup_address, status)
       VALUES ($1, $2, $3, $4, 'requested') RETURNING *`,
      [caller_id, lat, lng, address]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create trip request" });
  }
}

// Driver accepts a trip
async function acceptTrip(req, res) {
  try {
    const tripId = toId(req.params.tripId);
    if (!tripId) return res.status(400).json({ error: "Invalid trip id" });

    const driverResult = await pool.query(
      "SELECT id, is_verified FROM drivers WHERE user_id = $1",
      [req.user.id]
    );
    if (driverResult.rows.length === 0) {
      return res.status(403).json({ error: "Not a registered driver" });
    }
    if (REQUIRE_VERIFIED_DRIVERS && !driverResult.rows[0].is_verified) {
      return res.status(403).json({ error: "Your driver account is awaiting verification" });
    }
    const driver_id = driverResult.rows[0].id;

    const result = await pool.query(
      `UPDATE trips SET driver_id = $1, status = 'accepted', accepted_at = NOW()
       WHERE id = $2 AND status = 'requested' RETURNING *`,
      [driver_id, tripId]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Trip already accepted or not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept trip" });
  }
}

// Mark trip completed (only the patient who requested it, the assigned driver, or an admin)
async function completeTrip(req, res) {
  try {
    const tripId = toId(req.params.tripId);
    if (!tripId) return res.status(400).json({ error: "Invalid trip id" });

    const lat = toCoord(req.body.dropoff_lat, 90);
    const lng = toCoord(req.body.dropoff_lng, 180);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Invalid drop-off coordinates" });
    }

    const result = await pool.query(
      `UPDATE trips t
       SET status = 'completed', completed_at = NOW(), dropoff_lat = $2, dropoff_lng = $3
       WHERE t.id = $1
         AND t.driver_id IS NOT NULL
         AND t.status::text NOT IN ('completed', 'cancelled')
         AND (
           $4::boolean
           OR t.caller_id = $5::int
           OR t.driver_id = (SELECT id FROM drivers WHERE user_id = $5::int)
         )
       RETURNING t.*`,
      [tripId, lat, lng, req.user.role === "admin", req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found, already finished, or not yours" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to complete trip" });
  }
}

// Get trip history for logged-in user
async function getMyTrips(req, res) {
  try {
    let result;
    if (req.user.role === "driver") {
      const driverResult = await pool.query("SELECT id FROM drivers WHERE user_id = $1", [req.user.id]);
      if (driverResult.rows.length === 0) return res.json([]);
      const driverId = driverResult.rows[0].id;
      result = await pool.query(
        `SELECT * FROM trips WHERE driver_id = $1 ORDER BY requested_at DESC`,
        [driverId]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM trips WHERE caller_id = $1 ORDER BY requested_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
}

// Submit price feedback after a trip (patient, assigned driver, or admin)
async function submitPriceFeedback(req, res) {
  try {
    const tripId = toId(req.params.tripId);
    if (!tripId) return res.status(400).json({ error: "Invalid trip id" });

    const price = Number(req.body.price_charged);
    if (!Number.isFinite(price) || price < 0 || price > 1000000) {
      return res.status(400).json({ error: "price_charged must be a valid amount" });
    }

    const tripResult = await pool.query(
      `SELECT t.*, d.vehicle_type AS driver_vehicle_type, d.user_id AS driver_user_id
       FROM trips t LEFT JOIN drivers d ON d.id = t.driver_id
       WHERE t.id = $1`,
      [tripId]
    );
    const trip = tripResult.rows[0];
    const allowed =
      trip &&
      (req.user.role === "admin" ||
        trip.caller_id === req.user.id ||
        trip.driver_user_id === req.user.id);
    if (!allowed) return res.status(404).json({ error: "Trip not found" });

    const hasBoth =
      trip.pickup_lat != null && trip.pickup_lng != null &&
      trip.dropoff_lat != null && trip.dropoff_lng != null;
    const distance_km = hasBoth
      ? Number(haversineKm(trip.pickup_lat, trip.pickup_lng, trip.dropoff_lat, trip.dropoff_lng).toFixed(2))
      : 0;
    const vehicle_type = trip.driver_vehicle_type || "basic";

    const result = await pool.query(
      `INSERT INTO trip_prices (trip_id, distance_km, price_charged, vehicle_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (trip_id) DO UPDATE SET price_charged = $3
       RETURNING *`,
      [tripId, distance_km, price, vehicle_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit price feedback" });
  }
}

// Get open trip requests (for drivers to see)
async function getAvailableTrips(req, res) {
  try {
    if (REQUIRE_VERIFIED_DRIVERS) {
      const d = await pool.query("SELECT is_verified FROM drivers WHERE user_id = $1", [req.user.id]);
      if (d.rows.length === 0 || !d.rows[0].is_verified) return res.json([]);
    }
    const result = await pool.query(
      `SELECT trips.*, users.name AS caller_name, users.phone AS caller_phone
       FROM trips
       LEFT JOIN users ON trips.caller_id = users.id
       WHERE trips.status::text = 'requested'
         AND trips.requested_at > NOW() - make_interval(mins => $1::int)
       ORDER BY trips.requested_at ASC`,
      [OPEN_REQUEST_MINUTES]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available trips" });
  }
}

// Full trip details with driver info (live tracking screen) - only for people involved in the trip
async function getTripDetails(req, res) {
  try {
    const tripId = toId(req.params.tripId);
    if (!tripId) return res.status(400).json({ error: "Invalid trip id" });

    const result = await pool.query(
      `SELECT
         trips.*,
         users.name AS driver_name,
         users.phone AS driver_phone,
         drivers.vehicle_number,
         drivers.vehicle_type,
         drivers.current_lat,
         drivers.current_lng,
         (SELECT AVG(rating)::numeric(3,2) FROM driver_ratings WHERE driver_id = trips.driver_id) AS driver_avg_rating,
         (SELECT COUNT(*) FROM driver_ratings WHERE driver_id = trips.driver_id) AS driver_total_ratings
       FROM trips
       LEFT JOIN drivers ON trips.driver_id = drivers.id
       LEFT JOIN users ON drivers.user_id = users.id
       WHERE trips.id = $1
         AND ($2::text = 'admin' OR trips.caller_id = $3::int OR drivers.user_id = $3::int)`,
      [tripId, req.user.role, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Trip not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
}

// Admin: dashboard stats (the admin dashboard now uses /api/admin/stats instead)
async function getAdminStats(req, res) {
  try {
    const totalTrips = await pool.query("SELECT COUNT(*) FROM trips");
    const activeDrivers = await pool.query("SELECT COUNT(*) FROM drivers WHERE is_available = true");
    const recentTrips = await pool.query(
      `SELECT trips.*, users.name AS caller_name,
         CASE WHEN trips.accepted_at IS NOT NULL
           THEN ROUND(EXTRACT(EPOCH FROM (trips.accepted_at - trips.requested_at)) / 60, 1)
           ELSE NULL
         END AS response_minutes
       FROM trips
       LEFT JOIN users ON trips.caller_id = users.id
       ORDER BY trips.requested_at DESC LIMIT 10`
    );
    const avgResponse = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (accepted_at - requested_at)) / 60) AS avg_minutes
       FROM trips WHERE accepted_at IS NOT NULL`
    );

    res.json({
      total_trips: parseInt(totalTrips.rows[0].count),
      active_drivers: parseInt(activeDrivers.rows[0].count),
      recent_trips: recentTrips.rows,
      avg_response_minutes: avgResponse.rows[0].avg_minutes
        ? parseFloat(avgResponse.rows[0].avg_minutes).toFixed(1)
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
}

// Get payment/price history for logged-in caller
async function getPaymentHistory(req, res) {
  try {
    const result = await pool.query(
      `SELECT trip_prices.*, trips.pickup_address, trips.requested_at
       FROM trip_prices
       JOIN trips ON trip_prices.trip_id = trips.id
       WHERE trips.caller_id = $1
       ORDER BY trip_prices.submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
}

// Driver: earnings summary
async function getDriverEarnings(req, res) {
  try {
    const driverResult = await pool.query("SELECT id FROM drivers WHERE user_id = $1", [req.user.id]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: "Driver profile not found" });
    }
    const driverId = driverResult.rows[0].id;

    const totals = await pool.query(
      `SELECT
         COALESCE(SUM(tp.price_charged), 0) AS total_earnings,
         COUNT(*) AS completed_rides
       FROM trips t
       JOIN trip_prices tp ON tp.trip_id = t.id
       WHERE t.driver_id = $1 AND t.status = 'completed'`,
      [driverId]
    );

    const today = await pool.query(
      `SELECT COALESCE(SUM(tp.price_charged), 0) AS today_earnings
       FROM trips t
       JOIN trip_prices tp ON tp.trip_id = t.id
       WHERE t.driver_id = $1 AND t.status = 'completed'
         AND t.completed_at::date = CURRENT_DATE`,
      [driverId]
    );

    res.json({
      total_earnings: parseFloat(totals.rows[0].total_earnings),
      completed_rides: parseInt(totals.rows[0].completed_rides),
      today_earnings: parseFloat(today.rows[0].today_earnings),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
}

module.exports = {
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
};