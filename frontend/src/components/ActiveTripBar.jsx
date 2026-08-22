import { Link, useLocation } from "react-router-dom";
import { useActiveTrip } from "../context/ActiveTripContext";
import { getDistanceKm, getEtaMinutes } from "../utils/geo";
import { Ambulance, ChevronRight } from "lucide-react";

export default function ActiveTripBar() {
  const { activeTrip, driverLocation } = useActiveTrip();
  const location = useLocation();

  if (!activeTrip) return null;
  if (location.pathname === `/patient/trip/${activeTrip.id}`) return null;

  const distanceKm =
    driverLocation && activeTrip.pickup_lat
      ? getDistanceKm(activeTrip.pickup_lat, activeTrip.pickup_lng, driverLocation.lat, driverLocation.lng)
      : null;
  const eta = distanceKm ? getEtaMinutes(distanceKm) : null;

  return (
    <Link
      to={`/patient/trip/${activeTrip.id}`}
      className="fixed bottom-16 left-0 right-0 max-w-md mx-auto md:max-w-lg bg-nirvaan-primary text-white px-4 py-3 flex items-center justify-between shadow-lg z-40"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Ambulance className="w-4 h-4" />
        </span>
        <div>
          <p className="text-xs opacity-90">
            {eta ? `Arriving in ${eta} mins` : "Trip in progress"}
          </p>
          <p className="text-sm font-bold capitalize">{activeTrip.status}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}