import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaSignOutAlt } from "react-icons/fa";
import "./Settings.css";

function Settings() {
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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

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
        return;
      }

      if (data) {
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error } = await supabase
        .from("students")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("auth_user_id", user.id);

      if (error) {
        throw error;
      }

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    const confirmLogout = window.confirm(
      "Are you sure you want to log out?",
    );

    if (!confirmLogout) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to log out.");
      }
    }
  }

  if (loading) {
    return (
      <div className="settings-page settings-loading">
        <h2>Loading settings...</h2>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <form onSubmit={handleSave} className="settings-form-wrapper">
        {/* Hero */}
        <div className="settings-hero">
          <div className="settings-hero-content">
            <span className="settings-badge">
              ⚙️ Premium Settings
            </span>

            <h1>Account Settings</h1>

            <p>
              Manage your profile, password, notifications and account
              preferences.
            </p>
          </div>

          <div className="settings-actions">
            <button
              type="submit"
              className="save-all-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="settings-logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="settings-card">
          <h2>Account Information</h2>

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="full-name">Full Name</label>

              <input
                id="full-name"
                type="text"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    full_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-id">Student ID</label>

              <input
                id="student-id"
                type="text"
                value={profile.student_id}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;