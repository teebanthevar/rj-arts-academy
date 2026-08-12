import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/StudentPublicProfile.css";

export default function StudentPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editForm, setEditForm] = useState({ full_name: "", avatar_url: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", image_url: "" });
  const [uploadingProj, setUploadingProj] = useState(false);

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([
    { id: "ai-assistant", name: "TeachHub AI Assistant", role: "AI Support", avatar: "AI", online: true, lastMessage: "Hello student! How can I help you today?" }
  ]);
  const [selectedConversation, setSelectedConversation] = useState("ai-assistant");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const emojisList = ["😀", "🚀", "💡", "🔥", "⭐", "🎨", "📚", "💻", "❤️", "👍", "🎯", "✨"];

  useEffect(() => {
    fetchStudentData();
    fetchMessages();

    const messageSubscription = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        if (payload.new.student_id === id) {
          setMessages((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (profileError) throw profileError;
      setStudent(profileData);
      if (profileData) {
        setEditForm({
          full_name: profileData.full_name || "",
          avatar_url: profileData.avatar_url || ""
        });
      }

      const { data: coursesData, error: coursesError } = await supabase
        .from("enrollments")
        .select("id, course_title, course_id, tutor_id, created_at, status")
        .eq("student_id", id);

      if (coursesError) {
        console.error("Error fetching enrollments:", coursesError);
      }

      setEnrolledCourses(coursesData || []);

      const tutorConversations = [];
      if (coursesData) {
        for (const course of coursesData) {
          if (course.tutor_id && !tutorConversations.some(t => t.id === course.tutor_id)) {
            const { data: tutorProfile, error: tutorError } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", course.tutor_id)
              .maybeSingle();

            if (tutorError || !tutorProfile) {
              continue;
            }

            const tutorName = tutorProfile.full_name || "Course Instructor";
            const initials = tutorName !== "Course Instructor" 
              ? tutorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() 
              : "IN";

            tutorConversations.push({
              id: course.tutor_id,
              name: tutorName,
              role: "Tutor",
              avatar: initials,
              online: true,
              lastMessage: `Instructor for ${course.course_title}`
            });
          }
        }
      }

      setConversations([
        { id: "ai-assistant", name: "TeachHub AI Assistant", role: "AI Support", avatar: "AI", online: true, lastMessage: "Hello student! How can I help you today?" },
        ...tutorConversations
      ]);

      const { data: artData } = await supabase
        .from("artworks")
        .select("*")
        .eq("student_id", id);
      setArtworks(artData || []);
    } catch (err) {
      console.error("Error loading dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissDeclined = async (enrollmentId) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;
      setEnrolledCourses(enrolledCourses.filter(c => c.id !== enrollmentId));
    } catch (err) {
      console.error("Error dismissing declined course:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          avatar_url: editForm.avatar_url
        })
        .eq("id", id);

      if (error) throw error;
      setStudent((prev) => ({ ...prev, ...editForm }));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile details.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUploadProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.image_url.trim()) {
      alert("Please enter both a project title and an image URL.");
      return;
    }

    try {
      setUploadingProj(true);
      const payload = {
        student_id: id,
        title: newProject.title,
        image_url: newProject.image_url,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("artworks")
        .insert([payload])
        .select();

      if (error) throw error;

      if (data) {
        setArtworks((prev) => [data[0], ...prev]);
      }

      setNewProject({ title: "", image_url: "" });
      setShowUploadModal(false);
      alert("Project uploaded successfully!");
    } catch (err) {
      console.error("Error uploading project:", err);
      alert("Failed to upload portfolio project.");
    } finally {
      setUploadingProj(false);
    }
  };

  const handleWhatsAppRedirect = (tierName) => {
    const phoneNumber = "60122451679";
    const studentName = student?.full_name || "Student";
    const message = encodeURIComponent(`Hi, I would like to upgrade my TeachHub account to the ${tierName}. My name is ${studentName} (ID: ${id}). Please guide me through the payment and activation process.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            id: 1,
            tutor_identifier: "ai-assistant",
            message_text: "Hello student! I am your TeachHub AI Assistant. Ask me anything!",
            sender_type: "ai",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleAddEmoji = (emoji) => {
    setMessageBody((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if ((!messageBody.trim() && !attachedFile) || sendingMsg) return;

    try {
      setSendingMsg(true);
      let fileUrl = null;

      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `chat-${id}-${Date.now()}.${fileExt}`;
        const filePath = `chat_attachments/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, attachedFile);

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        }
      }

      const finalMessageText = attachedFile 
        ? `${messageBody} [Attached File: ${attachedFile.name}](${fileUrl})` 
        : messageBody;

      const payload = {
        student_id: id,
        tutor_identifier: selectedConversation,
        message_text: finalMessageText,
        sender_type: "student",
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from("messages").insert([payload]);
      if (error) throw error;

      setMessages((prev) => [...prev, payload]);
      setMessageBody("");
      setAttachedFile(null);

      if (selectedConversation === "ai-assistant") {
        setTimeout(async () => {
          const aiResponsePayload = {
            student_id: id,
            tutor_identifier: "ai-assistant",
            message_text: `I received your message: "${messageBody}". How else can I assist your studies today?`,
            sender_type: "ai",
            created_at: new Date().toISOString()
          };
          await supabase.from("messages").insert([aiResponsePayload]);
          setMessages((prev) => [...prev, aiResponsePayload]);
        }, 1000);
      }

    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/teachhub");
  };

  const approvedCourses = enrolledCourses.filter(c => 
    (!c.status || c.status === "approved") && 
    (c.course_title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingOrDeclinedRequests = enrolledCourses.filter(c => 
    c.status === "pending" || c.status === "declined"
  );

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const activeContact = conversations.find(c => c.id === selectedConversation) || conversations[0];
  const activeMessages = messages.filter(m => m.tutor_identifier === selectedConversation);

  const renderModernMessagingLayout = (height = "560px") => (
    <div className={`messaging-wrapper ${selectedConversation ? "mobile-hide-list mobile-show-chat" : ""}`} style={{ maxWidth: "1050px", margin: "0 auto", display: "flex", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", height, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ width: "300px", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px", borderBottom: "1px solid #e5e7eb" }}>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConversations.map((convo) => (
            <div 
              key={convo.id}
              onClick={() => setSelectedConversation(convo.id)}
              style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: selectedConversation === convo.id ? "#f3f4f6" : "transparent", borderBottom: "1px solid #f9fafb" }}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#064e3b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "13px", flexShrink: 0 }}>
                {convo.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{convo.name}</h4>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{convo.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fdfdfd", minWidth: 0 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px", background: "#fff" }}>
          <button 
            type="button" 
            onClick={() => setSelectedConversation(null)} 
            className="mobile-back-btn"
            style={{ display: "none", background: "none", border: "none", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginRight: "4px" }}
          >
            ←
          </button>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#064e3b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px", flexShrink: 0 }}>
            {activeContact?.avatar}
          </div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "600", margin: 0 }}>{activeContact?.name}</h4>
            <span style={{ fontSize: "10px", color: "#059669" }}>● Online</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {activeMessages.map((msg, index) => {
            const isMe = msg.sender_type === "student";
            return (
              <div key={index} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                <div style={{ padding: "9px 13px", borderRadius: "10px", background: isMe ? "#064e3b" : "#e5e7eb", color: isMe ? "#fff" : "#111", fontSize: "13px", lineHeight: "1.4", wordBreak: "break-word" }}>
                  {msg.message_text}
                </div>
                <span style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px", display: "block", textAlign: isMe ? "right" : "left" }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {attachedFile && (
          <div style={{ padding: "6px 14px", background: "#f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <span>📎 Attached: {attachedFile.name}</span>
            <button onClick={() => setAttachedFile(null)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Remove</button>
          </div>
        )}

        <form onSubmit={handleSendChatMessage} style={{ padding: "10px 14px", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", background: "#fff", position: "relative", width: "100%", boxSizing: "border-box" }}>
          {showEmojiPicker && (
            <div style={{ position: "absolute", bottom: "55px", left: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "12px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", zIndex: 10 }}>
              {emojisList.map((emoji, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  onClick={() => handleAddEmoji(emoji)} 
                  style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "24px", cursor: "pointer", padding: "8px" }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", flexShrink: 0 }}>😀</button>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>📎</button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", minWidth: 0 }}
          />
          <button type="submit" disabled={sendingMsg} style={{ background: "#064e3b", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px", flexShrink: 0 }}>Send</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="profile-loading">Loading secure student portal...</div>;
  if (!student) return <div className="profile-not-found"><h2>Student record not found.</h2><Link to="/teachhub">Return Home</Link></div>;

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", zIndex: 9998 }}
        />
      )}

      <aside className={isSidebarOpen ? "sidebar-open" : ""}>
        <div className="sidebar-brand">
          <h2>TeachHub</h2>
          <p>Student Learning Portal</p>
        </div>

        <div className="sidebar-section-title">MAIN</div>
        <nav className="sidebar-nav-links">
          <button onClick={() => { setActiveView("dashboard"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "dashboard" ? "active" : ""}`}>Dashboard</span>
          </button>
          <Link to="/teachhub" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>Explore Courses</Link>
          <button onClick={() => { setActiveView("courses"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "courses" ? "active" : ""}`}>Enrolled Courses</span>
          </button>
          <button onClick={() => { setActiveView("projects"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "projects" ? "active" : ""}`}>Projects & Assignments</span>
          </button>
          <button onClick={() => { setActiveView("messages"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "messages" ? "active" : ""}`}>Messages</span>
          </button>
          <button onClick={() => { setActiveView("pricing"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "pricing" ? "active" : ""}`}>Pricing & Plans</span>
          </button>
        </nav>

        <div className="sidebar-section-title" style={{ marginTop: "30px" }}>ACCOUNT</div>
        <nav className="sidebar-nav-links">
          <button onClick={() => { setActiveView("profile"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "profile" ? "active" : ""}`}>Profile Settings</span>
          </button>
          <button onClick={handleLogout} className="sidebar-logout-btn" style={{ marginTop: "8px" }}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-main-content">
        <header className="dashboard-topbar">
          <div className="topbar-left-group">
            <button 
              className="hamburger-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
              type="button"
            >
              ☰
            </button>
            <div className="topbar-search">
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="topbar-profile-info">
            <img src={student.avatar_url || "https://via.placeholder.com/40"} alt={student.full_name} className="topbar-avatar" />
            <div className="topbar-text">
              <h4>{student.full_name}</h4>
              <p>Active Student</p>
            </div>
          </div>
        </header>

        <div className="dashboard-content-body">
          {activeView === "dashboard" && (
            <>
              <div className="dashboard-title-area">
                <div className="title-text-block">
                  <h1>Student Dashboard</h1>
                  <p>Welcome back, {student.full_name}! Track your classes and assignments here.</p>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="upload-portfolio-trigger-btn">+ Add Portfolio Item</button>
              </div>

              <div className="dashboard-metrics-grid">
                <div className="metric-card premium-metric-card">
                  <div className="metric-info">
                    <h3>{approvedCourses.length}</h3>
                    <p>Enrolled Courses</p>
                  </div>
                </div>
                <div className="metric-card premium-metric-card">
                  <div className="metric-info">
                    <h3>{artworks.length}</h3>
                    <p>Learning Portfolio</p>
                  </div>
                </div>
                <div className="metric-card premium-metric-card">
                  <div className="metric-info">
                    <h3>{student.subscription_tier || "Free Starter"}</h3>
                    <p>Subscription Tier</p>
                  </div>
                </div>
              </div>

              {pendingOrDeclinedRequests.length > 0 && (
                <div className="content-section-box" style={{ marginBottom: "25px", borderLeft: "4px solid #f59e0b" }}>
                  <h3>Course Intake Request Status</h3>
                  <div className="student-courses-grid" style={{ marginTop: "12px" }}>
                    {pendingOrDeclinedRequests.map((req) => {
                      const isDeclined = req.status === "declined";
                      return (
                        <div key={req.id} className="student-course-card" style={{ background: isDeclined ? "#fef2f2" : "#fffbeb", borderColor: isDeclined ? "#f87171" : "#fcd34d" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h4 style={{ margin: 0 }}>{req.course_title || "Course"}</h4>
                            <span style={{ fontSize: "11px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", background: isDeclined ? "#fee2e2" : "#fef3c7", color: isDeclined ? "#b91c1c" : "#d97706" }}>
                              {isDeclined ? "Declined" : "Pending Tutor Approval"}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#6b7280", margin: "6px 0" }}>Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                          {isDeclined && (
                            <button 
                              onClick={() => handleDismissDeclined(req.id)}
                              style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", marginTop: "6px" }}
                            >
                              Dismiss Notice
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="dashboard-single-column" style={{ width: "100%" }}>
                <div className="content-section-box">
                  <h3>Enrolled Courses</h3>
                  {approvedCourses.length > 0 ? (
                    <div className="student-courses-grid">
                      {approvedCourses.map((enrollment) => (
                        <div key={enrollment.id} className="student-course-card">
                          <h4>{enrollment.course_title || "Untitled Course"}</h4>
                          <p>Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No active approved course enrollments found.</p>
                  )}
                </div>

                <div className="content-section-box" style={{ marginTop: "25px" }}>
                  <h3>Student Portfolio & Projects</h3>
                  {artworks.length > 0 ? (
                    <div className="student-art-grid">
                      {artworks.map((art) => (
                        <div key={art.id} className="art-card">
                          <img src={art.image_url} alt={art.title || "Project"} />
                          <h4>{art.title}</h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No portfolio projects uploaded yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === "courses" && (
            <div className="content-section-box">
              <h3>All Enrolled Courses</h3>
              {approvedCourses.length > 0 ? (
                <div className="student-courses-grid">
                  {approvedCourses.map((enrollment) => (
                    <div key={enrollment.id} className="student-course-card">
                      <h4>{enrollment.course_title || "Untitled Course"}</h4>
                      <p>Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">You are not enrolled in any approved courses yet.</p>
              )}
            </div>
          )}

          {activeView === "projects" && (
            <div className="content-section-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <h3>Projects & Assignments</h3>
                <button onClick={() => setShowUploadModal(true)} className="upload-portfolio-trigger-btn">+ Add Portfolio Item</button>
              </div>
              {artworks.length > 0 ? (
                <div className="student-art-grid">
                  {artworks.map((art) => (
                    <div key={art.id} className="art-card">
                      <img src={art.image_url} alt={art.title || "Project"} />
                      <h4>{art.title}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No projects submitted yet.</p>
              )}
            </div>
          )}

          {activeView === "messages" && (
            <div>
              <div style={{ maxWidth: "1050px", margin: "0 auto 16px auto" }}>
                <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111", margin: 0 }}>Messages & Support</h1>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>Communicate directly with your instructors and AI assistant.</p>
              </div>
              {renderModernMessagingLayout("560px")}
            </div>
          )}

          {activeView === "profile" && (
            <div className="content-section-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ marginBottom: "20px" }}>Edit Profile Settings</h3>
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.full_name} 
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Avatar Image URL</label>
                  <input 
                    type="text" 
                    value={editForm.avatar_url} 
                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={updatingProfile}
                  style={{ background: "#064e3b", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                >
                  {updatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeView === "pricing" && (
            <div className="content-section-box" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ marginBottom: "10px" }}>Upgrade Your Learning Plan</h2>
              <p style={{ color: "#6b7280", marginBottom: "30px" }}>Unlock premium features, direct tutor priority, and exclusive learning materials.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", textAlign: "left" }}>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", background: "#fff" }}>
                  <h4>Free Starter</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>$0 <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mo</span></p>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#4b5563", lineHeight: "1.6" }}>
                    <li>Access to free enrolled courses</li>
                    <li>Basic portfolio uploading</li>
                    <li>AI Assistant chat support</li>
                  </ul>
                  <button disabled style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#e5e7eb", border: "none", borderRadius: "6px", fontWeight: "600", color: "#6b7280" }}>Current Plan</button>
                </div>

                <div style={{ border: "2px solid #064e3b", borderRadius: "8px", padding: "20px", background: "#fff", position: "relative" }}>
                  <span style={{ position: "absolute", top: "-12px", right: "20px", background: "#064e3b", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>POPULAR</span>
                  <h4>Pro Scholar</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>$19 <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mo</span></p>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#4b5563", lineHeight: "1.6" }}>
                    <li>All Free features</li>
                    <li>Unlimited course enrollments</li>
                    <li>Direct tutor messaging priority</li>
                    <li>Advanced project storage</li>
                  </ul>
                  <button onClick={() => handleWhatsAppRedirect("Pro Scholar Plan")} style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#064e3b", border: "none", borderRadius: "6px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Upgrade via WhatsApp</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showUploadModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "16px", boxSizing: "border-box" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "400px", boxSizing: "border-box" }}>
            <h3 style={{ marginTop: 0 }}>Add Portfolio Project</h3>
            <form onSubmit={handleUploadProject}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Project Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. React Dashboard App"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.png"
                  value={newProject.image_url}
                  onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setShowUploadModal(false)} style={{ padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={uploadingProj} style={{ padding: "8px 14px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
                  {uploadingProj ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}