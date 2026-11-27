import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { supabase } from "../lib/supabase";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

import "../styles/AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Must have BOTH the saved admin info and a real Supabase session
  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const adminData = localStorage.getItem("admin");
      const { data } = await supabase.auth.getSession();

      if (!adminData || !data.session) {
        localStorage.removeItem("admin");
        navigate("/admin-login", { replace: true });
        return;
      }

      if (active) setCheckingAuth(false);
    }

    checkAdmin();
    return () => {
      active = false;
    };
  }, [navigate]);

  // Close the mobile menu whenever the page changes (after tapping a link)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close with the Esc key, and stop the page behind from scrolling while open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (checkingAuth) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading admin session...
      </div>
    );
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <AdminSidebar />

      {/* dark backdrop behind the sidebar on mobile */}
      <div
        className="admin-backdrop"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="admin-content">
        {/* mobile-only top bar with the hamburger button */}
        <div className="admin-mobile-bar">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <strong>RJ Arts Admin</strong>
        </div>

        <AdminHeader />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;