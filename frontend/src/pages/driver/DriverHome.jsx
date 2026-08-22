import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import LiveMap from "../../components/LiveMap";
import {
  Ambulance,
  PhoneCall,
  Headset,
  History as HistoryIcon,
  Home,
  Bot,
  Wallet,
  User,
} from "lucide-react";

export default function DriverHome() {
  const [available, setAvailable] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState({ today_earnings: 0, completed_rides: 0 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  useEffect(() => {
    api.get("/trips/earnings/mine").then((res) => setEarnings(res.data)).catch(() => {});
  }, []);

  async function toggleAvailability() {
    const next = !available;
    setAvailable(next);
    try {
      await api.patch("/drivers/availability", { is_available: next });
    } catch (err) {
      setAvailable(!next);
      setError("Could not update status");
    }
  }

  async function fetchRequests() {
    if (!available) return;
    setLoading(true);
    try {
      const { data } = await api.get("/trips/available");
      setRequests(data);
    } catch (err) {
      setError("Could not fetch requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 8000);
    return () => clearInterval(interval);
  }, [available]);

  async function handleAccept(tripId) {
    try {
      await api.patch(`/trips/${tripId}/accept`);
      navigate(`/driver/trip/${tripId}`);
    } catch (err) {
      setError("Trip already taken or failed to accept");
      fetchRequests();
    }
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-24 max-w-md mx-auto md:max-w-lg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-nirvaan-bg">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <button className="bg-nirvaan-primary text-white text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4" /> Call Help
        </button>
      </header>

      {/* Status toggle */}
      <div className="mx-4 mt-2 bg-nirvaan-surface rounded-xl p-4 flex items-center justify-between border border-nirvaan-surface-high">
        <div>
          <p className="text-sm text-nirvaan-outline font-semibold">Driver Status</p>
          <p className={`font-extrabold text-lg ${available ? "text-nirvaan-success" : "text-nirvaan-outline"}`}>
            {available ? "Online & Available" : "Offline"}
          </p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`w-14 h-8 rounded-full flex items-center px-1 transition ${
            available ? "bg-nirvaan-success justify-end" : "bg-nirvaan-outline-variant justify-start"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white shadow" />
        </button>
      </div>

      {/* Live map */}
      <div className="mx-4 mt-4">
        <LiveMap userLocation={myLocation} height="160px" zoom={13} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
          <p className="text-xs text-nirvaan-outline font-semibold">Today's Earnings</p>
          <p className="text-xl font-extrabold text-nirvaan-primary mt-1">₹{earnings.today_earnings.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
          <p className="text-xs text-nirvaan-outline font-semibold">Completed</p>
          <p className="text-xl font-extrabold text-nirvaan-secondary mt-1">{earnings.completed_rides} Rides</p>
        </div>
      </div>

      {error && <p className="text-nirvaan-primary text-sm text-center mt-3 font-medium">{error}</p>}

      {/* Incoming requests */}
      <div className="mx-4 mt-5">
        <h3 className="font-extrabold text-nirvaan-dark mb-2">
          {available ? "Incoming Requests" : "Go online to see requests"}
        </h3>

        {available && loading && <p className="text-sm text-nirvaan-outline">Checking...</p>}
        {available && !loading && requests.length === 0 && (
          <p className="text-sm text-nirvaan-outline">No emergency requests right now.</p>
        )}

        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-nirvaan-surface border-2 border-nirvaan-outline-variant rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-nirvaan-primary font-extrabold text-sm">
                  <Ambulance className="w-4 h-4" /> Emergency Request
                </span>
                <span className="text-xs text-nirvaan-outline font-semibold bg-white px-2 py-1 rounded-full">
                  {new Date(r.requested_at).toLocaleString([], {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-xs text-nirvaan-outline font-semibold">PICKUP LOCATION</p>
              <p className="font-bold text-nirvaan-dark mb-3">
                {r.pickup_address || `${r.pickup_lat.toFixed(4)}, ${r.pickup_lng.toFixed(4)}`}
              </p>

              <div className="flex items-center gap-2 mb-3 pt-2 border-t border-white/50">
                <User className="w-4 h-4 text-nirvaan-outline" />
                <div>
                  <p className="text-sm font-bold text-nirvaan-dark">{r.caller_name || "Patient"}</p>
                  {r.caller_phone && <p className="text-xs text-nirvaan-outline">{r.caller_phone}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRequests((prev) => prev.filter((req) => req.id !== r.id))}
                  className="flex-1 border-2 border-nirvaan-primary text-nirvaan-primary py-2.5 rounded-lg font-bold"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(r.id)}
                  className="flex-1 bg-nirvaan-success text-white py-2.5 rounded-lg font-bold"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift history + support */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-5">
        <Link to="/driver/history" className="bg-white rounded-xl p-4 text-center shadow-sm border border-nirvaan-surface-high">
          <p className="text-nirvaan-dark font-bold flex flex-col items-center gap-1">
            <HistoryIcon className="w-5 h-5" /> Shift History
          </p>
        </Link>
        <button className="bg-white rounded-xl p-4 text-center shadow-sm border border-nirvaan-surface-high">
          <p className="text-nirvaan-dark font-bold flex flex-col items-center gap-1">
            <Headset className="w-5 h-5" /> Support
          </p>
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/driver" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold">
          <span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><Home className="w-4 h-4" /></span>Home
        </Link>
        <Link to="/driver/earnings" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Wallet className="w-5 h-5" /></span>Earnings
        </Link>
        <Link to="/driver/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>Assistant
        </Link>
        <Link to="/driver/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>Profile
        </Link>
      </nav>
    </div>
  );
}