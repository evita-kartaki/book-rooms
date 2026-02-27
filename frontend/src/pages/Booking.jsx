import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

// ====== OPTIONS ======
const topCategories = [
  { id: "teach", label: "Αίθουσα Διδασκαλίας" },
  { id: "meeting", label: "Meeting Rooms" },
  { id: "present", label: "Αίθουσα Παρουσιάσεων" },
];

const teachingSub = [
  { id: "teach-class", label: "Αίθουσα Διδασκαλίας" },
  { id: "teach-lab", label: "Αίθουσα Εργαστηρίου" },
];

const classRooms = [
  { id: "A1", label: "Αίθουσα Διδασκαλίας A1" },
  { id: "A2", label: "Αίθουσα Διδασκαλίας A2" },
  { id: "A3", label: "Αίθουσα Διδασκαλίας A3" },
];

const labRooms = [
  { id: "B1", label: "Εργαστηρίο Πληροφορικής" },
  { id: "B2", label: "Εργαστηρίο Φυσικής" },
  { id: "B3", label: "Εργαστηρίου Χημείας" },
];

const meetingRooms = [
  { id: "MB1", label: "Meeting Room B1" },
  { id: "MB2", label: "Meeting Room B2" },
];

const presentationRooms = [
  { id: "G1", label: "Αίθουσα Παρουσιάσεων Γ1" },
  { id: "G2", label: "Αίθουσα Παρουσιάσεων Γ2" },
];

// Fake διαθέσιμες μέρες (front-end μόνο)
function buildAvailableDays() {
  return new Set([1, 3, 5]); // 0=Κυρ ... 6=Σαβ (Δευ/Τετ/Παρ)
}

export default function Booking() {
  const nav = useNavigate();
  const [stepTop, setStepTop] = useState(null);
  const [stepTeachSub, setStepTeachSub] = useState(null);
  const [finalRoom, setFinalRoom] = useState(null);

  const availableWeekdays = useMemo(() => buildAvailableDays(), []);

  const [selectedDate, setSelectedDate] = useState(null);

  // Time + Form (front-end only)
  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("11:00");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    photo: null,
  });

  function isDateEnabled(d) {
    if (!d) return false;
    return availableWeekdays.has(d.getDay());
  }

  function onSubmit(e) {
    e.preventDefault();

    const summary = {
      category: stepTop,
      subCategory: stepTeachSub,
      room: finalRoom,
      date: selectedDate ? selectedDate.toLocaleDateString("el-GR") : "",
      from: timeFrom,
      to: timeTo,
      ...form,
      photo: form.photo ? form.photo.name : null,
    };

    const bookingCode = `RB-${Date.now().toString(36).toUpperCase()}`;
    const photoUrl = form.photo ? URL.createObjectURL(form.photo) : null;

    nav("/booking-success", {
      state: {
        bookingCode,
        roomLabel: finalRoom, // αν θες label αντί id, το αλλάζουμε
        date: selectedDate ? selectedDate.toLocaleDateString("el-GR") : "",
        from: timeFrom,
        to: timeTo,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        photoUrl,
      },
    });
  }

  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title rb-page-title">
          Κάντε Κράτηση Χώρου
        </h2>

        {/* 1) Επιλογή χώρου (με καρτέλες) */}
        <div className="rb-booking-block mt-4">
          <h4 className="fw-bold rb-booking-h">Επιλέξτε χώρο:</h4>

          {/* CARD 1 */}
          <div className="rb-choice-panel">
            <div className="rb-choice-row">
              {topCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`rb-choice-btn ${stepTop === c.id ? "is-active" : ""}`}
                  onClick={() => {
                    setStepTop(c.id);
                    setStepTeachSub(null);
                    setFinalRoom(null);
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* CARD 2 (μόνο για teach) */}
          {stepTop === "teach" && (
            <div className="rb-choice-panel mt-3 rb-subpanel">
              <div className="rb-choice-row">
                {teachingSub.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`rb-choice-btn ${stepTeachSub === s.id ? "is-active" : ""}`}
                    onClick={() => {
                      setStepTeachSub(s.id);
                      setFinalRoom(null);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CARD 3 (τελική επιλογή) */}
          {(stepTop === "teach" || stepTop === "meeting" || stepTop === "present") && (
            <div className="rb-choice-panel mt-3 rb-subpanel">
              <div className="rb-choice-row">
                {/* teach -> class */}
                {stepTop === "teach" &&
                  stepTeachSub === "teach-class" &&
                  classRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`rb-choice-btn ${finalRoom === r.id ? "is-active" : ""}`}
                      onClick={() => setFinalRoom(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}

                {/* teach -> lab */}
                {stepTop === "teach" &&
                  stepTeachSub === "teach-lab" &&
                  labRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`rb-choice-btn ${finalRoom === r.id ? "is-active" : ""}`}
                      onClick={() => setFinalRoom(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}

                {/* meeting */}
                {stepTop === "meeting" &&
                  meetingRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`rb-choice-btn ${finalRoom === r.id ? "is-active" : ""}`}
                      onClick={() => setFinalRoom(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}

                {/* present */}
                {stepTop === "present" &&
                  presentationRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`rb-choice-btn ${finalRoom === r.id ? "is-active" : ""}`}
                      onClick={() => setFinalRoom(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}
              </div>

              {stepTop === "teach" && !stepTeachSub && (
                <div className="text-muted small mt-3 text-center">
                  Επίλεξε πρώτα υποκατηγορία (Διδασκαλίας ή Εργαστηρίου).
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2) Ημερολόγιο (κανονικό με αλλαγή μήνα) */}
        <div className="rb-booking-block mt-4">
          <h4 className="fw-bold rb-booking-h">Επιλέξτε ημερομηνία:</h4>

          <div className="rb-calendar card border-0 shadow-sm rb-calendar-compact">
            <div className="card-body">
              <div className="rb-cal-head">
                <div className="rb-cal-title">Ημερολόγιο</div>
                <div className="rb-cal-note">* Διαθέσιμες μόνο κάποιες ημέρες</div>
              </div>

              <div className="rb-cal-grid">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    inline
                    calendarStartDay={1}
                    dateFormat="dd/MM/yyyy"
                    locale="el"
                    minDate={new Date()}                 // ΜΟΝΟ από σήμερα και μετά
                    filterDate={(date) => isDateEnabled(date)}
                    dayClassName={(date) => (isDateEnabled(date) ? "" : "rb-day-disabled")}
                 />

              </div>
            </div>
          </div>
        </div>

        {/* 3) Ώρα */}
        <div className="rb-booking-block mt-4">
          <h4 className="fw-bold rb-booking-h">Επιλέξτε ώρα:</h4>

          <div className="rb-time card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-6 d-flex align-items-center gap-3">
                  <div className="rb-time-label">Από</div>
                  <input
                    className="form-control rb-pill-input"
                    type="time"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-6 d-flex align-items-center gap-3">
                  <div className="rb-time-label">Μέχρι</div>
                  <input
                    className="form-control rb-pill-input"
                    type="time"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4) Φόρμα */}
        <div className="rb-booking-block mt-4 mb-2">
          <h4 className="fw-bold rb-booking-h">Στοιχεία κράτησης:</h4>

          <form onSubmit={onSubmit} className="rb-form card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Όνομα:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="π.χ. Μαρία"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Επώνυμο:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="π.χ. Παπαδοπούλου"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Κινητό:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="π.χ. 69xxxxxxxx"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Email:</label>
                  <input
                    className="form-control rb-pill-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="π.χ. example@mail.com"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Φωτογραφία:</label>
                  <input
                    className="form-control rb-pill-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn rb-confirm-btn">
                    Επιβεβαίωση
                  </button>

                  <div className="text-muted small mt-3">
                    Επιλογές: <strong>{finalRoom || "—"}</strong> | Ημερομηνία:{" "}
                    <strong>{selectedDate ? selectedDate.toLocaleDateString("el-GR") : "—"}</strong>{" "}
                    | Ώρα: <strong>{timeFrom}</strong> - <strong>{timeTo}</strong>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
