import React from "react";
import logo from "../assets/room-booking-logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
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
    <header className="rb-header">
      <nav className="navbar navbar-expand-lg py-1 rb-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src={logo} alt="Room Booking" className="rb-logo" />
          </Link>

          <div className="collapse navbar-collapse d-none d-lg-flex align-items-center">
            <ul className="navbar-nav flex-row justify-content-center gap-4 mx-auto">
              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/">
                  Αρχική
                </NavLink>
              </li>

              <li className="nav-item rb-dropdown">
                <span className="nav-link text-white rb-dropdown-toggle">
                  Κατηγορίες Χώρων <span className="rb-arrow">▾</span>
                </span>

                <ul className="rb-dropdown-menu">
                  <li className="rb-submenu">
                    <span className="rb-dropdown-item">
                      Αίθουσες Διδασκαλίας <span className="rb-arrow">▸</span>
                    </span>

                    <ul className="rb-submenu-menu">
                      <li>
                        <NavLink className="rb-dropdown-item" to="/teaching-room-a">
                          Aίθουσες Διδασκαλίας A1–A2–A3
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="rb-dropdown-item" to="/teaching-room-lab">
                          Aίθουσες Εργαστηρίων B1–B2–B3
                        </NavLink>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <NavLink className="rb-dropdown-item" to="/meeting-rooms">
                      Meeting Rooms
                    </NavLink>
                  </li>

                  <li>
                    <NavLink className="rb-dropdown-item" to="/presentation-rooms">
                      Αίθουσες Παρουσιάσεων
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/booking">
                  Κάνε Κράτηση Χώρου
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/about">
                  Σχετικά με εμάς
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/contact">
                  Επικοινωνία
                </NavLink>
              </li>
            </ul>

            {!isLoggedIn ? (
              <Link to="/login" className="btn btn-light fw-semibold ms-auto">
                Σύνδεση
              </Link>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-auto">
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
                  className="btn btn-outline-light fw-semibold"
                  onClick={handleLogout}
                >
                  Αποσύνδεση
                </button>
              </div>
            )}
          </div>

          <button
            className="btn rb-icon-btn d-md-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#rbMenu"
            aria-controls="rbMenu"
            aria-label="Άνοιγμα μενού"
          >
            <span className="rb-burger" aria-hidden="true">
              ☰
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}