import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function MobileMenu() {
  const [openCategories, setOpenCategories] = useState(false);
  const [openTeaching, setOpenTeaching] = useState(false);

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

          {/* HOME */}
          <Link className="btn btn-outline-secondary" to="/">
            Αρχική
          </Link>

          {/* CATEGORIES DROPDOWN */}
          <button
  className="btn btn-outline-secondary position-relative text-center"
  onClick={() => setOpenCategories(!openCategories)}
>
  Κατηγορίες Χώρων

  <span className="rb-arrow">
    {openCategories ? "▲" : "▼"}
  </span>
</button>


          {/* Submenu */}
          {openCategories && (
            <div className="ms-3 d-grid gap-2">

              {/* Teaching Rooms Dropdown */}
              <button
  className="btn btn-outline-secondary position-relative text-center"
  onClick={() => setOpenTeaching(!openTeaching)}
>
  Αίθουσες Διδασκαλίας

  <span className="rb-arrow">
    {openTeaching ? "▲" : "▶"}
  </span>
</button>


              {/* Teaching Submenu */}
              {openTeaching && (
                <div className="ms-3 d-grid gap-2">
                  <Link
                    className="btn btn-outline-secondary"
                    to="/teaching-room-a"
                  >
                    Αίθουσες Διδασκαλίας A1–A2–A3
                  </Link>

                  <Link
                    className="btn btn-outline-secondary"
                    to="/teaching-room-lab"
                  >
                    Αίθουσες Εργαστηρίων B1–B2–B3
                  </Link>
                </div>
              )}

              {/* Meeting Rooms */}
              <Link className="btn btn-outline-secondary" to="/meeting-rooms">
                Meeting Rooms
              </Link>

              {/* Presentation Rooms */}
              <Link className="btn btn-outline-secondary" to="/presentation-rooms">
                Αίθουσες Παρουσιάσεων
              </Link>
            </div>
          )}

          {/* Other Links */}
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

          {/* LOGIN */}
          <Link to="/login" className="btn btn-light fw-semibold">
                Σύνδεση
          </Link>
        </div>
      </div>
    </div>
  );
}
