import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  History,
  Truck,
  Hospital,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/trips/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: History, label: "History" },
    { icon: Truck, label: "Fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-nirvaan-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-2.5 text-nirvaan-dark px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-nirvaan-surface"
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  item.active ? "bg-nirvaan-secondary text-white" : "text-nirvaan-dark"
                }`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </div>
            )
          )}
        </nav>
        <div className="bg-nirvaan-primary text-white rounded-lg p-3 text-xs font-bold mb-3">
          SYSTEM STATUS
          <p className="font-semibold mt-0.5">All Systems Go</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-nirvaan-primary font-bold text-left">
          Log Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-nirvaan-dark">Operations Overview</h2>
            <p className="text-sm text-nirvaan-outline">Real-time emergency response tracking and analytics.</p>
          </div>
          <div className="flex gap-2">
            <button className="border border-nirvaan-outline-variant text-nirvaan-dark px-4 py-2.5 rounded-lg text-sm font-bold bg-white">
              Download Report
            </button>
            <Link
              to="/admin/hospitals"
              className="bg-nirvaan-secondary text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Hospital
            </Link>
          </div>
        </div>

        {loading && <p className="text-sm text-nirvaan-outline font-medium">Loading stats...</p>}

        {!loading && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
                <p className="text-xs text-nirvaan-outline font-semibold">Total Trips</p>
                <p className="text-3xl font-extrabold text-nirvaan-dark mt-1">{stats.total_trips}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
                <p className="text-xs text-nirvaan-outline font-semibold">Active Drivers</p>
                <p className="text-3xl font-extrabold text-nirvaan-success mt-1">{stats.active_drivers}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
                <p className="text-xs text-nirvaan-outline font-semibold">Avg Response Time</p>
<p className="text-3xl font-extrabold text-nirvaan-dark mt-1">
  {stats.avg_response_minutes ? `${stats.avg_response_minutes} mins` : "— mins"}
</p>
{!stats.avg_response_minutes && (
  <p className="text-xs text-nirvaan-outline mt-1">Calculated once enough trip data exists</p>
)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-nirvaan-dark">Recent Trips</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="text-left text-nirvaan-outline border-b border-nirvaan-surface-high">
                      <th className="pb-2 font-semibold">Patient</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_trips.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-nirvaan-outline text-center">
                          No trips yet.
                        </td>
                      </tr>
                    )}
                    {stats.recent_trips.map((t) => (
                      <tr key={t.id} className="border-b border-nirvaan-surface-high last:border-0">
                        <td className="py-3 font-bold text-nirvaan-dark">{t.caller_name}</td>
                        <td className="py-3 capitalize">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-nirvaan-surface text-nirvaan-secondary">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 text-nirvaan-outline">{new Date(t.requested_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}