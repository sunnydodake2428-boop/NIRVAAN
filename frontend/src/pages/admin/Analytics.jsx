import { useState, useEffect } from "react";
import api from "../../api/client";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 148,
    avgResponseMinutes: 8.4,
    successfulTransports: 139,
    cancelledRequests: 9,
    peakHours: "06:00 PM - 09:00 PM",
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/analytics");
      if (data) setStats(data);
    } catch (err) {
      console.log("Using default mock analytics data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">
            Response & Operations Analytics
          </h2>
          <p className="text-sm text-nirvaan-outline">
            Monitor key emergency response metrics, response speeds, and dispatch volume.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 bg-white border border-nirvaan-surface-high rounded-lg text-nirvaan-dark hover:bg-nirvaan-surface transition-colors"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Total Dispatches</span>
            <TrendingUp className="w-4 h-4 text-nirvaan-secondary" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{stats.totalRequests}</p>
          <span className="text-[11px] text-green-600 font-medium">+12% from last week</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Avg Response Time</span>
            <Clock className="w-4 h-4 text-nirvaan-primary" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{stats.avgResponseMinutes} mins</p>
          <span className="text-[11px] text-green-600 font-medium">1.2 mins faster than target</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Successful Transports</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{stats.successfulTransports}</p>
          <span className="text-[11px] text-nirvaan-outline font-medium">93.9% completion rate</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Cancellations</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{stats.cancelledRequests}</p>
          <span className="text-[11px] text-nirvaan-outline font-medium">6.1% user / auto-cancelled</span>
        </div>
      </div>

      {/* Operational Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-4">Peak Operational Window</h3>
          <div className="p-4 bg-nirvaan-surface rounded-lg mb-4">
            <p className="text-xs text-nirvaan-outline mb-1">Highest Request Volume Period</p>
            <p className="text-lg font-extrabold text-nirvaan-secondary">{stats.peakHours}</p>
          </div>
          <p className="text-xs text-nirvaan-outline leading-relaxed">
            Ensure maximum fleet availability during these hours to minimize allocation delay and maintain response under 10 minutes.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-nirvaan-dark mb-2">Specialty Allocation Breakdown</h3>
            <p className="text-xs text-nirvaan-outline mb-4">Emergency call routing by requested hospital specialty tags</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>General / Trauma</span>
                <span>52%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-nirvaan-secondary h-full w-[52%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Cardiac Care</span>
                <span>24%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-nirvaan-primary h-full w-[24%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Maternity & Pediatric</span>
                <span>14%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[14%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Orthopedic & Others</span>
                <span>10%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full w-[10%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}