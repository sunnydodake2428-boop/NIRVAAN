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
    if (!name || !String(name).trim() || !phone || !String(phone).trim()) {
      return res.status(400).json({ error: "name and phone are required" });
    }
    const result = await pool.query(
      `INSERT INTO emergency_contacts (user_id, name, phone, relationship)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        req.user.id,
        String(name).trim().slice(0, 100),
        String(phone).trim().slice(0, 30),
        relationship ? String(relationship).trim().slice(0, 50) : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contact" });
  }
}

async function deleteContact(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid contact id" });
    }
    const result = await pool.query(
      "DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Contact not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
}

module.exports = { getContacts, addContact, deleteContact };