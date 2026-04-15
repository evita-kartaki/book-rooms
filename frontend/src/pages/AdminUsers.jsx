import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const emptyForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  role: "client",
  password: "",
};

export default function AdminUsers({ embedded = false }) {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingUserId, setEditingUserId] = useState(null);

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

    fetchUsers();
  }, []);

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

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/users/`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`Αποτυχία φόρτωσης χρηστών (${res.status})`);
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Δεν ήταν δυνατή η φόρτωση των χρηστών.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingUserId(null);
  }

  function startEdit(user) {
    setEditingUserId(user.id);
    setForm({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      role: user.role || "client",
      password: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setSaving(true);
  setError("");

  try {
    const basePayload = {
      username: form.username.trim(),
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      role: form.role,
    };

    if (!editingUserId) {
      basePayload.password = form.password.trim();
    }

    if (editingUserId) {
      const res = await fetch(`${API_BASE}/api/users/${editingUserId}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(basePayload),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        console.error(data);
        throw new Error(
          data?.username?.[0] ||
            data?.email?.[0] ||
            data?.phone?.[0] ||
            data?.error ||
            "Η ενημέρωση χρήστη απέτυχε."
        );
      }

      if (form.password.trim()) {
        const passRes = await fetch(
          `${API_BASE}/api/users/${editingUserId}/set-password/`,
          {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ password: form.password.trim() }),
          }
        );

        const passData = await passRes.json().catch(() => null);

        if (!passRes.ok) {
          console.error(passData);
          throw new Error(passData?.error || "Η αλλαγή κωδικού απέτυχε.");
        }
      }
    } else {
      const createRes = await fetch(`${API_BASE}/api/users/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(basePayload),
      });

      const createData = await createRes.json().catch(() => null);

      if (createRes.status === 401) {
        handleLogout();
        return;
      }

      if (!createRes.ok) {
        console.error(createData);
        throw new Error(
          createData?.username?.[0] ||
            createData?.email?.[0] ||
            createData?.phone?.[0] ||
            createData?.password?.[0] ||
            createData?.error ||
            "Η δημιουργία χρήστη απέτυχε."
        );
      }
    }

    await fetchUsers();
    resetForm();
  } catch (err) {
    console.error(err);
    setError(err.message || "Σφάλμα κατά την αποθήκευση.");
  } finally {
    setSaving(false);
  }
}

  async function handleDelete(userId) {
    const ok = window.confirm("Θέλεις σίγουρα να διαγράψεις αυτόν τον χρήστη;");
    if (!ok) return;

    try {
      setDeletingId(userId);

      const res = await fetch(`${API_BASE}/api/users/${userId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error("Η διαγραφή απέτυχε.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      if (editingUserId === userId) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Δεν ήταν δυνατή η διαγραφή.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const searchable = [
        user.username,
        user.email,
        user.first_name,
        user.last_name,
        user.phone,
        user.role,
      ]
        .join(" ")
        .toLowerCase();

      return !q || searchable.includes(q);
    });
  }, [users, query]);

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
                    <h1 className="admin-title mb-1">Διαχείριση Χρηστών</h1>
                    <div className="admin-subtitle">
                      Δημιουργία, επεξεργασία και διαγραφή χρηστών.
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn admin-btn admin-btn-outline"
                      onClick={fetchUsers}
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
                  <Link className="admin-tab" to="/admin-rooms">
                    Διαχείριση Δωματίων
                  </Link>
                  <Link className="admin-tab active" to="/admin-users">
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
                      {editingUserId ? "Επεξεργασία Χρήστη" : "Νέος Χρήστης"}
                    </h2>

                    {editingUserId && (
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
                      <label className="form-label admin-label">Username</label>
                      <input
                        className="form-control admin-input"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label admin-label">Email</label>
                      <input
                        type="email"
                        className="form-control admin-input"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label admin-label">Όνομα</label>
                        <input
                          className="form-control admin-input"
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label admin-label">Επώνυμο</label>
                        <input
                          className="form-control admin-input"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label admin-label">Τηλέφωνο</label>
                      <input
                        className="form-control admin-input"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="row g-3 mt-0">
                      <div className="col-md-6">
                        <label className="form-label admin-label">Ρόλος</label>
                        <select
                          className="form-select admin-input"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          required
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label admin-label">
                          {editingUserId ? "Νέος Κωδικός (προαιρετικό)" : "Κωδικός"}
                        </label>
                        <input
                            type="password"
                            className="form-control admin-input"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder={editingUserId ? "Άφησέ το κενό αν δεν αλλάζει" : "Υποχρεωτικό"}
                            required={!editingUserId}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="alert alert-danger admin-alert mt-3">{error}</div>
                    )}

                    <button
                      type="submit"
                      className="btn admin-btn admin-btn-success w-100 mt-3"
                      disabled={saving}
                    >
                      {saving
                        ? "Αποθήκευση..."
                        : editingUserId
                        ? "Αποθήκευση Αλλαγών"
                        : "Δημιουργία Χρήστη"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="admin-card p-3 p-lg-4 mb-3">
                  <label className="form-label admin-label">Αναζήτηση</label>
                  <input
                    className="form-control admin-input"
                    placeholder="Username, email, όνομα, ρόλος..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="admin-card table-card overflow-hidden">
                  {loading ? (
                    <div className="text-center py-5 text-muted">
                      Φόρτωση χρηστών...
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0 admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Όνομα</th>
                            <th>Email</th>
                            <th>Τηλέφωνο</th>
                            <th>Ρόλος</th>
                            <th className="text-end">Ενέργειες</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id}>
                              <td data-label="ID">{user.id}</td>
                              <td data-label="Username">{user.username}</td>
                              <td data-label="Όνομα">
                                {`${user.first_name || ""} ${user.last_name || ""}`.trim() || "-"}
                              </td>
                              <td data-label="Email">{user.email || "-"}</td>
                              <td data-label="Τηλέφωνο">{user.phone || "-"}</td>
                              <td data-label="Ρόλος">{user.role || "-"}</td>
                              <td className="text-end" data-label="Ενέργειες">
                                <div className="d-flex flex-wrap justify-content-end gap-2">
                                  <button
                                    className="btn btn-sm admin-action-btn admin-action-view"
                                    onClick={() => startEdit(user)}
                                  >
                                    Επεξεργασία
                                  </button>

                                  <button
                                    className="btn btn-sm admin-action-btn admin-action-cancel"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={deletingId === user.id}
                                  >
                                    Διαγραφή
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan="7" className="text-center py-5 text-muted">
                                Δεν υπάρχουν χρήστες.
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
              © 2026 RoomBooking • Admin Users
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