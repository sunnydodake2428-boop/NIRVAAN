const pool = require("../config/db");

async function getContacts(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at ASC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
}

async function addContact(req, res) {
  try {
    const { name, phone, relationship } = req.body;
    const result = await pool.query(
      `INSERT INTO emergency_contacts (user_id, name, phone, relationship)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name, phone, relationship]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contact" });
  }
}

async function deleteContact(req, res) {
  try {
    await pool.query(
      "DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
}

module.exports = { getContacts, addContact, deleteContact };