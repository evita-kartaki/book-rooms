import React from "react";

import a1 from "../assets/teachingroom-a-1.png";
import a2 from "../assets/teachingroom-a-2.png";
import a3 from "../assets/teachingroom-a-3.png";

const rooms = [
  {
    id: "a1",
    title: "Αίθουσα Διδασκαλίας A1",
    img: a1,
    text: (
      <>
        Η αίθουσα διδασκαλίας A1 είναι ιδανική για μικρές ομάδες, ιδιαίτερα
        μαθήματα, tutoring ή mini σεμινάρια. Προσφέρει άνετο και ήσυχο περιβάλλον,
        κατάλληλο για συγκέντρωση και αποτελεσματική διδασκαλία σε{" "}
        <strong>2 έως 5</strong> άτομα.
      </>
    ),
  },
  {
    id: "a2",
    title: "Αίθουσα Διδασκαλίας A2",
    img: a2,
    text: (
      <>
        Η αίθουσα διδασκαλίας A2 είναι κατάλληλη για μεγαλύτερα τμήματα,
        εκπαιδευτικά workshops και ομαδικά μαθήματα. Διαθέτει περισσότερο χώρο και
        άνετη διάταξη, ώστε να φιλοξενεί με ευκολία από{" "}
        <strong>5 έως 15</strong> άτομα σε ένα οργανωμένο εκπαιδευτικό περιβάλλον.
      </>
    ),
  },
  {
    id: "a3",
    title: "Αίθουσα Διδασκαλίας A3",
    img: a3,
    text: (
      <>
        Η αίθουσα διδασκαλίας A3 είναι ιδανική για μεγαλύτερα τμήματα, διαλέξεις,
        εκπαιδευτικά προγράμματα και σεμινάρια με αυξημένο αριθμό συμμετεχόντων.
        Προσφέρει ευρύχωρη διάταξη, άνετα καθίσματα και κατάλληλο περιβάλλον για
        αποτελεσματική διδασκαλία σε ομάδες από <strong>15 έως 40</strong> άτομα.
      </>
    ),
  },
];

export default function TeachingRoomA() {
  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Αίθουσες Διδασκαλίας A1-A2-A3
        </h2>

        <div className="rb-tr-list d-flex flex-column gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="rb-tr-card shadow-sm">
              <div className="rb-tr-grid">
                <div className="rb-tr-imgwrap">
                  <img src={r.img} alt={r.title} className="rb-tr-img" />
                </div>

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
