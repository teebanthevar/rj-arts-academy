import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

import "../styles/AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if the admin is logged in via localStorage
    const adminData = localStorage.getItem("admin");

    if (!adminData) {
      navigate("/admin-login", { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  if (checkingAuth) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading admin session...</div>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <AdminHeader />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;