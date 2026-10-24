import { useEffect, useState } from "react";
import api from "../../api/client";
import { Star } from "lucide-react";

// Accept times above this are shown in red. Change it to your own target.
const SLOW_MINUTES = 10;

const RANGES = [
  { label: "All time", value: 0 },
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
];

const mins = (m) => (m == null ? "—" : `${m} min`);

export default function DriverPerformanceTable({ limit, showRange = true }) {
  const [days, setDays] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let on = true;
    setLoading(true);
    setError("");
    api
      .get("/admin/drivers/performance", { params: { days } })
      .then(({ data }) => on && setRows(data.drivers || []))
      .catch(() => on && setError("Could not load driver performance."))
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, [days]);

  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <div>
      {showRange && (
        <div className="flex gap-2 mb-3">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                days === r.value
                  ? "bg-nirvaan-secondary text-white"
                  : "bg-nirvaan-surface text-nirvaan-dark hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[560px]">
          <thead>
            <tr className="border-b border-nirvaan-surface-high text-nirvaan-outline font-semibold">
              <th className="pb-2 px-2">Driver</th>
              <th className="pb-2 px-2">Trips</th>
              <th className="pb-2 px-2">Avg time to accept</th>
              <th className="pb-2 px-2">Avg time to arrive</th>
              <th className="pb-2 px-2">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nirvaan-surface-high font-medium">
            {loading && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-nirvaan-outline">
                  Loading driver performance...
                </td>
              </tr>
            )}
            {!loading && shown.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-nirvaan-outline">
                  No drivers registered yet.
                </td>
              </tr>
            )}
            {!loading &&
              shown.map((d) => (
                <tr key={d.id} className="hover:bg-nirvaan-surface">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${d.online ? "bg-green-500" : "bg-slate-300"}`}
                        title={d.online ? "Online" : "Offline"}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-nirvaan-dark truncate">{d.name}</p>
                        <p className="text-[10px] text-nirvaan-outline">{d.vehicle || "No vehicle code"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    {d.tripsTaken}
                    <span className="text-nirvaan-outline"> ({d.tripsCompleted} done)</span>
                  </td>
                  <td
                    className={`py-2.5 px-2 font-bold ${
                      d.avgAcceptMinutes != null && d.avgAcceptMinutes > SLOW_MINUTES
                        ? "text-red-600"
                        : "text-nirvaan-dark"
                    }`}
                  >
                    {mins(d.avgAcceptMinutes)}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-nirvaan-dark">
                    {mins(d.avgArrivalMinutes)}
                    {d.arrivalSamples > 0 && (
                      <span className="text-nirvaan-outline font-medium"> ({d.arrivalSamples})</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2">
                    {d.rating == null ? (
                      "—"
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> {d.rating.toFixed(1)}
                        <span className="text-nirvaan-outline">({d.ratingCount})</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-nirvaan-outline mt-3 leading-relaxed">
        <span className="font-semibold">Time to accept</span> = from the patient's request until this driver
        accepted it. <span className="font-semibold">Time to arrive</span> = from accepting until the driver tapped
        "Arrived" at the pickup (number in brackets = trips measured). Both come from real trip records.
      </p>
    </div>
  );
}