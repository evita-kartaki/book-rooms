import React from "react";

import computer from "../assets/computer.png";
import physics from "../assets/physics.png";
import chemistry from "../assets/chemistry.png";

const labs = [
  {
    id: "lab1",
    title: "Εργαστήριο Πληροφορικής",
    img: computer,
    text: (
      <>
        Το Εργαστήριο Πληροφορικής είναι ιδανικό για πρακτικά μαθήματα,
        εκπαιδευτικά σεμινάρια και εργασίες που απαιτούν χρήση υπολογιστών και
        σύγχρονων ψηφιακών εργαλείων. Ο χώρος είναι οργανωμένος για ομάδες έως{" "}
        <strong>15 ατόμων</strong>, προσφέροντας άνεση, τεχνολογικό εξοπλισμό και
        κατάλληλο περιβάλλον για αποτελεσματική μάθηση.
      </>
    ),
  },
  {
    id: "lab2",
    title: "Εργαστήριο Φυσικής",
    img: physics,
    text: (
      <>
        Το Εργαστήριο Φυσικής είναι κατάλληλο για πειραματική εκπαίδευση,
        εφαρμογές επιστημονικών εννοιών και πρακτικές δραστηριότητες. Διαθέτει τον
        απαραίτητο χώρο για ασφαλή και οργανωμένη διεξαγωγή εργαστηριακών
        μαθημάτων σε μικρές ομάδες έως <strong>15 ατόμων</strong>, προσφέροντας
        ένα ιδανικό περιβάλλον για έρευνα και εκπαίδευση.
      </>
    ),
  },
  {
    id: "lab3",
    title: "Εργαστήριο Χημείας",
    img: chemistry,
    text: (
      <>
        Το Εργαστήριο Χημείας είναι σχεδιασμένο για πειράματα, εκπαιδευτικές
        εφαρμογές και επιστημονικές δραστηριότητες που απαιτούν ειδικές υποδομές.
        Ο χώρος φιλοξενεί έως <strong>15 άτομα</strong> και προσφέρει ασφαλές,
        καθαρό και πλήρως οργανωμένο περιβάλλον για εργαστηριακά μαθήματα και
        πρακτική εξάσκηση.
      </>
    ),
  },
];

export default function TeachingRoomLab() {
  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Αίθουσες Εργαστηρίων
        </h2>

        <div className="rb-tr-list d-flex flex-column gap-4">
          {labs.map((lab) => (
            <div key={lab.id} className="rb-tr-card shadow-sm">
              <div className="rb-tr-grid">
                {/* IMAGE */}
                <div className="rb-tr-imgwrap">
                  <img
                    src={lab.img}
                    alt={lab.title}
                    className="rb-tr-img"
                  />
                </div>

                {/* TEXT */}
                <div className="rb-tr-content">
                  <h4 className="fw-bold mb-2 rb-tr-title">{lab.title}</h4>
                  <p className="mb-0 rb-tr-text">{lab.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
