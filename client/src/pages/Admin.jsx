import { useEffect, useMemo, useState } from "react";
import {
  addContact,
  deleteContact,
  fetchAllContacts,
  updateContact,
} from "../api/api";

const ADMIN_PASSWORD = "roadsos2026";
const CONTACT_TYPES = [
  "hospital",
  "police",
  "ambulance",
  "towing",
  "puncture",
  "fuel",
  "mechanic",
];

const initialForm = {
  name: "",
  type: "hospital",
  phone: "",
  lat: "",
  lng: "",
  address: "",
  city: "",
  country: "India",
};

const badgeStyles = {
  hospital: "bg-red-500/20 text-red-300",
  police: "bg-blue-500/20 text-blue-300",
  ambulance: "bg-orange-500/20 text-orange-300",
  towing: "bg-amber-500/20 text-amber-300",
  puncture: "bg-slate-500/20 text-slate-300",
  fuel: "bg-green-500/20 text-green-300",
  mechanic: "bg-purple-500/20 text-purple-300",
};

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  return (
    <div
      className={`glass fixed bottom-4 right-4 z-50 min-w-[230px] overflow-hidden border-l-4 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] animate-[toast-in_220ms_ease] ${
        toast.type === "success" ? "border-l-emerald-500" : "border-l-red-500"
      }`}
    >
      {toast.message}
      <span
        className={`absolute bottom-0 left-0 h-0.5 animate-[toast-progress_3s_linear] ${
          toast.type === "success" ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
    </div>
  );
}

function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast("error", error.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadContacts();
    }
  }, [authenticated]);

  const countries = useMemo(() => {
    const unique = new Set(
      contacts.map((item) => item.country).filter((country) => Boolean(country))
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
        String(contact.city || "")
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const matchesType = typeFilter === "all" || contact.type === typeFilter;
      const matchesCountry =
        countryFilter === "all" || contact.country === countryFilter;

      return matchesSearch && matchesType && matchesCountry;
    });
  }, [contacts, searchText, typeFilter, countryFilter]);

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      hospitals: contacts.filter((c) => c.type === "hospital").length,
      police: contacts.filter((c) => c.type === "police").length,
      ambulances: contacts.filter((c) => c.type === "ambulance").length,
    };
  }, [contacts]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError("");
      return;
    }
    setAuthError("Incorrect password");
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();

    try {
      await addContact({
        ...formData,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      });
      setFormData(initialForm);
      setShowAddForm(false);
      await loadContacts();
      showToast("success", "Contact added!");
    } catch (error) {
      showToast("error", error.message || "Failed to add contact");
    }
  };

  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditData({
      name: contact.name,
      type: contact.type,
      phone: contact.phone,
      lat: contact.lat,
      lng: contact.lng,
      address: contact.address || "",
      city: contact.city || "",
      country: contact.country || "",
      verified: Number(contact.verified) === 1 ? 1 : 0,
      available: Number(contact.available) === 1 ? 1 : 0,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      await updateContact(id, {
        ...editData,
        lat: Number(editData.lat),
        lng: Number(editData.lng),
      });
      setEditingId(null);
      setEditData({});
      await loadContacts();
      showToast("success", "Updated!");
    } catch (error) {
      showToast("error", error.message || "Failed to update contact");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) {
      return;
    }

    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
      showToast("error", "Deleted");
    } catch (error) {
      showToast("error", error.message || "Failed to delete contact");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-[78vh] items-center justify-center bg-[var(--bg-base)] px-4">
        <section className="glass w-full max-w-md p-7">
          <div className="mb-5 text-center">
            <p className="font-['Syne'] text-3xl font-extrabold">
              <span className="text-white">Road</span><span className="text-red-500">SoS</span>
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Secure admin access</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="glass w-full rounded-lg px-3 py-2 outline-none focus:border-red-500"
            placeholder="Password"
          />
          {authError ? <p className="mt-2 text-sm font-semibold text-red-400">{authError}</p> : null}
          <button type="button" onClick={handleLogin} className="btn-primary mt-4 w-full font-semibold">
            Login
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-[var(--bg-base)] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-['Syne'] text-3xl font-extrabold text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="glass rounded-full px-3 py-1 text-xs text-[var(--text-secondary)]">
            roadsos2026 session
          </span>
          <button
            type="button"
            onClick={() => setAuthenticated(false)}
            className="btn-ghost px-3 py-1 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="glass border-t-2 border-t-slate-400 p-5">
          <p className="text-sm text-[var(--text-secondary)]">Total Contacts</p>
          <p className="mt-2 font-['Syne'] text-4xl font-extrabold text-red-500">{stats.total}</p>
        </article>
        <article className="glass border-t-2 border-t-red-500 p-5">
          <p className="text-sm text-[var(--text-secondary)]">Hospitals</p>
          <p className="mt-2 font-['Syne'] text-4xl font-extrabold text-red-500">{stats.hospitals}</p>
        </article>
        <article className="glass border-t-2 border-t-blue-500 p-5">
          <p className="text-sm text-[var(--text-secondary)]">Police Stations</p>
          <p className="mt-2 font-['Syne'] text-4xl font-extrabold text-red-500">{stats.police}</p>
        </article>
        <article className="glass border-t-2 border-t-orange-500 p-5">
          <p className="text-sm text-[var(--text-secondary)]">Ambulances</p>
          <p className="mt-2 font-['Syne'] text-4xl font-extrabold text-red-500">{stats.ambulances}</p>
        </article>
      </section>

      <section className="glass mt-6 p-5">
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          <span className="text-lg leading-none">+</span>
          {showAddForm ? "Hide Add Contact Form" : "Add Contact"}
        </button>

        {showAddForm ? (
          <form onSubmit={handleAddSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              required
              placeholder="Name*"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            >
              {CONTACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Phone*"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              required
              type="number"
              step="any"
              placeholder="Latitude*"
              value={formData.lat}
              onChange={(e) => setFormData((p) => ({ ...p, lat: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              required
              type="number"
              step="any"
              placeholder="Longitude*"
              value={formData.lng}
              onChange={(e) => setFormData((p) => ({ ...p, lng: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
              className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                className="btn-primary w-full py-2 font-semibold"
              >
                Save Contact
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="glass mt-6 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            placeholder="Search by name or city"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="glass rounded-lg px-3 py-2 capitalize outline-none focus:border-red-500"
          >
            <option value="all">All Types</option>
            {CONTACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="glass rounded-lg px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="all">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm text-[var(--text-secondary)]">
            <thead>
              <tr className="bg-white/5 text-left text-[var(--text-primary)]">
                <th className="px-2 py-3">#</th>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Type</th>
                <th className="px-2 py-3">Phone</th>
                <th className="px-2 py-3">City</th>
                <th className="px-2 py-3">Country</th>
                <th className="px-2 py-3">Verified</th>
                <th className="px-2 py-3">Available</th>
                <th className="px-2 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-2 py-4 text-center text-[var(--text-muted)]">
                    Loading contacts...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-4 text-center text-[var(--text-muted)]">
                    No contacts match your filter.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, index) => {
                  const isEditing = editingId === contact.id;

                  if (isEditing) {
                    return (
                      <tr key={contact.id} className="border-b border-white/5 odd:bg-white/[0.01]">
                        <td className="px-2 py-3">{index + 1}</td>
                        <td className="px-2 py-3">
                          <input
                            value={editData.name || ""}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, name: e.target.value }))
                            }
                            className="glass w-full rounded px-2 py-1 outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={editData.type || "hospital"}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, type: e.target.value }))
                            }
                            className="glass w-full rounded px-2 py-1 capitalize outline-none focus:border-red-500"
                          >
                            {CONTACT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            value={editData.phone || ""}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, phone: e.target.value }))
                            }
                            className="glass w-full rounded px-2 py-1 outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            value={editData.city || ""}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, city: e.target.value }))
                            }
                            className="glass w-full rounded px-2 py-1 outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            value={editData.country || ""}
                            onChange={(e) =>
                              setEditData((p) => ({ ...p, country: e.target.value }))
                            }
                            className="glass w-full rounded px-2 py-1 outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={Number(editData.verified) === 1 ? 1 : 0}
                            onChange={(e) =>
                              setEditData((p) => ({
                                ...p,
                                verified: Number(e.target.value),
                              }))
                            }
                            className="glass rounded px-2 py-1 outline-none focus:border-red-500"
                          >
                            <option value={1}>✓</option>
                            <option value={0}>✗</option>
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={Number(editData.available) === 1 ? 1 : 0}
                            onChange={(e) =>
                              setEditData((p) => ({
                                ...p,
                                available: Number(e.target.value),
                              }))
                            }
                            className="glass rounded px-2 py-1 outline-none focus:border-red-500"
                          >
                            <option value={1}>✓</option>
                            <option value={0}>✗</option>
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(contact.id)}
                              className="rounded bg-emerald-600 px-2 py-1 text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="btn-ghost px-2 py-1 text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={contact.id} className="border-b border-white/5 odd:bg-white/[0.01] hover:bg-white/[0.035]">
                      <td className="px-2 py-3">{index + 1}</td>
                      <td className="px-2 py-3 font-semibold text-[var(--text-primary)]">{contact.name}</td>
                      <td className="px-2 py-3">
                        <span
                          className={`badge ${
                            badgeStyles[contact.type] || "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {contact.type}
                        </span>
                      </td>
                      <td className="px-2 py-3">{contact.phone}</td>
                      <td className="px-2 py-3">{contact.city || "-"}</td>
                      <td className="px-2 py-3">{contact.country || "-"}</td>
                      <td className="px-2 py-3 text-lg">
                        {Number(contact.verified) === 1 ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-lg">
                        {Number(contact.available) === 1 ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(contact)}
                            className="btn-ghost px-2 py-1"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact.id)}
                            className="btn-ghost px-2 py-1"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Admin;
