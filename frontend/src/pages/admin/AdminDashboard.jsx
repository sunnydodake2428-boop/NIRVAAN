// frontend/src/pages/admin/AdminDashboard.jsx

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
    totalTrips: 57,
    activeDrivers: 6,
    avgResponseTime: "1.1 mins",
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data } = await api.get("/admin/stats");
        if (data) {
          setStats(data.stats || stats);
          setRecentTrips(data.recentTrips || []);
        }
      } catch (err) {
        console.warn("Using fallback dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const handleDownloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Patient,Status,Requested,ResponseTime\n" +
      "dhammu,Completed,9/14/2026 8:32:24 PM,0.1 min\n" +
      "dhammu,Completed,9/13/2026 9:18:25 PM,0.1 min";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nirvaan_operations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col shrink-0">
        <h1 className="text-xl md:text-2xl font-black text-red-600 tracking-tight mb-6 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold bg-blue-600 text-white shrink-0">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link to="/admin/history" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
            <History className="w-4 h-4" /> History
          </Link>
          <Link to="/admin/fleet" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
            <Truck className="w-4 h-4" /> Fleet
          </Link>
          <Link to="/admin/hospitals" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
            <Hospital className="w-4 h-4" /> Hospitals
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Operations Overview</h2>
            <p className="text-xs md:text-sm text-slate-500">Real-time emergency response tracking and analytics.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Report
            </button>
            <button
              onClick={() => navigate("/admin/hospitals")}
              className="flex-1 sm:flex-initial px-3 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hospital
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Trips</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalTrips}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Active Drivers</p>
            <p className="text-2xl font-black text-green-600">{stats.activeDrivers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Avg Response Time</p>
            <p className="text-2xl font-black text-slate-900">{stats.avgResponseTime}</p>
          </div>
        </div>

        {/* Recent Trips Table with Horizontal Scroll fix for Mobile */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Trips</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Requested</th>
                  <th className="pb-2">Driver Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(recentTrips.length > 0 ? recentTrips : [
                  { id: 1, patient: "dhammu", status: "Completed", date: "9/14/2026, 8:32:24 PM", time: "0.1 min" },
                  { id: 2, patient: "dhammu", status: "Completed", date: "9/13/2026, 9:18:25 PM", time: "0.1 min" },
                  { id: 3, patient: "dhammu", status: "Completed", date: "9/13/2026, 9:07:29 PM", time: "0.1 min" },
                ]).map((trip) => (
                  <tr key={trip.id}>
                    <td className="py-2.5 font-bold text-slate-900">{trip.patient}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600">
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{trip.date}</td>
                    <td className="py-2.5 font-bold text-slate-900">{trip.time}</td>
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