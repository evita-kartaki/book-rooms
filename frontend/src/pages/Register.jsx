import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <main className="flex-grow-1">
      <section className="container py-5">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Εγγραφή
        </h2>

        <div className="card border-0 shadow-sm rb-auth-card mx-auto">
          <div className="card-body p-4">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Ονοματεπώνυμο</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="π.χ. Μαρία Παπαδοπούλου"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="π.χ. maria@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Κωδικός</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-2">
                <label className="form-label fw-semibold">Επιβεβαίωση Κωδικού</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn rb-search-btn w-100 mt-3">
                Δημιουργία λογαριασμού
              </button>
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
