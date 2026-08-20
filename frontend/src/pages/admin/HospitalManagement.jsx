import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  History,
  Truck,
  Hospital,
  BarChart3,
  Settings,
  MapPin,
} from "lucide-react";

const SPECIALTIES = ["general", "cancer", "cardiac", "orthopedic", "maternity"];

export default function HospitalManagement() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [contact, setContact] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toggleSpecialty(s) {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/hospitals", {
        name,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        contact_number: contact,
        specialty_tags: selectedSpecialties,
      });
      setMessage("Hospital added successfully.");
      setName("");
      setAddress("");
      setLat("");
      setLng("");
      setContact("");
      setSelectedSpecialties([]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add hospital");
    }
  }

  function useCurrentLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toString());
      setLng(pos.coords.longitude.toString());
    });
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: History, label: "History" },
    { icon: Truck, label: "Fleet" },
    { icon: Hospital, label: "Hospitals", active: true },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-nirvaan-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) =>
            item.href && !item.active ? (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-2.5 text-nirvaan-dark px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-nirvaan-surface"
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  item.active ? "bg-nirvaan-secondary text-white" : "text-nirvaan-dark"
                }`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </div>
            )
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-2xl">
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">Hospital Management</h2>
        <p className="text-sm text-nirvaan-outline mb-6">
          Add hospitals so patients can find them via the specialty search.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-nirvaan-surface-high">
          {error && <p className="text-nirvaan-primary text-sm mb-3 font-medium">{error}</p>}
          {message && <p className="text-nirvaan-success text-sm mb-3 font-medium">{message}</p>}

          <label className="text-sm font-semibold text-nirvaan-dark">Hospital Name</label>
          <input
            className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="text-sm font-semibold text-nirvaan-dark">Address</label>
          <input
            className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <label className="text-sm font-semibold text-nirvaan-dark">Contact Number</label>
          <input
            className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <label className="text-sm font-semibold text-nirvaan-dark">Location</label>
          <div className="flex gap-2 mt-1 mb-1">
            <input
              className="flex-1 border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
            <input
              className="flex-1 border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="text-xs text-nirvaan-secondary font-bold mb-4 flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" /> Use my current location
          </button>

          <label className="text-sm font-semibold text-nirvaan-dark block mb-2">Specialties</label>
          <div className="flex flex-wrap gap-2 mb-5">
            {SPECIALTIES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border-2 ${
                  selectedSpecialties.includes(s)
                    ? "bg-nirvaan-error-container border-nirvaan-primary text-nirvaan-primary"
                    : "bg-white border-nirvaan-outline-variant text-nirvaan-dark"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-nirvaan-secondary text-white py-3.5 rounded-lg font-bold shadow-sm"
          >
            Add Hospital
          </button>
        </form>
      </main>
    </div>
  );
}