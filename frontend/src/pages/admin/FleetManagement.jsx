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
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn("Geolocation warning:", err)
      );
    }
  }, []);

  useEffect(() => {
    api
      .get("/trips/earnings/mine")
      .then((res) => {
        if (res.data) {
          setEarnings({
            today_earnings: res.data.today_earnings || 0,
            completed_rides: res.data.completed_rides || 0,
          });
        }
      })
      .catch(() => {});
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
      setRequests(data || []);
    } catch (err) {
      setError("Could not fetch requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
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
    <div className="min-h-screen bg-nirvaan-bg pb-28 max-w-md mx-auto md:max-w-lg relative overflow-x-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-nirvaan-bg sticky top-0 z-20">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <a
          href="tel:112"
          className="bg-nirvaan-primary text-white text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 min-h-[44px] active:scale-95 transition-transform shadow-sm"
        >
          <PhoneCall className="w-4 h-4" /> Call Help
        </a>
      </header>

      {/* Driver Status Switch */}
      <div className="mx-4 mt-2 bg-nirvaan-surface rounded-xl p-4 flex items-center justify-between border border-nirvaan-surface-high shadow-sm">
        <div>
          <p className="text-xs text-nirvaan-outline font-semibold">Driver Status</p>
          <p className={`font-extrabold text-base sm:text-lg ${available ? "text-nirvaan-success" : "text-nirvaan-outline"}`}>
            {available ? "Online & Available" : "Offline"}
          </p>
        </div>
        <button
          onClick={toggleAvailability}
          aria-label="Toggle availability status"
          className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors min-h-[44px] ${
            available ? "bg-nirvaan-success justify-end" : "bg-nirvaan-outline-variant justify-start"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
        </button>
      </div>

      {/* Live Map Tracking */}
      <div className="mx-4 mt-4">
        {myLocation && <LiveMap userLocation={myLocation} height="180px" zoom={13} />}
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
          <p className="text-xs text-nirvaan-outline font-semibold">Today's Earnings</p>
          <p className="text-lg sm:text-xl font-extrabold text-nirvaan-primary mt-1">
            ₹{Number(earnings.today_earnings || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
          <p className="text-xs text-nirvaan-outline font-semibold">Completed</p>
          <p className="text-lg sm:text-xl font-extrabold text-nirvaan-secondary mt-1">
            {earnings.completed_rides} Rides
          </p>
        </div>
      </div>

      {error && <p className="text-nirvaan-primary text-sm text-center mt-3 font-medium px-4">{error}</p>}

      {/* Incoming Emergency Dispatch Panel */}
      <div className="mx-4 mt-5">
        <h3 className="font-extrabold text-nirvaan-dark mb-2 text-base sm:text-lg">
          {available ? "Incoming Requests" : "Go online to see requests"}
        </h3>

        {available && loading && <p className="text-sm text-nirvaan-outline">Checking for dispatch calls...</p>}
        {available && !loading && requests.length === 0 && (
          <p className="text-sm text-nirvaan-outline">No emergency requests right now.</p>
        )}

        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-nirvaan-surface border-2 border-nirvaan-outline-variant rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <span className="flex items-center gap-1.5 text-nirvaan-primary font-extrabold text-sm">
                  <Ambulance className="w-4 h-4 shrink-0" /> Emergency Request
                </span>
                <span className="text-xs text-nirvaan-outline font-semibold bg-white px-2 py-1 rounded-full border border-nirvaan-surface-high">
                  {r.requested_at
                    ? new Date(r.requested_at).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Now"}
                </span>
              </div>

              <p className="text-xs text-nirvaan-outline font-semibold">PICKUP LOCATION</p>
              <p className="font-bold text-nirvaan-dark mb-3 text-sm sm:text-base break-words">
                {r.pickup_address || `${r.pickup_lat?.toFixed(4)}, ${r.pickup_lng?.toFixed(4)}`}
              </p>

              <div className="flex items-center gap-2 mb-3 pt-2 border-t border-nirvaan-outline-variant/30">
                <User className="w-4 h-4 text-nirvaan-outline shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-nirvaan-dark truncate">{r.caller_name || "Patient"}</p>
                  {r.caller_phone && <p className="text-xs text-nirvaan-outline truncate">{r.caller_phone}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRequests((prev) => prev.filter((req) => req.id !== r.id))}
                  className="flex-1 border-2 border-nirvaan-primary text-nirvaan-primary py-2.5 rounded-lg font-bold min-h-[44px] active:bg-nirvaan-primary/5 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(r.id)}
                  className="flex-1 bg-nirvaan-success text-white py-2.5 rounded-lg font-bold min-h-[44px] active:scale-95 transition-transform"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift History & Support */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-5">
        <Link 
          to="/driver/history" 
          className="bg-white rounded-xl p-4 text-center shadow-sm border border-nirvaan-surface-high flex flex-col items-center justify-center min-h-[64px] active:bg-slate-50 transition-colors"
        >
          <span className="text-nirvaan-dark font-bold flex flex-col items-center gap-1 text-sm">
            <HistoryIcon className="w-5 h-5" /> Shift History
          </span>
        </Link>
        <button 
          onClick={() => alert("Contacting Nirvaan Control Desk...")}
          className="bg-white rounded-xl p-4 text-center shadow-sm border border-nirvaan-surface-high flex flex-col items-center justify-center min-h-[64px] active:bg-slate-50 transition-colors"
        >
          <span className="text-nirvaan-dark font-bold flex flex-col items-center gap-1 text-sm">
            <Headset className="w-5 h-5" /> Support
          </span>
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around items-center py-2 z-30 max-w-md mx-auto md:max-w-lg shadow-lg">
        <Link to="/driver" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold min-w-[56px]">
          <span className="w-8 h-8 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center">
            <Home className="w-4 h-4" />
          </span>
          Home
        </Link>
        <Link to="/driver/earnings" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </span>
          Earnings
        </Link>
        <Link to="/driver/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </span>
          Assistant
        </Link>
        <Link to="/driver/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center">
            <User className="w-5 h-5" />
          </span>
          Profile
        </Link>
      </nav>
    </div>
  );
}