import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { ChevronLeft } from "lucide-react";

export default function VehicleDetails() {
  const navigate = useNavigate();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("basic");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/drivers/me").then((res) => {
      setVehicleNumber(res.data.vehicle_number || "");
      setVehicleType(res.data.vehicle_type || "basic");
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.patch("/drivers/vehicle", { vehicle_number: vehicleNumber, vehicle_type: vehicleType });
      setMessage("Vehicle details updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update");
    }
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-10 max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center gap-3 px-4 py-4 bg-nirvaan-bg">
        <button onClick={() => navigate(-1)} className="text-nirvaan-dark">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-nirvaan-dark">Vehicle Details</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4">
        {error && <p className="text-nirvaan-primary text-sm mb-3 font-medium">{error}</p>}
        {message && <p className="text-nirvaan-success text-sm mb-3 font-medium">{message}</p>}

        <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Vehicle Number</label>
        <input
          className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          required
        />

        <label className="text-sm font-semibold text-nirvaan-dark mb-2 block">Vehicle Type</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {["basic", "icu"].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setVehicleType(t)}
              className={`py-3 rounded-lg text-sm font-bold border-2 uppercase ${
                vehicleType === t
                  ? "bg-nirvaan-error-container border-nirvaan-primary text-nirvaan-primary"
                  : "bg-white border-nirvaan-outline-variant text-nirvaan-dark"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button type="submit" className="w-full bg-nirvaan-primary text-white py-3.5 rounded-lg font-bold shadow-sm">
          Save Changes
        </button>
      </form>
    </div>
  );
}