import React from "react";
import aboutImg from "../assets/about-us.png"; // βάλε μια εικόνα εδώ

export default function About() {
  return (
    <main className="flex-grow-1">
      <section className="container py-5">
        {/* Title */}
        <h1 className="text-center fw-bold rb-section-title mb-4">
          Σχετικά με εμάς
        </h1>

        {/* Main Card */}
        <div className="card border-0 shadow-sm rb-about-card p-4">
          <div className="row align-items-center g-4">
            {/* Image */}
            <div className="col-12 col-md-5">
              <img
                src={aboutImg}
                alt="Η ομάδα μας"
                className="rb-about-img"
              />
            </div>

            {/* Text */}
            <div className="col-12 col-md-7">
              <h3 className="fw-bold mb-3" style={{ color: "var(--rb-dark)" }}>
                Από το 1995 δίπλα σας στην οργάνωση χώρων
              </h3>

              <p className="text-muted">
                Η πλατφόρμα <strong>Room Booking</strong> ξεκίνησε το 1995 με στόχο
                να κάνει την εύρεση και κράτηση εκπαιδευτικών και επαγγελματικών
                χώρων πιο απλή από ποτέ.
              </p>

              <p className="text-muted">
                Από αίθουσες διδασκαλίας και εργαστήρια μέχρι meeting rooms και
                αίθουσες παρουσιάσεων, δημιουργούμε λύσεις που εξυπηρετούν
                οργανισμούς, σχολές και επιχειρήσεις σε όλη την Ελλάδα.
              </p>

              <p className="text-muted">
                Με περισσότερα από <strong>30 χρόνια εμπειρίας</strong>, έχουμε
                χτίσει σχέσεις εμπιστοσύνης και συνεχίζουμε να εξελισσόμαστε,
                προσφέροντας σύγχρονες υπηρεσίες κράτησης.
              </p>
            </div>
          </div>
        </div>

        {/* Trusted Section */}
        <div className="row text-center mt-5 g-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rb-info-box p-4">
              <h2 className="fw-bold">500+</h2>
              <p className="mb-0 text-muted">Επιτυχημένες κρατήσεις κάθε μήνα</p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rb-info-box p-4">
              <h2 className="fw-bold">120+</h2>
              <p className="mb-0 text-muted">Συνεργαζόμενοι χώροι</p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rb-info-box p-4">
              <h2 className="fw-bold">30 χρόνια</h2>
              <p className="mb-0 text-muted">Εμπειρίας και αξιοπιστίας</p>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="card border-0 shadow-sm rb-about-card mt-5 p-4">
          <h3 className="fw-bold mb-3" style={{ color: "var(--rb-dark)" }}>
            Μας έχουν εμπιστευτεί
          </h3>

          <p className="text-muted mb-3">
            Η Room Booking συνεργάζεται με εκπαιδευτικά ιδρύματα, εταιρείες και
            οργανισμούς που χρειάζονται αξιόπιστη διαχείριση χώρων.
          </p>

          <ul className="text-muted rb-about-list">
            <li>Πανεπιστημιακά τμήματα και σχολές</li>
            <li>Εταιρείες για επαγγελματικά meetings</li>
            <li>Οργανισμοί για παρουσιάσεις & συνέδρια</li>
            <li>Εργαστήρια και ερευνητικά κέντρα</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
