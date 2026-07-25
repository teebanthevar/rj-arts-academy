import {
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaIdCard,
  FaCircle,
} from "react-icons/fa";

import "./ProfileCard.css";

function ProfileCard({ student }) {
  return (
    <div className="profile-card">

      <div className="profile-top">

        <img
          src={
            student?.profile_image ||
            "https://ui-avatars.com/api/?background=0F3D2E&color=fff&size=300&name=" +
              encodeURIComponent(student?.full_name || "Student")
          }
          alt="Student"
        />

        <div className="online-status">
          <FaCircle />
          Online
        </div>

      </div>

      <h2>{student?.full_name || "Creative Student"}</h2>

      <p>RJ Arts Academy Student</p>

      <div className="profile-info">

        <div>
          <FaIdCard />
          <span>{student?.student_id || "Not Assigned"}</span>
        </div>

        <div>
          <FaGraduationCap />
          <span>{student?.course || "Art Foundation"}</span>
        </div>

        <div>
          <FaEnvelope />
          <span>{student?.email || "No Email"}</span>
        </div>

        <div>
          <FaPhone />
          <span>{student?.phone || "-"}</span>
        </div>

      </div>

    </div>
  );
}

export default ProfileCard;