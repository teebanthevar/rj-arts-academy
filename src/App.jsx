import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";

import Loader from "./components/Loader";
import SupabaseTest from "./components/SupabaseTest";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";

// Dashboard Pages
import DashboardHome from "./pages/DashboardHome";
import MyPortfolio from "./pages/MyPortfolio";
import MyCourses from "./pages/MyCourses";
import Attendance from "./pages/Attendance";
import Certificates from "./pages/Certificates";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import StudentDetails from "./pages/StudentDetails";
import AdminArtworks from "./pages/AdminArtworks";
import AdminCourses from "./pages/AdminCourses";
import AdminAttendance from "./pages/AdminAttendance";
import AdminCertificates from "./pages/AdminCertificates";
import AdminPayments from "./pages/AdminPayments";
import AdminAnnouncement from "./pages/AdminAnnouncement";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <SupabaseTest />

      <Routes>
        {/* Public Website */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Login */}
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Student Dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/student-dashboard" element={<DashboardHome />} />
          <Route path="/portfolio" element={<MyPortfolio />} />
          <Route path="/courses" element={<MyCourses />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Admin Login (Outside Layout) */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Dashboard Pages (Inside AdminLayout) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/students/:id" element={<StudentDetails />} />
          <Route path="/admin/artworks" element={<AdminArtworks />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/announcements" element={<AdminAnnouncement />} />
        </Route>
      </Routes>
    </>
  );
}