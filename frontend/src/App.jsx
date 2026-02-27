import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileMenu from "./components/MobileMenu";

import Home from "./pages/Home";
import TeachingRooms from "./pages/TeachingRooms";
import TeachingRoomA from "./pages/TeachingRoomA";
import TeachingRoomLab from "./pages/TeachingRoomLab";
import MeetingRooms from "./pages/MeetingRooms";
import PresentationRooms from "./pages/PresentationRooms";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Terms from "./pages/Terms";
import AvailableRooms from "./pages/AvailableRooms";
import BookingSuccess from "./pages/BookingSuccess";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 d-flex flex-column rb-page">
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teaching-rooms" element={<TeachingRooms />} />
          <Route path="/teaching-room-a" element={<TeachingRoomA />} />
          <Route path="/teaching-room-lab" element={<TeachingRoomLab />} />
          <Route path="/meeting-rooms" element={<MeetingRooms />} />
          <Route path="/presentation-rooms" element={<PresentationRooms />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/available" element={<AvailableRooms />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
        </Routes>

        <Footer />
        <MobileMenu />
      </div>
    </BrowserRouter>
  );
}
