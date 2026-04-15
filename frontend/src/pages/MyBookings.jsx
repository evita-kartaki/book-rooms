import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [checkInResult, setCheckInResult] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  async function fetchMyBookings() {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/bookings/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("FULL ERROR RESPONSE:", text);
        throw new Error(`Αποτυχία φόρτωσης (${res.status})`);
      }

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading my bookings:", err);
      setError("Δεν ήταν δυνατή η φόρτωση των κρατήσεών σας.");
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId, newStatus) {
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

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        navigate("/login");
        return false;
      }

      if (!res.ok) {
        console.error("Status update error:", data);
        alert(data?.error || "Η αλλαγή κατάστασης απέτυχε.");
        return false;
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

      return true;
    } catch (err) {
      console.error("Status update error:", err);
      alert("Σφάλμα σύνδεσης με τον server.");
      return false;
    } finally {
      setActionLoadingId(null);
    }
  }

  async function cancelBooking(bookingId) {
    const ok = window.confirm("Θέλεις σίγουρα να ακυρώσεις αυτή την κράτηση;");
    if (!ok) return;

    updateBookingStatus(bookingId, "CANCELLED");
  }

  async function checkInBooking(booking) {
    const ok = window.confirm("Θέλεις να κάνεις check-in σε αυτή την κράτηση;");
    if (!ok) return;

    try {
      setActionLoadingId(booking.Booking_id);
      setError("");

      const payload = {
        first_name: (booking.Guest_first_name || "").trim(),
        last_name: (booking.Guest_last_name || "").trim(),
        phone: (booking.Guest_phone || "").trim(),
        email: (booking.Guest_email || "").trim(),
      };

      const res = await fetch(`${API_BASE}/api/check-in/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        alert(
          responseData?.error || "Δεν ήταν δυνατό να ολοκληρωθεί το check-in."
        );
        return;
      }

      setCheckInResult(responseData);

      setBookings((prev) =>
        prev.map((b) =>
          b.Booking_id === booking.Booking_id
            ? { ...b, Status: "CHECKED_IN" }
            : b
        )
      );

      if (selectedBooking?.Booking_id === booking.Booking_id) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, Status: "CHECKED_IN" } : prev
        );
      }

      setActiveTab("checkin");
    } catch (err) {
      console.error("Check-in error:", err);
      alert("Σφάλμα σύνδεσης με τον server.");
    } finally {
      setActionLoadingId(null);
    }
  }

  function resetCheckInResult() {
    setCheckInResult(null);
    fetchMyBookings();
  }

  function openViewModal(booking) {
    setSelectedBooking(booking);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedBooking(null);
    setShowViewModal(false);
  }

  function statusBadge(statusValue) {
    if (statusValue === "CHECKED_IN") {
      return "badge rounded-pill my-badge my-badge-info";
    }
    if (statusValue === "COMPLETED") {
      return "badge rounded-pill my-badge my-badge-success";
    }
    if (statusValue === "UPCOMING") {
      return "badge rounded-pill my-badge my-badge-warning";
    }
    if (statusValue === "CANCELLED") {
      return "badge rounded-pill my-badge my-badge-cancelled";
    }
    return "badge rounded-pill my-badge my-badge-default";
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

  const checkInBookings = useMemo(() => {
    return bookings.filter((b) => b.Status === "UPCOMING");
  }, [bookings]);

  return (
    <div className="my-bookings-page min-vh-100">
      <div className="my-bookings-overlay">
        <div className="container py-4 py-lg-5">
          <div className="my-shell mx-auto">
            <div className="my-topbar d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
              <div>
                <div className="my-eyebrow">User Dashboard</div>
                <h1 className="my-title mb-1">Το Προφίλ Μου</h1>
                <div className="my-subtitle">
                  Δες τις κρατήσεις σου και κάνε check-in στην αίθουσα όταν
                  φτάσεις στον χώρο.
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn my-btn my-btn-soft"
                  onClick={() => window.print()}
                >
                  Εκτύπωση / PDF
                </button>

                <button
                  className="btn my-btn my-btn-outline"
                  onClick={fetchMyBookings}
                >
                  Ανανέωση
                </button>

                <a className="btn my-btn my-btn-outline" href="/">
                  Επιστροφή στην αρχική
                </a>
              </div>
            </div>

            <div className="my-tabs mt-4 mb-4">
              <button
                type="button"
                className={`my-tab ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                Οι κρατήσεις μου
              </button>

              <button
                type="button"
                className={`my-tab ${activeTab === "checkin" ? "active" : ""}`}
                onClick={() => setActiveTab("checkin")}
              >
                Κάνε check-in
              </button>
            </div>

            <div className="row g-3 mt-1 mb-4">
              <div className="col-6 col-lg-2">
                <div className="my-stat-card">
                  <div className="my-stat-label">Σύνολο</div>
                  <div className="my-stat-value">{stats.total}</div>
                </div>
              </div>

              <div className="col-6 col-lg-2">
                <div className="my-stat-card">
                  <div className="my-stat-label">Επερχόμενες</div>
                  <div className="my-stat-value">{stats.upcoming}</div>
                </div>
              </div>

              <div className="col-6 col-lg-2">
                <div className="my-stat-card">
                  <div className="my-stat-label">Checked-in</div>
                  <div className="my-stat-value">{stats.checkedIn}</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="my-stat-card">
                  <div className="my-stat-label">Ολοκληρωμένες</div>
                  <div className="my-stat-value">{stats.completed}</div>
                </div>
              </div>

              <div className="col-6 col-lg-3">
                <div className="my-stat-card">
                  <div className="my-stat-label">Ακυρωμένες</div>
                  <div className="my-stat-value">{stats.cancelled}</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger my-alert mb-3">{error}</div>
            )}

            {activeTab === "bookings" && (
              <>
                <div className="my-card p-3 p-lg-4 mb-3">
                  <div className="row g-3 align-items-end">
                    <div className="col-lg-8">
                      <label className="form-label my-label">Αναζήτηση</label>
                      <input
                        className="form-control my-input"
                        placeholder="ID, όνομα, email, τηλέφωνο, δωμάτιο..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>

                    <div className="col-lg-4">
                      <label className="form-label my-label">Κατάσταση</label>
                      <select
                        className="form-select my-input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="all">Όλες</option>
                        <option value="UPCOMING">Επερχόμενες</option>
                        <option value="CHECKED_IN">Εισήλθε</option>
                        <option value="COMPLETED">Ολοκληρωμένες</option>
                        <option value="CANCELLED">Ακυρωμένες</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="my-card table-card overflow-hidden">
                  {loading ? (
                    <div className="text-center py-5 text-muted">
                      Φόρτωση κρατήσεων...
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0 my-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Δωμάτιο</th>
                            <th>Ημ/νία</th>
                            <th>Ώρα</th>
                            <th>Στοιχεία</th>
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

                              <td data-label="Ημ/νία">
                                {formatDate(b.Start_time)}
                              </td>

                              <td data-label="Ώρα">
                                {formatTime(b.Start_time)} -{" "}
                                {formatTime(b.End_time)}
                              </td>

                              <td data-label="Στοιχεία">
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
                                    className="btn btn-sm my-action-btn my-action-view"
                                    onClick={() => openViewModal(b)}
                                  >
                                    Προβολή
                                  </button>

                                  {b.Status === "UPCOMING" && (
                                    <button
                                      className="btn btn-sm my-action-btn my-action-cancel"
                                      onClick={() => cancelBooking(b.Booking_id)}
                                      disabled={
                                        actionLoadingId === b.Booking_id
                                      }
                                    >
                                      Ακύρωση
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filtered.length === 0 && (
                            <tr>
                              <td
                                colSpan="7"
                                className="text-center py-5 text-muted"
                              >
                                Δεν υπάρχουν κρατήσεις.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "checkin" && (
              <div className="my-card p-3 p-lg-4">
                {!checkInResult ? (
                  <>
                    <div className="mb-3">
                      <div className="my-eyebrow">Check-in</div>
                      <h2 className="my-section-title mb-1">Κάνε check-in</h2>
                      <div className="my-subtitle">
                        Εδώ εμφανίζονται οι επερχόμενες κρατήσεις σου για να
                        κάνεις check-in στην αίθουσα.
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-5 text-muted">
                        Φόρτωση κρατήσεων...
                      </div>
                    ) : checkInBookings.length === 0 ? (
                      <div className="my-empty-state">
                        Δεν υπάρχει κάποια επερχόμενη κράτηση διαθέσιμη για
                        check-in.
                      </div>
                    ) : (
                      <div className="row g-3">
                        {checkInBookings.map((b) => (
                          <div className="col-12 col-lg-6" key={b.Booking_id}>
                            <div className="my-checkin-card">
                              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                <div>
                                  <div className="my-checkin-room">
                                    {b.room_name || "Αίθουσα"}
                                  </div>
                                  <div className="my-checkin-meta">
                                    Κράτηση #{b.Booking_id}
                                  </div>
                                </div>

                                <span className={statusBadge(b.Status)}>
                                  {statusLabel(b.Status)}
                                </span>
                              </div>

                              <div className="my-checkin-info-grid">
                                <div>
                                  <div className="my-checkin-label">
                                    Ημερομηνία
                                  </div>
                                  <div className="my-checkin-value">
                                    {formatDate(b.Start_time)}
                                  </div>
                                </div>

                                <div>
                                  <div className="my-checkin-label">Ώρα</div>
                                  <div className="my-checkin-value">
                                    {formatTime(b.Start_time)} -{" "}
                                    {formatTime(b.End_time)}
                                  </div>
                                </div>

                                <div>
                                  <div className="my-checkin-label">Όνομα</div>
                                  <div className="my-checkin-value">
                                    {fullName(b)}
                                  </div>
                                </div>

                                <div>
                                  <div className="my-checkin-label">Email</div>
                                  <div className="my-checkin-value">
                                    {b.Guest_email || "-"}
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex flex-wrap gap-2 mt-4">
                                <button
                                  className="btn my-btn my-btn-checkin"
                                  onClick={() => checkInBooking(b)}
                                  disabled={actionLoadingId === b.Booking_id}
                                >
                                  {actionLoadingId === b.Booking_id
                                    ? "Γίνεται check-in..."
                                    : "Κάνε check-in"}
                                </button>

                                <button
                                  className="btn my-btn my-btn-outline"
                                  onClick={() => openViewModal(b)}
                                >
                                  Προβολή
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="my-checkin-success text-center">
                    <div className="my-checkin-success-icon mb-3">✅</div>

                    <h2 className="fw-bold text-success mb-2">
                      Καλώς ήρθες, {checkInResult.visitor.first_name}!
                    </h2>

                    <p className="text-muted mb-4">
                      Το check-in ολοκληρώθηκε επιτυχώς.
                    </p>

                    <div className="my-checkin-success-box text-start mx-auto">
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <div className="small text-muted">
                            Κωδικός Κράτησης
                          </div>
                          <div className="fw-bold">
                            {checkInResult.booking.booking_code}
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="small text-muted">Ημερομηνία</div>
                          <div className="fw-bold">
                            {checkInResult.booking.date}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="small text-muted">Αίθουσα</div>
                          <div className="my-checkin-success-room">
                            {checkInResult.booking.room_name}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="small text-muted">Περιγραφή</div>
                          <div>
                            {checkInResult.booking.room_description || "—"}
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="small text-muted">Από</div>
                          <div className="fw-bold">
                            {checkInResult.booking.time_from}
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="small text-muted">Μέχρι</div>
                          <div className="fw-bold">
                            {checkInResult.booking.time_to}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="small text-muted">Κατάσταση</div>
                          <div className="fw-bold">
                            {checkInResult.booking.status}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={resetCheckInResult}
                      className="btn my-btn my-btn-checkin mt-4"
                    >
                      Νέο Check-in
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showViewModal && selectedBooking && (
        <>
          <div className="my-modal-backdrop" onClick={closeViewModal}></div>

          <div className="my-modal-wrap">
            <div className="my-modal-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="my-eyebrow">Λεπτομέρειες</div>
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
                  <label className="form-label my-label">ID</label>
                  <input
                    className="form-control my-input"
                    value={selectedBooking.Booking_id}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label my-label">Δωμάτιο</label>
                  <input
                    className="form-control my-input"
                    value={selectedBooking.room_name || "-"}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label my-label">Ημερομηνία</label>
                  <input
                    className="form-control my-input"
                    value={formatDate(selectedBooking.Start_time)}
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label my-label">Από</label>
                  <input
                    className="form-control my-input"
                    value={formatTime(selectedBooking.Start_time)}
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label my-label">Έως</label>
                  <input
                    className="form-control my-input"
                    value={formatTime(selectedBooking.End_time)}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label my-label">Όνομα</label>
                  <input
                    className="form-control my-input"
                    value={fullName(selectedBooking)}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label my-label">Email</label>
                  <input
                    className="form-control my-input"
                    value={selectedBooking.Guest_email || "-"}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label my-label">Τηλέφωνο</label>
                  <input
                    className="form-control my-input"
                    value={selectedBooking.Guest_phone || "-"}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label my-label">Κατάσταση</label>
                  <input
                    className="form-control my-input"
                    value={statusLabel(selectedBooking.Status)}
                    disabled
                  />
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                {selectedBooking.Status === "UPCOMING" && (
                  <>
                    <button
                      className="btn my-btn my-btn-checkin"
                      onClick={() => checkInBooking(selectedBooking)}
                      disabled={actionLoadingId === selectedBooking.Booking_id}
                    >
                      Κάνε check-in
                    </button>

                    <button
                      className="btn my-btn my-btn-cancel"
                      onClick={() => cancelBooking(selectedBooking.Booking_id)}
                      disabled={actionLoadingId === selectedBooking.Booking_id}
                    >
                      Ακύρωση Κράτησης
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .my-bookings-page {
          background: #f3f1e8;
          color: #1f3f3a;
        }

        .my-bookings-overlay {
          min-height: 100vh;
          background: #f3f1e8;
        }

        .my-shell {
          max-width: 1320px;
        }

        .my-topbar,
        .my-card,
        .my-stat-card,
        .my-modal-card,
        .my-checkin-card {
          background: #ffffff;
          border: 1px solid #dbe7e2;
          box-shadow: none;
        }

        .my-topbar {
          border-radius: 28px;
          padding: 1.5rem;
        }

        .my-card,
        .my-stat-card,
        .my-checkin-card {
          border-radius: 24px;
        }

        .my-stat-card {
          padding: 1.2rem;
          height: 100%;
        }

        .my-stat-label {
          font-size: 0.9rem;
          color: #6b817c;
          margin-bottom: 0.35rem;
        }

        .my-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1d4f47;
          line-height: 1;
        }

        .my-eyebrow {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #568078;
          margin-bottom: 0.35rem;
        }

        .my-title {
          font-weight: 800;
          color: #163d36;
        }

        .my-section-title {
          font-weight: 800;
          color: #163d36;
          font-size: 1.35rem;
        }

        .my-subtitle {
          color: #6c8580;
          font-size: 0.95rem;
        }

        .my-tabs {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .my-tab {
          border: 1px solid #dbe7e2;
          border-radius: 999px;
          padding: 0.9rem 1.35rem;
          font-weight: 700;
          background: #ffffff;
          color: #456660;
          cursor: pointer;
        }

        .my-tab.active {
          background: #5e9187;
          color: white;
          border-color: #5e9187;
        }

        .my-label {
          font-size: 0.85rem;
          color: #69827d;
          font-weight: 600;
        }

        .my-input {
          border-radius: 16px;
          min-height: 48px;
          border: 1px solid #d6e5e0;
          box-shadow: none;
        }

        .my-input:focus {
          border-color: #76a99f;
          box-shadow: 0 0 0 0.2rem rgba(110, 168, 157, 0.18);
        }

        .table-card {
          border-radius: 24px;
        }

        .my-table thead th {
          background: #edf6f3;
          color: #30544e;
          font-size: 0.9rem;
          border-bottom: 1px solid #dfece8;
          white-space: nowrap;
        }

        .my-table tbody td {
          vertical-align: middle;
          border-color: #edf2f0;
        }

        .my-table tbody tr:hover {
          background: #f7fbf9;
        }

        .my-btn {
          border-radius: 999px;
          padding: 0.7rem 1.1rem;
          font-weight: 700;
        }

        .my-btn-soft {
          background: #f3f7f5;
          color: #355a53;
          border: 1px solid #dce8e4;
        }

        .my-btn-soft:hover,
        .my-btn-outline:hover {
          background: #eaf3f0;
          color: #23453f;
        }

        .my-btn-outline {
          background: transparent;
          color: #355a53;
          border: 1px solid #b8d2cb;
        }

        .my-btn-cancel {
          background: #ececec;
          color: #545454;
          border: 1px solid #d7d7d7;
        }

        .my-btn-cancel:hover {
          background: #e1e1e1;
          color: #3f3f3f;
        }

        .my-btn-checkin {
          background: #709991;
          color: #ffffff;
          border: 1px solid #5e9187;
        }

        .my-btn-checkin:hover {
          background: #a4d9cf,;
          color: #2b5b53;
          border-color: #5e9187,;
        }

        .my-action-btn {
          border-radius: 999px;
          font-weight: 600;
          padding-inline: 0.9rem;
        }

        .my-action-view {
          border: 1px solid #b7d7d1;
          color: #2b5b53;
          background: #f3fbf8;
        }

        .my-action-cancel {
          border: 1px solid #d4d4d4;
          color: #616161;
          background: #f3f3f3;
        }

        .my-action-view:hover,
        .my-action-cancel:hover {
          filter: brightness(0.98);
        }

        .my-badge {
          padding: 0.7rem 0.95rem;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .my-badge-success {
          background: #e9f8ef !important;
          color: #1c6a48 !important;
          border: 1px solid #bde1ca;
        }

        .my-badge-warning {
          background: #fff6db !important;
          color: #8a6c12 !important;
          border: 1px solid #f0df9a;
        }

        .my-badge-cancelled {
          background: #efefef !important;
          color: #666 !important;
          border: 1px solid #d7d7d7;
        }

        .my-badge-default {
          background: #f5f5f5 !important;
          color: #555 !important;
          border: 1px solid #ddd;
        }

        .my-badge-info {
          background: #e0f2f1 !important;
          color: #0f766e !important;
          border: 1px solid #99f6e4;
        }

        .my-alert {
          border-radius: 18px;
        }

        .my-empty-state {
          border: 1px dashed #cfe1dc;
          border-radius: 20px;
          padding: 2rem 1rem;
          text-align: center;
          color: #6c8580;
          background: #fbfdfc;
        }

        .my-checkin-card {
          padding: 1.25rem;
          height: 100%;
        }

        .my-checkin-room {
          font-size: 1.15rem;
          font-weight: 800;
          color: #163d36;
        }

        .my-checkin-meta {
          color: #6c8580;
          font-size: 0.9rem;
          margin-top: 0.15rem;
        }

        .my-checkin-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .my-checkin-label {
          font-size: 0.8rem;
          color: #6c8580;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .my-checkin-value {
          font-weight: 600;
          color: #23453f;
          word-break: break-word;
        }

        .my-checkin-success {
          padding: 0.5rem 0;
        }

        .my-checkin-success-icon {
          font-size: 2.5rem;
        }

        .my-checkin-success-box {
          background: #f8f9fa;
          border-radius: 20px;
          padding: 1.5rem;
          max-width: 700px;
        }

        .my-checkin-success-room {
          font-size: 1.8rem;
          font-weight: 800;
          color: #5e9187;
        }

        .my-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(16, 34, 30, 0.38);
          z-index: 1040;
        }

        .my-modal-wrap {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .my-modal-card {
          width: 100%;
          max-width: 860px;
          border-radius: 28px;
          padding: 1.5rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        @media (max-width: 991px) {
          .my-topbar {
            padding: 1.2rem;
          }

          .my-title {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 767px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .my-topbar,
          .my-card,
          .my-stat-card,
          .my-modal-card,
          .my-checkin-card {
            border-radius: 18px;
          }

          .my-topbar {
            padding: 1rem;
          }

          .my-title {
            font-size: 1.35rem;
          }

          .my-subtitle {
            font-size: 0.9rem;
          }

          .my-stat-card {
            padding: 1rem;
          }

          .my-stat-value {
            font-size: 1.6rem;
          }

          .my-tabs {
            flex-direction: column;
          }

          .my-tab {
            width: 100%;
            text-align: center;
          }

          .my-table thead {
            display: none;
          }

          .my-table,
          .my-table tbody,
          .my-table tr,
          .my-table td {
            display: block;
            width: 100%;
          }

          .my-table tbody tr {
            padding: 0.9rem;
            border-bottom: 1px solid #edf2f0;
            background: #ffffff;
          }

          .my-table tbody td {
            border: 0;
            padding: 0.45rem 0;
            text-align: left !important;
          }

          .my-table tbody td::before {
            content: attr(data-label);
            display: block;
            font-size: 0.78rem;
            font-weight: 700;
            color: #6b817c;
            margin-bottom: 0.2rem;
          }

          .my-table tbody td[data-label="Ενέργειες"] .d-flex {
            justify-content: flex-start !important;
          }

          .my-action-btn {
            width: 100%;
          }

          .my-checkin-info-grid {
            grid-template-columns: 1fr;
          }

          .my-checkin-success-box {
            padding: 1rem;
          }

          .my-checkin-success-room {
            font-size: 1.35rem;
          }

          .my-modal-wrap {
            align-items: flex-end;
            padding: 0;
          }

          .my-modal-card {
            max-width: 100%;
            border-radius: 20px 20px 0 0;
            max-height: 92vh;
            padding: 1rem;
          }
        }

        @media print {
          .btn,
          a,
          .my-tabs,
          .my-modal-wrap,
          .my-modal-backdrop {
            display: none !important;
          }

          .my-bookings-page,
          .my-bookings-overlay {
            background: #ffffff !important;
          }

          .my-topbar,
          .my-card,
          .my-stat-card,
          .my-checkin-card {
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}