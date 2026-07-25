import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FaIdCard,
  FaPhone,
  FaUserShield,
  FaGraduationCap,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUserFriends,
  FaAward
} from "react-icons/fa";
import "./StudentDetails.css";

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    loadStudent();
  }, [id]);

  async function loadStudent() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setStudent(data);
  }

  if (!student) {
    return <div className="loading-state">Loading student details...</div>;
  }

  return (
    <div className="student-details-page">
      <div className="student-cover">
        <div className="cover-overlay" />
        <div className="student-profile">
          <img
            src={student.avatar_url || "/student-avatar.png"}
            alt=""
            className="student-avatar"
          />
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "28px", fontWeight: "700", margin: "0 0 6px 0" }}>
              {student.full_name || "Unknown Student"}
            </h1>
            <p style={{ color: "#e2e8f0", fontSize: "14px", margin: "0 0 10px 0" }}>
              {student.student_id}
            </p>
            <span className="gold-member">
              {student.membership ? `${student.membership} Member` : "Member"}
            </span>
          </div>
        </div>
      </div>

      <div className="student-stats">
        <div className="stat-box">
          <h2>{student.attendance || 0}%</h2>
          <span>Attendance</span>
        </div>
        <div className="stat-box">
          <h2>{student.artworks || 0}</h2>
          <span>Artworks</span>
        </div>
        <div className="stat-box">
          <h2>{student.certificates || 0}</h2>
          <span>Certificates</span>
        </div>
        <div className="stat-box">
          <h2>{student.level || "N/A"}</h2>
          <span>Level</span>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h2>Personal Information</h2>
          <div className="info-row">
            <FaIdCard />
            <div>
              <label>Student ID</label>
              <p>{student.student_id}</p>
            </div>
          </div>
          <div className="info-row">
            <FaPhone />
            <div>
              <label>Phone</label>
              <p>{student.phone || "Not Provided"}</p>
            </div>
          </div>
          <div className="info-row">
            <FaBirthdayCake />
            <div>
              <label>Date of Birth</label>
              <p>{student.dob || "Not Provided"}</p>
            </div>
          </div>
          <div className="info-row">
            <FaMapMarkerAlt />
            <div>
              <label>Address</label>
              <p>{student.address || "Not Provided"}</p>
            </div>
          </div>
          <div className="info-row">
            <FaUserFriends />
            <div>
              <label>Guardian</label>
              <p>{student.guardian || "Not Provided"}</p>
            </div>
          </div>
        </div>

        <div className="details-card">
          <h2>Academy Information</h2>
          <div className="info-row">
            <FaGraduationCap />
            <div>
              <label>Course</label>
              <p>{student.course || "Not Assigned"}</p>
            </div>
          </div>
          <div className="info-row">
            <FaAward />
            <div>
              <label>Membership</label>
              <p>{student.membership}</p>
            </div>
          </div>
          <div className="info-row">
            <FaCalendarAlt />
            <div>
              <label>Join Date</label>
              <p>{student.join_date || "Not Provided"}</p>
            </div>
          </div>
          <div className="info-row">
            <FaUserShield />
            <div>
              <label>Status</label>
              <p className="active-status">{student.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}