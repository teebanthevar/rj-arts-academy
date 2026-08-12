import React, { useState, useEffect } from "react";
import {
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineBanknotes,
  HiOutlineLockClosed,
  HiOutlineCheck,
} from "react-icons/hi2";
import { FaCamera } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "./TutorSettings.css";

export default function TutorSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Comprehensive profile state including all onboarding fields
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    profession: "",
    category: "Academic Subjects",
    experience: "",
    qualification: "",
    country: "",
    state: "",
    city: "",
    hourly_rate: "",
    teaching_mode: "Online",
    bio: "",
    avatar_url: "",
  });

  const [notifications, setNotifications] = useState({
    emailNewStudent: true,
    emailNewReview: true,
    emailMarketing: false,
    smsAlerts: true,
  });

  const [payout, setPayout] = useState({
    bankName: "Maybank",
    accNumber: "114012345678",
    accHolder: "",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || data.name || "",
          email: user.email || "",
          phone: data.phone || "",
          profession: data.profession || "",
          category: data.category || "Academic Subjects",
          experience: data.experience || "",
          qualification: data.qualification || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          hourly_rate: data.hourly_rate || "",
          teaching_mode: data.teaching_mode || "Online",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
        setPayout((prev) => ({
          ...prev,
          accHolder: data.full_name || data.name || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching settings profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));

      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, email: user.email, avatar_url: avatarUrl }, { onConflict: "id" });

      if (dbError) throw dbError;

      window.dispatchEvent(new Event("profileUpdated"));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert("Failed to upload image. Ensure the 'avatars' bucket is public.");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      const payload = {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        phone: profile.phone,
        profession: profile.profession,
        category: profile.category,
        experience: profile.experience,
        qualification: profile.qualification,
        country: profile.country,
        state: profile.state,
        city: profile.city,
        hourly_rate: profile.hourly_rate ? parseFloat(profile.hourly_rate) : null,
        teaching_mode: profile.teaching_mode,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      window.dispatchEvent(new Event("profileUpdated"));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err.message);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: security.newPassword });
      if (error) throw error;

      setSavedSuccess(true);
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenericSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getInitials = (name) => {
    if (!name) return "TU";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your professional profile, preferences, and security details.</p>
      </div>

      {savedSuccess && (
        <div className="success-toast">
          <HiOutlineCheck /> Settings saved successfully!
        </div>
      )}

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="settings-layout">
        {/* Sidebar Navigation Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <HiOutlineUser /> Profile Info
          </button>
          <button
            className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <HiOutlineBell /> Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === "payout" ? "active" : ""}`}
            onClick={() => setActiveTab("payout")}
          >
            <HiOutlineBanknotes /> Payout Method
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <HiOutlineLockClosed /> Security
          </button>
        </div>

        {/* Content Box */}
        <div className="settings-content-card">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} className="settings-form">
              <h3>Profile Information</h3>
              
              <div className="avatar-section">
                <div className="large-avatar-wrapper">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="large-avatar-img" />
                  ) : (
                    <div className="large-avatar">{getInitials(profile.full_name)}</div>
                  )}
                  <label htmlFor="settings-avatar-input" className="avatar-edit-badge">
                    <FaCamera />
                  </label>
                  <input
                    id="settings-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </div>
                <div>
                  <p className="avatar-hint">{uploading ? "Uploading..." : "JPG, PNG or GIF. Max 2MB."}</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label>Profession / Title</label>
                  <input
                    type="text"
                    value={profile.profession}
                    onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                    placeholder="e.g. Senior Math Educator"
                  />
                </div>

                <div className="form-group">
                  <label>Teaching Category</label>
                  <select
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  >
                    <option value="Academic Subjects">Academic Subjects</option>
                    <option value="Arts & Design">Arts & Design</option>
                    <option value="Programming & Tech">Programming & Tech</option>
                    <option value="Music & Performing">Music & Performing</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="form-group">
                  <label>Highest Qualification</label>
                  <input
                    type="text"
                    value={profile.qualification}
                    onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                    placeholder="e.g. Master's in Mathematics"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+60 12-345 6789"
                  />
                </div>

                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={profile.hourly_rate}
                    onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                    placeholder="e.g. 45"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>

                <div className="form-group">
                  <label>State / Region</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>Teaching Mode</label>
                  <select
                    value={profile.teaching_mode}
                    onChange={(e) => setProfile({ ...profile, teaching_mode: e.target.value })}
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Tutor Bio / Introduction</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Introduce yourself to prospective students..."
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <form onSubmit={handleGenericSave} className="settings-form">
              <h3>Notification Preferences</h3>
              <div className="toggle-list">
                <div className="toggle-item">
                  <div>
                    <h4>New Student Enrollment</h4>
                    <p>Receive email notifications when a new student joins your course.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNewStudent}
                    onChange={(e) => setNotifications({ ...notifications, emailNewStudent: e.target.checked })}
                  />
                </div>

                <div className="toggle-item">
                  <div>
                    <h4>New Reviews & Comments</h4>
                    <p>Get notified when students post a review on your courses.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNewReview}
                    onChange={(e) => setNotifications({ ...notifications, emailNewReview: e.target.checked })}
                  />
                </div>

                <div className="toggle-item">
                  <div>
                    <h4>SMS Payout Alerts</h4>
                    <p>Get instant SMS updates when earnings are disbursed to your bank.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                  />
                </div>
              </div>

              <button type="submit" className="save-btn">Save Preferences</button>
            </form>
          )}

          {/* PAYOUT TAB */}
          {activeTab === "payout" && (
            <form onSubmit={handleGenericSave} className="settings-form">
              <h3>Bank Account Details</h3>
              <p className="section-desc">Your monthly earnings will be deposited directly to this account.</p>
              
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Bank Name</label>
                  <select
                    value={payout.bankName}
                    onChange={(e) => setPayout({ ...payout, bankName: e.target.value })}
                  >
                    <option value="Maybank">Malayan Banking Berhad (Maybank)</option>
                    <option value="CIMB">CIMB Bank</option>
                    <option value="Public Bank">Public Bank</option>
                    <option value="RHB">RHB Bank</option>
                    <option value="Hong Leong">Hong Leong Bank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={payout.accNumber}
                    onChange={(e) => setPayout({ ...payout, accNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    value={payout.accHolder}
                    onChange={(e) => setPayout({ ...payout, accHolder: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="save-btn">Update Bank Info</button>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordUpdate} className="settings-form">
              <h3>Change Password</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}