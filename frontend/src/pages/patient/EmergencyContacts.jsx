import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { ChevronLeft, Phone, Trash2, Plus } from "lucide-react";

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState("");

  function loadContacts() {
    api.get("/contacts").then((res) => setContacts(res.data));
  }

  useEffect(() => {
    loadContacts();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/contacts", { name, phone, relationship });
      setName("");
      setPhone("");
      setRelationship("");
      loadContacts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add contact");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/contacts/${id}`);
    loadContacts();
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-10 max-w-md mx-auto md:max-w-lg">
      <header className="flex items-center gap-3 px-4 py-4 bg-nirvaan-bg">
        <button onClick={() => navigate(-1)} className="text-nirvaan-dark">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-nirvaan-dark">Emergency Contacts</h1>
      </header>

      <div className="px-4">
        {/* Existing contacts */}
        <ul className="space-y-3 mb-6">
          {contacts.map((c) => (
            <li key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-nirvaan-surface-high flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-nirvaan-surface flex items-center justify-center">
                  <Phone className="w-4 h-4 text-nirvaan-secondary" />
                </span>
                <div>
                  <p className="font-bold text-nirvaan-dark">{c.name}</p>
                  <p className="text-xs text-nirvaan-outline">{c.phone} {c.relationship && `· ${c.relationship}`}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-nirvaan-primary">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {contacts.length === 0 && (
            <p className="text-sm text-nirvaan-outline">No emergency contacts added yet.</p>
          )}
        </ul>

        {/* Add new contact */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-nirvaan-surface-high">
          <h3 className="font-bold text-nirvaan-dark mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Contact
          </h3>
          <form onSubmit={handleAdd}>
            {error && <p className="text-nirvaan-primary text-sm mb-2 font-medium">{error}</p>}
            <input
              className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              className="w-full border border-nirvaan-outline-variant rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-nirvaan-secondary"
              placeholder="Relationship (e.g. Mother, Spouse)"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
            <button type="submit" className="w-full bg-nirvaan-secondary text-white py-3 rounded-lg font-bold">
              Add Contact
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}