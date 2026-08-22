const pool = require("../config/db");

async function submitRating(req, res) {
  try {
    const { tripId } = req.params;
    const { rating, review } = req.body;

    const tripResult = await pool.query("SELECT driver_id FROM trips WHERE id = $1", [tripId]);
    if (tripResult.rows.length === 0) return res.status(404).json({ error: "Trip not found" });

    const driverId = tripResult.rows[0].driver_id;
    if (!driverId) return res.status(400).json({ error: "No driver assigned to this trip" });

    const result = await pool.query(
      `INSERT INTO driver_ratings (trip_id, driver_id, caller_id, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (trip_id) DO UPDATE SET rating = $4, review = $5
       RETURNING *`,
      [tripId, driverId, req.user.id, rating, review]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit rating" });
  }
}

async function getDriverRating(driverId) {
  const result = await pool.query(
    `SELECT AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS total_ratings
     FROM driver_ratings WHERE driver_id = $1`,
    [driverId]
  );
  return {
    avg_rating: result.rows[0].avg_rating ? parseFloat(result.rows[0].avg_rating) : null,
    total_ratings: parseInt(result.rows[0].total_ratings),
  };
}

async function getMyDriverRating(req, res) {
  try {
    const driverResult = await pool.query("SELECT id FROM drivers WHERE user_id = $1", [req.user.id]);
    if (driverResult.rows.length === 0) return res.status(404).json({ error: "Driver not found" });
    const stats = await getDriverRating(driverResult.rows[0].id);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rating" });
  }
}

module.exports = { submitRating, getMyDriverRating, getDriverRating };