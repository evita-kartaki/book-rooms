import React, { useState } from "react";
import AdminBookings from "./AdminBookings";
import AdminRooms from "./AdminRooms";
import AdminUsers from "./AdminUsers";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="admin-dashboard-page min-vh-100">
      <div className="admin-dashboard-overlay">
        <div className="container py-4 py-lg-5">
          <div className="admin-shell mx-auto">
            <div className="admin-topbar d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
              <div>
                <div className="admin-eyebrow">Admin Panel</div>
                <h1 className="admin-title mb-1">Διαχειριστικό Συστήματος</h1>
                <div className="admin-subtitle">
                  Διαχείριση κρατήσεων, δωματίων και χρηστών από ένα ενιαίο περιβάλλον.
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <a className="btn admin-btn admin-btn-outline" href="/">
                  Επιστροφή στο site
                </a>
              </div>
            </div>

            <div className="admin-tabs mt-4">
              <button
                className={`admin-tab ${activeTab === "bookings" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("bookings")}
              >
                Διαχείριση Κρατήσεων
              </button>

              <button
                className={`admin-tab ${activeTab === "rooms" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("rooms")}
              >
                Διαχείριση Δωματίων
              </button>

              <button
                className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("users")}
              >
                Διαχείριση Χρηστών
              </button>
            </div>

            <div className="mt-4">
              {activeTab === "bookings" && <AdminBookings embedded />}
              {activeTab === "rooms" && <AdminRooms embedded />}
              {activeTab === "users" && <AdminUsers embedded />}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard-page {
          background: #f3f1e8;
          color: #1f3f3a;
        }

        .admin-dashboard-overlay {
          min-height: 100vh;
          background: #f3f1e8;
        }

        .admin-shell {
          max-width: 1320px;
        }

        .admin-topbar {
          background: #ffffff;
          border: 1px solid #dbe7e2;
          border-radius: 28px;
          padding: 1.5rem;
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

        .admin-btn {
          border-radius: 999px;
          padding: 0.7rem 1.1rem;
          font-weight: 700;
        }

        .admin-btn-outline {
          background: transparent;
          color: #355a53;
          border: 1px solid #b8d2cb;
        }

        .admin-btn-outline:hover {
          background: #eaf3f0;
          color: #23453f;
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

          .admin-topbar {
            border-radius: 18px;
            padding: 1rem;
          }

          .admin-title {
            font-size: 1.35rem;
          }

          .admin-subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}