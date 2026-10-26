import { useEffect, useState } from "react";
import api from "../../api/client";
import DriverPerformanceTable from "../../components/admin/DriverPerformanceTable";

const REFRESH_MS = 30000; // refresh every 30 seconds

const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Requested: "bg-amber-100 text-amber-700",
  Accepted: "bg-blue-100 text-blue-700",
};

const mins = (m) => (m == null ? "N/A" : `${m} min`);

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-nirvaan-surface-high p-4">
      <p className="text-[11px] font-semibold text-nirvaan-outline uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-nirvaan-dark mt-1">{value}</p>
      {sub && <p className="text-[11px] text-nirvaan-outline mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let on = true;

    const load = () =>
      api
        .get("/admin/stats")
        .then(({ data }) => {
          if (!on) return;
          setStats(data.stats || null);
          setTrend(data.trend || []);
          setRecent(data.recentTrips || []);
          setError("");
        })
        .catch(() => {
          if (on) setError("Could not load dashboard data. The server may be waking up; it will retry shortly.");
        })
        .finally(() => {
          if (on) setLoading(false);
        });

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      on = false;
      clearInterval(timer);
    };
  }, []);

  const maxTrips = Math.max(1, ...trend.map((d) => d.trips));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-nirvaan-dark">Dashboard</h2>
        <p className="text-xs text-nirvaan-outline mt-1">Live overview. Refreshes every 30 seconds.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold px-3 py-2">
          {error}
        </div>
      )}

      {loading && !stats && (
        <p className="text-sm text-nirvaan-outline">Loading dashboard...</p>
      )}

      {stats && (
        <>
          {stats.totalTrips === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-2">
              No trips have been booked yet. These numbers are real and will fill in as patients request
              ambulances.
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total trips" value={stats.totalTrips} sub={`${stats.completedTrips} completed`} />
            <StatCard label="Trips today" value={stats.tripsToday} />
            <StatCard label="In progress" value={stats.inProgress} sub={`${stats.openRequests} waiting for a driver`} />
            <StatCard
              label="Drivers online"
              value={`${stats.onlineDrivers} / ${stats.totalDrivers}`}
              sub={`${stats.patients} registered patients`}
            />
            <StatCard
              label="Avg time to accept"
              value={mins(stats.avgAcceptMinutes)}
              sub={`${stats.acceptSamples} trips measured`}
            />
            <StatCard
              label="Avg time to arrive"
              value={mins(stats.avgArrivalMinutes)}
              sub={`${stats.arrivalSamples} trips measured`}
            />
            <StatCard label="Cancelled" value={stats.cancelledTrips} />
            <StatCard label="Fares recorded" value={`Rs ${Math.round(stats.faresTotal || 0)}`} />
          </div>

          <div className="bg-white rounded-xl border border-nirvaan-surface-high p-4">
            <h3 className="text-sm font-bold text-nirvaan-dark mb-4">Trips in the last 7 days</h3>
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {trend.map((d) => (
                <div key={d.label} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full">
                  <span className="text-[10px] font-bold text-nirvaan-dark mb-1">{d.trips}</span>
                  <div
                    className="w-full rounded-t bg-nirvaan-secondary"
                    style={{
                      height: Math.round((d.trips / maxTrips) * 90),
                      minHeight: d.trips > 0 ? 4 : 2,
                      opacity: d.trips > 0 ? 1 : 0.25,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {trend.map((d) => (
                <span key={d.label} className="flex-1 min-w-0 text-center text-[10px] text-nirvaan-outline truncate">
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nirvaan-surface-high p-4">
            <h3 className="text-sm font-bold text-nirvaan-dark mb-3">Recent trips</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-nirvaan-surface-high text-nirvaan-outline font-semibold">
                    <th className="pb-2 px-2">Trip</th>
                    <th className="pb-2 px-2">Patient</th>
                    <th className="pb-2 px-2">Driver</th>
                    <th className="pb-2 px-2">Status</th>
                    <th className="pb-2 px-2">Requested</th>
                    <th className="pb-2 px-2">Accept</th>
                    <th className="pb-2 px-2">Arrive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nirvaan-surface-high font-medium">
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-nirvaan-outline">
                        No trips yet.
                      </td>
                    </tr>
                  )}
                  {recent.map((t) => (
                    <tr key={t.id} className="hover:bg-nirvaan-surface">
                      <td className="py-2.5 px-2 font-bold text-nirvaan-dark">REQ-{t.id}</td>
                      <td className="py-2.5 px-2">{t.patient}</td>
                      <td className="py-2.5 px-2">
                        {t.driver || "Not assigned"}
                        {t.vehicle && <span className="text-nirvaan-outline"> ({t.vehicle})</span>}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            STATUS_STYLES[t.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">{t.date}</td>
                      <td className="py-2.5 px-2">{mins(t.acceptMinutes)}</td>
                      <td className="py-2.5 px-2">{mins(t.arrivalMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-nirvaan-surface-high p-4">
            <h3 className="text-sm font-bold text-nirvaan-dark mb-3">Driver response times</h3>
            <DriverPerformanceTable limit={5} showRange={false} />
          </div>
        </>
      )}
    </div>
  );
}