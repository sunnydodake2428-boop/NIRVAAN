const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "1067477128562-hvge14a7q78to4n3l7pksi1cuvv70rnr.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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
       VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role, avatar_url`,
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
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
}

async function login(req, res) {
  try {
    const { phone, email, password } = req.body;
    const identifier = phone || email;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Phone or email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [identifier]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid phone/email or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid phone/email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url || null,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

// Update logged-in user's own profile
async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone)
       WHERE id = $3 RETURNING id, name, phone, role, avatar_url`,
      [name, phone, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// Get logged-in user's own profile
async function getProfile(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, avatar_url, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

// Fast Google Login execution
async function googleLogin(req, res) {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let userResult = await pool.query("SELECT * FROM users WHERE phone = $1", [email]);
    let user = userResult.rows[0];

    // Only hash password when creating a new user
    if (!user) {
      const password_hash = await bcrypt.hash(email + Date.now(), 8);
      const insertResult = await pool.query(
        `INSERT INTO users (name, phone, password_hash, role, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, phone, role, avatar_url`,
        [name, email, password_hash, role || "caller", picture]
      );
      user = insertResult.rows[0];
      if (user.role === "driver") {
        await pool.query("INSERT INTO drivers (user_id) VALUES ($1)", [user.id]);
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url || picture || null,
      },
      token,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Google login failed: " + err.message });
  }
}

// Admin: list all registered users
async function getAllUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, role, created_at,
         CASE WHEN phone LIKE '%@%' THEN 'Google' ELSE 'Phone' END AS signup_method
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

module.exports = {
  signup,
  login,
  updateProfile,
  getProfile,
  googleLogin,
  getAllUsers,
};