import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  History,
  Truck,
  Hospital,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Users,
  Mail,
  Phone,
} from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    api
      .get("/auth/users")
      .then((res) => {
        if (isMounted) setUsers(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch admin users:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users", active: true },
    { icon: History, label: "History", href: "/admin/history" },
    { icon: Truck, label: "Fleet", href: "/admin/fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: FileSpreadsheet, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleDateString();
  };

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

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">Registered Users</h2>
        <p className="text-sm text-nirvaan-outline mb-6">All patients and drivers registered on the platform.</p>

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
            <p className="text-xs text-nirvaan-outline font-semibold">Total Users</p>
            <p className="text-3xl font-extrabold text-nirvaan-dark mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
            <p className="text-xs text-nirvaan-outline font-semibold">Patients</p>
            <p className="text-3xl font-extrabold text-nirvaan-secondary mt-1">
              {users.filter((u) => u.role === "caller").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
            <p className="text-xs text-nirvaan-outline font-semibold">Drivers</p>
            <p className="text-3xl font-extrabold text-nirvaan-success mt-1">
              {users.filter((u) => u.role === "driver").length}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {["all", "caller", "driver", "admin"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-nirvaan-secondary text-white"
                  : "bg-white border border-nirvaan-outline-variant text-nirvaan-dark hover:bg-nirvaan-surface"
              }`}
            >
              {f === "all" ? "All" : f === "caller" ? "Patients" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-nirvaan-surface-high overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-nirvaan-outline border-b border-nirvaan-surface-high bg-nirvaan-surface">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Signup Method</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-nirvaan-outline">
                      Loading registered users...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-nirvaan-outline">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((u) => (
                    <tr key={u.id} className="border-b border-nirvaan-surface-high last:border-0 hover:bg-nirvaan-surface">
                      <td className="px-4 py-3 text-nirvaan-outline">#{u.id}</td>
                      <td className="px-4 py-3 font-bold text-nirvaan-dark">{u.name || "N/A"}</td>
                      <td className="px-4 py-3 text-nirvaan-outline">
                        <div className="flex items-center gap-1.5">
                          {u.signup_method === "Google" ? (
                            <Mail className="w-3.5 h-3.5 text-nirvaan-primary shrink-0" />
                          ) : (
                            <Phone className="w-3.5 h-3.5 text-nirvaan-success shrink-0" />
                          )}
                          <span>{u.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-nirvaan-surface text-nirvaan-secondary capitalize">
                          {u.role === "caller" ? "Patient" : u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            u.signup_method === "Google"
                              ? "bg-red-50 text-nirvaan-primary"
                              : "bg-green-50 text-nirvaan-success"
                          }`}
                        >
                          {u.signup_method || "Phone"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nirvaan-outline">{formatDate(u.created_at)}</td>
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