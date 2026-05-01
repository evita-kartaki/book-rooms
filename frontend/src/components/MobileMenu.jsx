import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MobileMenu() {
  const [openCategories, setOpenCategories] = useState(false);
  const [openTeaching, setOpenTeaching] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || localStorage.getItem("access");

  const userRole =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("is_admin");

  const isLoggedIn = !!token;

  const isAdmin =
    userRole === "admin" ||
    userRole === "Administrator" ||
    userRole === "true";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("is_admin");
    navigate("/");
    window.location.reload();
  };

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex={-1}
      id="rbMenu"
      aria-labelledby="rbMenuLabel"
    >
      <div className="offcanvas-header">
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Κλείσιμο"
        />
      </div>

      <div className="offcanvas-body">
        <div className="d-grid gap-2">
          <Link className="btn btn-outline-secondary" to="/">
            Αρχική
          </Link>

          <button
            className="btn btn-outline-secondary position-relative text-center"
            onClick={() => setOpenCategories(!openCategories)}
          >
            Κατηγορίες Χώρων
            <span className="rb-arrow">{openCategories ? "▲" : "▼"}</span>
          </button>

          {openCategories && (
            <div className="ms-3 d-grid gap-2">
              <button
                className="btn btn-outline-secondary position-relative text-center"
                onClick={() => setOpenTeaching(!openTeaching)}
              >
                Αίθουσες Διδασκαλίας
                <span className="rb-arrow">{openTeaching ? "▲" : "▶"}</span>
              </button>

              {openTeaching && (
                <div className="ms-3 d-grid gap-2">
                  <Link className="btn btn-outline-secondary" to="/teaching-room-a">
                    Αίθουσες Διδασκαλίας A1–A2–A3
                  </Link>

                  <Link className="btn btn-outline-secondary" to="/teaching-room-lab">
                    Αίθουσες Εργαστηρίων B1–B2–B3
                  </Link>
                </div>
              )}

              <Link className="btn btn-outline-secondary" to="/meeting-rooms">
                Meeting Rooms
              </Link>

              <Link className="btn btn-outline-secondary" to="/presentation-rooms">
                Αίθουσες Παρουσιάσεων
              </Link>
            </div>
          )}

          <Link className="btn btn-outline-secondary" to="/booking">
            Κάνε Κράτηση Χώρου
          </Link>

          <Link className="btn btn-outline-secondary" to="/about">
            Σχετικά με εμάς
          </Link>

          <Link className="btn btn-outline-secondary" to="/contact">
            Επικοινωνία
          </Link>

          <hr />

          {!isLoggedIn ? (
            <Link to="/login" className="btn btn-light fw-semibold">
              Σύνδεση
            </Link>
          ) : (
            <>
              {isAdmin ? (
                <a
                  href="http://localhost:5173/admin-dashboard"
                  className="btn btn-light fw-semibold"
                  target="_blank"
                  rel="noreferrer"
                >
                  Διαχειριστικό
                </a>
              ) : (
                <Link to="/profile" className="btn btn-light fw-semibold">
                  Το προφίλ μου
                </Link>
              )}

              <button
                type="button"
                className="btn btn-outline-dark fw-semibold"
                onClick={handleLogout}
              >
                Αποσύνδεση
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}