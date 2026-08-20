const pool = require("../config/db");

// Toggle driver's own availability
async function setAvailability(req, res) {
  try {
    const { is_available } = req.body;
    const result = await pool.query(
      `UPDATE drivers SET is_available = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *`,
      [is_available, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Driver profile not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update availability" });
  }
}


async function getMyDriverProfile(req, res) {
  try {
    const result = await pool.query("SELECT * FROM drivers WHERE user_id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch driver profile" });
  }
}

async function updateVehicle(req, res) {
  try {
    const { vehicle_number, vehicle_type } = req.body;
    const result = await pool.query(
      `UPDATE drivers SET vehicle_number = $1, vehicle_type = $2 WHERE user_id = $3 RETURNING *`,
      [vehicle_number, vehicle_type, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update vehicle" });
  }
}


module.exports = { setAvailability, getMyDriverProfile, updateVehicle };