import React from "react";

import g1 from "../assets/presentation-room-1.png";
import g2 from "../assets/presentation-room-2.png";

const rooms = [
  {
    id: "g1",
    title: "Αίθουσα Παρουσιάσεων Γ1",
    img: g1,
    text: (
      <>
        Η Αίθουσα Παρουσιάσεων Γ1 είναι ιδανική για ομιλίες, διαλέξεις, σεμινάρια
        και μικρότερες εκδηλώσεις με κοινό έως <strong>50 άτομα</strong>.
        Προσφέρει άνετη διάταξη τύπου αμφιθεάτρου και κατάλληλο εξοπλισμό για
        παρουσιάσεις, δημιουργώντας ένα επαγγελματικό και οργανωμένο περιβάλλον
        για κάθε σημαντική παρουσίαση.
      </>
    ),
  },
  {
    id: "g2",
    title: "Αίθουσα Παρουσιάσεων Γ2",
    img: g2,
    text: (
      <>
        Η Αίθουσα Παρουσιάσεων Γ2 είναι ένας μεγάλος και εντυπωσιακός χώρος,
        κατάλληλος για συνέδρια, keynote ομιλίες, μεγάλες παρουσιάσεις και
        εκδηλώσεις με έως <strong>200 συμμετέχοντες</strong>. Διαθέτει ευρύχωρη
        αμφιθεατρική διάταξη και προσφέρει την ιδανική ατμόσφαιρα για εκδηλώσεις
        υψηλού επιπέδου που απαιτούν μεγαλύτερη χωρητικότητα και επαγγελματική
        παρουσίαση.
      </>
    ),
  },
];

export default function PresentationRooms() {
  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Αίθουσες Παρουσιάσεων Γ1-Γ2
        </h2>

        <div className="rb-tr-list d-flex flex-column gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="rb-tr-card shadow-sm">
              <div className="rb-tr-grid">
                {/* IMAGE (not clickable) */}
                <div className="rb-tr-imgwrap">
                  <img src={r.img} alt={r.title} className="rb-tr-img" />
                </div>

                {/* TEXT */}
                <div className="rb-tr-content">
                  <h4 className="fw-bold mb-2 rb-tr-title">{r.title}</h4>
                  <p className="mb-0 rb-tr-text">{r.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
