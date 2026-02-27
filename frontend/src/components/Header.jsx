import React from "react";
import logo from "../assets/room-booking-logo.png";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="rb-header">
      <nav className="navbar navbar-expand-lg py-1 rb-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          {/*logo */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src={logo} alt="Room Booking" className="rb-logo" />
          </Link>

          {/* Desktop menu */}
          <div className="collapse navbar-collapse d-none d-lg-flex align-items-center">
            {/* MENU CENTER */}
            <ul className="navbar-nav flex-row justify-content-center gap-4 mx-auto">
              <li className="nav-item">
                <NavLink className="nav-link text-white" to="/">
                  Αρχική
                </NavLink>
              </li>

              {/* ✅ Dropdown: Κατηγορίες Χώρων */}
              <li className="nav-item rb-dropdown">
                <span className="nav-link text-white rb-dropdown-toggle">
                  Κατηγορίες Χώρων <span className="rb-arrow">▾</span>
                </span>

                <ul className="rb-dropdown-menu">
                  {/* Teaching Rooms (submenu) */}
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
                <a className="nav-link text-white" href="/booking">
                  Κάνε Κράτηση Χώρου
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link text-white" href="/about">
                  Σχετικά με εμάς
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link text-white" href="/contact">
                  Επικοινωνία
                </a>
              </li>
            </ul>

            {/* LOGIN RIGHT */}
            <a href="/login" className="btn btn-light fw-semibold ms-auto">
              Σύνδεση
            </a>
          </div>

          {/* MOBILE ONLY: burger */}
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
