import React from "react";

import meeting1 from "../assets/meeting-room-1.png";
import meeting2 from "../assets/meeting-room-2.png";

const meetings = [
  {
    id: "m1",
    title: "Meeting Room B1",
    img: meeting1,
    text: (
      <>
        To Meeting Room B1 είναι ένας φωτεινός και άνετος χώρος, ιδανικός για
        επαγγελματικές συναντήσεις, ομαδικές συζητήσεις και συνεργατικά sessions.
        Διαθέτει ευρύχωρη διάταξη, φυσικό φωτισμό και ένα καθαρό, μοντέρνο
        περιβάλλον που βοηθά στη συγκέντρωση και την παραγωγικότητα. Είναι η
        τέλεια επιλογή για meetings που απαιτούν άνεση και ανοιχτή ατμόσφαιρα.
      </>
    ),
  },
  {
    id: "m2",
    title: "Meeting Room B2",
    img: meeting2,
    text: (
      <>
        To Meeting Room B2 προσφέρει μια πιο premium εμπειρία, κατάλληλη για
        σημαντικές παρουσιάσεις, εταιρικές συναντήσεις και επαγγελματικά events.
        Ο χώρος διαθέτει πιο “luxury” αισθητική, ειδικό φωτισμό για ατμοσφαιρικό
        περιβάλλον και εξοπλισμό όπως projector για παρουσιάσεις και προβολές.
        Είναι ιδανικό για meetings υψηλού επιπέδου που χρειάζονται πιο επίσημο
        και εντυπωσιακό setting.
      </>
    ),
  },
];

export default function MeetingRooms() {
  return (
    <main className="flex-grow-1">
      <section className="container py-4">
        <h2 className="text-center fw-bold rb-section-title mb-4">
          Meeting Rooms B1-B2
        </h2>

        <div className="rb-tr-list d-flex flex-column gap-4">
          {meetings.map((m) => (
            <div key={m.id} className="rb-tr-card shadow-sm">
              <div className="rb-tr-grid">
                {/* IMAGE (not clickable) */}
                <div className="rb-tr-imgwrap">
                  <img src={m.img} alt={m.title} className="rb-tr-img" />
                </div>

                {/* TEXT */}
                <div className="rb-tr-content">
                  <h4 className="fw-bold mb-2 rb-tr-title">{m.title}</h4>
                  <p className="mb-0 rb-tr-text">{m.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
