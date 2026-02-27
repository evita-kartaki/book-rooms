import React from "react";
import { Link } from "react-router-dom";

// Χρησιμοποίησε τις εικόνες που έχεις ήδη στα assets
import room1 from "../assets/kathgoria-home-1.png";
import room2 from "../assets/computer.png";

const teachingRooms = [
  {
    id: "t1",
    title: "Αίθουσα Διδασκαλίας",
    img: room1,
    link: "/teaching-room-a",
    text:
      "Οι αίθουσες διδασκαλίας μας είναι ιδανικές για μαθήματα, σεμινάρια και εκπαιδευτικές δραστηριότητες. Προσφέρουν άνετο χώρο, σύγχρονο εξοπλισμό και ήρεμο περιβάλλον για συγκέντρωση και αποτελεσματική μάθηση. Επιλέξτε τη αίθουσα που ταιριάζει στις ανάγκες της ομάδας ή του τμήματός σας και κάντε κράτηση εύκολα για την ημερομηνία και ώρα που επιθυμείτε.",
  },
  {
    id: "t2",
    title: "Αίθουσες Εργαστηρίων",
    img: room2,
    link: "/teaching-room-lab",
    text:
      "Οι αίθουσες εργαστηρίων μας είναι ιδανικές για πρακτική εκπαίδευση, πειράματα και εξειδικευμένα μαθήματα που απαιτούν ειδικό εξοπλισμό. Είτε πρόκειται για εργαστήριο πληροφορικής με σύγχρονους υπολογιστές, είτε για εργαστήριο χημείας ή φυσικής με πειραματικές εφαρμογές, οι χώροι μας προσφέρουν ασφάλεια, άνεση και κατάλληλες υποδομές για κάθε εκπαιδευτική ή επιστημονική δραστηριότητα.",
  },
];

export default function TeachingRooms() {
  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Αίθουσες Διδασκαλίας
        </h2>

        <div className="d-flex flex-column gap-4">
          {teachingRooms.map((room) => (
            <div key={room.id} className="rb-room-card shadow-sm">
              <div className="row g-0 align-items-stretch">
                {/* Εικόνα (αριστερά σε desktop, πάνω σε mobile) */}
                <div className="col-12 col-md-5">
                  <Link to={room.link}>
                   <img
                     src={room.img}
                     alt={room.title}
                     className="rb-room-img rb-room-click"
                     loading="lazy"
                     />
                   </Link>
                </div>

                {/* Κείμενο */}
                <div className="col-12 col-md-7">
                  <div className="rb-room-body">
                    <h4 className="fw-bold rb-room-title mb-2">{room.title}</h4>
                    <p className="mb-0 rb-room-text">{room.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
