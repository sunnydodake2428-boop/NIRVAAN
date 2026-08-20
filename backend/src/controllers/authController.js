const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function signup(req, res) {
  try {
    const { name, phone, password, role } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: "name, phone, and password are required" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Phone number already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, phone, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role`,
      [name, phone, password_hash, role || "caller"]
    );

    const user = result.rows[0];

    if (user.role === "driver") {
  const { vehicle_number, vehicle_type } = req.body;
  await pool.query(
    "INSERT INTO drivers (user_id, vehicle_number, vehicle_type) VALUES ($1, $2, $3)",
    [user.id, vehicle_number || null, vehicle_type || "basic"]
  );
}

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
}

async function login(req, res) {
  try {
    const { phone, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

// Update logged-in user's own profile
async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone)
       WHERE id = $3 RETURNING id, name, phone, role`,
      [name, phone, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// Get logged-in user's own profile
async function getProfile(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, role FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

module.exports = { signup, login, updateProfile, getProfile };