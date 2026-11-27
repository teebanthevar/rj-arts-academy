import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FaBullhorn, FaTrash, FaPlus, FaEdit, FaDatabase } from "react-icons/fa";

// ---------- shared styles ----------

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",        // stops inputs overflowing their card
  padding: "12px",
  borderRadius: "8px",
  background: "#112e25",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: "15px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  color: "#aaa",
};

const panelStyle = {
  background: "#0a1f18",
  border: "1px solid rgba(212, 175, 55, 0.3)",
  padding: "clamp(16px, 4vw, 25px)",
  borderRadius: "16px",
  boxSizing: "border-box",
  minWidth: 0,
};

function AdminAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isTodayClass, setIsTodayClass] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error.message);
    }
  };

  const seedDefaultAnnouncements = async () => {
    const defaultData = [
      { title: "Uploaded Acrylic Landscape", message: "Student uploaded a new landscape artwork.", time: "", location: "", is_today_class: false },
      { title: "Earned 150 Reward Points", message: "Reward points granted for weekly assignment completion.", time: "", location: "", is_today_class: false },
      { title: "Attendance marked Present", message: "Class attendance recorded successfully.", time: "", location: "", is_today_class: false },
      { title: "Certificate unlocked", message: "Intermediate course completion certificate awarded.", time: "", location: "", is_today_class: false },
      { title: "Advanced Acrylic Painting", message: "Learn modern acrylic blending and premium landscape techniques.", time: "2:00 PM", location: "Studio 2", is_today_class: true },
    ];

    try {
      setLoading(true);
      const { error } = await supabase.from("announcements").insert(defaultData);
      if (error) throw error;
      fetchAnnouncements();
    } catch (error) {
      console.error("Error seeding announcements:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setTime("");
    setLocation("");
    setIsTodayClass(false);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);

      const payload = {
        title,
        message,
        time: isTodayClass ? time : null,
        location: isTodayClass ? location : null,
        is_today_class: isTodayClass
      };

      if (editingId) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert([payload]);

        if (error) throw error;
      }

      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error.message);
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setMessage(item.message || "");
    setTime(item.time || "");
    setLocation(item.location || "");
    setIsTodayClass(item.is_today_class || false);
    window.scrollTo({ top: 0, behavior: "smooth" });   // jump up to the form on phones
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error.message);
    }
  };

  return (
    <div style={{ padding: "clamp(12px, 3vw, 30px)", color: "#fff", boxSizing: "border-box", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
        <FaBullhorn style={{ fontSize: "28px", color: "#d4af37", flexShrink: 0 }} />
        <h1 style={{ color: "#0a1f18", margin: 0, fontSize: "clamp(19px, 5vw, 28px)", lineHeight: 1.25 }}>
          Manage Announcements & Today's Class
        </h1>
      </div>

      <form
        onSubmit={handleSaveAnnouncement}
        style={{
          ...panelStyle,
          marginBottom: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "clamp(16px, 4.5vw, 18px)" }}>
          {editingId ? "Edit Item" : "Create New Announcement or Today's Class"}
        </h3>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#d4af37", cursor: "pointer", fontWeight: "bold" }}>
            <input
              type="checkbox"
              checked={isTodayClass}
              onChange={(e) => setIsTodayClass(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#d4af37", flexShrink: 0 }}
            />
            Mark as "Today's Class" card on Student Dashboard
          </label>
        </div>

        <div>
          <label style={labelStyle}>
            {isTodayClass ? "Class Title" : "Title / Short Text"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isTodayClass ? "e.g., Advanced Acrylic Painting" : "e.g., Uploaded Acrylic Landscape"}
            required
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            {isTodayClass ? "Class Description" : "Detailed Message (Optional)"}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isTodayClass ? "Learn modern acrylic blending..." : "Add more details..."}
            rows="3"
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

        {isTodayClass && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",   // 2 across on desktop, stacks on phones
              gap: "15px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Class Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 2:00 PM"
                style={fieldStyle}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Studio / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Studio 2"
                style={fieldStyle}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#d4af37",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              flex: "1 1 140px",
              maxWidth: "260px",
            }}
          >
            <FaPlus /> {editingId ? "Update Item" : "Post Item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                flex: "0 1 auto",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "clamp(16px, 4.5vw, 18px)" }}>Active Announcements & Classes</h3>

          {announcements.length === 0 && (
            <button
              onClick={seedDefaultAnnouncements}
              disabled={loading}
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid #d4af37",
                color: "#d4af37",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <FaDatabase /> Load Default Data
            </button>
          )}
        </div>

        {announcements.length === 0 ? (
          <p style={{ color: "#aaa", marginTop: "15px" }}>
            No records in Supabase yet. Click <strong>"Load Default Data"</strong> above!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
            {announcements.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",          // buttons drop under the text when there's no room
                  gap: "12px 16px",
                  background: "#112e25",
                  padding: "15px 20px",
                  borderRadius: "10px",
                  border: item.is_today_class ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.1)",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px", marginBottom: "5px" }}>
                    <h4 style={{ margin: 0, color: "#fff", wordBreak: "break-word" }}>{item.title}</h4>
                    {item.is_today_class && (
                      <span style={{ background: "#d4af37", color: "#000", fontSize: "11px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                        Today's Class
                      </span>
                    )}
                  </div>
                  {item.message && (
                    <p style={{ margin: 0, color: "#aaa", fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" }}>
                      {item.message}
                    </p>
                  )}
                  {item.is_today_class && (
                    <p style={{ margin: "5px 0 0 0", color: "#d4af37", fontSize: "13px", wordBreak: "break-word" }}>
                      Time: {item.time} | Location: {item.location}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleEdit(item)}
                    aria-label="Edit"
                    style={{
                      background: "rgba(212, 175, 55, 0.1)",
                      border: "1px solid #d4af37",
                      color: "#d4af37",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                    style={{
                      background: "rgba(255, 0, 0, 0.1)",
                      border: "1px solid #ff4d4d",
                      color: "#ff4d4d",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnnouncement;