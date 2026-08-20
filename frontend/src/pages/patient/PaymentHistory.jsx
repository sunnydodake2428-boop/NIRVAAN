import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { ChevronLeft, CreditCard, Home, Bot, History, User } from "lucide-react";

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trips/payments/mine")
      .then((res) => setPayments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-24 max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center gap-3 px-4 py-4 bg-nirvaan-bg">
        <button onClick={() => navigate(-1)} className="text-nirvaan-dark">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-nirvaan-dark">Payment History</h1>
      </header>

      <div className="px-4">
        {loading && <p className="text-sm text-nirvaan-outline font-medium">Loading...</p>}
        {!loading && payments.length === 0 && (
          <p className="text-sm text-nirvaan-outline">No payment records yet.</p>
        )}

        <ul className="space-y-3">
          {payments.map((p) => (
            <li key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-nirvaan-surface flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-nirvaan-secondary" />
                </span>
                <div>
                  <p className="font-bold text-nirvaan-dark">{p.pickup_address || "Trip"}</p>
                  <p className="text-xs text-nirvaan-outline">{new Date(p.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="font-extrabold text-nirvaan-primary">₹{Number(p.price_charged).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>Home</Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><Bot className="w-5 h-5" /></span>AI Assistant</Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium"><span className="w-9 h-9 flex items-center justify-center"><History className="w-5 h-5" /></span>History</Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold"><span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><User className="w-4 h-4" /></span>Profile</Link>
      </nav>
    </div>
  );
}