import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAvailableRooms } from "../api/rooms";
import { roomImages, fallbackRoomImage } from "../data/roomImages";

export default function AvailableRooms() {
  const [params] = useSearchParams();
  const date = params.get("date") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setErr("");
      setLoading(true);
      try {
        const data = await getAvailableRooms({ date, from, to });
        if (alive) setRooms(data);
      } catch (e) {
        if (alive) setErr(e.message || "Σφάλμα φόρτωσης");
      } finally {
        if (alive) setLoading(false);
      }
    }

    // Μην κάνεις request αν λείπει κάτι (αποφεύγεις 400)
    if (!date || !from || !to) {
      setRooms([]);
      setErr("Λείπουν στοιχεία αναζήτησης (date/from/to).");
      return;
    }

    load();
    return () => {
      alive = false;
    };
  }, [date, from, to]);

  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title mb-3">
          Διαθέσιμες Αίθουσες
        </h2>

        <div className="text-center text-muted mb-4">
          Ημερομηνία: <strong>{date || "—"}</strong> | Ώρα:{" "}
          <strong>{from || "—"}</strong> - <strong>{to || "—"}</strong>
        </div>

        {loading && <div>Φόρτωση...</div>}
        {err && <div className="alert alert-danger">{err}</div>}

        {!loading && !err && rooms.length === 0 && (
          <div className="alert alert-warning">Δεν βρέθηκαν αίθουσες.</div>
        )}

        {!loading && !err && rooms.length > 0 && (
          <div className="row g-3">
            {rooms.map((r) => (
              <div key={r.Room_id} className="col-12">
                <div className="card border-0 shadow-sm rb-card rb-room-card">
                    <div className="d-flex flex-column flex-sm-row">
                    
                    {/* Image */}
                    <div className="rb-room-img-wrap">
                        <img
                        className="rb-room-img"
                        src={roomImages[r.Short_name] || fallbackRoomImage}
                        alt={r.Short_name}
                        />
                    </div>

                    {/* Content */}
                    <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h5 className="fw-bold mb-1" style={{ color: "var(--rb-dark)" }}>
                            {r.Short_name}
                            </h5>
                            <div className="text-muted">{r.Description}</div>

                            <div className="small mt-2 text-muted">
                            Χωρητικότητα: <strong>{r.Capacity}</strong> άτομα • Όροφος:{" "}
                            <strong>{r.Floor}</strong>
                            </div>
                        </div>

                        <span className="badge rounded-pill text-bg-light border">
                            Διαθέσιμο
                        </span>
                        </div>

                        <div className="mt-auto pt-3">
                        <Link
                            className="btn btn-light fw-semibold ms-auto"
                            to={`/booking?roomId=${r.Room_id}&date=${encodeURIComponent(
                            date
                            )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}
                        >
                            Κάνε κράτηση τώρα
                        </Link>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}