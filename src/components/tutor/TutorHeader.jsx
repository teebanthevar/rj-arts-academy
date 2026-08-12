import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaSearch,
  FaBell,
  FaEnvelope,
  FaGem
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "../../styles/TutorHeader.css";

function TutorHeader({ toggleSidebar }) {
  const [profile, setProfile] = useState({
    fullName: "Tutor",
    profession: "Premium Tutor",
    avatarUrl: "",
  });
  const [trialDays, setTrialDays] = useState(28);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchTutorHeaderData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch profile info
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileError && profileData) {
        setProfile({
          fullName:
            profileData.full_name ||
            profileData.fullName ||
            user.email?.split("@")[0] ||
            "Tutor",
          profession: profileData.profession || "Premium Tutor",
          avatarUrl: profileData.avatar_url || "",
        });
      }

      // 2. Fetch subscription trial days
      const { data: subData, error: subError } = await supabase
        .from("tutor_subscriptions")
        .select("trial_days_remaining")
        .eq("tutor_id", user.id)
        .maybeSingle();

      if (!subError && subData && subData.trial_days_remaining !== null) {
        setTrialDays(subData.trial_days_remaining);
      }

      // 3. Fetch real unread messages count safely
      const { count: msgCount, error: msgError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("tutor_identifier", user.id)
        .eq("is_read", false);

      if (!msgError) {
        setUnreadMessages(msgCount || 0);
      }

      // 4. Fetch real unread notifications count safely
      const { count: notifCount, error: notifError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!notifError) {
        setUnreadNotifications(notifCount || 0);
      }
    } catch (err) {
      console.error("Unexpected error loading header data:", err);
    }
  };

  useEffect(() => {
    fetchTutorHeaderData();

    const handleProfileUpdate = () => {
      fetchTutorHeaderData();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const displayAvatar =
    profile.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.fullName
    )}&background=0F3D2E&color=fff`;

  return (
    <header className="tutor-header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search students, courses..."
          />
        </div>
      </div>

      <div className="header-right">
        <div className="trial-box">
          <FaGem />
          <span>{trialDays} Days Free Trial</span>
        </div>

        {/* Messages / Envelope Button */}
        <button className="icon-btn" title="Messages">
          <FaEnvelope />
          {unreadMessages > 0 && <span>{unreadMessages}</span>}
        </button>

        {/* Notifications / Bell Button */}
        <button className="icon-btn" title="Notifications">
          <FaBell />
          {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
        </button>

        <div className="tutor-profile">
          <img
            src={displayAvatar}
            alt={profile.fullName}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h4>{profile.fullName}</h4>
            <small>{profile.profession}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TutorHeader;