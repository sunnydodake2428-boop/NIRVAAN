import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../api/client";
import { getDistanceKm, getEtaMinutes } from "../../utils/geo";
import LiveMap from "../../components/LiveMap";
import { Star } from "lucide-react";
import {
  Ambulance,
  PhoneCall,
  User,
  BadgeCheck,
  MessageCircle,
  Home,
  Bot,
  History,
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
        setLoading(false);

        if (data.status === "completed") {
          clearInterval(interval);
          navigate(`/patient/trip/${tripId}/feedback`);
        } else if (data.status === "cancelled") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTrip();
    interval = setInterval(fetchTrip, 5000);
    return () => clearInterval(interval);
  }, [tripId]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    socketRef.current.emit("join-trip", tripId);
    socketRef.current.on("location-update", (loc) => setDriverLocation(loc));
    return () => socketRef.current?.disconnect();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-nirvaan-bg flex items-center justify-center">
        <p className="text-nirvaan-outline text-sm">Loading trip...</p>
      </div>
    );
  }

  const hasDriver = !!trip?.driver_id;
  const statusText = trip?.status === "completed" ? "Trip completed" : hasDriver ? "Ambulance is on the way" : "Finding your ambulance";
  const headingText = trip?.status === "completed" ? "Completed" : hasDriver ? "Driver assigned" : "Please wait...";
  const distanceKm = userLocation && driverLocation ? getDistanceKm(userLocation.lat, userLocation.lng, driverLocation.lat, driverLocation.lng) : null;
  const etaMinutes = distanceKm ? getEtaMinutes(distanceKm) : null;

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center justify-between px-4 py-4 bg-white shadow-sm z-10 relative">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <button className="bg-nirvaan-primary text-white text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4" /> Call Help
        </button>
      </header>

      <div style={{ height: "340px" }} className="relative z-0">
        <LiveMap userLocation={userLocation} driverLocation={driverLocation} height="100%" />
      </div>

      <div className="bg-white rounded-t-2xl -mt-5 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="bg-nirvaan-primary text-white px-5 py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 font-medium">{statusText}</p>
            <p className="text-2xl font-extrabold mt-0.5">
              {trip?.status === "completed" ? "Completed" : etaMinutes ? "Arriving in " + etaMinutes + " mins" : headingText}
            </p>
            {distanceKm && trip?.status !== "completed" ? (
              <p className="text-xs opacity-90 mt-1">{distanceKm.toFixed(1)} km away</p>
            ) : null}
          </div>
          <span className="bg-nirvaan-success text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize whitespace-nowrap">
            {trip?.status}
          </span>
        </div>

        {hasDriver ? (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-nirvaan-surface-high">
            <div className="w-12 h-12 rounded-full bg-nirvaan-surface flex items-center justify-center">
              <User className="w-6 h-6 text-nirvaan-outline" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-nirvaan-dark">{trip.driver_name}</p>
              <p className="text-xs text-nirvaan-success font-semibold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </p>
              {trip.driver_avg_rating && (
                <p className="text-sm text-nirvaan-dark font-bold mt-1 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {trip.driver_avg_rating} ({trip.driver_total_ratings} ratings)
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-nirvaan-outline font-semibold">VEHICLE</p>
              <p className="font-extrabold text-nirvaan-primary">{trip.vehicle_number || "—"}</p>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3 px-5 py-4">
          <a href={trip && trip.driver_phone ? "tel:" + trip.driver_phone : undefined} className="flex-1 bg-nirvaan-secondary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            <PhoneCall className="w-4 h-4" /> Call Driver
          </a>
          <button disabled className="flex-1 bg-nirvaan-surface text-nirvaan-outline py-3 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed" title="Chat coming in a future phase">
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        </div>
      </div>

      <nav className="bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold">
          <span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><History className="w-4 h-4" /></span>History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>Profile
        </Link>
      </nav>
    </div>
  );
}