import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { ChevronLeft } from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      setName(res.data.name);
      setPhone(res.data.phone);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.patch("/auth/me", { name, phone });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-10 max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center gap-3 px-4 py-4 bg-nirvaan-bg">
        <button onClick={() => navigate(-1)} className="text-nirvaan-dark">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-nirvaan-dark">Edit Profile</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4">
        {error && <p className="text-nirvaan-primary text-sm mb-3 font-medium">{error}</p>}
        {message && <p className="text-nirvaan-success text-sm mb-3 font-medium">{message}</p>}

        <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Full Name</label>
        <input
          className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Phone Number</label>
        <input
          className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-3 mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-nirvaan-primary text-white py-3.5 rounded-lg font-bold shadow-sm"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}