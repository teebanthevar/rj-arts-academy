import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";

import Loader from "./components/Loader";
import SupabaseTest from "./components/SupabaseTest";
import PremiumRoute from "./components/PremiumRoute";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import TutorLayout from "./layouts/TutorLayout";

// Public Pages
import Home from "./pages/Home";
import PublicExplore from "./pages/PublicExplore";
import TutorProfile from "./pages/TutorProfile";
import StudentPublicProfile from "./pages/StudentPublicProfile";
import StudentRegister from "./pages/StudentRegister";
import StudentPublicLogin from "./pages/StudentPublicLogin";
import StudentLogin from "./pages/StudentLogin";
import TutorRegister from "./pages/tutor/TutorRegister";
import TutorLogin from "./pages/tutor/TutorLogin";

// Blog Pages
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

// Tutor Pages
import TutorDashboard from "./pages/tutor/TutorDashboard";
import CreateCourse from "./pages/tutor/CreateCourse";
import EditCourse from "./pages/tutor/EditCourse";
import TutorAnalytics from "./pages/tutor/TutorAnalytics";
import TutorMyCourses from "./pages/tutor/MyCourses";
import TutorStudents from "./pages/tutor/TutorStudents";
import StudentProfile from "./pages/tutor/StudentProfile";
import TutorMessages from "./components/tutor/TutorMessages";
import TutorEarnings from "./pages/tutor/TutorEarnings";
import TutorAdvertisements from "./pages/tutor/TutorAdvertisements";
import TutorReviews from "./pages/tutor/TutorReviews";
import TutorSubscription from "./pages/tutor/TutorSubscription";
import TutorSettings from "./pages/tutor/TutorSettings";

// Dashboard Pages
import DashboardHome from "./pages/DashboardHome";
import MyPortfolio from "./pages/MyPortfolio";
import MyCourses from "./pages/MyCourses";
import CoursePlayer from "./pages/CoursePlayer";
import QuizPlayer from "./pages/QuizPlayer";
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
import AdminSubscriptions from "./pages/AdminSubscriptions"; // <-- Added import
import AdminAnnouncement from "./pages/AdminAnnouncement";
import AdminBlog from "./pages/AdminBlog";

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
      <Routes>

        {/* =====================================================
            STANDALONE PUBLIC PAGES (No Academy Header, No Sidebar)
        ===================================================== */}

        <Route path="/teachhub" element={<PublicExplore />} />
        <Route path="/tutor-profile/:id" element={<TutorProfile />} />

        <Route path="/student-login" element={<StudentLogin />} />

        <Route path="/student-register" element={<StudentRegister />} />

        <Route
          path="/student-public-login"
          element={<StudentPublicLogin />}
        />

        <Route
          path="/student-public-profile/:id"
          element={<StudentPublicProfile />}
        />

        <Route path="/tutor-register" element={<TutorRegister />} />

        <Route path="/tutor-login" element={<TutorLogin />} />

        {/* Blog Routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogArticle />} />


        {/* =====================================================
            PUBLIC WEBSITE WITH MAIN LAYOUT
            Includes Academy Header
        ===================================================== */}

        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

        </Route>


        {/* =====================================================
            TUTOR DASHBOARD
        ===================================================== */}

        <Route element={<TutorLayout />}>

          <Route
            path="/tutor-dashboard"
            element={<TutorDashboard />}
          />

          <Route
            path="/tutor/create-course"
            element={<CreateCourse />}
          />

          <Route
            path="/tutor/edit-course/:id"
            element={<EditCourse />}
          />

          <Route
            path="/tutor/analytics"
            element={
              <PremiumRoute>
                <TutorAnalytics />
              </PremiumRoute>
            }
          />

          <Route
            path="/tutor/my-courses"
            element={<TutorMyCourses />}
          />

          <Route
            path="/tutor/students"
            element={<TutorStudents />}
          />

          <Route
            path="/tutor/student-profile/:id"
            element={<StudentProfile />}
          />

          <Route
            path="/tutor/messages"
            element={<TutorMessages />}
          />

          <Route
            path="/tutor/earnings"
            element={<TutorEarnings />}
          />

          <Route
            path="/tutor/advertisements"
            element={
              <PremiumRoute>
                <TutorAdvertisements />
              </PremiumRoute>
            }
          />

          <Route
            path="/tutor/ads"
            element={
              <PremiumRoute>
                <TutorAdvertisements />
              </PremiumRoute>
            }
          />

          <Route
            path="/tutor/reviews"
            element={<TutorReviews />}
          />

          <Route
            path="/tutor/subscription"
            element={<TutorSubscription />}
          />

          <Route
            path="/tutor/settings"
            element={<TutorSettings />}
          />

        </Route>


        {/* =====================================================
            STUDENT DASHBOARD
        ===================================================== */}

        <Route element={<DashboardLayout />}>

          <Route
            path="/student-dashboard"
            element={<DashboardHome />}
          />

          <Route
            path="/portfolio"
            element={<MyPortfolio />}
          />

          <Route
            path="/courses"
            element={<MyCourses />}
          />

          <Route
            path="/course-player"
            element={<CoursePlayer />}
          />

          <Route
            path="/quiz-player"
            element={<QuizPlayer />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/certificates"
            element={<Certificates />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>


        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route element={<AdminLayout />}>

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/students"
            element={<AdminStudents />}
          />

          <Route
            path="/admin/students/:id"
            element={<StudentDetails />}
          />

          <Route
            path="/admin/artworks"
            element={<AdminArtworks />}
          />

          <Route
            path="/admin/courses"
            element={<AdminCourses />}
          />

          <Route
            path="/admin/attendance"
            element={<AdminAttendance />}
          />

          <Route
            path="/admin/certificates"
            element={<AdminCertificates />}
          />

          <Route
            path="/admin/payments"
            element={<AdminPayments />}
          />

          <Route
            path="/admin/subscriptions"
            element={<AdminSubscriptions />}
          />

          <Route
            path="/admin/announcements"
            element={<AdminAnnouncement />}
          />

          <Route
            path="/admin/blog"
            element={<AdminBlog />}
          />

        </Route>

      </Routes>
    </>
  );
}