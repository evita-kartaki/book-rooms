import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function Profile() {
  const token = localStorage.getItem("access");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/bookings/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          setError("Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          console.error("Profile bookings error:", text);
          throw new Error("Δεν ήταν δυνατή η φόρτωση των κρατήσεών σας.");
        }

        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Παρουσιάστηκε σφάλμα.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyBookings();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="fw-bold">Το προφίλ μου</h1>
        <p className="text-muted mb-0">Οι κρατήσεις σας</p>
      </div>

      {loading && (
        <div className="alert alert-light border">Φόρτωση κρατήσεων...</div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-2">Δεν έχετε κρατήσεις ακόμα</h5>
            <p className="text-muted mb-3">
              Μπορείτε να κάνετε την πρώτη σας κράτηση από τη σελίδα κρατήσεων.
            </p>
            <Link to="/booking" className="btn btn-dark">
              Κάνε Κράτηση Χώρου
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="row g-4">
          {bookings.map((booking) => {
            const bookingId = booking.Booking_id;

            const roomName = booking.room_name || "Χώρος";

            const bookingDate = booking.Start_time;
            const fromTime = booking.Start_time;
            const toTime = booking.End_time;

            const bookingCode = booking.Booking_id || "-";

            return (
              <div className="col-12 col-md-6 col-lg-4" key={bookingId}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="fw-bold mb-3">{roomName}</h5>

                    <p className="mb-2">
                      <strong>Ημερομηνία:</strong> {formatDate(bookingDate)}
                    </p>

                    <p className="mb-2">
                      <strong>Ώρα:</strong> {formatTime(fromTime)} - {formatTime(toTime)}
                    </p>

                    <p className="mb-2">
                      <strong>Κατάσταση:</strong> {booking.Status || "-"}
                    </p>

                    <p className="mb-4">
                      <strong>Κωδικός κράτησης:</strong> {bookingCode}
                    </p>

                    <div className="mt-auto">
                      <Link
                        to={`/booking-details/${bookingId}`}
                        className="btn btn-outline-dark w-100"
                      >
                        Προβολή κράτησης
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}