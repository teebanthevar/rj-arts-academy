import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!adminId || !password) {
      alert("Please fill in both fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Find the admin using the custom Admin ID
      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("admin_id, full_name, email, role")
        .eq("admin_id", adminId.trim())
        .single();

      if (adminError || !admin) {
        alert("Invalid Admin ID or password");
        return;
      }

      // 2. Make sure this is actually an administrator
      if (admin.role !== "Admin") {
        alert("You do not have administrator access.");
        return;
      }

      // 3. The admin must have an Auth email
      if (!admin.email) {
        alert("This administrator has not been connected to Supabase Auth yet.");
        return;
      }

      // 4. Login through Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: admin.email,
          password,
        });

      if (authError || !authData.session) {
        alert("Invalid Admin ID or password");
        return;
      }

      // 5. Save basic admin information locally
      localStorage.setItem(
        "admin",
        JSON.stringify({
          admin_id: admin.admin_id,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role,
        })
      );

      // 6. Go to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="login-card">
        <h1>RJ Arts Academy</h1>
        <h2>Admin Login</h2>

        <input
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login} disabled={loading}>
          {loading ? "Signing In..." : "Login"}
        </button>
      </div>
    </div>
  );
}