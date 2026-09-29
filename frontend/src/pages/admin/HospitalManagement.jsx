import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  Users,
  History,
  Truck,
  Hospital,
  BarChart3,
  FileSpreadsheet,
  Settings,
  MapPin,
  Plus,
  Phone,
  RefreshCw,
} from "lucide-react";

const SPECIALTIES = ["general", "cancer", "cardiac", "orthopedic", "maternity"];

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [contact, setContact] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    setLoading(true);
    try {
      const { data } = await api.get("/hospitals");
      setHospitals(data || []);
    } catch (err) {
      console.error("Failed to load hospitals:", err);
    } finally {
      setLoading(false);
    }
  }

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
      fetchHospitals();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add hospital");
    }
  }

  function useCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
      });
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: History, label: "History", href: "/admin/history" },
    { icon: Truck, label: "Fleet", href: "/admin/fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals", active: true },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: FileSpreadsheet, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col md:flex-row">
      {/* Mobile Top Navigation Header */}
      <header className="bg-white border-b border-nirvaan-surface-high p-4 flex flex-col gap-3 md:hidden">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                item.active
                  ? "bg-nirvaan-secondary text-white"
                  : "bg-white text-nirvaan-dark border border-nirvaan-surface-high hover:bg-nirvaan-surface"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col shrink-0">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                item.active
                  ? "bg-nirvaan-secondary text-white"
                  : "text-nirvaan-dark hover:bg-nirvaan-surface"
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">
              Hospital Management
            </h2>
            <p className="text-sm text-nirvaan-outline">
              Add and manage partner hospitals for patient emergency allocation.
            </p>
          </div>
          <button
            onClick={fetchHospitals}
            className="p-2 bg-white border border-nirvaan-surface-high rounded-lg text-nirvaan-dark hover:bg-nirvaan-surface transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high"
            >
              <h3 className="text-base font-bold text-nirvaan-dark mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-nirvaan-primary" /> Add New Hospital
              </h3>

              {error && (
                <p className="text-nirvaan-primary text-xs mb-3 font-medium bg-red-50 p-2 rounded-md">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-nirvaan-success text-xs mb-3 font-medium bg-green-50 p-2 rounded-md">
                  {message}
                </p>
              )}

              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                Hospital Name
              </label>
              <input
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sassoon Hospital"
                required
              />

              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                Address
              </label>
              <input
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shivajinagar, Pune"
              />

              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                Contact Number
              </label>
              <input
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91..."
              />

              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                Location Coordinates
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border border-nirvaan-outline-variant rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
                <input
                  className="flex-1 border border-nirvaan-outline-variant rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="text-[11px] text-nirvaan-secondary font-bold mb-3 flex items-center gap-1 hover:underline"
              >
                <MapPin className="w-3 h-3" /> Use current GPS location
              </button>

              <label className="text-xs font-semibold text-nirvaan-dark block mb-1.5">
                Specialties
              </label>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {SPECIALTIES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSpecialty(s)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
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
                className="w-full bg-nirvaan-secondary text-white py-2.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
              >
                Save Hospital
              </button>
            </form>
          </div>

          {/* Hospitals Grid */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-base font-bold text-nirvaan-dark">
              Registered Partner Hospitals ({hospitals.length})
            </h3>

            {loading ? (
              <p className="text-xs text-nirvaan-outline">Loading hospital network...</p>
            ) : hospitals.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-xs text-nirvaan-outline border border-nirvaan-surface-high">
                No hospitals registered yet. Use the form to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hospitals.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="bg-white border border-nirvaan-surface-high rounded-xl p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-extrabold text-nirvaan-dark text-sm mb-1">
                        {h.name}
                      </h4>
                      <p className="text-xs text-nirvaan-outline flex items-start gap-1 mb-2">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
                        <span className="line-clamp-2">{h.address || "Address unavailable"}</span>
                      </p>
                      {h.contact_number && (
                        <p className="text-xs text-nirvaan-secondary font-medium flex items-center gap-1 mb-2">
                          <Phone className="w-3 h-3 shrink-0" />
                          <a href={`tel:${h.contact_number}`}>{h.contact_number}</a>
                        </p>
                      )}
                    </div>

                    {h.specialty_tags && h.specialty_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-nirvaan-surface-high">
                        {h.specialty_tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-nirvaan-surface text-nirvaan-dark text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}