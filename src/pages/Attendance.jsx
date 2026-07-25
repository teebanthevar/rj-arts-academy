import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartPie,
  FaFire,
} from "react-icons/fa";

import "../styles/Attendance.css";

function Attendance() {
  const [loading, setLoading] = useState(true);
  const [attendanceRate, setAttendanceRate] = useState(96);
  const [currentStreak, setCurrentStreak] = useState(18);
  const [attendanceHistory, setAttendanceHistory] = useState([
    { date: "15 July 2026", course: "Watercolour Landscape", status: "Present" },
    { date: "13 July 2026", course: "Acrylic Painting", status: "Present" },
    { date: "11 July 2026", course: "Portrait Drawing", status: "Absent" },
    { date: "9 July 2026", course: "Pencil Sketch", status: "Present" },
    { date: "7 July 2026", course: "Texture Art", status: "Late" },
  ]);

  useEffect(() => {
    fetchStudentAttendance();
  }, []);

  const fetchStudentAttendance = async () => {
    try {
      setLoading(true);

      // 1. Get the currently logged-in user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        console.warn("No active Supabase user session found.");
        setLoading(false);
        return;
      }

      // 2. Automatically fetch the student record matching this logged-in user's ID or Email
      const { data: studentRecords, error: fetchError } = await supabase
        .from("students")
        .select("*")
        .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`);

      if (fetchError) throw fetchError;

      if (studentRecords && studentRecords.length > 0) {
        const student = studentRecords[0];

        // Update state with the dynamic database fields
        if (student.attendance_rate !== null && student.attendance_rate !== undefined) {
          setAttendanceRate(student.attendance_rate);
        } else if (student.attendance !== null && student.attendance !== undefined) {
          setAttendanceRate(student.attendance);
        }

        if (student.current_streak !== null && student.current_streak !== undefined) {
          setCurrentStreak(student.current_streak);
        } else if (student.streak !== null && student.streak !== undefined) {
          setCurrentStreak(student.streak);
        }

        if (student.attendance_data && Array.isArray(student.attendance_data) && student.attendance_data.length > 0) {
          setAttendanceHistory(student.attendance_data);
        }
      }
    } catch (error) {
      console.error("Error fetching dynamic student attendance:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>Loading your attendance...</div>;
  }

  return (
    <div className="attendance-page">
      {/* Hero */}
      <section className="attendance-hero">
        <div className="hero-glow"></div>
        <div>
          <span className="hero-badge">📅 RJ Arts Academy</span>
          <h1>Attendance</h1>
          <p>
            Keep track of every class you've attended and maintain your excellent learning record.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="attendance-stats">
        <div className="stat-card">
          <FaChartPie />
          <h2>{attendanceRate}%</h2>
          <span>Attendance Rate</span>
        </div>
        <div className="stat-card">
          <FaFire />
          <h2>{currentStreak}</h2>
          <span>Current Streak</span>
        </div>
      </section>

      {/* Table */}
      <section className="attendance-card">
        <h2>
          <FaCalendarCheck />
          Attendance History
        </h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.course || item.class || item.session}</td>
                <td>
                  {item.status === "Present" && (
                    <span className="present">
                      <FaCheckCircle />
                      Present
                    </span>
                  )}
                  {item.status === "Absent" && (
                    <span className="absent">
                      <FaTimesCircle />
                      Absent
                    </span>
                  )}
                  {item.status === "Late" && (
                    <span className="late">
                      <FaClock />
                      Late
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Attendance;