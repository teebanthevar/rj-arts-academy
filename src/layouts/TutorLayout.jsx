import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { FaChartLine, FaUsers, FaEnvelope } from "react-icons/fa";

import TutorSidebar from "../components/tutor/TutorSidebar";
import TutorHeader from "../components/tutor/TutorHeader";

import "../styles/TutorLayout.css";

function TutorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="tutor-layout">
      <TutorSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="tutor-main">
        <TutorHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="tutor-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default TutorLayout;