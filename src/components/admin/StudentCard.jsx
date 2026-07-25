import {
  FaEnvelope,
  FaPhone,
  FaStar,
} from "react-icons/fa";

import "./StudentCard.css";

function StudentCard({ student }) {
  return (
    <div className="student-card">

      <img
        src={
          student.profile_image ||
          "https://placehold.co/200x200?text=RJ"
        }
        alt=""
      />

      <h2>{student.full_name}</h2>

      <p>{student.level}</p>

      <div className="student-info">

        <span>

          <FaEnvelope />

          {student.email}

        </span>

        <span>

          <FaPhone />

          {student.phone || "-"}

        </span>

        <span>

          <FaStar />

          {student.points} Points

        </span>

      </div>

      <button>

        View Profile

      </button>

    </div>
  );
}

export default StudentCard;