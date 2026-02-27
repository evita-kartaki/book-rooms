import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <main className="flex-grow-1">
      <section className="container py-5">
        {/* Title */}
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Σύνδεση
        </h2>

        {/* Login Card */}
        <div className="card border-0 shadow-sm rb-auth-card mx-auto">
          <div className="card-body p-4">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="π.χ. maria@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Κωδικός
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Button */}
              <button type="submit" className="btn rb-search-btn w-100 mt-2">
                Σύνδεση
              </button>
            </form>

            {/* Register Link */}
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
