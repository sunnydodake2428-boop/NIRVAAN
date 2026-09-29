import { useState } from "react";
import api from "../../api/client";
import { Save } from "lucide-react";

// NOTE: no sidebar / header / <main> here. AdminLayout already provides them.
export default function Settings() {
  const [orgName, setOrgName] = useState("Nirvaan Ambulance Services");
  const [supportPhone, setSupportPhone] = useState("112");
  const [supportEmail, setSupportEmail] = useState("");
  const [searchRadiusKm, setSearchRadiusKm] = useState(10);
  const [autoAssign, setAutoAssign] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.put("/admin/settings", {
        orgName,
        supportPhone,
        supportEmail,
        searchRadiusKm: Number(searchRadiusKm),
        autoAssign,
        smsAlerts,
        emailAlerts,
      });
      setMessage("Settings saved.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-nirvaan-secondary outline-none";

  const Toggle = ({ checked, onChange, label, hint }) => (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-nirvaan-dark">{label}</span>
        {hint && <span className="block text-[11px] text-nirvaan-outline">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-nirvaan-secondary shrink-0"
      />
    </label>
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-nirvaan-dark mb-1">Settings</h2>
        <p className="text-sm text-nirvaan-outline">
          Manage organization details, dispatch rules, and alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {message && (
          <p className="text-xs text-green-700 bg-green-50 p-3 rounded-lg font-medium border border-green-200">
            {message}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg font-medium border border-red-200">
            {error}
          </p>
        )}

        <section className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-4">Organization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">Organization name</label>
              <input className={inputClass} value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">Support phone</label>
              <input className={inputClass} value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-nirvaan-dark block mb-1">Support email</label>
              <input type="email" className={inputClass} value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-4">Dispatch rules</h3>
          <div className="mb-3 max-w-xs">
            <label className="text-xs font-semibold text-nirvaan-dark block mb-1">
              Driver search radius (km)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              className={inputClass}
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(e.target.value)}
            />
          </div>
          <Toggle
            checked={autoAssign}
            onChange={setAutoAssign}
            label="Auto-assign nearest ambulance"
            hint="Send new requests to the closest available driver first."
          />
        </section>

        <section className="bg-white p-5 rounded-xl border border-nirvaan-surface-high shadow-sm">
          <h3 className="text-sm font-bold text-nirvaan-dark mb-2">Alerts</h3>
          <Toggle checked={smsAlerts} onChange={setSmsAlerts} label="SMS alerts" hint="Notify admins about unassigned or cancelled requests." />
          <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email summaries" hint="Receive a daily operations summary." />
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-nirvaan-secondary text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:opacity-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}