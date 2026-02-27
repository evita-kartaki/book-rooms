import React from "react";

export default function Contact() {
  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title">Επικοινωνία</h2>

        {/* TOP CARD: info + form */}
        <div className="card border-0 shadow-sm rb-card mt-3">
          <div className="card-body p-4">
            <div className="row g-4 align-items-start">
              {/* LEFT: contact info */}
              <div className="col-12 col-lg-5">
                <h4 className="fw-bold mb-3" style={{ color: "var(--rb-dark)" }}>
                  Στοιχεία Επικοινωνίας
                </h4>

                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>Email:</strong>{" "}
                    <a className="rb-footer-link" href="mailto:info@roombooking.gr">
                      info@roombooking.gr
                    </a>
                  </li>
                  <li className="mb-2">
                    <strong>Τηλέφωνο:</strong>{" "}
                    <a className="rb-footer-link" href="tel:+302101234567">
                      +30 210 123 4567
                    </a>
                  </li>
                  <li className="mb-2">
                    <strong>Διεύθυνση:</strong> Λεωφόρος Πανεπιστημίου 25, Αθήνα
                  </li>
                  <li className="mb-0">
                    <strong>Ώρες:</strong> Δευ–Παρ 09:00–18:00
                  </li>
                </ul>

                <hr className="my-3" />

                <p className="mb-0 text-muted">
                  Στείλε μας μήνυμα και θα επικοινωνήσουμε μαζί σου το συντομότερο.
                </p>
              </div>

              {/* RIGHT: simple form */}
              <div className="col-12 col-lg-7">
                <h4 className="fw-bold mb-3" style={{ color: "var(--rb-dark)" }}>
                  Φόρμα Επικοινωνίας
                </h4>

                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold mb-1">Ονοματεπώνυμο</label>
                      <input className="form-control" type="text" placeholder="π.χ. Μαρία Παπαδοπούλου" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold mb-1">Email</label>
                      <input className="form-control" type="email" placeholder="π.χ. maria@email.com" />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold mb-1">Θέμα</label>
                      <input className="form-control" type="text" placeholder="π.χ. Πληροφορίες για κράτηση" />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold mb-1">Μήνυμα</label>
                      <textarea className="form-control" rows="5" placeholder="Γράψε εδώ το μήνυμά σου..." />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn rb-search-btn">
                        Αποστολή
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* MAP CARD */}
        <div className="card border-0 shadow-sm rb-map-card mt-4">
          <div className="card-body p-0">
            <iframe
              title="Google Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3146.5217695220817!2d23.6529793!3d37.941601299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bbe5bb8515a1%3A0x3e0dce8e58812705!2zzqDOsc69zrXPgM65z4PPhM6uzrzOuc6_IM6gzrXOuc-BzrHOuc-Oz4I!5e0!3m2!1sel!2sgr!4v1769966610941!5m2!1sel!2sgr"
              className="rb-map"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
