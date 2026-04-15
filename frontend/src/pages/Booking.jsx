import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const topCategories = [
  { id: "teach", label: "Αίθουσα Διδασκαλίας" },
  { id: "meeting", label: "Meeting Rooms" },
  { id: "present", label: "Αίθουσα Παρουσιάσεων" },
];

const teachingSub = [
  { id: "teach-class", label: "Αίθουσες Διδασκαλίας" },
  { id: "teach-lab", label: "Αίθουσες Εργαστηρίων" },
];



export default function Booking() {
  const navigate = useNavigate();

  const [stepTop, setStepTop] = useState(null);
  const [stepTeachSub, setStepTeachSub] = useState(null);
  const [finalRoom, setFinalRoom] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("11:00");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    photo: null,
  });


  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setForm((prev) => ({
          ...prev,
          firstName: parsedUser.first_name || prev.firstName,
          lastName: parsedUser.last_name || prev.lastName,
          phone: parsedUser.phone || prev.phone,
          email: parsedUser.email || prev.email,
        }));
      } catch (error) {
        console.error("Σφάλμα ανάγνωσης user από localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        setRoomsError("");

        const res = await fetch(`${API_BASE}/api/rooms/`);

        if (!res.ok) {
          throw new Error(`Αποτυχία φόρτωσης δωματίων (${res.status})`);
        }

        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Σφάλμα φόρτωσης δωματίων:", error);
        setRoomsError("Δεν ήταν δυνατή η φόρτωση των δωματίων.");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  const classRooms = rooms.filter((r) => Number(r.Category_id) === 1);
  const labRooms = rooms.filter((r) => Number(r.Category_id) === 2);
  const meetingRooms = rooms.filter((r) => Number(r.Category_id) === 3);
  const presentationRooms = rooms.filter((r) => Number(r.Category_id) === 4);

 

  function handleTopCategoryClick(categoryId) {
    setStepTop(categoryId);
    setStepTeachSub(null);
    setFinalRoom(null);
  }

  function updateFormField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!finalRoom) {
      alert("Επίλεξε δωμάτιο.");
      return false;
    }

    if (!selectedDate) {
      alert("Επίλεξε ημερομηνία.");
      return false;
    }

    if (!timeFrom || !timeTo) {
      alert("Επίλεξε ώρα.");
      return false;
    }

    if (timeTo <= timeFrom) {
      alert("Η ώρα λήξης πρέπει να είναι μετά από την ώρα έναρξης.");
      return false;
    }

    if (!form.firstName.trim()) {
      alert("Συμπλήρωσε όνομα.");
      return false;
    }

    if (!form.lastName.trim()) {
      alert("Συμπλήρωσε επώνυμο.");
      return false;
    }

    if (!form.phone.trim()) {
      alert("Συμπλήρωσε κινητό.");
      return false;
    }

    if (!form.email.trim()) {
      alert("Συμπλήρωσε email.");
      return false;
    }

    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("access");

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const startDateObj = new Date(`${dateStr}T${timeFrom}:00`);
      const endDateObj = new Date(`${dateStr}T${timeTo}:00`);

      const startTime = startDateObj.toISOString();
      const endTime = endDateObj.toISOString();

      const payload = {
        Room_id: finalRoom.Room_id,
        Start_time: startTime,
        End_time: endTime,
        Status: "UPCOMING",
        Guest_first_name: form.firstName.trim(),
        Guest_last_name: form.lastName.trim(),
        Guest_email: form.email.trim(),
        Guest_phone: form.phone.trim(),
      };

      const res = await fetch(`${API_BASE}/api/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const savedBooking = await res.json().catch(() => null);

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        alert("Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        console.error("Booking error:", savedBooking);
        alert(
          `Η κράτηση δεν αποθηκεύτηκε${
            savedBooking ? `: ${JSON.stringify(savedBooking)}` : "."
          }`
        );
        return;
      }

      const photoUrl = form.photo ? URL.createObjectURL(form.photo) : null;

      navigate("/booking-success", {
        replace: true,
        state: {
          bookingId: savedBooking?.Booking_id || null,
          bookingCode: savedBooking?.Booking_id || `RB-${Date.now()}`,
          roomLabel: finalRoom.Short_name,
          date: selectedDate.toLocaleDateString("el-GR"),
          from: timeFrom,
          to: timeTo,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          photoUrl,
          savedBooking,
        },
      });
    } catch (error) {
      console.error("Σφάλμα σύνδεσης:", error);
      alert("Σφάλμα σύνδεσης με τον server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title rb-page-title">
          Κάντε Κράτηση Χώρου
        </h2>

        <div className="rb-booking-block mt-4">
          <h4 className="fw-bold rb-booking-h">Επιλέξτε χώρο:</h4>

          <div className="rb-choice-panel">
            <div className="rb-choice-row">
              {topCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`rb-choice-btn ${stepTop === c.id ? "is-active" : ""}`}
                  onClick={() => handleTopCategoryClick(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {roomsError && (
            <div className="alert alert-danger mt-3 mb-0">{roomsError}</div>
          )}

          {loadingRooms && (
            <div className="text-muted small mt-3">
              Φόρτωση διαθέσιμων δωματίων...
            </div>
          )}

          {stepTop === "teach" && !loadingRooms && (
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

          {stepTop === "teach" && stepTeachSub && !loadingRooms && (
            <div className="rb-choice-panel mt-3 rb-subpanel">
              <div className="rb-choice-row">
                {stepTeachSub === "teach-class" &&
                  classRooms.map((r) => (
                    <button
                      key={r.Room_id}
                      type="button"
                      className={`rb-choice-btn ${
                        finalRoom?.Room_id === r.Room_id ? "is-active" : ""
                      }`}
                      onClick={() => setFinalRoom(r)}
                    >
                      {r.Short_name}
                    </button>
                  ))}

                {stepTeachSub === "teach-lab" &&
                  labRooms.map((r) => (
                    <button
                      key={r.Room_id}
                      type="button"
                      className={`rb-choice-btn ${
                        finalRoom?.Room_id === r.Room_id ? "is-active" : ""
                      }`}
                      onClick={() => setFinalRoom(r)}
                    >
                      {r.Short_name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {stepTop === "meeting" && !loadingRooms && (
            <div className="rb-choice-panel mt-3 rb-subpanel">
              <div className="rb-choice-row">
                {meetingRooms.map((r) => (
                  <button
                    key={r.Room_id}
                    type="button"
                    className={`rb-choice-btn ${
                      finalRoom?.Room_id === r.Room_id ? "is-active" : ""
                    }`}
                    onClick={() => setFinalRoom(r)}
                  >
                    {r.Short_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stepTop === "present" && !loadingRooms && (
            <div className="rb-choice-panel mt-3 rb-subpanel">
              <div className="rb-choice-row">
                {presentationRooms.map((r) => (
                  <button
                    key={r.Room_id}
                    type="button"
                    className={`rb-choice-btn ${
                      finalRoom?.Room_id === r.Room_id ? "is-active" : ""
                    }`}
                    onClick={() => setFinalRoom(r)}
                  >
                    {r.Short_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
                minDate={new Date()}
              />
              </div>
            </div>
          </div>
        </div>

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
                    onChange={(e) => updateFormField("firstName", e.target.value)}
                    placeholder="π.χ. Μαρία"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Επώνυμο:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.lastName}
                    onChange={(e) => updateFormField("lastName", e.target.value)}
                    placeholder="π.χ. Παπαδοπούλου"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Κινητό:</label>
                  <input
                    className="form-control rb-pill-input"
                    value={form.phone}
                    onChange={(e) => updateFormField("phone", e.target.value)}
                    placeholder="π.χ. 69xxxxxxxx"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Email:</label>
                  <input
                    className="form-control rb-pill-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateFormField("email", e.target.value)}
                    placeholder="π.χ. example@mail.com"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Φωτογραφία:</label>
                  <input
                    className="form-control rb-pill-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateFormField("photo", e.target.files?.[0] || null)
                    }
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn rb-confirm-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Αποθήκευση..." : "Επιβεβαίωση"}
                  </button>

                  <div className="text-muted small mt-3">
                    Επιλογές: <strong>{finalRoom?.Short_name || "—"}</strong> |
                    {" "}Ημερομηνία:{" "}
                    <strong>
                      {selectedDate
                        ? selectedDate.toLocaleDateString("el-GR")
                        : "—"}
                    </strong>{" "}
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