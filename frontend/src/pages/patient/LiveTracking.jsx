// frontend/src/pages/patient/LiveTracking.jsx

import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../api/client";
import { getDistanceKm, getEtaMinutes } from "../../utils/geo";
import LiveMap from "../../components/LiveMap";
import {
  Ambulance,
  PhoneCall,
  User,
  BadgeCheck,
  MessageCircle,
  Home,
  Bot,
  History,
  Star,
} from "lucide-react";

export default function LiveTracking() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    let interval;
    async function fetchTrip() {
      try {
        const { data } = await api.get(`/trips/${tripId}`);
        setTrip(data);
        setUserLocation({ lat: data.pickup_lat, lng: data.pickup_lng });
        if (data.driver_lat && data.driver_lng) {
          setDriverLocation({ lat: data.driver_lat, lng: data.driver_lng });
        }
        setLoading(false);

        if (data.status === "completed") {
          clearInterval(interval);
          navigate(`/patient/trip/${tripId}/feedback`);
        }
      } catch (err) {
        console.error("Trip fetch error:", err);
      }
    }
    fetchTrip();
    interval = setInterval(fetchTrip, 5000);
    return () => clearInterval(interval);
  }, [tripId, navigate]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    socketRef.current.emit("join-trip", tripId);

    socketRef.current.on("driver-location-updated", (loc) => {
      setDriverLocation({ lat: loc.lat, lng: loc.lng });
    });

    socketRef.current.on("trip-status-changed", (data) => {
      setTrip((prev) => (prev ? { ...prev, status: data.status } : prev));
    });

    return () => socketRef.current?.disconnect();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-nirvaan-bg flex items-center justify-center p-4">
        <p className="text-nirvaan-primary font-bold animate-pulse">Loading live tracking...</p>
      </div>
    );
  }

  const hasDriver = !!trip?.driver_id;
  const statusText =
    trip?.status === "completed"
      ? "Trip completed"
      : hasDriver
      ? "Ambulance is on the way"
      : "Finding nearby ambulance";

  const distanceKm =
    userLocation && driverLocation
      ? getDistanceKm(userLocation.lat, userLocation.lng, driverLocation.lat, driverLocation.lng)
      : null;

  const etaMinutes = distanceKm ? getEtaMinutes(distanceKm) : null;

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col max-w-md mx-auto md:max-w-lg relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3.5 bg-white shadow-sm z-20 sticky top-0">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <a
          href="tel:102"
          className="bg-nirvaan-primary text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform min-h-[40px]"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Call Help
        </a>
      </header>

      {/* Map View Area */}
      <div className="flex-1 min-h-[300px] relative z-0 p-2">
        <LiveMap userLocation={userLocation} driverLocation={driverLocation} height="100%" />
      </div>

      {/* Bottom Sheet Details */}
      <div className="bg-white rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-10 shrink-0 mb-16">
        <div className="bg-nirvaan-primary text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="text-xs opacity-90 font-medium">{statusText}</p>
            <p className="text-xl font-extrabold mt-0.5">
              {trip?.status === "completed"
                ? "Completed"
                : etaMinutes
                ? `Arriving in ${etaMinutes} mins`
                : "Searching..."}
            </p>
            {trip?.status !== "completed" && (
              <p className="text-xs opacity-80 mt-0.5">
                {distanceKm ? `${distanceKm.toFixed(1)} km away` : "Connecting driver GPS..."}
              </p>
            )}
          </div>
          <span className="bg-nirvaan-success text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize whitespace-nowrap">
            {trip?.status || "active"}
          </span>
        </div>

        {hasDriver && (
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-nirvaan-surface-high">
            <div className="w-11 h-11 rounded-full bg-nirvaan-surface flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-nirvaan-outline" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-nirvaan-dark text-sm truncate">{trip.driver_name}</p>
              <p className="text-xs text-nirvaan-success font-semibold flex items-center gap-1 mt-0.5">
                <BadgeCheck className="w-3.5 h-3.5 shrink-0" /> Verified Partner
              </p>
              {trip.driver_avg_rating && (
                <p className="text-xs text-nirvaan-dark font-bold mt-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {trip.driver_avg_rating} ({trip.driver_total_ratings})
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-nirvaan-outline font-bold tracking-wider uppercase">Vehicle</p>
              <p className="font-extrabold text-nirvaan-primary text-sm">{trip.vehicle_number || "—"}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 px-5 py-3.5">
          <a
            href={trip?.driver_phone ? `tel:${trip.driver_phone}` : undefined}
            className={`flex-1 bg-nirvaan-secondary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 min-h-[44px] ${
              !trip?.driver_phone && "opacity-50 pointer-events-none"
            }`}
          >
            <PhoneCall className="w-4 h-4" /> Call Driver
          </a>
          <button
            disabled
            className="flex-1 bg-nirvaan-surface text-nirvaan-outline py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around items-center py-2 z-30 max-w-md mx-auto md:max-w-lg shadow-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><Home className="w-4 h-4" /></span>
          Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><Bot className="w-4 h-4" /></span>
          AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold min-w-[56px]">
          <span className="w-8 h-8 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><History className="w-4 h-4" /></span>
          History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><User className="w-4 h-4" /></span>
          Profile
        </Link>
      </nav>
    </div>
  );
}