import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { Ambulance, PhoneCall, Home, Wallet, Bot, User } from "lucide-react";

const STATUS_STYLES = {
  requested: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-nirvaan-secondary",
  ongoing: "bg-nirvaan-error-container text-nirvaan-primary",
  completed: "bg-green-100 text-nirvaan-success",
  cancelled: "bg-nirvaan-surface text-nirvaan-outline",
};

export default function DriverHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trips/mine")
      .then((res) => setTrips(res.data))
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
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-4">Shift History</h2>

        {loading && <p className="text-sm text-nirvaan-outline font-medium">Loading...</p>}
        {!loading && trips.length === 0 && (
          <p className="text-sm text-nirvaan-outline">No completed trips yet.</p>
        )}

        <ul className="space-y-3">
          {trips.map((t) => (
            <li key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
              <div className="flex items-center justify-between mb-1 gap-3">
                <p className="font-bold text-nirvaan-dark">{t.pickup_address || "Pickup location"}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[t.status] || "bg-nirvaan-surface text-nirvaan-outline"}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-nirvaan-outline">{new Date(t.requested_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/driver" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home</Link>
        <Link to="/driver/earnings" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Wallet className="w-5 h-5" /></span>Earnings</Link>
        <Link to="/driver/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>Assistant</Link>
        <Link to="/driver/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>Profile</Link>
      </nav>
    </div>
  );
}