// frontend/src/pages/admin/History.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  History as HistoryIcon,
  Truck,
  Hospital,
  BarChart3,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fallback mock history data if API is not populated yet
  const mockHistory = [
    {
      id: "REQ-9041",
      patient_name: "Rahul Sharma",
      contact: "+91 98230 11223",
      pickup_address: "Kothrud, Pune",
      hospital_name: "Sassoon Hospital",
      ambulance_code: "AMB-102",
      status: "completed",
      created_at: "2026-09-28T14:30:00Z",
    },
    {
      id: "REQ-9040",
      patient_name: "Ananya Deshmukh",
      contact: "+91 91580 44321",
      pickup_address: "Viman Nagar, Pune",
      hospital_name: "Sahyadri Hospital",
      ambulance_code: "AMB-105",
      status: "completed",
      created_at: "2026-09-28T12:15:00Z",
    },
    {
      id: "REQ-9039",
      patient_name: "Suresh Patil",
      contact: "+91 97654 88990",
      pickup_address: "Hadapsar, Pune",
      hospital_name: "Noble Hospital",
      ambulance_code: "AMB-101",
      status: "cancelled",
      created_at: "2026-09-28T10:05:00Z",
    },
    {
      id: "REQ-9038",
      patient_name: "Priya Kulkarni",
      contact: "+91 94220 55667",
      pickup_address: "Shivajinagar, Pune",
      hospital_name: "Ruby Hall Clinic",
      ambulance_code: "AMB-108",
      status: "completed",
      created_at: "2026-09-27T18:45:00Z",
    },
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/history");
      setHistory(data.length > 0 ? data : mockHistory);
    } catch (err) {
      console.log("Using fallback history data:", err);
      setHistory(mockHistory);
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.patient_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pickup_address || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || item.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: HistoryIcon, label: "History", href: "/admin/history", active: true },
    { icon: Truck, label: "Fleet", href: "/admin/fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-nirvaan-bg flex">
      {/* Sidebar Navigation */}
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
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-6xl overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">
              Dispatch History Logs
            </h2>
            <p className="text-sm text-nirvaan-outline">
              Review completed and past emergency dispatch records across your network.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="p-2 bg-white border border-nirvaan-surface-high rounded-lg text-nirvaan-dark hover:bg-nirvaan-surface transition-colors"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-nirvaan-surface-high shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, patient, or pickup area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-nirvaan-outline-variant rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {["all", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-nirvaan-secondary text-white"
                    : "bg-nirvaan-surface text-nirvaan-dark hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* History Records Table / Cards */}
        <div className="bg-white rounded-xl border border-nirvaan-surface-high shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-xs text-nirvaan-outline text-center">Loading dispatch logs...</p>
          ) : filteredHistory.length === 0 ? (
            <p className="p-6 text-xs text-nirvaan-outline text-center">
              No history logs found matching your filter criteria.
            </p>
          ) : (
            <div className="divide-y divide-nirvaan-surface-high">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-nirvaan-primary">{item.id}</span>
                      <span className="text-xs font-bold text-nirvaan-dark">{item.patient_name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ({new Date(item.created_at).toLocaleString()})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-nirvaan-outline">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.pickup_address}
                      </span>
                      {item.contact && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {item.contact}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-nirvaan-dark font-medium">
                      Hospital: <span className="text-nirvaan-secondary font-semibold">{item.hospital_name || "N/A"}</span> • Unit: <span className="font-mono text-xs">{item.ambulance_code || "N/A"}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.status?.toLowerCase() === "completed" ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : item.status?.toLowerCase() === "cancelled" ? (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" /> {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}