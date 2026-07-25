import {
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaPalette,
  FaStar,
  FaCertificate,
  FaCalendarCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import DrawerTabs from "./DrawerTabs";

import "./StudentDrawer.css";

function StudentDrawer({
  student,
  open,
  onClose,
}) {

  if (!open || !student) return null;

  return (

    <div
      className="drawer-overlay show"
      onClick={onClose}
    >

      <div
        className="student-drawer"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="close-btn"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <div className="drawer-top">

          <img
            src={
              student.profile_image ||
              "https://placehold.co/220x220?text=RJ"
            }
            alt=""
          />

          <h2>{student.full_name}</h2>

          <p>{student.email}</p>

        </div>

        <DrawerTabs student={student} />

        <button className="edit-student-btn">
          Edit Student
        </button>

      </div>

    </div>

  );

}

export default StudentDrawer;