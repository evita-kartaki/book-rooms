import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Register() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleGoogleResponse(response) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/google/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Αποτυχία εγγραφής με Google");
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.role) {
        localStorage.setItem("role", data.user.role);
      }

      if (data.user?.is_admin !== undefined) {
        localStorage.setItem("is_admin", String(data.user.is_admin));
      }

      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.message || "Κάτι πήγε στραβά με την εγγραφή μέσω Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.password !== form.confirm_password) {
      setError("Οι κωδικοί δεν ταιριάζουν.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          confirm_password: form.confirm_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const firstError =
          data?.username?.[0] ||
          data?.email?.[0] ||
          data?.phone?.[0] ||
          data?.password?.[0] ||
          data?.confirm_password?.[0] ||
          data?.non_field_errors?.[0] ||
          data?.error ||
          "Αποτυχία εγγραφής.";

        throw new Error(firstError);
      }

      setSuccess("Η εγγραφή ολοκληρώθηκε επιτυχώς.");

      setForm({
        username: "",
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Κάτι πήγε στραβά.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function initializeGoogle() {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      googleBtnRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signup_with",
        width: 320,
      });
    }

    const existingScript = document.getElementById("google-identity-script");

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-identity-script";
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, []);

  return (
    <main className="flex-grow-1">
      <section className="container py-5">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Εγγραφή
        </h2>

        <div className="card border-0 shadow-sm rb-auth-card mx-auto">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="π.χ. mariapap"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Όνομα</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  placeholder="π.χ. Μαρία"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Επώνυμο</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  placeholder="π.χ. Παπαδοπούλου"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Κινητό Τηλέφωνο</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="π.χ. 6912345678"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="π.χ. maria@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Κωδικός</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold">
                  Επιβεβαίωση Κωδικού
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger py-2 mt-3">{error}</div>
              )}

              {success && (
                <div className="alert alert-success py-2 mt-3">{success}</div>
              )}

              <button
                type="submit"
                className="btn rb-search-btn w-100 mt-3"
                disabled={loading}
              >
                {loading ? "Γίνεται εγγραφή..." : "Δημιουργία λογαριασμού"}
              </button>

              <div className="text-center text-muted my-3">ή</div>

              <div className="d-flex justify-content-center">
                <div ref={googleBtnRef}></div>
              </div>
            </form>

            <p className="text-center text-muted small mt-4 mb-0">
              Έχεις ήδη λογαριασμό;{" "}
              <Link to="/login" className="rb-link">
                Σύνδεση εδώ
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}