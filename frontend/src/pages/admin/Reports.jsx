import { useState, useEffect } from "react";
import api from "../../api/client";
import { FileSpreadsheet, FileText, Filter, Download } from "lucide-react";

const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function Reports() {
  const [startDate, setStartDate] = useState(localISO(new Date(Date.now() - 29 * 86400000)));
  const [endDate, setEndDate] = useState(localISO(new Date()));
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const [preview, setPreview] = useState({ total: 0, rows: [] });
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    let on = true;
    setLoadingPreview(true);
    const t = setTimeout(() => {
      api
        .get("/admin/reports/preview", { params: { startDate, endDate, category: categoryFilter } })
        .then(({ data }) => on && setPreview(data))
        .catch(() => on && setPreview({ total: 0, rows: [] }))
        .finally(() => on && setLoadingPreview(false));
    }, 300);
    return () => {
      on = false;
      clearTimeout(t);
    };
  }, [startDate, endDate, categoryFilter]);

  async function handleDownload(e) {
    e.preventDefault();
    setDownloading(true);
    setError("");
    try {
      const response = await api.get("/admin/reports/download", {
        params: { startDate, endDate, category: categoryFilter, format: exportFormat },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `nirvaan_report_${startDate}_to_${endDate}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Could not generate the report. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const input =
    "w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none";

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">Export Operational Reports</h2>
        <p className="text-sm text-nirvaan-outline">
          Download real dispatch records, including how fast each driver accepted and arrived.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm lg:col-span-1 self-start">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-4 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-nirvaan-secondary" /> Report Filters
          </h3>

          <form onSubmit={handleDownload} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">From Date</label>
              <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className={input} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">To Date</label>
              <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={input} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">Request Status Filter</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`${input} bg-white`}>
                <option value="all">All Dispatches</option>
                <option value="completed">Completed Transports</option>
                <option value="cancelled">Cancelled Calls</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">Export Format</label>
              <div className="flex gap-2">
                {[
                  { id: "csv", label: "CSV", icon: FileSpreadsheet },
                  { id: "json", label: "JSON", icon: FileText },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setExportFormat(id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      exportFormat === id
                        ? "bg-nirvaan-secondary text-white border-nirvaan-secondary"
                        : "bg-white border-nirvaan-outline-variant text-nirvaan-dark"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={downloading}
              className="w-full mt-2 bg-nirvaan-secondary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {downloading ? "Generating..." : "Download File"}
            </button>
          </form>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm lg:col-span-2 min-w-0">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-1">Export Data Preview</h3>
          <p className="text-xs text-nirvaan-outline mb-4">
            {loadingPreview
              ? "Loading records..."
              : `${preview.total} record${preview.total === 1 ? "" : "s"} between ${startDate} and ${endDate}` +
                (preview.total > preview.rows.length ? ` (showing the latest ${preview.rows.length})` : "")}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-nirvaan-surface-high text-nirvaan-outline font-bold">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Patient</th>
                  <th className="py-2 px-2">Driver</th>
                  <th className="py-2 px-2">Hospital</th>
                  <th className="py-2 px-2">Accept</th>
                  <th className="py-2 px-2">Arrive</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nirvaan-surface-high text-nirvaan-dark font-medium">
                {!loadingPreview && preview.rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-nirvaan-outline">
                      No records for this period.
                    </td>
                  </tr>
                )}
                {preview.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 px-2 font-extrabold text-nirvaan-primary">{row.id}</td>
                    <td className="py-2.5 px-2 text-gray-500">{row.date}</td>
                    <td className="py-2.5 px-2">{row.patient}</td>
                    <td className="py-2.5 px-2">{row.driver}</td>
                    <td className="py-2.5 px-2 text-nirvaan-secondary">{row.hospital}</td>
                    <td className="py-2.5 px-2">{row.acceptTime}</td>
                    <td className="py-2.5 px-2">{row.arrivalTime}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                          row.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : row.status === "cancelled"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}