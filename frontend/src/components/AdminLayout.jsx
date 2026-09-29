import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Ambulance,
  LayoutDashboard,
  Users,
  History,
  Truck,
  Hospital,
  BarChart3,
  Settings,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: History, label: "History", href: "/admin/history" },
    { icon: Truck, label: "Fleet", href: "/admin/fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col md:flex-row">
      {/* Mobile Top Horizontal Scrollable Navigation Header */}
      <header className="bg-white border-b border-nirvaan-surface-high p-4 flex flex-col gap-3 md:hidden sticky top-0 z-50">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  active
                    ? "bg-nirvaan-secondary text-white"
                    : "bg-white text-nirvaan-dark border border-nirvaan-surface-high hover:bg-nirvaan-surface"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col shrink-0">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "bg-nirvaan-secondary text-white"
                    : "text-nirvaan-dark hover:bg-nirvaan-surface"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page Content Output */}
      <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}