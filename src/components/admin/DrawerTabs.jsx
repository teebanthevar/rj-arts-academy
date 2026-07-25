import { useState } from "react";
import StudentPortfolio from "./StudentPortfolio";

function DrawerTabs({ student }) {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <div className="drawer-tabs">
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>

        <button
          className={tab === "portfolio" ? "active" : ""}
          onClick={() => setTab("portfolio")}
        >
          Portfolio
        </button>

        <button
          className={tab === "attendance" ? "active" : ""}
          onClick={() => setTab("attendance")}
        >
          Attendance
        </button>

        <button
          className={tab === "payments" ? "active" : ""}
          onClick={() => setTab("payments")}
        >
          Payments
        </button>
      </div>

      {tab === "overview" && (
        <div className="tab-content">
          <div className="info-row">
            <strong>Email</strong>
            <span>{student.email}</span>
          </div>
          <div className="info-row">
            <strong>Phone</strong>
            <span>{student.phone || "-"}</span>
          </div>
          <div className="info-row">
            <strong>Course</strong>
            <span>{student.course || "-"}</span>
          </div>
          <div className="info-row">
            <strong>Level</strong>
            <span>{student.level || "-"}</span>
          </div>
          <div className="info-row">
            <strong>Points</strong>
            <span>{student.points || 0}</span>
          </div>
        </div>
      )}

      {tab === "portfolio" && (
        <div className="tab-content">
          <StudentPortfolio 
            student={student} 
          />
        </div>
      )}

      {tab === "attendance" && (
        <div className="tab-content">
          <div className="coming-soon">
            📅 Attendance records
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="tab-content">
          <div className="coming-soon">
            💳 Payment history
          </div>
        </div>
      )}
    </>
  );
}

export default DrawerTabs;