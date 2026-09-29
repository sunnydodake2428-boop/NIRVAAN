import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { Download, Plus } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-nirvaan-dark">Operations Overview</h2>
          <p className="text-xs md:text-sm text-nirvaan-outline">
            Real-time emergency response tracking and analytics.
          </p>
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
                recentTrips.map((trip, idx) => (
                  <tr key={trip.id || idx} className="hover:bg-nirvaan-surface">
                    <td className="py-3 px-2 font-bold text-nirvaan-dark">
                      {trip.patient || "N/A"}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-nirvaan-secondary">
                        {trip.status || "Completed"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-nirvaan-outline">{trip.date || "N/A"}</td>
                    <td className="py-3 px-2 font-bold text-nirvaan-dark">
                      {trip.time || "0 min"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}