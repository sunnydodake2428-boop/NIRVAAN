import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  Users,
  History,
  Truck,
  Hospital,
  BarChart3,
  Settings,
  Download,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeDrivers: 0,
    avgResponseTime: "0.0 mins",
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      try {
        const { data } = await api.get("/admin/stats");
        if (isMounted && data) {
          setStats({
            totalTrips: data.stats?.totalTrips ?? 0,
            activeDrivers: data.stats?.activeDrivers ?? 0,
            avgResponseTime: data.stats?.avgResponseTime || "0.0 mins",
          });
          setRecentTrips(data.recentTrips || []);
        }
      } catch (err) {
        console.warn("Could not load dashboard API stats, using fallback state:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownloadReport = () => {
    if (recentTrips.length === 0) {
      alert("No trip data available to export.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Patient,Status,Requested,ResponseTime\n";
    recentTrips.forEach((t) => {
      csvContent += `${t.patient || "N/A"},${t.status || "Completed"},${t.date || "N/A"},${t.time || "0 min"}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nirvaan_operations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: History, label: "History", href: "/admin/history" },
    { icon: Truck, label: "Fleet", href: "/admin/fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col md:flex-row">
      {/* Mobile Top Scrollable Navigation Header */}
      <header className="bg-white border-b border-nirvaan-surface-high p-4 flex flex-col gap-3 md:hidden">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                item.active
                  ? "bg-nirvaan-secondary text-white"
                  : "bg-white text-nirvaan-dark border border-nirvaan-surface-high hover:bg-nirvaan-surface"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col shrink-0">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                item.active
                  ? "bg-nirvaan-secondary text-white"
                  : "text-nirvaan-dark hover:bg-nirvaan-surface"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Panel */}
      <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-nirvaan-dark">Operations Overview</h2>
            <p className="text-xs md:text-sm text-nirvaan-outline">Real-time emergency response tracking and analytics.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-white border border-nirvaan-outline-variant rounded-lg text-xs font-bold text-nirvaan-dark hover:bg-nirvaan-surface flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Report
            </button>
            <button
              onClick={() => navigate("/admin/hospitals")}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-nirvaan-secondary rounded-lg text-xs font-bold text-white hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hospital
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
            <p className="text-xs font-semibold text-nirvaan-outline mb-1">Total Trips</p>
            <p className="text-3xl font-extrabold text-nirvaan-dark">{stats.totalTrips}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
            <p className="text-xs font-semibold text-nirvaan-outline mb-1">Active Drivers</p>
            <p className="text-3xl font-extrabold text-nirvaan-success">{stats.activeDrivers}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
            <p className="text-xs font-semibold text-nirvaan-outline mb-1">Avg Response Time</p>
            <p className="text-3xl font-extrabold text-nirvaan-dark">{stats.avgResponseTime}</p>
          </div>
        </div>

        {/* Recent Trips Table */}
        <div className="bg-white rounded-xl border border-nirvaan-surface-high p-5 shadow-sm">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-4">Recent Trips</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-nirvaan-surface-high text-nirvaan-outline font-semibold">
                  <th className="pb-3 px-2">Patient</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Requested</th>
                  <th className="pb-3 px-2">Driver Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nirvaan-surface-high font-medium">
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-nirvaan-outline">
                      Loading trip statistics...
                    </td>
                  </tr>
                )}
                {!loading && recentTrips.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-nirvaan-outline">
                      No recent trips recorded.
                    </td>
                  </tr>
                )}
                {!loading &&
                  recentTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-nirvaan-surface">
                      <td className="py-3 px-2 font-bold text-nirvaan-dark">{trip.patient || "N/A"}</td>
                      <td className="py-3 px-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-nirvaan-secondary">
                          {trip.status || "Completed"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-nirvaan-outline">{trip.date || "N/A"}</td>
                      <td className="py-3 px-2 font-bold text-nirvaan-dark">{trip.time || "0 min"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}