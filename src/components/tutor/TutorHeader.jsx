import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "Tutor",
    profession: "Premium Tutor",
    avatarUrl: "",
  });
  const [trialDays, setTrialDays] = useState(28);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showMsgPanel, setShowMsgPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  const notifRef = useRef(null);
  const msgRef = useRef(null);

  const fetchTutorHeaderData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Profile info
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

      // 2. Subscription trial days
      const { data: subData, error: subError } = await supabase
        .from("tutor_subscriptions")
        .select("trial_days_remaining")
        .eq("tutor_id", user.id)
        .maybeSingle();

      if (!subError && subData && subData.trial_days_remaining !== null) {
        setTrialDays(subData.trial_days_remaining);
      }

      // 3. Unread messages count
      const { count: msgCount, error: msgError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("tutor_identifier", user.id)
        .eq("is_read", false);

      if (!msgError) setUnreadMessages(msgCount || 0);

      // 4. Unread notifications count
      const { count: notifCount, error: notifError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!notifError) setUnreadNotifications(notifCount || 0);
    } catch (err) {
      console.error("Unexpected error loading header data:", err);
    }
  };

  const fetchNotificationList = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("fetchNotificationList error:", error);
      return;
    }
    setNotifications(data || []);
  };

  const fetchMessageList = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("tutor_identifier", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("fetchMessageList error:", error);
      return;
    }
    setMessages(data || []);
  };

  // Marks all currently-unread messages as read, both in Supabase and
  // in local state, then zeroes out the header badge.
  const markMessagesAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("tutor_identifier", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("markMessagesAsRead error:", error);
      return;
    }

    setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
    setUnreadMessages(0);
  };

  // Marks all currently-unread notifications as read, both in Supabase
  // and in local state, then zeroes out the header badge.
  const markNotificationsAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("markNotificationsAsRead error:", error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotifications(0);
  };

  const handleBellClick = () => {
    setShowMsgPanel(false);
    setShowNotifPanel((prev) => {
      const next = !prev;
      if (next) {
        fetchNotificationList();
        markNotificationsAsRead();
      }
      return next;
    });
  };

  const handleEnvelopeClick = () => {
    setShowNotifPanel(false);
    setShowMsgPanel((prev) => {
      const next = !prev;
      if (next) {
        fetchMessageList();
        markMessagesAsRead();
      }
      return next;
    });
  };

  const handleProfileClick = () => {
    navigate("/tutor/settings");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
      if (msgRef.current && !msgRef.current.contains(e.target)) {
        setShowMsgPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTutorHeaderData();
    const handleProfileUpdate = () => fetchTutorHeaderData();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const displayAvatar =
    profile.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.fullName
    )}&background=0F3D2E&color=fff`;

  // Table has multiple possible text columns (message, message_text, topic).
  // Fall back through them so we render something no matter which was populated.
  const getMessagePreview = (m) =>
    m.message || m.message_text || m.topic || m.course_title || "New message";

  const getNotificationPreview = (n) =>
    n.title || n.message || n.event || "New notification";

  return (
    <header className="tutor-header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Search students, courses..." />
        </div>
      </div>

      <div className="header-right">
        <div className="trial-box">
          <FaGem />
          <span>{trialDays} Days Free Trial</span>
        </div>

        {/* Messages / Envelope Button */}
        <div className="icon-dropdown-wrapper" ref={msgRef}>
          <button
            className="icon-btn"
            title="Messages"
            onClick={handleEnvelopeClick}
          >
            <FaEnvelope />
            {unreadMessages > 0 && <span>{unreadMessages}</span>}
          </button>

          {showMsgPanel && (
            <div className="dropdown-panel">
              <h5>Messages</h5>
              {messages.length === 0 ? (
                <p className="empty-state">No messages yet.</p>
              ) : (
                <ul>
                  {messages.map((m) => (
                    <li key={m.id} className={m.is_read ? "" : "unread"}>
                      <p>{getMessagePreview(m)}</p>
                      <small>{new Date(m.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Notifications / Bell Button */}
        <div className="icon-dropdown-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            title="Notifications"
            onClick={handleBellClick}
          >
            <FaBell />
            {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
          </button>

          {showNotifPanel && (
            <div className="dropdown-panel">
              <h5>Notifications</h5>
              {notifications.length === 0 ? (
                <p className="empty-state">No notifications yet.</p>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li key={n.id} className={n.is_read ? "" : "unread"}>
                      <p>{getNotificationPreview(n)}</p>
                      <small>{new Date(n.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div
          className="tutor-profile"
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
          title="Go to Settings"
        >
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