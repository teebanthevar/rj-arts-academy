import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useStudent } from "../../context/StudentContext";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaArrowRight,
  FaFire,
  FaAward,
} from "react-icons/fa";
import "./DashboardGrid.css";

export default function DashboardGrid() {
  const { student } = useStudent();
  const [announcements, setAnnouncements] = useState([]);
  const [todaysClass, setTodaysClass] = useState({
    title: "Advanced Acrylic Painting",
    message: "Learn modern acrylic blending and premium landscape techniques.",
    time: "2:00 PM",
    location: "Studio 2",
  });

  // Extract dynamic values from student context
  const attendancePercentage = student?.attendance_percentage || "100%";
  const rewardPoints = student?.reward_points || "1,560";
  const certificatesCount =
    student?.certificates_count ||
    (Array.isArray(student?.earned_certificates)
      ? student.earned_certificates.length
      : "4");

  const numAttendance = parseInt(attendancePercentage, 10);
  let attendanceStatus = "Excellent";
  if (numAttendance < 75) {
    attendanceStatus = "Needs Improvement";
  } else if (numAttendance < 90) {
    attendanceStatus = "Good";
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const classItem = data.find((item) => item.is_today_class);
        if (classItem) {
          setTodaysClass({
            title: classItem.title,
            message: classItem.message,
            time: classItem.time || "2:00 PM",
            location: classItem.location || "Studio 2",
          });
        }

        const regularAnnouncements = data
          .filter((item) => !item.is_today_class)
          .slice(0, 4);

        if (regularAnnouncements.length > 0) {
          setAnnouncements(regularAnnouncements);
        }
      }
    } catch (err) {
      console.error("Error fetching announcements:", err.message);
    }
  };

  const handleJoinClass = () => {
    const phoneNumber = "60122451679";
    const studentName = student?.full_name || student?.name || "Student";

    const message = `Hello RJ Arts Academy! I want to join today's class:\n\n*Class:* ${todaysClass.title}\n*Time:* ${todaysClass.time}\n*Location:* ${todaysClass.location}\n\n*Student Name:* ${studentName}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="dashboard-grid">
      {/* =========================
          LEFT COLUMN
      ========================= */}
      <div className="left-column">
        {/* TODAY'S CLASS */}
        <div className="dashboard-card class-card">
          <div className="card-header">
            <h2>Today's Class</h2>
            <span>Live</span>
          </div>
          <div className="class-info">
            <h3>{todaysClass.title}</h3>
            <p>{todaysClass.message}</p>
          </div>
          <div className="class-meta">
            <div>
              <FaCalendarAlt />
              Today
            </div>
            <div>
              <FaClock />
              {todaysClass.time}
            </div>
            <div>
              <FaMapMarkerAlt />
              {todaysClass.location}
            </div>
          </div>
          <button className="join-btn" onClick={handleJoinClass}>
            Join Class
            <FaArrowRight />
          </button>
        </div>

        {/* ATTENDANCE */}
        <div className="dashboard-card attendance-card">
          <div className="card-header">
            <h2>Attendance</h2>
            <span>{attendanceStatus}</span>
          </div>
          <div className="attendance-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: attendancePercentage }}
              ></div>
            </div>
            <h3>{attendancePercentage}</h3>
          </div>
        </div>
      </div>

      {/* =========================
          RIGHT COLUMN
      ========================= */}
      <div className="right-column">
        {/* REWARDS */}
        <div className="dashboard-card rewards-card">
          <div className="card-header">
            <h2>Reward Points</h2>
            <FaFire />
          </div>
          <h1>{rewardPoints}</h1>
          <p>
            Keep attending classes and uploading
            <br />
            your artwork to earn more reward points.
          </p>
        </div>

        {/* CERTIFICATES */}
        <div className="dashboard-card certificates-card">
          <div className="card-header">
            <h2>Certificates</h2>
            <FaAward />
          </div>
          <h1>{certificatesCount}</h1>
          <p>
            Professional certificates earned
            <br />
            from RJ Arts Academy.
          </p>
        </div>

        {/* ANNOUNCEMENTS (DYNAMIC) */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h2>Announcement</h2>
          </div>
          <ul className="activity-list">
            {announcements.length > 0 ? (
              announcements.map((item, index) => (
                <li key={item.id || index}>
                  <span className="activity-dot"></span>
                  {item.title || item.message}
                </li>
              ))
            ) : (
              <>
                <li>
                  <span className="activity-dot"></span>
                  Uploaded Acrylic Landscape
                </li>
                <li>
                  <span className="activity-dot"></span>
                  Earned 150 Reward Points
                </li>
                <li>
                  <span className="activity-dot"></span>
                  Attendance marked Present
                </li>
                <li>
                  <span className="activity-dot"></span>
                  Certificate unlocked
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}