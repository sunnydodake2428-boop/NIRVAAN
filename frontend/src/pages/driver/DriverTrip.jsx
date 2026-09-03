import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../api/client";
import LiveMap from "../../components/LiveMap";
import { getDistanceKm, getEtaMinutes } from "../../utils/geo";
import { Ambulance } from "lucide-react";

export default function DriverTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    api.get(`/trips/${tripId}`).then(({ data }) => {
      setPatientLocation({ lat: data.pickup_lat, lng: data.pickup_lng });
    });
  }, [tripId]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    return () => socketRef.current?.disconnect();
  }, []);

  function startSharingLocation() {
    if (!navigator.geolocation) return;
    setSharing(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
        socketRef.current.emit("driver-location-update", { tripId, ...loc });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }

  function stopSharingLocation() {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    setSharing(false);
  }

  useEffect(() => {
    startSharingLocation();
    return () => stopSharingLocation();
  }, []);

 async function handleComplete() {
  try {
    await api.patch(`/trips/${tripId}/complete`, {
      dropoff_lat: myLocation?.lat,
      dropoff_lng: myLocation?.lng,
    });
    stopSharingLocation();
    navigate("/driver");
  } catch (err) {
    console.error(err);
  }
}

  const distanceKm =
    myLocation && patientLocation
      ? getDistanceKm(myLocation.lat, myLocation.lng, patientLocation.lat, patientLocation.lng)
      : null;
  const etaMinutes = distanceKm ? getEtaMinutes(distanceKm) : null;

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center justify-between px-4 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${sharing ? "bg-green-100 text-nirvaan-success" : "bg-nirvaan-surface text-nirvaan-outline"}`}>
          <span className={`w-2 h-2 rounded-full ${sharing ? "bg-nirvaan-success" : "bg-nirvaan-outline"}`} />
          {sharing ? "Sharing Live Location" : "Location paused"}
        </span>
      </header>

      <div style={{ height: "340px" }} className="relative z-0 p-2">
        <LiveMap userLocation={patientLocation} driverLocation={myLocation} height="100%" />
      </div>

      {distanceKm && (
        <div className="bg-nirvaan-primary text-white px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 font-medium">To patient pickup</p>
            <p className="text-2xl font-extrabold mt-0.5">{etaMinutes} mins</p>
          </div>
          <p className="text-lg font-bold">{distanceKm.toFixed(1)} km</p>
        </div>
      )}

      <div className="bg-white rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.08)] p-5">
        <p className="text-sm text-nirvaan-outline font-semibold">Trip #{tripId}</p>
        <h2 className="font-extrabold text-nirvaan-dark text-xl mb-4">En route to patient</h2>
        <button onClick={handleComplete} className="w-full bg-nirvaan-primary text-white py-3.5 rounded-lg font-bold shadow-sm">
          Mark Trip Completed
        </button>
      </div>
    </div>
  );
}