import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ambulance,
  PhoneCall,
  ChevronLeft,
  Bell,
  Globe,
  MapPin,
  Shield,
  LogOut,
  Home,
  Bot,
  History,
  User,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-24 max-w-md mx-auto md:max-w-lg">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 bg-nirvaan-bg">
        <button onClick={() => navigate(-1)} className="text-nirvaan-dark">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-nirvaan-dark">Settings</h1>
      </header>

      <div className="px-4">
        {/* Preferences */}
        <p className="text-xs font-bold text-nirvaan-outline uppercase mb-2 mt-2">Preferences</p>
        <div className="bg-white rounded-xl shadow-sm border border-nirvaan-surface-high divide-y divide-nirvaan-surface-high overflow-hidden mb-6">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-nirvaan-secondary" /> Notifications
            </span>
            <button
              onClick={() => setNotifications((v) => !v)}
              className={`w-12 h-7 rounded-full flex items-center px-1 transition ${
                notifications ? "bg-nirvaan-success justify-end" : "bg-nirvaan-outline-variant justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow" />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-nirvaan-secondary" /> Location Sharing
            </span>
            <button
              onClick={() => setLocationSharing((v) => !v)}
              className={`w-12 h-7 rounded-full flex items-center px-1 transition ${
                locationSharing ? "bg-nirvaan-success justify-end" : "bg-nirvaan-outline-variant justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow" />
            </button>
          </div>
          <button className="w-full flex items-center justify-between px-4 py-4 text-left">
            <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-nirvaan-secondary" /> Language
            </span>
            <span className="text-nirvaan-outline text-sm">English</span>
          </button>
        </div>

        {/* Privacy & Security */}
        <p className="text-xs font-bold text-nirvaan-outline uppercase mb-2">Privacy & Security</p>
        <div className="bg-white rounded-xl shadow-sm border border-nirvaan-surface-high divide-y divide-nirvaan-surface-high overflow-hidden mb-6">
          <button className="w-full flex items-center justify-between px-4 py-4 text-left">
            <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-nirvaan-secondary" /> Privacy Policy
            </span>
            <ChevronLeft className="w-4 h-4 text-nirvaan-outline rotate-180" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full border-2 border-nirvaan-primary text-nirvaan-primary py-3.5 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home</Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>AI Assistant</Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><History className="w-5 h-5" /></span>History</Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold"><span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><User className="w-4 h-4" /></span>Profile</Link>
      </nav>
    </div>
  );
}