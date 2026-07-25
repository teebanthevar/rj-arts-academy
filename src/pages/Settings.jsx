import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FaSignOutAlt } from "react-icons/fa";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    student_id: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No authenticated user found");
        return;
      }

      const { data, error } = await supabase
        .from("students") 
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          student_id: data.student_id || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("students")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("auth_user_id", user.id);

      if (error) throw error;

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (err) {
      console.error("Error logging out:", err);
      alert(err.message);
    }
  }

  if (loading) {
    return <div className="settings-page"><h2>Loading settings...</h2></div>;
  }

  return (
    <div className="settings-page">
      <form onSubmit={handleSave} style={{ display: "contents" }}>
        {/* Hero */}
        <div className="settings-hero">
          <div>
            <span className="settings-badge">
              ⚙️ Premium Settings
            </span>
            <h1>Account Settings</h1>
            <p>
              Manage your profile, password, notifications and account
              preferences.
            </p>
          </div>

          <div className="settings-actions" style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="save-all-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Account Card */}
        <div className="settings-card">
          <h2>Account Information</h2>

          <div className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                value={profile.student_id}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;