import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaBookOpen,
  FaChartLine,
  FaCheckCircle,
  FaCreditCard,
  FaStickyNote,
  FaAward,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "./StudentProfile.css";

export default function StudentProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at")
        .eq("id", id)
        .single();

      if (profileErr || !profileData) {
        setError("Student not found.");
        setLoading(false);
        return;
      }

      setStudent(profileData);

      const { data: enrollData, error: enrollErr } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", id)
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

      if (!enrollErr && enrollData) {
        setEnrollments(enrollData);
      }
    } catch (err) {
      console.error("Error loading student profile:", err);
      setError("Something went wrong loading this profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading student profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <Link to="/tutor/students">← Back to Students</Link>
      </div>
    );
  }

  const initials = (student.full_name || "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinedDate = student.created_at
    ? new Date(student.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const activeCourseCount = enrollments.filter(
    (e) => e.status === "approved"
  ).length;

  return (
    <div className="tutor-student-profile">
      {/* Header Banner */}
      <div className="profile-header-banner">
        <h1>Student Profile</h1>
        <p>Detailed overview of student progress and information.</p>
      </div>

      {/* Main Layout Grid */}
      <div className="profile-grid">
        {/* Left Column: Student Bio */}
        <div className="profile-card avatar-card">
          <div className="avatar-circle">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.full_name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <h2>{student.full_name || "Unnamed Student"}</h2>
          <span className="role-badge">
            {enrollments[0]?.course_title || "Student"}
          </span>

          <div className="contact-list">
            <div className="contact-item">
              <FaEnvelope />
              <div>
                <small>Email</small>
                <p>{student.email || "Not provided"}</p>
              </div>
            </div>

            <div className="contact-item">
              <FaPhoneAlt />
              <div>
                <small>Phone</small>
                <p>Not available</p>
              </div>
            </div>

            <div className="contact-item">
              <FaCalendarAlt />
              <div>
                <small>Joined</small>
                <p>{joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Details */}
        <div className="profile-main-details">
          {/* Stats Section */}
          <div className="metrics-row">
            <div className="profile-card metric-card">
              <div className="metric-icon"><FaChartLine /></div>
              <div>
                <h3>—</h3>
                <p>Progress</p>
              </div>
            </div>

            <div className="profile-card metric-card">
              <div className="metric-icon"><FaCheckCircle /></div>
              <div>
                <h3>—</h3>
                <p>Attendance</p>
              </div>
            </div>

            <div className="profile-card metric-card">
              <div className="metric-icon"><FaCreditCard /></div>
              <div>
                <h3>—</h3>
                <p>Fee Status</p>
              </div>
            </div>

            <div className="profile-card metric-card">
              <div className="metric-icon"><FaBookOpen /></div>
              <div>
                <h3>{activeCourseCount}</h3>
                <p>Active Courses</p>
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>

            <button
              className={activeTab === "enrollments" ? "active" : ""}
              onClick={() => setActiveTab("enrollments")}
            >
              Enrollments
            </button>

            <button
              className={activeTab === "attendance" ? "active" : ""}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </button>

            <button
              className={activeTab === "payments" ? "active" : ""}
              onClick={() => setActiveTab("payments")}
            >
              Payments
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="student-sections">
              <div className="info-sections-grid">
                <div className="profile-card section-card">
                  <div className="card-title">
                    <FaStickyNote />
                    <h3>Tutor Notes</h3>
                  </div>
                  <p>No notes added yet for this student.</p>
                </div>

                <div className="profile-card section-card">
                  <div className="card-title">
                    <FaAward />
                    <h3>Certificates</h3>
                  </div>
                  <p>No certificates issued yet.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Enrollments (real data) */}
          {activeTab === "enrollments" && (
            <div className="section-box">
              <h3>Enrollments with You</h3>
              {enrollments.length === 0 ? (
                <p>No enrollment records found.</p>
              ) : (
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Preferred Day</th>
                      <th>Preferred Time</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.id}>
                        <td>{e.course_title || "General Mentorship Program"}</td>
                        <td>{e.status || "pending"}</td>
                        <td>{e.preferred_day || "—"}</td>
                        <td>{e.preferred_time || "—"}</td>
                        <td>
                          {e.created_at
                            ? new Date(e.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab 3: Attendance - not yet tracked */}
          {activeTab === "attendance" && (
            <div className="section-box">
              <h3>Attendance History</h3>
              <p>Attendance tracking isn't set up yet for this student.</p>
            </div>
          )}

          {/* Tab 4: Payments - not yet tracked */}
          {activeTab === "payments" && (
            <div className="section-box">
              <h3>Payment History</h3>
              <p>No payment records available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}