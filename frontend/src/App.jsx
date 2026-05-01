import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileMenu from "./components/MobileMenu";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

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
import AdminBookings from "./pages/AdminBookings";
import AdminRooms from "./pages/AdminRooms";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";
import AdminUsers from "./pages/AdminUsers";
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails";
import CheckIn from "./pages/CheckIn";

function AppLayout() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin-bookings") ||
    location.pathname.startsWith("/admin-rooms") ||
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/admin-users");

  return (
    <div className="min-vh-100 d-flex flex-column rb-page">
      {!isAdminRoute && <Header />}

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
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<MyBookings />} />
        <Route path="/booking-details/:id" element={<BookingDetails />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route
          path="/admin-bookings"
          element={
            <ProtectedAdminRoute>
              <AdminBookings />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin-rooms"
          element={
            <ProtectedAdminRoute>
              <AdminRooms />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileMenu />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}