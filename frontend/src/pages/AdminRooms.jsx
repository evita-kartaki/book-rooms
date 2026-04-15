import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const emptyForm = {
  Short_name: "",
  Description: "",
  Capacity: "",
  Floor: "",
  Category_id: "",
  is_active: true,
};

export default function AdminRooms({ embedded = false }) {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingRoomId, setEditingRoomId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access");

    if (!storedUser || !token) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin") {
        window.location.href = "/";
        return;
      }
    } catch (err) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    await Promise.all([fetchRooms(), fetchCategories()]);
  }

  function getAuthHeaders() {
    const token = localStorage.getItem("access");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  async function fetchRooms() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/rooms/`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`Αποτυχία φόρτωσης δωματίων (${res.status})`);
      }

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Δεν ήταν δυνατή η φόρτωση των δωματίων.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/categories/`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) return;

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories load error:", err);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingRoomId(null);
  }

  function startEdit(room) {
    setEditingRoomId(room.Room_id);
    setForm({
      Short_name: room.Short_name || "",
      Description: room.Description || "",
      Capacity: room.Capacity ?? "",
      Floor: room.Floor ?? "",
      Category_id: room.Category_id ?? "",
      is_active: room.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        Short_name: form.Short_name.trim(),
        Description: form.Description.trim(),
        Capacity: Number(form.Capacity),
        Floor: Number(form.Floor),
        Category_id: Number(form.Category_id),
        is_active: form.is_active,
      };

      const isEdit = !!editingRoomId;
      const url = isEdit
        ? `${API_BASE}/api/rooms/${editingRoomId}/`
        : `${API_BASE}/api/rooms/`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error(data);
        throw new Error(data?.message || data?.error || "Η αποθήκευση απέτυχε.");
      }

      if (data?.affected_bookings > 0) {
        alert(
          `Η ενέργεια ολοκληρώθηκε. Επηρεάστηκαν ${data.affected_bookings} κρατήσεις και στάλθηκαν ενημερωτικά email.`
        );
      }

      await fetchRooms();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Σφάλμα κατά την αποθήκευση.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(roomId) {
    const ok = window.confirm(
      "Θέλεις σίγουρα να διαγράψεις αυτό το δωμάτιο; Αν υπάρχουν μελλοντικές κρατήσεις, θα ακυρωθούν και θα σταλεί email ενημέρωσης."
    );
    if (!ok) return;

    try {
      setDeletingId(roomId);

      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Η διαγραφή απέτυχε.");
      }

      if (data?.affected_bookings > 0) {
        alert(
          `Η αίθουσα διαγράφηκε. Επηρεάστηκαν ${data.affected_bookings} κρατήσεις και στάλθηκαν ενημερωτικά email.`
        );
      }

      setRooms((prev) => prev.filter((r) => r.Room_id !== roomId));

      if (editingRoomId === roomId) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Δεν ήταν δυνατή η διαγραφή.");
    } finally {
      setDeletingId(null);
    }
  }

  function categoryLabel(categoryId) {
    const found = categories.find((c) => c.Category_id === categoryId);
    return found ? found.Description : `#${categoryId}`;
  }

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rooms.filter((room) => {
      const searchable = [
        room.Short_name,
        room.Description,
        String(room.Capacity ?? ""),
        String(room.Floor ?? ""),
        categoryLabel(room.Category_id),
        room.is_active ? "διαθέσιμη" : "μη διαθέσιμη",
      ]
        .join(" ")
        .toLowerCase();

      return !q || searchable.includes(q);
    });
  }, [rooms, query, categories]);

  return (
    <div className="admin-bookings-page min-vh-100">
      <div className="admin-bookings-overlay">
        <div className="container py-4 py-lg-5">
          <div className="admin-shell mx-auto">
            {!embedded && (
              <>
                <div className="admin-topbar d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                  <div>
                    <div className="admin-eyebrow">Admin Panel</div>
                    <h1 className="admin-title mb-1">Διαχείριση Δωματίων</h1>
                    <div className="admin-subtitle">
                      Δημιουργία, επεξεργασία και διαγραφή δωματίων.
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn admin-btn admin-btn-outline"
                      onClick={fetchInitialData}
                    >
                      Ανανέωση
                    </button>

                    <button
                      className="btn admin-btn admin-btn-outline"
                      onClick={handleLogout}
                    >
                      Αποσύνδεση
                    </button>

                    <a className="btn admin-btn admin-btn-outline" href="/">
                      Επιστροφή στο site
                    </a>
                  </div>
                </div>

                <div className="admin-tabs mt-4">
                  <Link className="admin-tab" to="/admin-bookings">
                    Διαχείριση Κρατήσεων
                  </Link>
                  <Link className="admin-tab active" to="/admin-rooms">
                    Διαχείριση Δωματίων
                  </Link>
                  <Link className="admin-tab" to="/admin-users">
                    Διαχείριση Χρηστών
                  </Link>
                </div>
              </>
            )}

            <div className="row g-4 mt-1">
              <div className="col-lg-5">
                <div className="admin-card p-3 p-lg-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                    <h2 className="h5 mb-0">
                      {editingRoomId ? "Επεξεργασία Δωματίου" : "Νέο Δωμάτιο"}
                    </h2>

                    {editingRoomId && (
                      <button
                        className="btn btn-sm admin-btn admin-btn-outline"
                        onClick={resetForm}
                        type="button"
                      >
                        Ακύρωση
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label admin-label">Σύντομο Όνομα</label>
                      <input
                        className="form-control admin-input"
                        name="Short_name"
                        value={form.Short_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label admin-label">Περιγραφή</label>
                      <input
                        className="form-control admin-input"
                        name="Description"
                        value={form.Description}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label admin-label">Χωρητικότητα</label>
                        <input
                          type="number"
                          className="form-control admin-input"
                          name="Capacity"
                          value={form.Capacity}
                          onChange={handleChange}
                          min="1"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label admin-label">Όροφος</label>
                        <input
                          type="number"
                          className="form-control admin-input"
                          name="Floor"
                          value={form.Floor}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3 mb-3">
                      <label className="form-label admin-label">Κατηγορία</label>
                      <select
                        className="form-select admin-input"
                        name="Category_id"
                        value={form.Category_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Επίλεξε κατηγορία</option>
                        {categories.map((cat) => (
                          <option key={cat.Category_id} value={cat.Category_id}>
                            {cat.Description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-check mt-3 mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                      />
                      <label
                        className="form-check-label admin-label ms-2"
                        htmlFor="is_active"
                      >
                        Η αίθουσα είναι διαθέσιμη
                      </label>
                    </div>

                    {error && (
                      <div className="alert alert-danger admin-alert">{error}</div>
                    )}

                    <button
                      type="submit"
                      className="btn admin-btn admin-btn-success w-100"
                      disabled={saving}
                    >
                      {saving
                        ? "Αποθήκευση..."
                        : editingRoomId
                        ? "Αποθήκευση Αλλαγών"
                        : "Δημιουργία Δωματίου"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="admin-card p-3 p-lg-4 mb-3">
                  <label className="form-label admin-label">Αναζήτηση</label>
                  <input
                    className="form-control admin-input"
                    placeholder="Όνομα, περιγραφή, χωρητικότητα, όροφος..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="admin-card table-card overflow-hidden">
                  {loading ? (
                    <div className="text-center py-5 text-muted">
                      Φόρτωση δωματίων...
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0 admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Όνομα</th>
                            <th>Περιγραφή</th>
                            <th>Χωρητικότητα</th>
                            <th>Όροφος</th>
                            <th>Κατηγορία</th>
                            <th>Κατάσταση</th>
                            <th className="text-end">Ενέργειες</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredRooms.map((room) => (
                            <tr key={room.Room_id}>
                              <td data-label="ID">{room.Room_id}</td>
                              <td data-label="Όνομα">{room.Short_name}</td>
                              <td data-label="Περιγραφή">{room.Description}</td>
                              <td data-label="Χωρητικότητα">{room.Capacity}</td>
                              <td data-label="Όροφος">{room.Floor}</td>
                              <td data-label="Κατηγορία">
                                {categoryLabel(room.Category_id)}
                              </td>
                              <td data-label="Κατάσταση">
                                {room.is_active ? "Διαθέσιμη" : "Μη διαθέσιμη"}
                              </td>
                              <td className="text-end" data-label="Ενέργειες">
                                <div className="d-flex flex-wrap justify-content-end gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm admin-action-btn admin-action-view"
                                    onClick={() => startEdit(room)}
                                  >
                                    Επεξεργασία
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm admin-action-btn admin-action-cancel"
                                    onClick={() => handleDelete(room.Room_id)}
                                    disabled={deletingId === room.Room_id}
                                  >
                                    {deletingId === room.Room_id
                                      ? "Διαγραφή..."
                                      : "Διαγραφή"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filteredRooms.length === 0 && (
                            <tr>
                              <td colSpan="8" className="text-center py-5 text-muted">
                                Δεν υπάρχουν δωμάτια.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center small text-muted mt-4">
              © 2026 RoomBooking • Admin Rooms
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-bookings-page { background: #f3f1e8; color: #1f3f3a; }
        .admin-bookings-overlay { min-height: 100vh; background: #f3f1e8; }
        .admin-shell { max-width: 1320px; }
        .admin-topbar, .admin-card {
          background: #ffffff;
          border: 1px solid #dbe7e2;
        }
        .admin-topbar { border-radius: 28px; padding: 1.5rem; }
        .admin-card, .table-card { border-radius: 24px; }
        .admin-eyebrow {
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #568078; margin-bottom: 0.35rem;
        }
        .admin-title { font-weight: 800; color: #163d36; }
        .admin-subtitle { color: #6c8580; font-size: 0.95rem; }

        .admin-tabs { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .admin-tab {
          text-decoration: none;
          border: 1px solid #dbe7e2;
          border-radius: 999px;
          padding: 0.9rem 1.35rem;
          font-weight: 700;
          background: #ffffff;
          color: #456660;
        }
        .admin-tab.active {
          background: #5e9187;
          color: white;
          border-color: #5e9187;
        }

        .admin-label { font-size: 0.85rem; color: #69827d; font-weight: 600; }
        .admin-input {
          border-radius: 16px; min-height: 48px; border: 1px solid #d6e5e0; box-shadow: none;
        }

        .admin-btn { border-radius: 999px; padding: 0.7rem 1.1rem; font-weight: 700; }
        .admin-btn-outline {
          background: transparent; color: #355a53; border: 1px solid #b8d2cb;
        }
        .admin-btn-success { background: #5e9187; color: white; border: none; }

        .admin-action-btn {
          border-radius: 999px; font-weight: 600; padding-inline: 0.9rem;
        }
        .admin-action-view {
          border: 1px solid #b7d7d1; color: #2b5b53; background: #f3fbf8;
        }
        .admin-action-cancel {
          border: 1px solid #d4d4d4; color: #616161; background: #f3f3f3;
        }

        .admin-table thead th {
          background: #edf6f3; color: #30544e; font-size: 0.9rem;
          border-bottom: 1px solid #dfece8; white-space: nowrap;
        }
        .admin-table tbody td { vertical-align: middle; border-color: #edf2f0; }
        .admin-alert { border-radius: 18px; }

        @media (max-width: 991px) {
          .admin-topbar { padding: 1.2rem; }
          .admin-title { font-size: 1.6rem; }
          .admin-tabs { flex-direction: column; }
          .admin-tab { width: 100%; text-align: center; }
        }

        @media (max-width: 767px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .admin-topbar,
          .admin-card {
            border-radius: 18px;
          }

          .admin-topbar { padding: 1rem; }
          .admin-title { font-size: 1.35rem; }
          .admin-subtitle { font-size: 0.9rem; }

          .admin-table thead {
            display: none;
          }

          .admin-table,
          .admin-table tbody,
          .admin-table tr,
          .admin-table td {
            display: block;
            width: 100%;
          }

          .admin-table tbody tr {
            padding: 0.9rem;
            border-bottom: 1px solid #edf2f0;
            background: #ffffff;
          }

          .admin-table tbody td {
            border: 0;
            padding: 0.45rem 0;
            text-align: left !important;
          }

          .admin-table tbody td::before {
            content: attr(data-label);
            display: block;
            font-size: 0.78rem;
            font-weight: 700;
            color: #6b817c;
            margin-bottom: 0.2rem;
          }

          .admin-table tbody td[data-label="Ενέργειες"] .d-flex {
            justify-content: flex-start !important;
          }

          .admin-action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}