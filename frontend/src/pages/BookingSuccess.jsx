import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function makeBookingCode() {
  // Μοναδικό “κωδικός κράτησης” (front-end-only)
  // RB-YYYYMMDD-HHMM-XXXX
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RB-${y}${m}${day}-${hh}${mm}-${rand}`;
}

export default function BookingSuccess() {
  const { state } = useLocation();

  // Αν κάποιος ανοίξει τη σελίδα απευθείας χωρίς state
  if (!state) {
    return (
      <main className="flex-grow-1">
        <section className="container py-4">
          <div className="alert alert-warning">
            Δεν υπάρχουν στοιχεία κράτησης. Γύρισε στη σελίδα κράτησης.
          </div>
          <Link className="btn rb-search-btn" to="/booking">
            Πίσω στην κράτηση
          </Link>
        </section>
      </main>
    );
  }

  const bookingCode = useMemo(() => state.bookingCode || makeBookingCode(), [state.bookingCode]);

  // Αυτό είναι που θα μπει στο QR (μπορείς να βάλεις και URL)
  const qrValue = JSON.stringify({
    code: bookingCode,
    room: state.roomLabel,
    date: state.date,
    from: state.from,
    to: state.to,
    firstName: state.firstName,
    lastName: state.lastName,
    phone: state.phone,
    email: state.email,
  });

  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        {/* wrapper για να μοιάζει με PDF */}
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          <div className="text-center mb-3">
            <h2 className="fw-bold" style={{ color: "var(--rb-dark)" }}>
              Επιβεβαιώθηκε
            </h2>
            <div className="text-muted">Ευχαριστούμε για την κράτησή σας!</div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Στοιχεία Κράτησης</h5>

              <div className="row g-3">
                {/* Left: details */}
                <div className="col-12 col-md-7">
                  <div className="p-3" style={{ background: "#f7f7f7", borderRadius: 14 }}>
  
                    <div className="mb-2">
                      <div className="text-muted small">Χώρος:</div>
                      <div className="fw-semibold">{state.roomLabel}</div>
                    </div>

                    <div className="row g-2">
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Ημερομηνία:</div>
                        <div className="fw-semibold">{state.date}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Ώρα:</div>
                        <div className="fw-semibold">
                          {state.from} - {state.to}
                        </div>
                      </div>
                    </div>

                    <div className="row g-2 mt-1">
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Όνομα:</div>
                        <div className="fw-semibold">{state.firstName}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Επώνυμο:</div>
                        <div className="fw-semibold">{state.lastName}</div>
                      </div>
                    </div>

                    <div className="row g-2 mt-1">
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Κινητό:</div>
                        <div className="fw-semibold">{state.phone}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Email:</div>
                        <div className="fw-semibold">{state.email}</div>
                      </div>
                    </div>

                    <div className="row g-2 mt-3 align-items-start">
                        {/* Αριστερά: Κωδικός */}
                        <div className="col-12 col-sm-6">
                            <div className="text-muted small">Κωδικός Κράτησης:</div>
                            <div className="fw-bold">{bookingCode}</div>
                        </div>

                        {/* Δεξιά: Φωτογραφία (ίδια στήλη/ευθεία με Email) */}
                        <div className="col-12 col-sm-6">
                            <div className="text-muted small">Φωτογραφία:</div>

                            {state.photoUrl ? (
                            <img
                                src={state.photoUrl}
                                alt="Uploaded"
                                className="rb-confirm-photo"
                            />
                            ) : (
                            <div className="text-muted small">—</div>
                            )}
                        </div>
                        </div>
                  </div>
                </div>

                {/* Right: QR */}
                <div className="col-12 col-md-5">
                  <div
                    className="h-100 d-flex flex-column align-items-center justify-content-center p-3"
                    style={{ background: "#f7f7f7", borderRadius: 14 }}
                  >
                    <QRCodeCanvas value={qrValue} size={180} />
                    <div className="text-muted small mt-2 text-center">
                      Κρατήστε αυτό το QR ως επιβεβαίωση κράτησης.
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4 rb-buttons-wrap">
                <Link className="btn btn-sm rb-return-btn rb-btn-compact" to="/">
                    Επιστροφή στην αρχική
                </Link>

                <button
                    className="btn btn-sm btn-outline-secondary rb-btn-compact"
                    onClick={() => window.print()}
                >
                    Εκτύπωση / Αποθήκευση PDF
                </button>
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}