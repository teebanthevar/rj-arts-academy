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

    // Query your custom admins table for the entered admin_id
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("admin_id", adminId)
      .single();

    setLoading(false);

    if (error || !data) {
      alert("Invalid Admin ID or password");
      return;
    }

    // Check if the password matches
    if (data.password !== password) {
      alert("Invalid Admin ID or password");
      return;
    }

    // Optional: Store admin session locally if needed
    localStorage.setItem("admin", JSON.stringify(data));

    // Redirect to the admin dashboard
    navigate("/admin");
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