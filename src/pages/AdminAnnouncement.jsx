import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FaBullhorn, FaTrash, FaPlus, FaEdit, FaDatabase } from "react-icons/fa";

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
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert([payload]);

        if (error) throw error;
      }

      setTitle("");
      setMessage("");
      setTime("");
      setLocation("");
      setIsTodayClass(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error.message);
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
    <div style={{ padding: "30px", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
        <FaBullhorn style={{ fontSize: "28px", color: "#d4af37" }} />
        <h1 style={{ color: "#0a1f18", margin: 0 }}>Manage Announcements & Today's Class</h1>
      </div>

      <form 
        onSubmit={handleSaveAnnouncement} 
        style={{ 
          background: "#0a1f18", 
          border: "1px solid rgba(212, 175, 55, 0.3)", 
          padding: "25px", 
          borderRadius: "16px", 
          marginBottom: "30px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "15px" 
        }}
      >
        <h3 style={{ margin: 0 }}>{editingId ? "Edit Item" : "Create New Announcement or Today's Class"}</h3>
        
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#d4af37", cursor: "pointer", fontWeight: "bold" }}>
            <input 
              type="checkbox"
              checked={isTodayClass}
              onChange={(e) => setIsTodayClass(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#d4af37" }}
            />
            Mark as "Today's Class" card on Student Dashboard
          </label>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", color: "#aaa" }}>
            {isTodayClass ? "Class Title" : "Title / Short Text"}
          </label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder={isTodayClass ? "e.g., Advanced Acrylic Painting" : "e.g., Uploaded Acrylic Landscape"} 
            required
            style={{ 
              width: "100%", 
              padding: "12px", 
              borderRadius: "8px", 
              background: "#112e25", 
              border: "1px solid rgba(255,255,255,0.2)", 
              color: "#fff" 
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", color: "#aaa" }}>
            {isTodayClass ? "Class Description" : "Detailed Message (Optional)"}
          </label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder={isTodayClass ? "Learn modern acrylic blending..." : "Add more details..."} 
            rows="3"
            style={{ 
              width: "100%", 
              padding: "12px", 
              borderRadius: "8px", 
              background: "#112e25", 
              border: "1px solid rgba(255,255,255,0.2)", 
              color: "#fff" 
            }}
          />
        </div>

        {isTodayClass && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", color: "#aaa" }}>Class Time</label>
              <input 
                type="text" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                placeholder="e.g., 2:00 PM" 
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  background: "#112e25", 
                  border: "1px solid rgba(255,255,255,0.2)", 
                  color: "#fff" 
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", color: "#aaa" }}>Studio / Location</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., Studio 2" 
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  background: "#112e25", 
                  border: "1px solid rgba(255,255,255,0.2)", 
                  color: "#fff" 
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
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
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px" 
            }}
          >
            <FaPlus /> {editingId ? "Update Item" : "Post Item"}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setTitle(""); setMessage(""); setTime(""); setLocation(""); setIsTodayClass(false); }}
              style={{ 
                background: "transparent", 
                color: "#fff", 
                border: "1px solid rgba(255,255,255,0.3)", 
                padding: "10px 20px", 
                borderRadius: "8px", 
                cursor: "pointer" 
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ background: "#0a1f18", border: "1px solid rgba(212, 175, 55, 0.3)", padding: "25px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Active Announcements & Classes</h3>
          
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
                fontSize: "14px"
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
                  background: "#112e25", 
                  padding: "15px 20px", 
                  borderRadius: "10px", 
                  border: item.is_today_class ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.1)" 
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#fff" }}>{item.title}</h4>
                    {item.is_today_class && (
                      <span style={{ background: "#d4af37", color: "#000", fontSize: "11px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                        Today's Class
                      </span>
                    )}
                  </div>
                  {item.message && <p style={{ margin: 0, color: "#aaa", fontSize: "14px" }}>{item.message}</p>}
                  {item.is_today_class && (
                    <p style={{ margin: "5px 0 0 0", color: "#d4af37", fontSize: "13px" }}>
                      Time: {item.time} | Location: {item.location}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => handleEdit(item)}
                    style={{ 
                      background: "rgba(212, 175, 55, 0.1)", 
                      border: "1px solid #d4af37", 
                      color: "#d4af37", 
                      padding: "8px 12px", 
                      borderRadius: "6px", 
                      cursor: "pointer" 
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ 
                      background: "rgba(255, 0, 0, 0.1)", 
                      border: "1px solid #ff4d4d", 
                      color: "#ff4d4d", 
                      padding: "8px 12px", 
                      borderRadius: "6px", 
                      cursor: "pointer" 
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