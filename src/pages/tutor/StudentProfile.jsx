import React, { useState } from "react";
import { 
  FaEnvelope, 
  FaPhoneAlt, 
  FaCalendarAlt, 
  FaBookOpen, 
  FaChartLine, 
  FaCheckCircle, 
  FaCreditCard, 
  FaStickyNote, 
  FaAward 
} from "react-icons/fa";
import "./StudentProfile.css";

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState("overview");

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
          <div className="avatar-circle">EL</div>
          <h2>Emma Lee</h2>
          <span className="role-badge">IELTS English Student</span>

          <div className="contact-list">
            <div className="contact-item">
              <FaEnvelope />
              <div>
                <small>Email</small>
                <p>emma@gmail.com</p>
              </div>
            </div>

            <div className="contact-item">
              <FaPhoneAlt />
              <div>
                <small>Phone</small>
                <p>+60 12-3456789</p>
              </div>
            </div>

            <div className="contact-item">
              <FaCalendarAlt />
              <div>
                <small>Joined</small>
                <p>12 July 2026</p>
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
                <h3>78%</h3>
                <p>Progress</p>
              </div>
            </div>

            <div className="profile-card metric-card">
              <div className="metric-icon"><FaCheckCircle /></div>
              <div>
                <h3>95%</h3>
                <p>Attendance</p>
              </div>
            </div>

            <div className="profile-card metric-card">
              <div className="metric-icon"><FaCreditCard /></div>
              <div>
                <h3>Paid</h3>
                <p>Fee Status</p>
              </div>
            </div>

            <div className="profile-card metric-card">
              <div className="metric-icon"><FaBookOpen /></div>
              <div>
                <h3>4</h3>
                <p>Courses</p>
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
              className={activeTab === "attendance" ? "active" : ""}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </button>

            <button
              className={activeTab === "assignments" ? "active" : ""}
              onClick={() => setActiveTab("assignments")}
            >
              Assignments
            </button>

            <button
              className={activeTab === "payments" ? "active" : ""}
              onClick={() => setActiveTab("payments")}
            >
              Payments
            </button>

            <button
              className={activeTab === "messages" ? "active" : ""}
              onClick={() => setActiveTab("messages")}
            >
              Messages
            </button>
          </div>

          {/* Tab 1: Overview Content */}
          {activeTab === "overview" && (
            <div className="student-sections">
              <div className="info-sections-grid">
                <div className="profile-card section-card">
                  <div className="card-title">
                    <FaStickyNote />
                    <h3>Tutor Notes</h3>
                  </div>
                  <p>
                    Emma is improving every week. Her speaking confidence has increased significantly. Focus more on writing and vocabulary practice.
                  </p>
                </div>

                <div className="profile-card section-card">
                  <div className="card-title">
                    <FaAward />
                    <h3>Certificates</h3>
                  </div>
                  <div className="certificate-badge">
                    <FaAward />
                    <span>IELTS Prep Completion</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Attendance Content */}
          {activeTab === "attendance" && (
            <div className="section-box">
              <h3>Attendance History</h3>
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>12 Jul 2026</td>
                    <td>Present</td>
                    <td>2 Hours</td>
                  </tr>
                  <tr>
                    <td>10 Jul 2026</td>
                    <td>Present</td>
                    <td>2 Hours</td>
                  </tr>
                  <tr>
                    <td>8 Jul 2026</td>
                    <td>Absent</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Assignments Content */}
          {activeTab === "assignments" && (
            <div className="section-box">
              <h3>Assignments</h3>
              <ul className="assignment-list">
                <li>Essay Writing ✔ Submitted</li>
                <li>Speaking Practice ✔ Submitted</li>
                <li>Vocabulary Quiz ⏳ Pending</li>
              </ul>
            </div>
          )}

          {/* Tab 4: Payments Content */}
          {activeTab === "payments" && (
            <div className="section-box">
              <h3>Payment History</h3>
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>July</td>
                    <td>Paid</td>
                    <td>RM180</td>
                  </tr>
                  <tr>
                    <td>June</td>
                    <td>Paid</td>
                    <td>RM180</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 5: Messages Content */}
          {activeTab === "messages" && (
            <div className="section-box">
              <h3>Messages</h3>
              <p>No new messages.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
