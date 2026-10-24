const pool = require("../config/db");

// ---------------------------------------------------------------------------
// ONE-LINE SWITCH: how trips point to drivers.
// Default assumes trips.driver_id stores drivers.id.
// If your trips.driver_id stores users.id instead, use:  "d.user_id = t.driver_id"
// ---------------------------------------------------------------------------
const DRIVER_JOIN = "d.id = t.driver_id";

const TYPE_LABELS = {
  basic: "BLS (Basic)",
  bls: "BLS (Basic)",
  advanced: "ALS (Advanced)",
  als: "ALS (Advanced)",
};

const TZ = "Asia/Kolkata";
const OPEN_REQUEST_MINUTES = 30; // keep in sync with tripController.js

const round1 = (n) => (n == null ? null : Math.round(Number(n) * 10) / 10);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        timeZone: TZ,
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const fmtHour = (h) => {
  const f = (x) => {
    const hr = ((x % 24) + 24) % 24;
    const suffix = hr >= 12 ? "PM" : "AM";
    const h12 = hr % 12 === 0 ? 12 : hr % 12;
    return `${String(h12).padStart(2, "0")}:00 ${suffix}`;
  };
  return `${f(h)} - ${f(h + 1)}`;
};

// ---------------------------------------------------------------------------
// Response-time definitions (real data only):
//   Accept time  = requested_at -> accepted_at   (how long the patient waited for a driver)
//   Arrival time = accepted_at  -> arrived_at    (how long the driver took to reach the patient)
// Arrival time exists only for trips where the driver tapped "Arrived" in the driver app.
// ---------------------------------------------------------------------------
async function responseStats() {
  const [accept, arrival] = await Promise.all([
    pool.query(
      `SELECT AVG(m) AS avg_min,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY m) AS median_min,
              COUNT(*)::int AS n
       FROM (SELECT EXTRACT(EPOCH FROM (accepted_at - requested_at)) / 60 AS m
             FROM trips
             WHERE accepted_at IS NOT NULL AND requested_at IS NOT NULL) x`
    ),
    pool.query(
      `SELECT AVG(m) AS avg_min, COUNT(*)::int AS n
       FROM (SELECT EXTRACT(EPOCH FROM (arrived_at - accepted_at)) / 60 AS m
             FROM trips
             WHERE arrived_at IS NOT NULL AND accepted_at IS NOT NULL) x`
    ),
  ]);
  return {
    avgAcceptMinutes: round1(accept.rows[0].avg_min),
    medianAcceptMinutes: round1(accept.rows[0].median_min),
    acceptSamples: accept.rows[0].n,
    avgArrivalMinutes: round1(arrival.rows[0].avg_min),
    arrivalSamples: arrival.rows[0].n,
  };
}

// GET /api/admin/stats  (dashboard overview - all real data)
async function getStats(req, res) {
  try {
    const [counts, resp, trend, recent] = await Promise.all([
      pool.query(
        `SELECT
           (SELECT COUNT(*) FROM trips)::int AS total_trips,
           (SELECT COUNT(*) FROM trips
              WHERE (requested_at AT TIME ZONE 'UTC' AT TIME ZONE '${TZ}')::date
                  = (NOW() AT TIME ZONE '${TZ}')::date)::int AS trips_today,
           (SELECT COUNT(*) FROM trips WHERE status::text = 'completed')::int AS completed,
           (SELECT COUNT(*) FROM trips WHERE status::text = 'cancelled')::int AS cancelled,
           (SELECT COUNT(*) FROM trips
              WHERE status::text = 'requested'
                AND requested_at > NOW() - make_interval(mins => ${OPEN_REQUEST_MINUTES}))::int AS open_requests,
           (SELECT COUNT(*) FROM trips
              WHERE accepted_at IS NOT NULL AND completed_at IS NULL
                AND status::text NOT IN ('completed', 'cancelled'))::int AS in_progress,
           (SELECT COUNT(*) FROM drivers)::int AS total_drivers,
           (SELECT COUNT(*) FROM drivers WHERE is_available = true)::int AS online_drivers,
           (SELECT COUNT(*) FROM users WHERE role::text = 'caller')::int AS patients,
           (SELECT COALESCE(SUM(price_charged), 0) FROM trip_prices)::float AS fares_total`
      ),
      responseStats(),
      pool.query(
        `WITH days AS (
           SELECT generate_series(
             (NOW() AT TIME ZONE '${TZ}')::date - 6,
             (NOW() AT TIME ZONE '${TZ}')::date,
             interval '1 day')::date AS day
         )
         SELECT to_char(d.day, 'DD Mon') AS label,
                COUNT(t.id)::int AS trips,
                COUNT(t.id) FILTER (WHERE t.status::text = 'completed')::int AS completed
         FROM days d
         LEFT JOIN trips t
           ON (t.requested_at AT TIME ZONE 'UTC' AT TIME ZONE '${TZ}')::date = d.day
         GROUP BY d.day ORDER BY d.day`
      ),
      pool.query(
        `SELECT t.id, u.name AS patient, du.name AS driver, d.vehicle_number,
                t.status::text AS status, t.requested_at,
                EXTRACT(EPOCH FROM (t.accepted_at - t.requested_at)) / 60 AS accept_min,
                EXTRACT(EPOCH FROM (t.arrived_at - t.accepted_at)) / 60 AS arrival_min
         FROM trips t
         LEFT JOIN users u ON u.id = t.caller_id
         LEFT JOIN drivers d ON ${DRIVER_JOIN}
         LEFT JOIN users du ON du.id = d.user_id
         ORDER BY t.requested_at DESC
         LIMIT 10`
      ),
    ]);

    const c = counts.rows[0];
    res.json({
      stats: {
        totalTrips: c.total_trips,
        tripsToday: c.trips_today,
        completedTrips: c.completed,
        cancelledTrips: c.cancelled,
        openRequests: c.open_requests,
        inProgress: c.in_progress,
        totalDrivers: c.total_drivers,
        onlineDrivers: c.online_drivers,
        patients: c.patients,
        faresTotal: c.fares_total,
        ...resp,
      },
      trend: trend.rows,
      recentTrips: recent.rows.map((r) => ({
        id: r.id,
        patient: r.patient || "N/A",
        driver: r.driver || null,
        vehicle: r.vehicle_number || null,
        status: cap(r.status),
        date: fmtDate(r.requested_at),
        acceptMinutes: round1(r.accept_min),
        arrivalMinutes: round1(r.arrival_min),
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
}

// GET /api/admin/drivers/performance?days=0|7|30|90   (0 = all time)
// One row PER DRIVER with that driver's own response times.
async function getDriverPerformance(req, res) {
  try {
    const days = [0, 7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 0;
    const result = await pool.query(
      `SELECT d.id, u.name, u.phone, d.vehicle_number, d.is_available,
              COUNT(t.id)::int AS trips_taken,
              COUNT(t.id) FILTER (WHERE t.status::text = 'completed')::int AS trips_completed,
              AVG(EXTRACT(EPOCH FROM (t.accepted_at - t.requested_at)) / 60)
                FILTER (WHERE t.accepted_at IS NOT NULL) AS avg_accept_min,
              AVG(EXTRACT(EPOCH FROM (t.arrived_at - t.accepted_at)) / 60)
                FILTER (WHERE t.arrived_at IS NOT NULL) AS avg_arrival_min,
              COUNT(t.arrived_at)::int AS arrival_samples,
              (SELECT AVG(rating)::numeric(3,2) FROM driver_ratings r WHERE r.driver_id = d.id) AS rating,
              (SELECT COUNT(*) FROM driver_ratings r WHERE r.driver_id = d.id)::int AS rating_count
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN trips t
         ON ${DRIVER_JOIN}
        AND ($1::int = 0 OR t.requested_at >= NOW() - make_interval(days => $1::int))
       GROUP BY d.id, u.name, u.phone
       ORDER BY trips_taken DESC, u.name`,
      [days]
    );
    res.json({
      days,
      drivers: result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        vehicle: r.vehicle_number,
        online: r.is_available,
        tripsTaken: r.trips_taken,
        tripsCompleted: r.trips_completed,
        avgAcceptMinutes: round1(r.avg_accept_min),
        avgArrivalMinutes: round1(r.avg_arrival_min),
        arrivalSamples: r.arrival_samples,
        rating: r.rating == null ? null : Number(r.rating),
        ratingCount: r.rating_count,
      })),
    });
  } catch (err) {
    console.error("Driver performance error:", err);
    res.status(500).json({ error: "Failed to load driver performance" });
  }
}

// GET /api/admin/history
async function getHistory(req, res) {
  try {
    const result = await pool.query(
      `SELECT 'REQ-' || t.id::text AS id,
              u.name AS patient_name,
              u.phone AS contact,
              t.pickup_address,
              t.status::text AS status,
              t.requested_at AS created_at,
              d.vehicle_number AS ambulance_code,
              du.name AS driver_name,
              h.name AS hospital_name,
              EXTRACT(EPOCH FROM (t.accepted_at - t.requested_at)) / 60 AS accept_min,
              EXTRACT(EPOCH FROM (t.arrived_at - t.accepted_at)) / 60 AS arrival_min
       FROM trips t
       LEFT JOIN users u ON u.id = t.caller_id
       LEFT JOIN drivers d ON ${DRIVER_JOIN}
       LEFT JOIN users du ON du.id = d.user_id
       LEFT JOIN LATERAL (
         SELECT hh.name FROM hospitals hh
         WHERE t.dropoff_lat IS NOT NULL AND t.dropoff_lng IS NOT NULL
         ORDER BY (hh.lat - t.dropoff_lat)^2 + (hh.lng - t.dropoff_lng)^2
         LIMIT 1
       ) h ON true
       ORDER BY t.requested_at DESC
       LIMIT 200`
    );
    res.json(
      result.rows.map((r) => ({
        ...r,
        accept_min: round1(r.accept_min),
        arrival_min: round1(r.arrival_min),
      }))
    );
  } catch (err) {
    console.error("Admin history error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
}

// GET /api/admin/fleet
async function getFleet(req, res) {
  try {
    const result = await pool.query(
      `SELECT d.id, d.vehicle_number, u.name AS driver_name, u.phone AS driver_phone,
              d.vehicle_type::text AS type, d.is_available, d.current_lat, d.current_lng,
              EXISTS (
                SELECT 1 FROM trips t
                WHERE ${DRIVER_JOIN}
                  AND t.accepted_at IS NOT NULL
                  AND t.completed_at IS NULL
                  AND t.status::text <> 'cancelled'
              ) AS on_trip
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       ORDER BY d.id`
    );
    res.json(
      result.rows.map((r) => ({
        id: String(r.id),
        code: r.vehicle_number || `DRV-${r.id}`,
        driver_name: r.driver_name,
        driver_phone: r.driver_phone,
        type: TYPE_LABELS[(r.type || "").toLowerCase()] || cap(r.type) || "N/A",
        status: r.on_trip ? "busy" : r.is_available ? "available" : "offline",
        current_location:
          r.current_lat != null && r.current_lng != null
            ? `${Number(r.current_lat).toFixed(4)}, ${Number(r.current_lng).toFixed(4)}`
            : "Location unavailable",
      }))
    );
  } catch (err) {
    console.error("Admin fleet error:", err);
    res.status(500).json({ error: "Failed to load fleet" });
  }
}

// POST /api/admin/fleet  -> assign a vehicle code to an already-registered driver
async function addVehicle(req, res) {
  try {
    const { code, driver_phone } = req.body;
    if (!code || !driver_phone) {
      return res.status(400).json({ error: "Vehicle code and driver phone are required" });
    }
    const found = await pool.query(
      `SELECT d.id FROM drivers d JOIN users u ON u.id = d.user_id WHERE u.phone = $1`,
      [driver_phone.trim()]
    );
    if (found.rows.length === 0) {
      return res.status(404).json({
        error: "No registered driver with this phone. Ask the driver to sign up in the driver app first.",
      });
    }
    await pool.query("UPDATE drivers SET vehicle_number = $1 WHERE id = $2", [
      code.trim(),
      found.rows[0].id,
    ]);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Admin add vehicle error:", err);
    res.status(500).json({ error: "Failed to add vehicle" });
  }
}

// GET /api/admin/analytics  (all real data)
async function getAnalytics(req, res) {
  try {
    const [summary, resp, weekly, hourly, specialties] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status::text = 'completed')::int AS completed,
                COUNT(*) FILTER (WHERE status::text = 'cancelled')::int AS cancelled,
                (SELECT COALESCE(SUM(price_charged), 0) FROM trip_prices)::float AS fares_total,
                (SELECT COUNT(*) FROM trip_prices)::int AS fares_count
         FROM trips`
      ),
      responseStats(),
      pool.query(
        `SELECT COUNT(*) FILTER (WHERE requested_at >= NOW() - interval '7 days')::int AS this_week,
                COUNT(*) FILTER (WHERE requested_at >= NOW() - interval '14 days'
                                   AND requested_at <  NOW() - interval '7 days')::int AS last_week
         FROM trips`
      ),
      pool.query(
        `SELECT g.hr, COUNT(t.id)::int AS trips
         FROM generate_series(0, 23) AS g(hr)
         LEFT JOIN trips t
           ON EXTRACT(HOUR FROM t.requested_at AT TIME ZONE 'UTC' AT TIME ZONE '${TZ}')::int = g.hr
         GROUP BY g.hr ORDER BY g.hr`
      ),
      pool.query(
        `SELECT tag::text AS tag, COUNT(*)::int AS count
         FROM hospitals, unnest(specialty_tags) AS tag
         GROUP BY tag ORDER BY count DESC, tag`
      ),
    ]);

    const s = summary.rows[0];
    const w = weekly.rows[0];
    const peak = hourly.rows.reduce((best, r) => (r.trips > (best?.trips ?? 0) ? r : best), null);

    res.json({
      summary: {
        total: s.total,
        completed: s.completed,
        cancelled: s.cancelled,
        completionRate: s.total ? round1((s.completed / s.total) * 100) : null,
        cancellationRate: s.total ? round1((s.cancelled / s.total) * 100) : null,
        faresTotal: s.fares_total,
        avgFare: s.fares_count ? round1(s.fares_total / s.fares_count) : null,
        ...resp,
      },
      weekly: {
        thisWeek: w.this_week,
        lastWeek: w.last_week,
        changePct: w.last_week > 0 ? Math.round(((w.this_week - w.last_week) / w.last_week) * 100) : null,
      },
      peakHours: peak ? fmtHour(peak.hr) : null,
      hourly: hourly.rows,
      hospitalsBySpecialty: specialties.rows,
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
}

// ----- Reports -----
async function reportRows(startDate, endDate, cat, limit) {
  const result = await pool.query(
    `SELECT 'REQ-' || t.id::text AS id,
            to_char(t.requested_at AT TIME ZONE 'UTC' AT TIME ZONE '${TZ}', 'YYYY-MM-DD') AS date,
            COALESCE(u.name, 'N/A') AS patient,
            COALESCE(du.name, 'N/A') AS driver,
            COALESCE(h.name, 'N/A') AS hospital,
            COALESCE(ROUND((EXTRACT(EPOCH FROM (t.accepted_at - t.requested_at)) / 60)::numeric, 1)::text || ' mins', 'N/A') AS "acceptTime",
            COALESCE(ROUND((EXTRACT(EPOCH FROM (t.arrived_at - t.accepted_at)) / 60)::numeric, 1)::text || ' mins', 'N/A') AS "arrivalTime",
            t.status::text AS status,
            COUNT(*) OVER()::int AS total_rows
     FROM trips t
     LEFT JOIN users u ON u.id = t.caller_id
     LEFT JOIN drivers d ON ${DRIVER_JOIN}
     LEFT JOIN users du ON du.id = d.user_id
     LEFT JOIN LATERAL (
       SELECT hh.name FROM hospitals hh
       WHERE t.dropoff_lat IS NOT NULL AND t.dropoff_lng IS NOT NULL
       ORDER BY (hh.lat - t.dropoff_lat)^2 + (hh.lng - t.dropoff_lng)^2
       LIMIT 1
     ) h ON true
     WHERE t.requested_at >= $1::date
       AND t.requested_at < ($2::date + 1)
       AND ($3::text = 'all' OR t.status::text = $3::text)
     ORDER BY t.requested_at DESC
     LIMIT $4::int`,
    [startDate, endDate, cat, limit]
  );
  return result.rows;
}

function parseReportQuery(req, res) {
  const { startDate, endDate, category = "all" } = req.query;
  const dateOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");
  if (!dateOk(startDate) || !dateOk(endDate)) {
    res.status(400).json({ error: "Valid startDate and endDate (YYYY-MM-DD) are required" });
    return null;
  }
  return {
    startDate,
    endDate,
    cat: ["all", "completed", "cancelled"].includes(category) ? category : "all",
  };
}

// GET /api/admin/reports/preview?startDate=&endDate=&category=
async function previewReport(req, res) {
  try {
    const q = parseReportQuery(req, res);
    if (!q) return;
    const rows = await reportRows(q.startDate, q.endDate, q.cat, 15);
    res.json({
      total: rows.length ? rows[0].total_rows : 0,
      rows: rows.map(({ total_rows, ...r }) => r),
    });
  } catch (err) {
    console.error("Admin report preview error:", err);
    res.status(500).json({ error: "Failed to load preview" });
  }
}

// GET /api/admin/reports/download?startDate=&endDate=&category=&format=csv|json
async function downloadReport(req, res) {
  try {
    const q = parseReportQuery(req, res);
    if (!q) return;
    const rows = (await reportRows(q.startDate, q.endDate, q.cat, 50000)).map(
      ({ total_rows, ...r }) => r
    );

    if (req.query.format === "json") {
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(rows, null, 2));
    }

    const headers = ["id", "date", "patient", "driver", "hospital", "acceptTime", "arrivalTime", "status"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.send(csv);
  } catch (err) {
    console.error("Admin report error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
}

// ----- Settings (stored as one JSON row; created automatically) -----
const SETTINGS_KEY = "admin";
let settingsTableReady = false;

async function ensureSettingsTable() {
  if (settingsTableReady) return;
  await pool.query(
    `CREATE TABLE IF NOT EXISTS app_settings (
       key TEXT PRIMARY KEY,
       value JSONB NOT NULL,
       updated_at TIMESTAMP DEFAULT NOW()
     )`
  );
  settingsTableReady = true;
}

// GET /api/admin/settings
async function getSettings(req, res) {
  try {
    await ensureSettingsTable();
    const r = await pool.query("SELECT value FROM app_settings WHERE key = $1", [SETTINGS_KEY]);
    res.json(r.rows[0]?.value || {});
  } catch (err) {
    console.error("Admin get settings error:", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
}

// PUT /api/admin/settings
async function saveSettings(req, res) {
  try {
    const b = req.body || {};
    const radius = Number(b.searchRadiusKm);
    if (!b.orgName || !String(b.orgName).trim()) {
      return res.status(400).json({ error: "Organization name is required" });
    }
    if (!Number.isFinite(radius) || radius < 1 || radius > 50) {
      return res.status(400).json({ error: "Search radius must be between 1 and 50 km" });
    }
    const clean = {
      orgName: String(b.orgName).trim().slice(0, 120),
      supportPhone: String(b.supportPhone || "").trim().slice(0, 30),
      supportEmail: String(b.supportEmail || "").trim().slice(0, 120),
      searchRadiusKm: radius,
      autoAssign: !!b.autoAssign,
      smsAlerts: !!b.smsAlerts,
      emailAlerts: !!b.emailAlerts,
    };
    await ensureSettingsTable();
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [SETTINGS_KEY, JSON.stringify(clean)]
    );
    res.json(clean);
  } catch (err) {
    console.error("Admin save settings error:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
}

module.exports = {
  getStats,
  getDriverPerformance,
  getHistory,
  getFleet,
  addVehicle,
  getAnalytics,
  previewReport,
  downloadReport,
  getSettings,
  saveSettings,
};