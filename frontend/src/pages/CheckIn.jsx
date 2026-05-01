import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function CheckIn() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function updateFormField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.firstName.trim()) {
      setError("Συμπλήρωσε όνομα.");
      return false;
    }

    if (!form.lastName.trim()) {
      setError("Συμπλήρωσε επώνυμο.");
      return false;
    }

    if (!form.phone.trim()) {
      setError("Συμπλήρωσε κινητό.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Συμπλήρωσε email.");
      return false;
    }

    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
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
        setError(
          responseData?.error || "Δεν ήταν δυνατό να ολοκληρωθεί το check-in."
        );
        return;
      }

      setResult(responseData);
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Σφάλμα σύνδεσης με τον server.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setError("");
    setResult(null);
  }

  if (result) {
    return (
      <main className="flex-grow-1">
        <section className="container py-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5 text-center">
              <div className="display-4 mb-3">✅</div>

              <h2 className="fw-bold text-success mb-2">
                Καλώς ήρθες, {result.visitor.first_name}!
              </h2>

              <p className="text-muted mb-4">
                Το check-in ολοκληρώθηκε επιτυχώς.
              </p>

              <div
                className="bg-light rounded-4 p-4 text-start mx-auto"
                style={{ maxWidth: 700 }}
              >
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="small text-muted">Κωδικός Κράτησης</div>
                    <div className="fw-bold">{result.booking.booking_code}</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="small text-muted">Ημερομηνία</div>
                    <div className="fw-bold">{result.booking.date}</div>
                  </div>

                  <div className="col-12">
                    <div className="small text-muted">Αίθουσα</div>
                    <div className="fs-3 fw-bold text-primary">
                      {result.booking.room_name}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="small text-muted">Περιγραφή</div>
                    <div>{result.booking.room_description || "—"}</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="small text-muted">Από</div>
                    <div className="fw-bold">{result.booking.time_from}</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="small text-muted">Μέχρι</div>
                    <div className="fw-bold">{result.booking.time_to}</div>
                  </div>

                  <div className="col-12">
                    <div className="small text-muted">Κατάσταση</div>
                    <div className="fw-bold">{result.booking.status}</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="btn btn-dark mt-4 px-4 py-2 rounded-pill"
              >
                Νέο Check-in
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title rb-page-title">
          Check-in Εισόδου
        </h2>

        <div className="rb-booking-block mt-4 mb-2">
          <h4 className="fw-bold rb-booking-h">Στοιχεία επισκέπτη:</h4>

          <form onSubmit={onSubmit} className="rb-form card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Όνομα:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.firstName}
                    onChange={(e) => updateFormField("firstName", e.target.value)}
                    placeholder="π.χ. Μαρία"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Επώνυμο:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.lastName}
                    onChange={(e) => updateFormField("lastName", e.target.value)}
                    placeholder="π.χ. Παπαδοπούλου"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Κινητό:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.phone}
                    onChange={(e) => updateFormField("phone", e.target.value)}
                    placeholder="π.χ. 69xxxxxxxx"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Email:</label>
                  <input
                    className="form-control rb-pill-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateFormField("email", e.target.value)}
                    placeholder="π.χ. example@mail.com"
                  />
                </div>

                {error && (
                  <div className="col-12">
                    <div className="alert alert-danger mb-0">{error}</div>
                  </div>
                )}

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn rb-confirm-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Έλεγχος..." : "Καταγραφή Εισόδου"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}