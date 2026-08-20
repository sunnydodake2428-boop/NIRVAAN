import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Clock,
  CreditCard,
  Info,
  Home,
  Bot,
  History,
  User,
} from "lucide-react";

export default function TripFeedback() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/trips/${tripId}/price`, { price_charged: amount });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit feedback");
    }
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

      {/* Success state */}
      <div className="flex flex-col items-center mt-6 px-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-9 h-9 text-nirvaan-success" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mt-2">Trip Completed</h2>
        <p className="text-sm text-nirvaan-outline text-center mt-1">
          Your journey with Nirvaan has safely concluded.
        </p>
      </div>

      {/* Distance / Duration */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
          <p className="text-xs text-nirvaan-outline font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> DISTANCE
          </p>
          <p className="text-xl font-extrabold text-nirvaan-dark mt-1">12.5 km</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high">
          <p className="text-xs text-nirvaan-outline font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> DURATION
          </p>
          <p className="text-xl font-extrabold text-nirvaan-dark mt-1">24 min</p>
        </div>
      </div>

      {/* Destination */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high mx-4 mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-nirvaan-outline font-semibold">DESTINATION</p>
          <p className="font-bold text-nirvaan-dark mt-0.5">City General Hospital</p>
        </div>
        <span className="w-9 h-9 rounded-full bg-nirvaan-surface flex items-center justify-center">
          <MapPin className="w-4 h-4 text-nirvaan-secondary" />
        </span>
      </div>

      {/* Payment feedback */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high mx-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-10 h-10 rounded-lg bg-nirvaan-surface flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-nirvaan-secondary" />
          </span>
          <h3 className="font-bold text-nirvaan-dark">Payment Feedback</h3>
        </div>
        <p className="text-sm text-nirvaan-outline mb-3">How much did you pay for this emergency trip?</p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            {error && <p className="text-nirvaan-primary text-sm mb-2 font-medium">{error}</p>}
            <div className="flex items-center bg-nirvaan-surface rounded-lg px-4 py-3.5 mb-4 border border-nirvaan-outline-variant">
              <span className="text-nirvaan-dark mr-2 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent outline-none flex-1 font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-nirvaan-primary text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              Submit Feedback →
            </button>
          </form>
        ) : (
          <div className="bg-green-50 text-nirvaan-success text-sm rounded-lg p-3.5 font-medium flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Thank you for contributing to price transparency. Your data helps others in critical times.</span>
          </div>
        )}
      </div>

      <div className="text-center mt-5">
        <button
          onClick={() => navigate("/patient")}
          className="text-sm text-nirvaan-secondary font-bold"
        >
          Back to Home
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold">
          <span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><History className="w-4 h-4" /></span>History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>Profile
        </Link>
      </nav>
    </div>
  );
}