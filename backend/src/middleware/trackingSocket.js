// Real-time ambulance location.
// Driver emits their location -> server relays it to the patient watching that trip.
//
// SECURITY: connections must carry the login token, and each user can only join or
// send to trips they are part of. The frontend must connect like this:
//     io(API_URL, { auth: { token: localStorage.getItem("token") } })
// Emergency switch: set SOCKET_AUTH=off on Render to go back to the old open behaviour.
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const STRICT = process.env.SOCKET_AUTH !== "off";
const AUTH_CACHE_MS = 60 * 1000; // re-check trip ownership at most once a minute
const DB_WRITE_EVERY_MS = 10 * 1000; // save driver position to the database every 10 s

async function loadTripParties(tripId) {
  const r = await pool.query(
    `SELECT t.caller_id, d.user_id AS driver_user_id
     FROM trips t LEFT JOIN drivers d ON d.id = t.driver_id
     WHERE t.id = $1`,
    [tripId]
  );
  return r.rows[0] || null;
}

function registerTrackingSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return STRICT ? next(new Error("Authentication required")) : next();
    }
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
      next();
    } catch (err) {
      STRICT ? next(new Error("Invalid or expired token")) : next();
    }
  });

  io.on("connection", (socket) => {
    const driverAuthCache = new Map(); // tripId -> timestamp of last successful check
    let lastDbWrite = 0;

    // Patient (or assigned driver / admin) joins the room for a trip
    socket.on("join-trip", async (tripIdRaw) => {
      try {
        const tripId = Number(tripIdRaw);
        if (!Number.isInteger(tripId) || tripId <= 0) return;

        if (socket.user) {
          const trip = await loadTripParties(tripId);
          const ok =
            trip &&
            (socket.user.role === "admin" ||
              trip.caller_id === socket.user.id ||
              trip.driver_user_id === socket.user.id);
          if (!ok) return;
        } else if (STRICT) {
          return;
        }
        socket.join(`trip-${tripId}`);
      } catch (err) {
        console.error("join-trip error:", err.message);
      }
    });

    // Driver sends live location for the trip they are assigned to
    socket.on("driver-location-update", async ({ tripId: tripIdRaw, lat, lng } = {}) => {
      try {
        const tripId = Number(tripIdRaw);
        const la = Number(lat);
        const ln = Number(lng);
        if (!Number.isInteger(tripId) || tripId <= 0) return;
        if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) return;

        if (socket.user) {
          const checkedAt = driverAuthCache.get(tripId) || 0;
          if (Date.now() - checkedAt > AUTH_CACHE_MS) {
            const trip = await loadTripParties(tripId);
            if (!trip || socket.user.role !== "driver" || trip.driver_user_id !== socket.user.id) return;
            driverAuthCache.set(tripId, Date.now());
          }
          // Keep drivers.current_lat/lng fresh (used by the admin fleet page and trip details)
          if (Date.now() - lastDbWrite > DB_WRITE_EVERY_MS) {
            lastDbWrite = Date.now();
            pool
              .query(
                "UPDATE drivers SET current_lat = $1, current_lng = $2, updated_at = NOW() WHERE user_id = $3",
                [la, ln, socket.user.id]
              )
              .catch((err) => console.error("Save driver location failed:", err.message));
          }
        } else if (STRICT) {
          return;
        }

        io.to(`trip-${tripId}`).emit("location-update", { lat: la, lng: ln, timestamp: Date.now() });
      } catch (err) {
        console.error("driver-location-update error:", err.message);
      }
    });
  });
}

module.exports = registerTrackingSocket;