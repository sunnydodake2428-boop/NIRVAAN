import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { Ambulance, PhoneCall, Home, Wallet, Bot, User } from "lucide-react";

export default function Earnings() {
  const [data, setData] = useState({ total_earnings: 0, completed_rides: 0, today_earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trips/earnings/mine")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-4">Earnings</h2>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-nirvaan-surface-high text-center mb-4">
          <p className="text-sm text-nirvaan-outline font-semibold">Total Earnings</p>
          <p className="text-4xl font-extrabold text-nirvaan-primary mt-1">
            {loading ? "…" : `₹${data.total_earnings.toFixed(2)}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
            <p className="text-xs text-nirvaan-outline font-semibold">Today</p>
            <p className="text-xl font-extrabold text-nirvaan-dark mt-1">
              {loading ? "…" : `₹${data.today_earnings.toFixed(2)}`}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
            <p className="text-xs text-nirvaan-outline font-semibold">Rides Completed</p>
            <p className="text-xl font-extrabold text-nirvaan-dark mt-1">{loading ? "…" : data.completed_rides}</p>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/driver" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home</Link>
        <Link to="/driver/earnings" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold"><span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><Wallet className="w-4 h-4" /></span>Earnings</Link>
        <Link to="/driver/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>Assistant</Link>
        <Link to="/driver/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>Profile</Link>
      </nav>
    </div>
  );
}