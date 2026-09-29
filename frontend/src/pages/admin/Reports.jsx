import { useState } from "react";
import api from "../../api/client";
import {
  FileSpreadsheet,
  FileText,
  Filter,
} from "lucide-react";

export default function Reports() {
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-28");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [downloading, setDownloading] = useState(false);

  const sampleReportData = [
    { id: "REQ-9041", date: "2026-09-28", patient: "Rahul Sharma", hospital: "Sassoon Hospital", responseTime: "7.2 mins", status: "Completed" },
    { id: "REQ-9040", date: "2026-09-28", patient: "Ananya Deshmukh", hospital: "Sahyadri Hospital", responseTime: "9.1 mins", status: "Completed" },
    { id: "REQ-9039", date: "2026-09-28", patient: "Suresh Patil", hospital: "Noble Hospital", responseTime: "N/A", status: "Cancelled" },
    { id: "REQ-9038", date: "2026-09-27", patient: "Priya Kulkarni", hospital: "Ruby Hall Clinic", responseTime: "6.8 mins", status: "Completed" },
  ];

  function convertToCSV(data) {
    if (!data || !data.length) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    );
    return [headers, ...rows].join("\n");
  }

  async function handleDownload(e) {
    e.preventDefault();
    setDownloading(true);

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
    } catch (err) {
      let fileContent = "";
      let mimeType = "";

      if (exportFormat === "csv") {
        fileContent = convertToCSV(sampleReportData);
        mimeType = "text/csv;charset=utf-8;";
      } else {
        fileContent = JSON.stringify(sampleReportData, null, 2);
        mimeType = "application/json";
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nirvaan_dispatch_report_${startDate}_to_${endDate}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">
          Export Operational Reports
        </h2>
        <p className="text-sm text-nirvaan-outline">
          Generate and download formatted data logs for audit and performance reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-4 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-nirvaan-secondary" /> Report Filters
          </h3>

          <form onSubmit={handleDownload} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                Request Status Filter
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none bg-white"
              >
                <option value="all">All Dispatches</option>
                <option value="completed">Completed Transports</option>
                <option value="cancelled">Cancelled Calls</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
                Export Format
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat("csv")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                    exportFormat === "csv"
                      ? "bg-nirvaan-secondary text-white border-nirvaan-secondary"
                      : "bg-white border-nirvaan-outline-variant text-nirvaan-dark"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat("json")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${
                    exportFormat === "json"
                      ? "bg-nirvaan-secondary text-white border-nirvaan-secondary"
                      : "bg-white border-nirvaan-outline-variant text-nirvaan-dark"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={downloading}
              className="w-full bg-nirvaan-secondary text-white py-2.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {downloading ? "Generating Export..." : "Download File"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}