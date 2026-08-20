import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-nirvaan-danger">Nirvaan</h1>
        <button className="bg-nirvaan-danger text-white text-sm font-semibold px-4 py-2 rounded-full">
          📞 Call Help
        </button>
      </header>

      <div className="px-4 pt-6">
        {/* Avatar + basic info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-nirvaan-bg-soft flex items-center justify-center text-3xl mb-3">
            👤
          </div>
          <h2 className="text-lg font-bold text-nirvaan-dark">Patient Account</h2>
          <p className="text-sm text-gray-500 capitalize">{role}</p>
        </div>

        {/* Options list */}
        <div className="bg-white rounded-xl shadow-sm divide-y">
          <button className="w-full flex items-center justify-between px-4 py-4 text-left">
            <span className="text-nirvaan-dark font-medium">📝 Edit Profile</span>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-4 text-left">
            <span className="text-nirvaan-dark font-medium">📞 Emergency Contacts</span>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-4 text-left">
            <span className="text-nirvaan-dark font-medium">💳 Payment History</span>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-4 text-left">
            <span className="text-nirvaan-dark font-medium">⚙️ Settings</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 border border-nirvaan-danger text-nirvaan-danger py-3 rounded-xl font-semibold"
        >
          Log Out
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <Link to="/patient" className="flex flex-col items-center text-gray-400 text-xs">
          🏠 Home
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center text-gray-400 text-xs">
          🕓 History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center text-nirvaan-primary text-xs font-medium">
          👤 Profile
        </Link>
      </nav>
    </div>
  );
}