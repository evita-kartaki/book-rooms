
import React, { useState } from "react";
import cat1 from "../assets/kathgoria-home-1.png";
import cat2 from "../assets/kathgoria-home-2.png";
import cat3 from "../assets/kathgoria-home-3.png";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  { id: "c1", title: "Αίθουσες Διδασκαλίας", img: cat1, to: "/teaching-rooms" },
  { id: "c2", title: "Meeting Rooms", img: cat2, to: "/meeting-rooms" },
  { id: "c3", title: "Αίθουσες Παρουσιάσεων", img: cat3, to: "/presentation-rooms" },
];

const reviews = [
  { id: "r1", name: "Γιάννης", stars: 5, text: "Πολύ ωραίος χώρος και εύκολη κράτηση." },
  { id: "r2", name: "Μαρία", stars: 5, text: "Καθαρό, οργανωμένο και άμεση εξυπηρέτηση." },
  { id: "r3", name: "Ελένη", stars: 5, text: "Η διαδικασία ήταν απλή και γρήγορη." },
];

function Stars({ count = 5 }) {
  return (
    <div className="d-flex align-items-center gap-1" aria-label={`${count} αστέρια`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < count ? "text-warning" : "text-secondary"}
          style={{ fontSize: 18, lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const nav = useNavigate();

  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    nav(
      `/available?date=${encodeURIComponent(date)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
  }

  return (
    <>
      {/* SEARCH SECTION */}
      <section className="rb-search-section py-4">
        <div className="container">
          <div className="card rb-search-card shadow-sm border-0">
            <div className="card-body">
              <form className="row g-2 align-items-end" onSubmit={onSubmit}>
                <div className="col-12 col-md">
                  <label className="form-label fw-semibold mb-1">Ημερομηνία</label>
                  <input
                    className="form-control"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>

                <div className="col-6 col-md">
                  <label className="form-label fw-semibold mb-1">Από</label>
                  <input
                    className="form-control"
                    type="time"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>

                <div className="col-6 col-md">
                  <label className="form-label fw-semibold mb-1">Μέχρι</label>
                  <input
                    className="form-control"
                    type="time"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-auto">
                  <button type="submit" className="btn rb-search-btn">
                    Αναζήτηση
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="flex-grow-1">
        {/* CATEGORIES */}
        <section className="container py-4">
          <h2 className="text-center fw-bold rb-section-title">Κατηγορίες Χώρων</h2>

          <div className="row g-3 mt-2">
            {categories.map((c) => (
              <div key={c.id} className="col-12 col-md-4">
                <Link to={c.to} className="text-decoration-none">
                  <div className="rb-category-card shadow-sm">
                    <img src={c.img} alt={c.title} className="rb-category-img" loading="lazy" />
                    <div className="rb-category-overlay">
                      <div className="rb-category-text">{c.title}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEWS */}
        <section className="container pb-4">
          <h2 className="text-center fw-bold rb-section-title">Αξιολογήσεις</h2>

          <div className="row g-3 mt-2">
            {reviews.map((r) => (
              <div key={r.id} className="col-12 col-md-4">
                <div className="card border-0 shadow-sm rb-card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="rb-avatar" aria-hidden="true">
                        👤
                      </div>
                      <div className="fw-semibold">{r.name}</div>
                    </div>

                    <Stars count={r.stars} />
                    <div className="text-muted small mt-2">“{r.text}”</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
