import { useEffect, useState } from "react";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardGrid from "../components/dashboard/DashboardGrid";
import ProfileCard from "../components/dashboard/ProfileCard";

import { getStudentProfile } from "../lib/student";

import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      const profile = await getStudentProfile();
      setStudent(profile);
      setLoading(false);
    }

    loadStudent();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading Student Dashboard...
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Sidebar */}
      <DashboardSidebar student={student} />

      {/* Main */}
      <main className="dashboard-main">
        {/* Header */}
        <DashboardHeader student={student} />

        {/* Premium Hero */}
        <DashboardHero student={student} />

        {/* Dashboard Body */}
        <section className="dashboard-content">
          {/* Left Side */}
          <div className="dashboard-left">
            <DashboardGrid student={student} />
          </div>

          {/* Right Side */}
          <div className="dashboard-right">
            <ProfileCard student={student} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;