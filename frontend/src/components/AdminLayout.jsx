import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Ambulance,
  LayoutDashboard,
  Users,
  History,
  Truck,
  Hospital,
  BarChart3,
  FileSpreadsheet,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: History, label: "History", href: "/admin/history" },
  { icon: Truck, label: "Fleet", href: "/admin/fleet" },
  { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: FileSpreadsheet, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

// Hides the scrollbar without needing a custom CSS class
const HIDE_SCROLLBAR = "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

// THE ONLY place in the app that renders the admin header / sidebar.
// Admin pages must render page content only.
export default function AdminLayout() {
  const { pathname } = useLocation();

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col md:flex-row">
      {/* Mobile top navigation */}
      <header className="sticky top-0 z-20 bg-white border-b border-nirvaan-surface-high px-4 pt-4 pb-3 flex flex-col gap-3 md:hidden">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap ${HIDE_SCROLLBAR}`}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                isActive(item.href)
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

      {/* Desktop sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive(item.href)
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

      {/* Page content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}