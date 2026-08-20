import { useNavigate, Link } from "react-router-dom";
import {
  Ambulance,
  PhoneCall,
  User,
  FileEdit,
  Truck,
  BadgeCheck,
  Settings,
  ChevronRight,
  Home,
  Wallet,
  Bot,
} from "lucide-react";

export default function DriverProfile() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  const options = [
  { icon: FileEdit, label: "Edit Profile", link: "/driver/edit-profile" },
  { icon: Truck, label: "Vehicle Details", link: "/driver/vehicle" },
  { icon: BadgeCheck, label: "Verification Status" },
  { icon: Settings, label: "Settings" },
];

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-24 max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center justify-between px-4 py-4 bg-nirvaan-bg">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <button className="bg-nirvaan-primary text-white text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4" /> Call Help
        </button>
      </header>

      <div className="px-4 pt-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-nirvaan-surface-highest flex items-center justify-center mb-3 border-2 border-white shadow-sm">
            <Ambulance className="w-11 h-11 text-nirvaan-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-nirvaan-dark">Driver Account</h2>
          <p className="text-sm text-nirvaan-success font-semibold mt-1 flex items-center gap-1">
            <BadgeCheck className="w-4 h-4" /> Verified
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-nirvaan-surface-high divide-y divide-nirvaan-surface-high overflow-hidden">
          {options.map((opt) =>
            opt.link ? (
              <Link key={opt.label} to={opt.link} className="w-full flex items-center justify-between px-4 py-4 text-left">
                <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
                  <opt.icon className="w-4 h-4 text-nirvaan-secondary" /> {opt.label}
                </span>
                <ChevronRight className="w-4 h-4 text-nirvaan-outline" />
              </Link>
            ) : (
              <button key={opt.label} className="w-full flex items-center justify-between px-4 py-4 text-left">
                <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
                  <opt.icon className="w-4 h-4 text-nirvaan-secondary" /> {opt.label}
                </span>
                <ChevronRight className="w-4 h-4 text-nirvaan-outline" />
              </button>
            )
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 border-2 border-nirvaan-primary text-nirvaan-primary py-3.5 rounded-lg font-bold"
        >
          Log Out
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/driver" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home</Link>
        <Link to="/driver/earnings" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Wallet className="w-5 h-5" /></span>Earnings</Link>
        <Link to="/driver/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>Assistant</Link>
        <Link to="/driver/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold"><span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><User className="w-4 h-4" /></span>Profile</Link>
      </nav>
    </div>
  );
}