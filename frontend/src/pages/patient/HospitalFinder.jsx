import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  PhoneCall,
  Search,
  Phone,
  Home,
  Bot,
  History,
  User,
} from "lucide-react";

const SPECIALTIES = [
  { key: "general", label: "General" },
  { key: "cancer", label: "Cancer" },
  { key: "cardiac", label: "Cardiac" },
  { key: "orthopedic", label: "Orthopedic" },
  { key: "maternity", label: "Maternity" },
];

export default function HospitalFinder() {
  const [specialty, setSpecialty] = useState("general");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search() {
    setLoading(true);
    setError("");
    try {
      const pos = await getCurrentPosition();
      const { data } = await api.get("/hospitals", {
        params: { specialty, lat: pos.coords.latitude, lng: pos.coords.longitude },
      });
      setHospitals(data);
      setSearched(true);
    } catch (err) {
      setError("Could not fetch hospitals. Check location permission and try again.");
    } finally {
      setLoading(false);
    }
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
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

      <div className="px-4 pt-4">
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">Find a Hospital</h2>
        <p className="text-sm text-nirvaan-outline mb-4">
          Search hospitals near you by condition/specialty.
        </p>

        {/* Specialty selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {SPECIALTIES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSpecialty(s.key)}
              className={`px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border-2 transition ${
                specialty === s.key
                  ? "bg-nirvaan-error-container border-nirvaan-primary text-nirvaan-primary"
                  : "bg-white border-nirvaan-outline-variant text-nirvaan-dark"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={search}
          className="w-full bg-nirvaan-secondary text-white py-3.5 rounded-lg font-bold mb-5 flex items-center justify-center gap-2 shadow-sm"
        >
          <Search className="w-4 h-4" /> Search Nearby
        </button>

        {loading && <p className="text-sm text-nirvaan-outline font-medium">Searching...</p>}
        {error && <p className="text-sm text-nirvaan-primary font-medium">{error}</p>}
        {searched && !loading && hospitals.length === 0 && !error && (
          <p className="text-sm text-nirvaan-outline">No hospitals found for this specialty nearby.</p>
        )}

        {/* Results */}
        <ul className="space-y-3">
          {hospitals.map((h) => (
            <li key={h.id} className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-nirvaan-dark">{h.name}</p>
                  <p className="text-sm text-nirvaan-outline mt-0.5">{h.address}</p>
                  {h.contact_number && (
                    <p className="text-sm text-nirvaan-outline mt-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {h.contact_number}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-nirvaan-secondary bg-nirvaan-surface px-2.5 py-1 rounded-full whitespace-nowrap">
                  {Number(h.distance_km).toFixed(1)} km
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><History className="w-5 h-5" /></span>History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>Profile
        </Link>
      </nav>
    </div>
  );
}