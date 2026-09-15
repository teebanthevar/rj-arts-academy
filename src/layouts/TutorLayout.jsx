import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChartLine, FaUsers, FaEnvelope } from "react-icons/fa";

import TutorSidebar from "../components/tutor/TutorSidebar";
import TutorHeader from "../components/tutor/TutorHeader";
import TutorOnboarding from "../components/tutor/TutorOnboarding";

import "../styles/TutorLayout.css";

function TutorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Swap the active PWA manifest to Teach Hub's while inside the tutor app,
  // so installed shortcuts stay in standalone mode across /tutor-dashboard,
  // /tutor/*, etc. (these routes sit outside academy-manifest's scope).
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]');
    const prevHref = link?.getAttribute("href");

    if (link) link.setAttribute("href", "/teachhub-manifest.webmanifest");

    return () => {
      if (link && prevHref) link.setAttribute("href", prevHref);
    };
  }, []);

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

      <TutorOnboarding
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
}

export default TutorLayout;