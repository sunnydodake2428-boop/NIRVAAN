const pool = require("../config/db");

// Search hospitals by specialty, sorted by nearest distance (Haversine formula)
async function searchHospitals(req, res) {
  try {
    const { specialty } = req.query;
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!req.query.lat || !req.query.lng || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "lat and lng are required and must be numbers" });
    }

    const params = [lat, lng];
    let specialtyFilter = "";

    if (specialty) {
      params.push(String(specialty).toLowerCase());
      specialtyFilter = `WHERE $3::text = ANY(specialty_tags)`;
    }

    // LEAST/GREATEST keeps acos() inside [-1, 1]; rounding can otherwise push it
    // just over 1 (for example when you stand exactly at a hospital) and crash the query.
    const query = `
      SELECT *,
        ( 6371 * acos(LEAST(1.0, GREATEST(-1.0,
            cos(radians($1::float8)) * cos(radians(lat)) *
            cos(radians(lng) - radians($2::float8)) +
            sin(radians($1::float8)) * sin(radians(lat))
        ))) ) AS distance_km
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
    const la = Number(lat);
    const ln = Number(lng);
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Hospital name is required" });
    }
    if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }
    const tags = Array.isArray(specialty_tags)
      ? specialty_tags.map((t) => String(t).toLowerCase())
      : [];

    const result = await pool.query(
      `INSERT INTO hospitals (name, address, lat, lng, contact_number, specialty_tags)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [String(name).trim(), address || null, la, ln, contact_number || null, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add hospital" });
  }
}

module.exports = { searchHospitals, addHospital };