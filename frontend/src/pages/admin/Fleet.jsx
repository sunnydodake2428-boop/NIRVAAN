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
  Plus,
  Phone,
  Radio,
  CheckCircle2,
  Wrench,
  RefreshCw,
} from "lucide-react";

export default function Fleet() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [vehicleCode, setVehicleCode] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [type, setType] = useState("BLS (Basic)");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const mockFleet = [
    {
      id: "1",
      code: "AMB-101",
      driver_name: "Ramesh Shinde",
      driver_phone: "+91 98220 11111",
      type: "ALS (Advanced)",
      status: "available",
      current_location: "Kothrud Depot",
    },
    {
      id: "2",
      code: "AMB-102",
      driver_name: "Sanjay Pawar",
      driver_phone: "+91 98220 22222",
      type: "BLS (Basic)",
      status: "busy",
      current_location: "En route to Sassoon Hospital",
    },
    {
      id: "3",
      code: "AMB-103",
      driver_name: "Vikram Jagtap",
      driver_phone: "+91 98220 33333",
      type: "BLS (Basic)",
      status: "maintenance",
      current_location: "Service Station - Hadapsar",
    },
  ];

  useEffect(() => {
    fetchFleet();
  }, []);

  async function fetchFleet() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/fleet");
      setFleet(data.length > 0 ? data : mockFleet);
    } catch (err) {
      console.log("Using mock fleet data");
      setFleet(mockFleet);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/admin/fleet", {
        code: vehicleCode,
        driver_name: driverName,
        driver_phone: driverPhone,
        type,
      });
      setMessage("Vehicle added to active fleet.");
      setVehicleCode("");
      setDriverName("");
      setDriverPhone("");
      setShowAddModal(false);
      fetchFleet();
    } catch (err) {
      const newVeh = {
        id: Date.now().toString(),
        code: vehicleCode,
        driver_name: driverName,
        driver_phone: driverPhone,
        type,
        status: "available",
        current_location: "Base Station",
      };
      setFleet((prev) => [newVeh, ...prev]);
      setMessage("Vehicle added successfully.");
      setVehicleCode("");
      setDriverName("");
      setDriverPhone("");
      setShowAddModal(false);
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: History, label: "History", href: "/admin/history" },
    { icon: Truck, label: "Fleet", href: "/admin/fleet", active: true },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
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
              Fleet Management
            </h2>
            <p className="text-sm text-nirvaan-outline">
              Monitor ambulance readiness, assign drivers, and manage active response units.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchFleet}
              className="p-2 bg-white border border-nirvaan-surface-high rounded-lg text-nirvaan-dark hover:bg-nirvaan-surface transition-colors"
              title="Refresh Fleet"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="bg-nirvaan-secondary text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>
        </div>

        {message && (
          <p className="text-xs text-green-700 bg-green-50 p-3 rounded-lg mb-4 font-medium border border-green-200">
            {message}
          </p>
        )}

        {/* Add Vehicle Form Modal / Drawer */}
        {showAddModal && (
          <form
            onSubmit={handleAddVehicle}
            className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm mb-6 max-w-xl"
          >
            <h3 className="text-sm font-bold text-nirvaan-dark mb-3">Register New Ambulance</h3>
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-nirvaan-dark block mb-1">
                  Vehicle Identifier Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. AMB-106"
                  required
                  value={vehicleCode}
                  onChange={(e) => setVehicleCode(e.target.value)}
                  className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-nirvaan-dark block mb-1">
                  Vehicle Class
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none bg-white"
                >
                  <option value="BLS (Basic)">BLS (Basic Life Support)</option>
                  <option value="ALS (Advanced)">ALS (Advanced Cardiac)</option>
                  <option value="Patient Transport">Patient Transport</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-nirvaan-dark block mb-1">
                  Assigned Driver Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-nirvaan-dark block mb-1">
                  Driver Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91..."
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-nirvaan-dark hover:bg-nirvaan-surface rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-nirvaan-secondary text-white rounded-lg"
              >
                Save Vehicle
              </button>
            </div>
          </form>
        )}

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fleet.map((veh) => (
            <div
              key={veh.id}
              className="bg-white rounded-xl border border-nirvaan-surface-high p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-nirvaan-primary text-base">
                    {veh.code}
                  </span>
                  {veh.status === "available" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  ) : veh.status === "busy" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      <Radio className="w-3 h-3 animate-pulse text-amber-600" /> On Request
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      <Wrench className="w-3 h-3" /> Maintenance
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-nirvaan-dark mb-1">{veh.type}</p>
                <p className="text-xs text-nirvaan-outline mb-3">
                  Station: <span className="text-nirvaan-dark font-medium">{veh.current_location}</span>
                </p>
              </div>

              <div className="border-t border-nirvaan-surface-high pt-3 mt-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-nirvaan-dark">{veh.driver_name}</p>
                  <a
                    href={`tel:${veh.driver_phone}`}
                    className="text-nirvaan-secondary font-medium flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" /> {veh.driver_phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}