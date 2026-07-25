import QRCode from "react-qr-code";
import "./StudentIDCard.css";

function StudentIDCard({ profile }) {
  return (
    <div className="student-id-card">

      <div className="id-top">

        <img
          src={
            profile.profile_image ||
            "https://placehold.co/180x180?text=RJ"
          }
          alt="Student"
          className="id-photo"
        />

        <div>

          <h2>{profile.full_name}</h2>

          <p>RJ Arts Academy</p>

          <span>ID : {profile.student_id || "RJ20260001"}</span>

        </div>

      </div>

      <div className="id-middle">

        <div>

          <strong>Course</strong>

          <p>{profile.course || "Fine Arts"}</p>

        </div>

        <div>

          <strong>Level</strong>

          <p>{profile.level || "Beginner"}</p>

        </div>

      </div>

      <div className="id-bottom">

        <QRCode
          value={
            profile.student_id ||
            "RJ20260001"
          }
          size={95}
        />

      </div>

    </div>
  );
}

export default StudentIDCard;