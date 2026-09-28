import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useActiveTrip } from "../../context/ActiveTripContext";
import { reverseGeocode } from "../../utils/geo";
import {
  Ambulance,
  PhoneCall,
  MapPin,
  Stethoscope,
  PlusSquare,
  Home,
  Bot,
  History,
  User,
} from "lucide-react";

export default function PatientHome() {
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { startActiveTrip } = useActiveTrip();

  async function handleRequest() {
    setRequesting(true);
    setError("");
    try {
      const pos = await getCurrentPosition();
      const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      const { data } = await api.post("/trips", {
        pickup_lat: pos.coords.latitude,
        pickup_lng: pos.coords.longitude,
        pickup_address: address,
      });
      navigate(`/patient/trip/${data.id}`);
      startActiveTrip(data.id);
    } catch (err) {
      setError(err.response?.data?.error || "Could not request ambulance. Check location permission.");
    } finally {
      setRequesting(false);
    }
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-28 max-w-md mx-auto md:max-w-lg relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-nirvaan-bg sticky top-0 z-20">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <button className="bg-nirvaan-primary text-white text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform min-h-[44px]">
          <PhoneCall className="w-4 h-4" /> Call Help
        </button>
      </header>

      {/* Emergency helpline banner */}
      <div className="bg-nirvaan-error-container text-nirvaan-primary text-sm font-semibold text-center py-2.5 px-4 flex items-center justify-center gap-1.5">
        <PhoneCall className="w-4 h-4 shrink-0" /> 
        <span>EMERGENCY HELPLINE: <span className="underline font-bold">102</span></span>
      </div>

      {/* Request Ambulance CTA */}
      <div className="flex flex-col items-center mt-6 px-4">
        <button
          onClick={handleRequest}
          disabled={requesting}
          className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-nirvaan-surface-highest flex items-center justify-center disabled:opacity-70 active:scale-95 transition-transform"
        >
          <span className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-nirvaan-primary text-white flex flex-col items-center justify-center shadow-lg gap-1">
            <MapPin className="w-7 h-7" />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight">
              {requesting ? "REQUESTING..." : "REQUEST"}
            </span>
            {!requesting && <span className="text-xs sm:text-sm font-medium">Ambulance</span>}
          </span>
        </button>

        <h2 className="text-2xl font-extrabold text-nirvaan-dark mt-6">Emergency Help</h2>
        <p className="text-base text-nirvaan-outline text-center mt-1 max-w-xs">
          Get immediate medical assistance at your current location.
        </p>
        {error && <p className="text-nirvaan-primary text-sm mt-2 text-center font-medium px-2">{error}</p>}
      </div>

      {/* Nearby ambulances & pricing */}
      <div className="px-4 mt-6">
        <button className="w-full border-2 border-nirvaan-primary text-nirvaan-primary font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 min-h-[44px] active:bg-nirvaan-primary/5">
          <Ambulance className="w-4 h-4" /> Nearby Ambulances & Pricing
        </button>
      </div>

      <div className="flex items-center gap-3 px-6 my-5">
        <div className="flex-1 h-px bg-nirvaan-outline-variant" />
        <span className="text-xs font-semibold text-nirvaan-outline">OR</span>
        <div className="flex-1 h-px bg-nirvaan-outline-variant" />
      </div>

      {/* Doctor consult + Find hospitals */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <button className="bg-nirvaan-surface text-nirvaan-secondary py-4 rounded-xl font-bold flex flex-col items-center gap-1.5 border border-nirvaan-surface-high min-h-[72px]">
          <Stethoscope className="w-5 h-5" /> Doctor Call
        </button>
        <Link
          to="/patient/hospitals"
          className="bg-nirvaan-surface text-nirvaan-success py-4 rounded-xl font-bold flex flex-col items-center gap-1.5 border border-nirvaan-surface-high min-h-[72px] justify-center"
        >
          <PlusSquare className="w-5 h-5" /> Find Hospitals
        </Link>
      </div>

      {/* Mobile-optimized bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around items-center py-2 z-30 max-w-md mx-auto md:max-w-lg shadow-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold min-w-[56px]">
          <span className="w-8 h-8 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><Home className="w-4 h-4" /></span>
          Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><Bot className="w-5 h-5" /></span>
          AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><History className="w-5 h-5" /></span>
          History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><User className="w-5 h-5" /></span>
          Profile
        </Link>
      </nav>
    </div>
  );
}