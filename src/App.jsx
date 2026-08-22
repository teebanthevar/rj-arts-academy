import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";

import Loader from "./components/Loader";
import PremiumRoute from "./components/PremiumRoute";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import TutorLayout from "./layouts/TutorLayout";

// =====================================================
// PUBLIC PAGES
// =====================================================

const Home = lazy(() => import("./pages/Home"));
const PublicExplore = lazy(() => import("./pages/PublicExplore"));
const TutorProfile = lazy(() => import("./pages/TutorProfile"));
const StudentPublicProfile = lazy(() => import("./pages/StudentPublicProfile"));
const StudentRegister = lazy(() => import("./pages/StudentRegister"));
const StudentPublicLogin = lazy(() => import("./pages/StudentPublicLogin"));
const StudentLogin = lazy(() => import("./components/StudentLogin"));

const TutorRegister = lazy(() => import("./pages/tutor/TutorRegister"));
const TutorLogin = lazy(() => import("./pages/tutor/TutorLogin"));

// =====================================================
// PRESCHOOL PAGES
// =====================================================

const PreschoolRegister = lazy(() => import("./pages/preschool/PreschoolRegister"));
const PreschoolLogin = lazy(() => import("./pages/preschool/PreschoolLogin"));
const PreschoolDashboard = lazy(() => import("./pages/preschool/PreschoolDashboard"));

// ⭐ NEW: Public Preschool Profile
const PreschoolPublicProfile = lazy(() => import("./pages/PreschoolPublicProfile"));

// =====================================================
// BLOG PAGES
// =====================================================

const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));

// =====================================================
// TUTOR PAGES
// =====================================================

const TutorDashboard = lazy(() => import("./pages/tutor/TutorDashboard"));
const CreateCourse = lazy(() => import("./pages/tutor/CreateCourse"));
const EditCourse = lazy(() => import("./pages/tutor/EditCourse"));
const TutorAnalytics = lazy(() => import("./pages/tutor/TutorAnalytics"));
const TutorMyCourses = lazy(() => import("./pages/tutor/MyCourses"));
const TutorStudents = lazy(() => import("./pages/tutor/TutorStudents"));
const StudentProfile = lazy(() => import("./pages/tutor/StudentProfile"));
const TutorMessages = lazy(() => import("./components/tutor/TutorMessages"));
const TutorEarnings = lazy(() => import("./pages/tutor/TutorEarnings"));
const TutorAdvertisements = lazy(() => import("./pages/tutor/TutorAdvertisements"));
const TutorReviews = lazy(() => import("./pages/tutor/TutorReviews"));
const TutorSubscription = lazy(() => import("./pages/tutor/TutorSubscription"));
const TutorSettings = lazy(() => import("./pages/tutor/TutorSettings"));

// =====================================================
// STUDENT DASHBOARD PAGES
// =====================================================

const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const MyPortfolio = lazy(() => import("./pages/MyPortfolio"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const CoursePlayer = lazy(() => import("./pages/CoursePlayer"));
const QuizPlayer = lazy(() => import("./pages/QuizPlayer"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Certificates = lazy(() => import("./pages/Certificates"));
const Payments = lazy(() => import("./pages/Payments"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// =====================================================
// ADMIN PAGES
// =====================================================

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminStudents = lazy(() => import("./pages/AdminStudents"));
const StudentDetails = lazy(() => import("./pages/StudentDetails"));
const AdminArtworks = lazy(() => import("./pages/AdminArtworks"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const AdminAttendance = lazy(() => import("./pages/AdminAttendance"));
const AdminCertificates = lazy(() => import("./pages/AdminCertificates"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminSubscriptions = lazy(() => import("./pages/AdminSubscriptions"));
const AdminAnnouncement = lazy(() => import("./pages/AdminAnnouncement"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* =====================================================
            STANDALONE PUBLIC PAGES
            No Academy Header / No Dashboard Sidebar
        ===================================================== */}

        {/* TeachHub Explore */}
        <Route
          path="/teachhub"
          element={<PublicExplore />}
        />

        {/* Tutor Public Profile */}
        <Route
          path="/tutor-profile/:id"
          element={<TutorProfile />}
        />

        {/* Student Login */}
        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        {/* Student Registration */}
        <Route
          path="/student-register"
          element={<StudentRegister />}
        />

        {/* Student Public Login */}
        <Route
          path="/student-public-login"
          element={<StudentPublicLogin />}
        />

        {/* Student Public Profile */}
        <Route
          path="/student-public-profile/:id"
          element={<StudentPublicProfile />}
        />

        {/* Tutor Registration */}
        <Route
          path="/tutor-register"
          element={<TutorRegister />}
        />

        {/* Tutor Login */}
        <Route
          path="/tutor-login"
          element={<TutorLogin />}
        />


        {/* =====================================================
            PRESCHOOL
        ===================================================== */}

        {/* Preschool Registration */}
        <Route
          path="/preschool-register"
          element={<PreschoolRegister />}
        />

        {/* Preschool Login */}
        <Route
          path="/preschool-login"
          element={<PreschoolLogin />}
        />

        {/* Preschool Dashboard */}
        <Route
          path="/preschool-dashboard"
          element={<PreschoolDashboard />}
        />

        {/* ⭐ PUBLIC PRESCHOOL PROFILE
            Example:
            /preschool-profile/USER_ID
        */}
        <Route
  path="/preschool-public-profile/:id"
  element={<PreschoolPublicProfile />}
/>


        {/* =====================================================
            BLOG
        ===================================================== */}

        <Route
          path="/blog"
          element={<Blog />}
        />

        <Route
          path="/blog/:id"
          element={<BlogArticle />}
        />


        {/* =====================================================
            PUBLIC WEBSITE WITH MAIN LAYOUT
        ===================================================== */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

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
    </Suspense>
  );
}