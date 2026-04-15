import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        throw new Error(data?.error || "Αποτυχία σύνδεσης με Google");
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
      setError(err.message || "Κάτι πήγε στραβά στη σύνδεση με Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Αποτυχία σύνδεσης");
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
      setError(err.message || "Κάτι πήγε στραβά στη σύνδεση.");
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
        text: "signin_with",
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
          Σύνδεση
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
                  placeholder="π.χ. admin"
                  value={form.username}
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

              {error && (
                <div className="alert alert-danger py-2">{error}</div>
              )}

              <button
                type="submit"
                className="btn rb-search-btn w-100 mt-2"
                disabled={loading}
              >
                {loading ? "Σύνδεση..." : "Σύνδεση"}
              </button>

              <div className="text-center text-muted my-3">ή</div>

              <div className="d-flex justify-content-center">
                <div ref={googleBtnRef}></div>
              </div>
            </form>

            <p className="text-center text-muted small mt-4 mb-0">
              Δεν έχεις λογαριασμό;{" "}
              <Link to="/register" className="rb-link">
                Κάνε εγγραφή εδώ
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}