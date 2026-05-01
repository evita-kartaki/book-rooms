import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { el } from "date-fns/locale";

const API_BASE = "http://127.0.0.1:8000";

const locales = {
  el,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: el }),
  getDay,
  locales,
});

export default function AdminBookings({ embedded = false }) {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      console.error("Invalid user in localStorage:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return;
    }

    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      const res = await fetch(`${API_BASE}/api/bookings/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (res.status === 403) {
        setError("Δεν έχεις δικαίωμα πρόσβασης σε αυτή τη σελίδα.");
        return;
      }

      if (!res.ok) {
        throw new Error(`Αποτυχία φόρτωσης κρατήσεων (${res.status})`);
      }

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Δεν ήταν δυνατή η φόρτωση των κρατήσεων.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, newStatus) {
    try {
      setActionLoadingId(bookingId);

      const token = localStorage.getItem("access");

      const res = await fetch(
        `${API_BASE}/api/bookings/${bookingId}/update_status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ Status: newStatus }),
        }
      );

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Status update error:", data);
        alert(data?.error || "Η αλλαγή κατάστασης απέτυχε.");
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.Booking_id === bookingId ? { ...b, Status: newStatus } : b
        )
      );

      if (selectedBooking?.Booking_id === bookingId) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, Status: newStatus } : prev
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Σφάλμα σύνδεσης με τον server.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function deleteBooking(bookingId) {
  const ok = window.confirm(
    "Θέλεις σίγουρα να διαγράψεις οριστικά αυτή την κράτηση;"
  );
  if (!ok) return;

  try {
    setActionLoadingId(bookingId);

    const token = localStorage.getItem("access");

    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      handleLogout();
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      console.error("Delete booking error:", data);
      alert(data?.error || "Η διαγραφή της κράτησης απέτυχε.");
      return;
    }

    setBookings((prev) => prev.filter((b) => b.Booking_id !== bookingId));

    if (selectedBooking?.Booking_id === bookingId) {
      closeViewModal();
    }
  } catch (err) {
    console.error("Delete booking error:", err);
    alert("Σφάλμα σύνδεσης με τον server.");
  } finally {
    setActionLoadingId(null);
  }
}

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  function openViewModal(booking) {
    setSelectedBooking(booking);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedBooking(null);
    setShowViewModal(false);
  }

  function handleSelectEvent(event) {
    if (event?.resource) {
      openViewModal(event.resource);
    }
  }

  function statusBadge(statusValue) {
  if (statusValue === "CHECKED_IN") {
    return "badge rounded-pill admin-badge admin-badge-info";
  }
  if (statusValue === "COMPLETED") {
    return "badge rounded-pill admin-badge admin-badge-success";
  }
  if (statusValue === "UPCOMING") {
    return "badge rounded-pill admin-badge admin-badge-warning";
  }
  if (statusValue === "CANCELLED") {
    return "badge rounded-pill admin-badge admin-badge-cancelled";
  }
  return "badge rounded-pill admin-badge admin-badge-default";
}

  function statusLabel(statusValue) {
  if (statusValue === "CHECKED_IN") return "Εισήλθε";
  if (statusValue === "COMPLETED") return "Ολοκληρωμένη";
  if (statusValue === "UPCOMING") return "Επερχόμενη";
  if (statusValue === "CANCELLED") return "Ακυρωμένη";
  return statusValue || "-";
}

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("el-GR");
  }

  function formatTime(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function fullName(booking) {
    return (
      `${booking.Guest_first_name || ""} ${booking.Guest_last_name || ""}`.trim() ||
      "-"
    );
  }

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((b) => b.Status === "UPCOMING").length;
    const checkedIn = bookings.filter((b) => b.Status === "CHECKED_IN").length;
    const completed = bookings.filter((b) => b.Status === "COMPLETED").length;
    const cancelled = bookings.filter((b) => b.Status === "CANCELLED").length;

    return { total, upcoming, checkedIn, completed, cancelled };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = query.trim().toLowerCase();

      const searchableText = [
        String(b.Booking_id || ""),
        b.room_name || "",
        b.Guest_first_name || "",
        b.Guest_last_name || "",
        b.Guest_email || "",
        b.Guest_phone || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchQuery = !q || searchableText.includes(q);
      const matchStatus = status === "all" ? true : b.Status === status;

      return matchQuery && matchStatus;
    });
  }, [bookings, query, status]);

  const calendarEvents = useMemo(() => {
    return filtered
      .filter((b) => b.Start_time && b.End_time)
      .map((b) => ({
        id: b.Booking_id,
        title: isMobile
          ? `${b.room_name || "Αίθουσα"}`
          : `${b.room_name || "Αίθουσα"} • ${fullName(b)}`,
        start: new Date(b.Start_time),
        end: new Date(b.End_time),
        resource: b,
      }));
  }, [filtered, isMobile]);

  function eventStyleGetter(event) {
  const booking = event.resource;

  let backgroundColor = "#5e9187";
  let borderColor = "#5e9187";
  let color = "#ffffff";

  if (booking.Status === "CHECKED_IN") {
    backgroundColor = "#4a90e2";
    borderColor = "#4a90e2";
  } else if (booking.Status === "COMPLETED") {
    backgroundColor = "#4f8a6f";
    borderColor = "#4f8a6f";
  } else if (booking.Status === "CANCELLED") {
    backgroundColor = "#a8a8a8";
    borderColor = "#a8a8a8";
  } else if (booking.Status === "UPCOMING") {
    backgroundColor = "#d8b453";
    borderColor = "#d8b453";
    color = "#21302d";
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      color,
      borderRadius: isMobile ? "6px" : "10px",
      border: "none",
      boxShadow: "none",
      paddingInline: isMobile ? "2px" : "4px",
      fontWeight: 600,
      fontSize: isMobile ? "0.68rem" : "0.82rem",
      minHeight: isMobile ? "18px" : "auto",
    },
  };
}

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
                    <h1 className="admin-title mb-1">Διαχείριση Κρατήσεων</h1>
                    <div className="admin-subtitle">
                      Προβολή και διαχείριση όλων των κρατήσεων του συστήματος.
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn admin-btn admin-btn-soft"
                      onClick={() => window.print()}
                    >
                      Εκτύπωση / PDF
                    </button>

                    <button
                      className="btn admin-btn admin-btn-outline"
                      onClick={fetchBookings}
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
                  <a className="admin-tab active" href="/admin-bookings">
                    Διαχείριση Κρατήσεων
                  </a>
                  <a className="admin-tab" href="/admin-rooms">
                    Διαχείριση Δωματίων
                  </a>
                  <a className="admin-tab" href="/admin-users">
                    Διαχείριση Χρηστών
                  </a>
                </div>
              </>
            )}

            <div className="row g-3 mt-1 mb-4">
              <div className="col-6 col-lg-3">
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Σύνολο</div>
                  <div className="admin-stat-value">{stats.total}</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Επερχόμενες</div>
                  <div className="admin-stat-value">{stats.upcoming}</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Ολοκληρωμένες</div>
                  <div className="admin-stat-value">{stats.completed}</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Ακυρωμένες</div>
                  <div className="admin-stat-value">{stats.cancelled}</div>
                </div>
              </div>
            </div>

            <div className="admin-card p-3 p-lg-4 mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <div className="admin-eyebrow">Ημερολόγιο Κρατήσεων</div>
                  <h2 className="admin-subtitle">Προβολή όλων των κρατήσεων</h2>
                </div>
              </div>

              <div className="admin-calendar-wrap">
                {!loading && calendarEvents.length > 0 ? (
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    defaultDate={new Date()}
                    views={["month", "day", "agenda"]}
                    culture="el"
                    popup
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    style={{ height: isMobile ? 360 : 650 }}
                    messages={{
                      next: "Επόμενο",
                      previous: "Προηγούμενο",
                      today: "Σήμερα",
                      month: "Μήνας",
                      week: "Εβδομάδα",
                      day: "Ημέρα",
                      agenda: "Λίστα",
                      date: "Ημερομηνία",
                      time: "Ώρα",
                      event: "Κράτηση",
                      noEventsInRange: "Δεν υπάρχουν κρατήσεις σε αυτό το διάστημα.",
                      showMore: (total) => `+${total} ακόμη`,
                    }}
                  />
                ) : (
                  <div className="text-center py-4 text-muted">
                    {loading
                      ? "Φόρτωση ημερολογίου..."
                      : "Δεν υπάρχουν κρατήσεις για προβολή στο ημερολόγιο."}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card p-3 p-lg-4 mb-3">
              <div className="row g-3 align-items-end">
                <div className="col-lg-8">
                  <label className="form-label admin-label">Αναζήτηση</label>
                  <input
                    className="form-control admin-input"
                    placeholder="ID, όνομα, email, τηλέφωνο, δωμάτιο..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="col-lg-4">
                  <label className="form-label admin-label">Κατάσταση</label>
                  <select
                  className="form-select admin-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">Όλες</option>
                  <option value="UPCOMING">Επερχόμενες</option>
                  <option value="CHECKED_IN">Εισήλθαν</option>
                  <option value="COMPLETED">Ολοκληρωμένες</option>
                  <option value="CANCELLED">Ακυρωμένες</option>
                </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger admin-alert mb-3">{error}</div>
            )}

            <div className="admin-card table-card overflow-hidden">
              {loading ? (
                <div className="text-center py-5 text-muted">
                  Φόρτωση κρατήσεων...
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0 admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Δωμάτιο</th>
                        <th>Ημ/νία</th>
                        <th>Ώρα</th>
                        <th>Χρήστης</th>
                        <th>Status</th>
                        <th className="text-end">Ενέργειες</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((b) => (
                        <tr key={b.Booking_id}>
                          <td className="fw-semibold" data-label="ID">
                            {b.Booking_id}
                          </td>

                          <td data-label="Δωμάτιο">{b.room_name || "-"}</td>

                          <td data-label="Ημ/νία">{formatDate(b.Start_time)}</td>

                          <td data-label="Ώρα">
                            {formatTime(b.Start_time)} - {formatTime(b.End_time)}
                          </td>

                          <td data-label="Χρήστης">
                            <div className="fw-semibold">{fullName(b)}</div>
                            <div className="small text-muted">
                              {b.Guest_email || "-"}
                            </div>
                            <div className="small text-muted">
                              {b.Guest_phone || "-"}
                            </div>
                          </td>

                          <td data-label="Status">
                            <span className={statusBadge(b.Status)}>
                              {statusLabel(b.Status)}
                            </span>
                          </td>

                          <td className="text-end" data-label="Ενέργειες">
                            <div className="d-flex flex-wrap justify-content-end gap-2">
                              <button
                                className="btn btn-sm admin-action-btn admin-action-view"
                                onClick={() => openViewModal(b)}
                              >
                                Προβολή
                              </button>

                              <button
                                className="btn btn-sm admin-action-btn admin-action-confirm"
                                onClick={() =>
                                  updateStatus(b.Booking_id, "COMPLETED")
                                }
                                disabled={actionLoadingId === b.Booking_id}
                              >
                                Επιβεβαίωση
                              </button>

                              <button
                                className="btn btn-sm admin-action-btn admin-action-reset"
                                onClick={() =>
                                  updateStatus(b.Booking_id, "UPCOMING")
                                }
                                disabled={actionLoadingId === b.Booking_id}
                              >
                                Επαναφορά
                              </button>

                              <button
                                className="btn btn-sm admin-action-btn admin-action-cancel"
                                onClick={() =>
                                  updateStatus(b.Booking_id, "CANCELLED")
                                }
                                disabled={actionLoadingId === b.Booking_id}
                              >
                                Ακύρωση
                              </button>
                              <button
                                className="btn btn-sm admin-action-btn admin-action-delete"
                                onClick={() => deleteBooking(b.Booking_id)}
                                disabled={actionLoadingId === b.Booking_id}
                              >
                                Διαγραφή
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            Δεν υπάρχουν κρατήσεις.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="text-center small text-muted mt-4">
              © 2026 RoomBooking • Admin Bookings
            </div>
          </div>
        </div>
      </div>

      {showViewModal && selectedBooking && (
        <>
          <div className="admin-modal-backdrop" onClick={closeViewModal}></div>

          <div className="admin-modal-wrap">
            <div className="admin-modal-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="admin-eyebrow">Λεπτομέρειες</div>
                  <h2 className="h4 mb-0">
                    Κράτηση #{selectedBooking.Booking_id}
                  </h2>
                </div>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={closeViewModal}
                >
                  Κλείσιμο
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label admin-label">ID</label>
                  <input
                    className="form-control admin-input"
                    value={selectedBooking.Booking_id}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label admin-label">Δωμάτιο</label>
                  <input
                    className="form-control admin-input"
                    value={selectedBooking.room_name || "-"}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label admin-label">Ημερομηνία</label>
                  <input
                    className="form-control admin-input"
                    value={formatDate(selectedBooking.Start_time)}
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label admin-label">Από</label>
                  <input
                    className="form-control admin-input"
                    value={formatTime(selectedBooking.Start_time)}
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label admin-label">Έως</label>
                  <input
                    className="form-control admin-input"
                    value={formatTime(selectedBooking.End_time)}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label admin-label">Όνομα</label>
                  <input
                    className="form-control admin-input"
                    value={fullName(selectedBooking)}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label admin-label">Email</label>
                  <input
                    className="form-control admin-input"
                    value={selectedBooking.Guest_email || "-"}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label admin-label">Τηλέφωνο</label>
                  <input
                    className="form-control admin-input"
                    value={selectedBooking.Guest_phone || "-"}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label admin-label">Κατάσταση</label>
                  <input
                    className="form-control admin-input"
                    value={statusLabel(selectedBooking.Status)}
                    disabled
                  />
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <button
                  className="btn admin-btn admin-btn-success"
                  onClick={() =>
                    updateStatus(selectedBooking.Booking_id, "COMPLETED")
                  }
                  disabled={actionLoadingId === selectedBooking.Booking_id}
                >
                  Επιβεβαίωση
                </button>

                <button
                  className="btn admin-btn admin-btn-warning"
                  onClick={() =>
                    updateStatus(selectedBooking.Booking_id, "UPCOMING")
                  }
                  disabled={actionLoadingId === selectedBooking.Booking_id}
                >
                  Επαναφορά
                </button>

                <button
                  className="btn admin-btn admin-btn-cancel"
                  onClick={() =>
                    updateStatus(selectedBooking.Booking_id, "CANCELLED")
                  }
                  disabled={actionLoadingId === selectedBooking.Booking_id}
                >
                  Ακύρωση
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .admin-bookings-page {
          background: #f3f1e8;
          color: #1f3f3a;
        }

        .admin-bookings-overlay {
          min-height: 100vh;
          background: #f3f1e8;
        }

        .admin-shell {
          max-width: 1320px;
        }

        .admin-topbar,
        .admin-card,
        .admin-stat-card,
        .admin-modal-card {
          background: #ffffff;
          border: 1px solid #dbe7e2;
          box-shadow: none;
        }

        .admin-topbar {
          border-radius: 28px;
          padding: 1.5rem;
        }

        .admin-card,
        .admin-stat-card {
          border-radius: 24px;
        }

        .admin-stat-card {
          padding: 1.2rem;
          height: 100%;
        }

        .admin-stat-label {
          font-size: 0.9rem;
          color: #6b817c;
          margin-bottom: 0.35rem;
        }

        .admin-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1d4f47;
          line-height: 1;
        }

        .admin-eyebrow {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #568078;
          margin-bottom: 0.35rem;
        }

        .admin-title {
          font-weight: 800;
          color: #163d36;
        }

        .admin-subtitle {
          color: #6c8580;
          font-size: 0.95rem;
        }

        .admin-tabs {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

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

        .admin-label {
          font-size: 0.85rem;
          color: #69827d;
          font-weight: 600;
        }

        .admin-input {
          border-radius: 16px;
          min-height: 48px;
          border: 1px solid #d6e5e0;
          box-shadow: none;
        }

        .admin-input:focus {
          border-color: #76a99f;
          box-shadow: 0 0 0 0.2rem rgba(110, 168, 157, 0.18);
        }

        .table-card {
          border-radius: 24px;
        }

        .admin-table thead th {
          background: #edf6f3;
          color: #30544e;
          font-size: 0.9rem;
          border-bottom: 1px solid #dfece8;
          white-space: nowrap;
        }

        .admin-table tbody td {
          vertical-align: middle;
          border-color: #edf2f0;
        }

        .admin-table tbody tr:hover {
          background: #f7fbf9;
        }

        .admin-btn {
          border-radius: 999px;
          padding: 0.7rem 1.1rem;
          font-weight: 700;
        }

        .admin-btn-soft {
          background: #f3f7f5;
          color: #355a53;
          border: 1px solid #dce8e4;
        }

        .admin-btn-soft:hover,
        .admin-btn-outline:hover {
          background: #eaf3f0;
          color: #23453f;
        }

        .admin-btn-outline {
          background: transparent;
          color: #355a53;
          border: 1px solid #b8d2cb;
        }

        .admin-btn-success {
          background: #5e9187;
          color: white;
          border: none;
        }

        .admin-btn-success:hover {
          background: #517f76;
          color: white;
        }

        .admin-btn-warning {
          background: #fff3cd;
          color: #7a5c00;
          border: 1px solid #f0df9a;
        }

        .admin-btn-warning:hover {
          background: #f8e9b3;
          color: #6b5100;
        }

        .admin-btn-cancel {
          background: #ececec;
          color: #545454;
          border: 1px solid #d7d7d7;
        }

        .admin-btn-cancel:hover {
          background: #e1e1e1;
          color: #3f3f3f;
        }

        .admin-action-btn {
          border-radius: 999px;
          font-weight: 600;
          padding-inline: 0.9rem;
        }

        .admin-action-view {
          border: 1px solid #b7d7d1;
          color: #2b5b53;
          background: #f3fbf8;
        }

        .admin-action-confirm {
          border: 1px solid #9fd1b8;
          color: #1d6a49;
          background: #edf9f1;
        }

        .admin-action-reset {
          border: 1px solid #eadca8;
          color: #7c640c;
          background: #fff9e8;
        }

        .admin-action-cancel {
          border: 1px solid #d4d4d4;
          color: #616161;
          background: #f3f3f3;
        }

        .admin-action-view:hover,
        .admin-action-confirm:hover,
        .admin-action-reset:hover,
        .admin-action-cancel:hover,
        .admin-action-delete:hover {
          filter: brightness(0.98);
        }

        .admin-badge {
          padding: 0.7rem 0.95rem;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .admin-badge-success {
          background: #e9f8ef !important;
          color: #1c6a48 !important;
          border: 1px solid #bde1ca;
        }

        .admin-badge-warning {
          background: #fff6db !important;
          color: #8a6c12 !important;
          border: 1px solid #f0df9a;
        }

        .admin-badge-cancelled {
          background: #efefef !important;
          color: #666 !important;
          border: 1px solid #d7d7d7;
        }

        .admin-badge-default {
          background: #f5f5f5 !important;
          color: #555 !important;
          border: 1px solid #ddd;
        }

        .admin-badge-info {
          background: #e0f2f1 !important;
          color: #0f766e !important;
          border: 1px solid #99f6e4;
        }

        .admin-alert {
          border-radius: 18px;
        }

        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(16, 34, 30, 0.38);
          z-index: 1040;
        }

        .admin-modal-wrap {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .admin-modal-card {
          width: 100%;
          max-width: 860px;
          border-radius: 28px;
          padding: 1.5rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        .admin-calendar-wrap {
          width: 100%;
          overflow: hidden;
          border-radius: 20px;
        }

        .rbc-calendar {
          width: 100%;
          min-width: 0;
          background: #ffffff;
          color: #1f3f3a;
          border-radius: 20px;
        }

        .rbc-toolbar {
          margin-bottom: 1rem;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .rbc-toolbar-label {
          font-weight: 800;
          color: #163d36;
        }

        .rbc-toolbar button {
          border-radius: 999px;
          border: 1px solid #cfe1dc;
          background: #ffffff;
          color: #2f5952;
          padding: 0.45rem 0.9rem;
          font-weight: 600;
        }

        .rbc-toolbar button:hover,
        .rbc-toolbar button:focus {
          background: #edf6f3;
          color: #1f3f3a;
        }

        .rbc-toolbar button.rbc-active {
          background: #5e9187;
          border-color: #5e9187;
          color: #ffffff;
        }

        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          border: 1px solid #dfece8;
          border-radius: 18px;
          overflow: hidden;
        }

        .rbc-header {
          padding: 0.85rem 0.4rem;
          background: #edf6f3;
          color: #30544e;
          font-weight: 700;
          border-bottom: 1px solid #dfece8;
        }

        .rbc-today {
          background: #f8fbda !important;
        }

        .rbc-off-range-bg {
          background: #fafcfb;
        }

        .rbc-event {
          box-shadow: none !important;
        }

        .rbc-agenda-view table.rbc-agenda-table {
          border-color: #edf2f0;
        }

        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          background: #edf6f3;
          color: #30544e;
        }

        @media (max-width: 991px) {
          .admin-topbar {
            padding: 1.2rem;
          }

          .admin-title {
            font-size: 1.6rem;
          }

          .admin-tabs {
            flex-direction: column;
          }

          .admin-tab {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 767px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .admin-topbar,
          .admin-card,
          .admin-stat-card,
          .admin-modal-card {
            border-radius: 18px;
          }

          .admin-topbar {
            padding: 1rem;
          }

          .admin-title {
            font-size: 1.35rem;
          }

          .admin-subtitle {
            font-size: 0.9rem;
          }

          .admin-stat-card {
            padding: 1rem;
          }

          .admin-stat-value {
            font-size: 1.6rem;
          }

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

          .admin-modal-wrap {
            align-items: flex-end;
            padding: 0;
          }

          .admin-modal-card {
            max-width: 100%;
            border-radius: 20px 20px 0 0;
            max-height: 92vh;
            padding: 1rem;
          }

          .admin-calendar-wrap {
            width: 100%;
            overflow: hidden;
          }

          .rbc-calendar {
            width: 100%;
            min-width: 0;
          }

          .rbc-toolbar {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.55rem;
            margin-bottom: 0.75rem;
          }

          .rbc-toolbar-label {
            text-align: center;
            font-size: 0.95rem;
            font-weight: 800;
          }

          .rbc-btn-group {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.3rem;
          }

          .rbc-btn-group button {
            flex: 1 1 auto;
            min-width: 72px;
            font-size: 0.76rem;
            padding: 0.35rem 0.5rem;
          }

          .rbc-month-view,
          .rbc-time-view,
          .rbc-agenda-view {
            border-radius: 12px;
          }

          .rbc-header {
            padding: 0.45rem 0.15rem;
            font-size: 0.68rem;
          }

          .rbc-date-cell {
            padding-right: 2px;
            font-size: 0.72rem;
          }

          .rbc-row-content {
            font-size: 0.68rem;
          }

          .rbc-event {
            padding: 0 2px !important;
            line-height: 1.15;
          }

          .rbc-row-segment .rbc-event-content {
            font-size: 0.66rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rbc-month-row {
            min-height: 48px !important;
          }

          .rbc-show-more {
            font-size: 0.65rem;
          }
        }

        .admin-btn-delete {
          background: #dc3545;
          color: white;
          border: 1px solid #dc3545;
        }

        .admin-btn-delete:hover {
          background: #bb2d3b;
          color: white;
          border-color: #bb2d3b;
        }

        .admin-action-delete {
          border: 1px solid #f1aeb5;
          color: #b02a37;
          background: #fff5f5;
        }
        @media print {
          .admin-tabs,
          .btn,
          .admin-action-btn,
          a {
            display: none !important;
          }

          .admin-modal-wrap,
          .admin-modal-backdrop {
            display: none !important;
          }

          .admin-bookings-page,
          .admin-bookings-overlay {
            background: #ffffff !important;
          }

          .admin-topbar,
          .admin-card,
          .admin-stat-card {
            box-shadow: none !important;
            background: #ffffff !important;
          }

          
        }

      `}</style>
    </div>
  );
}