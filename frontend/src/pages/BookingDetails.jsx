import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE = "http://127.0.0.1:8000";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access") || localStorage.getItem("token");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/bookings/${id}/`, {
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
          navigate("/login");
          return;
        }

        if (response.status === 404) {
          throw new Error("Η κράτηση δεν βρέθηκε.");
        }

        if (!response.ok) {
          const text = await response.text();
          console.error("Booking details error:", text);
          throw new Error("Δεν ήταν δυνατή η φόρτωση της κράτησης.");
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        console.error("Booking details fetch error:", err);
        setError(err.message || "Παρουσιάστηκε σφάλμα.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [id, token, navigate]);

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

  const statusLabel = (statusValue) => {
    if (statusValue === "COMPLETED") return "Ολοκληρωμένη";
    if (statusValue === "UPCOMING") return "Επερχόμενη";
    if (statusValue === "CANCELLED") return "Ακυρωμένη";
    return statusValue || "-";
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="alert alert-light border">Φόρτωση κράτησης...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mb-3">
          {error || "Η κράτηση δεν βρέθηκε."}
        </div>

        <Link to="/profile" className="btn btn-dark">
          Επιστροφή στο προφίλ μου
        </Link>
      </div>
    );
  }

  const bookingId = booking.Booking_id || booking.id || booking.booking_id;

  const roomName =
    booking.room_name ||
    booking.Room_name ||
    booking.room?.Short_name ||
    booking.room?.name ||
    booking.Short_name ||
    "Χώρος";

  const bookingDate =
    booking.Start_time ||
    booking.Date ||
    booking.date ||
    booking.booking_date ||
    "";

  const fromTime =
    booking.Start_time ||
    booking.From_time ||
    booking.from_time ||
    booking.start_time ||
    "-";

  const toTime =
    booking.End_time ||
    booking.To_time ||
    booking.to_time ||
    booking.end_time ||
    "-";

  const firstName =
    booking.Guest_first_name ||
    booking.First_name ||
    booking.first_name ||
    booking.firstname ||
    "-";

  const lastName =
    booking.Guest_last_name ||
    booking.Last_name ||
    booking.last_name ||
    booking.lastname ||
    "-";

  const mobile =
    booking.Guest_phone ||
    booking.Mobile ||
    booking.mobile ||
    booking.phone ||
    booking.Phone ||
    "-";

  const email =
    booking.Guest_email ||
    booking.Email ||
    booking.email ||
    booking.user_email ||
    "-";

  const bookingCode =
    booking.Booking_code ||
    booking.booking_code ||
    booking.code ||
    booking.Booking_id ||
    `BOOKING-${bookingId}`;

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Η κράτησή σας</h1>
        <p className="text-muted mb-0">
          Δείτε αναλυτικά τα στοιχεία της κράτησής σας.
        </p>
      </div>

      <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: "760px" }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2">{roomName}</h3>
            <p className="text-muted mb-0">
              {formatDate(bookingDate)} | {formatTime(fromTime)} - {formatTime(toTime)}
            </p>
          </div>

          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-7">
              <div className="mb-3">
                <strong>Χώρος:</strong> {roomName}
              </div>

              <div className="mb-3">
                <strong>Ημερομηνία:</strong> {formatDate(bookingDate)}
              </div>

              <div className="mb-3">
                <strong>Ώρα:</strong> {formatTime(fromTime)} - {formatTime(toTime)}
              </div>

              <div className="mb-3">
                <strong>Όνομα:</strong> {firstName}
              </div>

              <div className="mb-3">
                <strong>Επώνυμο:</strong> {lastName}
              </div>

              <div className="mb-3">
                <strong>Κινητό:</strong> {mobile}
              </div>

              <div className="mb-3">
                <strong>Email:</strong> {email}
              </div>

              <div className="mb-3">
                <strong>Κατάσταση:</strong> {statusLabel(booking.Status)}
              </div>

              <div className="mb-0">
                <strong>Κωδικός Κράτησης:</strong> {bookingCode}
              </div>
            </div>

            <div className="col-12 col-md-5 text-center">
              <div className="border rounded-4 p-3 bg-light">
                <QRCodeCanvas value={String(bookingCode)} size={180} />
                <p className="small text-muted mt-3 mb-0">
                  Κρατήστε αυτό το QR code ως επιβεβαίωση κράτησης.
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row gap-2 mt-4">
            <Link to="/profile" className="btn btn-outline-dark">
              Επιστροφή στο προφίλ μου
            </Link>

            <Link to="/booking" className="btn btn-dark">
              Νέα κράτηση
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}