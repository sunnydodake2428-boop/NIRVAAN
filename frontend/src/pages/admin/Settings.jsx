import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  Ambulance,
  LayoutDashboard,
  Users,
  History,
  Truck,
  Hospital,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Download,
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

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: History, label: "History", href: "/admin/history" },
    { icon: Truck, label: "Fleet", href: "/admin/fleet" },
    { icon: Hospital, label: "Hospitals", href: "/admin/hospitals" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: FileSpreadsheet, label: "Reports", href: "/admin/reports", active: true },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-nirvaan-bg flex flex-col md:flex-row">
      {/* Mobile Top Navigation Header */}
      <header className="bg-white border-b border-nirvaan-surface-high p-4 flex flex-col gap-3 md:hidden">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                item.active
                  ? "bg-nirvaan-secondary text-white"
                  : "bg-white text-nirvaan-dark border border-nirvaan-surface-high hover:bg-nirvaan-surface"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="w-60 bg-white border-r border-nirvaan-surface-high px-4 py-6 hidden md:flex md:flex-col shrink-0">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight mb-8 flex items-center gap-2">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                item.active
                  ? "bg-nirvaan-secondary text-white"
                  : "text-nirvaan-dark hover:bg-nirvaan-surface"
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-5xl overflow-y-auto">
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
                className="w-full mt-2 bg-nirvaan-secondary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity"
              >
                <Download className="w-4 h-4" /> {downloading ? "Generating..." : "Download File"}
              </button>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-nirvaan-dark mb-1">Export Data Preview</h3>
            <p className="text-xs text-nirvaan-outline mb-4">
              Showing preview of records matching period: <span className="font-semibold text-nirvaan-dark">{startDate}</span> to <span className="font-semibold text-nirvaan-dark">{endDate}</span>
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-nirvaan-surface-high text-nirvaan-outline font-bold">
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Patient</th>
                    <th className="py-2 px-2">Hospital</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nirvaan-surface-high text-nirvaan-dark font-medium">
                  {sampleReportData.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2.5 px-2 font-extrabold text-nirvaan-primary">{row.id}</td>
                      <td className="py-2.5 px-2 text-gray-500">{row.date}</td>
                      <td className="py-2.5 px-2">{row.patient}</td>
                      <td className="py-2.5 px-2 text-nirvaan-secondary">{row.hospital}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            row.status === "Completed"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
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
      </main>
    </div>
  );
}