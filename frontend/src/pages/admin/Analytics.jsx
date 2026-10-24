import { useState, useEffect } from "react";
import api from "../../api/client";
import DriverPerformanceTable from "../../components/admin/DriverPerformanceTable";
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

const mins = (m) => (m == null ? "—" : `${m} min`);
const pct = (v) => (v == null ? "—" : `${v}%`);

const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? "p" : "a"}`;

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
      setError("");
    } catch (err) {
      setError("Could not load analytics from the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const s = data?.summary;
  const w = data?.weekly;
  const hourly = data?.hourly || [];
  const maxHour = Math.max(1, ...hourly.map((h) => h.trips));
  const specialties = data?.hospitalsBySpecialty || [];
  const maxSpec = Math.max(1, ...specialties.map((x) => x.count));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">Response & Operations Analytics</h2>
          <p className="text-sm text-nirvaan-outline">
            Real response speeds, dispatch volume and per-driver performance.
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 shrink-0 bg-white border border-nirvaan-surface-high rounded-lg text-nirvaan-dark hover:bg-nirvaan-surface transition-colors"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 font-medium">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Total Dispatches</span>
            <TrendingUp className="w-4 h-4 text-nirvaan-secondary" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{s ? s.total : "…"}</p>
          <span className="text-[11px] text-nirvaan-outline font-medium">
            {w
              ? `${w.thisWeek} in the last 7 days` +
                (w.changePct == null ? "" : ` (${w.changePct >= 0 ? "+" : ""}${w.changePct}% vs previous 7 days)`)
              : ""}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Avg Time to Accept</span>
            <Clock className="w-4 h-4 text-nirvaan-primary" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{s ? mins(s.avgAcceptMinutes) : "…"}</p>
          <span className="text-[11px] text-nirvaan-outline font-medium">
            {s ? `Median ${mins(s.medianAcceptMinutes)} · ${s.acceptSamples} trips · all drivers` : ""}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Avg Time to Arrive</span>
            <Clock className="w-4 h-4 text-nirvaan-secondary" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{s ? mins(s.avgArrivalMinutes) : "…"}</p>
          <span className="text-[11px] text-nirvaan-outline font-medium">
            {s
              ? s.arrivalSamples > 0
                ? `Measured on ${s.arrivalSamples} trips`
                : "Appears once drivers tap “Arrived”"
              : ""}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-nirvaan-outline uppercase">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">{s ? pct(s.completionRate) : "…"}</p>
          <span className="text-[11px] text-nirvaan-outline font-medium">
            {s ? `${s.completed} completed · ${s.cancelled} cancelled (${pct(s.cancellationRate)})` : ""}
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-nirvaan-dark">Requests by hour of day (all time, IST)</h3>
          {data?.peakHours && (
            <span className="text-xs font-bold text-nirvaan-secondary bg-nirvaan-surface px-2.5 py-1 rounded-full">
              Peak: {data.peakHours}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-1 h-32 min-w-[480px]">
            {hourly.map((h) => (
              <div key={h.hr} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t bg-nirvaan-primary/70"
                  style={{ height: `${Math.max(h.trips ? 4 : 1, Math.round((h.trips / maxHour) * 90))}px` }}
                  title={`${h.trips} requests`}
                />
                <span className="text-[9px] text-nirvaan-outline">{h.hr % 3 === 0 ? hourLabel(h.hr) : ""}</span>
              </div>
            ))}
          </div>
        </div>
        {!data?.peakHours && !loading && (
          <p className="text-xs text-nirvaan-outline mt-2">No requests recorded yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-1">Hospital network by specialty</h3>
          <p className="text-xs text-nirvaan-outline mb-4">Number of registered partner hospitals per specialty tag</p>
          <div className="space-y-3">
            {specialties.length === 0 && (
              <p className="text-xs text-nirvaan-outline">No hospitals with specialty tags yet.</p>
            )}
            {specialties.map((x) => (
              <div key={x.tag}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="capitalize">{x.tag}</span>
                  <span>{x.count}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-nirvaan-secondary h-full" style={{ width: `${(x.count / maxSpec) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-nirvaan-dark">Fares</h3>
          </div>
          <p className="text-2xl font-extrabold text-nirvaan-dark">
            {s ? `₹${Math.round(s.faresTotal).toLocaleString("en-IN")}` : "…"}
          </p>
          <p className="text-xs text-nirvaan-outline mt-1">
            {s && s.avgFare != null ? `Average fare ₹${Math.round(s.avgFare)} per priced trip. ` : ""}
            Based on the trip prices submitted so far. Online payments will be added here once the payment gateway is
            connected.
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
        <h3 className="text-sm font-bold text-nirvaan-dark mb-3">Driver performance (each driver's own numbers)</h3>
        <DriverPerformanceTable />
      </div>
    </div>
  );
}