const pool = require("../config/db");

// Caller requests an ambulance
async function requestTrip(req, res) {
  try {
    const { pickup_lat, pickup_lng, pickup_address } = req.body;
    const caller_id = req.user.id;

    const result = await pool.query(
      `INSERT INTO trips (caller_id, pickup_lat, pickup_lng, pickup_address, status)
       VALUES ($1, $2, $3, $4, 'requested') RETURNING *`,
      [caller_id, pickup_lat, pickup_lng, pickup_address]
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
    const { tripId } = req.params;
    const driverResult = await pool.query("SELECT id FROM drivers WHERE user_id = $1", [req.user.id]);
    if (driverResult.rows.length === 0) {
      return res.status(403).json({ error: "Not a registered driver" });
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

// Mark trip completed
async function completeTrip(req, res) {
  try {
    const { tripId } = req.params;
    const result = await pool.query(
      `UPDATE trips SET status = 'completed', completed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [tripId]
    );
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



// Submit price feedback after a trip
async function submitPriceFeedback(req, res) {
  try {
    const { tripId } = req.params;
    const { price_charged } = req.body;

    const tripResult = await pool.query("SELECT * FROM trips WHERE id = $1", [tripId]);
    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const distance_km = 0;
    const vehicle_type = "basic";

    const result = await pool.query(
      `INSERT INTO trip_prices (trip_id, distance_km, price_charged, vehicle_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (trip_id) DO UPDATE SET price_charged = $3
       RETURNING *`,
      [tripId, distance_km, price_charged, vehicle_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit price feedback" });
  }
}

// Get all unassigned trip requests (for drivers to see)
async function getAvailableTrips(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM trips WHERE status = 'requested' ORDER BY requested_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available trips" });
  }
}

// Get full trip details with driver info (for live tracking screen)
async function getTripDetails(req, res) {
  try {
    const { tripId } = req.params;
    const result = await pool.query(
      `SELECT
         trips.*,
         users.name AS driver_name,
         users.phone AS driver_phone,
         drivers.vehicle_number,
         drivers.vehicle_type,
         drivers.current_lat,
         drivers.current_lng
       FROM trips
       LEFT JOIN drivers ON trips.driver_id = drivers.id
       LEFT JOIN users ON drivers.user_id = users.id
       WHERE trips.id = $1`,
      [tripId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Trip not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
}

// Admin: dashboard stats
async function getAdminStats(req, res) {
  try {
    const totalTrips = await pool.query("SELECT COUNT(*) FROM trips");
    const activeDrivers = await pool.query("SELECT COUNT(*) FROM drivers WHERE is_available = true");
    const recentTrips = await pool.query(
      `SELECT trips.*, users.name AS caller_name
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