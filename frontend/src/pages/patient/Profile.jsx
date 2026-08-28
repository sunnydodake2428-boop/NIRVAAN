import { useNavigate, Link } from "react-router-dom";
import {
  Ambulance,
  PhoneCall,
  User,
  FileEdit,
  Phone,
  CreditCard,
  Settings,
  ChevronRight,
  Home,
  Bot,
  History,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/client";

export default function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }
  const [profile, setProfile] = useState(null);

useEffect(() => {
  api.get("/auth/me").then((res) => setProfile(res.data)).catch(() => {});
}, []);

  const options = [
    { icon: FileEdit, label: "Edit Profile", link: "/patient/edit-profile" },
    { icon: Phone, label: "Emergency Contacts", link: "/patient/emergency-contacts" },
    { icon: CreditCard, label: "Payment History", link: "/patient/payments" },
    { icon: Settings, label: "Settings", link: "/patient/settings" },
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
         <div className="w-24 h-24 rounded-full bg-nirvaan-surface-highest flex items-center justify-center mb-3 border-2 border-white shadow-sm overflow-hidden">
  {profile?.avatar_url ? (
    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
  ) : (
    <User className="w-11 h-11 text-nirvaan-secondary" />
  )}
</div>
<h2 className="text-xl font-extrabold text-nirvaan-dark">{profile?.name || "Patient Account"}</h2>
<p className="text-sm text-nirvaan-outline font-medium">
  {profile?.phone?.includes("@") ? profile.phone : "Patient"}
</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-nirvaan-surface-high divide-y divide-nirvaan-surface-high overflow-hidden">
          {options.map((opt) => (
            <Link key={opt.label} to={opt.link} className="w-full flex items-center justify-between px-4 py-4 text-left">
              <span className="text-nirvaan-dark font-semibold flex items-center gap-2.5">
                <opt.icon className="w-4 h-4 text-nirvaan-secondary" /> {opt.label}
              </span>
              <ChevronRight className="w-4 h-4 text-nirvaan-outline" />
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 border-2 border-nirvaan-primary text-nirvaan-primary py-3.5 rounded-lg font-bold"
        >
          Log Out
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home</Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>AI Assistant</Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><History className="w-5 h-5" /></span>History</Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold"><span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><User className="w-4 h-4" /></span>Profile</Link>
      </nav>
    </div>
  );
}