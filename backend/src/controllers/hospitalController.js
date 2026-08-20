const pool = require("../config/db");

// Search hospitals by specialty, sorted by nearest distance (Haversine formula)
async function searchHospitals(req, res) {
  try {
    const { specialty, lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const params = [lat, lng];
    let specialtyFilter = "";

    if (specialty) {
      params.push(specialty.toLowerCase());
      specialtyFilter = `WHERE $3 = ANY(specialty_tags)`;
    }

    const query = `
      SELECT *,
        ( 6371 * acos(
            cos(radians($1)) * cos(radians(lat)) *
            cos(radians(lng) - radians($2)) +
            sin(radians($1)) * sin(radians(lat))
        ) ) AS distance_km
      FROM hospitals
      ${specialtyFilter}
      ORDER BY distance_km ASC
      LIMIT 20;
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search hospitals" });
  }
}

// Admin: add a hospital
async function addHospital(req, res) {
  try {
    const { name, address, lat, lng, contact_number, specialty_tags } = req.body;
    const result = await pool.query(
      `INSERT INTO hospitals (name, address, lat, lng, contact_number, specialty_tags)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, address, lat, lng, contact_number, specialty_tags || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add hospital" });
  }
}

module.exports = { searchHospitals, addHospital };