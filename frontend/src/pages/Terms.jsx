import React from "react";

export default function Terms() {
  return (
    <main className="flex-grow-1">
      <section className="container py-5">
        {/* Title */}
        <h2 className="text-center fw-bold rb-section-title rb-page-title">
          Όροι Χρήσης
        </h2>

        {/* Card */}
        <div className="card border-0 shadow-sm mt-4 rb-info-card">
          <div className="card-body p-4 p-md-5">
            <p className="text-muted mb-4">
              Καλώς ήρθατε στην πλατφόρμα <strong>RoomBooking</strong>.  
              Παρακαλούμε διαβάστε προσεκτικά τους παρακάτω όρους πριν
              χρησιμοποιήσετε τις υπηρεσίες μας.
            </p>

            {/* Section 1 */}
            <h5 className="fw-bold rb-dark-title">1. Αποδοχή Όρων</h5>
            <p className="text-muted">
              Με την πρόσβαση και χρήση της ιστοσελίδας μας, συμφωνείτε ότι
              αποδέχεστε τους παρόντες όρους χρήσης. Αν δεν συμφωνείτε με
              κάποιον από αυτούς, παρακαλούμε μην χρησιμοποιήσετε την υπηρεσία.
            </p>

            {/* Section 2 */}
            <h5 className="fw-bold rb-dark-title mt-4">
              2. Υπηρεσίες Κρατήσεων
            </h5>
            <p className="text-muted">
              Η πλατφόρμα RoomBooking παρέχει δυνατότητα online κράτησης
              εκπαιδευτικών αιθουσών, meeting rooms και χώρων παρουσιάσεων.
              Οι κρατήσεις υπόκεινται στη διαθεσιμότητα των χώρων.
            </p>

            {/* Section 3 */}
            <h5 className="fw-bold rb-dark-title mt-4">
              3. Υποχρεώσεις Χρηστών
            </h5>
            <ul className="text-muted">
              <li>Οι χρήστες οφείλουν να παρέχουν σωστά στοιχεία κράτησης.</li>
              <li>
                Απαγορεύεται η χρήση της πλατφόρμας για ψευδείς ή παραπλανητικές
                κρατήσεις.
              </li>
              <li>
                Ο χρήστης είναι υπεύθυνος για τη σωστή χρήση του λογαριασμού του.
              </li>
            </ul>

            {/* Section 4 */}
            <h5 className="fw-bold rb-dark-title mt-4">
              4. Ακυρώσεις & Τροποποιήσεις
            </h5>
            <p className="text-muted">
              Οι ακυρώσεις ή αλλαγές κρατήσεων μπορούν να πραγματοποιούνται μέσω
              της πλατφόρμας ή μέσω επικοινωνίας με την ομάδα υποστήριξης.
              Ενδέχεται να ισχύουν χρονικοί περιορισμοί ανάλογα με τον χώρο.
            </p>

            {/* Section 5 */}
            <h5 className="fw-bold rb-dark-title mt-4">
              5. Προστασία Δεδομένων
            </h5>
            <p className="text-muted">
              Τα προσωπικά δεδομένα των χρηστών χρησιμοποιούνται αποκλειστικά για
              τη διεκπεραίωση των κρατήσεων και δεν κοινοποιούνται σε τρίτους.
              Η ασφάλεια και η εμπιστευτικότητα αποτελούν προτεραιότητά μας.
            </p>

            {/* Section 6 */}
            <h5 className="fw-bold rb-dark-title mt-4">
              6. Περιορισμός Ευθύνης
            </h5>
            <p className="text-muted">
              Η RoomBooking δεν φέρει ευθύνη για τυχόν τεχνικές δυσκολίες,
              προσωρινή διακοπή λειτουργίας ή προβλήματα που προκύπτουν από
              εξωτερικούς παράγοντες.
            </p>

            {/* Section 7 */}
            <h5 className="fw-bold rb-dark-title mt-4">
              7. Επικοινωνία
            </h5>
            <p className="text-muted mb-0">
              Για οποιαδήποτε απορία σχετικά με τους όρους χρήσης, μπορείτε να
              επικοινωνήσετε μαζί μας μέσω της σελίδας{" "}
              <strong>επικοινωνίας</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
