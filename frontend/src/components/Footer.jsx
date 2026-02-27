import React from "react";

export default function Footer() {
  return (
    <footer className="rb-footer mt-auto">
      <div className="container py-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <h5 className="fw-bold mb-2">Επικοινωνία</h5>
            <ul className="list-unstyled mb-0">
              <li>Email: info@roombooking.gr</li>
              <li>Τηλέφωνο: +30 210 123 4567</li>
              <li>Διεύθυνση: Λεωφόρος Πανεπιστημίου 25, Αθήνα</li>
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <h5 className="fw-bold mb-2">Χρήσιμες Πληροφορίες</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a className="rb-footer-link" href="/about">
                  Σχετικά με εμάς
                </a>
              </li>
              <li>
                <a className="rb-footer-link" href="/faq">
                  Συχνές Ερωτήσεις (FAQ)
                </a>
              </li>
              <li>
                <a className="rb-footer-link" href="/terms">
                  Όροι Χρήσης
                </a>
              </li>
              <li>
                <a className="rb-footer-link" href="/contact">
                  Επικοινωνία
                </a>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <h5 className="fw-bold mb-2">Ακολουθήστε μας</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a className="rb-footer-link" href="#">
                  Instagram
                </a>
              </li>
              <li>
                <a className="rb-footer-link" href="#">
                  TikTok
                </a>
              </li>
              <li>
                <a className="rb-footer-link" href="#">
                  Facebook
                </a>
              </li>
              <li>
                <a className="rb-footer-link" href="#">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-3" />
        <div className="text-center small">© 2026 All rights reserved</div>
      </div>
    </footer>
  );
}
