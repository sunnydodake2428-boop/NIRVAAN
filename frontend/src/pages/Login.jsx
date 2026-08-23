import { useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Ambulance, ArrowRight } from "lucide-react";

const ROLES = [
  { key: "caller", label: "Patient" },
  { key: "driver", label: "Driver" },
  { key: "admin", label: "Admin" },
];

const roleToPath = { caller: "patient", driver: "driver", admin: "admin" };

export default function Login() {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("caller");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? { phone, password }
          : { name, phone, password, role, vehicle_number: vehicleNumber };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      navigate(`/${roleToPath[data.user.role] || "login"}`);
    } catch (err) {
      setError(err.response?.data?.error || `${mode === "login" ? "Login" : "Signup"} failed`);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    try {
      const { data } = await api.post("/auth/google", {
        credential: credentialResponse.credential,
        role,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      navigate(`/${roleToPath[data.user.role] || "login"}`);
    } catch (err) {
      setError(err.response?.data?.error || "Google sign-in failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-nirvaan-bg px-4 py-10">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-xl bg-white shadow-sm border border-nirvaan-surface-high flex items-center justify-center">
            <Ambulance className="w-9 h-9 text-nirvaan-primary" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-[28px] leading-9 font-bold text-nirvaan-dark text-center tracking-tight">
          Welcome to Nirvaan
        </h1>
        <p className="text-base text-nirvaan-outline text-center mt-1 mb-6">
          Your reliable partner in critical care.
        </p>

        <div className="flex gap-6 mb-6 justify-center border-b border-nirvaan-surface-high">
          <button
            onClick={() => setMode("login")}
            className={`text-sm font-semibold pb-3 ${mode === "login" ? "text-nirvaan-secondary border-b-2 border-nirvaan-secondary" : "text-nirvaan-outline"}`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`text-sm font-semibold pb-3 ${mode === "signup" ? "text-nirvaan-secondary border-b-2 border-nirvaan-secondary" : "text-nirvaan-outline"}`}
          >
            Sign Up
          </button>
        </div>

        <p className="text-sm font-semibold text-nirvaan-dark mb-2">Continue as</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`py-3 rounded-lg text-sm font-semibold border transition ${
                role === r.key
                  ? "bg-nirvaan-error-container border-nirvaan-primary text-nirvaan-primary"
                  : "bg-nirvaan-surface border-transparent text-nirvaan-dark"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Google Sign-In */}
        <div className="flex justify-center mb-5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-nirvaan-outline-variant" />
          <span className="text-xs font-semibold text-nirvaan-outline">OR</span>
          <div className="flex-1 h-px bg-nirvaan-outline-variant" />
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-nirvaan-primary text-sm mb-3 font-medium">{error}</p>}

          {mode === "signup" && (
            <>
              <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Full Name</label>
              <input
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {role === "driver" && (
                <>
                  <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Vehicle Number</label>
                  <input
                    className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
                    placeholder="e.g. MH 12 AB 1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                  />
                </>
              )}
            </>
          )}

          <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Phone Number</label>
          <div className="flex mb-4">
            <span className="flex items-center px-3 rounded-l-lg bg-nirvaan-surface border border-r-0 border-nirvaan-outline-variant text-nirvaan-dark font-medium">
              +91
            </span>
            <input
              className="flex-1 border border-nirvaan-outline-variant rounded-r-lg px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <label className="text-sm font-semibold text-nirvaan-dark mb-1 block">Password</label>
          <input
            type="password"
            className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-3 mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-nirvaan-primary hover:bg-nirvaan-primary-container transition text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            {mode === "login" ? "Log In" : "Get Started"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-nirvaan-outline text-center mt-6 leading-5">
          By continuing, you agree to Nirvaan's{" "}
          <span className="text-nirvaan-primary underline font-medium">Terms of Service</span> and{" "}
          <span className="text-nirvaan-primary underline font-medium">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}